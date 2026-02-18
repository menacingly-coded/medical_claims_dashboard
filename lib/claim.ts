export type NormalizedBillItem = {
  name: string
  category: string
  amount: number
  isNme: boolean
  deductionReason?: string
}

export type NormalizedBill = {
  id: string
  invoiceNumber: string
  date: string
  amount: number
  pageNumber?: number
  items: NormalizedBillItem[]
}

export type NormalizedIssue = {
  id: string
  title: string
  pageNumber?: number
  severity: 'high' | 'medium' | 'low'
}

export type NormalizedSegment = {
  id: string
  name: string
  pages: number[]
}

export type NormalizedClaim = {
  claimId: string
  type: string
  status: string
  claimedAmount: number
  billsTotal: number
  discrepancy: number
  discrepancyReason?: string
  patient: {
    name: string
    dob: string
    policyNumber: string
    phone?: string
    email?: string
    address?: string
  }
  bills: NormalizedBill[]
  audit: {
    legibility: NormalizedIssue[]
    policyViolations: NormalizedIssue[]
  }
  segments: NormalizedSegment[]
}

type AnyObj = Record<string, any>

const str = (v: any, fallback = '') => (typeof v === 'string' ? v : v == null ? fallback : String(v))
const num = (v: any, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

const uniqId = (() => {
  let i = 0
  return (prefix: string) => `${prefix}-${++i}`
})()

function inferSeverity(raw: any): 'high' | 'medium' | 'low' {
  const s = str(raw?.severity ?? raw?.level ?? raw?.priority, '').toLowerCase()
  if (s.includes('high') || s.includes('critical')) return 'high'
  if (s.includes('med')) return 'medium'
  if (s.includes('low')) return 'low'
  // Heuristic: longer/stricter sounding titles tend to be more important.
  const title = str(raw?.title ?? raw?.text ?? raw, '')
  if (/prior authorization|violation|exceed|not covered|out-of-network/i.test(title)) return 'high'
  return 'medium'
}

function normalizePages(pages: any): number[] {
  if (Array.isArray(pages)) return pages.map((p) => num(p)).filter((p) => p >= 1)
  if (typeof pages === 'number') return pages >= 1 ? [pages] : []
  if (typeof pages === 'string') {
    // Supports "3", "3-5", "3,4,5".
    const s = pages.trim()
    const range = s.match(/^(\d+)\s*-\s*(\d+)$/)
    if (range) {
      const a = num(range[1])
      const b = num(range[2])
      if (a >= 1 && b >= a) return Array.from({ length: b - a + 1 }, (_, i) => a + i)
    }
    return s
      .split(/[,\s]+/)
      .map((x) => num(x))
      .filter((p) => p >= 1)
  }
  return []
}

export function normalizeClaim(raw: any): NormalizedClaim {
  const r = (raw ?? {}) as AnyObj

  const summary = (r.claim_summary ?? r.claimSummary ?? r.summary ?? {}) as AnyObj
  const patient = (r.patient_info ?? r.patientInfo ?? r.patient ?? {}) as AnyObj

  const claimedAmount = num(
    summary.claimed_amount ?? summary.claimedAmount ?? r.claimed_amount ?? r.claimedAmount,
    0
  )

  const rawBills = (r.bills ?? r.bill_details ?? r.billDetails ?? []) as any[]
  const bills: NormalizedBill[] = (Array.isArray(rawBills) ? rawBills : []).map((b, i) => {
    const itemsRaw = (b?.items ?? b?.line_items ?? b?.lineItems ?? []) as any[]
    const items: NormalizedBillItem[] = (Array.isArray(itemsRaw) ? itemsRaw : []).map((it, j) => ({
      name: str(it?.name ?? it?.item_name ?? it?.itemName ?? it?.description ?? `Item ${j + 1}`, `Item ${j + 1}`),
      category: str(it?.category ?? it?.item_category ?? it?.itemCategory ?? '-', '-'),
      amount: num(it?.amount ?? it?.price ?? it?.value, 0),
      isNme: Boolean(it?.is_nme ?? it?.isNme ?? it?.nme ?? false),
      deductionReason: str(
        it?.deduction_reason ?? it?.deductionReason ?? it?.reason ?? it?.nme_reason,
        ''
      ) || undefined,
    }))

    const billAmount =
      typeof b?.amount === 'number'
        ? num(b.amount, 0)
        : items.reduce((acc, it) => acc + it.amount, 0)

    return {
      id: str(b?.id ?? b?._id ?? b?.invoice_number ?? b?.invoiceNumber ?? uniqId('bill'), `bill-${i + 1}`),
      invoiceNumber: str(b?.invoice_number ?? b?.invoiceNumber ?? b?.invoiceNo ?? `INV-${i + 1}`),
      date: str(b?.date ?? b?.invoice_date ?? b?.invoiceDate ?? '-'),
      amount: billAmount,
      pageNumber: b?.page_number != null || b?.pageNo != null || b?.page != null ? num(b?.page_number ?? b?.pageNo ?? b?.page) : undefined,
      items,
    }
  })

  const billsTotal = bills.reduce((acc, b) => acc + b.amount, 0)
  const discrepancy = claimedAmount - billsTotal

  const legRaw =
    (r.audit_issues?.medical_legibility_flags ??
      r.audit_issues?.legibility ??
      r.auditIssues?.medicalLegibilityFlags ??
      r.auditIssues?.legibility ??
      []) as any[]

  const polRaw =
    (r.audit_issues?.policy_violations ??
      r.audit_issues?.violations ??
      r.auditIssues?.policyViolations ??
      r.auditIssues?.violations ??
      []) as any[]

  const legibility: NormalizedIssue[] = (Array.isArray(legRaw) ? legRaw : []).map((x, i) => ({
    id: str(x?.id ?? uniqId('leg'), `leg-${i + 1}`),
    title: str(x?.title ?? x?.text ?? x, `Issue ${i + 1}`),
    pageNumber: x?.page_number ?? x?.page ? num(x?.page_number ?? x?.page) : undefined,
    severity: inferSeverity(x),
  }))

  const policyViolations: NormalizedIssue[] = (Array.isArray(polRaw) ? polRaw : []).map((x, i) => ({
    id: str(x?.id ?? uniqId('pol'), `pol-${i + 1}`),
    title: str(x?.title ?? x?.text ?? x, `Violation ${i + 1}`),
    pageNumber: x?.page_number ?? x?.page ? num(x?.page_number ?? x?.page) : undefined,
    severity: inferSeverity(x),
  }))

  const segRaw = (r.document_segments ?? r.documentSegments ?? r.segments ?? []) as any[]
  const segments: NormalizedSegment[] = (Array.isArray(segRaw) ? segRaw : []).map((s, i) => ({
    id: str(s?.id ?? uniqId('seg'), `seg-${i + 1}`),
    name: str(s?.type ?? s?.name ?? s?.document_type ?? s?.documentType ?? `Document ${i + 1}`),
    pages: normalizePages(s?.pages ?? s?.page_numbers ?? s?.pageNumbers ?? s?.page_range ?? s?.pageRange ?? []),
  }))

  return {
    claimId: str(summary.claim_id ?? summary.claimId ?? summary.id ?? r.claim_id ?? r.claimId ?? '-'),
    type: str(summary.type ?? summary.claim_type ?? summary.claimType ?? r.type ?? '-'),
    status: str(summary.status ?? r.status ?? 'Unknown'),
    claimedAmount,
    billsTotal,
    discrepancy,
    discrepancyReason: str(
      summary.discrepancy_reason ?? summary.discrepancyReason ?? r.discrepancy_reason,
      ''
    ) || undefined,
    patient: {
      name: str(patient.name ?? patient.patient_name ?? patient.patientName ?? '-'),
      dob: str(patient.dob ?? patient.date_of_birth ?? patient.dateOfBirth ?? '-'),
      policyNumber: str(patient.policy_number ?? patient.policyNumber ?? patient.policyNo ?? '-'),
      phone: str(patient.phone ?? patient.mobile ?? patient.contact?.phone ?? '', '') || undefined,
      email: str(patient.email ?? patient.contact?.email ?? '', '') || undefined,
      address: str(patient.address ?? patient.contact?.address ?? '', '') || undefined,
    },
    bills,
    audit: { legibility, policyViolations },
    segments,
  }
}

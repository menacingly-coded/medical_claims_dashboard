'use client'

import { useEffect, useMemo, useState } from 'react'
import PDFViewer from '@/components/PDFViewer'
import ClaimDataPanel from '@/components/ClaimDataPanel'
import { normalizeClaim, type NormalizedClaim } from '@/lib/claim'

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1)

  const [totalPages, setTotalPages] = useState<number | null>(null)
  const [pdfFile, setPdfFile] = useState<File | string | null>(null)
  const [claim, setClaim] = useState<NormalizedClaim | null>(null)

  // Try loading sample files from /public if present.
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/claim.json', { cache: 'no-store' })
        if (res.ok) {
          const raw = await res.json()
          setClaim(normalizeClaim(raw))
        }
      } catch {
        // Ignore – user can upload a JSON file.
      }

      try {
        const head = await fetch('/report.pdf', { method: 'HEAD' })
        if (head.ok) setPdfFile('/report.pdf')
      } catch {
        // Ignore – user can upload a PDF file.
      }
    })()
  }, [])

  // Reset page/total when the PDF changes.
  useEffect(() => {
    setTotalPages(null)
    setCurrentPage(1)
  }, [pdfFile])

  const issueCounts = useMemo(() => {
    return {
      legibility: claim?.audit.legibility.length ?? 0,
      policy: claim?.audit.policyViolations.length ?? 0,
    }
  }, [claim])

  return (
    <div className="flex h-screen bg-background">
      {/* Left Pane - PDF Viewer */}
      <div className="w-1/2 flex flex-col border-r border-border">
        <PDFViewer 
          file={pdfFile}
          onFileSelect={setPdfFile}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          setTotalPages={setTotalPages}
          legibilityFlags={issueCounts.legibility}
          policyViolations={issueCounts.policy}
        />
      </div>

      {/* Right Pane - Claim Data */}
      <div className="w-1/2 flex flex-col overflow-hidden">
        <ClaimDataPanel
          claim={claim}
          onClaimSelect={(nextRaw) => setClaim(normalizeClaim(nextRaw))}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  )
}

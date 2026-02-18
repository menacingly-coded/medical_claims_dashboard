'use client'

import { FileUp } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import ClaimSummaryCard from './ClaimSummaryCard'
import PatientInfoCard from './PatientInfoCard'
import BillsAccordion from './BillsAccordion'
import AuditIssues from './AuditIssues'
import DocumentSegments from './DocumentSegments'
import type { NormalizedClaim } from '@/lib/claim'
import { Button } from '@/components/ui/button'

interface ClaimDataPanelProps {
  claim: NormalizedClaim | null
  onClaimSelect: (raw: any) => void
  currentPage: number
  setCurrentPage: (page: number) => void
}

export default function ClaimDataPanel({ claim, onClaimSelect, currentPage, setCurrentPage }: ClaimDataPanelProps) {
  return (
    <ScrollArea className="h-full w-full">
      <div className="p-6 space-y-6">
        {/* File loader */}
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Claim data</p>
            <p className="text-xs text-muted-foreground truncate">
              {claim ? `Loaded claim: ${claim.claimId}` : 'No JSON loaded. Upload a claim JSON to render the right panel.'}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Viewing page: {currentPage}</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="json-upload"
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                try {
                  const text = await f.text()
                  onClaimSelect(JSON.parse(text))
                } catch {
                  alert('Invalid JSON file. Please upload a valid claim JSON.')
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('json-upload')?.click()}
              title="Upload JSON"
            >
              <FileUp className="w-4 h-4 mr-2" />
              Upload JSON
            </Button>
          </div>
        </div>

        {!claim ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <p className="text-sm font-medium text-foreground">Waiting for claim JSON</p>
            <p className="text-xs text-muted-foreground mt-2">
              Upload a JSON file to populate Claim Summary, Patient Info, Bills, Audit Issues and Document Segments.
            </p>
          </div>
        ) : null}

        {/* Section 1: Claim Summary */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Claim Summary
          </h2>
          <ClaimSummaryCard claim={claim} />
        </div>

        {/* Section 2: Patient Info */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Patient Information
          </h2>
          <PatientInfoCard claim={claim} />
        </div>

        {/* Section 3: Bills */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Bills ({claim?.bills.length ?? 0})
          </h2>
          <BillsAccordion bills={claim?.bills ?? []} setCurrentPage={setCurrentPage} />
        </div>

        {/* Section 4: Audit Issues */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Audit Issues
          </h2>
          <AuditIssues
            legibilityFlags={claim?.audit.legibility ?? []}
            policyViolations={claim?.audit.policyViolations ?? []}
            setCurrentPage={setCurrentPage}
          />
        </div>

        {/* Section 5: Document Segments */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Document Segments
          </h2>
          <DocumentSegments segments={claim?.segments ?? []} setCurrentPage={setCurrentPage} />
        </div>
      </div>
    </ScrollArea>
  )
}

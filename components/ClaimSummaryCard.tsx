'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { NormalizedClaim } from '@/lib/claim'

function formatAmount(n: number) {
  const v = Number.isFinite(n) ? n : 0
  return `₹${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface Props {
  claim: NormalizedClaim | null
}

export default function ClaimSummaryCard({ claim }: Props) {
  const claimId = claim?.claimId ?? '-'
  const type = claim?.type ?? '-'
  const status = claim?.status ?? 'Unknown'
  const claimedAmount = claim?.claimedAmount ?? 0
  const billsTotal = claim?.billsTotal ?? 0
  const discrepancy = claim?.discrepancy ?? claimedAmount - billsTotal

  return (
    <Card className="p-6 bg-card border-border">
      {/* Header with ID and Status */}
      <div className="mb-6 pb-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Claim ID
            </h3>
            <p className="text-lg font-medium text-foreground">{claimId}</p>
            <p className="text-xs text-muted-foreground mt-1">Type: {type}</p>
          </div>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            {status}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Claimed Amount */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Claimed Amount
          </p>
          <p className="text-xl font-semibold text-foreground">
            {formatAmount(claimedAmount)}
          </p>
        </div>

        {/* Bills Total */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Bills Total
          </p>
          <p className="text-xl font-semibold text-foreground">
            {formatAmount(billsTotal)}
          </p>
        </div>

        {/* Discrepancy */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Discrepancy
          </p>
          <p className={`text-xl font-semibold ${
            discrepancy > 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {formatAmount(Math.abs(discrepancy))}
          </p>
        </div>
      </div>

      {/* Discrepancy Reason Callout */}
      {discrepancy !== 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-orange-900 uppercase tracking-wider mb-1">
            ⚠️ Discrepancy Alert
          </p>
          <p className="text-sm text-orange-800">
            Claimed amount differs from bills by {formatAmount(discrepancy)}.
            {claim?.discrepancyReason ? ` ${claim.discrepancyReason}` : ' Review itemization and deductions.'}
          </p>
        </div>
      )}
    </Card>
  )
}

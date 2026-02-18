'use client'

import { Card } from '@/components/ui/card'
import type { NormalizedClaim } from '@/lib/claim'

interface Props {
  claim: NormalizedClaim | null
}

export default function PatientInfoCard({ claim }: Props) {
  const patientData = claim?.patient ?? {
    name: '-',
    dob: '-',
    policyNumber: '-',
    phone: '-',
    email: '-',
    address: '-',
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-5">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Patient Name
            </p>
            <p className="text-sm font-medium text-foreground">
              {patientData.name}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Date of Birth
            </p>
            <p className="text-sm font-medium text-foreground">
              {patientData.dob}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Policy Number
            </p>
            <p className="text-sm font-medium text-foreground">
              {patientData.policyNumber}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Phone
            </p>
            <p className="text-sm font-medium text-foreground">
              {patientData.phone ?? '-'}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Email
            </p>
            <p className="text-sm font-medium text-foreground">
              {patientData.email ?? '-'}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Address
            </p>
            <p className="text-sm font-medium text-foreground">
              {patientData.address ?? '-'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

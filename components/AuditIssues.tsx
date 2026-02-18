'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle } from 'lucide-react'
import type { NormalizedIssue } from '@/lib/claim'

interface AuditIssuesProps {
  legibilityFlags: NormalizedIssue[]
  policyViolations: NormalizedIssue[]
  setCurrentPage: (page: number) => void
}

export default function AuditIssues({ legibilityFlags, policyViolations, setCurrentPage }: AuditIssuesProps) {

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-300'
      case 'medium':
        return 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-orange-300'
      case 'low':
        return 'bg-gradient-to-r from-cyan-50 to-blue-50 text-blue-700 border-blue-300'
      default:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Legibility Flags */}
      <Card className="p-5 bg-card border-border border-2 border-orange-200">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-foreground">
            Medical Legibility Flags
          </h3>
          <Badge variant="outline" className="ml-auto text-xs font-bold">
            {legibilityFlags.length}
          </Badge>
        </div>

        <div className="space-y-2">
          {legibilityFlags.length > 0 ? (
            legibilityFlags.map((flag) => (
              <div
                key={flag.id}
                className={`p-3 rounded border ${getSeverityColor(flag.severity)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug flex-1">
                    {flag.title}
                  </p>
                  {flag.pageNumber && (
                    <button
                      onClick={() => setCurrentPage(flag.pageNumber!)}
                      className="group"
                      title={`Jump to page ${flag.pageNumber}`}
                    >
                      <Badge variant="outline" className="text-xs font-medium flex-shrink-0">
                        P {flag.pageNumber}
                      </Badge>
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No legibility issues found
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Policy Violations */}
      <Card className="p-5 bg-card border-border border-2 border-red-200">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-foreground">
            Policy Violations
          </h3>
          <Badge variant="outline" className="ml-auto text-xs font-bold">
            {policyViolations.length}
          </Badge>
        </div>

        <div className="space-y-2">
          {policyViolations.length > 0 ? (
            policyViolations.map((violation) => (
              <div
                key={violation.id}
                className={`p-3 rounded border ${getSeverityColor(violation.severity)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug flex-1">
                    {violation.title}
                  </p>
                  {violation.pageNumber && (
                    <button
                      onClick={() => setCurrentPage(violation.pageNumber!)}
                      className="group"
                      title={`Jump to page ${violation.pageNumber}`}
                    >
                      <Badge variant="outline" className="text-xs font-medium flex-shrink-0">
                        P {violation.pageNumber}
                      </Badge>
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No policy violations found
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

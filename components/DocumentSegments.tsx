'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { NormalizedSegment } from '@/lib/claim'

interface DocumentSegmentsProps {
  segments: NormalizedSegment[]
  setCurrentPage: (page: number) => void
}

export default function DocumentSegments({ segments, setCurrentPage }: DocumentSegmentsProps) {
  const handlePageClick = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-3">
        {segments.length > 0 ? (
          segments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {doc.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {doc.pages.length === 0
                    ? 'No pages'
                    : doc.pages.length === 1
                      ? `Page ${doc.pages[0]}`
                      : `Pages ${doc.pages[0]} - ${doc.pages[doc.pages.length - 1]}`}
                </p>
              </div>

              {/* Page Chips */}
              <div className="flex items-center gap-2">
                {doc.pages.length <= 1 ? (
                  <button
                    onClick={() => doc.pages[0] && handlePageClick(doc.pages[0])}
                    className="group"
                  >
                    <Badge
                      className="bg-slate-100 text-slate-700 border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors font-medium"
                      variant="outline"
                    >
                      {doc.pages[0] ?? '-'}
                    </Badge>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    {doc.pages.map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageClick(page)}
                        className="group"
                      >
                        <Badge
                          className="bg-slate-100 text-slate-700 border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors font-medium"
                          variant="outline"
                        >
                          {page}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No document segments found
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

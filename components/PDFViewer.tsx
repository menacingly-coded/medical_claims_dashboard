'use client'

import { ChevronLeft, ChevronRight, FileUp, ZoomIn, ZoomOut } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

interface PDFViewerProps {
  file: File | string | null
  onFileSelect: (file: File | string | null) => void
  currentPage: number
  setCurrentPage: (page: number) => void
  totalPages: number | null
  setTotalPages: (pages: number) => void
  legibilityFlags: number
  policyViolations: number
}

// Required for pdf.js worker.
// Next.js (especially with Turbopack) can be finicky about bundling the worker via import.meta.url.
// Using the official pdfjs-dist CDN worker is the most reliable in dev + prod.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version || '4.10.38'}/build/pdf.worker.min.mjs`

export default function PDFViewer({
  file,
  onFileSelect,
  currentPage,
  setCurrentPage,
  totalPages,
  setTotalPages,
  legibilityFlags,
  policyViolations,
}: PDFViewerProps) {
  const [zoom, setZoom] = useState(100)
  const [jumpInput, setJumpInput] = useState('')

  const canPrev = currentPage > 1
  const canNext = totalPages ? currentPage < totalPages : true

  const fileLabel = useMemo(() => {
    if (!file) return 'No PDF loaded'
    if (typeof file === 'string') return file.split('/').pop() ?? 'report.pdf'
    return file.name
  }, [file])

  const safeSetPage = (p: number) => {
    const clamped = Math.max(1, totalPages ? Math.min(totalPages, p) : p)
    setCurrentPage(clamped)
  }

  const handlePrev = () => {
    if (canPrev) safeSetPage(currentPage - 1)
  }

  const handleNext = () => {
    if (canNext) safeSetPage(currentPage + 1)
  }

  const handleJump = () => {
    const page = parseInt(jumpInput)
    if (Number.isFinite(page)) {
      safeSetPage(page)
      setJumpInput('')
    }
  }

  const handleZoomIn = () => setZoom(Math.min(zoom + 10, 200))
  const handleZoomOut = () => setZoom(Math.max(zoom - 10, 50))

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-10 border-b border-border bg-background p-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <h3 className="font-semibold text-foreground truncate">{fileLabel}</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            Page {currentPage}{totalPages ? ` / ${totalPages}` : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={!canPrev}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={!canNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <div className="border-l border-border px-2 mx-2" />

          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <span className="text-xs text-muted-foreground w-10 text-center">
            {zoom}%
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <div className="border-l border-border px-2 mx-2" />

          <div className="flex items-center gap-1">
            <label className="sr-only" htmlFor="pdf-upload">Upload PDF</label>
            <input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) onFileSelect(f)
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('pdf-upload')?.click()}
              title="Upload a PDF"
            >
              <FileUp className="w-4 h-4" />
            </Button>
            <input
              type="number"
              min="1"
              max={totalPages ?? undefined}
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              placeholder="Jump"
              className="w-12 px-2 py-1 text-xs border border-border rounded bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleJump}
            >
              Go
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Render Area */}
      <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
        {file ? (
          <Document
            file={typeof file === 'string' ? { url: file } : file}
            onLoadSuccess={(info) => {
              setTotalPages(info.numPages)
              // clamp page if needed
              if (currentPage > info.numPages) setCurrentPage(info.numPages)
            }}
            onLoadError={(err) => {
              // Helpful debug in case a PDF fails to parse / worker fails.
              console.error('PDF load error:', err)
            }}
            loading={<div className="text-sm text-muted-foreground">Loading PDF…</div>}
            error={<div className="text-sm text-red-600">Failed to load PDF.</div>}
          >
            <Page pageNumber={currentPage} scale={zoom / 100} />
          </Document>
        ) : (
          <div className="w-full max-w-lg rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm font-medium text-foreground">No PDF loaded</p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload a PDF from the toolbar to start reviewing.
            </p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
        Legibility flags: {legibilityFlags} | Policy violations: {policyViolations}
      </div>
    </div>
  )
}

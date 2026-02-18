'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { NormalizedBill } from '@/lib/claim'

interface BillsAccordionProps {
  bills: NormalizedBill[]
  setCurrentPage: (page: number) => void
}

function formatAmount(n: number) {
  const v = Number.isFinite(n) ? n : 0
  return `₹${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function BillsAccordion({ bills, setCurrentPage }: BillsAccordionProps) {
  const [expandedBill, setExpandedBill] = useState<string | null>(null)

  const toggleBill = (billId: string) => {
    setExpandedBill(expandedBill === billId ? null : billId)
  }

  return (
    <div className="space-y-3">
      {bills.length > 0 ? (
        bills.map((bill) => (
        <Card
          key={bill.id}
          className="bg-card border-border overflow-hidden"
        >
          {/* Bill Header */}
          <button
            onClick={() => toggleBill(bill.id)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1 text-left">
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${
                  expandedBill === bill.id ? 'rotate-180' : ''
                }`}
              />
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {bill.invoiceNumber}
                </p>
                <p className="text-xs text-muted-foreground">
                  {bill.date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">
                  {formatAmount(bill.amount)}
                </p>
                {bill.pageNumber ? (
                  // NOTE: this header is a <button>, so we must NOT nest another <button> inside it.
                  // Use a <span role="button"> for the page chip.
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setCurrentPage(bill.pageNumber!)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        e.stopPropagation()
                        setCurrentPage(bill.pageNumber!)
                      }
                    }}
                    className="group inline-flex"
                    title={`Jump to page ${bill.pageNumber}`}
                  >
                    <Badge className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs font-medium">
                      Page {bill.pageNumber}
                    </Badge>
                  </span>
                ) : null}
              </div>
            </div>
          </button>

          {/* Bill Items Table */}
          {expandedBill === bill.id && (
            <div className="border-t border-border px-6 py-4 bg-secondary/30">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 pr-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Category
                    </th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Deduction
                    </th>
                    <th className="text-center py-2 pl-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bill.items.map((item, idx) => (
                    <tr
                      key={idx}
                      className={`border-t border-border/50 ${
                        item.isNme ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="py-3 pr-3">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-foreground font-medium truncate cursor-help">
                                {item.name}
                              </p>
                            </TooltipTrigger>
                            {item.name.length > 30 && (
                              <TooltipContent side="top" align="start">
                                <p>{item.name}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                      <td className="py-3 px-3">
                        <p className="text-muted-foreground">
                          {item.category}
                        </p>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <p className="font-semibold text-foreground">
                          {formatAmount(item.amount)}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <p className={`text-xs ${item.isNme ? 'text-red-700' : 'text-muted-foreground'}`}>
                          {item.isNme ? (item.deductionReason ?? 'NME') : '-'}
                        </p>
                      </td>
                      <td className="py-3 pl-3 text-center">
                        {item.isNme ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white cursor-help"
                                >
                                  NME
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="max-w-xs">
                                  {item.deductionReason ?? 'Marked as Not Medically Eligible'}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white">
                            Covered
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ))
      ) : (
        <div className="p-8 text-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground">No bills found</p>
        </div>
      )}
    </div>
  )
}

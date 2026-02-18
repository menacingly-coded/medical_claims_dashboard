# Medical Claims Review Dashboard (Frontend)

A simple split-screen dashboard for medical claims review:

- **Left:** PDF viewer (react-pdf) with page navigation + jump-to-page.
- **Right:** Claim JSON rendered as a review-friendly panel (summary, patient info, bills, audit issues, and document segments).
- **Clickable page numbers** on the right jump the PDF to the relevant page.

## Tech

- Next.js (App Router)
- React
- Tailwind CSS + shadcn/ui
- `react-pdf` (pdf.js)

## Quick Start

```bash
# install
pnpm install

# run
pnpm dev
```

Then open `http://localhost:3000`.

## Using Your Own PDF + JSON

This repo ships with demo files:

- `public/report.pdf`
- `public/claim.json`

You can replace them **directly** with your own files (same names), or use the **Upload** buttons in the UI:

- **PDF upload** button is in the PDF viewer toolbar (left).
- **JSON upload** button is at the top of the right panel.

### Expected JSON shape

The UI is tolerant to slightly different schemas, but the cleanest format is:

```json
{
  "claim_summary": {
    "claim_id": "...",
    "type": "...",
    "status": "...",
    "claimed_amount": 0,
    "discrepancy_reason": "..."
  },
  "patient_info": {
    "name": "...",
    "dob": "...",
    "policy_number": "...",
    "phone": "...",
    "email": "...",
    "address": "..."
  },
  "bills": [
    {
      "invoice_number": "...",
      "date": "...",
      "amount": 0,
      "page_number": 1,
      "items": [
        {
          "name": "...",
          "category": "...",
          "amount": 0,
          "is_nme": true,
          "deduction_reason": "..."
        }
      ]
    }
  ],
  "audit_issues": {
    "medical_legibility_flags": [{ "text": "...", "page": 1, "severity": "high" }],
    "policy_violations": [{ "text": "...", "page": 2, "severity": "medium" }]
  },
  "document_segments": [{ "type": "...", "pages": [1, 2] }]
}
```

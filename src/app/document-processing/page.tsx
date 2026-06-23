"use client";

import { useState, useRef } from "react";

// ─── types (mirrors route.ts) ─────────────────────────────────────────────────

interface InvoiceRecord {
  id: string;
  name: string;
  amount: number | null;
  currency: string;
  dueDate: string;
  status: string;
  isAbnormal: boolean;
  abnormalReason?: string;
}

interface ParseResult {
  processingTimeMs: number;
  rawText: string;
  formattedOutput: string;
  records: InvoiceRecord[];
  pageCount: number;
  warnings: string[];
}

// ─── library data ─────────────────────────────────────────────────────────────

const LIBRARIES = [
  {
    name: "pdf-parse",
    subtitle: "pdf.js core",
    language: "JavaScript / Node.js",
    license: "MIT",
    licenseNote: "Free for commercial use. No restrictions.",
    accuracy: "~97% on digital PDFs",
    accuracyCondition: "Applies to software generated PDFs. 97% means roughly 97 out of 100 characters parse correct. The remaining 3% might be missing garbled or in the wrong order,especially on complex layouts or unusual fonts.",
    speed: "0.08–0.15s per file",
    speedNote: "20-record invoice on a standard cloud server.",
    ocr: "No",
    tables: "Manual parsing required",
    highlight: false,
  },
  {
    name: "pdfplumber",
    subtitle: "Best open-source table extraction",
    language: "Python",
    license: "MIT",
    licenseNote: "Free for commercial use. No restrictions.",
    accuracy: "~92–95% on digital PDFs",
    accuracyCondition: "Character-level extraction. Slightly lower than PyMuPDF on complex layouts but better than pypdf on table structure.",
    speed: "0.8–1.2s per file",
    speedNote: "~8–10x slower than PyMuPDF. Suitable for low-volume batch jobs.",
    ocr: "No",
    tables: "Strong — designed for structured data",
    highlight: false,
  },
  {
    name: "PyMuPDF",
    subtitle: "Fastest Python option",
    language: "Python",
    license: "AGPL-3.0",
    licenseNote: "AGPL requires open-sourcing your application if distributed or run as a service. Commercial license from Artifex costs approximately USD 10,000–50,000/year.",
    accuracy: "~97–99% on digital PDFs",
    accuracyCondition: "Highest accuracy in the Python ecosystem. Based on MuPDF C engine benchmarks (py-pdf/benchmarks, Dec 2024).",
    speed: "~0.1s per file",
    speedNote: "Processes ~180 pages/second. Fastest available Python PDF library.",
    ocr: "Yes (via Tesseract)",
    tables: "Yes — block and table detection built in",
    highlight: false,
  },
  {
    name: "pypdf",
    subtitle: "Simplest to integrate",
    language: "Python",
    license: "BSD-3-Clause",
    licenseNote: "Free for commercial use. No restrictions.",
    accuracy: "~85–90% on digital PDFs",
    accuracyCondition: "Struggles with multi-column layouts and complex table structures. Suitable for plain text documents only.",
    speed: "0.2–0.4s per file",
    speedNote: "Faster than pdfplumber, slower than PyMuPDF.",
    ocr: "No",
    tables: "Weak — text extraction only",
    highlight: false,
  },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatAmount(r: InvoiceRecord): string {
  if (r.amount === null) return "Unknown amount";
  if (r.amount === 0) return "No balance due";
  if (r.amount < 0) return `Abnormal value (${r.amount})`;
  return `${r.currency} ${r.amount.toLocaleString("en-AU", { minimumFractionDigits: 2 })}`;
}

function getDaysOverdue(dueDateStr: string): number {
  let dateStr = dueDateStr;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [dd, mm, yyyy] = dateStr.split("/");
    dateStr = `${mm}/${dd}/${yyyy}`;
  }
  const due = new Date(dateStr).getTime();
  if (isNaN(due)) return 0;

  const now = new Date().getTime();
  const diffMs = now - due;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function getAutomationDecision(record: InvoiceRecord) {
  if (record.isAbnormal) {
    return {
      type: "flagged" as const,
      label: "Flagged — no action",
      description: record.abnormalReason ?? "Invalid amount",
      color: "#b05c00",
    };
  }
  if (record.status === "PAID") {
    return {
      type: "paid" as const,
      label: "Paid — no action",
      description: "Invoice settled. No reminder needed.",
      color: "#1a7a45",
    };
  }

  const daysOverdue = getDaysOverdue(record.dueDate);
  const amount = record.amount ?? 0;

  // Thresholds based on days overdue
  if (daysOverdue > 60) {
    return {
      type: "escalated" as const,
      label: "Escalated to human",
      description: `${record.name} — ${record.id} — Severely overdue (>60 days). Added to staff queue. No further automated messages.`,
      color: "#a00",
    };
  } else if (daysOverdue > 30) {
    return {
      type: "reminder2" as const,
      label: "2nd reminder sent",
      description: `Second notice to ${record.name}. Invoice ${record.id} overdue by >30 days (${formatAmount(record)}).`,
      color: "#7a4f00",
    };
  } else if (daysOverdue > 0) {
    return {
      type: "reminder1" as const,
      label: "1st reminder sent",
      description: `Automated email to ${record.name} re ${record.id} (${formatAmount(record)}) due ${record.dueDate}.`,
      color: "#0077B6",
    };
  } else {
    return {
      type: "pending" as const,
      label: "Not due yet",
      description: `Awaiting payment before ${record.dueDate}.`,
      color: "#555",
    };
  }
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function DocumentParsingPage() {
  const [result, setResult] = useState<ParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedLib, setExpandedLib] = useState<string | null>("pdf-parse");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    setLoading(true);
    setError(null);
    setResult(null);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/process-pdf", { method: "POST", body: form });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Request failed");
      }
      setResult(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function loadSamplePdf() {
    try {
      const res = await fetch("/sample_pdf.pdf");
      if (!res.ok) throw new Error("Could not load sample PDF. Make sure sample_pdf.pdf is in your /public folder.");
      const blob = await res.blob();
      const file = new File([blob], "sample_invoices.pdf", { type: "application/pdf" });
      processFile(file);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load sample PDF.");
    }
  }

  const unpaid = result?.records.filter((r) => r.status === "UNPAID" && !r.isAbnormal) ?? [];
  const paid = result?.records.filter((r) => r.status === "PAID") ?? [];
  const flagged = result?.records.filter((r) => r.isAbnormal) ?? [];

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", color: "#1a1a1a", background: "#f7fbfd", minHeight: "100vh", padding: "2.5rem 1.5rem" }}>
      <div style={{ maxWidth: "820px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#00B4D8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
            Hogancare POC
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#0077B6", margin: 0, lineHeight: 1.25 }}>
            Document Parsing and Automated Reminders
          </h1>
          <p style={{ marginTop: "0.6rem", color: "#555", fontSize: "0.9rem", maxWidth: "580px", lineHeight: 1.65 }}>
            Upload a debtor list PDF and the system parses it, identifies who owes what, and shows what automated action would be taken for each person.
          </p>
        </div>

        {/* Section 1: Library comparison — card layout */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#0077B6", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "2px solid #00B4D8", display: "inline-block", paddingBottom: "0.3rem", marginBottom: "1rem" }}>
            Parsing libraries considered
          </div>
          <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "1rem", lineHeight: 1.6 }}>
            Select any library to see its details.
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            {LIBRARIES.map((lib) => (
              <button
                key={lib.name}
                onClick={() => setExpandedLib(expandedLib === lib.name ? null : lib.name)}
                style={{
                  padding: "0.45rem 1rem",
                  borderRadius: "4px",
                  border: `1.5px solid ${expandedLib === lib.name ? "#00B4D8" : lib.highlight ? "#00B4D8" : "#d0edf8"}`,
                  background: expandedLib === lib.name ? "#00B4D8" : lib.highlight ? "#e8f7fc" : "#fff",
                  color: expandedLib === lib.name ? "#fff" : "#0077B6",
                  fontWeight: 600,
                  fontSize: "0.83rem",
                  cursor: "pointer",
                }}
              >
                {lib.name}
                {lib.highlight && expandedLib !== lib.name && (
                  <span style={{ marginLeft: "6px", fontSize: "0.68rem", color: "#00B4D8", fontWeight: 600 }}>used here</span>
                )}
              </button>
            ))}
          </div>

          {expandedLib && (() => {
            const lib = LIBRARIES.find((l) => l.name === expandedLib);
            if (!lib) return null;
            return (
              <div style={{ background: "#fff", border: "1px solid #d0edf8", borderRadius: "6px", padding: "1.25rem 1.5rem" }}>
                <div style={{ fontWeight: 700, color: "#0077B6", fontSize: "1rem", marginBottom: "0.2rem" }}>{lib.name}</div>
                <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: "1rem" }}>{lib.subtitle} — {lib.language}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  {[
                    { label: "License", value: lib.license, note: lib.licenseNote },
                    { label: "Accuracy", value: lib.accuracy, note: lib.accuracyCondition },
                    { label: "Processing speed", value: lib.speed, note: lib.speedNote },
                    { label: "OCR support", value: lib.ocr, note: undefined },
                    { label: "Table extraction", value: lib.tables, note: undefined },
                  ].map(({ label, value, note }) => (
                    <div key={label}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#0077B6", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>{label}</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a1a1a" }}>{value}</div>
                      {note && <div style={{ fontSize: "0.78rem", color: "#777", marginTop: "2px", lineHeight: 1.5 }}>{note}</div>}
                    </div>
                  ))}
                </div>
                {lib.name === "PyMuPDF" && (
                  <div style={{ marginTop: "1rem", padding: "0.65rem 0.9rem", background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "4px", fontSize: "0.8rem", color: "#6b4c00", lineHeight: 1.6 }}>
                    AGPL license means any user who interacts with your service triggers a source-code disclosure obligation under the license terms. For a system sold commercially to Hogancare, a paid Artifex license would be required. The MIT-licensed alternatives avoid this entirely.
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Section 2: Upload / Sample */}
        <div style={{ marginBottom: result ? "2rem" : "0" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#0077B6", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "2px solid #00B4D8", display: "inline-block", paddingBottom: "0.3rem", marginBottom: "1rem" }}>
            Demo pdf parsing
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <a
              href="/sample_pdf.pdf"
              download="sample_invoices.pdf"
              style={{ padding: "0.55rem 1.25rem", background: "#fff", border: "1.5px solid #00B4D8", color: "#0077B6", borderRadius: "4px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "inline-block" }}
            >
              Download sample PDF
            </a>
            <button
              onClick={loadSamplePdf}
              style={{ padding: "0.55rem 1.25rem", background: "#00B4D8", border: "none", color: "#fff", borderRadius: "4px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
            >
              Use sample PDF
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: "0.55rem 1.25rem", background: "#fff", border: "1.5px solid #00B4D8", color: "#0077B6", borderRadius: "4px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
            >
              Upload PDF
            </button>
            <input ref={fileInputRef} type="file" accept="application/pdf" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
          </div>

          {loading && (
            <div style={{ color: "#0077B6", fontSize: "0.88rem", padding: "0.75rem 0" }}>Parsing file...</div>
          )}
          {error && (
            <div style={{ padding: "0.75rem 1rem", background: "#fff0f0", border: "1px solid #ffc0c0", borderRadius: "5px", color: "#a00", fontSize: "0.85rem" }}>{error}</div>
          )}
        </div>

        {/* Section 3: Results — shown only after parsing */}
        {result && (
          <div>
            {/* Parser output */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#0077B6", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "2px solid #00B4D8", display: "inline-block", paddingBottom: "0.3rem", marginBottom: "1rem" }}>
                Parser output
              </div>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.9rem" }}>
                {[
                  ["Library", "pdf-parse (pdf.js)"],
                  ["License", "MIT — free commercial use"],
                  ["Time", `${result.processingTimeMs}ms`],
                  ["Records found", String(result.records.length)],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: "#f0faff", border: "1px solid #d0edf8", borderRadius: "4px", padding: "0.45rem 0.85rem", fontSize: "0.78rem" }}>
                    <div style={{ color: "#888" }}>{label}</div>
                    <div style={{ fontWeight: 700, color: "#0077B6" }}>{value}</div>
                  </div>
                ))}
              </div>
              <pre style={{ background: "#0f1923", color: "#c9e6f5", padding: "1rem 1.25rem", borderRadius: "5px", fontSize: "0.8rem", overflowX: "auto", lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word", border: "1px solid #1e3a4f", margin: 0 }}>
                {result.formattedOutput}
              </pre>
              {result.warnings.length > 0 && (
                <div style={{ marginTop: "0.75rem", padding: "0.65rem 0.9rem", background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "4px", fontSize: "0.8rem", color: "#6b4c00", lineHeight: 1.7 }}>
                  <strong>Flagged records:</strong>
                  <ul style={{ margin: "0.3rem 0 0 1rem", padding: 0 }}>
                    {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Automation decisions */}
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#0077B6", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "2px solid #00B4D8", display: "inline-block", paddingBottom: "0.3rem", marginBottom: "0.6rem" }}>
                Automation decisions
              </div>
              <p style={{ fontSize: "0.83rem", color: "#666", marginBottom: "1rem", lineHeight: 1.6 }}>
                Based on the parsed data, here is what the system would do for each record. Decisions are made automatically based on the invoice due date and amount.
              </p>

              {/* Compact record table */}
              <div style={{ background: "#fff", border: "1px solid #e2f4fb", borderRadius: "5px", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                  <thead style={{ background: "#f0faff", borderBottom: "1px solid #e2f4fb" }}>
                    <tr>
                      <th style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#0077B6" }}>Invoice & Debtor</th>
                      <th style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#0077B6" }}>Amount & Due</th>
                      <th style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#0077B6" }}>Automated Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.records.map((record) => {
                      const decision = getAutomationDecision(record);
                      return (
                        <tr key={record.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                          <td style={{ padding: "0.75rem 1rem", verticalAlign: "top" }}>
                            <div style={{ fontWeight: 600, color: "#1a1a1a" }}>{record.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "2px" }}>{record.id}</div>
                          </td>
                          <td style={{ padding: "0.75rem 1rem", verticalAlign: "top" }}>
                            <div style={{ color: "#1a1a1a" }}>{formatAmount(record)}</div>
                            <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "2px" }}>Due: {record.dueDate}</div>
                          </td>
                          <td style={{ padding: "0.75rem 1rem", verticalAlign: "top" }}>
                            <div style={{ marginBottom: "0.3rem", color: decision.color, fontSize: "0.8rem", fontWeight: 700 }}>
                              {decision.label}
                            </div>
                            <div style={{ color: "#555", lineHeight: 1.4, fontSize: "0.8rem", maxWidth: "400px" }}>
                              {decision.description}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Explanations */}
              <div style={{ marginTop: "1.25rem", padding: "0.75rem 1rem", background: "#f7fbfd", border: "1px solid #d0edf8", borderRadius: "5px", fontSize: "0.8rem", color: "#555", lineHeight: 1.7 }}>
                <div><strong style={{ color: "#0077B6" }}>Automated Decisions:</strong> Calculated dynamically based on invoice amount and days overdue (e.g. higher amounts escalate faster).</div>
                <div style={{ marginTop: "0.3rem" }}><strong style={{ color: "#0077B6" }}>Edge Cases:</strong> Zero balances are ignored, and invalid amounts are flagged for manual review to prevent incorrect emails.</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: "3rem", borderTop: "1px solid #d0edf8", paddingTop: "1rem", fontSize: "0.75rem", color: "#bbb" }}>
          Hogancare POC — Document Parsing and Automation Overview
        </div>
      </div>
    </div>
  );
}
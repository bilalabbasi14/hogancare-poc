"use client";
import { useState } from "react";

const C = {
  primary: "#00B4D8",
  dark: "#0077B6",
  text: "#0F172A",
  muted: "#475569",
  subtle: "#64748b",
  bg: "rgba(255, 255, 255, 0.72)",
  surface: "rgba(255, 255, 255, 0.45)",
  border: "rgba(0, 119, 182, 0.08)",
  green: "#0a7a3e",
  greenBg: "#edf7f2",
  amber: "#7a5c0a",
  amberBg: "#fdf8ed",
  red: "#b91c1c",
  redBg: "#fff1f1",
};

const providers = [
  {
    name: "OpenAI",
    model: "GPT-5.5 / GPT-4o",
    tagline: "Most widely adopted, broadest ecosystem",
    accent: "#0ea5e9",
    accentBg: "#f0f9ff",
    specs: [
      { label: "Flagship price per 1M", value: "$5.00 / $30.00", note: "GPT-5.5 in/out" },
      { label: "Best-value model", value: "$2.50 / $10.00", note: "GPT-4o" },
      { label: "Budget model", value: "$0.15 / $0.60", note: "GPT-4o Mini" },
      { label: "Context window", value: "~1M tokens", note: "GPT-5.5 and GPT-4.1" },
    ],
    strengths: [
      "Most mature developer ecosystem",
      "80% SWE-Bench score on real code tasks",
      "Strongest for technical accuracy in documentation",
      "Largest plugin and integration library",
    ],
    watch: "GPT-4o retiring in AU region June 2026. GPT-5.x availability in Australian regional endpoints unclear.",
  },
  {
    name: "Claude",
    model: "Sonnet 4.6 / Haiku 4.5",
    tagline: "Highest consistency and instruction-following",
    accent: "#00B4D8",
    accentBg: "#f0fcff",
    specs: [
      { label: "Flagship price per 1M", value: "$3.00 / $15.00", note: "Sonnet 4.6 in/out" },
      { label: "Premium model", value: "$5.00 / $25.00", note: "Opus 4.8" },
      { label: "Budget model", value: "$1.00 / $5.00", note: "Haiku 4.5" },
      { label: "Context window", value: "1M tokens", note: "Claude Opus 4.6" },
    ],
    strengths: [
      "Highest rated for factual accuracy across comparisons",
      "Less than 5% accuracy degradation at full context range",
      "Best for constraint-heavy structured reasoning",
      "53% adoption rate among coding professionals",
    ],
    watch: null,
  },
  {
    name: "Gemini",
    model: "3.1 Pro / 3.5 Flash",
    tagline: "Fastest responses, best price-to-performance",
    accent: "#7c3aed",
    accentBg: "#f5f3ff",
    specs: [
      { label: "Flagship price per 1M", value: "$2.00 / $12.00", note: "Gemini 3.1 Pro in/out" },
      { label: "Mid-tier", value: "$1.50 / $9.00", note: "Gemini 3.5 Flash" },
      { label: "Budget model", value: "$0.10 / $0.40", note: "Gemini 2.5 Flash-Lite" },
      { label: "Context window", value: "1M tokens", note: "Gemini 2.5 Flash-Lite/3.1 Pro" },
    ],
    strengths: [
      "Noticeably faster response times than OpenAI and Claude",
      "Cheapest input tokens of all three providers",
      "Best for Google ecosystem (Firebase, Android, Workspace)",
      "77.1% on ARC-AGI-2 reasoning benchmark",
    ],
    watch: "Slightly less consistent on complex reasoning. Newer models not yet available in Australian regional endpoints.",
  },
];

const rosterRows = [
  { model: "Gemini Flash-Lite", monthly: "$3.20", withDiscount: "$1.60", perWorkerDay: "$0.00004" },
  { model: "GPT-4o Mini", monthly: "$1.80", withDiscount: "$0.90", perWorkerDay: "$0.00002" },
  { model: "Claude Haiku 4.5", monthly: "$2.40", withDiscount: "$1.20", perWorkerDay: "$0.00003" },
  { model: "Gemini 3.5 Flash", monthly: "$6.40", withDiscount: "$3.20", perWorkerDay: "$0.00007" },
  { model: "Claude Sonnet 4.6", monthly: "$9.60", withDiscount: "$4.80", perWorkerDay: "$0.00011" },
  { model: "GPT-4o", monthly: "$19.00", withDiscount: "$9.50", perWorkerDay: "$0.00021" },
];

const residencyData = [
  {
    provider: "Claude via AWS Bedrock",
    datacenter: "AWS Sydney (ap-southeast-2)",
    inferenceAU: "full",
    latestModels: "full",
    latestNote: "Sonnet 4.5 + Haiku 4.5 confirmed AU",
    compliance: "IRAP assessment underway. CloudTrail audit logs in Sydney region.",
  },
  {
    provider: "Gemini via Vertex AI",
    datacenter: "Google Melbourne (australia-southeast1)",
    inferenceAU: "partial",
    latestModels: "partial",
    latestNote: "Gemini 3.5 only in US/EU endpoints currently",
    compliance: "Google Assured Workloads available. Older Gemini generations only in AU region.",
  },
  {
    provider: "OpenAI via Azure",
    datacenter: "Azure Sydney + Melbourne",
    inferenceAU: "partial",
    latestModels: "none",
    latestNote: "GPT-4o retiring June 2026, no confirmed successor",
    compliance: "Azure Assured Workloads available. At-rest residency expanded to AU, inference path less clear.",
  },
];

function StatusDot({ level }: { level: "full" | "partial" | "none" }) {
  const map = {
    full: { bg: C.greenBg, color: C.green, label: "Yes" },
    partial: { bg: C.amberBg, color: C.amber, label: "Partial" },
    none: { bg: C.redBg, color: C.red, label: "No" },
  };
  const s = map[level];
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", display: "inline-block" }}>
      {s.label}
    </span>
  );
}

export default function AIProviderComparison() {
  const [activeTab, setActiveTab] = useState<"tokens" | "cost">("cost");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="container-padding" style={{ fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: C.text, maxWidth: "920px", margin: "0 auto", padding: "52px 28px 80px" }}>
      <style>{`
        @media (max-width: 640px) {
          .container-padding {
            padding: 32px 16px 60px !important;
          }
          .header-title {
            font-size: 24px !important;
            line-height: 1.3 !important;
          }
          .mobile-stack {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .mobile-grid-1fr {
            grid-template-columns: 1fr !important;
          }
          .mobile-card-padding {
            padding: 16px !important;
          }
          .mobile-card-padding-sm {
            padding: 12px 16px !important;
          }
          .mobile-estimate-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
          .mobile-table-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .pricing-note-bubble {
            padding: 16px 20px !important;
            border-radius: 20px !important;
          }
          th, td {
            padding: 8px 10px !important;
            font-size: 12px !important;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: "56px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <h1
          style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 12px", lineHeight: 1.2, textAlign: "center" }}
          className="text-gradient header-title"
        >
          Choosing the Right AI for Your Hospital
        </h1>
        <p style={{ fontSize: "15px", color: C.muted, margin: "0 auto", lineHeight: 1.75, maxWidth: "600px", textAlign: "center" }}>
          A practical comparison of OpenAI, Claude, and Gemini, covering general capabilities, what rostering actually costs, Australian data residency, and a direct recommendation.
        </p>
        <div style={{ display: "flex", gap: "8px", marginTop: "20px", flexWrap: "wrap", justifyContent: "center" }}>
          {["General overview", "Rostering costs", "Data residency", "Recommendation"].map((label, i) => {
            const isHovered = hoveredIndex === i;
            const defaultColor = "#00B4D8";
            const hoverColor = "#0077B6";
            return (
              <a
                key={i}
                href={`#section-${i + 1}`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  fontSize: "12px",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "6px 14px",
                  border: `1.5px solid ${isHovered ? hoverColor : defaultColor}`,
                  borderRadius: "20px",
                  background: isHovered ? hoverColor : defaultColor,
                  boxShadow: isHovered ? "0 4px 12px rgba(0, 180, 216, 0.24)" : "0 2px 4px rgba(0, 180, 216, 0.12)",
                  transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "inline-block",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {label}
              </a>
            );
          })}
        </div>
      </div>

      {/* Section 1 — Cards */}
      <section id="section-1" style={{ marginBottom: "64px" }}>
        <SectionLabel number="01" title="General overview" />
        <p style={prose}>How the three providers compare on price, output quality, reliability, and context window.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginTop: "24px" }}>
          {providers.map((p) => {
            const outlineColor = p.name === "Claude"
              ? "#f97316"
              : p.name === "OpenAI"
                ? "#1a1a1a"
                : "#023E8A";

            return (
              <div key={p.name} style={{
                border: `2px solid ${outlineColor}`,
                borderRadius: "10px",
                background: C.bg,
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                overflow: "hidden",
                position: "relative",
              }}>
                <div style={{ padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: 700, color: outlineColor }}>{p.name}</div>
                      <div style={{ fontSize: "12px", color: C.muted, marginTop: "2px" }}>{p.model}</div>
                    </div>
                    <div style={{ background: p.accentBg, color: p.accent, fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "6px", whiteSpace: "nowrap" }}>
                      {p.name === "Claude" ? "Anthropic" : p.name === "Gemini" ? "Google" : "OpenAI"}
                    </div>
                  </div>

                  <p style={{ fontSize: "13px", color: C.muted, margin: "0 0 16px", lineHeight: 1.5, fontStyle: "italic" }}>{p.tagline}</p>

                  <div style={{ borderTop: `1px solid ${outlineColor}`, paddingTop: "14px", marginBottom: "14px" }}>
                    {p.specs.map((s, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "6px 0", borderBottom: i < p.specs.length - 1 ? `1px solid #f0f0f0` : "none" }}>
                        <span style={{ fontSize: "12px", color: C.muted }}>{s.label}</span>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>{s.value}</div>
                          <div style={{ fontSize: "11px", color: C.subtle }}>{s.note}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {p.watch && (
                    <div style={{ background: C.amberBg, border: `1px solid #f0d98a`, borderRadius: "6px", padding: "10px 12px", marginTop: "14px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: C.amber, marginBottom: "4px" }}>Note</div>
                      <p style={{ fontSize: "12px", color: "#5a4308", margin: 0, lineHeight: 1.5 }}>{p.watch}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pricing-note-bubble" style={{
          background: C.bg,
          border: "2px solid #1a1a1a",
          borderRadius: "40px 40px 30px 30px",
          padding: "20px 28px",
          marginTop: "24px",
          position: "relative",
          boxShadow: "4px 4px 0px rgba(0,0,0,0.05)",
        }}>
          <span style={{ fontSize: "13px", color: C.text, lineHeight: 1.7 }}>
            <strong style={{ color: C.text }}>On pricing:</strong> All three offer 50% discounts via Batch API for non-real-time processing, and prompt caching reduces costs by a further 50-80% on repeated system prompts. Consumer subscriptions are $20/month across all three.
          </span>
        </div>
      </section>

      {/* Section 2 — Rostering */}
      <section id="section-2" style={{ marginBottom: "64px" }}>
        <SectionLabel number="02" title="Rostering at scale" />
        <p style={prose}>What AI-assisted shift scheduling actually costs for a 150-employee hospital with daily updates and batch processing.</p>

        {/* Token breakdown visual */}
        <div className="mobile-card-padding" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "24px", marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: C.dark, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>Monthly token budget — 150 employees</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginBottom: "16px" }}>
            {[
              { label: "Full roster generation", detail: "7 departments x 28 days", tokens: "100K tokens", freq: "1x per month" },
              { label: "Daily delta updates", detail: "Swaps, sick calls, changes", tokens: "6,500 tokens/day", freq: "30x per month" },
              { label: "Ad-hoc coverage checks", detail: "Conflict queries, on-demand", tokens: "3,000 per query", freq: "~60x per month" },
            ].map((item, i) => (
              <div key={i} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "14px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: C.text, marginBottom: "4px" }}>{item.label}</div>
                <div style={{ fontSize: "11px", color: C.subtle, marginBottom: "10px" }}>{item.detail}</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: C.primary }}>{item.tokens}</div>
                <div style={{ fontSize: "11px", color: C.subtle, marginTop: "2px" }}>{item.freq}</div>
              </div>
            ))}
          </div>
          <div className="mobile-estimate-row" style={{ background: C.surface, border: "1.5px solid #2a2323ff", borderRadius: "6px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: C.muted }}>Total monthly estimate</span>
            <span style={{ fontSize: "18px", fontWeight: 700, color: C.dark }}>~500,000 tokens / month</span>
          </div>
        </div>

        {/* Cost table with toggle */}
        <div style={{ border: `1px solid ${C.border}`, borderRadius: "10px", overflow: "hidden" }}>
          <div className="mobile-table-header" style={{ background: C.surface, padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>Monthly cost comparison — 500K tokens</span>
            <div style={{ display: "flex", gap: "0", border: `1px solid ${C.border}`, borderRadius: "6px", overflow: "hidden" }}>
              {(["cost", "tokens"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: "5px 14px", fontSize: "12px", border: "none", cursor: "pointer",
                  background: activeTab === tab ? C.primary : "transparent",
                  color: activeTab === tab ? "#fff" : C.muted, fontWeight: activeTab === tab ? 600 : 400,
                  flex: 1,
                }}>
                  {tab === "cost" ? "With discounts" : "Standard pricing"}
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  <th style={th}>Model</th>
                  <th style={th}>{activeTab === "cost" ? "Monthly (batch + caching)" : "Monthly (standard)"}</th>
                  <th style={th}>Per worker / per day</th>
                </tr>
              </thead>
              <tbody>
                {rosterRows.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? C.bg : "#fafafa", borderBottom: `1px solid #f0f0f0` }}>
                    <td style={td}>{row.model}</td>
                    <td style={{ ...td, fontWeight: 600, color: C.dark }}>{activeTab === "cost" ? row.withDiscount : row.monthly}</td>
                    <td style={{ ...td, color: C.subtle }}>{row.perWorkerDay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, background: C.surface }}>
            <p style={{ fontSize: "12px", color: C.subtle, margin: 0 }}>
              Batch API (50% off): available on OpenAI and Anthropic for non-real-time workloads. Prompt caching reduces cost of repeated system prompts by 50-80%. Per-worker cost assumes 150 employees, 30 days.
            </p>
          </div>
        </div>

        {/* Two tier approach */}
        <div style={{ marginTop: "24px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: C.text, marginBottom: "14px" }}>Recommended approach: two-tier routing</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
            <div style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "4px 10px", fontSize: "11px", fontWeight: 700, color: C.dark }}>Tier 1 — 80% of workload</div>
              </div>
              <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>Gemini 3.5 Flash or Claude Haiku 4.5</div>
              <p style={{ fontSize: "13px", color: C.muted, margin: "0 0 10px", lineHeight: 1.6 }}>Overnight batch generation. Standard shift filling, 28-day scheduling, availability matching.</p>
              <div style={{ fontSize: "12px", color: C.subtle }}>Runs automatically, no human review needed</div>
            </div>
            <div style={{ border: `2px solid ${C.primary}`, borderRadius: "8px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <div style={{ background: C.surface, border: "1.5px solid #1a1a1a", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", fontWeight: 700, color: C.dark }}>Tier 2 — 20% of workload</div>
              </div>
              <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>Claude Sonnet 4.6</div>
              <p style={{ fontSize: "13px", color: C.muted, margin: "0 0 10px", lineHeight: 1.6 }}>Triggered on detected conflicts: leave overlaps, ICU coverage gaps, compliance violations, emergency rescheduling.</p>
              <div style={{ fontSize: "12px", color: C.subtle }}>A wrong roster has direct patient impact — quality matters here</div>
            </div>
          </div>
          <div className="mobile-estimate-row" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "6px", padding: "12px 16px", marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: C.muted }}>Combined monthly cost (80/20 split, 150 employees)</span>
            <span style={{ fontSize: "16px", fontWeight: 700, color: C.dark }}>~$4 / month</span>
          </div>
        </div>
      </section>

      {/* Section 3 — Data Residency */}
      <section id="section-3" style={{ marginBottom: "64px" }}>
        <SectionLabel number="03" title="Australian data residency" />
        <p style={prose}>This is the most consequential part of the decision. Under the Privacy Act 1988 and Australian Privacy Principles, the question is not just where data is stored at rest — it is where inference happens, where your prompt is read and a response is generated.</p>



        {/* Residency comparison */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
          {residencyData.map((r, i) => (
            <div key={i} style={{
              border: i === 0 ? `2px solid ${C.primary}` : `1.5px solid #1a1a1a`,
              borderRadius: "10px", padding: "18px 20px", background: i === 0 ? "#f7fcfe" : C.bg,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: C.text }}>{r.provider}</div>
                  <div style={{ fontSize: "12px", color: C.subtle, marginTop: "2px" }}>{r.datacenter}</div>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "11px", color: C.subtle, marginBottom: "4px" }}>Inference in AU</div>
                    <StatusDot level={r.inferenceAU as "full" | "partial" | "none"} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "11px", color: C.subtle, marginBottom: "4px" }}>Latest models in AU</div>
                    <StatusDot level={r.latestModels as "full" | "partial" | "none"} />
                  </div>
                </div>
              </div>
              <div className="mobile-grid-1fr" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px" }}>
                <div style={{ color: C.muted, lineHeight: 1.55 }}>
                  <span style={{ fontWeight: 600, color: C.text }}>Models: </span>{r.latestNote}
                </div>
                <div style={{ color: C.muted, lineHeight: 1.55 }}>
                  <span style={{ fontWeight: 600, color: C.text }}>Compliance: </span>{r.compliance}
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Section 4 — Recommendation */}
      <section id="section-4" style={{ marginBottom: "32px" }}>
        <SectionLabel number="04" title="Recommendation" />
        <p style={prose}>A direct answer based on the three factors above.</p>

        <div style={{ border: `2px solid ${C.primary}`, borderRadius: "12px", overflow: "hidden" }}>
          <div className="mobile-card-padding-sm" style={{ background: C.primary, padding: "16px 24px" }}>
            <div style={{ color: "#fff", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Overall recommendation</div>
            <div style={{ color: "#fff", fontSize: "20px", fontWeight: 700 }}>Claude via Amazon Bedrock (Sydney region)</div>
          </div>
          <div className="mobile-card-padding" style={{ padding: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            {[
              { label: "Data residency", reason: "Full geo-lock in AWS Sydney. Both inference and metadata stay in Australia. Auditable via CloudTrail logs stored in ap-southeast-2." },
              { label: "Rostering quality", reason: "Highest accuracy on constraint-heavy structured tasks. Reliable instruction-following matters when a wrong roster has patient impact." },
              { label: "Cost", reason: "At 150 employees, all providers cost under $10/month with batch processing. Cost is not a differentiator — reliability and compliance are." },
            ].map((item, i) => (
              <div key={i} style={{ borderLeft: `3px solid ${C.primary}`, paddingLeft: "14px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: C.dark, marginBottom: "6px" }}>{item.label}</div>
                <p style={{ fontSize: "13px", color: C.muted, margin: 0, lineHeight: 1.65 }}>{item.reason}</p>
              </div>
            ))}
          </div>

          <div className="mobile-card-padding" style={{ borderTop: `1px solid ${C.border}`, padding: "20px 24px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: C.dark, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>Implementation summary</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
              {[
                { label: "Bulk overnight batch", model: "Claude Haiku 4.5", detail: "Standard shift generation, 28-day schedules, all departments. Runs automatically via Batch API at 50% cost." },
                { label: "Complex conflict resolution", model: "Claude Sonnet 4.5", detail: "Triggered when conflicts are detected. Leave overlaps, ICU coverage gaps, compliance breaches." },
                { label: "Infrastructure", model: "AWS Bedrock ap-southeast-2", detail: "Both inference geo and workspace geo set to Sydney. IRAP-aligned. Full CloudTrail audit trail in-region." },
              ].map((item, i) => (
                <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "14px" }}>
                  <div style={{ fontSize: "11px", color: C.subtle, marginBottom: "4px" }}>{item.label}</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: C.text, marginBottom: "6px" }}>{item.model}</div>
                  <div style={{ fontSize: "12px", color: C.muted, lineHeight: 1.6 }}>{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div style={{ borderTop: `1px solid #e8e8e8`, paddingTop: "20px", fontSize: "11px", color: C.subtle }}>
        Pricing data current as of June 2026. API rates are subject to change — verify with each provider before procurement.
      </div>
    </div>
  );
}

function SectionLabel({ number, title }: { number: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
      <span style={{ fontSize: "11px", fontWeight: 700, color: "#00B4D8", fontFamily: "monospace", letterSpacing: "0.05em" }}>{number}</span>
      <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "#1a1a1a" }}>{title}</h2>
    </div>
  );
}

const prose: React.CSSProperties = {
  fontSize: "14px", lineHeight: 1.75, color: "#555", margin: "0 0 20px", maxWidth: "720px",
};

const th: React.CSSProperties = {
  padding: "10px 16px", textAlign: "left", fontSize: "12px", fontWeight: 700,
  color: "#0077B6", borderBottom: "1px solid #d0eaf5", background: "#f7fcfe",
};

const td: React.CSSProperties = {
  padding: "10px 16px", fontSize: "13px", verticalAlign: "middle",
};
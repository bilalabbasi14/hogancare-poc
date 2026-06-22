'use client';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Zap, Shield, FileSearch, Lightbulb, ArrowRight } from 'lucide-react';

const providers = [
  {
    name: 'OpenAI',
    model: 'GPT-4o',
    color: '#10a37f',
    lightBg: 'rgba(16, 163, 127, 0.05)',
    borderColor: 'rgba(16, 163, 127, 0.15)',
    tagline: 'Most mature ecosystem',
    pricing: {
      input: '$2.50',
      output: '$10.00',
      unit: 'per 1M tokens',
      vision: '$2.50 + image fee',
      monthly_est: '~$45–120',
    },
    context: '128K tokens',
    vision: true,
    documentHandling: 'Excellent',
    documentScore: 95,
    agedCareScore: 88,
    speed: 'Fast',
    speedScore: 82,
    compliance: 'SOC 2, HIPAA-ready BAA',
    strengths: ['Best-in-class document extraction', 'Largest third-party integrations', 'Assistants API for automation workflows', 'Fine-tuning available'],
    weaknesses: ['Most expensive at scale', 'Rate limits on free tier', 'No Australia-specific data residency'],
    useCases: ['Debtor PDF parsing', 'Contract analysis', 'Patient record summarisation', 'Automated email drafting'],
    verdict: 'Best Choice',
    verdictColor: '#065f46',
    verdictBg: 'rgba(34, 197, 94, 0.08)',
    verdictBorder: 'rgba(34, 197, 94, 0.15)',
  },
  {
    name: 'Claude',
    model: 'Claude 3.5 Sonnet',
    color: '#d97706',
    lightBg: 'rgba(217, 119, 6, 0.05)',
    borderColor: 'rgba(217, 119, 6, 0.15)',
    tagline: 'Safest for sensitive data',
    pricing: {
      input: '$3.00',
      output: '$15.00',
      unit: 'per 1M tokens',
      vision: '$3.00 + image fee',
      monthly_est: '~$55–140',
    },
    context: '200K tokens',
    vision: true,
    documentHandling: 'Excellent',
    documentScore: 93,
    agedCareScore: 95,
    speed: 'Medium',
    speedScore: 74,
    compliance: 'SOC 2, Constitutional AI, Privacy-first',
    strengths: ['Longest context window (200K)', 'Best for nuanced/sensitive content', 'Strong instruction-following', 'Ideal for NDIS compliance docs'],
    weaknesses: ['Slightly pricier per token', 'Fewer third-party integrations', 'Slower than GPT-4o on large batches'],
    useCases: ['NDIS documentation review', 'Care plan summarisation', 'Sensitive patient communications', 'Contract risk analysis'],
    verdict: 'Best for Compliance',
    verdictColor: '#92400e',
    verdictBg: 'rgba(245, 158, 11, 0.08)',
    verdictBorder: 'rgba(245, 158, 11, 0.15)',
  },
  {
    name: 'Gemini',
    model: 'Gemini 1.5 Pro',
    color: '#4285f4',
    lightBg: 'rgba(66, 133, 244, 0.05)',
    borderColor: 'rgba(66, 133, 244, 0.15)',
    tagline: 'Best value at scale',
    pricing: {
      input: '$1.25',
      output: '$5.00',
      unit: 'per 1M tokens',
      vision: '$1.25 (multimodal)',
      monthly_est: '~$20–65',
    },
    context: '1M tokens',
    vision: true,
    documentHandling: 'Good',
    documentScore: 81,
    agedCareScore: 76,
    speed: 'Very Fast',
    speedScore: 92,
    compliance: 'SOC 2, Google Cloud HIPAA',
    strengths: ['Largest context (1M tokens = entire folders)', 'Most affordable per token', 'Native Google Workspace integration', 'Fast inference speed'],
    weaknesses: ['Less accurate on structured extraction', 'Fewer healthcare-specific fine-tunes', 'Still maturing for enterprise workflows'],
    useCases: ['Bulk document ingestion', 'Google Sheets/Drive integration', 'High-volume low-cost processing', 'Meeting transcript analysis'],
    verdict: 'Best Value',
    verdictColor: '#1e40af',
    verdictBg: 'rgba(66, 133, 244, 0.08)',
    verdictBorder: 'rgba(66, 133, 244, 0.15)',
  },
];

const criteria = [
  { key: 'documentScore', label: 'Document Parsing Accuracy', icon: FileSearch },
  { key: 'agedCareScore', label: 'Aged Care Fit', icon: Shield },
  { key: 'speedScore', label: 'Response Speed', icon: Zap },
];

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div className="score-bar-track" style={{ flex: 1 }}>
        <motion.div
          className="score-bar-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
        />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#334155', minWidth: 34 }}>{score}%</span>
    </div>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.12 } },
};

export default function AIComparison() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 80px' }}>
      {/* Header */}
      <motion.div
        style={{ marginBottom: 56 }}
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        <motion.div className="section-label" style={{ marginBottom: 12 }} variants={fadeUp} transition={{ duration: 0.5 }}>
          Module 1 of 3
        </motion.div>
        <motion.h1
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#0F172A', marginBottom: 16 }}
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          AI Provider Comparison
        </motion.h1>
        <motion.p
          style={{ fontSize: 16, color: '#64748b', maxWidth: 600, lineHeight: 1.7 }}
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          A precise breakdown of OpenAI, Claude, and Gemini — evaluated specifically for aged care document processing, NDIS compliance, and operational automation.
        </motion.p>
      </motion.div>

      {/* Provider Cards */}
      <motion.div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 56 }}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
      >
        {providers.map((p) => (
          <motion.div key={p.name} variants={fadeUp} transition={{ duration: 0.5 }}>
            <div className="card card-hover" style={{
              padding: 28,
              borderTop: `3px solid ${p.color}`,
              height: '100%',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: p.color,
                      boxShadow: `0 0 8px ${p.color}40`,
                    }} />
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A' }}>{p.name}</h2>
                  </div>
                  <div style={{ fontSize: 12, color: p.color, fontWeight: 600 }}>{p.model}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{p.tagline}</div>
                </div>
                <span style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  background: p.verdictBg,
                  color: p.verdictColor,
                  border: `1px solid ${p.verdictBorder}`,
                  whiteSpace: 'nowrap',
                }}>{p.verdict}</span>
              </div>

              {/* Pricing */}
              <div style={{ background: p.lightBg, border: `1px solid ${p.borderColor}`, borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: p.color, letterSpacing: '0.08em', marginBottom: 10 }}>PRICING</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Input</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{p.pricing.input}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{p.pricing.unit}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Output</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{p.pricing.output}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{p.pricing.unit}</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${p.borderColor}` }}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Est. Monthly (Hogan Care scale)</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: p.color }}>{p.pricing.monthly_est}</div>
                </div>
              </div>

              {/* Scores */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 12 }}>PERFORMANCE SCORES</div>
                {criteria.map((c) => {
                  const Icon = c.icon;
                  return (
                    <div key={c.key} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12, color: '#475569', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon size={13} strokeWidth={2} />
                        {c.label}
                      </div>
                      <ScoreBar score={(p as any)[c.key]} color={p.color} />
                    </div>
                  );
                })}
              </div>

              {/* Key specs */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                <span className="badge badge-blue">Context: {p.context}</span>
                <span className="badge badge-cyan">Speed: {p.speed}</span>
                {p.vision && <span className="badge badge-green">Vision</span>}
              </div>

              {/* Strengths */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', letterSpacing: '0.08em', marginBottom: 8 }}>STRENGTHS</div>
                {p.strengths.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                    <CheckCircle2 size={14} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#374151' }}>{s}</span>
                  </div>
                ))}
              </div>

              {/* Weaknesses */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', letterSpacing: '0.08em', marginBottom: 8 }}>LIMITATIONS</div>
                {p.weaknesses.map((w, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                    <XCircle size={14} color="#dc2626" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#374151' }}>{w}</span>
                  </div>
                ))}
              </div>

              {/* Use cases */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 8 }}>BEST FOR HOGAN CARE</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {p.useCases.map((u, i) => (
                    <span key={i} style={{
                      fontSize: 11, padding: '3px 9px',
                      background: p.lightBg, color: p.color,
                      border: `1px solid ${p.borderColor}`,
                      borderRadius: 6, fontWeight: 500,
                    }}>{u}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Full comparison table */}
      <motion.div
        className="card"
        style={{ overflow: 'hidden', marginBottom: 48 }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid rgba(0,0,0,0.04)',
          background: 'rgba(0, 119, 182, 0.02)',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>Side-by-Side Comparison</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>All metrics evaluated in the context of aged care and NDIS operations</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>CRITERIA</th>
                {providers.map(p => (
                  <th key={p.name} style={{ textAlign: 'center', color: p.color }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                      {p.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Best Model', vals: ['GPT-4o', 'Claude 3.5 Sonnet', 'Gemini 1.5 Pro'] },
                { label: 'Input Price /1M tokens', vals: ['$2.50', '$3.00', '$1.25'], best: 2 },
                { label: 'Output Price /1M tokens', vals: ['$10.00', '$15.00', '$5.00'], best: 2 },
                { label: 'Est. Monthly Cost', vals: ['$45–120', '$55–140', '$20–65'], best: 2 },
                { label: 'Context Window', vals: ['128K', '200K', '1M'], best: 2 },
                { label: 'Vision / PDF Reading', vals: ['Yes', 'Yes', 'Yes'] },
                { label: 'Document Accuracy', vals: ['95%', '93%', '81%'], best: 0 },
                { label: 'Aged Care Fit Score', vals: ['88%', '95%', '76%'], best: 1 },
                { label: 'Response Speed', vals: ['Fast', 'Medium', 'Very Fast'], best: 2 },
                { label: 'HIPAA / Compliance', vals: ['BAA Available', 'Privacy-First', 'Google BAA'], best: 1 },
                { label: 'NDIS Doc Handling', vals: ['Good', 'Best', 'Fair'], best: 1 },
                { label: 'Australia Data Residency', vals: ['No', 'No', 'Yes'], best: 2 },
                { label: 'Free Tier / Trial', vals: ['$5 credit', 'Paid only', 'Generous'], best: 2 },
                { label: 'Xero / Zoho Integration', vals: ['Via API', 'Via API', 'Native Google'], best: 2 },
                { label: 'Best Overall Verdict', vals: ['Recommended', 'Compliance-Critical', 'High-Volume/Budget'] },
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: '#374151' }}>{row.label}</td>
                  {row.vals.map((v, j) => (
                    <td key={j} style={{
                      textAlign: 'center',
                      fontWeight: row.best === j ? 700 : 400,
                      color: row.best === j ? providers[j].color : '#475569',
                    }}>
                      {v}
                      {row.best === j && (
                        <span style={{
                          marginLeft: 6,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 16, height: 16,
                          borderRadius: '50%',
                          background: `${providers[j].color}15`,
                          fontSize: 10,
                        }}>
                          <CheckCircle2 size={10} color={providers[j].color} />
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Recommendation box */}
      <motion.div
        className="card"
        style={{
          padding: 36,
          background: 'linear-gradient(135deg, #023E8A, #0077B6)',
          color: 'white',
          border: 'none',
          overflow: 'hidden',
          position: 'relative',
        }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Subtle background decoration */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -30,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
        }} />

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', position: 'relative' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Lightbulb size={24} color="white" />
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Our Recommendation for Hogan Care</h3>
            <p style={{ fontSize: 15, lineHeight: 1.7, opacity: 0.92 }}>
              Start with <strong>OpenAI GPT-4o</strong> for document processing and debtor management — it has the most accurate PDF parsing and the broadest ecosystem.
              Use <strong>Claude</strong> for any NDIS compliance or sensitive patient documentation where accuracy and safety are paramount.
              Consider <strong>Gemini</strong> when you scale to bulk processing — its pricing drops significantly at volume and its Google Workspace integration pairs naturally with Xero and Zoho exports.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
              {['Phase 1: OpenAI', 'Phase 2: + Claude for compliance', 'Phase 3: Gemini at scale'].map((phase, i) => (
                <span key={i} style={{
                  background: 'rgba(255,255,255,0.12)',
                  padding: '6px 14px', borderRadius: 8,
                  fontSize: 13, fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>{phase}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

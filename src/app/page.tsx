'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, FileText, CalendarDays, ArrowRight, Users, Layers, Cpu, DollarSign } from 'lucide-react';

const modules = [
  {
    href: '/ai-comparison',
    icon: Brain,
    title: 'AI Providers',
    subtitle: 'OpenAI vs Claude vs Gemini',
    desc: 'A precise, side-by-side comparison of AI providers tailored to aged care operations — cost, accuracy, document handling, and compliance fit.',
    color: '#0077B6',
    gradient: 'linear-gradient(135deg, #0077B6, #00B4D8)',
    status: 'ready',
  },
  {
    href: '/document-processing',
    icon: FileText,
    title: 'Document Processing',
    subtitle: 'Debtor PDF Parsing & Automation',
    desc: 'Upload debtor PDFs and see 4 different processing libraries extract, structure, and trigger automated reminders — live, in your browser.',
    color: '#00B4D8',
    gradient: 'linear-gradient(135deg, #00B4D8, #0891b2)',
    status: 'ready',
  },
  {
    href: '/rostering',
    icon: CalendarDays,
    title: 'Rostering AI',
    subtitle: 'Intelligent Shift Scheduling',
    desc: 'AI-powered rostering that splits your 100+ employees across shifts, respects certifications and availability, and flags conflicts automatically.',
    color: '#023E8A',
    gradient: 'linear-gradient(135deg, #023E8A, #0077B6)',
    status: 'ready',
  },
];

const stats = [
  { icon: Users, n: '100+', label: 'Employees Managed' },
  { icon: Layers, n: '4', label: 'AI Libraries Compared' },
  { icon: Cpu, n: '3', label: 'Platform Modules' },
  { icon: DollarSign, n: '$0', label: 'Licensing vs $199 NRECO' },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px' }}>
      {/* Hero */}
      <motion.div
        style={{ textAlign: 'center', marginBottom: 72 }}
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        <motion.div className="section-label" style={{ marginBottom: 16 }} variants={fadeUp} transition={{ duration: 0.5 }}>
          Proof of Concept · June 2026
        </motion.div>
        <motion.h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 800,
            color: '#0F172A',
            lineHeight: 1.15,
            marginBottom: 20,
          }}
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Bringing AI to<br />
          <span className="text-gradient">Hogan Care Operations</span>
        </motion.h1>
        <motion.p
          style={{
            fontSize: 17,
            color: '#475569',
            maxWidth: 560,
            margin: '0 auto 36px',
            lineHeight: 1.7,
          }}
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Three focused modules that show exactly how AI can handle your contracts, payments, and rostering — without the bulk of full system complexity.
        </motion.p>
        <motion.div
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href="/ai-comparison" className="btn-primary" style={{ textDecoration: 'none' }}>
            Explore Platform
            <ArrowRight size={16} />
          </Link>
          <Link href="/document-processing" className="btn-outline" style={{ textDecoration: 'none' }}>
            See Document Demo
          </Link>
        </motion.div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        className="card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 0,
          marginBottom: 56,
          overflow: 'hidden',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
      >
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{
              padding: '28px 24px',
              borderRight: i < 3 ? '1px solid rgba(0,0,0,0.04)' : 'none',
              textAlign: 'center',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <Icon size={20} color="#0077B6" strokeWidth={1.8} />
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0077B6' }}>{s.n}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{s.label}</div>
            </div>
          );
        })}
      </motion.div>

      {/* Module cards */}
      <motion.div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
      >
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <motion.div key={m.href} variants={fadeUp} transition={{ duration: 0.5 }}>
              <Link href={m.status === 'soon' ? '#' : m.href} style={{ textDecoration: 'none' }}>
                <div className="card card-hover" style={{
                  padding: 32,
                  height: '100%',
                  cursor: m.status === 'soon' ? 'default' : 'pointer',
                  opacity: m.status === 'soon' ? 0.65 : 1,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{
                      width: 52, height: 52,
                      background: `${m.color}0F`,
                      borderRadius: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `1px solid ${m.color}15`,
                    }}>
                      <Icon size={24} color={m.color} strokeWidth={1.8} />
                    </div>
                    <span className="badge badge-green">Live Demo</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: m.color, letterSpacing: '0.1em', marginBottom: 8 }}>
                    {m.subtitle.toUpperCase()}
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>{m.title}</h3>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65 }}>{m.desc}</p>
                  {m.status !== 'soon' && (
                    <div style={{ marginTop: 24, color: m.color, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                      Open module
                      <ArrowRight size={15} />
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Footer note */}
      <motion.div
        style={{ textAlign: 'center', marginTop: 64, color: '#94a3b8', fontSize: 13 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Built for Hogan Care · Proof of Concept · All data is simulated
      </motion.div>
    </div>
  );
}

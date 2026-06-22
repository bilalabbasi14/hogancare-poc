'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const modules = [
  {
    href: '/ai-comparison',
    title: 'AI Providers',
    desc: 'Compare different AI providers on cost, speed, and accuracy.',
  },
  {
    href: '/document-processing',
    title: 'Document Processing',
    desc: 'Parse information from invoice and debtor PDF documents automatically.',
  },
  {
    href: '/rostering',
    title: 'Rostering AI',
    desc: 'Generate shift rosters and manage staff availability with intelligent rules.',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
      {/* Header Section */}
      <motion.div
        style={{ marginBottom: 32 }}
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        <motion.h1
          style={{
            fontSize: '32px',
            fontWeight: 800,
            marginBottom: 4,
            textAlign: 'center',
          }}
          className="text-gradient"
          variants={fadeUp}
        >
          Hogan Care
        </motion.h1>

        <motion.div
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: '#64748b',
            marginBottom: 20,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
          variants={fadeUp}
        >
          Proof of Concept · June 2026
        </motion.div>

        <motion.p
          style={{
            fontSize: '16px',
            color: '#475569',
            lineHeight: 1.7,
            margin: '0 auto',
            textAlign: 'center',
            maxWidth: '640px',
          }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
        >
          This webapp is built to show you a few items from the overall Hogan Care project and how they can be implemented and automated. Here are details for AI providers, a demo of documents parsing, and AI-based rostering.
        </motion.p>
      </motion.div>

      {/* Module cards */}
      <motion.div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={stagger}
      >
        {modules.map((m) => {
          return (
            <motion.div key={m.href} variants={fadeUp} transition={{ duration: 0.4 }}>
              <Link href={m.href} style={{ textDecoration: 'none' }}>
                <div className="card card-hover" style={{
                  padding: 24,
                  height: '100%',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0077B6', margin: 0 }}>
                    {m.title}
                  </h3>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                    {m.desc}
                  </p>
                  <div style={{
                    marginTop: 'auto',
                    paddingTop: 12,
                    color: '#0077B6',
                    fontWeight: 600,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    View module
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Footer note */}
      <motion.div
        style={{ textAlign: 'center', marginTop: 48, color: '#94a3b8', fontSize: 12 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Built for Hogan Care · Proof of Concept · All data is simulated
      </motion.div>
    </div>
  );
}



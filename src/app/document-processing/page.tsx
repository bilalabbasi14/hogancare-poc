'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, BarChart3, Building2, FileCode2, Layers, Brain, Blocks,
  Upload, CheckCircle2, AlertTriangle, Clock, CircleDot, Mail,
  User, ArrowRight, Loader2, X, Check, TrendingUp, DollarSign,
  AlertCircle, ShieldAlert, Info, XCircle, Lightbulb
} from 'lucide-react';

const SAMPLE_PDFS = [
  {
    id: 'sample_pdf.pdf',
    name: 'Sample Invoice Report',
    desc: 'Invoice processing demonstration with AUD amounts, statuses (PAID/UNPAID), and automated decision logic',
    records: 7,
    complexity: 'Simple',
    complexityColor: '#22c55e',
    icon: FileText,
    preview: [
      { id: 'INV-001', name: 'Alice Johnson', amount: 'AUD 1,250.00', due: '2025-07-01', status: 'PAID' },
      { id: 'INV-002', name: 'Bob Martinez', amount: 'AUD 3,500.00', due: '2025-06-15', status: 'UNPAID' },
      { id: 'INV-003', name: 'Charles Davis', amount: 'AUD 890.50', due: '2025-06-30', status: 'PAID' },
      { id: 'INV-004', name: 'David Lee', amount: 'AUD 4,200.00', due: '2025-05-20', status: 'UNPAID' },
      { id: 'INV-005', name: 'Emma Wilson', amount: 'AUD 1,675.00', due: '2025-07-10', status: 'UNPAID' },
      { id: 'INV-006', name: 'Frank Chen', amount: 'AUD 0.00', due: '2025-05-01', status: 'PAID' },
      { id: 'INV-007', name: 'Grace Nguyen', amount: 'AUD 5,100.00', due: '2025-05-15', status: 'UNPAID' },
    ],
  },
];

const LIBRARIES = [
  {
    id: 'pdf-parse',
    name: 'pdf-parse',
    type: 'Text Extraction',
    icon: FileCode2,
    color: '#6366f1',
    lightBg: 'rgba(99, 102, 241, 0.05)',
    license: 'MIT — Free',
    cost: '$0',
    npm: '2.1M downloads/week',
    accuracy: 78,
    speed: 95,
    desc: 'Lightweight raw-text extractor. Fast and minimal — great baseline.',
    usable: true,
  },
  {
    id: 'pdfjs-dist',
    name: 'pdfjs-dist',
    type: 'Structured Layout',
    icon: Layers,
    color: '#f59e0b',
    lightBg: 'rgba(245, 158, 11, 0.05)',
    license: 'Apache 2.0 — Free',
    cost: '$0',
    npm: '4.8M downloads/week',
    accuracy: 87,
    speed: 78,
    desc: "Mozilla's battle-tested engine. Preserves layout and positions.",
    usable: false,
  },
  {
    id: 'pdf2json',
    name: 'pdf2json',
    type: 'JSON Field Mapping',
    icon: Blocks,
    color: '#10b981',
    lightBg: 'rgba(16, 185, 129, 0.05)',
    license: 'Apache 2.0 — Free',
    cost: '$0',
    npm: '890K downloads/week',
    accuracy: 83,
    speed: 85,
    desc: 'Outputs structured JSON with column-aware field detection.',
    usable: false,
  },
  {
    id: 'openai-vision',
    name: 'OpenAI Vision',
    type: 'AI-Powered',
    icon: Brain,
    color: '#10a37f',
    lightBg: 'rgba(16, 163, 127, 0.05)',
    license: 'Pay-per-use',
    cost: '~$0.003/page',
    npm: 'API call',
    accuracy: 97,
    speed: 45,
    desc: 'GPT-4o reads the PDF as an image. Highest accuracy, detects anomalies.',
    usable: true,
  },
];

function StatusBadge({ status, amount }: { status: string; amount: string }) {
  const amt = parseFloat(amount.replace(/[^0-9.-]/g, ''));
  if (amt === -999) return (
    <span className="badge badge-red">
      <AlertTriangle size={11} />
      Data Error
    </span>
  );
  if (amt === 0) return (
    <span className="badge badge-green">
      <CheckCircle2 size={11} />
      Cleared
    </span>
  );
  if (status.includes('OVERDUE') || status.includes('UNPAID') || status.includes('CRITICAL')) {
    return (
      <span className="badge badge-red">
        <CircleDot size={11} />
        {status}
      </span>
    );
  }
  if (status.includes('DUE SOON') || status.includes('UPCOMING') || status.includes('FUTURE') || status.includes('PENDING')) {
    return (
      <span className="badge badge-orange">
        <Clock size={11} />
        {status}
      </span>
    );
  }
  return <span className="badge badge-gray">{status}</span>;
}

function ReminderBadge({ status }: { status: string }) {
  if (status === 'escalated') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div className="indicator-dot indicator-dot-pulse" style={{ background: '#ef4444', color: '#ef4444' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444' }}>ESCALATED TO STAFF</span>
    </div>
  );
  if (status === 'reminder2') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div className="indicator-dot indicator-dot-pulse" style={{ background: '#f59e0b', color: '#f59e0b' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>2nd REMINDER SENT</span>
    </div>
  );
  if (status === 'reminder1') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div className="indicator-dot indicator-dot-pulse" style={{ background: '#3b82f6', color: '#3b82f6' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6' }}>1st REMINDER SENT</span>
    </div>
  );
  return <span style={{ fontSize: 11, color: '#94a3b8' }}>— No action</span>;
}

function AutomationStepper({ record }: { record: any }) {
  const steps = [
    { label: 'PDF Parsed', done: true, icon: Check },
    { label: '1st Reminder', done: record.reminderStatus === 'reminder1' || record.reminderStatus === 'reminder2' || record.reminderStatus === 'escalated', icon: Mail },
    { label: '2nd Reminder', done: record.reminderStatus === 'reminder2' || record.reminderStatus === 'escalated', icon: Mail },
    { label: 'Staff Review', done: record.reminderStatus === 'escalated', icon: User },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 6 }}>
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: step.done ? 'linear-gradient(135deg, #0077B6, #00B4D8)' : 'rgba(0,0,0,0.06)',
              color: step.done ? 'white' : '#94a3b8',
              fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: step.done ? '0 2px 6px rgba(0,119,182,0.25)' : 'none',
              transition: 'all 0.3s ease',
            }} title={step.label}>
              {step.done ? <Icon size={11} /> : <span style={{ fontSize: 9 }}>{i + 1}</span>}
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: 20, height: 2,
                background: steps[i + 1].done
                  ? 'linear-gradient(90deg, #0077B6, #00B4D8)'
                  : 'rgba(0,0,0,0.06)',
                transition: 'background 0.3s ease',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export default function DocumentProcessing() {
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedLibrary, setSelectedLibrary] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setUploadedFile(f); setResult(null); }
  };

  const handleProcess = async () => {
    if (!uploadedFile || !selectedLibrary) return;
    setProcessing(true);
    setResult(null);
    const fd = new FormData();
    fd.append('file', uploadedFile);
    fd.append('library', selectedLibrary);
    try {
      const res = await fetch('/api/process-pdf', { method: 'POST', body: fd });
      const data = await res.json();
      setResult(data);
    } finally {
      setProcessing(false);
    }
  };

  const currentLib = LIBRARIES.find(l => l.id === selectedLibrary);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Header */}
      <motion.div
        style={{ marginBottom: 48 }}
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        <motion.div className="section-label" style={{ marginBottom: 12 }} variants={fadeUp} transition={{ duration: 0.5 }}>
          Module 2 of 3
        </motion.div>
        <motion.h1
          style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#0F172A', marginBottom: 16 }}
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Document Processing Demo
        </motion.h1>
        <motion.p
          style={{ fontSize: 16, color: '#64748b', maxWidth: 680, lineHeight: 1.7 }}
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          See exactly how AI reads your debtor PDFs — pick a sample file, choose a processing library, and watch the system extract, structure, and trigger the right automated actions in real time.
        </motion.p>
      </motion.div>

      {/* Step 1: Sample PDFs */}
      <motion.div
        style={{ marginBottom: 48 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div className="step-circle">1</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>Choose a Sample File</h2>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>Preview inline or use your own PDF</span>
        </div>

        <motion.div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          {SAMPLE_PDFS.map((s) => {
            const Icon = s.icon;
            const isSelected = uploadedFile?.name === s.id;
            return (
              <motion.div key={s.id} variants={fadeUp} transition={{ duration: 0.4 }}>
                <div className="card card-hover" style={{
                  padding: 0, overflow: 'hidden',
                  border: isSelected ? '2px solid #00B4D8' : '1px solid rgba(0,0,0,0.06)',
                }}>
                  {/* Card header */}
                  <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 10,
                          background: `${s.complexityColor}0F`,
                          border: `1px solid ${s.complexityColor}15`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icon size={20} color={s.complexityColor} strokeWidth={1.8} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>{s.name}</div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{s.desc}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span className="badge badge-blue">{s.records} records</span>
                      <span style={{
                        padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: `${s.complexityColor}10`, color: s.complexityColor,
                        border: `1px solid ${s.complexityColor}18`,
                      }}>{s.complexity}</span>
                    </div>
                  </div>

                  {/* Inline preview table */}
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table-modern" style={{ fontSize: 11 }}>
                      <thead>
                        <tr>
                          {['ID', 'Name', 'Amount', 'Due', 'Status'].map(h => (
                            <th key={h} style={{ padding: '7px 12px', fontSize: 10 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {s.preview.map((row, ri) => {
                          const amt = parseFloat(row.amount.replace(/[^0-9.-]/g, ''));
                          const isError = amt === -999;
                          const isCleared = amt === 0;
                          return (
                            <tr key={ri} style={{ background: isError ? 'rgba(239,68,68,0.03)' : isCleared ? 'rgba(34,197,94,0.03)' : 'transparent' }}>
                              <td style={{ padding: '6px 12px', fontFamily: 'monospace', fontSize: 10, color: '#64748b' }}>{row.id}</td>
                              <td style={{ padding: '6px 12px', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', fontSize: 11 }}>{row.name.split('/')[0].trim()}</td>
                              <td style={{ padding: '6px 12px', fontWeight: 700, color: isError ? '#ef4444' : isCleared ? '#22c55e' : '#0F172A', whiteSpace: 'nowrap', fontSize: 11 }}>
                                {isError ? 'Error' : isCleared ? 'Cleared' : row.amount}
                              </td>
                              <td style={{ padding: '6px 12px', color: '#64748b', whiteSpace: 'nowrap', fontSize: 10 }}>{row.due}</td>
                              <td style={{ padding: '6px 12px' }}>
                                <StatusBadge status={row.status} amount={row.amount} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Actions */}
                  <div style={{ padding: '14px 20px', display: 'flex', gap: 10, borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                    <a href="/sample_pdf.pdf" download className="btn-outline" style={{ fontSize: 12, padding: '8px 18px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileText size={14} />
                      Download
                    </a>
                    <button className={isSelected ? "btn-outline" : "btn-primary"} style={{ fontSize: 12, padding: '8px 18px', flex: 1 }}
                      onClick={() => { setUploadedFile(new File([], s.id, { type: 'application/pdf' })); setResult(null); }}>
                      {isSelected ? (
                        <>
                          <CheckCircle2 size={14} />
                          Selected
                        </>
                      ) : (
                        <>
                          Use this File
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Step 2: Upload */}
      <motion.div
        style={{ marginBottom: 48 }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div className="step-circle">2</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>Upload Your PDF</h2>
        </div>

        <div
          className={`upload-zone ${uploadedFile ? 'has-file' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) { setUploadedFile(f); setResult(null); }
          }}
        >
          <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileUpload} />
          <AnimatePresence mode="wait">
            {uploadedFile ? (
              <motion.div key="has-file" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: 'rgba(0, 180, 216, 0.08)',
                  border: '1px solid rgba(0, 180, 216, 0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                }}>
                  <FileText size={26} color="#00B4D8" />
                </div>
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 16 }}>{uploadedFile.name}</div>
                <div style={{ color: '#00B4D8', fontSize: 13, marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <CheckCircle2 size={14} />
                  Ready to process — choose a library below
                </div>
                <button className="btn-outline" style={{ marginTop: 14, fontSize: 12 }} onClick={e => { e.stopPropagation(); setUploadedFile(null); setResult(null); }}>
                  <X size={14} />
                  Remove file
                </button>
              </motion.div>
            ) : (
              <motion.div key="no-file" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: 'rgba(0, 119, 182, 0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                }}>
                  <Upload size={26} color="#0077B6" strokeWidth={1.5} />
                </div>
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 16 }}>Drag & drop your PDF here</div>
                <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 6 }}>or click to browse · PDF files only</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Step 3: Choose library */}
      <motion.div
        style={{ marginBottom: 48 }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div className="step-circle">3</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>Select Processing Library</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
          {LIBRARIES.filter(lib => lib.usable).map(lib => {
            const Icon = lib.icon;
            const isSelected = selectedLibrary === lib.id;
            return (
              <motion.div
                key={lib.id}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <div className="card"
                  style={{
                    padding: 22, cursor: 'pointer',
                    border: isSelected ? `2px solid ${lib.color}` : '1px solid rgba(0,0,0,0.06)',
                    background: isSelected ? lib.lightBg : 'rgba(255,255,255,0.72)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onClick={() => { setSelectedLibrary(lib.id); setResult(null); }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: `${lib.color}0C`,
                      border: `1px solid ${lib.color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={22} color={lib.color} strokeWidth={1.8} />
                    </div>
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                          background: lib.color, color: 'white', borderRadius: 20,
                          fontSize: 11, padding: '3px 10px', fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}
                      >
                        <Check size={11} />
                        Selected
                      </motion.span>
                    )}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: lib.color, marginBottom: 2 }}>{lib.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 8 }}>{lib.type}</div>
                  <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5, marginBottom: 12 }}>{lib.desc}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <span style={{ fontSize: 11, background: 'rgba(0,0,0,0.03)', color: '#475569', padding: '3px 9px', borderRadius: 6, fontWeight: 600, border: '1px solid rgba(0,0,0,0.04)' }}>
                      Accuracy: {lib.accuracy}%
                    </span>
                    <span style={{ fontSize: 11, background: lib.cost === '$0' ? 'rgba(34,197,94,0.06)' : 'rgba(245,158,11,0.06)', color: lib.cost === '$0' ? '#16a34a' : '#d97706', padding: '3px 9px', borderRadius: 6, fontWeight: 600, border: `1px solid ${lib.cost === '$0' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)'}` }}>
                      {lib.cost}/page
                    </span>
                    <span className="badge badge-gray" style={{ fontSize: 10 }}>{lib.license}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            style={{ fontSize: 15, padding: '12px 32px', opacity: (!uploadedFile || !selectedLibrary) ? 0.5 : 1 }}
            disabled={!uploadedFile || !selectedLibrary || processing}
            onClick={handleProcess}
          >
            {processing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Process with {currentLib?.name || 'Selected Library'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
          {processing && (
            <div style={{ color: '#00B4D8', fontSize: 14, fontWeight: 600 }} className="animate-pulse-soft">
              Extracting data from PDF...
            </div>
          )}
        </div>
      </motion.div>

      {/* Step 4: Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div className="step-circle">4</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>Processing Results</h2>
              <span className="badge badge-green" style={{ fontSize: 12 }}>
                <CheckCircle2 size={12} />
                Complete in {result.processingMs}ms
              </span>
            </div>

            {/* Summary cards */}
            <motion.div
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 32 }}
              initial="initial"
              animate="animate"
              variants={stagger}
            >
              {[
                { label: 'Records Found', value: result.summary.total, color: '#0077B6', Icon: FileText },
                { label: 'Action Required', value: result.summary.overdue, color: '#ef4444', Icon: AlertCircle },
                { label: 'Cleared', value: result.summary.cleared, color: '#22c55e', Icon: CheckCircle2 },
                { label: 'Data Errors', value: result.summary.errors, color: '#f59e0b', Icon: AlertTriangle },
                { label: 'Total Due', value: `$${result.summary.totalDue.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`, color: '#0F172A', Icon: DollarSign },
              ].map((s, i) => (
                <motion.div key={i} variants={fadeUp} transition={{ duration: 0.4 }}>
                  <div className="card" style={{ padding: '20px 16px', textAlign: 'center', borderTop: `3px solid ${s.color}` }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: `${s.color}0C`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 8px',
                    }}>
                      <s.Icon size={18} color={s.color} strokeWidth={1.8} />
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{s.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Library stats */}
            <div className="card" style={{ padding: 24, marginBottom: 28, borderLeft: `4px solid ${currentLib?.color}` }}>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>LIBRARY</div>
                  <div style={{ fontWeight: 800, color: currentLib?.color, fontSize: 18 }}>{currentLib?.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{currentLib?.type}</div>
                </div>
                <div style={{ height: 40, width: 1, background: 'rgba(0,0,0,0.06)' }} />
                {[
                  { label: 'Accuracy', value: `${result.accuracy}%` },
                  { label: 'Speed', value: `${result.processingMs}ms` },
                  { label: 'Confidence', value: `${result.confidence}%` },
                  { label: 'License', value: currentLib?.license },
                  { label: 'Cost/page', value: currentLib?.cost },
                ].map((m, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 16 }}>{m.value}</div>
                  </div>
                ))}
                <div style={{ marginLeft: 'auto' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginBottom: 6 }}>FIELDS CAPTURED</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {result.fieldsCaptured.map((f: string, i: number) => (
                      <span key={i} style={{ fontSize: 11, background: currentLib?.lightBg, color: currentLib?.color, padding: '3px 9px', borderRadius: 6, fontWeight: 600, border: `1px solid ${currentLib?.color}20` }}>{f}</span>
                    ))}
                  </div>
                </div>
              </div>
              {result.misses.length > 0 && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', marginRight: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <AlertTriangle size={12} />
                    KNOWN LIMITATIONS:
                  </span>
                  {result.misses.map((m: string, i: number) => (
                    <span key={i} style={{ fontSize: 12, color: '#64748b', marginRight: 16 }}>· {m}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Main results table */}
            <div className="card" style={{ overflow: 'hidden', marginBottom: 32 }}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 700, color: '#0F172A', fontSize: 16 }}>Extracted Records</h3>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Automation stage shown for each record</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="table-modern">
                  <thead>
                    <tr>
                      {['ID', 'Client Name', 'Amount Due', 'Due Date', 'Status', 'Anomaly', 'Automation Stage'].map(h => (
                        <th key={h}>{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.records.map((rec: any, i: number) => (
                      <tr key={i} style={{
                        background: rec.amount === -999 ? 'rgba(239,68,68,0.03)' : rec.amount === 0 ? 'rgba(34,197,94,0.03)' : 'transparent',
                      }}>
                        <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>{rec.id}</td>
                        <td style={{ fontWeight: 600, color: '#374151' }}>{rec.displayName || rec.name}</td>
                        <td style={{ fontWeight: 700, color: rec.amount === -999 ? '#ef4444' : rec.amount === 0 ? '#22c55e' : '#0F172A' }}>
                          {rec.amount === -999 ? '— Error' : rec.amount === 0 ? '— Cleared' : `$${rec.amount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}`}
                        </td>
                        <td style={{ color: '#64748b', fontSize: 12 }}>{rec.dueDate}</td>
                        <td>
                          <StatusBadge status={rec.status} amount={String(rec.amount)} />
                        </td>
                        <td style={{ maxWidth: 200 }}>
                          {rec.anomaly ? (
                            <span style={{ fontSize: 11, color: rec.amount === -999 ? '#ef4444' : '#0077B6', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Info size={12} />
                              {rec.anomaly.replace(/[^\w\s.,—\-()]/g, '').trim()}
                            </span>
                          ) : <span style={{ color: '#94a3b8', fontSize: 11 }}>—</span>}
                        </td>
                        <td>
                          <AutomationStepper record={rec} />
                          <div style={{ marginTop: 4 }}>
                            <ReminderBadge status={rec.reminderStatus} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Automation flow explainer */}
            <div className="card" style={{ padding: 28, marginBottom: 32, background: 'rgba(0, 119, 182, 0.02)' }}>
              <h3 style={{ fontWeight: 700, color: '#0F172A', fontSize: 17, marginBottom: 20 }}>How Automation Decisions Are Made</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {[
                  { Icon: CheckCircle2, label: 'No Action', desc: 'Amount is $0 or negative — account cleared or data error', color: '#22c55e' },
                  { Icon: Mail, label: '1st Reminder', desc: 'Amount > $0 with any overdue/unpaid/critical status', color: '#3b82f6' },
                  { Icon: ShieldAlert, label: '2nd Reminder', desc: 'Overdue by 45+ days — escalated automated follow-up', color: '#f59e0b' },
                  { Icon: User, label: 'Staff Review', desc: 'Overdue 90d+ or high-value (>$3,000) — staff intervention', color: '#ef4444' },
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    style={{
                      padding: '18px 20px',
                      background: `${step.color}06`,
                      borderRadius: 12,
                      border: `1px solid ${step.color}15`,
                    }}
                    whileHover={{ y: -2, boxShadow: `0 4px 16px ${step.color}12` }}
                    transition={{ duration: 0.2 }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: `${step.color}0C`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 10,
                    }}>
                      <step.Icon size={18} color={step.color} />
                    </div>
                    <div style={{ fontWeight: 700, color: step.color, fontSize: 14, marginBottom: 4 }}>{step.label}</div>
                    <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{step.desc}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All Parsing Libraries Info */}
      <motion.div
        style={{ marginBottom: 48 }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#00B4D8', background: 'rgba(0, 180, 216, 0.1)', padding: '4px 12px', borderRadius: 20 }}>PARSING LIBRARIES</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>Available PDF Processing Options</h2>
          <span style={{ fontSize: 13, color: '#94a3b8', marginLeft: 'auto' }}>4 libraries · 2 recommended for production</span>
        </div>
        <motion.div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          {LIBRARIES.map((lib) => {
            const Icon = lib.icon;
            const isUsable = lib.usable;
            return (
              <motion.div key={lib.id} variants={fadeUp} transition={{ duration: 0.4 }}>
                <div className="card" style={{ padding: 24, height: '100%', borderLeft: `4px solid ${lib.color}`, position: 'relative', overflow: 'hidden' }}>
                  {!isUsable && (
                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.05)', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>
                      Not usable
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: `${lib.color}0C`,
                      border: `1px solid ${lib.color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={24} color={lib.color} strokeWidth={1.8} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: lib.color }}>{lib.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 2 }}>{lib.type}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 16 }}>{lib.desc}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>ACCURACY</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: lib.color }}>{lib.accuracy}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, marginBottom: 4 }}>SPEED</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: lib.color }}>{lib.speed > 80 ? 'Fast' : lib.speed > 60 ? 'Medium' : 'Slow'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <span style={{ fontSize: 11, background: lib.cost === '$0' ? 'rgba(34,197,94,0.06)' : 'rgba(245,158,11,0.06)', color: lib.cost === '$0' ? '#16a34a' : '#d97706', padding: '3px 9px', borderRadius: 6, fontWeight: 600, border: `1px solid ${lib.cost === '$0' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)'}` }}>
                      {lib.cost}
                    </span>
                    <span className="badge badge-gray" style={{ fontSize: 10 }}>{lib.license}</span>
                    {isUsable && (
                      <span style={{ fontSize: 10, background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '3px 9px', borderRadius: 6, fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.2)', marginLeft: 'auto' }}>
                        ✓ Production-ready
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Library Comparison Table */}
      <motion.div
        className="card"
        style={{ overflow: 'hidden', marginBottom: 40 }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ padding: '22px 28px', borderBottom: '1px solid rgba(0,0,0,0.04)', background: 'rgba(0, 119, 182, 0.02)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>Library Comparison</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Text extraction vs AI-powered parsing for invoice processing</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-modern">
            <thead>
              <tr>
                {['Library', 'License', 'Cost', 'Accuracy', 'Speed', 'Structured Output', 'Anomaly Detection', 'Use Case'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ...LIBRARIES.map(l => ({
                  name: l.name, 
                  license: l.license.split('—')[0].trim(), 
                  cost: l.cost,
                  accuracy: `${l.accuracy}%`, 
                  speed: l.speed > 80 ? 'Fast' : l.speed > 60 ? 'Medium' : 'Slow',
                  structured: l.id !== 'pdf-parse', 
                  anomaly: l.id === 'openai-vision' ? 'AI' : 'None',
                  best: l.id === 'pdf-parse' ? 'Baseline text extraction' : 
                        l.id === 'openai-vision' ? 'Highest accuracy & logic' :
                        l.id === 'pdfjs-dist' ? 'Client-side viewing only' :
                        'Legacy backend parsing',
                })),
              ].map((row, i) => (
                <tr key={i} style={{ background: 'transparent' }}>
                  <td style={{ fontWeight: 700, color: '#0F172A' }}>
                    {row.name}
                  </td>
                  <td style={{ fontSize: 12 }}>{row.license}</td>
                  <td style={{ fontWeight: 700, color: '#16a34a' }}>{row.cost}</td>
                  <td style={{ fontWeight: 700, color: '#0F172A' }}>{row.accuracy}</td>
                  <td>{row.speed}</td>
                  <td>{row.structured ? <CheckCircle2 size={13} color="#16a34a" /> : <span style={{ color: '#94a3b8' }}>—</span>}</td>
                  <td style={{ fontSize: 12 }}>{row.anomaly}</td>
                  <td style={{ fontSize: 12, color: '#475569' }}>{row.best}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '16px 24px', background: 'rgba(34, 197, 94, 0.04)', borderTop: '1px solid rgba(34, 197, 94, 0.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lightbulb size={16} color="#16a34a" />
          <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
            Our recommendation: Use <strong>pdf-parse</strong> (free, MIT) for fast baseline processing with instant results, or <strong>OpenAI Vision</strong> (~$0.003/page) for highest accuracy and anomaly detection on complex invoices.
          </span>
        </div>
      </motion.div>
    </div>
  );
}

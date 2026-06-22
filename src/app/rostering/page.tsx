'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, BarChart3, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import workers from '@/data/workers.json';
import participants from '@/data/participants.json';
import history from '@/data/history.json';
import { RosterShift, RosterResult, RosterWeights } from '@/types/rostering';

type Step = 'overview' | 'configure' | 'results';

// Worker color mapping
const workerColors: Record<string, string> = {
  SW001: '#0077B6', // Sarah - brand blue
  SW002: '#10b981', // James - green
  SW003: '#f59e0b', // Linda - amber
  SW004: '#8b5cf6', // David - purple
  SW005: '#ef4444', // Priya - red
};

const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayLabels: Record<string, string> = {
  monday: 'MON',
  tuesday: 'TUE',
  wednesday: 'WED',
  thursday: 'THU',
  friday: 'FRI',
  saturday: 'SAT',
  sunday: 'SUN',
};

export default function RosteringPage() {
  const [currentStep, setCurrentStep] = useState<Step>('overview');
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const aiDecisionRef = useRef<HTMLDivElement>(null);
  const [weights, setWeights] = useState<RosterWeights>({
    history: 80,
    skillMatch: 70,
    availability: 100,
    costEfficiency: 40,
    workerRating: 60,
  });
  const [weekStart, setWeekStart] = useState('2025-06-23');
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [rosterResult, setRosterResult] = useState<RosterResult | null>(null);
  const [selectedShift, setSelectedShift] = useState<RosterShift | null>(null);

  const generateRoster = async () => {
    setIsGenerating(true);
    setLogs([]);
    setSelectedShift(null);

    setTimeout(() => {
      logsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);

    // Simulate streaming logs
    const logSequence = [
      '⚙️  Loading participant requirements...',
      '⚙️  Loading worker profiles & availability...',
      '⚙️  Loading shift history...',
      '🤖  Sending to AI matching engine...',
    ];

    for (let i = 0; i < logSequence.length; i++) {
      await new Promise((r) => setTimeout(r, 400));
      setLogs((prev) => [...prev, logSequence[i]]);
      setTimeout(() => {
        logsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }

    try {
      const response = await fetch('/api/generate-roster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStart,
          participants,
          workers,
          history,
          weights,
        }),
      });

      const result = await response.json();

      setLogs((prev) => [
        ...prev,
        `✓   Received roster for ${result.summary.totalShifts} shifts across ${participants.length} participants`,
        `✓   ${result.summary.assigned} shifts assigned`,
        ...(result.summary.unassigned > 0 ? [`⚠️  ${result.summary.unassigned} shift(s) unassigned`] : []),
      ]);

      setTimeout(() => {
        logsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);

      setRosterResult(result);
      setTimeout(() => setCurrentStep('results'), 1500);
    } catch (err: any) {
      setLogs((prev) => [...prev, `❌ Error: ${err.message}`]);
    }

    setIsGenerating(false);
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px' }}>
      {/* Steps */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap' }}>
        {(['overview', 'configure', 'results'] as Step[]).map((step, idx) => (
          <button
            key={step}
            onClick={() => setCurrentStep(step)}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              fontSize: 13,
              fontWeight: currentStep === step ? 600 : 500,
              color: currentStep === step ? '#0077B6' : '#94a3b8',
              background: currentStep === step ? 'rgba(0, 119, 182, 0.1)' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: "'Poppins', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 20 }}>{idx + 1}</span>
            {step === 'overview' && 'Staff & Participants'}
            {step === 'configure' && 'Generate Roster'}
            {step === 'results' && 'View Results'}
          </button>
        ))}
      </div>

      {/* Section 1: Overview */}
      {currentStep === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 40 }}>
            {/* Workers */}
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#0F172A' }}>
                Support Workers
              </h2>
              <div style={{ display: 'grid', gap: 12 }}>
                {workers.map((w) => (
                  <div
                    key={w.id}
                    style={{
                      padding: 16,
                      border: '1px solid #e0f2fe',
                      borderRadius: 12,
                      background: '#f0f9ff',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                          {w.name}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                          {w.role} · {w.yearsExperience} yrs exp
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                          {w.certifications.map((cert) => (
                            <span
                              key={cert}
                              style={{
                                fontSize: 10,
                                padding: '3px 8px',
                                borderRadius: 4,
                                background: '#dbeafe',
                                color: '#0077B6',
                                fontWeight: 500,
                              }}
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                        <div style={{ fontSize: 13, color: '#475569' }}>
                          ${w.hourlyRate}/hr · Max {w.maxWeeklyHours}h/week
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: workerColors[w.id],
                          color: 'white',
                          fontWeight: 700,
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        {w.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: '#e67e22',
                        marginTop: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      ⭐ {w.rating}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Participants */}
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#0F172A' }}>
                Participants
              </h2>
              <div style={{ display: 'grid', gap: 12 }}>
                {participants.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      padding: 16,
                      border: '1px solid #e0e7ff',
                      borderRadius: 12,
                      background: '#f0f4ff',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                          {p.name}, {p.age}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          {p.condition.join(', ')}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          padding: '4px 10px',
                          borderRadius: 4,
                          fontWeight: 600,
                          background:
                            p.careLevel === 'Critical' ? '#fee2e2' : p.careLevel === 'High' ? '#fef3c7' : '#dcfce7',
                          color:
                            p.careLevel === 'Critical' ? '#dc2626' : p.careLevel === 'High' ? '#d97706' : '#16a34a',
                        }}
                      >
                        {p.careLevel} Care
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: '#475569', marginBottom: 8 }}>
                      {p.shiftPattern.days.map((d) => dayLabels[d]).join('/')} · {p.shiftPattern.time}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {p.requiredCertifications.map((cert) => (
                        <span
                          key={cert}
                          style={{
                            fontSize: 10,
                            padding: '3px 8px',
                            borderRadius: 4,
                            background: '#e0e7ff',
                            color: '#4f46e5',
                            fontWeight: 500,
                          }}
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: 13, color: '#10b981', marginTop: 8, fontWeight: 500 }}>
                      Budget: ${p.fundingBudgetWeekly}/week
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Section 2: Configure */}
      {currentStep === 'configure' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div
              style={{
                padding: 32,
                border: '1px solid #e0f2fe',
                borderRadius: 16,
                background: '#f0f9ff',
              }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: '#0F172A' }}>
                Configure & Generate
              </h2>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', display: 'block', marginBottom: 8 }}>
                  Week Starting
                </label>
                <input
                  type="date"
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: "'Poppins', sans-serif",
                  }}
                />
              </div>

              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#0F172A' }}>
                AI Weighting Priorities
              </h3>

              {(
                [
                  { key: 'history', label: 'Worker-Patient History' },
                  { key: 'skillMatch', label: 'Skill Match' },
                  { key: 'availability', label: 'Availability' },
                  { key: 'costEfficiency', label: 'Cost Efficiency' },
                  { key: 'workerRating', label: 'Worker Rating' },
                ] as const
              ).map(({ key, label }) => (
                <div key={key} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0077B6' }}>{weights[key]}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights[key]}
                    onChange={(e) => setWeights({ ...weights, [key]: parseInt(e.target.value) })}
                    style={{ width: '100%', height: 6, borderRadius: 3, appearance: 'none', background: '#dbeafe' }}
                  />
                </div>
              ))}

              <button
                onClick={generateRoster}
                disabled={isGenerating}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  marginTop: 24,
                  borderRadius: 10,
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'white',
                  background: isGenerating ? '#94a3b8' : 'linear-gradient(135deg, #0077B6, #00B4D8)',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {isGenerating ? '⚙️ Generating...' : '▶ Generate AI Roster'}
              </button>

              {(logs.length > 0 || isGenerating) && (
                <div
                  style={{
                    marginTop: 24,
                    padding: 16,
                    borderRadius: 8,
                    background: 'white',
                    border: '1px solid #e0e7ff',
                    maxHeight: 200,
                    overflowY: 'auto',
                  }}
                >
                  {isGenerating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <span style={{ fontSize: 20 }}>⚙️</span>
                      </motion.div>
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        style={{ fontSize: 14, fontWeight: 600, color: '#0077B6' }}
                      >
                        AI Roster Engine Running...
                      </motion.span>
                    </div>
                  )}
                  {logs.map((log, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: 12,
                        color: '#475569',
                        marginBottom: 6,
                        fontFamily: 'monospace',
                      }}
                    >
                      {log}
                    </div>
                  ))}
                  <div ref={logsContainerRef} />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Section 3: Results */}
      {currentStep === 'results' && rosterResult && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '12px 16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, color: '#0369a1', fontSize: 14, fontWeight: 500 }}>
            <span style={{ fontSize: 18 }}></span>
            <span>Click on any assigned shift card below to view the AI's reasoning and alternative choices.</span>
          </div>
          {/* Calendar Grid */}
          <div style={{ marginBottom: 40, overflowX: 'auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `150px repeat(7, 1fr)`,
                gap: 8,
                minWidth: 1000,
              }}
            >
              {/* Header */}
              <div />
              {dayOrder.map((day, idx) => {
                const date = new Date(weekStart);
                date.setDate(date.getDate() + idx);
                const dateStr = date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
                return (
                  <div
                    key={day}
                    style={{
                      textAlign: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#0077B6',
                      padding: '8px 0',
                      borderBottom: '2px solid #0077B6',
                    }}
                  >
                    {dayLabels[day]} {dateStr}
                  </div>
                );
              })}

              {/* Rows */}
              {participants.map((participant) => (
                <React.Fragment key={participant.id}>
                  <div
                    key={`label-${participant.id}`}
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#0F172A',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 0',
                    }}
                  >
                    {participant.name}
                  </div>
                  {dayOrder.map((day) => {
                    const shift = rosterResult.roster.find(
                      (s) => s.participantId === participant.id && s.day === day
                    );

                    if (!shift) {
                      return (
                        <div
                          key={`${participant.id}-${day}`}
                          style={{
                            padding: 8,
                            borderRadius: 8,
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            minHeight: 80,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            color: '#9ca3af',
                            textAlign: 'center',
                          }}
                        >
                          —
                        </div>
                      );
                    }

                    const worker = workers.find((w) => w.id === shift.assignedWorkerId);
                    const confColor =
                      shift.confidenceScore >= 85
                        ? '#22c55e'
                        : shift.confidenceScore >= 70
                          ? '#f59e0b'
                          : '#ef4444';

                    return (
                      <div
                        key={`${participant.id}-${day}`}
                        onClick={() => {
                          setSelectedShift(shift);
                          setTimeout(() => {
                            aiDecisionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 100);
                        }}
                        style={{
                          padding: 10,
                          borderRadius: 8,
                          background: worker ? workerColors[worker.id] : '#fca5a5',
                          border: '2px solid transparent',
                          minHeight: 80,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          transition: 'all 0.2s',
                          boxShadow:
                            selectedShift?.shiftId === shift.shiftId
                              ? `0 0 0 2px ${workerColors[worker?.id || 'SW001']}`
                              : 'none',
                        }}
                      >
                        {worker && (
                          <>
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            >
                              {worker.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div style={{ fontSize: 11, color: 'white', fontWeight: 600, textAlign: 'center' }}>
                              {worker.name.split(' ')[0]}
                            </div>
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: confColor,
                              }}
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* AI Reasoning Panel */}
          {selectedShift && (
            <div
              ref={aiDecisionRef}
              style={{
                padding: 24,
                border: '2px solid #0077B6',
                borderRadius: 12,
                background: '#f0f9ff',
                marginBottom: 32,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 18 }}>🤖</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
                  AI Decision — {selectedShift.participantName} · {dayLabels[selectedShift.day]} {selectedShift.date}
                </h3>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: '#475569' }}>
                <p style={{ marginBottom: 12, fontWeight: 600 }}>
                  Assigned: {selectedShift.assignedWorkerName} (Confidence: {selectedShift.confidenceScore}%)
                </p>
                <p style={{ marginBottom: 12, color: '#64748b' }}>"{selectedShift.assignmentReason}"</p>
                {selectedShift.alternativeWorker && (
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>
                    Alternative: {selectedShift.alternativeWorker}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Summary Dashboard */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { icon: CheckCircle, label: 'Shifts Assigned', value: `${rosterResult.summary.assigned}/${rosterResult.summary.totalShifts}` },
              { icon: Users, label: 'Continuity Score', value: `${rosterResult.summary.continuityScore}%` },
              { icon: DollarSign, label: 'Total Weekly Cost', value: `$${rosterResult.summary.totalCost.toFixed(2)}` },
              { icon: BarChart3, label: 'Avg Confidence', value: `${rosterResult.summary.averageConfidence}%` },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                style={{
                  padding: 20,
                  border: '1px solid #e0f2fe',
                  borderRadius: 12,
                  background: '#f0f9ff',
                  textAlign: 'center',
                }}
              >
                <Icon size={24} style={{ margin: '0 auto 8px', color: '#0077B6' }} />
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Conflicts */}
          {rosterResult.conflicts.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#0F172A' }}>
                ⚠️ Flags & Resolutions
              </h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {rosterResult.conflicts.map((conflict, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 16,
                      border: '1px solid #fed7aa',
                      borderRadius: 8,
                      background: '#fffbeb',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 12 }}>
                      <AlertCircle size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#d97706', marginBottom: 4 }}>
                          {conflict.type}
                        </div>
                        <div style={{ fontSize: 14, color: '#92400e', marginBottom: 8 }}>
                          {conflict.description}
                        </div>
                        <div style={{ fontSize: 13, color: '#b45309' }}>
                          <strong>Resolution:</strong> {conflict.resolution}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

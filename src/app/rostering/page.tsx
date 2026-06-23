'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, BarChart3, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import workers from '@/data/workers.json';
import participants from '@/data/participants.json';
import history from '@/data/history.json';
import { RosterShift, RosterResult, RosterWeights } from '@/types/rostering';

type Step = 'overview' | 'results';

// Worker color mapping
const workerColors: Record<string, string> = {
  SW001: '#0077B6', // Sarah - brand blue
  SW002: '#10b981', // James - green
  SW003: '#f59e0b', // Linda - amber
  SW004: '#8b5cf6', // David - purple
  SW005: '#ef4444', // Priya - red
};

const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const dayLabels: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
};

const timeSlots = [9, 10, 11, 12, 13, 14, 15, 16];
const formatTime = (hr: number) => `${hr === 12 ? 12 : hr % 12}:00 ${hr >= 12 ? 'PM' : 'AM'} AEST`;

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
  const [selectedDay, setSelectedDay] = useState<string>('monday');

  const generateRoster = async () => {
    setIsGenerating(true);
    setLogs([]);
    setSelectedShift(null);

    setTimeout(() => {
      logsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);


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

      if (result.error) {
        throw new Error(result.message || 'Unknown error from API');
      }

      setRosterResult(result);
      setTimeout(() => setCurrentStep('results'), 1500);
    } catch (err: any) {
      setLogs((prev) => [...prev, `❌ Error: ${err.message}`]);
    }

    setIsGenerating(false);
  };

  const getShiftForSlot = (workerId: string, day: string, hr: number) => {
    if (!rosterResult) return null;
    return rosterResult.roster.find((s) => {
      if (s.assignedWorkerId !== workerId || s.day !== day) return false;
      const startHr = parseInt(s.startTime.split(':')[0]);
      return startHr === hr;
    });
  };

  const thStyle = { padding: '12px', textAlign: 'left' as const, borderBottom: '2px solid #e2e8f0', color: '#0F172A', fontWeight: 600, fontSize: 13 };
  const tdStyle = { padding: '12px', borderBottom: '1px solid #f1f5f9', color: '#475569', fontSize: 13 };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px' }}>
      {/* Steps */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap' }}>
        {(['overview', 'results'] as Step[]).map((step, idx) => (
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
            {step === 'overview' && 'Configure & Overview'}
            {step === 'results' && 'View Roster Results'}
          </button>
        ))}
      </div>

      {/* Section 1: Overview */}
      {currentStep === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          <div style={{ marginBottom: 40, padding: 24, background: '#f0f9ff', border: '1px solid #e0f2fe', borderRadius: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#0F172A' }}>AI Roster Rules & Support Workers</h2>
            <div style={{ marginBottom: 24, fontSize: 14, color: '#475569', display: 'flex', gap: 40, flexWrap: 'wrap' }}>
              <div>
                <strong style={{ color: '#0F172A' }}>Hard Rules:</strong>
                <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                  <li>Strict Availability Match</li>
                  <li>Strict Certification Match</li>
                  <li>Weekly Hours & Budget Limits</li>
                </ul>
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ color: '#0F172A' }}>AI Priority Tie-Breakers:</strong>
                <div style={{ marginTop: 12, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {(
                    [
                      { key: 'history', label: 'History/Continuity' },
                      { key: 'costEfficiency', label: 'Cost Efficiency' },
                      { key: 'workerRating', label: 'Worker Rating' },
                    ] as const
                  ).map(({ key, label }) => (
                    <div key={key} style={{ flex: '1 1 140px' }}>
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
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto', background: 'white', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={thStyle}>Worker</th>
                    <th style={thStyle}>Role</th>
                    <th style={thStyle}>Hourly Rate</th>
                    <th style={thStyle}>Max Hrs/Wk</th>
                    <th style={thStyle}>Available Days</th>
                    <th style={thStyle}>Rating</th>
                    <th style={thStyle}>Certifications</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((w) => (
                    <tr key={w.id}>
                      <td style={{ ...tdStyle, fontWeight: 600, color: workerColors[w.id] }}>{w.name}</td>
                      <td style={tdStyle}>{w.role}</td>
                      <td style={tdStyle}>AUD {w.hourlyRate.toFixed(2)}/hr</td>
                      <td style={tdStyle}>{w.maxWeeklyHours}h</td>
                      <td style={tdStyle}>
                        {Object.entries(w.availability)
                          .filter(([_, slots]) => (slots as string[]).length > 0)
                          .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1, 3))
                          .join(', ')}
                      </td>
                      <td style={tdStyle}>{w.rating}</td>
                      <td style={tdStyle}>{w.certifications.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#0F172A' }}>Participants</h2>
            <div style={{ overflowX: 'auto', background: 'white', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={thStyle}>Participant</th>
                    <th style={thStyle}>Age</th>
                    <th style={thStyle}>Care Level</th>
                    <th style={thStyle}>Weekly Budget</th>
                    <th style={thStyle}>Conditions</th>
                    <th style={thStyle}>Req Certs</th>
                    <th style={thStyle}>Days</th>
                    <th style={thStyle}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p) => (
                    <tr key={p.id}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{p.name}</td>
                      <td style={tdStyle}>{p.age}</td>
                      <td style={tdStyle}>
                        {p.careLevel}
                      </td>
                      <td style={tdStyle}>AUD {p.fundingBudgetWeekly}</td>
                      <td style={tdStyle}>{p.condition.join(', ')}</td>
                      <td style={tdStyle}>{p.requiredCertifications.join(', ')}</td>
                      <td style={tdStyle}>{p.shiftPattern.days.map(d => d.slice(0, 3).toUpperCase()).join(', ')}</td>
                      <td style={tdStyle}>{p.shiftPattern.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#0F172A' }}>Proof of History: Tom Hanks</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>This data demonstrates how the AI leverages past continuity. Tom has significant history with Sarah. When History weighting is high, Sarah should be assigned.</p>
            <div style={{ overflowX: 'auto', background: 'white', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={thStyle}>Support Worker</th>
                    <th style={thStyle}>Shifts Completed</th>
                    <th style={thStyle}>Avg Rating Given</th>
                    <th style={thStyle}>Last Shift Date</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries((history as any)['Tom01'] || {}).map(([workerId, hist]: [string, any]) => {
                    const w = workers.find(w => w.id === workerId);
                    return (
                      <tr key={workerId}>
                        <td style={{ ...tdStyle, fontWeight: 600, color: workerColors[workerId] }}>{w?.name || workerId}</td>
                        <td style={tdStyle}>{hist.shiftsCompleted}</td>
                        <td style={tdStyle}>{hist.ratingGiven ? `${hist.ratingGiven}` : 'N/A'}</td>
                        <td style={tdStyle}>{hist.lastShift || 'N/A'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <button
              onClick={generateRoster}
              disabled={isGenerating}
              style={{
                padding: '16px 40px',
                borderRadius: 12,
                border: 'none',
                fontSize: 16,
                fontWeight: 600,
                color: 'white',
                background: isGenerating ? '#94a3b8' : 'linear-gradient(135deg, #0077B6, #00B4D8)',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                fontFamily: "'Poppins', sans-serif",
                boxShadow: '0 4px 12px rgba(0, 119, 182, 0.3)',
              }}
            >
              {isGenerating ? 'Generating AI Roster...' : 'Generate AI Roster'}
            </button>

            {(logs.length > 0 || isGenerating) && (
              <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: 'white', border: '1px solid #e0e7ff', maxHeight: 300, overflowY: 'auto', textAlign: 'left', maxWidth: 800, margin: '24px auto 0' }}>
                {logs.map((log, idx) => (
                  <div key={idx} style={{ fontSize: 13, color: '#475569', marginBottom: 8, fontFamily: 'monospace' }}>{log}</div>
                ))}
                <div ref={logsContainerRef} />
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Section 2: Results */}
      {currentStep === 'results' && rosterResult && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          <div style={{ marginBottom: 20, color: '#475569', fontSize: 14 }}>
            <span>Click on any assigned shift below to view the AI's reasoning.</span>
          </div>

          {/* Day Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '2px solid #e2e8f0', paddingBottom: 16, overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {dayOrder.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: selectedDay === day ? '#0077B6' : '#f1f5f9',
                  color: selectedDay === day ? 'white' : '#64748b',
                }}
              >
                {dayLabels[day]}
              </button>
            ))}
          </div>

          {/* Daily Calendar Matrix */}
          <div style={{ marginBottom: 40, overflowX: 'auto', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${timeSlots.length}, minmax(140px, 1fr))`, gap: 12 }}>
              {/* Header */}
              <div />
              {timeSlots.map(hr => (
                <div key={hr} style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#475569', paddingBottom: 12, borderBottom: '2px solid #cbd5e1' }}>
                  {formatTime(hr)}
                </div>
              ))}

              {/* Rows (Workers) */}
              {workers.map(worker => (
                <React.Fragment key={worker.id}>
                  <div style={{ fontWeight: 600, color: workerColors[worker.id], display: 'flex', alignItems: 'center', fontSize: 14 }}>
                    {worker.name.split(' ')[0]}
                  </div>
                  {timeSlots.map(hr => {
                    const shift = getShiftForSlot(worker.id, selectedDay, hr);
                    if (!shift) {
                      return <div key={hr} style={{ background: '#f8fafc', border: '1px dashed #e2e8f0', borderRadius: 6, minHeight: 60 }} />;
                    }

                    const isSelected = selectedShift?.shiftId === shift.shiftId;

                    return (
                      <div
                        key={hr}
                        onClick={() => {
                          setSelectedShift(shift);
                          setTimeout(() => aiDecisionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
                        }}
                        style={{
                          background: workerColors[worker.id],
                          color: 'white',
                          borderRadius: 6,
                          padding: 10,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          boxShadow: isSelected ? `0 0 0 3px #0F172A` : 'none',
                          opacity: isSelected ? 1 : 0.9,
                          transform: isSelected ? 'scale(1.02)' : 'none',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{shift.participantName}</div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* AI Reasoning Panel */}
          {selectedShift && (
            <div ref={aiDecisionRef} style={{ padding: 24, border: '2px solid #0077B6', borderRadius: 12, background: '#f0f9ff', marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
                  AI Decision — {selectedShift.participantName} at {selectedShift.startTime}
                </h3>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: '#475569' }}>
                <p style={{ marginBottom: 12, fontWeight: 600 }}>
                  Assigned: {selectedShift.assignedWorkerName}
                </p>
                <p style={{ marginBottom: 12, color: '#64748b' }}>"{selectedShift.assignmentReason}"</p>
              </div>
            </div>
          )}

          {/* Conflicts */}
          {rosterResult.conflicts.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#0F172A' }}>Flags & Resolutions</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {rosterResult.conflicts.map((conflict, idx) => (
                  <div key={idx} style={{ padding: 16, border: '1px solid #fed7aa', borderRadius: 8, background: '#fffbeb' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <AlertCircle size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#d97706', marginBottom: 4 }}>{conflict.type}</div>
                        <div style={{ fontSize: 14, color: '#92400e', marginBottom: 8 }}>{conflict.description}</div>
                        <div style={{ fontSize: 13, color: '#b45309' }}><strong>Resolution:</strong> {conflict.resolution}</div>
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

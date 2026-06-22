export interface Worker {
  id: string;
  name: string;
  role: string;
  certifications: string[];
  hourlyRate: number;
  maxWeeklyHours: number;
  availability: Record<string, string[]>;
  preferredParticipants: string[];
  rating: number;
  yearsExperience: number;
}

export interface Participant {
  id: string;
  name: string;
  age: number;
  condition: string[];
  careLevel: 'Medium' | 'High' | 'Critical';
  requiredCertifications: string[];
  preferredWorkers: string[];
  shiftPattern: {
    days: string[];
    time: string;
    durationHours: number;
    type: string;
  };
  fundingBudgetWeekly: number;
  notes: string;
}

export interface HistoryRecord {
  workerId: string;
  participantId: string;
  shiftsCompleted: number;
  lastShiftDate: string;
  averageRating: number;
  incidents: number;
  notes: string;
}

export interface RosterShift {
  shiftId: string;
  participantId: string;
  participantName: string;
  day: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  shiftType: string;
  assignedWorkerId: string | null;
  assignedWorkerName: string | null;
  assignmentReason: string;
  confidenceScore: number;
  alternativeWorker: string | null;
  weeklyWorkerCost: number;
  flags: string[];
}

export interface RosterResult {
  roster: RosterShift[];
  conflicts: { type: string; description: string; resolution: string; }[];
  summary: {
    totalShifts: number;
    assigned: number;
    unassigned: number;
    totalCost: number;
    workersUtilised: number;
    continuityScore: number;
    averageConfidence: number;
  };
}

export interface RosterWeights {
  history: number;
  skillMatch: number;
  availability: number;
  costEfficiency: number;
  workerRating: number;
}

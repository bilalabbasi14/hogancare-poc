import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { participants, workers, history, weights, weekStart } = body;

  const totalExpectedShifts = participants.reduce((acc: number, p: any) => acc + (p.shiftPattern?.days?.length || 0), 0);

  const systemPrompt = `You are an expert aged care rostering AI for Hogan Care, an Australian NDIS service provider.

Your job is to assign Support Workers (SW) to Participant shifts for the upcoming week.

RULES YOU MUST FOLLOW:

1. A worker can only be assigned if they are available during the shift's time window on that day.
2. A worker must hold ALL certifications required by the participant.
3. A worker cannot exceed their maxWeeklyHours across all assigned shifts this week.
4. Funding budget per participant per week must not be exceeded (hourlyRate × shiftHours × shifts).
5. If a participant has a preferred worker list, those workers get priority.
6. If NO valid worker can be assigned to a shift, flag it as UNASSIGNED and explain why.
7. ALWAYS use worker names instead of IDs in your assignmentReason.
8. CRITICAL TOKEN SAVING: Keep 'assignmentReason' to 2 or 3 words MAXIMUM (e.g., "High continuity", "Skill match"). Do NOT write full sentences.
9. CRITICAL: You MUST generate and include every single shift for every participant across all days specified in their shiftPattern. DO NOT SKIP any shifts.
10. CRITICAL: You MUST generate every single shift separately. If a participant has 5 days in their shiftPattern, you MUST generate 5 separate JSON objects. DO NOT group days (e.g., "monday, tuesday"). Each object must have exactly one day.

WEIGHTING PRIORITIES (Tie-breakers after hard rules are met):

- History/continuity: ${weights?.history ?? 80}
- Cost efficiency (prefer lower hourly rate when equal): ${weights?.costEfficiency ?? 40}
- Worker rating: ${weights?.workerRating ?? 60}

RESPOND ONLY IN VALID JSON. No explanation text outside the JSON. Format:

{
  "roster": [
    {
      "shiftId": "unique string",
      "participantId": "P001",
      "participantName": "...",
      "day": "monday",
      "date": "2025-06-23",
      "startTime": "08:00",
      "endTime": "12:00",
      "durationHours": 4,
      "shiftType": "Morning Personal Care",
      "assignedWorkerId": "SW001",
      "assignedWorkerName": "Sarah Mitchell",
      "assignmentReason": "High continuity score"
    }
  ],
  "conflicts": [
    {
      "type": "HOURS_EXCEEDED | NO_QUALIFIED_WORKER | BUDGET_EXCEEDED",
      "description": "...",
      "resolution": "..."
    }
  ],
  "summary": {
    "totalShifts": 28,
    "assigned": 27,
    "unassigned": 1,
    "totalCost": 3240.00,
    "workersUtilised": 5,
    "continuityScore": 88,
    "averageConfidence": 91
  }
}`;

  const userPrompt = `Generate the optimal roster for week starting ${weekStart}.

PARTICIPANTS AND SHIFT REQUIREMENTS:
${JSON.stringify(participants, null, 2)}

SUPPORT WORKERS WITH AVAILABILITY:
${JSON.stringify(workers, null, 2)}

HISTORICAL WORKER-PARTICIPANT DATA:
${JSON.stringify(history, null, 2)}

Assign shifts for every participant for every day in their shift pattern within this week.
For each shift, calculate the exact date from the weekStart and the day name.

CRITICAL MANDATORY INSTRUCTION:
You are provided with ${participants.length} participants who require exactly ${totalExpectedShifts} shifts in total across the week.
You MUST output exactly ${totalExpectedShifts} shift objects in the "roster" array. DO NOT STOP GENERATING until you have produced all ${totalExpectedShifts} shifts. If your JSON array has fewer than ${totalExpectedShifts} items, you have FAILED.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      response_format: { type: 'json_object' },
      max_tokens: 16000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const raw = response.choices[0].message.content || '{}';
    const result = JSON.parse(raw);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: true, message: err.message },
      { status: 500 }
    );
  }
}

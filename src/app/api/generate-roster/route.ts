import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { participants, workers, history, weights, weekStart } = body;

  const systemPrompt = `You are an expert aged care rostering AI for Hogan Care, an Australian NDIS service provider.

Your job is to assign Support Workers (SW) to Participant shifts for the upcoming week.

RULES YOU MUST FOLLOW:

1. A worker can only be assigned if they are available during the shift's time window on that day.
2. A worker must hold ALL certifications required by the participant.
3. A worker cannot exceed their maxWeeklyHours across all assigned shifts this week.
4. Funding budget per participant per week must not be exceeded (hourlyRate × shiftHours × shifts).
5. Workers with prior history with a participant MUST be strongly preferred — continuity of care is critical in aged care.
6. If a participant has a preferred worker list, those workers get priority.
7. If NO valid worker can be assigned to a shift, flag it as UNASSIGNED and explain why.

WEIGHTING PRIORITIES (0–100, higher = more important):

- History/continuity: ${weights?.history ?? 80}
- Skill match quality: ${weights?.skillMatch ?? 70}
- Availability fit: ${weights?.availability ?? 100}
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
      "assignedWorkerName": "...",
      "assignmentReason": "SW001 has 48 prior shifts with Margaret (highest continuity). Holds required Dementia Care and Manual Handling certs. Available 07:00-15:00 Monday. Cost: $130.00.",
      "confidenceScore": 95,
      "alternativeWorker": "SW003",
      "weeklyWorkerCost": 130.00,
      "flags": []
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
For each shift, calculate the exact date from the weekStart and the day name.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      max_tokens: 4000,
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

import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";

export interface InvoiceRecord {
  id: string;
  name: string;
  amount: number | null;
  currency: string;
  dueDate: string;
  status: "PAID" | "UNPAID" | string;
  isAbnormal: boolean;
  abnormalReason?: string;
}

export interface ParseResult {
  processingTimeMs: number;
  rawText: string;
  formattedOutput: string; // "Alice Johnson - AUD 1250 - PAID\n..."
  records: InvoiceRecord[];
  pageCount: number;
  warnings: string[];
}

/**
 * pdf-parse returns each table cell on its own line separated by blank lines.
 * Pattern per row: INV-XXX \n Name \n AUD X,XXX.XX \n YYYY-MM-DD \n PAID|UNPAID
 * Strategy: collect all non-empty tokens, find INV-\d+ anchors, then read the
 * next 4 tokens as name / amount / date / status.
 */
function extractRecords(rawText: string): {
  records: InvoiceRecord[];
  warnings: string[];
} {
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
  const records: InvoiceRecord[] = [];
  const warnings: string[] = [];

  // Strategy 1: Match row data on a single line (most common for simple PDF tables)
  // Supports space/pipe separation, AUD/$, various dates, and multiple statuses
  const invoiceLinePattern =
    /^([A-Z0-9-]+)\s*\|?\s*(.+?)\s*\|?\s*(AUD\s*-?[\d,]+\.?\d*|\$-?[\d,]+\.?\d*|-?\$?[\d,]+\.?\d*)\s*\|?\s*(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|[A-Za-z]{3}\s+\d{1,2}\s+\d{4}|N\/A|UNKNOWN)\s*\|?\s*(PAID|UNPAID|OVERDUE|DUE SOON|CLEARED|PENDING|ERROR|CRITICAL|DATA ERROR|SYSTEM ERROR|PAID IN FULL|OVERDUE\s+\d+d)$/i;

  for (const line of lines) {
    const match = line.match(invoiceLinePattern);
    if (match) {
      const [, id, name, amountRaw, dueDate, statusRaw] = match;
      const amountNum = parseFloat(amountRaw.replace(/[^0-9.\-]/g, ""));
      const amount: number | null = isNaN(amountNum) ? null : amountNum;
      
      const status = /^PAID$/i.test(statusRaw)
        ? "PAID"
        : /^UNPAID$/i.test(statusRaw)
          ? "UNPAID"
          : statusRaw;

      const currencyMatch = amountRaw.match(/^([A-Z]{3})\s/);
      const currency = currencyMatch ? currencyMatch[1] : "AUD";

      let isAbnormal = false;
      let abnormalReason: string | undefined;

      if (amount === null) {
        isAbnormal = true;
        abnormalReason = `Could not parse amount "${amountRaw}"`;
        warnings.push(`${id} (${name}): ${abnormalReason}`);
      } else if (amount === 0) {
        isAbnormal = true;
        abnormalReason = "Balance is zero — nothing owed";
        warnings.push(`${id} (${name}): ${abnormalReason}`);
      } else if (amount < 0) {
        isAbnormal = true;
        abnormalReason = `Abnormal negative amount: ${amount}`;
        warnings.push(`${id} (${name}): ${abnormalReason}`);
      }

      records.push({ id, name: name.trim(), amount, currency, dueDate, status, isAbnormal, abnormalReason });
    }
  }

  // Strategy 2: Match list-based layout (Name on line i-1, ID/Due/Amount/Status details on line i)
  if (records.length === 0) {
    const listPattern = /ID:\s*([A-Z0-9-]+)\s*\|\s*Due:\s*([^|]+?)\s*\|\s*Amount:\s*([^|]+?)\s*\|\s*Status:\s*([^|]+)$/i;
    for (let i = 1; i < lines.length; i++) {
      const match = lines[i].match(listPattern);
      if (match) {
        const [, id, dueDate, amountRaw, statusRaw] = match;
        const name = lines[i - 1].trim();

        // Skip if the preceding line is just the "Name" label
        if (name.toLowerCase() === "name") continue;

        const amountNum = parseFloat(amountRaw.replace(/[^0-9.\-]/g, ""));
        const amount: number | null = isNaN(amountNum) ? null : amountNum;

        const status = /^PAID$/i.test(statusRaw.trim())
          ? "PAID"
          : /^UNPAID$/i.test(statusRaw.trim())
            ? "UNPAID"
            : statusRaw.trim();

        const currencyMatch = amountRaw.match(/^([A-Z]{3})\s/);
        const currency = currencyMatch ? currencyMatch[1] : "AUD";

        let isAbnormal = false;
        let abnormalReason: string | undefined;

        if (amount === null) {
          isAbnormal = true;
          abnormalReason = `Could not parse amount "${amountRaw}"`;
          warnings.push(`${id} (${name}): ${abnormalReason}`);
        } else if (amount === 0) {
          isAbnormal = true;
          abnormalReason = "Balance is zero — nothing owed";
          warnings.push(`${id} (${name}): ${abnormalReason}`);
        } else if (amount < 0) {
          isAbnormal = true;
          abnormalReason = `Abnormal negative amount: ${amount}`;
          warnings.push(`${id} (${name}): ${abnormalReason}`);
        }

        records.push({ id, name, amount, currency, dueDate, status, isAbnormal, abnormalReason });
      }
    }
  }

  // Strategy 3: Fallback to token-based matching if no other matches are found
  if (records.length === 0) {
    const tokens = lines;
    for (let i = 0; i < tokens.length; i++) {
      if (!/^INV-\d+$/i.test(tokens[i])) continue;

      const id = tokens[i];
      const name = tokens[i + 1] ?? "";
      const amountRaw = tokens[i + 2] ?? "";
      const dueDate = tokens[i + 3] ?? "";
      const statusRaw = tokens[i + 4] ?? "";

      const amountNum = parseFloat(amountRaw.replace(/[^0-9.\-]/g, ""));
      const amount: number | null = isNaN(amountNum) ? null : amountNum;

      const status = /^PAID$/i.test(statusRaw)
        ? "PAID"
        : /^UNPAID$/i.test(statusRaw)
          ? "UNPAID"
          : statusRaw;

      const currencyMatch = amountRaw.match(/^([A-Z]{3})\s/);
      const currency = currencyMatch ? currencyMatch[1] : "AUD";

      let isAbnormal = false;
      let abnormalReason: string | undefined;

      if (amount === null) {
        isAbnormal = true;
        abnormalReason = `Could not parse amount "${amountRaw}"`;
        warnings.push(`${id} (${name}): ${abnormalReason}`);
      } else if (amount === 0) {
        isAbnormal = true;
        abnormalReason = "Balance is zero — nothing owed";
        warnings.push(`${id} (${name}): ${abnormalReason}`);
      } else if (amount < 0) {
        isAbnormal = true;
        abnormalReason = `Abnormal negative amount: ${amount}`;
        warnings.push(`${id} (${name}): ${abnormalReason}`);
      }

      records.push({ id, name: name.trim(), amount, currency, dueDate, status, isAbnormal, abnormalReason });
      i += 4;
    }
  }

  return { records, warnings };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: `Expected application/pdf, got ${file.type}.` },
        { status: 415 }
      );
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 10 MB." }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("[process-pdf] Debug: Received file:", file.name, "Size:", file.size, "Buffer size:", buffer.length);
    console.log("[process-pdf] Debug: Header bytes (hex):", buffer.slice(0, 15).toString("hex"));
    console.log("[process-pdf] Debug: Header text:", JSON.stringify(buffer.slice(0, 15).toString("utf8")));
    const start = Date.now();
    let parsed;
    try {
      parsed = await pdfParse(buffer, { max: 0 });
    } catch (err: unknown) {
      const bufferStr = buffer.toString("binary");
      if (bufferStr.includes("\r\n")) {
        console.log("[process-pdf] Parse failed. Attempting CRLF to LF normalization...");
        const normalizedBuffer = Buffer.from(bufferStr.replace(/\r\n/g, "\n"), "binary");
        try {
          parsed = await pdfParse(normalizedBuffer, { max: 0 });
        } catch (e) {
          throw err;
        }
      } else {
        console.log("[process-pdf] Parse failed. Attempting LF to CRLF normalization...");
        const normalizedBuffer = Buffer.from(bufferStr.replace(/\r?\n/g, "\r\n"), "binary");
        try {
          parsed = await pdfParse(normalizedBuffer, { max: 0 });
        } catch (e) {
          throw err;
        }
      }
    }
    const processingTimeMs = Date.now() - start;

    console.log("[process-pdf] Debug: Parsed text content:\n", parsed.text);
    const { records, warnings } = extractRecords(parsed.text);

    const formattedOutput = records.length
      ? records
        .map((r) => {
          const amt =
            r.amount === null
              ? "Unknown amount"
              : r.amount === 0
                ? "No balance due"
                : r.amount < 0
                  ? `Abnormal: ${r.amount}`
                  : `${r.currency} ${r.amount.toFixed(2)}`;
          return `${r.name} - ${amt} - Due: ${r.dueDate} - ${r.status}`;
        })
        .join("\n")
      : "(No invoice records found)";

    const result: ParseResult = {
      processingTimeMs,
      rawText: parsed.text,
      formattedOutput,
      records,
      pageCount: parsed.numpages,
      warnings,
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[process-pdf]", message);
    return NextResponse.json(
      { error: `Failed to process PDF: ${message}` },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: "POST a multipart/form-data request with a 'file' field." },
    { status: 405 }
  );
}
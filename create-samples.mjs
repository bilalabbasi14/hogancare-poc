// Simple PDF creator using raw PDF syntax
import { writeFileSync } from 'fs';

function createPDF(title, rows, filename) {
  const tableRows = rows.map(r => 
    `${r.id} | ${r.name} | ${r.amount} | ${r.due} | ${r.status}`
  ).join('\n');

  const content = `${title}
${'='.repeat(60)}
Generated: ${new Date().toLocaleDateString('en-AU')}
Organisation: Hogan Care Pty Ltd

DEBTOR REPORT
${'='.repeat(60)}

ID     | Client Name              | Amount Due | Due Date   | Status
-------|--------------------------|------------|------------|----------
${tableRows}

${'='.repeat(60)}
Total Records: ${rows.length}
Note: Amount -999 indicates data entry error. Amount 0 = cleared.
${'='.repeat(60)}
`;

  // Build a minimal valid PDF
  const lines = [];
  lines.push('%PDF-1.4');
  
  const contentStream = `BT\n/F1 11 Tf\n50 750 Td\n(${title.replace(/[()\\]/g, '\\$&')}) Tj\n`;
  const pageContent = content.split('\n').map((line, i) => 
    `50 ${730 - i * 14} Td (${line.replace(/[()\\]/g, '\\$&').substring(0, 85)}) Tj`
  ).join('\n');
  
  const stream = `BT\n/F1 9 Tf\n${pageContent}\nET`;
  const streamBytes = Buffer.from(stream, 'utf8');
  
  let offset = 0;
  const offsets = [];
  
  // Obj 1 - catalog
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  // Obj 2 - pages
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  // Obj 3 - page
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n';
  // Obj 4 - content stream
  const streamContent = stream;
  const obj4 = `4 0 obj\n<< /Length ${Buffer.byteLength(streamContent, 'utf8')} >>\nstream\n${streamContent}\nendstream\nendobj\n`;
  // Obj 5 - font
  const obj5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n';
  
  const header = '%PDF-1.4\n';
  let body = '';
  const xrefOffsets = [];
  
  let pos = header.length;
  
  [obj1, obj2, obj3, obj4, obj5].forEach((obj, i) => {
    xrefOffsets.push(pos);
    body += obj;
    pos += obj.length;
  });
  
  const xrefPos = header.length + body.length;
  
  const xref = `xref\n0 6\n0000000000 65535 f \n${xrefOffsets.map(o => o.toString().padStart(10, '0') + ' 00000 n ').join('\n')}\n`;
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  
  writeFileSync(`./public/samples/${filename}`, header + body + xref + trailer, 'utf8');
  console.log(`Created ${filename}`);
}

// Sample 1: Clean standard format
createPDF('HOGAN CARE - STANDARD DEBTOR REPORT', [
  { id: 'D001', name: 'Margaret Thompson', amount: '$2,450.00', due: '01/06/2025', status: 'OVERDUE' },
  { id: 'D002', name: 'Robert Williams', amount: '$890.50', due: '15/06/2025', status: 'DUE SOON' },
  { id: 'D003', name: 'Patricia Anderson', amount: '$0.00', due: '01/05/2025', status: 'CLEARED' },
  { id: 'D004', name: 'James Morrison', amount: '$3,200.00', due: '20/05/2025', status: 'OVERDUE' },
  { id: 'D005', name: 'Susan Clarke', amount: '$1,675.25', due: '30/06/2025', status: 'PENDING' },
  { id: 'D006', name: 'David Harris', amount: '-$999.00', due: '10/06/2025', status: 'ERROR' },
  { id: 'D007', name: 'Linda Watson', amount: '$4,100.00', due: '05/05/2025', status: 'OVERDUE' },
], 'sample-1-standard.pdf');

// Sample 2: Compact format with different columns
createPDF('AGED CARE SERVICES - ACCOUNTS RECEIVABLE Q2 2025', [
  { id: 'AC-2201', name: 'Helen Foster', amount: 'AUD 3,890.00', due: 'Jun 1 2025', status: 'UNPAID' },
  { id: 'AC-2202', name: 'Thomas Baker', amount: 'AUD 0', due: 'May 15 2025', status: 'PAID' },
  { id: 'AC-2203', name: 'Mary Sullivan', amount: 'AUD 720.80', due: 'Jun 30 2025', status: 'UPCOMING' },
  { id: 'AC-2204', name: 'George Campbell', amount: 'AUD -999', due: 'N/A', status: 'DATA ERROR' },
  { id: 'AC-2205', name: 'Elizabeth Moore', amount: 'AUD 5,600.00', due: 'Apr 30 2025', status: 'CRITICAL' },
  { id: 'AC-2206', name: 'Charles Davis', amount: 'AUD 1,200.00', due: 'Jun 10 2025', status: 'UNPAID' },
], 'sample-2-compact.pdf');

// Sample 3: Complex multi-field format
createPDF('NDIS PARTICIPANT BILLING - HOGAN CARE JULY 2025', [
  { id: 'NDIS-HG-001', name: 'Dorothy Jenkins / Guardian: Paul J', amount: '$6,750.00', due: '2025-07-01', status: 'OVERDUE 45d' },
  { id: 'NDIS-HG-002', name: 'Frank Russell / Self-managed', amount: '$0.00', due: '2025-06-15', status: 'PAID IN FULL' },
  { id: 'NDIS-HG-003', name: 'Alice Nguyen / Plan-managed', amount: '$2,300.00', due: '2025-07-30', status: 'FUTURE' },
  { id: 'NDIS-HG-004', name: 'Victor Patel / Agency', amount: '-$999.00', due: 'UNKNOWN', status: 'SYSTEM ERROR' },
  { id: 'NDIS-HG-005', name: 'Edna Collins / Guardian: M.C', amount: '$8,900.00', due: '2025-05-01', status: 'OVERDUE 90d' },
  { id: 'NDIS-HG-006', name: 'Raymond White / Self-managed', amount: '$1,450.50', due: '2025-07-15', status: 'DUE SOON' },
  { id: 'NDIS-HG-007', name: 'Irene Thompson / Plan-managed', amount: '$3,675.00', due: '2025-06-20', status: 'OVERDUE 15d' },
], 'sample-3-ndis.pdf');

console.log('All sample PDFs created!');

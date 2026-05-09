const PDF_HEADER = '%PDF-1.4';

const escapePdfText = (value) =>
  String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, ' ');

export const downloadSimplePdf = ({ filename, title, lines }) => {
  const safeTitle = escapePdfText(title);
  const safeLines = lines.map(escapePdfText);

  const contentLines = [
    'BT',
    '/F1 20 Tf',
    '50 780 Td',
    `(${safeTitle}) Tj`,
    '/F1 11 Tf',
    ...safeLines.flatMap((line, index) => {
      const spacing = index === 0 ? '0 -32 Td' : '0 -18 Td';
      return [spacing, `(${line}) Tj`];
    }),
    'ET',
  ];

  const stream = contentLines.join('\n');

  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
  ];

  let pdf = `${PDF_HEADER}\n`;
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref
0 ${objects.length + 1}
0000000000 65535 f 
`;

  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });

  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>
startxref
${xrefStart}
%%EOF`;

  const blob = new Blob([pdf], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

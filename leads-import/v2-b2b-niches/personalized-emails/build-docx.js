const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  ExternalHyperlink, TableOfContents, PageBreak, BorderStyle,
} = require("docx");

const data = JSON.parse(fs.readFileSync(__dirname + "/leads.json", "utf-8"));

const NICHE_LABELS = {
  sauna: "Sauna Studios",
  pilates: "Pilates Studios",
  run_club: "Run Clubs",
  cold_plunge: "Cold Plunge & Ice Bath",
};

const NICHE_ORDER = ["sauna", "pilates", "run_club", "cold_plunge"];

function fieldLine(label, value, hyperlink) {
  if (!value) return null;
  const children = [new TextRun({ text: label + ": ", bold: true })];
  if (hyperlink) {
    children.push(new ExternalHyperlink({
      children: [new TextRun({ text: value, style: "Hyperlink" })],
      link: hyperlink,
    }));
  } else {
    children.push(new TextRun({ text: value }));
  }
  return new Paragraph({ children, spacing: { after: 60 } });
}

function buildEntry(row, index, total) {
  const paras = [];

  paras.push(new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text: `${row.name}` })],
    spacing: { before: 300, after: 120 },
  }));

  const loc = [row.city, row.country].filter(Boolean).join(", ");
  const f1 = fieldLine("Location", loc);
  if (f1) paras.push(f1);
  const f2 = fieldLine("Email", row.email, "mailto:" + row.email);
  if (f2) paras.push(f2);
  const f3 = fieldLine("Website", row.website, row.website);
  if (f3) paras.push(f3);
  if (row.rating) {
    const f4 = fieldLine("Rating", `${row.rating} (${row.review_count} reviews)`);
    if (f4) paras.push(f4);
  }

  paras.push(new Paragraph({ spacing: { after: 120 }, children: [] }));

  paras.push(new Paragraph({
    children: [new TextRun({ text: "Subject: ", bold: true }), new TextRun({ text: row.subject, italics: true })],
    spacing: { after: 120 },
    shading: { fill: "F2F2F2" },
  }));

  paras.push(new Paragraph({
    children: [new TextRun({ text: "Email body:", bold: true })],
    spacing: { after: 100 },
  }));

  for (const p of row.paragraphs) {
    paras.push(new Paragraph({
      children: [new TextRun({ text: p })],
      spacing: { after: 100 },
      indent: { left: 360 },
    }));
  }

  // divider (border, not dashes)
  paras.push(new Paragraph({
    spacing: { before: 200, after: 0 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC", space: 4 } },
    children: [],
  }));

  return paras;
}

const children = [];

children.push(new Paragraph({
  heading: HeadingLevel.TITLE,
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "Merch Maverick" })],
  spacing: { after: 120 },
}));
children.push(new Paragraph({
  heading: HeadingLevel.HEADING_1,
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "Outreach Batch 1: 1,000 Personalized Emails" })],
  spacing: { after: 400 },
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "Drafts for review. Nothing here has been sent. Use Word's Navigation Pane (View > Navigation Pane) to jump between businesses." })],
  spacing: { after: 600 },
}));

children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-2" }));
children.push(new Paragraph({ children: [new PageBreak()] }));

for (const niche of NICHE_ORDER) {
  const rows = data[niche] || [];
  if (rows.length === 0) continue;
  children.push(new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text: `${NICHE_LABELS[niche]} (${rows.length})` })],
    spacing: { before: 400, after: 200 },
    pageBreakBefore: true,
  }));
  rows.forEach((row, i) => {
    children.push(...buildEntry(row, i, rows.length));
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: "Arial", color: "1A1A1A" },
        paragraph: { spacing: { before: 300, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "2E5E8C" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(__dirname + "/Merch-Maverick-Outreach-Batch1.docx", buffer);
  console.log("Done. Wrote Merch-Maverick-Outreach-Batch1.docx");
});

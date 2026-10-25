import { Document, Packer, Paragraph, TextRun } from 'docx';
import type { RewriteResult } from './types';

function slug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'curriculo';
}

export function fileBase(result: RewriteResult, jobTitle: string): string {
  const name = result.contact[0] ?? 'Curriculo';
  return `${slug(name)}-${slug(jobTitle || 'vaga-ats')}`;
}

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadTxt(result: RewriteResult, jobTitle: string): void {
  const blob = new Blob([result.text], { type: 'text/plain;charset=utf-8' });
  download(blob, `${fileBase(result, jobTitle)}.txt`);
}

export async function downloadDocx(result: RewriteResult, jobTitle: string): Promise<void> {
  const children: Paragraph[] = [];
  const [name, ...contact] = result.contact;

  if (name) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: name.toUpperCase(), bold: true, size: 32, font: 'Arial' })],
        spacing: { after: 80 },
      }),
    );
  }
  if (contact.length) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: contact.join(' · '), size: 20, font: 'Arial' })],
        spacing: { after: 200 },
      }),
    );
  }

  for (const section of result.sections) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: section.title, bold: true, size: 24, font: 'Arial' })],
        spacing: { before: 240, after: 80 },
      }),
    );
    for (const line of section.lines) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `• ${line}`, size: 22, font: 'Arial' })],
          spacing: { after: 40 },
        }),
      );
    }
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Arial', size: 22 } } } },
    sections: [
      {
        properties: {
          page: { margin: { top: 1020, right: 1020, bottom: 1020, left: 1020 } },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  download(blob, `${fileBase(result, jobTitle)}.docx`);
}

export function printPdf(): void {
  window.print();
}

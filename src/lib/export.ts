import { Document, Packer, Paragraph, TextRun } from 'docx';
import { jsPDF } from 'jspdf';
import type { RewriteResult } from './types';

function slug(value: string): string {
  return (
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'curriculo'
  );
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

/** TXT em texto puro, com as seções separadas por linha em branco. */
export function buildTxt(result: RewriteResult): string {
  return result.text;
}

/** DOCX sem tabela e sem cabeçalho, no formato que o ATS extrai na ordem certa. */
export async function buildDocxBlob(result: RewriteResult): Promise<Blob> {
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
        properties: { page: { margin: { top: 1020, right: 1020, bottom: 1020, left: 1020 } } },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

/**
 * PDF real (não é captura de tela): texto vetorial em coluna única, A4,
 * margem de 18 mm, Arial/Helvetica. É o formato que o ATS lê sem embaralhar.
 */
export function buildPdfArrayBuffer(result: RewriteResult): ArrayBuffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const margin = 18;
  const pageBottom = 297 - margin;
  const maxWidth = 210 - margin * 2;
  let y = margin;

  const ensure = (space: number) => {
    if (y + space > pageBottom) {
      doc.addPage();
      y = margin;
    }
  };

  const [name, ...contact] = result.contact;

  if (name) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    ensure(8);
    doc.text(name.toUpperCase(), margin, y);
    y += 6.5;
  }

  if (contact.length) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const contactLines = doc.splitTextToSize(contact.join(' · '), maxWidth) as string[];
    for (const line of contactLines) {
      ensure(5);
      doc.text(line, margin, y);
      y += 4.2;
    }
    y += 3;
  }

  for (const section of result.sections) {
    ensure(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(section.title, margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    for (const item of section.lines) {
      const wrapped = doc.splitTextToSize(`• ${item}`, maxWidth - 3) as string[];
      for (const line of wrapped) {
        ensure(5);
        doc.text(line, margin + 3, y);
        y += 4.4;
      }
      y += 0.9;
    }
    y += 3;
  }

  return doc.output('arraybuffer');
}

export function downloadTxt(result: RewriteResult, jobTitle: string): void {
  download(new Blob([buildTxt(result)], { type: 'text/plain;charset=utf-8' }), `${fileBase(result, jobTitle)}.txt`);
}

export async function downloadDocx(result: RewriteResult, jobTitle: string): Promise<void> {
  const blob = await buildDocxBlob(result);
  download(blob, `${fileBase(result, jobTitle)}.docx`);
}

export function downloadPdf(result: RewriteResult, jobTitle: string): void {
  const buffer = buildPdfArrayBuffer(result);
  download(new Blob([buffer], { type: 'application/pdf' }), `${fileBase(result, jobTitle)}.pdf`);
}

export function printPdf(): void {
  window.print();
}

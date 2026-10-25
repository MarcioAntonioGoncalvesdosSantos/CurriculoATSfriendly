import { Document, Packer, Paragraph, TextRun } from 'docx';
import { jsPDF } from 'jspdf';
import robotoBoldUrl from '../assets/fonts/Roboto-Bold.ttf?url';
import robotoRegularUrl from '../assets/fonts/Roboto-Regular.ttf?url';
import { repairBrokenText } from './repair';
import { sanitizeText } from './text';
import type { RewriteResult } from './types';

export interface PdfFonts {
  regularBase64: string;
  boldBase64: string;
}

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

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary);
}

/**
 * As fontes padrão do PDF só conhecem Latin-1. Quando a Roboto não carrega,
 * qualquer caractere fora dessa faixa viraria "?" no arquivo. Aqui ele é
 * trocado por um equivalente legível antes de chegar ao PDF.
 */
export function toWinAnsiSafe(input: string): string {
  const text = sanitizeText(input)
    .replace(/[\u2018\u2019\u201A\u201B\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u2033]/g, '"')
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[\u2022\u00B7\u25CF]/g, '-')
    .replace(/[\u2192\u21D2]/g, '->')
    .replace(/[\u2212]/g, '-')
    .replace(/[^\x20-\xFF\n]/g, '');
  return text;
}

let fontsRequest: Promise<PdfFonts | null> | null = null;

async function loadRoboto(): Promise<PdfFonts | null> {
  if (!fontsRequest) fontsRequest = fetchRoboto();
  return fontsRequest;
}

async function fetchRoboto(): Promise<PdfFonts | null> {
  try {
    const load = async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`fonte indisponível: ${response.status}`);
      return toBase64(await response.arrayBuffer());
    };
    const [regularBase64, boldBase64] = await Promise.all([load(robotoRegularUrl), load(robotoBoldUrl)]);
    return { regularBase64, boldBase64 };
  } catch {
    return null;
  }
}

/**
 * Informa se a Roboto embutida está disponível. Sem ela o PDF sai com a fonte
 * padrão e os símbolos são convertidos — por isso a tela avisa o usuário.
 */
export async function embeddedFontStatus(options: { retry?: boolean } = {}): Promise<boolean> {
  if (options.retry) fontsRequest = null;
  const fonts = await loadRoboto();
  return fonts !== null;
}

/** Repara caracteres perdidos na origem antes de escrever qualquer arquivo. */
const clean = (value: string): string => repairBrokenText(value).text;

/** TXT em texto puro, com as seções separadas por linha em branco. */
export function buildTxt(result: RewriteResult): string {
  return clean(result.text);
}

/** DOCX sem tabela e sem cabeçalho, no formato que o ATS extrai na ordem certa. */
export async function buildDocxBlob(result: RewriteResult): Promise<Blob> {
  const children: Paragraph[] = [];
  const [rawName, ...rawContact] = result.contact;
  const name = rawName ? clean(rawName) : undefined;
  const contact = rawContact.map((line) => clean(line));

  if (name) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: name.toUpperCase(), bold: true, size: 32, font: 'Roboto' })],
        spacing: { after: 80 },
      }),
    );
  }
  if (contact.length) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: contact.join(' · '), size: 20, font: 'Roboto' })],
        spacing: { after: 200 },
      }),
    );
  }

  for (const section of result.sections) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: clean(section.title), bold: true, size: 24, font: 'Roboto' })],
        spacing: { before: 240, after: 80 },
      }),
    );
    for (const line of section.lines) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `• ${clean(line)}`, size: 22, font: 'Roboto' })],
          spacing: { after: 40 },
        }),
      );
    }
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Roboto', size: 22 } } } },
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
 * margem de 18 mm, Roboto embutida. É o formato que o ATS lê sem embaralhar.
 */
export async function buildPdfArrayBuffer(result: RewriteResult, fonts?: PdfFonts): Promise<ArrayBuffer> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });

  const embedded = fonts ?? (await loadRoboto());
  let family = 'helvetica';
  // Só a fonte embutida desenha qualquer caractere; a padrão precisa de texto seguro.
  const fit = (value: string) => (family === 'Roboto' ? clean(value) : toWinAnsiSafe(clean(value)));
  if (embedded) {
    try {
      doc.addFileToVFS('Roboto-Regular.ttf', embedded.regularBase64);
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
      doc.addFileToVFS('Roboto-Bold.ttf', embedded.boldBase64);
      doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
      family = 'Roboto';
    } catch {
      family = 'helvetica';
    }
  }

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

  const [rawName, ...rawContact] = result.contact;
  const name = rawName ? clean(rawName) : undefined;
  const contact = rawContact.map((line) => clean(line));

  if (name) {
    doc.setFont(family, 'bold');
    doc.setFontSize(14);
    ensure(8);
    doc.text(fit(name.toUpperCase()), margin, y);
    y += 6.5;
  }

  if (contact.length) {
    doc.setFont(family, 'normal');
    doc.setFontSize(9.5);
    const contactLines = doc.splitTextToSize(fit(contact.join(' · ')), maxWidth) as string[];
    for (const line of contactLines) {
      ensure(5);
      doc.text(line, margin, y);
      y += 4.2;
    }
    y += 3;
  }

  for (const section of result.sections) {
    ensure(12);
    doc.setFont(family, 'bold');
    doc.setFontSize(11);
    doc.text(fit(section.title), margin, y);
    y += 5;

    doc.setFont(family, 'normal');
    doc.setFontSize(10.5);
    for (const item of section.lines) {
      const wrapped = doc.splitTextToSize(`• ${fit(item)}`, maxWidth - 3) as string[];
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

export async function downloadPdf(result: RewriteResult, jobTitle: string): Promise<void> {
  const buffer = await buildPdfArrayBuffer(result);
  download(new Blob([buffer], { type: 'application/pdf' }), `${fileBase(result, jobTitle)}.pdf`);
}

export function printPdf(): void {
  window.print();
}

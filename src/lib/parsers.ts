export class ParseError extends Error {
  code: 'scanned' | 'unsupported' | 'size';
  constructor(code: ParseError['code'], message: string) {
    super(message);
    this.code = code;
    this.name = 'ParseError';
  }
}

export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    throw new ParseError('size', 'O arquivo tem mais de 5 MB. Envie uma versão menor ou cole o texto.');
  }

  const name = file.name.toLowerCase();
  const buffer = await file.arrayBuffer();

  if (name.endsWith('.pdf')) {
    const text = await extractPdfText(buffer);
    if (text.replace(/\s/g, '').length < 60) {
      throw new ParseError(
        'scanned',
        'Não conseguimos ler este PDF. Ele parece ser uma imagem digitalizada. Cole o texto ou envie um DOCX.',
      );
    }
    return text;
  }

  if (name.endsWith('.docx')) {
    const { default: mammoth } = await import('mammoth');
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    const text = result.value ?? '';
    if (text.replace(/\s/g, '').length < 30) {
      throw new ParseError('scanned', 'O DOCX não trouxe texto legível. Cole o conteúdo no campo de texto.');
    }
    return text;
  }

  if (name.endsWith('.txt') || name.endsWith('.md')) {
    return new TextDecoder().decode(buffer);
  }

  throw new ParseError('unsupported', 'Formato não suportado. Envie PDF, DOCX ou TXT — ou cole o texto.');
}

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const document = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = content.items as { str?: string; hasEOL?: boolean }[];
    let pageText = '';
    for (const item of items) {
      if (typeof item.str === 'string') {
        pageText += item.str;
        pageText += item.hasEOL ? '\n' : ' ';
      }
    }
    pages.push(pageText.replace(/[ \t]+/g, ' ').trim());
  }

  await document.destroy();
  return pages.join('\n\n');
}

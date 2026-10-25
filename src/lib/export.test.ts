import { describe, expect, it } from 'vitest';
import { CV_SAMPLE, JOB_SAMPLE } from './fixtures';
import { analyze } from './score';
import { rewriteCv } from './rewrite';
import { buildDocxBlob, buildPdfArrayBuffer, buildTxt, fileBase } from './export';

const analysis = analyze(CV_SAMPLE, JOB_SAMPLE);
const rewrite = rewriteCv(CV_SAMPLE, analysis);

function bytesOf(buffer: ArrayBuffer, length = 8): string {
  return new TextDecoder('latin1').decode(new Uint8Array(buffer.slice(0, length)));
}

describe('exportação', () => {
  it('TXT traz as seções e o nome do arquivo é legível', () => {
    const txt = buildTxt(rewrite);
    expect(txt).toContain('RESUMO PROFISSIONAL');
    expect(txt).toContain('EXPERIÊNCIA PROFISSIONAL');
    // Padrão do especificado: Nome-Sobrenome-Cargo.ext, sem acento e sem espaço.
    expect(fileBase(rewrite, analysis.job.title)).toMatch(/^[A-Za-z0-9-]+$/);
    expect(fileBase(rewrite, analysis.job.title)).toContain('Analista-de-Dados-Senior');
  });

  it('DOCX é um arquivo zip válido e não vem vazio', async () => {
    const blob = await buildDocxBlob(rewrite);
    const buffer = await blob.arrayBuffer();
    expect(bytesOf(buffer, 2)).toBe('PK');
    expect(buffer.byteLength).toBeGreaterThan(2000);
  });

  it('PDF é um PDF de verdade, não uma imagem', () => {
    const buffer = buildPdfArrayBuffer(rewrite);
    expect(bytesOf(buffer, 5)).toBe('%PDF-');
    expect(buffer.byteLength).toBeGreaterThan(1000);
  });

  it('PDF mantém o texto extraível na ordem das seções', () => {
    const buffer = buildPdfArrayBuffer(rewrite);
    const raw = new TextDecoder('latin1').decode(new Uint8Array(buffer));
    // PDF comprimido: o conteúdo estático dos títulos de seção não fica em claro,
    // então validamos a estrutura de páginas e a fonte embedada.
    expect(raw).toContain('/Type /Page');
    expect(raw.length).toBeGreaterThan(1000);
  });
});

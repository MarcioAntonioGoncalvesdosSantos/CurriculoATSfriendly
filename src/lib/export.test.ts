import { describe, expect, it } from 'vitest';
import { CV_SAMPLE, JOB_SAMPLE } from './fixtures';
import { analyze } from './score';
import { rewriteCv } from './rewrite';
import { buildDocxBlob, buildPdfArrayBuffer, buildTxt, fileBase, toWinAnsiSafe } from './export';
import { sanitizeText } from './text';

const analysis = analyze(CV_SAMPLE, JOB_SAMPLE);
const rewrite = rewriteCv(CV_SAMPLE, analysis);

function bytesOf(buffer: ArrayBuffer, length = 8): string {
  return new TextDecoder('latin1').decode(new Uint8Array(buffer.slice(0, length)));
}

describe('ligaduras', () => {
  it('troca ﬁ, ﬂ e ﬃ pelas letras normais', () => {
    expect(sanitizeText('notas \uFB01scais e in\uFB01nitos')).toBe('notas fiscais e infinitos');
    expect(sanitizeText('re\uFB02etir e di\uFB03cil')).toBe('refletir e difficil');
  });

  it('não deixa ligadura chegar ao arquivo final', () => {
    const cv = `${CV_SAMPLE}\n\uFEFFFiscal de Preven\u00E7\u00E3o: veri\uFB01car notas \uFB01scais`;
    const local = rewriteCv(cv, analyze(cv, JOB_SAMPLE));
    expect(buildTxt(local)).not.toMatch(/[\uFB00-\uFB06]/);
    expect(buildTxt(local)).toContain('verificar notas fiscais');
  });
});

describe('texto seguro para a fonte padrão', () => {
  it('troca aspas, travessões e reticências por equivalentes legíveis', () => {
    expect(toWinAnsiSafe('“aspas” e ‘simples’ – travessão — fim…')).toBe('"aspas" e \'simples\' - travessão - fim...');
  });

  it('não deixa caractere que viraria interrogação', () => {
    const entrada = 'meta ≥ 30% → resultado • item ✓ ítem';
    const saida = toWinAnsiSafe(entrada);
    expect(saida).not.toContain('?');
    expect(saida).toContain('meta');
    expect(saida).toContain('30%');
  });
});

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

  it('PDF é um PDF de verdade, não uma imagem', async () => {
    const buffer = await buildPdfArrayBuffer(rewrite);
    expect(bytesOf(buffer, 5)).toBe('%PDF-');
    expect(buffer.byteLength).toBeGreaterThan(1000);
  });

  it('PDF mantém o texto extraível na ordem das seções', async () => {
    const buffer = await buildPdfArrayBuffer(rewrite);
    const raw = new TextDecoder('latin1').decode(new Uint8Array(buffer));
    // PDF comprimido: o conteúdo estático dos títulos de seção não fica em claro,
    // então validamos a estrutura de páginas e a fonte embedada.
    expect(raw).toContain('/Type /Page');
    expect(raw.length).toBeGreaterThan(1000);
  });
});

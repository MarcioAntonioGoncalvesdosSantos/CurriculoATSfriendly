import { describe, expect, it } from 'vitest';
import { CV_SAMPLE, JOB_SAMPLE } from './fixtures';
import { extractJob } from './extract-jd';
import { checkFormat } from './format';
import { rewriteCv } from './rewrite';
import { analyze, bandFor, WEIGHTS } from './score';
import { normalize, numbersIn, phraseIn, similarity } from './text';

describe('normalização', () => {
  it('remove acento, caixa e plural simples', () => {
    expect(normalize('Gestão de Pessoas')).toBe('gestao de pessoa');
  });

  it('encontra frases inteiras com fronteira de palavra', () => {
    expect(phraseIn(normalize('Trabalhei com SQL e Power BI'), 'sql')).toBe(true);
    expect(phraseIn(normalize('Trabalhei com MySQL'), 'sql')).toBe(false);
  });

  it('reconhece variações próximas', () => {
    expect(similarity('javascript', 'javascrpt')).toBeGreaterThan(0.88);
  });
});

describe('extração da vaga', () => {
  const job = extractJob(JOB_SAMPLE);

  it('identifica cargo e senioridade', () => {
    expect(job.title).toContain('Analista de Dados');
    expect(job.seniority).toBe('sênior');
  });

  it('separa obrigatórios de desejáveis', () => {
    const sql = job.requirements.find((item) => item.term === 'SQL');
    const azure = job.requirements.find((item) => item.term === 'Azure');
    expect(sql?.obligatoriness).toBe('must_have');
    expect(azure?.obligatoriness).toBe('nice_to_have');
  });

  it('não inventa requisito ausente do texto', () => {
    expect(job.requirements.some((item) => /kubernetes/i.test(item.term))).toBe(false);
  });
});

describe('nota', () => {
  const analysis = analyze(CV_SAMPLE, JOB_SAMPLE);

  it('soma exatamente os pesos dos seis critérios', () => {
    const total = Object.values(WEIGHTS).reduce((sum, value) => sum + value, 0);
    expect(total).toBe(100);
    expect(analysis.criteria).toHaveLength(6);
    expect(analysis.criteria.every((criterion) => criterion.points <= criterion.max)).toBe(true);
    expect(analysis.score).toBe(analysis.criteria.reduce((sum, criterion) => sum + criterion.points, 0));
  });

  it('é determinística', () => {
    const again = analyze(CV_SAMPLE, JOB_SAMPLE);
    expect(again.score).toBe(analysis.score);
    expect(JSON.stringify(again.criteria)).toBe(JSON.stringify(analysis.criteria));
  });

  it('classifica palavras-chave presentes e ausentes', () => {
    const byTerm = new Map(analysis.keywords.map((keyword) => [keyword.term, keyword]));
    expect(byTerm.get('SQL')?.status).toBe('present');
    expect(byTerm.get('Python')?.status).toBe('present');
    expect(byTerm.get('Power BI')?.status).toBe('absent');
  });

  it('dá evidência para todo critério', () => {
    for (const criterion of analysis.criteria) {
      expect(criterion.evidence.length).toBeGreaterThan(0);
    }
  });

  it('acompanha a faixa da nota', () => {
    expect(bandFor(90)).toBe('high');
    expect(bandFor(60)).toBe('mid');
    expect(bandFor(20)).toBe('low');
  });

  it('reprova formato com referências a pedido e barras gráficas', () => {
    const checks = checkFormat(`${CV_SAMPLE}\n\nReferências disponíveis a pedido\nInglês ████`);
    expect(checks.find((check) => check.id === 'referencias')?.passed).toBe(false);
    expect(checks.find((check) => check.id === 'graficos')?.passed).toBe(false);
  });
});

describe('reescrita', () => {
  const analysis = analyze(CV_SAMPLE, JOB_SAMPLE);
  const rewrite = rewriteCv(CV_SAMPLE, analysis);

  it('não inventa número, empresa ou competência', () => {
    // Datas mudam de formato (jan 2020 -> 01/2020), então saem da comparação.
    const semDatas = (value: string) => value.replace(/\b\d{2}\/\d{4}\b/g, ' ');
    const origem = new Set(numbersIn(semDatas(CV_SAMPLE)));
    for (const number of numbersIn(semDatas(rewrite.text))) {
      expect(origem.has(number)).toBe(true);
    }
    expect(rewrite.text.toLowerCase()).not.toContain('power bi');
    expect(rewrite.text).not.toMatch(/nova empresa|empresa inventada/i);
  });

  it('remove a muleta "responsável por"', () => {
    expect(rewrite.text.toLowerCase()).not.toContain('responsável por');
  });

  it('padroniza data por extenso em MM/AAAA', () => {
    expect(rewrite.text).toContain('01/2020');
    expect(rewrite.text).not.toContain('jan 2020');
  });

  it('mantém as seções padrão na ordem e lista pendências', () => {
    const titles = rewrite.sections.map((section) => section.title);
    expect(titles[0]).toBe('RESUMO PROFISSIONAL');
    expect(titles[1]).toBe('EXPERIÊNCIA PROFISSIONAL');
    expect(rewrite.pendencies.length).toBeGreaterThan(0);
  });
});

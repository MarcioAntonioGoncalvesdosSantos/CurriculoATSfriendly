import { splitSections } from './sections';
import { lines, stripBullet, wordCount } from './text';
import type { FormatCheck } from './types';

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/;
const PHONE = /(\+?55\s?)?(\(?\d{2}\)?[\s.-]?)?\d{4,5}[\s.-]?\d{4}/;
const DATE_MM_YYYY = /(0?[1-9]|1[0-2])\/(19|20)\d{2}/g;
const GRAPHIC = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2500}-\u{25FF}\u{2B00}-\u{2BFF}]/u;
const REFERENCES = /refer[eê]ncias?\s*(dispon[ií]ve(is)?|a\s*pedido)/i;

function yearSequence(text: string): number[] {
  const years: number[] = [];
  for (const line of lines(text)) {
    if (!/\d{4}/.test(line)) continue;
    const found = [...line.matchAll(/\b(19[7-9]\d|20[0-3]\d)\b/g)].map((match) => Number(match[0]));
    if (found.length) years.push(found[found.length - 1]);
  }
  return years;
}

export function isChronologicalDescending(text: string): boolean {
  const seq = yearSequence(text);
  if (seq.length < 2) return true;
  return seq.every((year, index) => index === 0 || seq[index - 1] >= year);
}

export function checkFormat(cvText: string): FormatCheck[] {
  const text = cvText.trim();
  const allLines = lines(text);
  const checks: FormatCheck[] = [];

  checks.push({
    id: 'legivel',
    label: 'Texto legível por máquina',
    passed: text.length >= 200,
    detail:
      text.length >= 200
        ? 'O texto foi extraído corretamente.'
        : 'O conteúdo extraído é curto demais. Se o arquivo for digitalizado, o ATS não lê nada.',
  });

  const hasEmail = EMAIL.test(text);
  const hasPhone = PHONE.test(text);
  checks.push({
    id: 'contato',
    label: 'Contato no corpo do documento',
    passed: hasEmail && hasPhone,
    detail: hasEmail && hasPhone ? 'E-mail e telefone encontrados.' : `Falta ${!hasEmail ? 'e-mail' : 'telefone'}.`,
  });

  const suspiciousColumns = allLines.filter((line) => /\t/.test(line) || /\s{3,}\S/.test(line));
  const columnRatio = allLines.length ? suspiciousColumns.length / allLines.length : 0;
  checks.push({
    id: 'colunas',
    label: 'Sem indício de colunas ou tabelas',
    passed: columnRatio < 0.15,
    detail:
      columnRatio < 0.15
        ? 'Nenhuma estrutura de duas colunas detectada.'
        : `${Math.round(columnRatio * 100)}% das linhas têm espaçamento de tabela — risco de leitura embaralhada.`,
  });

  const dates = text.match(DATE_MM_YYYY) ?? [];
  checks.push({
    id: 'datas',
    label: 'Datas no padrão MM/AAAA',
    passed: dates.length >= 2,
    detail: dates.length >= 2 ? `${dates.length} datas no padrão.` : 'Use MM/AAAA em todos os períodos.',
  });

  checks.push({
    id: 'ordem',
    label: 'Ordem cronológica inversa',
    passed: isChronologicalDescending(text),
    detail: isChronologicalDescending(text)
      ? 'Do mais recente para o mais antigo.'
      : 'Algum período aparece fora de ordem — comece pelo mais recente.',
  });

  const { sections } = splitSections(text);
  const standardSections = sections.filter((section) =>
    ['resumo', 'experiencia', 'formacao', 'habilidades', 'idiomas', 'certificacoes'].includes(section.id),
  ).length;
  checks.push({
    id: 'secoes',
    label: 'Títulos de seção reconhecíveis',
    passed: standardSections >= 3,
    detail: `${standardSections} seção(ões) com nome padrão.`,
  });

  checks.push({
    id: 'referencias',
    label: 'Sem "referências a pedido"',
    passed: !REFERENCES.test(text),
    detail: REFERENCES.test(text)
      ? 'Essa linha ocupa espaço e não é lida como conteúdo.'
      : 'Nenhuma menção a referências a pedido.',
  });

  checks.push({
    id: 'graficos',
    label: 'Sem emojis ou barras gráficas',
    passed: !GRAPHIC.test(text),
    detail: GRAPHIC.test(text)
      ? 'Ícones e barras viram caracteres estranhos na extração.'
      : 'Nenhum caractere gráfico encontrado.',
  });

  const words = wordCount(text);
  checks.push({
    id: 'tamanho',
    label: 'Extensão de 1 a 2 páginas',
    passed: words >= 250 && words <= 900,
    detail: `${words} palavras.`,
  });

  const stuffed = allLines.filter((line) => {
    const bare = stripBullet(line);
    const commas = (bare.match(/,/g) ?? []).length;
    return commas >= 10 && bare.split(/\s+/).length > 18;
  });
  checks.push({
    id: 'empilhamento',
    label: 'Sem empilhamento de palavras-chave',
    passed: stuffed.length === 0,
    detail: stuffed.length
      ? 'Há linhas com listas longas de termos — o ATS pode tratar como ruído.'
      : 'Nenhuma linha com excesso de termos soltos.',
  });

  return checks;
}

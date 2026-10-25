import { sanitizeText } from './text';

export interface RepairFix {
  before: string;
  after: string;
}

export interface RepairResult {
  text: string;
  fixes: RepairFix[];
}

const REPLACEMENTS = ['\uFFFD', 'ÿý', 'ÿ', 'ý'];

/**
 * Alguns PDFs têm a camada de texto quebrada: a ligadura "fi" (e às vezes "fl")
 * chega como "?", "ÿý" ou U+FFFD no meio da palavra. A letra não existe mais no
 * arquivo, então repõe-se "fi", que é a ligadura mais comum em português, e cada
 * troca é registrada para o usuário conferir.
 */
export function repairBrokenText(input: string): RepairResult {
  const text = sanitizeText(input);
  const fixes: RepairFix[] = [];
  const registro = (prefixo: string, sufixo: string) => {
    fixes.push({ before: `${prefixo}`, after: `${prefixo}fi${sufixo.slice(0, 4)}` });
  };

  // 1. Mojibake da ligadura cercado por letras ou por espaço + letras.
  let repaired = text.replace(
    new RegExp(`(\\p{L}{0,14})\\s*(?:${REPLACEMENTS.map(escape).join('|')})\\s*`, 'gu'),
    (match, prefixo: string) => {
      registro(prefixo, match);
      return `${prefixo}fi`;
    },
  );

  // 2. Interrogação colada em letras — nunca é pontuação legítima.
  //    "SQL? Ótimo" fica intacto porque a interrogação é seguida de espaço.
  repaired = repaired.replace(/(\p{L}{0,14})\?(?=\p{L})/gu, (match, prefixo: string) => {
    registro(prefixo, match);
    return `${prefixo}fi`;
  });

  // 3. Sobras soltas viram espaço, para não poluir o arquivo final.
  repaired = repaired.replace(/\uFFFD/g, ' ').replace(/ÿý/g, ' ');

  return { text: repaired, fixes };
}

/** Quantos trechos ilegíveis existem, sem alterar o texto. */
export function countBroken(input: string): number {
  const matches = input.match(/(\p{L})\s*(?:\?|\uFFFD|ÿý)\s*(?=\p{L})/gu);
  return matches ? matches.length : 0;
}

function escape(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

import { splitSections } from './sections';
import { hasDigits, normalize, sanitizeText, stripBullet } from './text';
import type { Analysis, Change, CvSection, RewriteResult } from './types';

const MONTHS: Record<string, string> = {
  jan: '01', janeiro: '01', feb: '02', fev: '02', fevereiro: '02', mar: '03', março: '03', marco: '03',
  apr: '04', abr: '04', abril: '04', may: '05', mai: '05', maio: '05', jun: '06', junho: '06',
  jul: '07', julho: '07', aug: '08', ago: '08', agosto: '08', sep: '09', set: '09', setembro: '09',
  oct: '10', out: '10', outubro: '10', nov: '11', novembro: '11', dec: '12', dez: '12', dezembro: '12',
};

const ORDER = ['resumo', 'experiencia', 'formacao', 'habilidades', 'idiomas', 'certificacoes', 'realizacoes', 'projetos'];

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/;
const PHONE = /(\+?55\s?)?(\(?\d{2}\)?[\s.-]?)?\d{4,5}[\s.-]?\d{4}/;

function normalizeDate(line: string): string {
  let result = line;
  result = result.replace(/\b(19|20)(\d{2})[-/](\d{1,2})\b/g, (_, year, rest, month) => {
    return `${String(month).padStart(2, '0')}/${year}${rest}`;
  });
  result = result.replace(
    /\b(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez|janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|feb|apr|may|aug|sep|oct|dec)\.?\s*(?:de\s*)?(19|20)(\d{2})\b/gi,
    (match, month: string, century: string, rest: string) => {
      const key = normalize(month);
      const numeric = MONTHS[key];
      return numeric ? `${numeric}/${century}${rest}` : match;
    },
  );
  return result;
}

function cleanLine(raw: string): { text: string; change?: Change } {
  const before = stripBullet(raw).replace(/\s+/g, ' ').trim();
  let text = before;

  // "Responsável por ..." esconde o resultado: mantém o fato, remove a muleta.
  const filler = text.match(/^respons[aá]vel\s+por\s+(.*)$/i);
  if (filler?.[1]) {
    text = filler[1].charAt(0).toUpperCase() + filler[1].slice(1);
  }

  const withDate = normalizeDate(text);
  const dateChange = withDate !== text;
  text = withDate;

  text = text.replace(/\s*\.\s*$/, '');
  if (text) text = text.charAt(0).toUpperCase() + text.slice(1);

  if (filler) {
    return {
      text,
      change: {
        type: 'normalized',
        before,
        after: text,
        reason: 'Removeu "responsável por" — o ATS e o recrutador procuram o resultado, não a atribuição.',
      },
    };
  }
  if (dateChange) {
    return {
      text,
      change: { type: 'normalized', before, after: text, reason: 'Data padronizada em MM/AAAA.' },
    };
  }
  return { text };
}

/**
 * Currículos exportados de PDF chegam com a frase quebrada em várias linhas:
 * só a primeira começa com marcador. As demais são continuação do mesmo item.
 */
function joinWrappedLines(rawLines: string[]): string[] {
  const result: string[] = [];
  for (const raw of rawLines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const isItem = /^[•▪●◦*–—-]/.test(trimmed);
    const previous = result[result.length - 1];
    const previousIsItem = previous ? /^[•▪●◦*–—-]/.test(previous) : false;
    if (!isItem && previousIsItem) {
      const joiner = /[-–—]$/.test(previous) ? '' : ' ';
      result[result.length - 1] = `${previous}${joiner}${trimmed}`;
      continue;
    }
    result.push(trimmed);
  }
  return result;
}

function dedupe(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const key = normalize(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function isContactLine(line: string): boolean {
  return EMAIL.test(line) || PHONE.test(line) || /linkedin|github\.com|https?:\/\//i.test(line);
}

export function rewriteCv(cvText: string, analysis: Analysis): RewriteResult {
  const { header, sections } = splitSections(sanitizeText(cvText));
  const changes: Change[] = [];
  const pendencies: string[] = [];

  const contact: string[] = [];
  let name = '';
  for (const line of header) {
    if (!name && !isContactLine(line) && line.length <= 60) {
      name = line.replace(/\s+/g, ' ').trim();
      continue;
    }
    const { text, change } = cleanLine(line);
    if (change) changes.push(change);
    if (text) contact.push(text);
  }

  const rewritten: CvSection[] = sections.map((section) => {
    const cleaned = joinWrappedLines(section.lines)
      .map((line) => cleanLine(line))
      .map((item) => {
        if (item.change) changes.push(item.change);
        return item.text;
      })
      .filter(Boolean);

    let lines = dedupe(cleaned);

    if (section.id === 'habilidades') {
      // Reordena as habilidades já existentes para colocar as da vaga na frente.
      const present = new Set(
        analysis.keywords.filter((keyword) => keyword.status === 'present').map((keyword) => normalize(keyword.term)),
      );
      const score = (line: string) => {
        const tokens = normalize(line).split(' ');
        return tokens.some((token) => present.has(token)) ? 1 : 0;
      };
      const sorted = [...lines].sort((a, b) => score(b) - score(a));
      if (sorted.join('|') !== lines.join('|')) {
        changes.push({
          type: 'moved',
          before: lines.join(' · '),
          after: sorted.join(' · '),
          reason: 'Competências que a vaga pede foram para o começo da lista.',
        });
      }
      lines = sorted;
    }

    const title = section.title.toUpperCase();
    if (section.raw.toUpperCase().replace(/[:.]+$/, '') !== title) {
      changes.push({
        type: 'normalized',
        before: section.raw,
        after: title,
        reason: 'Título padronizado no nome que o ATS reconhece.',
      });
    }

    return { id: section.id, title, lines };
  });

  // O currículo pode repetir o mesmo título (RESUMO e OBJETIVO, por exemplo).
  // Duas seções com o mesmo nome viram uma só, sem perder nenhuma linha.
  const merged: CvSection[] = [];
  for (const section of rewritten) {
    const existing = merged.find((item) => item.id === section.id);
    if (!existing) {
      merged.push({ ...section, lines: [...section.lines] });
      continue;
    }
    existing.lines = dedupe([...existing.lines, ...section.lines]);
    changes.push({
      type: 'moved',
      before: `${section.title} (repetida)`,
      after: section.title,
      reason: 'Duas seções com o mesmo título foram unidas em uma só.',
    });
  }

  const ordered = [...merged].sort((a, b) => {
    const indexA = ORDER.findIndex((id) => a.id.startsWith(id));
    const indexB = ORDER.findIndex((id) => b.id.startsWith(id));
    return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
  });
  if (ordered.map((section) => section.id).join('|') !== merged.map((section) => section.id).join('|')) {
    changes.push({
      type: 'moved',
      before: merged.map((section) => section.title).join(' → '),
      after: ordered.map((section) => section.title).join(' → '),
      reason: 'Seções na ordem que o ATS espera.',
    });
  }

  const experience = ordered.find((section) => section.id === 'experiencia');
  if (experience) {
    const withoutMetric = experience.lines.filter((line) => !hasDigits(line) && !/%|r\$/i.test(line));
    for (const line of withoutMetric.slice(0, 5)) {
      pendencies.push(
        `Sem número: "${line.slice(0, 90)}" — acrescente um resultado (%, R$, tempo ou volume). Não inventamos esse dado por você.`,
      );
    }
  }

  for (const keyword of analysis.keywords.filter((item) => item.status === 'absent').slice(0, 8)) {
    pendencies.push(
      `Lacuna: "${keyword.term}" aparece na vaga e não no seu currículo. Se você tem essa experiência, escreva a evidência — o app não insere sozinho.`,
    );
  }

  const textLines: string[] = [];
  if (name) textLines.push(name.toUpperCase());
  if (contact.length) textLines.push(contact.join(' · '));
  for (const section of ordered) {
    textLines.push('');
    textLines.push(section.title);
    textLines.push(...section.lines.map((line) => `• ${line}`));
  }

  return {
    sections: ordered,
    contact: name ? [name, ...contact] : contact,
    changes,
    pendencies,
    text: textLines.join('\n').trim(),
  };
}

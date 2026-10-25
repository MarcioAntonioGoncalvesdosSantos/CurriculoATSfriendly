import { TAXONOMY, typeForTerm } from './taxonomy';
import { lines, normalize, phraseIn, stripBullet } from './text';
import type { JobDescription, Obligatoriness, Requirement } from './types';

const MUST_SECTION = /^(requisitos|requisito|qualifica|o que esperamos|o que buscamos|voc[eê] precisa|necess[aá]rio|must have|required|perfil da vaga|perfil desejado)/;
const NICE_SECTION = /^(desej|diferenc|plus|nice to have|preferred|seria um diferencial|n[aã]o obrigat)/;
const RESP_SECTION = /^(responsabilidades|atribui|o que voc[eê] vai fazer|atividades|activities|desafios)/;
const OTHER_SECTION = /^(benef[ií]cios|oferecemos|sobre a empresa|sobre n[oó]s|informa[cç][oõ]es|localiza|modelo de trabalho|jornada)/;

const NICE_CUE = /(desej|diferencial|plus|nice to have|preferred|seria interessante|n[aã]o [eé] obrigat)/;

const STOPWORDS = new Set(
  `a o as os um uma uns umas de da do das dos em na no nas nos para por com sem sobre entre
   e ou mas que se ao aos à às pelo pela pelos pelas seu sua seus suas este esta esse essa
   ser ter haver ser fazer como mais menos muito pouco bem mal não sim também já ainda
   você voce vocês nos nós eu ele ela eles elas nosso nossa
   the a an and or of to in on for with without about at by from is are be will
   experience experiences skills knowledge ability strong good excellent work team`
    .split(/\s+/)
    .filter(Boolean),
);

function sectionModeForLine(line: string): Obligatoriness | 'resp' | 'other' | null {
  const bare = stripBullet(line).replace(/[:]+$/, '');
  if (bare.length > 60) return null;
  const n = normalize(bare).toLowerCase();
  if (MUST_SECTION.test(n)) return 'must_have';
  if (NICE_SECTION.test(n)) return 'nice_to_have';
  if (RESP_SECTION.test(n)) return 'resp';
  if (OTHER_SECTION.test(n)) return 'other';
  return null;
}

function taxonomyMatches(line: string): { term: string; type: ReturnType<typeof typeForTerm> }[] {
  const lineNorm = normalize(line);
  const found: { term: string; type: ReturnType<typeof typeForTerm> }[] = [];
  for (const entry of TAXONOMY) {
    const candidates = [entry.term, ...(entry.aliases ?? [])];
    if (candidates.some((candidate) => phraseIn(lineNorm, candidate))) {
      found.push({ term: entry.term, type: entry.type });
    }
  }
  return found;
}

/**
 * Quando nenhum termo do dicionário aparece, tenta extrair o trecho de
 * competência depois de conectores típicos ("experiência com X", "domínio de Y").
 */
function fallbackPhrase(line: string): string | null {
  const cleaned = stripBullet(line)
    .replace(/^[-–—]\s*/, '')
    .replace(/\(.*?\)/g, ' ')
    .trim();
  if (cleaned.length < 4) return null;
  const connector = /(?:experi[eê]ncia (?:com|em|de)|conhecimento (?:em|de)|dom[ií]nio (?:de|em)|viv[eê]ncia (?:com|em)|familiaridade (?:com|em)|handling|proficiency (?:in|with)|experience (?:with|in))\s+/i;
  const after = cleaned.split(connector).pop() ?? cleaned;
  const segment = after
    .split(/[,;:().]|\s+(?:e|ou|para|com objetivo)\s+/i)[0]
    .trim();
  const words = segment.split(/\s+/).filter((word) => {
    const n = normalize(word);
    return n.length > 2 && !STOPWORDS.has(n) && !/^\d+$/.test(n);
  });
  if (!words.length) return null;
  return words.slice(0, 4).join(' ');
}

function detectTitle(jobLines: string[]): string {
  const explicit = jobLines
    .map((line) => line.match(/(?:vaga|posi[cç][aã]o|cargo)\s*(?:para|de|:|-)\s*(.{3,70})/i))
    .find(Boolean);
  if (explicit?.[1]) return explicit[1].replace(/[.,;]$/, '').trim();
  const firstShort = jobLines.find((line) => line.length >= 4 && line.length <= 70 && !/[:@]/.test(line));
  return firstShort?.trim() ?? '';
}

function detectSeniority(text: string): string {
  const n = normalize(text);
  const ordered: { label: string; pattern: RegExp }[] = [
    { label: 'estágio', pattern: /\bestagio\b|\bestagiario\b|\bintern(ship)?\b/ },
    { label: 'júnior', pattern: /\bjunior\b|\bjr\b/ },
    { label: 'pleno', pattern: /\bpleno\b|\bpl\b/ },
    { label: 'sênior', pattern: /\bsenior\b|\bsr\b/ },
    { label: 'especialista', pattern: /\bespecialista\b|\bspecialist\b|\bstaff\b/ },
    { label: 'coordenação', pattern: /\bcoordenador\b|\bcoordenacao\b|\blead\b|\blider\b/ },
    { label: 'gerência', pattern: /\bgerente\b|\bgerencia\b|\bmanager\b|\bdiretor\b|\bdirector\b/ },
  ];
  for (const item of ordered) if (item.pattern.test(n)) return item.label;
  return '';
}

export function extractJob(jobText: string): JobDescription {
  const jobLines = lines(jobText);
  const jobNorm = normalize(jobText);
  const found = new Map<string, Requirement>();
  const responsibilities: string[] = [];
  // Vaga curta, sem títulos de seção: tudo é lido como requisito.
  // Vaga longa com seções: o texto antes do primeiro título é apresentação da empresa.
  const hasSections = jobLines.some((line) => sectionModeForLine(line) !== null);
  let mode: Obligatoriness | 'resp' | 'other' = hasSections ? 'other' : 'must_have';

  for (const line of jobLines) {
    const detected = sectionModeForLine(line);
    if (detected) {
      mode = detected;
      continue;
    }
    if (mode === 'other') continue;

    const bare = stripBullet(line);
    if (bare.length < 3) continue;
    if (mode === 'resp') {
      if (bare.length > 20) responsibilities.push(bare);
      continue;
    }

    const obligatoriness: Obligatoriness =
      NICE_CUE.test(bare) || mode === 'nice_to_have' ? 'nice_to_have' : 'must_have';

    const matches = taxonomyMatches(bare);
    const terms = matches.length ? matches.map((match) => match.term) : [fallbackPhrase(bare)].filter(Boolean) as string[];

    for (const term of terms) {
      const key = normalize(term);
      const existing = found.get(key);
      if (existing) {
        // Requisito que aparece em bloco obrigatório sobe para must_have.
        if (obligatoriness === 'must_have') existing.obligatoriness = 'must_have';
        continue;
      }
      found.set(key, {
        term,
        type: matches.find((match) => match.term === term)?.type ?? typeForTerm(term),
        obligatoriness,
        evidence: bare.length > 160 ? `${bare.slice(0, 157)}…` : bare,
      });
    }
  }

  // Termos do dicionário citados no texto mas fora dos blocos de requisito.
  for (const entry of TAXONOMY) {
    const key = normalize(entry.term);
    if (found.has(key)) continue;
    const mentioned = [entry.term, ...(entry.aliases ?? [])].some((candidate) => phraseIn(jobNorm, candidate));
    if (!mentioned) continue;
    found.set(key, {
      term: entry.term,
      type: entry.type,
      obligatoriness: 'nice_to_have',
      evidence: 'Citado na descrição da vaga',
    });
  }

  const requirements = [...found.values()].map((requirement) => {
    const repeated =
      jobNorm.split(' ').length > 0 && occurrenceCount(jobNorm, requirement.term) >= 2;
    return repeated && requirement.obligatoriness === 'nice_to_have'
      ? { ...requirement, obligatoriness: 'must_have' as Obligatoriness }
      : requirement;
  });

  requirements.sort((a, b) => {
    if (a.obligatoriness !== b.obligatoriness) return a.obligatoriness === 'must_have' ? -1 : 1;
    return a.term.localeCompare(b.term, 'pt-BR');
  });

  return {
    title: detectTitle(jobLines),
    seniority: detectSeniority(`${detectTitle(jobLines)} ${jobText.slice(0, 400)}`),
    requirements,
    responsibilities: responsibilities.slice(0, 12),
  };
}

function occurrenceCount(haystackNorm: string, needle: string): number {
  const n = normalize(needle);
  if (!n) return 0;
  const pattern = new RegExp(`(^| )${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}( |$)`, 'gi');
  return (haystackNorm.match(pattern) ?? []).length;
}

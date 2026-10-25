import { lines, normalize } from './text';

export interface DetectedSection {
  id: string;
  title: string;
  raw: string;
  lines: string[];
}

export interface SplitResult {
  header: string[];
  sections: DetectedSection[];
}

/**
 * Chaves comparadas por igualdade com o texto normalizado (sem acento, sem
 * plural). Comparar por igualdade evita que "Realizar separação de produtos"
 * seja confundido com a seção "Realizações".
 */
const CANONICAL: { id: string; title: string; keys: string[] }[] = [
  {
    id: 'resumo',
    title: 'Resumo Profissional',
    keys: ['resumo', 'resumo profissional', 'objetivo', 'objetivo profissional', 'sobre mim', 'perfil', 'perfil profissional', 'summary', 'profile'],
  },
  {
    id: 'experiencia',
    title: 'Experiência Profissional',
    keys: ['experiência', 'experiencia profissional', 'histórico profissional', 'professional experience', 'experience'],
  },
  { id: 'formacao', title: 'Formação Acadêmica', keys: ['formação', 'formação acadêmica', 'educação', 'escolaridade', 'education', 'academic background'] },
  {
    id: 'habilidades',
    title: 'Habilidades',
    keys: ['habilidades', 'habilidade', 'competências', 'competências técnicas', 'conhecimentos', 'habilidades e competências', 'skills', 'qualificações técnicas'],
  },
  { id: 'idiomas', title: 'Idiomas', keys: ['idiomas', 'idioma', 'languages', 'language'] },
  { id: 'certificacoes', title: 'Certificações', keys: ['certificações', 'certificados', 'certificações e cursos', 'cursos', 'licenças', 'certifications'] },
  { id: 'projetos', title: 'Projetos', keys: ['projetos', 'portfólio', 'projects', 'portfolio'] },
  { id: 'realizacoes', title: 'Realizações', keys: ['realizações', 'conquistas', 'achievements'] },
];

function canonicalFor(line: string): { id: string; title: string } | null {
  const bare = line.replace(/[:\u2022\-–—]/g, ' ').replace(/\s+/g, ' ').trim();
  const normalized = normalize(bare);
  for (const item of CANONICAL) {
    if (item.keys.some((key) => normalize(key) === normalized)) {
      return { id: item.id, title: item.title };
    }
  }
  return null;
}

function looksLikeHeading(line: string): boolean {
  const bare = line.trim();
  if (bare.length === 0 || bare.length > 48) return false;
  if (/[.;,]$/.test(bare)) return false;
  if (/@|https?:\/\/|www\./i.test(bare)) return false;
  if (/^\+?\d[\d\s()-]{7,}$/.test(bare)) return false;
  const words = bare.split(/\s+/).filter(Boolean);
  if (words.length > 5) return false;
  // "SQL" é competência, não título; um título desconhecido tem mais corpo.
  if (words.length < 2 && bare.length < 8) return false;
  return bare === bare.toUpperCase() && /[A-ZÀ-Ú]/.test(bare);
}

export function splitSections(text: string): SplitResult {
  const all = lines(text);
  const header: string[] = [];
  const sections: DetectedSection[] = [];
  let current: DetectedSection | null = null;

  for (const line of all) {
    const canonical = canonicalFor(line);
    // A primeira linha costuma ser o nome em caixa alta — não é título de seção.
    const isFirstLine = sections.length === 0 && header.length === 0;
    const isHeading = canonical !== null || (!isFirstLine && looksLikeHeading(line));

    if (isHeading) {
      current = {
        id: canonical?.id ?? `custom-${normalize(line).slice(0, 24)}`,
        title: canonical?.title ?? line.trim(),
        raw: line.trim(),
        lines: [],
      };
      sections.push(current);
      continue;
    }
    if (current) current.lines.push(line);
    else header.push(line);
  }

  return { header, sections };
}

/** Seções padrão ausentes no currículo. */
export function missingSections(text: string): string[] {
  const { sections, header } = splitSections(text);
  const present = new Set(sections.map((section) => section.id));
  const missing: string[] = [];
  for (const id of ['resumo', 'experiencia', 'formacao', 'habilidades']) {
    if (!present.has(id)) missing.push(CANONICAL.find((item) => item.id === id)!.title);
  }
  if (header.length < 2) missing.push('Contato no corpo do documento');
  return missing;
}

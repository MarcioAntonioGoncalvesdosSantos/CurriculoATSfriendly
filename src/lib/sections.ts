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

const CANONICAL: { id: string; title: string; pattern: RegExp }[] = [
  { id: 'resumo', title: 'Resumo Profissional', pattern: /^(resumo|objetivo|sobre mim|perfil profissional|perfil|summary|profile)/ },
  { id: 'experiencia', title: 'Experiência Profissional', pattern: /^(experi[eê]ncia|historico profissional|histórico profissional|experiencia profissional|professional experience|experience)/ },
  { id: 'formacao', title: 'Formação Acadêmica', pattern: /^(forma[cç][aã]o|educa[cç][aã]o|escolaridade|education|academic)/ },
  { id: 'habilidades', title: 'Habilidades', pattern: /^(habilidades|compet[eê]ncias|conhecimentos|skills|qualifica[cç][oõ]es t[eé]cnicas)/ },
  { id: 'idiomas', title: 'Idiomas', pattern: /^(idiomas|languages|language)/ },
  { id: 'certificacoes', title: 'Certificações', pattern: /^(certifica[cç][oõ]es|certificados|cursos|certifications|licen[cç]as)/ },
  { id: 'projetos', title: 'Projetos', pattern: /^(projetos|projects|portf[oó]lio)/ },
  { id: 'realizacoes', title: 'Realizações', pattern: /^(realiza[cç][oõ]es|conquistas|achievements)/ },
];

function canonicalFor(line: string): { id: string; title: string } | null {
  const bare = line.replace(/[:\u2022\-–—]/g, ' ').trim();
  const n = normalize(bare).toLowerCase();
  for (const item of CANONICAL) {
    if (item.pattern.test(n)) return { id: item.id, title: item.title };
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
  const isUpper = bare === bare.toUpperCase() && /[A-ZÀ-Ú]/.test(bare);
  return isUpper || canonicalFor(bare) !== null;
}

export function splitSections(text: string): SplitResult {
  const all = lines(text);
  const header: string[] = [];
  const sections: DetectedSection[] = [];
  let current: DetectedSection | null = null;

  for (const line of all) {
    if (looksLikeHeading(line)) {
      const canonical = canonicalFor(line);
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

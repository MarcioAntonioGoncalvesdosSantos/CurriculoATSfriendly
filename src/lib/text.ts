/** Utilidades puras de texto. Toda comparação do motor passa por aqui. */

export function stripAccents(input: string): string {
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Reduz um termo para comparação: sem acento, minúsculo, sem pontuação, sem plural simples. */
export function stem(word: string): string {
  const w = word.trim();
  if (w.length > 4 && w.endsWith('s') && !/ss$|us$|is$/.test(w)) return w.slice(0, -1);
  return w;
}

export function normalize(input: string): string {
  return stripAccents(input)
    .toLowerCase()
    .replace(/[^a-z0-9+#./-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(stem)
    .join(' ')
    .trim();
}

export function tokens(input: string): string[] {
  const n = normalize(input);
  return n ? n.split(' ') : [];
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** O termo aparece como palavra/frase inteira no texto já normalizado. */
export function phraseIn(haystackNorm: string, needle: string): boolean {
  const n = normalize(needle);
  if (!n) return false;
  const pattern = new RegExp(`(^| )${escapeRegex(n)}( |$)`, 'i');
  return pattern.test(haystackNorm);
}

export function countPhrase(haystackNorm: string, needle: string): number {
  const n = normalize(needle);
  if (!n) return 0;
  const pattern = new RegExp(`(^| )${escapeRegex(n)}( |$)`, 'gi');
  return (haystackNorm.match(pattern) ?? []).length;
}

/** Semelhança 0..1 baseada em distância de Levenshtein. */
export function similarity(a: string, b: string): number {
  const s = normalize(a);
  const t = normalize(b);
  if (s === t) return 1;
  if (!s.length || !t.length) return 0;
  const rows = s.length + 1;
  const cols = t.length + 1;
  const dist: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i++) dist[i][0] = i;
  for (let j = 0; j < cols; j++) dist[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      dist[i][j] = Math.min(dist[i - 1][j] + 1, dist[i][j - 1] + 1, dist[i - 1][j - 1] + cost);
    }
  }
  return 1 - dist[rows - 1][cols - 1] / Math.max(s.length, t.length);
}

export function lines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+$/g, '').replace(/^\s+/, ''))
    .filter((line) => line.length > 0);
}

const BULLET_PREFIX = /^[•▪●◦\-*–—]\s*/;

export function stripBullet(line: string): string {
  return line.replace(BULLET_PREFIX, '').trim();
}

/** Linhas que parecem itens de experiência (não contato, não cabeçalho curto). */
export function bulletLines(text: string): string[] {
  return lines(text).filter((line) => {
    const bare = stripBullet(line);
    if (bare.length < 30) return false;
    if (/@|https?:\/\/|www\./i.test(bare)) return false;
    if (/^\+?\d[\d\s()-]{7,}$/.test(bare)) return false;
    return true;
  });
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function hasDigits(text: string): boolean {
  return /\d/.test(text);
}

/** Todos os números presentes em um texto, para o teste anti-alucinação. */
export function numbersIn(text: string): string[] {
  return (text.match(/\d+/g) ?? []).sort();
}

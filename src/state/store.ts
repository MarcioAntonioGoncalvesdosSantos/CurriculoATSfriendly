import type { Analysis, Draft, RewriteResult } from '../lib/types';

export interface StoredAnalysis {
  id: string;
  createdAt: string;
  cvText: string;
  jobText: string;
  analysis: Analysis;
  rewrite: RewriteResult;
  scoreAfter: number;
}

const ANALYSIS_KEY = 'radar-ats:analyses';
const DRAFT_KEY = 'radar-ats:draft';

function readAll(): Record<string, StoredAnalysis> {
  try {
    const raw = sessionStorage.getItem(ANALYSIS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, StoredAnalysis>) : {};
  } catch {
    return {};
  }
}

export function saveAnalysis(record: Omit<StoredAnalysis, 'id' | 'createdAt'>): StoredAnalysis {
  const id = Math.random().toString(36).slice(2, 10);
  const stored: StoredAnalysis = { ...record, id, createdAt: new Date().toISOString() };
  const all = readAll();
  all[id] = stored;
  try {
    sessionStorage.setItem(ANALYSIS_KEY, JSON.stringify(all));
  } catch {
    // Sessão cheia: mantém em memória apenas.
  }
  return stored;
}

export function getAnalysis(id: string): StoredAnalysis | null {
  return readAll()[id] ?? null;
}

export function readDraft(): Draft {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : { cvText: '', jobText: '' };
  } catch {
    return { cvText: '', jobText: '' };
  }
}

export function writeDraft(draft: Draft): void {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Ignora falha de quota: o rascunho é conveniência, não requisito.
  }
}

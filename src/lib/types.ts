export type SkillType =
  | 'hard_skill'
  | 'soft_skill'
  | 'ferramenta'
  | 'idioma'
  | 'certificacao'
  | 'senioridade';

export type Obligatoriness = 'must_have' | 'nice_to_have';
export type MatchStatus = 'present' | 'partial' | 'absent';
export type ScoreBand = 'low' | 'mid' | 'high';

export interface Requirement {
  term: string;
  type: SkillType;
  obligatoriness: Obligatoriness;
  evidence: string;
}

export interface KeywordResult extends Requirement {
  status: MatchStatus;
  occurrences: number;
  where: string[];
}

export interface FormatCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface Criterion {
  id: string;
  label: string;
  points: number;
  max: number;
  evidence: string[];
}

export interface JobDescription {
  title: string;
  seniority: string;
  requirements: Requirement[];
  responsibilities: string[];
}

export interface Analysis {
  score: number;
  band: ScoreBand;
  criteria: Criterion[];
  keywords: KeywordResult[];
  formatChecks: FormatCheck[];
  job: JobDescription;
}

export type ChangeType = 'added' | 'removed' | 'moved' | 'normalized';

export interface Change {
  type: ChangeType;
  before: string;
  after: string;
  reason: string;
}

export interface CvSection {
  id: string;
  title: string;
  lines: string[];
}

export interface RewriteResult {
  sections: CvSection[];
  contact: string[];
  changes: Change[];
  pendencies: string[];
  text: string;
}

export interface Draft {
  cvText: string;
  jobText: string;
}

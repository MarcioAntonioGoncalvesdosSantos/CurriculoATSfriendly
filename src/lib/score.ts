import { extractJob } from './extract-jd';
import { checkFormat } from './format';
import { splitSections } from './sections';
import { aliasesFor } from './taxonomy';
import {
  bulletLines,
  countPhrase,
  hasDigits,
  lines,
  normalize,
  phraseIn,
  similarity,
  stripBullet,
  tokens,
} from './text';
import type {
  Analysis,
  Criterion,
  KeywordResult,
  MatchStatus,
  Requirement,
  ScoreBand,
} from './types';

export const WEIGHTS = {
  keywords: 30,
  format: 20,
  quantified: 15,
  cargo: 12,
  structure: 13,
  clarity: 10,
} as const;

const ACTION_VERBS = new Set(
  `liderei gerenciei desenvolvi implementei criei reduzi aumentei otimizei automatizei coordenei
   conduzi estruturei implantei negociei analisei executei planejei supervisionei treinei migrei
   integrei refatorei documentei monitorei apoiei elaborei revisei padronizei organizei dirigi
   administrei geri construi entreguei alcancei superei ampliei simplifiquei melhorei acelerei
   resolvi diagnostiquei auditei validei testei apresentei capacitei recrutei contratei mentorei
   mapeei priorizei transformei digitalizei modernizei redesenhei projetei especifiquei controlei
   fiscalizei inspecionei operei mantive instalei configurei promovi expandi diversifiquei atendi
   acompanhei articulei assegurei captei centralizei colaborei consolidei converti desenhei
   economizei eliminei ensinei escalei estabeleci evolui facilitei fortaleci ganhei identifiquei
   impulsionei iniciei introduzi lancei mediei modelei obtive participei produzi proporcionei
   realizei recuperei reestruturei registrei remodelei respondi restaurei reverti sediei segui
   solucionei substitui sustentei trouxe unifiquei viabilizei suportei assumi assumir`
    .split(/\s+/)
    .filter(Boolean),
);

const STATUS_WEIGHT: Record<MatchStatus, number> = { present: 1, partial: 0.5, absent: 0 };

/** Fonte única dos seis critérios: rótulo, peso e regra de medição. */
export const CRITERIA_INFO = {
  keywords: {
    label: 'Palavras-chave da vaga',
    weight: WEIGHTS.keywords,
    rule: 'Cobertura ponderada: requisito obrigatório vale 2, desejável vale 1.',
  },
  format: {
    label: 'Formato e parseabilidade',
    weight: WEIGHTS.format,
    rule: 'Dez checagens binárias de 2 pontos cada.',
  },
  quantified: {
    label: 'Resultados quantificados',
    weight: WEIGHTS.quantified,
    rule: 'Percentual de itens com número, %, R$ ou volume.',
  },
  cargo: {
    label: 'Cargo e senioridade',
    weight: WEIGHTS.cargo,
    rule: 'Termos do título da vaga e senioridade declarada.',
  },
  structure: {
    label: 'Estrutura e seções',
    weight: WEIGHTS.structure,
    rule: 'Seções padrão, contato no corpo e ordem cronológica.',
  },
  clarity: {
    label: 'Clareza dos itens',
    weight: WEIGHTS.clarity,
    rule: 'Verbo de ação no início, até 2 linhas, sem “responsável por”.',
  },
} as const;

export const CRITERIA_LIST = (Object.keys(CRITERIA_INFO) as (keyof typeof CRITERIA_INFO)[]).map(
  (id) => ({ id, ...CRITERIA_INFO[id] }),
);

export function bandFor(score: number): ScoreBand {
  if (score >= 75) return 'high';
  if (score >= 50) return 'mid';
  return 'low';
}

export function matchRequirements(cvText: string, requirements: Requirement[]): KeywordResult[] {
  const cvNorm = normalize(cvText);
  const cvLines = lines(cvText);

  return requirements.map((requirement) => {
    const aliases = aliasesFor(requirement.term);
    const candidates = aliases.length ? aliases : [requirement.term];

    let occurrences = 0;
    let status: MatchStatus = 'absent';

    const exact = candidates.find((candidate) => phraseIn(cvNorm, candidate));
    if (exact) {
      status = 'present';
      occurrences = countPhrase(cvNorm, exact);
    } else {
      const requirementTokens = tokens(requirement.term);
      const presentTokens = requirementTokens.filter((token) => phraseIn(cvNorm, token));
      const fuzzy = presentTokens.length === 0 &&
        tokens(cvText).some((token) => similarity(token, requirement.term) >= 0.88);

      if (presentTokens.length > 0 || fuzzy) {
        status = 'partial';
        occurrences = Math.max(presentTokens.length, fuzzy ? 1 : 0);
      }
    }

    const where =
      status === 'absent'
        ? []
        : cvLines
            .filter((line) =>
              candidates.some((candidate) => phraseIn(normalize(line), candidate)),
            )
            .slice(0, 3)
            .map((line) => (line.length > 120 ? `${line.slice(0, 117)}…` : line));

    return { ...requirement, status, occurrences, where };
  });
}

function keywordCriterion(keywords: KeywordResult[]): Criterion {
  if (keywords.length === 0) {
    return {
      id: 'keywords',
      label: CRITERIA_INFO.keywords.label,
      points: 0,
      max: WEIGHTS.keywords,
      evidence: ['Não encontramos requisitos identificáveis na vaga. Cole a descrição completa do anúncio.'],
    };
  }

  let gained = 0;
  let total = 0;
  for (const keyword of keywords) {
    const weight = keyword.obligatoriness === 'must_have' ? 2 : 1;
    total += weight;
    gained += weight * STATUS_WEIGHT[keyword.status];
  }

  const points = Math.round((gained / total) * WEIGHTS.keywords);
  const absentMust = keywords.filter(
    (keyword) => keyword.obligatoriness === 'must_have' && keyword.status !== 'present',
  );
  const evidence = [
    `${Math.round((gained / total) * 100)}% de cobertura dos requisitos da vaga.`,
    ...absentMust
      .slice(0, 4)
      .map((keyword) => `Ausente ou incompleto: "${keyword.term}" (${keyword.obligatoriness === 'must_have' ? 'obrigatório' : 'desejável'}).`),
  ];
  if (absentMust.length === 0) evidence.push('Todas as palavras-chave obrigatórias aparecem no currículo.');

  return { id: 'keywords', label: CRITERIA_INFO.keywords.label, points, max: WEIGHTS.keywords, evidence };
}

function formatCriterion(checks: ReturnType<typeof checkFormat>): Criterion {
  const perCheck = WEIGHTS.format / checks.length;
  const failed = checks.filter((check) => !check.passed);
  return {
    id: 'format',
    label: CRITERIA_INFO.format.label,
    points: Math.round((checks.length - failed.length) * perCheck),
    max: WEIGHTS.format,
    evidence: failed.length
      ? failed.map((check) => `${check.label}: ${check.detail}`)
      : ['Todas as checagens de formato passaram.'],
  };
}

function quantifiedCriterion(cvText: string): Criterion {
  const bullets = bulletLines(cvText);
  if (!bullets.length) {
    return {
      id: 'quantified',
      label: CRITERIA_INFO.quantified.label,
      points: 0,
      max: WEIGHTS.quantified,
      evidence: ['Nenhuma linha de experiência identificada para avaliar resultados.'],
    };
  }
  const withNumbers = bullets.filter((line) => hasDigits(line) || /%|r\$|reais/i.test(line));
  const ratio = withNumbers.length / bullets.length;
  const examples = bullets
    .filter((line) => !withNumbers.includes(line))
    .slice(0, 3)
    .map((line) => `Sem número: "${stripBullet(line).slice(0, 100)}"`);

  return {
    id: 'quantified',
    label: CRITERIA_INFO.quantified.label,
    points: Math.round(ratio * WEIGHTS.quantified),
    max: WEIGHTS.quantified,
    evidence: [
      `${withNumbers.length} de ${bullets.length} itens de experiência têm número, percentual ou valor.`,
      ...examples,
    ],
  };
}

function cargoCriterion(cvText: string, jobTitle: string, jobSeniority: string): Criterion {
  const cvNorm = normalize(cvText);
  const titleTokens = tokens(jobTitle).filter(
    (token) => token.length > 2 && !['de', 'da', 'do', 'para', 'com', 'the', 'and'].includes(token),
  );
  const covered = titleTokens.filter((token) => phraseIn(cvNorm, token));
  const titlePoints = jobTitle ? (titleTokens.length ? Math.round((covered.length / titleTokens.length) * 6) : 3) : 3;

  const seniorities = ['estágio', 'júnior', 'pleno', 'sênior', 'especialista', 'coordenação', 'gerência'];
  const cvSeniority = seniorities.find((label) => phraseIn(cvNorm, label)) ?? '';
  let seniorityPoints = 3;
  if (!jobSeniority) seniorityPoints = cvSeniority ? 5 : 4;
  else if (cvSeniority === jobSeniority) seniorityPoints = 6;
  else if (cvSeniority) seniorityPoints = 4;
  else seniorityPoints = 2;

  const evidence: string[] = [];
  evidence.push(
    jobTitle
      ? `Cargo da vaga: "${jobTitle}" — ${covered.length} de ${titleTokens.length} termos aparecem no currículo.`
      : 'A vaga não traz um cargo explícito; critério avaliado apenas por senioridade.',
  );
  evidence.push(
    jobSeniority
      ? `Senioridade pedida: ${jobSeniority}.${cvSeniority ? ` Encontrada no currículo: ${cvSeniority}.` : ' Nenhuma senioridade explícita no currículo.'}`
      : 'A vaga não declara senioridade.',
  );

  return {
    id: 'cargo',
    label: CRITERIA_INFO.cargo.label,
    points: Math.min(titlePoints + seniorityPoints, WEIGHTS.cargo),
    max: WEIGHTS.cargo,
    evidence,
  };
}

function structureCriterion(cvText: string): Criterion {
  const { sections, header } = splitSections(cvText);
  const present = new Set(sections.map((section) => section.id));
  const contact = header.length >= 2;
  const hasSummary = present.has('resumo');
  const hasExperience = present.has('experiencia');
  const hasEducation = present.has('formacao');
  const hasSkills = present.has('habilidades');
  const chronological = checkFormat(cvText).find((check) => check.id === 'ordem')?.passed ?? false;

  const points =
    (contact ? 2 : 0) +
    (hasSummary ? 2 : 0) +
    (hasExperience ? 3 : 0) +
    (hasEducation ? 2 : 0) +
    (hasSkills ? 2 : 0) +
    (chronological ? 2 : 0);

  const evidence: string[] = [];
  if (!contact) evidence.push('Bloco de contato no corpo do documento não identificado.');
  if (!hasSummary) evidence.push('Seção "Resumo Profissional" ausente.');
  if (!hasExperience) evidence.push('Seção "Experiência Profissional" ausente ou com título não padrão.');
  if (!hasEducation) evidence.push('Seção "Formação Acadêmica" ausente ou com título não padrão.');
  if (!hasSkills) evidence.push('Seção "Habilidades" ausente.');
  if (!chronological) evidence.push('Períodos fora da ordem do mais recente para o mais antigo.');
  if (!evidence.length) evidence.push('Todas as seções padrão estão presentes, em ordem cronológica inversa.');

  return { id: 'structure', label: CRITERIA_INFO.structure.label, points, max: WEIGHTS.structure, evidence };
}

function clarityCriterion(cvText: string): Criterion {
  const bullets = bulletLines(cvText);
  if (!bullets.length) {
    return {
      id: 'clarity',
      label: CRITERIA_INFO.clarity.label,
      points: 0,
      max: WEIGHTS.clarity,
      evidence: ['Nenhum item de experiência em formato de bullet.'],
    };
  }
  const good = bullets.filter((line) => {
    const bare = stripBullet(line);
    const first = normalize(bare.split(/\s+/)[0] ?? '');
    const startsWithVerb = ACTION_VERBS.has(first);
    const short = bare.length <= 160;
    const noFiller = !/respons[aá]vel por|encarregado de|auxiliava|ajudava/i.test(bare);
    return startsWithVerb && short && noFiller;
  });
  const weakExamples = bullets
    .filter((line) => !good.includes(line))
    .slice(0, 3)
    .map((line) => `Reescrever: "${stripBullet(line).slice(0, 100)}"`);

  return {
    id: 'clarity',
    label: CRITERIA_INFO.clarity.label,
    points: Math.round((good.length / bullets.length) * WEIGHTS.clarity),
    max: WEIGHTS.clarity,
    evidence: [
      `${good.length} de ${bullets.length} itens começam com verbo de ação e cabem em duas linhas.`,
      ...weakExamples,
    ],
  };
}

export function analyze(cvText: string, jobText: string): Analysis {
  const job = extractJob(jobText);
  const keywords = matchRequirements(cvText, job.requirements);
  const formatChecks = checkFormat(cvText);

  const criteria: Criterion[] = [
    keywordCriterion(keywords),
    formatCriterion(formatChecks),
    quantifiedCriterion(cvText),
    cargoCriterion(cvText, job.title, job.seniority),
    structureCriterion(cvText),
    clarityCriterion(cvText),
  ];

  const score = criteria.reduce((sum, criterion) => sum + criterion.points, 0);

  return { score, band: bandFor(score), criteria, keywords, formatChecks, job };
}

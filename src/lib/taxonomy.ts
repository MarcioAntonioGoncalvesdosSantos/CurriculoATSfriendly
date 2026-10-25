import type { SkillType } from './types';

export interface TaxonomyEntry {
  term: string;
  type: SkillType;
  aliases?: string[];
}

/**
 * Dicionário de competências usado para extrair requisitos da vaga e casar
 * sinônimos no currículo. Não é exaustivo: cobre os termos mais frequentes em
 * vagas de tecnologia, dados, produto e negócio.
 */
export const TAXONOMY: TaxonomyEntry[] = [
  // Linguagens e fundamentos
  { term: 'JavaScript', type: 'hard_skill', aliases: ['js', 'java script', 'ecmascript'] },
  { term: 'TypeScript', type: 'hard_skill', aliases: ['ts'] },
  { term: 'Python', type: 'hard_skill', aliases: ['py'] },
  { term: 'Java', type: 'hard_skill' },
  { term: 'C#', type: 'hard_skill', aliases: ['csharp', 'c sharp', '.net'] },
  { term: 'PHP', type: 'hard_skill' },
  { term: 'Ruby', type: 'hard_skill', aliases: ['ruby on rails', 'rails'] },
  { term: 'Go', type: 'hard_skill', aliases: ['golang'] },
  { term: 'Kotlin', type: 'hard_skill' },
  { term: 'Swift', type: 'hard_skill' },
  { term: 'SQL', type: 'hard_skill', aliases: ['sql query', 'consultas sql'] },
  { term: 'NoSQL', type: 'hard_skill', aliases: ['nosql'] },
  { term: 'HTML', type: 'hard_skill', aliases: ['html5'] },
  { term: 'CSS', type: 'hard_skill', aliases: ['css3', 'sass', 'scss'] },
  { term: 'React', type: 'ferramenta', aliases: ['react.js', 'reactjs'] },
  { term: 'Next.js', type: 'ferramenta', aliases: ['nextjs', 'next js'] },
  { term: 'Vue', type: 'ferramenta', aliases: ['vue.js', 'vuejs'] },
  { term: 'Angular', type: 'ferramenta', aliases: ['angularjs'] },
  { term: 'Node.js', type: 'ferramenta', aliases: ['node', 'nodejs'] },
  { term: 'React Native', type: 'ferramenta', aliases: ['react-native'] },
  { term: 'Flutter', type: 'ferramenta' },
  { term: 'Docker', type: 'ferramenta' },
  { term: 'Kubernetes', type: 'ferramenta', aliases: ['k8s'] },
  { term: 'AWS', type: 'ferramenta', aliases: ['amazon web services'] },
  { term: 'Azure', type: 'ferramenta', aliases: ['microsoft azure'] },
  { term: 'Google Cloud', type: 'ferramenta', aliases: ['gcp'] },
  { term: 'Git', type: 'ferramenta', aliases: ['github', 'gitlab', 'versionamento'] },
  { term: 'CI/CD', type: 'ferramenta', aliases: ['integração contínua', 'entrega contínua', 'ci cd'] },
  { term: 'Linux', type: 'ferramenta', aliases: ['unix'] },
  { term: 'REST', type: 'hard_skill', aliases: ['api rest', 'restful', 'apis'] },
  { term: 'GraphQL', type: 'hard_skill' },
  { term: 'Microsserviços', type: 'hard_skill', aliases: ['microservices', 'microsservicos'] },
  { term: 'Testes automatizados', type: 'hard_skill', aliases: ['jest', 'cypress', 'testes unitários', 'tdd'] },
  { term: 'Clean Code', type: 'hard_skill', aliases: ['código limpo', 'boas práticas de código'] },
  { term: 'Scrum', type: 'hard_skill', aliases: ['ágil', 'agile', 'metodologias ágeis'] },
  { term: 'Kanban', type: 'hard_skill' },
  { term: 'Figma', type: 'ferramenta' },
  { term: 'UX', type: 'hard_skill', aliases: ['experiência do usuário', 'user experience', 'ux/ui'] },
  { term: 'UI Design', type: 'hard_skill', aliases: ['ui', 'interface do usuário', 'design de interface'] },
  { term: 'Design System', type: 'hard_skill' },
  { term: 'Acessibilidade', type: 'hard_skill', aliases: ['wcag', 'a11y'] },

  // Dados
  { term: 'Power BI', type: 'ferramenta', aliases: ['powerbi', 'pbi'] },
  { term: 'Tableau', type: 'ferramenta' },
  { term: 'Looker', type: 'ferramenta', aliases: ['looker studio', 'data studio'] },
  { term: 'Excel avançado', type: 'ferramenta', aliases: ['excel', 'planilhas avançadas', 'vba'] },
  { term: 'Google Sheets', type: 'ferramenta', aliases: ['google planilhas'] },
  { term: 'Pandas', type: 'ferramenta', aliases: ['python pandas'] },
  { term: 'ETL', type: 'hard_skill', aliases: ['elt', 'pipeline de dados'] },
  { term: 'Airflow', type: 'ferramenta' },
  { term: 'Spark', type: 'ferramenta', aliases: ['pyspark'] },
  { term: 'BigQuery', type: 'ferramenta' },
  { term: 'Snowflake', type: 'ferramenta' },
  { term: 'Machine Learning', type: 'hard_skill', aliases: ['aprendizado de máquina', 'ml'] },
  { term: 'Estatística', type: 'hard_skill', aliases: ['análise estatística'] },
  { term: 'Análise de dados', type: 'hard_skill', aliases: ['analytics', 'análise de dados'] },
  { term: 'Data storytelling', type: 'soft_skill' },
  { term: 'PostgreSQL', type: 'ferramenta', aliases: ['postgres'] },
  { term: 'MySQL', type: 'ferramenta' },
  { term: 'MongoDB', type: 'ferramenta' },
  { term: 'SQL Server', type: 'ferramenta', aliases: ['sqlserver'] },
  { term: 'Redis', type: 'ferramenta' },

  // Gestão e negócio
  { term: 'Gestão de projetos', type: 'hard_skill', aliases: ['gerenciamento de projetos', 'project management'] },
  { term: 'Gestão de pessoas', type: 'hard_skill', aliases: ['liderança de equipe', 'gestão de equipe', 'people management'] },
  { term: 'Liderança', type: 'soft_skill', aliases: ['liderar times', 'liderança de times'] },
  { term: 'PMO', type: 'hard_skill' },
  { term: 'PMP', type: 'certificacao', aliases: ['project management professional'] },
  { term: 'OKR', type: 'hard_skill', aliases: ['okrs', 'metas e resultados'] },
  { term: 'KPI', type: 'hard_skill', aliases: ['kpis', 'indicadores'] },
  { term: 'Lean', type: 'hard_skill', aliases: ['lean six sigma', 'six sigma'] },
  { term: 'SAP', type: 'ferramenta' },
  { term: 'ERP', type: 'ferramenta', aliases: ['erp'] },
  { term: 'CRM', type: 'ferramenta', aliases: ['crm'] },
  { term: 'Salesforce', type: 'ferramenta' },
  { term: 'HubSpot', type: 'ferramenta' },
  { term: 'Pipedrive', type: 'ferramenta' },
  { term: 'Prospecção', type: 'hard_skill', aliases: ['prospecção de clientes', 'prospecting'] },
  { term: 'Negociação', type: 'soft_skill', aliases: ['negociação comercial'] },
  { term: 'Atendimento ao cliente', type: 'soft_skill', aliases: ['customer success', 'atendimento'] },
  { term: 'Vendas', type: 'hard_skill', aliases: ['vendas b2b', 'vendas b2c'] },
  { term: 'Gestão de estoque', type: 'hard_skill', aliases: ['controle de estoque'] },
  { term: 'Logística', type: 'hard_skill' },
  { term: 'Compras', type: 'hard_skill', aliases: ['suprimentos'] },
  { term: 'Financeiro', type: 'hard_skill', aliases: ['análise financeira', 'contas a pagar'] },
  { term: 'Recursos Humanos', type: 'hard_skill', aliases: ['rh', 'recrutamento e seleção'] },
  { term: 'Departamento pessoal', type: 'hard_skill', aliases: ['folha de pagamento'] },
  { term: 'Contabilidade', type: 'hard_skill', aliases: ['contábil'] },
  { term: 'Auditoria', type: 'hard_skill' },
  { term: 'Compliance', type: 'hard_skill', aliases: ['lgpd', 'auditoria de conformidade'] },
  { term: 'LGPD', type: 'hard_skill', aliases: ['lei geral de proteção de dados'] },

  // Marketing
  { term: 'SEO', type: 'hard_skill', aliases: ['search engine optimization'] },
  { term: 'SEM', type: 'hard_skill' },
  { term: 'Google Ads', type: 'ferramenta', aliases: ['adwords'] },
  { term: 'Meta Ads', type: 'ferramenta', aliases: ['facebook ads'] },
  { term: 'Google Analytics', type: 'ferramenta', aliases: ['ga4', 'analytics'] },
  { term: 'Inbound Marketing', type: 'hard_skill', aliases: ['inbound'] },
  { term: 'Copywriting', type: 'hard_skill', aliases: ['copy'] },
  { term: 'E-mail marketing', type: 'hard_skill', aliases: ['email marketing'] },
  { term: 'Social media', type: 'hard_skill', aliases: ['redes sociais'] },
  { term: 'Conteúdo', type: 'hard_skill', aliases: ['produção de conteúdo', 'content marketing'] },
  { term: 'Branding', type: 'hard_skill', aliases: ['marca'] },
  { term: 'Trade marketing', type: 'hard_skill' },
  { term: 'Pesquisa de mercado', type: 'hard_skill', aliases: ['market research'] },

  // Comportamentais
  { term: 'Comunicação', type: 'soft_skill', aliases: ['comunicação assertiva', 'communication'] },
  { term: 'Trabalho em equipe', type: 'soft_skill', aliases: ['teamwork', 'colaboração'] },
  { term: 'Proatividade', type: 'soft_skill', aliases: ['proativo'] },
  { term: 'Organização', type: 'soft_skill', aliases: ['organizado'] },
  { term: 'Resolução de problemas', type: 'soft_skill', aliases: ['problem solving'] },
  { term: 'Pensamento crítico', type: 'soft_skill', aliases: ['critical thinking'] },
  { term: 'Adaptabilidade', type: 'soft_skill', aliases: ['flexibilidade'] },
  { term: 'Empatia', type: 'soft_skill' },
  { term: 'Criatividade', type: 'soft_skill' },
  { term: 'Gestão de tempo', type: 'soft_skill', aliases: ['time management'] },
  { term: 'Foco no cliente', type: 'soft_skill', aliases: ['customer centric', 'cliente no centro'] },
  { term: 'Autonomia', type: 'soft_skill' },
  { term: 'Resiliência', type: 'soft_skill' },
  { term: 'Comunicação em inglês', type: 'idioma', aliases: ['inglês para conversação'] },

  // Idiomas
  { term: 'Inglês', type: 'idioma', aliases: ['english', 'inglês avançado', 'inglês fluente'] },
  { term: 'Espanhol', type: 'idioma', aliases: ['spanish', 'espanhol avançado'] },
  { term: 'Francês', type: 'idioma', aliases: ['francês avançado'] },
  { term: 'Alemão', type: 'idioma' },
  { term: 'Português', type: 'idioma' },
  { term: 'Libras', type: 'idioma' },

  // Certificações frequentes
  { term: 'Certificação AWS', type: 'certificacao', aliases: ['aws certified', 'aws cloud practitioner'] },
  { term: 'Certificação Azure', type: 'certificacao', aliases: ['az-900', 'azure fundamentals'] },
  { term: 'Scrum Master', type: 'certificacao', aliases: ['csm', 'psm'] },
  { term: 'ITIL', type: 'certificacao' },
  { term: 'CPA-20', type: 'certificacao' },
];

/** Mapa termo normalizado -> entradas que o representam (para casar sinônimos). */
export function aliasesFor(term: string): string[] {
  const entry = TAXONOMY.find((item) => item.term.toLowerCase() === term.toLowerCase());
  if (!entry) return [];
  return [entry.term, ...(entry.aliases ?? [])];
}

export function typeForTerm(term: string): SkillType {
  const entry = TAXONOMY.find(
    (item) =>
      item.term.toLowerCase() === term.toLowerCase() ||
      (item.aliases ?? []).some((alias) => alias.toLowerCase() === term.toLowerCase()),
  );
  return entry?.type ?? 'hard_skill';
}

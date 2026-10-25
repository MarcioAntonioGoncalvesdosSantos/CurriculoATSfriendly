import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Copy, Download, FileDown, FileText, Printer, ShieldCheck } from 'lucide-react';
import { CriteriaBar } from '../components/CriteriaBar';
import { KeywordChip } from '../components/KeywordChip';
import { ScoreRing } from '../components/ScoreRing';
import { Badge, Button, Card, CardTitle, EmptyState } from '../components/ui';
import { t } from '../i18n/pt-BR';
import { lineDiff } from '../lib/diff';
import { downloadDocx, downloadPdf, downloadTxt } from '../lib/export';
import type { KeywordResult } from '../lib/types';
import { getAnalysis } from '../state/store';

type Tab = 'diagnosis' | 'keywords' | 'format' | 'rewrite';

const TABS: { id: Tab; label: string }[] = [
  { id: 'diagnosis', label: t.result.tabs.diagnosis },
  { id: 'keywords', label: t.result.tabs.keywords },
  { id: 'format', label: t.result.tabs.format },
  { id: 'rewrite', label: t.result.tabs.rewrite },
];

export function Analysis() {
  const { id } = useParams<{ id: string }>();
  const record = useMemo(() => (id ? getAnalysis(id) : null), [id]);
  const [tab, setTab] = useState<Tab>('diagnosis');
  const [copied, setCopied] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  if (!record) {
    return (
      <EmptyState
        title={t.errors.notFound}
        text="As análises ficam guardadas apenas nesta sessão do navegador."
        action={
          <Link to="/app/nova" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            {t.result.newAnalysis}
          </Link>
        }
      />
    );
  }

  const { analysis, rewrite, cvText, scoreAfter } = record;
  const delta = scoreAfter - analysis.score;
  const present = analysis.keywords.filter((keyword) => keyword.status === 'present');
  const absentMust = analysis.keywords.filter(
    (keyword) => keyword.obligatoriness === 'must_have' && keyword.status !== 'present',
  );
  const absentNice = analysis.keywords.filter(
    (keyword) => keyword.obligatoriness === 'nice_to_have' && keyword.status !== 'present',
  );

  const diff = lineDiff(cvText, rewrite.text);
  const left = diff.filter((op) => op.type !== 'added');
  const right = diff.filter((op) => op.type !== 'removed');

  async function copy() {
    await navigator.clipboard.writeText(rewrite.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function runExport(format: 'docx' | 'pdf' | 'txt') {
    try {
      setExportError(null);
      if (format === 'docx') await downloadDocx(rewrite, analysis.job.title);
      if (format === 'pdf') await downloadPdf(rewrite, analysis.job.title);
      if (format === 'txt') downloadTxt(rewrite, analysis.job.title);
    } catch {
      setExportError(t.errors.exportFailed);
    }
  }

  return (
    <div className="mx-auto max-w-[1000px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Vaga analisada</p>
          <h1 className="font-display text-2xl font-semibold">{analysis.job.title || 'Descrição colada'}</h1>
          {analysis.job.seniority ? <p className="text-sm text-muted-foreground">Senioridade: {analysis.job.seniority}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <Link to="/app/nova" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            {t.result.newAnalysis}
          </Link>
        </div>
      </div>

      <Card className="mt-4 shadow-card">
        <div className="flex flex-wrap items-center gap-6">
          <ScoreRing score={analysis.score} band={analysis.band} />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {analysis.keywords.length} requisitos identificados na vaga ·{' '}
              {analysis.keywords.filter((keyword) => keyword.status === 'present').length} já aparecem no currículo.
            </p>
            {delta > 0 ? (
              <p className="mt-2 inline-flex items-center gap-1 rounded-md border border-success-500/30 bg-success-100 px-2 py-1 text-xs font-medium text-success-700">
                ▲ {t.result.after}: {scoreAfter} (+{delta}) — {t.result.before} {analysis.score}
              </p>
            ) : null}
            <p className="mt-3 text-xs text-muted-foreground">{t.result.disclaimer}</p>
          </div>
        </div>
      </Card>

      <Card className="mt-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">{t.result.export}</p>
            <p className="text-xs text-muted-foreground">{t.result.exportHelp}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => void runExport('docx')}>
              <Download size={14} aria-hidden />
              DOCX
            </Button>
            <Button size="sm" onClick={() => void runExport('pdf')}>
              <FileDown size={14} aria-hidden />
              PDF
            </Button>
            <Button size="sm" variant="secondary" onClick={() => void runExport('txt')}>
              <FileText size={14} aria-hidden />
              TXT
            </Button>
          </div>
        </div>
        {exportError ? (
          <p className="mt-2 text-sm text-danger-700" role="alert">
            {exportError}
          </p>
        ) : null}
      </Card>

      <div className="mt-5 flex gap-1 border-b border-border" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === item.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'diagnosis' ? (
        <Card className="mt-4">
          <CardTitle>{t.result.tabs.diagnosis}</CardTitle>
          <p className="mb-2 text-xs text-muted-foreground">
            Pesos fixos que somam 100 pontos. A evidência de cada perda de ponto aparece logo abaixo do critério.
          </p>
          <div>
            {analysis.criteria.map((criterion) => (
              <CriteriaBar key={criterion.id} criterion={criterion} />
            ))}
          </div>
        </Card>
      ) : null}

      {tab === 'keywords' ? (
        <div className="mt-4 space-y-4">
          <KeywordGroup title={t.result.keywordsGroups.absentMust} keywords={absentMust} />
          <KeywordGroup title={t.result.keywordsGroups.absentNice} keywords={absentNice} />
          <KeywordGroup title={t.result.keywordsGroups.present} keywords={present} />
        </div>
      ) : null}

      {tab === 'format' ? (
        <Card className="mt-4">
          <CardTitle>{t.result.tabs.format}</CardTitle>
          <ul className="space-y-2">
            {analysis.formatChecks.map((check) => (
              <li key={check.id} className="flex items-start gap-3 border-b border-border py-2 last:border-b-0">
                <span
                  className={`mt-0.5 inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium ${
                    check.passed
                      ? 'border-success-500/30 bg-success-100 text-success-700'
                      : 'border-danger-500/30 bg-danger-100 text-danger-700'
                  }`}
                >
                  {check.passed ? 'OK' : 'Ajustar'}
                </span>
                <div>
                  <p className="text-sm font-medium">{check.label}</p>
                  <p className="text-xs text-muted-foreground">{check.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {tab === 'rewrite' ? (
        <div className="mt-4 space-y-4">
          <Card>
            <CardTitle
              action={
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={copy}>
                    <Copy size={14} aria-hidden />
                    {copied ? t.result.copied : t.result.copy}
                  </Button>
                  <Link
                    to={`/print/${record.id}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 text-sm font-medium hover:bg-accent"
                  >
                    <Printer size={14} aria-hidden />
                    Pré-visualizar impressão
                  </Link>
                </div>
              }
            >
              {t.result.rewriteTitle}
            </CardTitle>

            <p className="mb-3 flex items-start gap-1.5 rounded-md border border-primary/20 bg-accent p-2 text-xs text-accent-foreground">
              <ShieldCheck size={14} className="mt-0.5 shrink-0" aria-hidden />
              {t.landing.rule}
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Antes</p>
                <div className="max-h-[420px] overflow-auto rounded-md border border-border bg-muted/40 p-3 font-mono text-[12.5px] leading-relaxed">
                  {left.map((op, index) => (
                    <p key={index} className={op.type === 'removed' ? 'bg-danger-100 text-danger-700 line-through' : ''}>
                      {op.text || '\u00A0'}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Depois</p>
                <div className="max-h-[420px] overflow-auto rounded-md border border-border bg-card p-3 font-mono text-[12.5px] leading-relaxed">
                  {right.map((op, index) => (
                    <p key={index} className={op.type === 'added' ? 'bg-success-100 text-success-700' : ''}>
                      {op.text || '\u00A0'}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>{t.result.changes}</CardTitle>
            {rewrite.changes.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.result.changesEmpty}</p>
            ) : (
              <ul className="space-y-2">
                {rewrite.changes.map((change, index) => (
                  <li key={index} className="border-b border-border pb-2 last:border-b-0">
                    <Badge tone={change.type === 'removed' ? 'danger' : change.type === 'added' ? 'success' : 'brand'}>
                      {change.type === 'moved' ? 'reordenado' : change.type === 'normalized' ? 'normalizado' : change.type}
                    </Badge>
                    <p className="mt-1 text-sm">{change.reason}</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">“{change.before.slice(0, 110)}”</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardTitle>{t.result.pendencies}</CardTitle>
            {rewrite.pendencies.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.result.pendenciesEmpty}</p>
            ) : (
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {rewrite.pendencies.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function KeywordGroup({ title, keywords }: { title: string; keywords: KeywordResult[] }) {
  return (
    <Card>
      <CardTitle action={<span className="font-mono text-xs text-muted-foreground">{keywords.length}</span>}>{title}</CardTitle>
      {keywords.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nada aqui.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword) => (
            <KeywordChip key={`${keyword.term}-${keyword.status}`} keyword={keyword} />
          ))}
        </div>
      )}
    </Card>
  );
}

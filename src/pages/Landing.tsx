import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Card } from '../components/ui';
import { t } from '../i18n/pt-BR';
import { CRITERIA_LIST } from '../lib/score';

const MAX_WEIGHT = Math.max(...CRITERIA_LIST.map((criterion) => criterion.weight));

export function Landing() {
  return (
    <div className="mx-auto max-w-[1000px]">
      <section className="pt-6">
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
          <ShieldCheck size={12} aria-hidden />
          {t.tagline}
        </p>
        <h1 className="max-w-[24ch] font-display text-3xl leading-[1.1] tracking-tight sm:text-4xl">
          {t.landing.h1}
        </h1>
        <p className="mt-4 max-w-[62ch] text-base text-muted-foreground">{t.landing.sub}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/app/nova"
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.landing.cta}
            <ArrowRight size={16} aria-hidden />
          </Link>
          <span className="text-xs text-muted-foreground">Sem cadastro para começar.</span>
        </div>
      </section>

      <section className="mt-10 grid gap-3 lg:grid-cols-3" aria-label="O que a análise entrega">
        <Card className="flex flex-col">
          <h2 className="font-display text-sm font-semibold">{t.landing.criteriaTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.landing.criteriaSub}</p>

          <ul className="mt-4 space-y-2.5">
            {CRITERIA_LIST.map((criterion) => (
              <li key={criterion.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[13px] font-medium">{criterion.label}</span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">{criterion.weight} pts</span>
                </div>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
                  <div
                    className="h-full rounded-full bg-primary/70"
                    style={{ width: `${(criterion.weight / MAX_WEIGHT) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{criterion.rule}</p>
              </li>
            ))}
          </ul>

          <p className="mt-4 border-t border-border pt-3 text-[11px] text-muted-foreground">
            {t.landing.criteriaTotal}
          </p>
        </Card>

        <Card className="flex flex-col">
          <h2 className="font-display text-sm font-semibold">{t.landing.diffTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.landing.diffSub}</p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">{t.landing.before}</p>
              <p className="rounded border border-danger-500/30 bg-danger-100 p-2 font-mono text-[11px] leading-snug text-danger-700 line-through">
                Responsável por relatórios semanais de vendas
              </p>
            </div>
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">{t.landing.after}</p>
              <p className="rounded border border-success-500/30 bg-success-100 p-2 font-mono text-[11px] leading-snug text-success-700">
                Relatórios semanais de vendas para a diretoria
              </p>
            </div>
          </div>

          <p className="mt-3 rounded-md bg-muted px-2 py-1.5 text-[11px] leading-snug text-muted-foreground">
            <span className="font-medium text-foreground">Motivo: </span>
            verbo de ação no início do item.
          </p>

          <p className="mt-auto pt-3 text-[11px] text-muted-foreground">{t.landing.diffCaption}</p>
        </Card>

        <Card className="flex flex-col">
          <h2 className="font-display text-sm font-semibold">{t.landing.exportTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.landing.exportSub}</p>

          <ul className="mt-4 space-y-2">
            {t.landing.formats.map((format) => (
              <li key={format.name} className="flex items-start gap-2 border-b border-border pb-2 last:border-b-0">
                <span className="mt-0.5 rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-medium">
                  {format.name}
                </span>
                <span className="text-[12px] leading-snug text-muted-foreground">{format.desc}</span>
              </li>
            ))}
          </ul>

          <p className="mt-auto pt-3 text-[11px] text-muted-foreground">
            Recalcula a nota sobre o texto ajustado e mostra o antes → depois.
          </p>
        </Card>
      </section>

      <section className="mt-4 rounded-card border border-primary/25 bg-accent p-5">
        <p className="flex items-center gap-1.5 font-display text-sm font-semibold text-accent-foreground">
          <ShieldCheck size={14} aria-hidden />
          {t.landing.ruleTitle}
        </p>
        <p className="mt-1 text-sm text-accent-foreground/90">{t.landing.rule}</p>
      </section>
    </div>
  );
}

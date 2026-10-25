import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Card } from '../components/ui';
import { t } from '../i18n/pt-BR';

export function Landing() {
  return (
    <div className="mx-auto max-w-[880px]">
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

      <section className="mt-10 grid gap-3 sm:grid-cols-3">
        {t.landing.proof.map((item) => (
          <Card key={item.title}>
            <p className="font-display text-sm font-semibold">{item.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
          </Card>
        ))}
      </section>

      <section className="mt-6 rounded-card border border-border bg-card p-5">
        <p className="text-sm font-medium">A regra que vale para todo o app</p>
        <p className="mt-1 text-sm text-muted-foreground">{t.landing.rule}</p>
      </section>
    </div>
  );
}

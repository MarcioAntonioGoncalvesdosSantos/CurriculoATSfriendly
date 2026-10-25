import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { t } from '../i18n/pt-BR';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-[11px] font-bold text-primary-foreground">
              R
            </span>
            <span className="font-display text-sm font-semibold tracking-tight">{t.appName}</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link to="/app/nova" className="rounded-md px-3 py-1.5 hover:bg-accent">
              Nova análise
            </Link>
          </nav>
        </div>
      </header>

      <main className="container flex-1 py-8">{children}</main>

      <footer className="border-t border-border py-6">
        <div className="container flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} aria-hidden />
            {t.landing.rule}
          </span>
          <span>Diagnóstico de compatibilidade — não é garantia de aprovação.</span>
        </div>
      </footer>
    </div>
  );
}

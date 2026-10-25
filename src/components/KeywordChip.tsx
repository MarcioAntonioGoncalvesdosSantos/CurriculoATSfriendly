import { useState } from 'react';
import { Check, Minus, X } from 'lucide-react';
import { t } from '../i18n/pt-BR';
import type { KeywordResult } from '../lib/types';

const STYLE = {
  present: 'border-success-500/30 bg-success-100 text-success-700',
  partial: 'border-warning-500/30 bg-warning-100 text-warning-700',
  absent: 'border-danger-500/30 bg-danger-100 text-danger-700',
} as const;

const Icon = { present: Check, partial: Minus, absent: X } as const;

export function KeywordChip({ keyword }: { keyword: KeywordResult }) {
  const [open, setOpen] = useState(false);
  const Glyph = Icon[keyword.status];

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${STYLE[keyword.status]}`}
      >
        <Glyph size={12} aria-hidden />
        {keyword.term}
        {keyword.occurrences > 1 ? <span className="font-mono opacity-70">×{keyword.occurrences}</span> : null}
      </button>
      {open ? (
        <span className="absolute left-0 top-full z-20 mt-1 block w-64 rounded-md border border-border bg-card p-2 text-left text-xs shadow-overlay">
          <span className="block font-semibold">{keyword.term}</span>
          <span className="block text-muted-foreground">
            {t.status[keyword.status]} · {t.kinds[keyword.type]}
          </span>
          {keyword.where.length ? (
            <span className="mt-1 block text-muted-foreground">
              Onde aparece: “{keyword.where[0]}”
            </span>
          ) : (
            <span className="mt-1 block text-muted-foreground">
              Se você tem essa experiência, escreva a evidência — o app não insere sozinho.
            </span>
          )}
        </span>
      ) : null}
    </span>
  );
}

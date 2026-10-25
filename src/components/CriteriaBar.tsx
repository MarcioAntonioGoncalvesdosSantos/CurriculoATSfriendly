import { useState } from 'react';
import type { Criterion } from '../lib/types';
import { ChevronD } from './icons';

export function CriteriaBar({ criterion }: { criterion: Criterion }) {
  const [open, setOpen] = useState(false);
  const ratio = criterion.max === 0 ? 0 : criterion.points / criterion.max;
  const color =
    ratio >= 0.75 ? 'bg-success-500' : ratio >= 0.4 ? 'bg-warning-500' : 'bg-danger-500';

  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 text-left"
      >
        <span className="w-[190px] shrink-0 text-sm">{criterion.label}</span>
        <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden>
          <span
            className={`block h-full rounded-full ${color} transition-all duration-500`}
            style={{ width: `${Math.round(ratio * 100)}%` }}
          />
        </span>
        <span className="w-12 shrink-0 text-right font-mono text-sm tabular-nums">
          {criterion.points}/{criterion.max}
        </span>
        <ChevronD open={open} />
      </button>
      {open ? (
        <ul className="mt-2 space-y-1 pl-[202px] text-sm text-muted-foreground">
          {criterion.evidence.map((item, index) => (
            <li key={index} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

import { useState } from 'react';
import type { Criterion } from '../lib/types';
import { ChevronD } from './icons';

export function CriteriaBar({ criterion }: { criterion: Criterion }) {
  const [open, setOpen] = useState(false);
  const ratio = criterion.max === 0 ? 0 : criterion.points / criterion.max;
  const color = ratio >= 0.75 ? 'bg-success-500' : ratio >= 0.4 ? 'bg-warning-500' : 'bg-danger-500';
  const [firstEvidence, ...rest] = criterion.evidence;

  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={`${criterion.label}: ver todas as evidências`}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <span className="w-[150px] shrink-0 text-sm sm:w-[190px]">{criterion.label}</span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden>
            <span
              className={`block h-full rounded-full ${color} transition-all duration-500`}
              style={{ width: `${Math.round(ratio * 100)}%` }}
            />
          </span>
          <span className="w-14 shrink-0 text-right font-mono text-sm tabular-nums">
            {criterion.points}/{criterion.max}
          </span>
          <ChevronD open={open} />
        </button>
      </div>

      <p className="mt-1.5 text-[12.5px] leading-snug text-muted-foreground sm:pl-[202px]">{firstEvidence}</p>

      {open
        ? rest.map((item, index) => (
            <p key={index} className="mt-1 text-[12.5px] leading-snug text-muted-foreground sm:pl-[202px]">
              {item}
            </p>
          ))
        : null}
    </div>
  );
}

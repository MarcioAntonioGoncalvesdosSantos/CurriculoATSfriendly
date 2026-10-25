import { Check } from 'lucide-react';

export function Stepper({ current, labels }: { current: number; labels: readonly string[] }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progresso">
      {labels.map((label, index) => {
        const step = index + 1;
        const done = step < current;
        const active = step === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2" aria-current={active ? 'step' : undefined}>
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                done
                  ? 'border-primary bg-primary text-primary-foreground'
                  : active
                    ? 'border-primary text-primary'
                    : 'border-border text-muted-foreground'
              }`}
            >
              {done ? <Check size={12} aria-hidden /> : step}
            </span>
            <span className={`hidden text-xs sm:block ${active ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
              {label}
            </span>
            {step < labels.length ? <span className="h-px flex-1 bg-border" aria-hidden /> : null}
          </li>
        );
      })}
    </ol>
  );
}

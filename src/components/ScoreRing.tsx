import { t } from '../i18n/pt-BR';
import type { ScoreBand } from '../lib/types';

const STROKE: Record<ScoreBand, string> = {
  low: 'hsl(4 76% 40%)',
  mid: 'hsl(26 91% 37%)',
  high: 'hsl(142 72% 29%)',
};

export function ScoreRing({ score, band }: { score: number; band: ScoreBand }) {
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.min(Math.max(score, 0), 100) / 100) * circumference;

  return (
    <div className="flex items-center gap-5">
      <svg
        width="160"
        height="160"
        viewBox="0 0 160 160"
        role="img"
        aria-label={`${t.result.score}: ${score} ${t.result.of} — ${t.bands[band]}`}
        className="shrink-0"
      >
        <circle cx="80" cy="80" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="12" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={STROKE[band]}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          transform="rotate(-90 80 80)"
          style={{ transition: 'stroke-dasharray 600ms ease-out' }}
        />
        <text
          x="80"
          y="76"
          textAnchor="middle"
          className="fill-foreground font-mono"
          style={{ fontSize: 56, fontWeight: 500, letterSpacing: '-0.03em' }}
        >
          {score}
        </text>
        <text x="80" y="102" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 11 }}>
          {t.result.of}
        </text>
      </svg>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{t.result.score}</p>
        <p className="font-display text-2xl font-semibold">{t.bands[band]}</p>
      </div>
    </div>
  );
}

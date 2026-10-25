import type { ButtonHTMLAttributes, HTMLAttributes, TextareaHTMLAttributes } from 'react';

export function cn(...values: (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(' ');
}

type Variant = 'primary' | 'secondary' | 'ghost' | 'link';
type Size = 'sm' | 'md' | 'lg';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground border border-border hover:bg-accent',
  ghost: 'hover:bg-accent text-foreground',
  link: 'text-primary underline-offset-4 hover:underline px-0',
};

const SIZE: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'disabled:pointer-events-none disabled:opacity-60',
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-card border border-border bg-card p-5', className)} {...props} />;
}

export function CardTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <h2 className="text-[15px] font-semibold leading-tight">{children}</h2>
      {action}
    </div>
  );
}

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'brand';

const TONE: Record<Tone, string> = {
  neutral: 'border-border bg-secondary text-secondary-foreground',
  success: 'border-success-500/30 bg-success-100 text-success-700',
  warning: 'border-warning-500/30 bg-warning-100 text-warning-700',
  danger: 'border-danger-500/30 bg-danger-100 text-danger-700',
  brand: 'border-primary/20 bg-accent text-accent-foreground',
};

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
        TONE[tone],
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-md border border-input bg-card px-3 py-2 text-sm leading-relaxed',
        'placeholder:text-muted-foreground focus-visible:border-primary',
        className,
      )}
      {...props}
    />
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-border bg-card/60 px-6 py-10 text-center">
      <p className="font-display text-base font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-[46ch] text-sm text-muted-foreground">{text}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

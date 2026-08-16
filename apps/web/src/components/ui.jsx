import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';

export const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

const variants = {
  primary: 'bg-primary text-on-primary hover:bg-inverse-surface focus:ring-primary',
  secondary: 'bg-secondary text-on-secondary hover:bg-[#005a3d] focus:ring-secondary',
  outline: 'border border-outline-variant text-primary hover:bg-surface-container focus:ring-outline',
  danger: 'bg-error text-on-error hover:bg-[#93000a] focus:ring-error',
  ghost: 'text-on-surface-variant hover:bg-surface-container focus:ring-outline',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5',
  lg: 'px-5 py-3',
};

export function Button({ variant = 'primary', size = 'md', loading = false, className = '', children, disabled, ...props }) {
  return (
    <button
      className={`${btnBase} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Card({ className = '', children, ...props }) {
  return (
    <div className={`rounded-xl border border-outline-variant/20 bg-surface-container-lowest shadow-float ${className}`} {...props}>
      {children}
    </div>
  );
}

export const inputBase =
  'w-full rounded-lg border border-outline-variant bg-surface-container-low px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-surface-container-high';

export function Field({ label, error, hint, required, children, className = '' }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-on-surface-variant">
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-outline">{hint}</p>}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

export const Input = forwardRef(function Input({ invalid, className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`${inputBase} ${invalid ? 'border-error focus:border-error focus:ring-error' : ''} ${className}`}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea({ invalid, className = '', ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={`${inputBase} min-h-24 ${invalid ? 'border-error focus:border-error' : ''} ${className}`}
      {...props}
    />
  );
});

export function Select({ invalid, className = '', children, ...props }) {
  return (
    <select
      className={`${inputBase} ${invalid ? 'border-error focus:border-error' : ''} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

const badgeTones = {
  green: 'bg-secondary-container/40 text-on-secondary-container',
  red: 'bg-error-container text-on-error-container',
  amber: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  blue: 'bg-primary-fixed text-on-primary-fixed',
  slate: 'bg-surface-container text-on-surface-variant',
  violet: 'bg-surface-variant text-surface-tint',
};

export function Badge({ tone = 'slate', children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeTones[tone]} ${className}`}>
      {children}
    </span>
  );
}

const STATUS_TONES = {
  pending: 'amber',
  processing: 'blue',
  approved: 'blue',
  completed: 'green',
  rejected: 'red',
  active: 'green',
  cancelled: 'red',
  open: 'green',
  draft: 'slate',
  fully_funded: 'blue',
  qualified: 'green',
  credited: 'green',
  failed: 'red',
};

export function StatusBadge({ status }) {
  const tone = STATUS_TONES[status] ?? 'slate';
  const label = status ? status.replace(/_/g, ' ') : '-';
  return <Badge tone={tone}>{label}</Badge>;
}

export function Spinner({ size = 40 }) {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={size} className="animate-spin text-primary" />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant">
          <Icon size={32} />
        </div>
      )}
      <h3 className="text-base font-semibold text-on-surface">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-on-surface-variant">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sub, tone = 'primary' }) {
  const toneMap = {
    primary: 'bg-primary-container/8 text-primary',
    amber: 'bg-tertiary-fixed text-tertiary-container',
    blue: 'bg-primary-fixed text-on-primary-fixed',
    violet: 'bg-surface-variant text-surface-tint',
    red: 'bg-error-container text-on-error-container',
    green: 'bg-secondary-container/40 text-on-secondary-container',
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-on-surface-variant">{label}</p>
          <p className="mt-1 text-2xl font-bold text-on-surface">{value}</p>
          {sub && <p className="mt-1 text-xs text-outline">{sub}</p>}
        </div>
        {Icon && (
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${toneMap[tone]}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </Card>
  );
}

export function ProgressBar({ value, className = '', color = 'bg-secondary' }) {
  const pct = Math.max(0, Math.min(100, Number(value ?? 0)));
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-surface-container-high ${className}`}>
      <div
        className={`h-full rounded-full ${color} transition-all`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary md:font-headline-lg md:text-headline-lg">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-on-surface-variant">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Alert({ tone = 'error', children }) {
  const tones = {
    error: 'bg-error-container text-on-error-container border-error-container',
    info: 'bg-primary-fixed text-on-primary-fixed border-primary-fixed',
    warning: 'bg-tertiary-fixed text-on-tertiary-fixed-variant border-tertiary-fixed',
    success: 'bg-secondary-container/40 text-on-secondary-container border-secondary-container',
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}>{children}</div>
  );
}

export function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-on-surface/50" onClick={onClose} />
      <div className={`relative w-full ${width} rounded-modal bg-surface-container-lowest shadow-xl`}>
        <div className="flex items-center justify-between border-b border-outline-variant/30 px-5 py-4">
          <h3 className="text-base font-semibold text-on-surface">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-on-surface-variant hover:bg-surface-container">
            <X size={20} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function SectionLink({ to, children }) {
  return (
    <Link to={to} className="text-sm font-semibold text-primary hover:opacity-70">
      {children}
    </Link>
  );
}

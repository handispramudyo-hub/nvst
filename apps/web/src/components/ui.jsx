import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';

export const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

const variants = {
  primary: 'bg-primary-600 text-white shadow-btn hover:bg-primary-700 hover:shadow-none focus:ring-primary-500',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400',
  outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-400',
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
    <div className={`rounded-card bg-white border border-slate-200 shadow-card ${className}`} {...props}>
      {children}
    </div>
  );
}

export const inputBase =
  'w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-50';

export const Field = forwardRef(function Field(
  { label, error, hint, required, children, className = '' },
  ref,
) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});

export const Input = forwardRef(function Input({ invalid, className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`${inputBase} ${invalid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea({ invalid, className = '', ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={`${inputBase} min-h-24 ${invalid ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
      {...props}
    />
  );
});

export function Select({ invalid, className = '', children, ...props }) {
  return (
    <select
      className={`${inputBase} ${invalid ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

const badgeTones = {
  green: 'bg-emerald-100 text-emerald-700',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-700',
  blue: 'bg-blue-100 text-blue-700',
  slate: 'bg-slate-100 text-slate-600',
  violet: 'bg-violet-100 text-violet-700',
};

export function Badge({ tone = 'slate', children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeTones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export const STATUS_TONES = {
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
      <Loader2 size={size} className="animate-spin text-primary-600" />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Icon size={32} />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sub, tone = 'primary' }) {
  const toneMap = {
    primary: 'bg-primary-50 text-primary-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
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

export function ProgressBar({ value, className = '' }) {
  const pct = Math.max(0, Math.min(100, Number(value ?? 0)));
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}>
      <div
        className="h-full rounded-full bg-primary-500 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Alert({ tone = 'error', children }) {
  const tones = {
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}>{children}</div>
  );
}

export function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className={`relative w-full ${width} rounded-modal bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
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
    <Link to={to} className="text-sm font-semibold text-primary-600 hover:text-primary-700">
      {children}
    </Link>
  );
}

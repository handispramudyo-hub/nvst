import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Loader2, Inbox } from 'lucide-react';

export const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
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
    <div className={`rounded-card bg-white border border-slate-200 shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}

export const inputBase =
  'w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-50';

export const Field = forwardRef(function Field(
  { label, error, hint, required, children, className = '' },
  _ref,
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
  blue: 'bg-primary-100 text-primary-700',
  slate: 'bg-slate-100 text-slate-600',
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
    blue: 'bg-primary-50 text-primary-600',
    violet: 'bg-sky-50 text-sky-600',
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
    info: 'bg-primary-50 text-primary-700 border-primary-200',
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

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  tone = 'danger',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {description && <p className="text-sm text-slate-600">{description}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export function DataTable({ columns, rows, keyField = 'id', emptyTitle = 'Tidak ada data', emptyDescription }) {
  if (!rows || rows.length === 0) {
    return <EmptyState icon={Inbox} title={emptyTitle} description={emptyDescription} />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row[keyField]} className="hover:bg-slate-50">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 align-middle text-slate-700">
                  {col.render ? col.render(row) : (row[col.key] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getPageList(current, last) {
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }
  const pages = [1];
  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end = Math.min(last - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < last - 2) pages.push('...');
  pages.push(last);
  return pages;
}

export function Pagination({ page, lastPage, total, from, to, onChange }) {
  if (!total) return null;
  const pages = getPageList(Number(page || 1), Number(lastPage || 1));
  const pageBtn =
    'flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40';
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
      <p className="text-xs text-slate-500">
        Menampilkan {from ?? 0}–{to ?? 0} dari {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          className={`${pageBtn} border border-slate-200 text-slate-600 hover:bg-slate-50`}
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Sebelumnya
        </button>
        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-sm text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              className={`${pageBtn} ${
                p === page
                  ? 'bg-primary-600 text-white'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          ),
        )}
        <button
          className={`${pageBtn} border border-slate-200 text-slate-600 hover:bg-slate-50`}
          disabled={page >= lastPage}
          onClick={() => onChange(page + 1)}
        >
          Berikutnya
        </button>
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

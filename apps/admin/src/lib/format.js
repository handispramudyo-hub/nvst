const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const compact = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function rupiah(value) {
  return currency.format(Number(value ?? 0));
}

export function compactNumber(value) {
  return compact.format(Number(value ?? 0));
}

export function formatNumber(value) {
  return new Intl.NumberFormat('id-ID').format(Number(value ?? 0));
}

export function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPercent(value) {
  return `${Number(value ?? 0)}%`;
}

export function makeIdempotencyKey(prefix) {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now()}-${rand}`;
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatRupiahDecimal(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

export function formatDate(date: string | null): string {
  if (!date) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
}

export function formatDateTime(date: string | null): string {
  if (!date) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function relativeTime(date: string): string {
  const then = new Date(date).getTime();
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return 'Baru saja';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return formatDate(date);
}

export function formatSigned(value: number): string {
  const formatted = formatRupiah(Math.abs(value));
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

export function maskPhone(phone: string): string {
  if (phone.length <= 7) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-3)}`;
}

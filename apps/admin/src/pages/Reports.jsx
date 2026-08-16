import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Landmark, HandCoins, TrendingUp, Coins, Filter } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { PageHeader, Card, Input, Button, StatCard, ProgressBar, Spinner, Alert } from '../components/ui';
import { MoneyBarChart } from '../components/charts';
import { rupiah, formatNumber } from '../lib/format';

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const SUMMARY = [
  { key: 'new_users', label: 'Pengguna Baru', icon: Users, format: (v) => formatNumber(v), tone: 'primary' },
  { key: 'total_deposits', label: 'Total Deposit', icon: Landmark, format: rupiah, tone: 'primary' },
  { key: 'total_withdrawals', label: 'Total Penarikan', icon: HandCoins, format: rupiah, tone: 'red' },
  { key: 'total_investments', label: 'Total Investasi', icon: TrendingUp, format: rupiah, tone: 'violet' },
  { key: 'total_profit', label: 'Total Profit', icon: Coins, format: rupiah, tone: 'blue' },
];

const CHARTS = [
  { key: 'deposits', label: 'Deposit per Hari' },
  { key: 'withdrawals', label: 'Penarikan per Hari' },
  { key: 'investments', label: 'Investasi per Hari' },
  { key: 'profit', label: 'Profit per Hari' },
];

export default function Reports() {
  const [dates, setDates] = useState(() => ({
    start_date: toISODate(new Date(Date.now() - 29 * 86400000)),
    end_date: toISODate(new Date()),
  }));
  const [applied, setApplied] = useState(dates);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['admin', 'reports', applied],
    queryFn: async () =>
      (await api.get('/admin/reports', { params: { start_date: applied.start_date, end_date: applied.end_date } })).data
        .data,
  });

  const categoryTotal = Object.values(data?.category_summary ?? {}).reduce((a, b) => a + Number(b || 0), 0);

  return (
    <div>
      <PageHeader
        title="Laporan"
        description="Laporan keuangan berdasarkan rentang tanggal"
        actions={
          <Button onClick={() => setApplied(dates)} loading={isFetching}>
            <Filter size={16} />
            Terapkan
          </Button>
        }
      />
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-52">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Tanggal Mulai</label>
            <Input type="date" value={dates.start_date} onChange={(e) => setDates((d) => ({ ...d, start_date: e.target.value }))} />
          </div>
          <div className="w-52">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Tanggal Berakhir</label>
            <Input type="date" value={dates.end_date} onChange={(e) => setDates((d) => ({ ...d, end_date: e.target.value }))} />
          </div>
        </div>
      </Card>

      {isError && <Alert className="mb-4">{extractErrorMessage(error)}</Alert>}
      {isLoading ? (
        <Spinner />
      ) : (
        data && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {SUMMARY.map(({ key, label, icon, format, tone }) => (
                <StatCard key={key} icon={icon} label={label} value={format(data.summary[key])} tone={tone} />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {CHARTS.map((c, i) => (
                <Card key={c.key} className="p-5">
                  <h3 className="mb-4 text-base font-semibold text-slate-800">{c.label}</h3>
                  <MoneyBarChart
                    values={data.charts[c.key]}
                    color={['#2563eb', '#ef4444', '#0ea5e9', '#16a34a'][i]}
                  />
                </Card>
              ))}
            </div>

            <Card className="p-5">
              <h3 className="mb-4 text-base font-semibold text-slate-800">Ringkasan per Kategori Proyek</h3>
              {categoryTotal === 0 ? (
                <p className="text-sm text-slate-500">Belum ada investasi pada periode ini.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(data.category_summary).map(([category, value]) => {
                    const amount = Number(value || 0);
                    const pct = categoryTotal ? (amount / categoryTotal) * 100 : 0;
                    return (
                      <div key={category}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-800">{category}</span>
                          <span className="text-slate-500">
                            {rupiah(amount)} · {pct.toFixed(1)}%
                          </span>
                        </div>
                        <ProgressBar value={pct} />
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )
      )}
    </div>
  );
}

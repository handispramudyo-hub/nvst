import { useQuery } from '@tanstack/react-query';
import {
  Users,
  UserCheck,
  Clock,
  Landmark,
  HandCoins,
  TrendingUp,
  PieChart,
  Banknote,
  Coins,
  Wallet,
} from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { StatCard, Card, Spinner, Alert, PageHeader } from '../components/ui';
import { MoneyBarChart } from '../components/charts';
import { rupiah, formatNumber } from '../lib/format';

const STATS = [
  { key: 'total_users', label: 'Total Pengguna', icon: Users, format: (v) => formatNumber(v), tone: 'primary' },
  { key: 'active_users', label: 'Pengguna Aktif', icon: UserCheck, format: (v) => formatNumber(v), tone: 'primary' },
  { key: 'pending_deposits', label: 'Deposit Menunggu', icon: Clock, format: (v) => formatNumber(v), tone: 'amber' },
  { key: 'pending_withdrawals', label: 'Penarikan Menunggu', icon: Wallet, format: (v) => formatNumber(v), tone: 'amber' },
  { key: 'total_deposits', label: 'Total Deposit', icon: Landmark, format: rupiah, tone: 'primary' },
  { key: 'total_withdrawals', label: 'Total Penarikan', icon: HandCoins, format: rupiah, tone: 'blue' },
  { key: 'total_investments', label: 'Total Investasi', icon: TrendingUp, format: rupiah, tone: 'violet' },
  { key: 'active_investments', label: 'Investasi Aktif', icon: PieChart, format: (v) => formatNumber(v), tone: 'primary' },
  { key: 'today_deposits', label: 'Deposit Hari Ini', icon: Banknote, format: rupiah, tone: 'blue' },
  { key: 'total_profit_paid', label: 'Profit Dibayar', icon: Coins, format: rupiah, tone: 'primary' },
];

export default function Dashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => (await api.get('/admin/dashboard')).data.data,
  });

  return (
    <div>
      <PageHeader title="Dashboard" description="Ringkasan aktivitas NiVEST secara real-time" />
      {isError && <Alert className="mb-4">{extractErrorMessage(error)}</Alert>}
      {isLoading && <Spinner />}
      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {STATS.map(({ key, label, icon, format, tone }) => (
              <StatCard key={key} icon={icon} label={label} value={format(data.stats[key])} tone={tone} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h3 className="mb-4 text-base font-semibold text-slate-800">Pertumbuhan Deposit (30 hari)</h3>
              <MoneyBarChart values={data.charts.deposits_growth} />
            </Card>
            <Card className="p-5">
              <h3 className="mb-4 text-base font-semibold text-slate-800">Pertumbuhan Investasi (30 hari)</h3>
              <MoneyBarChart values={data.charts.investments_growth} color="#3b82f6" />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

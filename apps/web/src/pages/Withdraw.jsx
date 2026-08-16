import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CheckCircle2, HandCoins, Info, Landmark, Settings2, Wallet } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { rupiah, formatDateTime, makeIdempotencyKey } from '../lib/format';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Spinner,
  StatusBadge,
} from '../components/ui';
import Section from '../components/Section';

export default function Withdraw() {
  const queryClient = useQueryClient();
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [created, setCreated] = useState(null);

  const rulesQuery = useQuery({
    queryKey: ['withdrawal-rules'],
    queryFn: async () => {
      const { data } = await api.get('/withdrawals/rules');
      return data.data;
    },
  });

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/profile');
      return data.data;
    },
  });

  const withdrawalsQuery = useQuery({
    queryKey: ['withdrawals'],
    queryFn: async () => {
      const { data } = await api.get('/withdrawals', { params: { per_page: 10 } });
      return data.data.items ?? [];
    },
  });

  useEffect(() => {
    if (accountId) return;
    const accounts = profileQuery.data?.withdrawal_accounts ?? [];
    if (accounts.length > 0) {
      const preferred = accounts.find((a) => a.is_default) ?? accounts[0];
      setAccountId(String(preferred.id));
    }
  }, [profileQuery.data, accountId]);

  const withdrawMutation = useMutation({
    mutationFn: async (values) => {
      const { data } = await api.post('/withdrawals', {
        amount: values.amount,
        account_id: Number(values.accountId),
        pin: values.pin,
        idempotency_key: makeIdempotencyKey('wd'),
      });
      return data.data;
    },
    onSuccess: (withdrawal) => {
      setCreated(withdrawal);
      setAmount('');
      setPin('');
      toast.success('Penarikan berhasil diajukan.');
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
    onError: (e) => {
      toast.error(extractErrorMessage(e));
    },
  });

  const rules = rulesQuery.data;
  const accounts = profileQuery.data?.withdrawal_accounts ?? [];
  const withdrawals = withdrawalsQuery.data ?? [];

  const amountNum = Number(amount) || 0;
  const fee = rules ? rules.fee_flat + (amountNum * rules.fee_percent) / 100 : 0;
  const finalAmount = Math.max(0, amountNum - fee);

  const belowMin = rules ? amountNum > 0 && amountNum < rules.min_amount : false;
  const aboveMax = rules ? amountNum > rules.max_amount : false;
  const overBalance = rules ? amountNum > rules.available_balance : false;

  const handleSubmit = (e) => {
    e.preventDefault();
    withdrawMutation.mutate({ amount: amountNum, accountId, pin });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tarik Dana"
        description="Tarik saldo wallet anda ke rekening bank atau e-wallet"
        actions={
          <Link to="/accounts">
            <Button variant="secondary">
              <Settings2 size={16} />
              Kelola Akun
            </Button>
          </Link>
        }
      />

      {rules && (
        <Alert tone="info">
          <div className="flex items-start gap-2">
            <Info size={18} className="mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Aturan Penarikan</p>
              <p className="mt-1">
                Minimal {rupiah(rules.min_amount)} - Maksimal {rupiah(rules.max_amount)} · Biaya admin{' '}
                {rules.fee_percent > 0 ? `${rules.fee_percent}%` : rupiah(0)}
                {rules.fee_flat > 0 ? ` + ${rupiah(rules.fee_flat)}` : ''} · Saldo tersedia{' '}
                <b>{rupiah(rules.available_balance)}</b>
              </p>
            </div>
          </div>
        </Alert>
      )}

      <Card className="p-5">
        <h3 className="text-base font-semibold text-primary">Ajukan Penarikan</h3>

        {created ? (
          <div className="mt-4">
            <Alert tone="success">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Penarikan berhasil diajukan.</p>
                  <p className="mt-1 text-xs">{created.withdrawal_no}</p>
                  <p className="mt-1 text-xs">
                    {rupiah(created.amount)} - biaya {rupiah(created.fee)} = {rupiah(created.final_amount)}
                  </p>
                </div>
              </div>
            </Alert>
          </div>
        ) : accounts.length === 0 ? (
          <EmptyState
            icon={HandCoins}
            title="Belum ada akun penarikan"
            description="Tambahkan rekening bank atau e-wallet terlebih dahulu sebelum menarik dana."
            action={
              <Link to="/accounts">
                <Button>Tambah Akun</Button>
              </Link>
            }
          />
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <Field label="Akun Tujuan" required>
              <div className="space-y-2">
                {accounts.map((a) => {
                  const selected = String(a.id) === accountId;
                  return (
                    <label
                      key={a.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                        selected
                          ? 'border-primary bg-surface-container-low'
                          : 'border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container-low'
                      }`}
                    >
                      <input
                        type="radio"
                        name="account"
                        value={a.id}
                        checked={selected}
                        onChange={(e) => setAccountId(e.target.value)}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-fixed text-on-primary-fixed">
                        {a.account_type === 'bank' ? <Landmark size={16} /> : <Wallet size={16} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                          {a.provider}
                          {a.is_default && <Badge tone="blue">Utama</Badge>}
                        </span>
                        <span className="block truncate text-xs text-on-surface-variant">
                          {a.account_name} · {a.account_number}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </Field>

            <Field
              label="Jumlah Penarikan"
              required
              hint={rules ? `Minimal ${rupiah(rules.min_amount)} - Maksimal ${rupiah(rules.max_amount)}` : undefined}
              error={
                belowMin
                  ? 'Jumlah kurang dari minimal penarikan.'
                  : aboveMax
                    ? 'Jumlah melebihi maksimal penarikan.'
                    : overBalance
                      ? 'Jumlah melebihi saldo tersedia.'
                      : undefined
              }
            >
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Masukkan jumlah"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>

            {amountNum > 0 && rules && (
              <div className="space-y-1.5 rounded-xl border border-outline-variant/10 bg-surface-container-low p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Jumlah Tarik</span>
                  <b className="text-primary">{rupiah(amountNum)}</b>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">
                    Biaya Admin
                    {rules.fee_percent > 0 ? ` (${rules.fee_percent}%)` : ''}
                    {rules.fee_flat > 0 ? ` + ${rupiah(rules.fee_flat)}` : ''}
                  </span>
                  <b className="text-primary">{rupiah(fee)}</b>
                </div>
                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-1.5">
                  <span className="text-on-surface-variant">Diterima</span>
                  <b className="text-secondary">{rupiah(finalAmount)}</b>
                </div>
              </div>
            )}

            <Field
              label="PIN Transaksi"
              required
              hint="6 digit angka"
              error={pin && !/^\d{6}$/.test(pin) ? 'PIN harus 6 digit angka' : undefined}
            >
              <Input
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              />
            </Field>

            <Button
              type="submit"
              loading={withdrawMutation.isPending}
              disabled={amountNum <= 0 || belowMin || aboveMax || overBalance || !/^\d{6}$/.test(pin) || !accountId}
              className="w-full"
            >
              Ajukan Penarikan
            </Button>
          </form>
        )}
      </Card>

      <Section title="Riwayat Penarikan">
        {withdrawalsQuery.isLoading ? (
          <Spinner />
        ) : withdrawalsQuery.error ? (
          <Alert tone="error">{extractErrorMessage(withdrawalsQuery.error)}</Alert>
        ) : withdrawals.length === 0 ? (
          <Card>
            <EmptyState
              icon={HandCoins}
              title="Belum ada penarikan"
              description="Pengajuan penarikan anda akan tampil di sini."
            />
          </Card>
        ) : (
          <Card className="divide-y divide-outline-variant/20 px-4">
            {withdrawals.map((w) => (
              <div key={w.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">{w.withdrawal_no}</p>
                  <p className="text-xs text-on-surface-variant">
                    {w.provider} {w.account_number} · {formatDateTime(w.created_at)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-financial-data text-financial-data font-semibold text-primary tabular-nums">
                    {rupiah(w.amount)}
                  </p>
                  <StatusBadge status={w.status} />
                </div>
              </div>
            ))}
          </Card>
        )}
      </Section>
    </div>
  );
}

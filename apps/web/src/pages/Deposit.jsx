import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CheckCircle2, FileUp, Landmark, QrCode, Upload, Wallet } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { rupiah, formatDateTime, makeIdempotencyKey } from '../lib/format';
import {
  Alert,
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

const PRESETS = [100000, 250000, 500000, 1000000];

export default function Deposit() {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [newDeposit, setNewDeposit] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const fileInputRef = useRef(null);

  const walletQuery = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => (await api.get('/wallet')).data.data,
  });

  const instructionsQuery = useQuery({
    queryKey: ['deposit-instructions'],
    queryFn: async () => {
      const { data } = await api.get('/deposits/instructions');
      return data.data;
    },
  });

  const depositsQuery = useQuery({
    queryKey: ['deposits'],
    queryFn: async () => {
      const { data } = await api.get('/deposits', { params: { per_page: 10 } });
      return data.data.items ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (value) => {
      const { data } = await api.post('/deposits', {
        amount: value,
        idempotency_key: makeIdempotencyKey('dep'),
      });
      return data.data;
    },
    onSuccess: (deposit) => {
      setNewDeposit(deposit);
      setAmount('');
      toast.success('Deposit berhasil dibuat.');
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
    },
    onError: (e) => {
      toast.error(extractErrorMessage(e));
    },
  });

  const proofMutation = useMutation({
    mutationFn: async ({ depositId, file }) => {
      const formData = new FormData();
      formData.append('proof', file);
      const { data } = await api.post(`/deposits/${depositId}/proof`, formData);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Bukti pembayaran berhasil diunggah.');
      setProofFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
    },
    onError: (e) => {
      toast.error(extractErrorMessage(e));
    },
  });

  const instructions = instructionsQuery.data;
  const deposits = depositsQuery.data ?? [];
  const amountNum = Number(amount) || 0;
  const balance = walletQuery.data?.wallet?.balance;

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(amountNum);
  };

  const handleProof = (e) => {
    e.preventDefault();
    if (!newDeposit || !proofFile) return;
    proofMutation.mutate({ depositId: newDeposit.id, file: proofFile });
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Deposit" description="Tambahkan saldo wallet anda melalui pembayaran QRIS" />

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-container/40 text-on-secondary-container">
              <Wallet size={20} />
            </span>
            <div>
              <p className="text-sm font-medium text-on-surface-variant">Saldo Wallet</p>
              <p className="font-financial-data text-financial-data font-semibold text-primary tabular-nums">
                {walletQuery.isLoading ? '-' : rupiah(balance)}
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-outline">
            <p>Langsung masuk setelah</p>
            <p>pembayaran terverifikasi</p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2">
          <Landmark size={18} className="text-secondary" />
          <h3 className="text-base font-semibold text-primary">Instruksi Pembayaran QRIS</h3>
        </div>

        {instructionsQuery.isLoading ? (
          <Spinner />
        ) : instructionsQuery.error ? (
          <Alert tone="error" className="mt-4">
            Gagal memuat instruksi: {extractErrorMessage(instructionsQuery.error)}
          </Alert>
        ) : (
          <div className="mt-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-outline-variant/10 bg-surface-container-low px-3 py-2.5">
                <p className="text-[11px] text-on-surface-variant">Merchant</p>
                <p className="mt-0.5 truncate text-sm font-semibold text-primary">{instructions?.merchant_name}</p>
              </div>
              <div className="rounded-xl border border-outline-variant/10 bg-surface-container-low px-3 py-2.5">
                <p className="text-[11px] text-on-surface-variant">Minimal</p>
                <p className="mt-0.5 truncate text-sm font-semibold text-primary">{rupiah(instructions?.min_deposit)}</p>
              </div>
              <div className="rounded-xl border border-outline-variant/10 bg-surface-container-low px-3 py-2.5">
                <p className="text-[11px] text-on-surface-variant">Maksimal</p>
                <p className="mt-0.5 truncate text-sm font-semibold text-primary">{rupiah(instructions?.max_deposit)}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5">
              {instructions?.qris_image ? (
                <img
                  src={instructions.qris_image}
                  alt="QRIS"
                  className="mx-auto h-44 w-44 rounded-xl bg-white object-contain p-2"
                />
              ) : (
                <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-xl border-2 border-dashed border-outline bg-white text-outline">
                  <QrCode size={88} />
                </div>
              )}
              <p className="mt-3 text-center text-xs text-on-surface-variant">
                Pindai QRIS di aplikasi e-wallet atau mobile banking anda
              </p>
              {instructions?.qris_payload && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-on-surface-variant">QRIS Payload</p>
                  <pre className="mt-1 max-h-24 overflow-y-auto whitespace-pre-wrap break-all rounded-lg bg-surface-container-lowest p-3 font-mono text-xs text-on-surface">
                    {instructions.qris_payload}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2">
          <Landmark size={18} className="text-secondary" />
          <h3 className="text-base font-semibold text-primary">Buat Deposit</h3>
        </div>
        <form onSubmit={handleCreate} className="mt-4 space-y-4">
          <Field
            label="Jumlah Deposit"
            required
            hint={
              instructions
                ? `Minimal ${rupiah(instructions.min_deposit)} - Maksimal ${rupiah(instructions.max_deposit)}`
                : 'Masukkan jumlah yang ingin didepositkan'
            }
            error={
              amountNum > 0 &&
              instructions &&
              (amountNum < instructions.min_deposit || amountNum > instructions.max_deposit)
                ? 'Jumlah diluar rentang minimal dan maksimal deposit.'
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

          {instructions && (
            <div className="flex flex-wrap gap-2">
              {PRESETS.filter(
                (p) => p >= instructions.min_deposit && p <= instructions.max_deposit,
              ).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(String(p))}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    amountNum === p
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {rupiah(p)}
                </button>
              ))}
            </div>
          )}

          <Button
            type="submit"
            loading={createMutation.isPending}
            disabled={amountNum <= 0}
            className="w-full"
          >
            Buat Deposit
          </Button>
        </form>
      </Card>

      {newDeposit && (
        <Card className="p-5">
          <Alert tone="success">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Deposit {newDeposit.deposit_no} berhasil dibuat.</p>
                <p className="mt-1 text-xs">
                  Nominal {rupiah(newDeposit.amount)} · Metode {newDeposit.payment_method?.toUpperCase()}
                </p>
                <div className="mt-1">
                  <StatusBadge status={newDeposit.status} />
                </div>
              </div>
            </div>
          </Alert>

          {newDeposit.status === 'pending' && (
            <form onSubmit={handleProof} className="mt-4 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-outline bg-surface-container-low px-3.5 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  <FileUp size={16} />
                  {proofFile ? proofFile.name : 'Pilih Bukti Pembayaran'}
                </button>
                <Button
                  type="submit"
                  loading={proofMutation.isPending}
                  disabled={!proofFile}
                  className="shrink-0"
                >
                  <Upload size={16} />
                  Unggah
                </Button>
              </div>
            </form>
          )}
        </Card>
      )}

      <Section title="Riwayat Deposit">
        {depositsQuery.isLoading ? (
          <Spinner />
        ) : depositsQuery.error ? (
          <Alert tone="error">{extractErrorMessage(depositsQuery.error)}</Alert>
        ) : deposits.length === 0 ? (
          <Card>
            <EmptyState
              icon={Landmark}
              title="Belum ada deposit"
              description="Deposit yang anda buat akan tampil di sini."
            />
          </Card>
        ) : (
          <Card className="divide-y divide-outline-variant/20 px-4">
            {deposits.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">{d.deposit_no}</p>
                  <p className="text-xs text-on-surface-variant">{formatDateTime(d.created_at)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-financial-data text-financial-data font-semibold text-primary tabular-nums">
                    {rupiah(d.amount)}
                  </p>
                  <StatusBadge status={d.status} />
                </div>
              </div>
            ))}
          </Card>
        )}
      </Section>
    </div>
  );
}

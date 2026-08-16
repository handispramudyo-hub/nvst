import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CheckCircle2, FileUp, Landmark, QrCode, Upload } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { rupiah, formatDateTime, makeIdempotencyKey } from '../lib/format';
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Spinner,
  StatusBadge,
} from '../components/ui';
import Section from '../components/Section';

export default function Deposit() {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [newDeposit, setNewDeposit] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const fileInputRef = useRef(null);

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
      <div className="space-y-5">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Landmark size={18} className="text-primary-600" />
            <h3 className="text-base font-bold text-slate-900">Instruksi Pembayaran QRIS</h3>
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
                <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                  <p className="text-[11px] text-slate-400">Merchant</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{instructions?.merchant_name}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                  <p className="text-[11px] text-slate-400">Minimal</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{rupiah(instructions?.min_deposit)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                  <p className="text-[11px] text-slate-400">Maksimal</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{rupiah(instructions?.max_deposit)}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white text-slate-300">
                  <QrCode size={88} />
                </div>
                <p className="mt-3 text-center text-xs text-slate-400">
                  Pindai QRIS di aplikasi e-wallet atau mobile banking anda
                </p>
                {instructions?.qris_payload && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-slate-500">QRIS Payload</p>
                    <pre className="mt-1 max-h-24 overflow-y-auto whitespace-pre-wrap break-all rounded-lg bg-white p-3 font-mono text-xs text-slate-600">
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
            <Landmark size={18} className="text-primary-600" />
            <h3 className="text-base font-bold text-slate-900">Buat Deposit</h3>
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
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
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
      </div>

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
          <Card className="divide-y divide-slate-100 px-4">
            {deposits.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{d.deposit_no}</p>
                  <p className="text-xs text-slate-400">{formatDateTime(d.created_at)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-slate-900">{rupiah(d.amount)}</p>
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

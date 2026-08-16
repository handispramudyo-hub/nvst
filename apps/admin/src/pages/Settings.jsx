import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, extractErrorMessage } from '../lib/api';
import { PageHeader, Card, Button, Field, Input, Textarea, Spinner, Alert } from '../components/ui';

const GROUPS = [
  { key: 'payment', label: 'Pembayaran', description: 'Konfigurasi metode pembayaran deposit' },
  { key: 'withdrawal', label: 'Penarikan', description: 'Konfigurasi biaya dan batas penarikan' },
  { key: 'referral', label: 'Referral', description: 'Konfigurasi program referral' },
  { key: 'general', label: 'Umum', description: 'Pengaturan umum aplikasi' },
];

const KEY_LABELS = {
  qris_payload: 'QRIS Static Payload',
  merchant_name: 'Nama Merchant',
  min_deposit: 'Minimal Deposit',
  max_deposit: 'Maksimal Deposit',
  fee_flat: 'Biaya Tetap',
  fee_percent: 'Biaya (%)',
  min_amount: 'Minimal Penarikan',
  max_amount: 'Maksimal Penarikan',
  commission_percent: 'Persen Komisi (%)',
  app_name: 'Nama Aplikasi',
  currency: 'Mata Uang',
  help_phone: 'Telepon Bantuan',
  help_email: 'Email Bantuan',
};

function humanLabel(key) {
  if (KEY_LABELS[key]) return KEY_LABELS[key];
  return key.replace(/_/g, ' ');
}

function isLongText(key) {
  return key.includes('payload') || key.includes('description') || key.includes('terms');
}

function GroupForm({ groupKey, label, description, values, original }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(values ?? {});

  useEffect(() => {
    setForm(values ?? {});
  }, [values]);

  const save = useMutation({
    mutationFn: async () => {
      const changed = {};
      Object.entries(form).forEach(([k, v]) => {
        if (String(v ?? '') !== String(original?.[k] ?? '')) {
          changed[k] = String(v ?? '');
        }
      });
      if (Object.keys(changed).length === 0) {
        return null;
      }
      return (await api.put('/admin/settings', { settings: { [groupKey]: changed } })).data;
    },
    onSuccess: (res) => {
      if (!res) {
        toast.info('Tidak ada perubahan pada grup ini.');
        return;
      }
      toast.success(res.message ?? 'Pengaturan berhasil disimpan.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  const keys = Object.keys(values ?? {});
  if (keys.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-800">{label}</h3>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>
      <div className="space-y-4">
        {keys.map((key) => (
          <Field key={key} label={humanLabel(key)}>
            {isLongText(key) ? (
              <Textarea rows={3} value={form[key] ?? ''} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
            ) : (
              <Input value={form[key] ?? ''} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
            )}
          </Field>
        ))}
      </div>
      <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
        <Button onClick={() => save.mutate()} loading={save.isPending}>
          Simpan {label}
        </Button>
      </div>
    </Card>
  );
}

export default function Settings() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => (await api.get('/admin/settings')).data.data,
  });

  return (
    <div>
      <PageHeader title="Pengaturan" description="Kelola pengaturan sistem NiVEST" />
      {isError && <Alert className="mb-4">{extractErrorMessage(error)}</Alert>}
      {isLoading ? (
        <Spinner />
      ) : (
        data && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {GROUPS.map((g) => (
              <GroupForm
                key={g.key}
                groupKey={g.key}
                label={g.label}
                description={g.description}
                values={data[g.key]}
                original={data[g.key]}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}

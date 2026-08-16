import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ImageUp, Trash2 } from 'lucide-react';
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

  const keys = Object.keys(values ?? {}).filter((k) => k !== 'qris_image');
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

function QrisImageCard({ qrisImage }) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const upload = useMutation({
    mutationFn: async (f) => {
      const fd = new FormData();
      fd.append('qris_image', f);
      return (await api.post('/admin/settings/payment/qris-image', fd)).data;
    },
    onSuccess: () => {
      toast.success('Gambar QRIS berhasil diunggah.');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  const remove = useMutation({
    mutationFn: async () => (await api.delete('/admin/settings/payment/qris-image')).data,
    onSuccess: () => {
      toast.success('Gambar QRIS dihapus.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  const previewUrl = qrisImage ? `/storage/${qrisImage}` : null;

  return (
    <Card className="p-6">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-800">Gambar QRIS</h3>
        <p className="mt-0.5 text-sm text-slate-500">Gambar QRIS yang ditampilkan kepada pengguna saat deposit</p>
      </div>

      {previewUrl ? (
        <div className="mb-4 flex items-center justify-center rounded-xl border border-slate-200 bg-white p-4">
          <img src={previewUrl} alt="QRIS" className="h-48 w-48 rounded-lg object-contain" />
        </div>
      ) : (
        <div className="mb-4 flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400">
          <span className="text-sm font-medium">Belum ada gambar QRIS</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="hidden"
      />

      {file && <p className="mb-3 truncate text-sm text-slate-500">{file.name}</p>}

      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={upload.isPending}
          className="flex-1"
        >
          <ImageUp size={16} />
          {previewUrl ? 'Ganti Gambar' : 'Unggah Gambar'}
        </Button>
        {file && (
          <Button onClick={() => upload.mutate(file)} loading={upload.isPending} className="flex-1">
            Simpan
          </Button>
        )}
        {previewUrl && (
          <Button variant="danger" onClick={() => remove.mutate()} loading={remove.isPending}>
            <Trash2 size={16} />
            Hapus
          </Button>
        )}
      </div>
      <p className="mt-3 text-xs text-slate-400">Format JPG, PNG, atau WebP. Maksimal 5 MB.</p>
    </Card>
  );
}

export default function Settings() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => (await api.get('/admin/settings')).data.data,
  });

  const qrisImage = data?.payment?.qris_image ?? null;

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
            <QrisImageCard qrisImage={qrisImage} />
          </div>
        )
      )}
    </div>
  );
}

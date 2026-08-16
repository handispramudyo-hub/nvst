import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Landmark, Plus, Star, Trash2, Wallet } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { Badge, Button, Card, EmptyState, Field, Input, PageHeader, Select, Spinner } from '../components/ui';

export default function Accounts() {
  const queryClient = useQueryClient();
  const [accountType, setAccountType] = useState('bank');
  const [provider, setProvider] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/profile');
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values) => {
      const { data } = await api.post('/profile/withdrawal-accounts', values);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Akun penarikan berhasil ditambahkan.');
      setAccountType('bank');
      setProvider('');
      setAccountName('');
      setAccountNumber('');
      setIsDefault(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (e) => {
      toast.error(extractErrorMessage(e));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/profile/withdrawal-accounts/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success('Akun penarikan dihapus.');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (e) => {
      toast.error(extractErrorMessage(e));
    },
  });

  const accounts = profileQuery.data?.withdrawal_accounts ?? [];

  const handleDelete = (account) => {
    if (window.confirm(`Hapus akun ${account.provider} (${account.account_number})?`)) {
      deleteMutation.mutate(account.id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      account_type: accountType,
      provider,
      account_name: accountName,
      account_number: accountNumber,
      is_default: isDefault,
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kelola Akun Penarikan"
        description="Simpan rekening bank atau e-wallet untuk menerima dana penarikan"
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-primary-600" />
            <h3 className="text-base font-bold text-slate-900">Tambah Akun</h3>
          </div>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <Field label="Jenis Akun" required>
              <Select value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                <option value="bank">Bank</option>
                <option value="ewallet">E-Wallet</option>
              </Select>
            </Field>
            <Field label={accountType === 'bank' ? 'Nama Bank' : 'Nama E-Wallet'} required>
              <Input
                placeholder={accountType === 'bank' ? 'Contoh: BCA, Mandiri, BRI' : 'Contoh: OVO, GoPay, DANA'}
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              />
            </Field>
            <Field label="Nama Pemilik Akun" required>
              <Input placeholder="Nama sesuai rekening" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
            </Field>
            <Field label="Nomor Akun" required>
              <Input inputMode="numeric" placeholder="Nomor rekening / e-wallet" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            </Field>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              Jadikan akun utama
            </label>
            <Button
              type="submit"
              loading={createMutation.isPending}
              disabled={!provider || !accountName || !accountNumber}
              className="w-full"
            >
              Tambahkan Akun
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <h3 className="text-base font-bold text-slate-900">Akun Tersimpan ({accounts.length})</h3>
          {profileQuery.isLoading ? (
            <Spinner size={28} />
          ) : accounts.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="Belum ada akun"
              description="Tambahkan rekening bank atau e-wallet untuk menerima dana."
            />
          ) : (
            <div className="mt-3 space-y-3">
              {accounts.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                      {a.account_type === 'bank' ? <Landmark size={18} /> : <Wallet size={18} />}
                    </div>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-800">
                        {a.provider}
                        {a.is_default && (
                          <Badge tone="blue">
                            <Star size={10} className="mr-0.5 inline" />
                            Utama
                          </Badge>
                        )}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {a.account_name} · {a.account_number}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(a)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    title="Hapus akun"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

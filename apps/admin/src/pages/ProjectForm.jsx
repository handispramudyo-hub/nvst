import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { PageHeader, Card, Button, Field, Input, Textarea, Select, Spinner, Alert } from '../components/ui';

const schema = z
  .object({
    name: z.string().min(1, 'Nama proyek wajib diisi'),
    description: z.string().min(1, 'Deskripsi wajib diisi'),
    category: z.string().min(1, 'Kategori wajib diisi'),
    min_investment: z.coerce.number({ message: 'Harus berupa angka' }).min(1000, 'Minimal 1.000'),
    max_investment: z.coerce.number({ message: 'Harus berupa angka' }).min(1000, 'Minimal 1.000'),
    estimated_return: z.coerce
      .number({ message: 'Harus berupa angka' })
      .min(0.1, 'Minimal 0.1%')
      .max(100, 'Maksimal 100%'),
    duration_days: z.coerce.number({ message: 'Harus berupa angka' }).int('Harus bilangan bulat').min(1, 'Minimal 1 hari'),
    risk_level: z.enum(['low', 'medium', 'high']),
    start_date: z.string().min(1, 'Tanggal mulai wajib diisi'),
    end_date: z.string().min(1, 'Tanggal berakhir wajib diisi'),
    funding_target: z.coerce.number({ message: 'Harus berupa angka' }).min(1, 'Minimal 1'),
    status: z.enum(['draft', 'open', 'fully_funded', 'active', 'completed', 'closed']),
    terms: z.string().optional().default(''),
    risk_disclosure: z.string().optional().default(''),
    is_featured: z.boolean().optional().default(false),
    image: z.any().optional(),
  })
  .refine((d) => Number(d.max_investment) >= Number(d.min_investment), {
    message: 'Maksimum investasi harus lebih besar dari minimum',
    path: ['max_investment'],
  })
  .refine((d) => !d.start_date || !d.end_date || d.end_date > d.start_date, {
    message: 'Tanggal berakhir harus setelah tanggal mulai',
    path: ['end_date'],
  });

const RISK_LEVELS = [
  { value: 'low', label: 'Rendah' },
  { value: 'medium', label: 'Sedang' },
  { value: 'high', label: 'Tinggi' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'fully_funded', label: 'Fully Funded' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'closed', label: 'Closed' },
];

const SIMPLE_FIELDS = [
  'name',
  'description',
  'category',
  'min_investment',
  'max_investment',
  'estimated_return',
  'duration_days',
  'risk_level',
  'start_date',
  'end_date',
  'funding_target',
  'status',
  'terms',
  'risk_disclosure',
];

export default function ProjectForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['admin', 'projects', id],
    queryFn: async () => (await api.get(`/admin/projects/${id}`)).data.data,
    enabled: isEdit,
  });

  useEffect(() => {
    if (!project) return;
    SIMPLE_FIELDS.forEach((f) => setValue(f, project[f] ?? ''));
    setValue('is_featured', Boolean(project.is_featured));
  }, [project, setValue]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      if (isEdit) {
        return (await api.put(`/admin/projects/${id}`, formData)).data;
      }
      return (await api.post('/admin/projects', formData)).data;
    },
    onSuccess: (res) => {
      toast.success(res.message ?? 'Proyek berhasil disimpan.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      navigate('/projects');
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  const onSubmit = handleSubmit((values) => {
    const fd = new FormData();
    SIMPLE_FIELDS.forEach((f) => {
      const v = values[f];
      if (v !== undefined && v !== null && v !== '') {
        fd.append(f, String(v));
      }
    });
    fd.append('is_featured', values.is_featured ? '1' : '0');
    if (values.image?.[0]) {
      fd.append('image', values.image[0]);
    }
    mutation.mutate(fd);
  });

  if (isEdit && projectLoading) return <Spinner />;
  if (isEdit && !project) return <Alert>Proyek tidak ditemukan.</Alert>;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Proyek' : 'Buat Proyek'}
        description={isEdit ? 'Perbarui informasi proyek' : 'Tambahkan proyek investasi baru'}
        actions={
          <Button variant="outline" onClick={() => navigate('/projects')}>
            <ArrowLeft size={16} />
            Kembali
          </Button>
        }
      />
      <Card className="p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Field label="Nama Proyek" required error={errors.name?.message}>
              <Input placeholder="Contoh: UMKM Kopi Nusantara" {...register('name')} />
            </Field>
            <Field label="Kategori" required error={errors.category?.message}>
              <Input placeholder="Contoh: F&B, Retail, Pertanian" {...register('category')} />
            </Field>
          </div>

          <Field label="Deskripsi" required error={errors.description?.message}>
            <Textarea placeholder="Deskripsi lengkap proyek" rows={4} {...register('description')} />
          </Field>

          <Field label="Gambar Proyek" hint={isEdit ? 'Kosongkan jika tidak ingin mengganti gambar.' : 'Format: JPG, PNG, WebP (maks 4 MB)'}>
            <Input type="file" accept="image/jpeg,image/png,image/webp" {...register('image')} />
            {isEdit && project?.image && (
              <img src={project.image} alt={project.name} className="mt-2 h-24 w-24 rounded-lg object-cover" />
            )}
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Min. Investasi" required error={errors.min_investment?.message}>
              <Input type="number" placeholder="100000" {...register('min_investment')} />
            </Field>
            <Field label="Maks. Investasi" required error={errors.max_investment?.message}>
              <Input type="number" placeholder="50000000" {...register('max_investment')} />
            </Field>
            <Field label="Target Dana" required error={errors.funding_target?.message}>
              <Input type="number" placeholder="100000000" {...register('funding_target')} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Estimasi Return (%)" required error={errors.estimated_return?.message}>
              <Input type="number" step="0.1" placeholder="12" {...register('estimated_return')} />
            </Field>
            <Field label="Durasi (hari)" required error={errors.duration_days?.message}>
              <Input type="number" placeholder="90" {...register('duration_days')} />
            </Field>
            <Field label="Level Risiko" required error={errors.risk_level?.message}>
              <Select {...register('risk_level')}>
                {RISK_LEVELS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Tanggal Mulai" required error={errors.start_date?.message}>
              <Input type="date" {...register('start_date')} />
            </Field>
            <Field label="Tanggal Berakhir" required error={errors.end_date?.message}>
              <Input type="date" {...register('end_date')} />
            </Field>
            <Field label="Status" required error={errors.status?.message}>
              <Select {...register('status')}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Syarat & Ketentuan" error={errors.terms?.message}>
            <Textarea rows={3} placeholder="Syarat dan ketentuan proyek" {...register('terms')} />
          </Field>

          <Field label="Pernyataan Risiko" error={errors.risk_disclosure?.message}>
            <Textarea rows={3} placeholder="Peringatan risiko investasi" {...register('risk_disclosure')} />
          </Field>

          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              {...register('is_featured')}
            />
            Jadikan proyek unggulan (featured)
          </label>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate('/projects')}>
              Batal
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {isEdit ? 'Simpan Perubahan' : 'Buat Proyek'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

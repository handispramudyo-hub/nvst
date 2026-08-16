import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Building2, Check, Cpu, Leaf, Store, Zap } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AmountInput } from '@/components/ui/amount-input';
import { Button } from '@/components/ui/button';
import { QuickChips } from '@/components/ui/quick-chips';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spinner } from '@/components/ui/spinner';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProject, useWallet } from '@/hooks/queries';
import { formatRupiah, formatRupiahDecimal } from '@/lib/format';

const CATEGORY_META: Record<string, { icon: React.ComponentType<{ size?: number; color?: string }>; colors: readonly [string, string] }> = {
  Agrikultur: { icon: Leaf, colors: ['#34D399', '#059669'] },
  Energi: { icon: Zap, colors: ['#FBBF24', '#EA580C'] },
  Properti: { icon: Building2, colors: ['#38BDF8', '#2563EB'] },
  Teknologi: { icon: Cpu, colors: ['#A78BFA', '#9333EA'] },
  UMKM: { icon: Store, colors: ['#60A5FA', '#1D4ED8'] },
};

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1).replace('.0', '')}M`;
  if (value >= 1_000) return `Rp ${Math.round(value / 1_000)}k`;
  return `Rp ${value}`;
}

export default function InvestCreateScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const id = Number(projectId);
  const router = useRouter();
  const theme = useTheme();
  const { data: project, isLoading } = useProject(id);
  const { data: wallet } = useWallet();
  const [amount, setAmount] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  if (isLoading || !project) {
    return (
      <Screen>
        <ScreenHeader title="Investasi" />
        <Spinner />
      </Screen>
    );
  }

  const numericAmount = Number(amount) || 0;
  const balance = wallet?.wallet.balance ?? 0;
  const monthlyProfit = numericAmount > 0 ? (numericAmount * project.estimated_return) / 100 / 12 : 0;
  const cat = CATEGORY_META[project.category ?? ''] ?? { icon: Store, colors: ['#60A5FA', '#1D4ED8'] as const };
  const CatIcon = cat.icon;

  const chipValues = Array.from(
    new Set([project.min_investment, project.min_investment * 5, project.min_investment * 10, project.min_investment * 25]),
  );

  const onSubmit = () => {
    setFormError(null);
    if (numericAmount < project.min_investment) {
      setFormError(`Minimal investasi ${formatRupiah(project.min_investment)}`);
      return;
    }
    if (numericAmount > project.max_investment) {
      setFormError(`Maksimal investasi ${formatRupiah(project.max_investment)}`);
      return;
    }
    if (numericAmount > balance) {
      setFormError('Nominal melebihi saldo tersedia.');
      return;
    }
    if (!agreed) {
      setFormError('Anda harus menyetujui syarat & ketentuan terlebih dahulu.');
      return;
    }
    router.push(`/investments/confirm?projectId=${project.id}&amount=${numericAmount}`);
  };

  return (
    <Screen
      scroll
      footer={<Button title="Lanjutkan Investasi" size="lg" onPress={onSubmit} />}>
      <ScreenHeader title="Investasi" />

      <View style={[styles.projectCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        {project.image ? (
          <Image source={{ uri: project.image }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <LinearGradient colors={[...cat.colors]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.thumb}>
            <CatIcon size={22} color="#FFFFFF" />
          </LinearGradient>
        )}
        <View style={styles.projectText}>
          <Text style={[styles.projectName, { color: theme.text }]} numberOfLines={1}>
            {project.name}
          </Text>
          <Text style={styles.projectReturn}>Est. {project.estimated_return}%/tahun</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Nominal Investasi</Text>
        <AmountInput
          value={amount}
          onChangeText={(v) => {
            setAmount(v.replace(/[^\d]/g, ''));
            setFormError(null);
          }}
          placeholder="Masukkan nominal"
        />
        <QuickChips
          options={chipValues.map((v) => ({ label: formatCompact(v), value: v }))}
          selected={numericAmount > 0 && chipValues.includes(numericAmount) ? numericAmount : undefined}
          onSelect={(v) => setAmount(String(v))}
        />
      </View>

      <View style={[styles.infoCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        <InfoRow label="Estimasi Return" value={`${formatRupiahDecimal(monthlyProfit)} /bulan`} valueColor={theme.success} bold />
        <InfoRow label="Tenor" value={`${project.duration_days} Hari`} />
        <InfoRow label="Saldo Tersedia" value={formatRupiah(balance)} />
      </View>

      <Pressable onPress={() => setAgreed(!agreed)} style={styles.agreement}>
        <View style={[styles.checkbox, { backgroundColor: agreed ? theme.primary : 'transparent', borderColor: agreed ? theme.primary : theme.border }]}>
          {agreed ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
        </View>
        <Text style={[styles.agreementText, { color: theme.textSecondary }]}>
          Saya telah membaca dan menyetujui syarat & ketentuan investasi
        </Text>
      </Pressable>

      {formError ? <Text style={[styles.error, { color: theme.danger }]}>{formError}</Text> : null}
    </Screen>
  );
}

function InfoRow({ label, value, valueColor, bold }: { label: string; value: string; valueColor?: string; bold?: boolean }) {
  const theme = useTheme();
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: valueColor ?? theme.text, fontWeight: bold ? '700' : '500' }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectText: {
    flex: 1,
    gap: Spacing.one,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '700',
  },
  projectReturn: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    gap: Spacing.three,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 13,
  },
  agreement: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two + 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  agreementText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    fontSize: 13,
  },
});

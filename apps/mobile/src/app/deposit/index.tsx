import { router } from 'expo-router';
import { Landmark, QrCode, Wallet } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AmountInput } from '@/components/ui/amount-input';
import { Button } from '@/components/ui/button';
import { QuickChips } from '@/components/ui/quick-chips';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spinner } from '@/components/ui/spinner';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCreateDeposit, useDepositInstructions } from '@/hooks/queries';
import { extractErrorMessage } from '@/lib/api';
import { makeIdempotencyKey } from '@/lib/idempotency';
import { formatRupiah } from '@/lib/format';

type MethodId = 'qris' | 'va' | 'ewallet';

const METHODS: { id: MethodId; label: string; desc: string; icon: React.ComponentType<{ size?: number; color?: string }>; bg: string; fg: string }[] = [
  { id: 'qris', label: 'QRIS', desc: 'Konfirmasi Instan', icon: QrCode, bg: 'warningLight', fg: 'warning' },
  { id: 'va', label: 'Transfer Virtual Account', desc: 'BCA, Mandiri, BNI, BRI', icon: Landmark, bg: 'primaryLight', fg: 'primary' },
  { id: 'ewallet', label: 'E-Wallet', desc: 'GoPay, OVO, Dana', icon: Wallet, bg: 'successLight', fg: 'success' },
];

const QUICK_AMOUNTS = [100_000, 250_000, 500_000, 1_000_000];

export default function DepositScreen() {
  const theme = useTheme();
  const { data: instructions, isLoading } = useDepositInstructions();
  const createDeposit = useCreateDeposit();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<MethodId>('qris');
  const [formError, setFormError] = useState<string | null>(null);

  const numericAmount = Number(amount) || 0;

  const onSubmit = async () => {
    setFormError(null);
    if (numericAmount <= 0) {
      setFormError('Jumlah harus lebih dari 0');
      return;
    }
    if (instructions && numericAmount < instructions.min_deposit) {
      setFormError(`Minimal deposit ${formatRupiah(instructions.min_deposit)}`);
      return;
    }
    if (instructions && numericAmount > instructions.max_deposit) {
      setFormError(`Maksimal deposit ${formatRupiah(instructions.max_deposit)}`);
      return;
    }
    if (method !== 'qris') {
      setFormError('Saat ini metode pembayaran yang tersedia adalah QRIS.');
      return;
    }
    try {
      const deposit = await createDeposit.mutateAsync({
        amount: numericAmount,
        idempotency_key: makeIdempotencyKey('dep'),
      });
      router.push(`/deposit/confirm/${deposit.id}`);
    } catch (e) {
      setFormError(extractErrorMessage(e));
    }
  };

  if (isLoading || !instructions) {
    return (
      <Screen>
        <ScreenHeader title="Deposit" />
        <Spinner />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      footer={
        <Button
          title={createDeposit.isPending ? 'Memproses...' : 'Lanjutkan Deposit'}
          onPress={onSubmit}
          loading={createDeposit.isPending}
          size="lg"
        />
      }>
      <ScreenHeader title="Deposit" />

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Nominal Deposit</Text>
        <AmountInput
          value={amount}
          onChangeText={(v) => {
            setAmount(v.replace(/[^\d]/g, ''));
            setFormError(null);
          }}
          placeholder="Masukkan nominal"
        />
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          Minimal deposit {formatRupiah(instructions.min_deposit)}
        </Text>
        <QuickChips
          options={QUICK_AMOUNTS.map((v) => ({ label: formatRupiah(v), value: v }))}
          selected={numericAmount > 0 && QUICK_AMOUNTS.includes(numericAmount) ? numericAmount : undefined}
          onSelect={(v) => setAmount(String(v))}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Pilih Metode Pembayaran</Text>
        <View style={styles.methods}>
          {METHODS.map((m) => {
            const Icon = m.icon;
            const active = method === m.id;
            return (
              <Pressable key={m.id} onPress={() => setMethod(m.id)}>
                <View
                  style={[
                    styles.method,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: active ? theme.primary : theme.border,
                    },
                  ]}>
                  <View style={[styles.methodIcon, { backgroundColor: theme[m.bg as keyof typeof theme] }]}>
                    <Icon size={20} color={theme[m.fg as keyof typeof theme]} />
                  </View>
                  <View style={styles.methodText}>
                    <Text style={[styles.methodLabel, { color: theme.text }]}>{m.label}</Text>
                    <Text style={[styles.methodDesc, { color: theme.textSecondary }]}>{m.desc}</Text>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: active ? theme.primary : theme.border,
                        backgroundColor: active ? theme.primary : 'transparent',
                      },
                    ]}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {formError ? <Text style={[styles.error, { color: theme.danger }]}>{formError}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.three,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
  },
  methods: {
    gap: Spacing.two + 2,
  },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    padding: Spacing.three,
  },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodText: {
    flex: 1,
    gap: 2,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  methodDesc: {
    fontSize: 11,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  error: {
    fontSize: 13,
  },
});

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DetailRow } from '@/components/ui/detail-row';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spinner } from '@/components/ui/spinner';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useDepositInstructions, useDeposits } from '@/hooks/queries';
import { copyText } from '@/lib/clipboard';
import { formatRupiah } from '@/lib/format';

const TIMEOUT_MINUTES = 15;

export default function DepositConfirmScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const depositId = Number(id);
  const router = useRouter();
  const theme = useTheme();
  const { data: deposits, isLoading } = useDeposits();
  const { data: instructions } = useDepositInstructions();
  const [now, setNow] = useState(() => Date.now());

  const deposit = deposits?.items.find((d) => d.id === depositId);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remaining = useMemo(() => {
    if (!deposit) return 0;
    const createdAt = new Date(deposit.created_at).getTime();
    const deadline = createdAt + TIMEOUT_MINUTES * 60_000;
    return Math.max(0, Math.floor((deadline - now) / 1000));
  }, [deposit, now]);

  const remainingText = useMemo(() => {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [remaining]);

  if (isLoading || !deposit) {
    return (
      <Screen>
        <ScreenHeader title="Konfirmasi Deposit" />
        <Spinner />
      </Screen>
    );
  }

  const qrisPayload = instructions?.qris_payload ?? null;

  const onCopy = async () => {
    if (!qrisPayload) return;
    const ok = await copyText(qrisPayload);
    if (ok) {
      Alert.alert('Berhasil', 'Kode QRIS disalin ke clipboard.');
    } else {
      Alert.alert('Kode QRIS', qrisPayload);
    }
  };

  return (
    <Screen
      scroll
      footer={
        <View style={styles.actionRow}>
          <Button title="Salin Kode" variant="outline" size="lg" style={styles.halfBtn} onPress={onCopy} />
          <Button
            title="Sudah Bayar"
            size="lg"
            style={styles.halfBtn}
            onPress={() => router.push(`/deposit/${deposit.id}`)}
          />
        </View>
      }>
      <ScreenHeader title="Konfirmasi Deposit" />

      <Card>
        <View style={styles.summary}>
          <DetailRow label="Metode" value="QRIS" />
          <DetailRow label="Nominal" value={formatRupiah(deposit.amount)} />
          <DetailRow label="Biaya Admin" value="Rp 0" />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <DetailRow label="Total" value={formatRupiah(deposit.amount)} valueBold highlight />
        </View>
      </Card>

      <Card>
        <View style={styles.qrCard}>
          <Text style={[styles.timer, { color: theme.danger }]}>
            Silakan lakukan pembayaran dalam waktu {remainingText} menit
          </Text>
          <View style={styles.qrBox}>
            {qrisPayload ? (
              <QRCode value={qrisPayload} size={168} />
            ) : (
              <Text style={[styles.noQr, { color: theme.textSecondary }]}>QRIS belum tersedia</Text>
            )}
          </View>
          <Text style={[styles.scanLabel, { color: theme.text }]}>Scan QR Code untuk membayar</Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    gap: Spacing.three,
  },
  divider: {
    height: 1,
  },
  qrCard: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  timer: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  qrBox: {
    width: 200,
    height: 200,
    borderRadius: Radius.lg,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  noQr: {
    fontSize: 13,
  },
  scanLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  halfBtn: {
    flex: 1,
  },
});

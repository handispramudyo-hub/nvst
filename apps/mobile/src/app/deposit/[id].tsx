import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Clock, XCircle } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';

import { SuccessCircle } from '@/components/ui/success-circle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DetailRow } from '@/components/ui/detail-row';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spinner } from '@/components/ui/spinner';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useDeposits, useUploadDepositProof } from '@/hooks/queries';
import { extractErrorMessage } from '@/lib/api';
import { formatDateTime, formatRupiah } from '@/lib/format';
import type { DepositStatus } from '@/lib/types';

const STATUS_META: Record<DepositStatus, { label: string; tone: 'warning' | 'info' | 'success' | 'danger' }> = {
  pending: { label: 'Menunggu Pembayaran', tone: 'warning' },
  paid: { label: 'Menunggu Verifikasi', tone: 'info' },
  approved: { label: 'Disetujui', tone: 'success' },
  rejected: { label: 'Ditolak', tone: 'danger' },
};

export default function DepositDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const depositId = Number(id);
  const router = useRouter();
  const theme = useTheme();
  const { data, isLoading, refetch } = useDeposits();
  const uploadProof = useUploadDepositProof();
  const [uploading, setUploading] = useState(false);

  const deposit = data?.items.find((d) => d.id === depositId);

  if (isLoading || !data) {
    return (
      <Screen>
        <ScreenHeader title="Detail Deposit" />
        <Spinner />
      </Screen>
    );
  }

  if (!deposit) {
    return (
      <Screen>
        <ScreenHeader title="Detail Deposit" />
        <EmptyState title="Deposit tidak ditemukan" />
      </Screen>
    );
  }

  const meta = STATUS_META[deposit.status] ?? STATUS_META.pending;

  const pickAndUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin Ditolak', 'Akses galeri diperlukan untuk mengunggah bukti pembayaran.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      await uploadProof.mutateAsync({
        id: deposit.id,
        uri: asset.uri,
        fileName: asset.fileName ?? `proof-${deposit.deposit_no}.jpg`,
        mimeType: asset.mimeType ?? 'image/jpeg',
      });
      await refetch();
      Alert.alert('Berhasil', 'Bukti pembayaran berhasil diunggah.');
    } catch (e) {
      Alert.alert('Gagal', extractErrorMessage(e));
    } finally {
      setUploading(false);
    }
  };

  const goHome = () => {
    router.dismissAll();
    router.replace('/(tabs)');
  };

  if (deposit.status === 'approved') {
    return (
      <Screen
        scroll
        footer={
          <Button title="Kembali ke Beranda" size="lg" onPress={goHome} />
        }>
        <ScreenHeader title="" showBack={false} />
        <View style={styles.successWrap}>
          <SuccessCircle size={72} />
          <View style={styles.titleBlock}>
            <Text style={[styles.successTitle, { color: theme.text }]}>Deposit Berhasil!</Text>
            <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>
              Saldo Anda telah ditambahkan
            </Text>
          </View>
          <View style={[styles.amountBox, { backgroundColor: theme.backgroundElement }]}>
            <Text style={styles.amountText}>{formatRupiah(deposit.amount)}</Text>
          </View>
          <Card>
            <View style={styles.summary}>
              <DetailRow label="Metode" value={deposit.payment_method.toUpperCase()} />
              <DetailRow label="Waktu" value={formatDateTime(deposit.created_at)} />
              <DetailRow label="No. Referensi" value={deposit.deposit_no} valueBold />
            </View>
          </Card>
        </View>
      </Screen>
    );
  }

  const canUpload = deposit.status === 'pending' || deposit.status === 'paid';

  return (
    <Screen
      scroll
      footer={
        canUpload && !deposit.proof_path ? (
          <Button
            title="Unggah Bukti Pembayaran"
            icon={<Camera size={18} color="#fff" />}
            onPress={pickAndUpload}
            loading={uploading}
            size="lg"
          />
        ) : null
      }>
      <ScreenHeader title={`Deposit ${deposit.deposit_no}`} />

      <Card>
        <View style={styles.summary}>
          <DetailRow label="Nomor" value={deposit.deposit_no} />
          <DetailRow label="Jumlah" value={formatRupiah(deposit.amount)} valueBold />
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>Metode</Text>
            <Badge label={deposit.payment_method.toUpperCase()} tone="neutral" size="sm" />
          </View>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>Status</Text>
            <Badge label={meta.label} tone={meta.tone} size="sm" />
          </View>
          <DetailRow label="Dibuat" value={formatDateTime(deposit.created_at)} />
          {deposit.admin_note ? <DetailRow label="Catatan Admin" value={deposit.admin_note} /> : null}
        </View>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Bukti Pembayaran</Text>
        {deposit.proof_path ? (
          <View style={styles.proofWrap}>
            <Image source={{ uri: deposit.proof_path }} style={styles.proof} resizeMode="cover" />
            <View style={styles.proofStatusRow}>
              {deposit.status === 'rejected' ? (
                <XCircle size={20} color={theme.danger} />
              ) : (
                <Clock size={20} color={theme.warning} />
              )}
              <Text style={[styles.proofStatus, { color: theme.textSecondary }]}>
                {deposit.status === 'rejected' ? 'Pembayaran ditolak admin.' : 'Menunggu verifikasi admin.'}
              </Text>
            </View>
          </View>
        ) : canUpload ? (
          <View style={styles.uploadArea}>
            <Text style={[styles.uploadHint, { color: theme.textSecondary }]}>
              Unggah screenshot bukti transfer QRIS untuk mempercepat verifikasi.
            </Text>
            <Button title="Unggah Bukti" icon={<Camera size={18} color="#fff" />} onPress={pickAndUpload} loading={uploading} />
          </View>
        ) : (
          <Text style={[styles.uploadHint, { color: theme.textSecondary }]}>Belum ada bukti pembayaran.</Text>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
  },
  rowLabel: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.three,
  },
  successWrap: {
    alignItems: 'center',
    gap: Spacing.four,
  },
  titleBlock: {
    alignItems: 'center',
    gap: Spacing.one + 2,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  successSubtitle: {
    fontSize: 14,
  },
  amountBox: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  amountText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#16A34A',
  },
  proofWrap: {
    gap: Spacing.two,
  },
  proof: {
    width: '100%',
    height: 220,
    borderRadius: Radius.md,
  },
  proofStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 2,
  },
  proofStatus: {
    fontSize: 13,
    flex: 1,
  },
  uploadArea: {
    gap: Spacing.three,
  },
  uploadHint: {
    fontSize: 13,
    lineHeight: 19,
  },
});

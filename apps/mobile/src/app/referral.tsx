import { Users } from 'lucide-react-native';
import { FlatList, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Section } from '@/components/ui/section';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spinner } from '@/components/ui/spinner';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useReferral, useReferralUsers } from '@/hooks/queries';
import { formatDate, formatRupiah } from '@/lib/format';

export default function ReferralScreen() {
  const theme = useTheme();
  const { data: summary, isLoading: summaryLoading } = useReferral();
  const { data: users, isLoading: usersLoading } = useReferralUsers();

  const shareLink = async () => {
    if (!summary) return;
    try {
      await Share.share({
        message: `Ajak teman anda investasi di NiVEST dan dapatkan komisi ${summary.commission_percent}%! Pakai kode saya: ${summary.referral_code}. Link: ${summary.referral_link}`,
      });
    } catch {
      // ignore
    }
  };

  return (
    <Screen>
      <ScreenHeader title="Referral" />

      {summaryLoading || !summary ? (
        <Spinner />
      ) : (
        <>
          <Card style={styles.summaryCard}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Kode Referral Anda</Text>
            <Text style={[styles.code, { color: theme.primary }]}>{summary.referral_code}</Text>
            <View style={styles.statsRow}>
              <ReferralStat label="Diundang" value={String(summary.total_invited)} />
              <ReferralStat label="Terkualifikasi" value={String(summary.total_qualified)} />
              <ReferralStat label="Komisi" value={formatRupiah(summary.total_commission)} highlight />
            </View>
            <Button title="Bagikan Kode" onPress={shareLink} size="sm" />
            <Text style={[styles.hint, { color: theme.textSecondary }]}>
              Setiap referral yang melakukan deposit dan investasi aktif, anda mendapat komisi{' '}
              {summary.commission_percent}% dari nilai investasinya.
            </Text>
          </Card>

          <Section title="Teman yang Direferensikan">
            {usersLoading ? (
              <Spinner size="small" />
            ) : (
              <FlatList
                data={users?.items ?? []}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <Pressable>
                    <Card style={styles.userCard}>
                      <View style={[styles.avatar, { backgroundColor: theme.backgroundSelected }]}>
                        <Users size={18} color={theme.primary} />
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={[styles.userName, { color: theme.text }]}>{item.referred.name}</Text>
                        <Text style={[styles.userMeta, { color: theme.textSecondary }]}>
                          {formatDate(item.created_at)}
                        </Text>
                      </View>
                      <Badge
                        label={item.status === 'qualified' ? 'Aktif' : 'Menunggu'}
                        tone={item.status === 'qualified' ? 'success' : 'warning'}
                      />
                    </Card>
                  </Pressable>
                )}
                ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
                ListEmptyComponent={
                  <EmptyState title="Belum ada referral" subtitle="Bagikan kode anda untuk mulai mengundang teman." />
                }
              />
            )}
          </Section>
        </>
      )}
    </Screen>
  );
}

function ReferralStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const theme = useTheme();
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: highlight ? theme.success : theme.text }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    gap: Spacing.three,
  },
  summaryLabel: {
    fontSize: 13,
  },
  code: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
  },
  userMeta: {
    fontSize: 12,
  },
});

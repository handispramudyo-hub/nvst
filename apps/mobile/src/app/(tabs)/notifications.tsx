import { Bell, CheckCheck } from 'lucide-react-native';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Spinner } from '@/components/ui/spinner';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/hooks/queries';
import { relativeTime } from '@/lib/format';
import type { AppNotification } from '@/lib/types';

export default function NotificationsTabScreen() {
  const theme = useTheme();
  const { data, isLoading, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const handlePress = async (n: AppNotification) => {
    if (!n.read_at) {
      await markRead.mutateAsync(n.id);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Notifikasi</Text>
        {(data?.unread_count ?? 0) > 0 ? (
          <Pressable onPress={() => markAll.mutateAsync()} hitSlop={8}>
            <CheckCheck size={20} color={theme.primary} />
          </Pressable>
        ) : null}
      </View>
      {isLoading ? (
        <Spinner />
      ) : (
        <FlatList
          data={data?.notifications ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Pressable onPress={() => handlePress(item)}>
              <View
                style={[
                  styles.item,
                  {
                    backgroundColor: item.read_at ? 'transparent' : theme.primaryLight,
                  },
                ]}>
                <View style={styles.dotWrap}>
                  <Bell size={18} color={item.read_at ? theme.textSecondary : theme.primary} />
                  {!item.read_at ? <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} /> : null}
                </View>
                <View style={styles.body}>
                  <Text style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.message, { color: theme.textSecondary }]}>{item.body}</Text>
                  <Text style={[styles.time, { color: theme.textSecondary }]}>{relativeTime(item.created_at)}</Text>
                </View>
              </View>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon={<Bell size={32} color={theme.textSecondary} />}
              title="Tidak ada notifikasi"
              subtitle="Notifikasi deposit, investasi, dan penarikan akan tampil di sini."
            />
          }
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  item: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 12,
  },
  dotWrap: {
    width: 28,
    alignItems: 'center',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 2,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    marginTop: 2,
  },
  sep: {
    height: Spacing.two,
  },
  list: {
    paddingBottom: Spacing.four,
  },
});

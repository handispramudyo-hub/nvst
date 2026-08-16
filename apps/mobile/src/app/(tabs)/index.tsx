import { router } from 'expo-router';
import { Bell, ChevronRight, FolderOpen } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProjectCard } from '@/components/project-card';
import { QuickActions } from '@/components/quick-actions';
import { WalletCard } from '@/components/wallet-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { Screen } from '@/components/ui/screen';
import { useTheme } from '@/hooks/use-theme';
import { useNotifications, useProjects, useWallet } from '@/hooks/queries';
import { useAuthStore } from '@/store/auth';

export default function HomeScreen() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: notif } = useNotifications();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 19) return 'Selamat sore';
    return 'Selamat malam';
  })();

  return (
    <Screen scroll>
      <View style={styles.topbar}>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>{greeting},</Text>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {user?.name ?? 'Pengguna'}
          </Text>
        </View>
        <Pressable onPress={() => router.push('/notifications')} hitSlop={8} style={styles.bellWrap}>
          <Bell size={22} color={theme.text} />
          {(notif?.unread_count ?? 0) > 0 ? (
            <View style={[styles.dot, { backgroundColor: theme.danger }]} />
          ) : null}
        </Pressable>
      </View>

      {walletLoading || !wallet ? (
        <Spinner size="small" />
      ) : (
        <WalletCard wallet={wallet.wallet} todayProfit={wallet.today_profit} />
      )}

      <QuickActions />

      <View>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Proyek Tersedia</Text>
          <Pressable onPress={() => router.push('/(tabs)/projects')} style={styles.linkRow}>
            <Text style={[styles.linkText, { color: theme.primary }]}>Lihat Semua</Text>
            <ChevronRight size={14} color={theme.primary} />
          </Pressable>
        </View>
        {projectsLoading ? (
          <Spinner size="small" />
        ) : projects && projects.items.length > 0 ? (
          <View style={styles.projects}>
            {projects.items.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </View>
        ) : (
          <EmptyState
            icon={<FolderOpen size={32} color={theme.textSecondary} />}
            title="Belum ada proyek"
            subtitle="Proyek investasi baru akan segera hadir."
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 14,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  bellWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  projects: {
    gap: 12,
    marginTop: 12,
  },
});

import { FolderOpen, SearchX } from 'lucide-react-native';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { ProjectCard } from '@/components/project-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProjects } from '@/hooks/queries';

export default function ProjectsScreen() {
  const theme = useTheme();
  const { data, isLoading, isError, refetch } = useProjects();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Proyek Investasi</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Pilih proyek yang sesuai dengan profil risiko anda
        </Text>
      </View>

      {isLoading ? (
        <Spinner />
      ) : isError || !data ? (
        <EmptyState
          icon={<SearchX size={32} color={theme.textSecondary} />}
          title="Gagal memuat proyek"
          subtitle="Periksa koneksi anda, lalu coba lagi."
        />
      ) : (
        <FlatList
          data={data.items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ProjectCard project={item} />}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.three }} />}
          ListEmptyComponent={
            <EmptyState
              icon={<FolderOpen size={32} color={theme.textSecondary} />}
              title="Belum ada proyek"
              subtitle="Proyek investasi baru akan segera hadir."
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
    gap: 2,
    marginBottom: Spacing.one,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
  },
  list: {
    paddingBottom: Spacing.four,
  },
});

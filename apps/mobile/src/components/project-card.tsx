import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Building2, Cpu, Leaf, Store, Zap } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatRupiah } from '@/lib/format';
import type { Project } from '@/lib/types';

const CATEGORY_META: Record<string, { icon: React.ComponentType<{ size?: number; color?: string }>; colors: readonly [string, string] }> = {
  Agrikultur: { icon: Leaf, colors: ['#34D399', '#059669'] },
  Energi: { icon: Zap, colors: ['#FBBF24', '#EA580C'] },
  Properti: { icon: Building2, colors: ['#38BDF8', '#2563EB'] },
  Teknologi: { icon: Cpu, colors: ['#A78BFA', '#9333EA'] },
  UMKM: { icon: Store, colors: ['#60A5FA', '#1D4ED8'] },
};

export function ProjectCard({ project }: { project: Project }) {
  const theme = useTheme();

  const cat = CATEGORY_META[project.category ?? ''] ?? { icon: Store, colors: ['#60A5FA', '#1D4ED8'] as const };
  const CatIcon = cat.icon;
  const statusLabel = project.is_investable ? 'Aktif' : 'Tutup';

  return (
    <Pressable onPress={() => router.push(`/project/${project.id}`)}>
      <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        {project.image ? (
          <Image source={{ uri: project.image }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <LinearGradient colors={[...cat.colors]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.thumbnail}>
            <CatIcon size={28} color="#FFFFFF" />
          </LinearGradient>
        )}
        <View style={styles.info}>
          <View style={styles.tagsRow}>
            <Badge label={project.category ?? 'Umum'} tone="primary" size="sm" />
            <Badge label={statusLabel} tone={project.is_investable ? 'success' : 'danger'} size="sm" />
          </View>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {project.name}
          </Text>
          <Text style={styles.return}>Est. {project.estimated_return}% /tahun</Text>
          <View style={styles.progressGroup}>
            <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.primary,
                    width: `${Math.min(100, project.funding_progress)}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressValues, { color: theme.textSecondary }]} numberOfLines={1}>
              {formatRupiah(project.current_funding)} / {formatRupiah(project.funding_target)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three - 2,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  thumbnail: {
    width: 96,
    height: 116,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
    gap: Spacing.two + 2,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: Spacing.one + 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  return: {
    color: '#16A34A',
    fontSize: 13,
    fontWeight: '600',
  },
  progressGroup: {
    gap: Spacing.one,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressValues: {
    fontSize: 11,
  },
});

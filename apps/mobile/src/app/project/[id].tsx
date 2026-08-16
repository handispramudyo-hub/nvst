import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Bookmark, Building2, Cpu, Leaf, Store, Zap } from 'lucide-react-native';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spinner } from '@/components/ui/spinner';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProject } from '@/hooks/queries';
import { formatRupiah } from '@/lib/format';

const CATEGORY_META: Record<string, { icon: React.ComponentType<{ size?: number; color?: string }>; colors: readonly [string, string] }> = {
  Agrikultur: { icon: Leaf, colors: ['#34D399', '#059669'] },
  Energi: { icon: Zap, colors: ['#FBBF24', '#EA580C'] },
  Properti: { icon: Building2, colors: ['#38BDF8', '#2563EB'] },
  Teknologi: { icon: Cpu, colors: ['#A78BFA', '#9333EA'] },
  UMKM: { icon: Store, colors: ['#60A5FA', '#1D4ED8'] },
};

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const projectId = Number(id);
  const router = useRouter();
  const theme = useTheme();
  const { data: project, isLoading } = useProject(projectId);

  if (isLoading || !project) {
    return (
      <Screen>
        <ScreenHeader title="Detail Proyek" />
        <Spinner />
      </Screen>
    );
  }

  const cat = CATEGORY_META[project.category ?? ''] ?? { icon: Store, colors: ['#60A5FA', '#1D4ED8'] as const };
  const CatIcon = cat.icon;
  const riskLabel =
    project.risk_level === 'low' ? 'RISIKO RENDAH' : project.risk_level === 'medium' ? 'RISIKO SEDANG' : 'RISIKO TINGGI';

  return (
    <Screen
      scroll
      footer={
        project.is_investable ? (
          <Button title="Investasi Sekarang" size="lg" onPress={() => router.push(`/investments/create?projectId=${project.id}`)} />
        ) : null
      }>
      <ScreenHeader
        title="Detail Proyek"
        right={
          <View style={[styles.bookmark, { backgroundColor: theme.backgroundSelected }]}>
            <Bookmark size={18} color={theme.textSecondary} />
          </View>
        }
      />

      {project.image ? (
        <Image source={{ uri: project.image }} style={styles.hero} resizeMode="cover" />
      ) : (
        <LinearGradient colors={[...cat.colors]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <CatIcon size={44} color="#FFFFFF" />
        </LinearGradient>
      )}

      <View style={styles.headerMeta}>
        <Text style={[styles.projectTitle, { color: theme.text }]}>{project.name}</Text>
        <View style={styles.tagsRow}>
          <Badge label={(project.category ?? 'Umum').toUpperCase()} tone="primary" size="sm" />
          <Badge label={riskLabel} tone={project.risk_level === 'low' ? 'success' : project.risk_level === 'medium' ? 'warning' : 'danger'} size="sm" />
        </View>
      </View>

      <View style={[styles.statsCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        <StatItem label="Est. Return" value={`${project.estimated_return}% /thn`} color={theme.success} />
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <StatItem label="Tenor" value={`${project.duration_days} Hari`} color={theme.text} />
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <StatItem label="Min. Investasi" value={formatRupiah(project.min_investment)} color={theme.text} />
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Text style={[styles.progressTitle, { color: theme.text }]}>Pendanaan</Text>
          <Text style={[styles.progressPercent, { color: theme.primary }]}>
            {project.funding_progress}% Terkumpul
          </Text>
        </View>
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
        <Text style={[styles.progressValues, { color: theme.textSecondary }]}>
          {formatRupiah(project.current_funding)} dari {formatRupiah(project.funding_target)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Tentang Proyek</Text>
        <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
          {project.description ?? 'Belum ada deskripsi proyek.'}
        </Text>
      </View>

      {project.terms ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Ketentuan</Text>
          <Card>
            <Text style={[styles.bodyText, { color: theme.text }]}>{project.terms}</Text>
          </Card>
        </View>
      ) : null}

      {project.risk_disclosure ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Peringatan Risiko</Text>
          <Card>
            <Text style={[styles.bodyText, { color: theme.warning }]}>{project.risk_disclosure}</Text>
          </Card>
        </View>
      ) : null}
    </Screen>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  const theme = useTheme();
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bookmark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    width: '100%',
    height: 180,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMeta: {
    gap: Spacing.two,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  statLabel: {
    fontSize: 11,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  progressSection: {
    gap: Spacing.two,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressValues: {
    fontSize: 11,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 20,
  },
});

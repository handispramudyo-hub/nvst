import { Tabs } from 'expo-router';
import { Bell, Briefcase, Home, TrendingUp, User } from 'lucide-react-native';

import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.backgroundElement,
          borderTopColor: theme.border,
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        sceneStyle: { backgroundColor: theme.background },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, size }) => <Home size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Investasi',
          tabBarIcon: ({ color, size }) => <TrendingUp size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portofolio',
          tabBarIcon: ({ color, size }) => <Briefcase size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifikasi',
          tabBarIcon: ({ color, size }) => <Bell size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <User size={22} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}

import { Tabs, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Text, Platform } from 'react-native';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useIsDesktop } from '../../hooks/useIsDesktop';

export default function TabsLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (!loading && !user) {
      // User is not authenticated, redirect to login
      router.replace('/(auth)/login');
    }
  }, [user, loading, router]);

  // Don't render tabs if not authenticated
  if (loading || !user) {
    return null;
  }

  // Hide tab bar on desktop web
  const tabBarStyle = Platform.OS === 'web' && isDesktop 
    ? { display: 'none' as const }
    : {
        backgroundColor: 'rgba(255,255,255,0.95)', // Match landing page glass effect
        borderTopWidth: 1,
        borderTopColor: 'rgba(123,92,255,0.2)', // Subtle purple border
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
        shadowColor: '#1f2430',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#7B5CFF', // Landing page purple
        tabBarInactiveTintColor: '#5b6070', // Landing page muted color
        headerShown: false,
        tabBarStyle,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ 
              fontSize: 20, 
              color: focused ? '#7B5CFF' : '#5b6070',
              fontWeight: focused ? 'bold' : 'normal'
            }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="data"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Statistics',
          tabBarLabel: 'Statistics',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ 
              fontSize: 20, 
              color: focused ? '#7B5CFF' : '#5b6070'
            }}>📈</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ 
              fontSize: 20, 
              color: focused ? '#7B5CFF' : '#5b6070'
            }}>👤</Text>
          ),
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen
        name="skin-analysis"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="makeup"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="looks"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="routine"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="dermatologist"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}


import { Tabs, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Text, View } from 'react-native';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function TabsLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

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

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary.orange,
        tabBarInactiveTintColor: Colors.gray.dark,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.gray.darker,
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
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
              color: focused ? Colors.primary.orange : Colors.gray.dark,
              fontWeight: focused ? 'bold' : 'normal'
            }}>✕</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="data"
        options={{
          title: 'Data',
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: Colors.accent.red,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: -10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}>
              <Text style={{ fontSize: 28, color: Colors.white, fontWeight: 'bold' }}>+</Text>
            </View>
          ),
          tabBarLabel: '',
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
              color: focused ? Colors.primary.orange : Colors.gray.dark 
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
              color: focused ? Colors.primary.orange : Colors.gray.dark 
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


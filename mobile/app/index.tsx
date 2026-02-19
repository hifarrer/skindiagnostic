import { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!loading && !hasNavigated.current) {
      // Use setTimeout to ensure router is mounted
      const timer = setTimeout(() => {
        if (user) {
          // User is authenticated, redirect to home
          router.replace('/(tabs)/home');
        } else {
          // User is not authenticated
          if (Platform.OS === 'web') {
            // On web, show landing page for unauthenticated users
            router.replace('/landing');
          } else {
            // On mobile, redirect to login
            router.replace('/(auth)/login');
          }
        }
        hasNavigated.current = true;
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  return (
    <LinearGradient
      colors={['#FF69B4', '#9370DB', '#8A2BE2']}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <ActivityIndicator size="large" color="#fff" />
    </LinearGradient>
  );
}

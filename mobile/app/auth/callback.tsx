import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    if (data) {
      try {
        const authData = JSON.parse(decodeURIComponent(data as string));
        if (authData.token && authData.user) {
          login(authData.token, authData.user).then(() => {
            router.replace('/(tabs)/home');
          }).catch((error) => {
            console.error('Login error:', error);
            router.replace('/(auth)/login?error=login_failed');
          });
        } else {
          router.replace('/(auth)/login?error=invalid_data');
        }
      } catch (error) {
        console.error('Parse error:', error);
        router.replace('/(auth)/login?error=parse_error');
      }
    } else {
      // Check URL hash for web
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const tokenData = params.get('data');
        
        if (tokenData) {
          try {
            const authData = JSON.parse(decodeURIComponent(tokenData));
            if (authData.token && authData.user) {
              login(authData.token, authData.user).then(() => {
                router.replace('/(tabs)/home');
              }).catch((error) => {
                console.error('Login error:', error);
                router.replace('/(auth)/login?error=login_failed');
              });
            }
          } catch (error) {
            console.error('Parse error:', error);
            router.replace('/(auth)/login?error=parse_error');
          }
        } else {
          router.replace('/(auth)/login?error=no_data');
        }
      } else {
        router.replace('/(auth)/login?error=no_data');
      }
    }
  }, [data]);

  return (
    <LinearGradient
      colors={Colors.background.gradient}
      style={styles.container}
    >
      <View style={styles.content}>
        <ActivityIndicator size="large" color={Colors.white} />
        <Text style={styles.text}>Completing login...</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  text: {
    color: Colors.white,
    fontSize: 16,
    marginTop: 20,
  },
});

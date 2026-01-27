import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { Colors } from '../../constants/Colors';

export default function LoginScreen() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();
  const { error } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (!authLoading && user) {
      router.replace('/(tabs)/home');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (error) {
      Alert.alert('Login Error', 'Failed to complete login. Please try again.');
    }
  }, [error]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const response = await authService.loginWithGoogle();
      if (response && response.token && response.user) {
        await login(response.token, response.user);
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'Failed to login with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={Colors.background.gradient}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>AiMakeup</Text>
          <Text style={styles.subtitle}>Your Beauty AI Companion</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleGoogleLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.primary.pink} />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.buttonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          Sign in to access AI-powered beauty features
        </Text>
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
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 52,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 12,
    textShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  subtitle: {
    fontSize: 20,
    color: Colors.white,
    opacity: 0.95,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 30,
  },
  button: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.3)',
    elevation: 8,
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.pink,
    width: 24,
    textAlign: 'center',
  },
  buttonText: {
    color: Colors.primary.pink,
    fontSize: 17,
    fontWeight: '600',
  },
  footerText: {
    color: Colors.white,
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 20,
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ImageBackground,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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
    <ImageBackground 
      source={require('../../assets/aiskinbg.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>
              SkinDiagnostics.<Text style={styles.titleAccent}>AI</Text>
            </Text>
            <Text style={styles.subtitle}>Your AI-Powered Skin Health Companion</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleGoogleLogin}
              activeOpacity={0.86}
              disabled={loading}
            >
              <LinearGradient
                colors={['#7B5CFF', '#FF5EA8', '#FF8A4C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <Text style={styles.googleIcon}>G</Text>
                    <Text style={styles.buttonText}>Continue with Google</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>
            Sign in to access AI-powered skin analysis features
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 28,
    padding: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#1f2430',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 8,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 18px 45px rgba(31, 36, 48, 0.14)',
        } as any
      : {}),
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2430',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  titleAccent: {
    color: '#7B5CFF',
    fontWeight: '800',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  subtitle: {
    fontSize: 16,
    color: '#5b6070',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 28,
  },
  button: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#FF5EA8',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    width: 24,
    textAlign: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  footerText: {
    color: '#5b6070',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
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
    <ImageBackground 
      source={require('../../assets/aiskinbg.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>SkingDiagnostics.AI</Text>
            <Text style={styles.subtitle}>Your AI-Powered Skin Health Companion</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text.darkBlue,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 30,
  },
  button: {
    backgroundColor: Colors.primary.orange,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    fontSize: 17,
    fontWeight: '600',
  },
  footerText: {
    color: Colors.text.primary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});

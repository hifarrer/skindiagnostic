import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Linking } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';

interface DesktopWrapperProps {
  children: React.ReactNode;
}

export default function DesktopWrapper({ children }: DesktopWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Only render on web
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const menuItems = [
    { label: 'Home', path: '/(tabs)/home', icon: '🏠' },
    { label: 'Skin Analysis', path: '/(tabs)/skin-analysis', icon: '🔬' },
    { label: 'Statistics', path: '/(tabs)/statistics', icon: '📈' },
    { label: 'Subscription', path: '/(tabs)/subscription', icon: '⭐' },
    { label: 'Dermatologist', path: '/(tabs)/dermatologist', icon: '👨‍⚕️' },
    { label: 'Profile', path: '/(tabs)/profile', icon: '👤' },
  ];

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handlePrivacyPolicy = () => {
    // You can replace this with your actual privacy policy URL or route
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open('/privacy-policy', '_blank');
    } else {
      Linking.openURL('/privacy-policy');
    }
  };

  const handleTermsOfUse = () => {
    // You can replace this with your actual terms of use URL or route
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open('/terms-of-use', '_blank');
    } else {
      Linking.openURL('/terms-of-use');
    }
  };

  return (
    <View style={styles.desktopContainer}>
      {/* Top Navigation Menu */}
      <View style={styles.topMenu}>
        <View style={styles.menuContent}>
          <Text style={styles.logo}>SkinDiagnostics.AI</Text>
          <View style={styles.menuItems}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.path}
                style={[styles.menuItem, isActive(item.path) && styles.menuItemActive]}
                onPress={() => router.push(item.path as any)}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={[styles.menuLabel, isActive(item.path) && styles.menuLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {user && (
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* App Container - Tablet-sized */}
      <View style={styles.appContainer}>
        <View style={styles.appWrapper}>
          {children}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <Text style={styles.copyrightText}>
            SkinDiagnostics.AI © 2026
          </Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={handlePrivacyPolicy}>
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.footerSeparator}>|</Text>
            <TouchableOpacity onPress={handleTermsOfUse}>
              <Text style={styles.footerLink}>Terms of Use</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    width: '100%',
    height: '100vh',
  },
  topMenu: {
    backgroundColor: Colors.primary.orange,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  menuContent: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    marginRight: 30,
  },
  menuItems: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    marginHorizontal: 4,
  },
  menuItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
  },
  menuLabelActive: {
    fontWeight: 'bold',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginLeft: 20,
  },
  logoutText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  appContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    overflow: 'hidden',
  },
  appWrapper: {
    width: '100%',
    maxWidth: 768, // Tablet width
    height: '100%',
    maxHeight: 1024, // Tablet height
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  footer: {
    backgroundColor: Colors.primary.orange,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  footerContent: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copyrightText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '500',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footerLink: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  footerSeparator: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.7,
  },
});

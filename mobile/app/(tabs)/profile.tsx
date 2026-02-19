import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { profileService, UserProfile } from '../../services/profileService';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { authService } from '../../services/authService';

export default function ProfileScreen() {
  const router = useRouter();
  const { user: authUser, updateUser, logout: logoutAuth } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await profileService.getProfile();
      setProfile(userProfile);
      setEmail(userProfile.email || '');
      setAge(userProfile.age?.toString() || '');
    } catch (error: any) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Validate age if provided
    let ageValue: number | null = null;
    if (age.trim()) {
      const ageNum = parseInt(age.trim());
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
        Alert.alert('Error', 'Age must be a number between 0 and 150');
        return;
      }
      ageValue = ageNum;
    }

    try {
      setSaving(true);
      const updatedProfile = await profileService.updateProfile({
        email: email.trim(),
        age: ageValue,
      });
      
      setProfile(updatedProfile);
      setEditing(false);
      
      // Update auth context
      if (authUser) {
        updateUser({
          ...authUser,
          email: updatedProfile.email,
          age: updatedProfile.age,
        });
      }
      
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEmail(profile.email || '');
      setAge(profile.age?.toString() || '');
    }
    setEditing(false);
  };

  const handleLogout = async () => {
    console.log('[Profile] Logout button clicked!');
    
    // For web, use window.confirm as Alert.alert might not work
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (!confirmed) {
        console.log('[Profile] Logout cancelled by user');
        return;
      }
      
      // Proceed with logout
      try {
        setLoggingOut(true);
        console.log('[Profile] Starting logout process...');
        
        // Call backend logout
        try {
          await authService.logout();
          console.log('[Profile] Backend logout successful');
        } catch (error) {
          console.error('[Profile] Error calling backend logout:', error);
          // Continue with local logout even if backend fails
        }
        
        // Clear local auth state
        console.log('[Profile] Clearing local auth state...');
        await logoutAuth();
        console.log('[Profile] Local auth state cleared');
        
        // Wait a moment for React to process state updates
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Navigate directly to login page
        console.log('[Profile] Navigating to login page...');
        router.replace('/(auth)/login');
        
        // Reset loading state after navigation
        setLoggingOut(false);
      } catch (error) {
        console.error('[Profile] Error during logout:', error);
        alert('Failed to logout. Please try again.');
        setLoggingOut(false);
      }
      return;
    }
    
    // For native platforms, use Alert.alert
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('[Profile] Logout cancelled by user'),
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoggingOut(true);
              console.log('[Profile] Starting logout process...');
              
              // Call backend logout
              try {
                await authService.logout();
                console.log('[Profile] Backend logout successful');
              } catch (error) {
                console.error('[Profile] Error calling backend logout:', error);
                // Continue with local logout even if backend fails
              }
              
              // Clear local auth state
              console.log('[Profile] Clearing local auth state...');
              await logoutAuth();
              console.log('[Profile] Local auth state cleared');
              
              // Wait a moment for React to process state updates
              await new Promise(resolve => setTimeout(resolve, 200));
              
              // Navigate directly to login page
              console.log('[Profile] Navigating to login page...');
              router.replace('/(auth)/login');
              
              // Reset loading state after navigation
              setLoggingOut(false);
            } catch (error) {
              console.error('[Profile] Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };
  
  const menuItems = [
    { id: 'statistics', label: 'Statistics', icon: '📈', route: '/(tabs)/statistics' },
    { id: 'subscription', label: 'Subscription', icon: '⭐', route: '/(tabs)/subscription' },
    { id: 'help', label: 'Help & Support', icon: '❓', route: '/(tabs)/help' },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
        </View>
        <Text style={styles.name}>{profile.name || 'User Profile'}</Text>
        {!editing ? (
          <>
            <Text style={styles.email}>{profile.email}</Text>
            {profile.age && <Text style={styles.age}>Age: {profile.age}</Text>}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(true)}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.editForm}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={Colors.gray.dark}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Age (Optional)</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="Enter your age"
                placeholderTextColor={Colors.gray.dark}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{profile.statistics?.analyses || 0}</Text>
            <Text style={styles.statLabel}>Skin Analysis</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{profile.statistics?.looksTried || 0}</Text>
            <Text style={styles.statLabel}>Looks Tried</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{profile.statistics?.favorites || 0}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => {
                if (item.route) {
                  router.push(item.route as any);
                }
              }}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
          
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              styles.logoutItem,
              pressed && styles.menuItemPressed,
              loggingOut && styles.menuItemDisabled,
            ]}
            onPress={() => {
              console.log('[Profile] Logout button pressed!');
              // Test if button is working
              if (Platform.OS === 'web') {
                console.log('[Profile] Web platform detected');
              }
              handleLogout();
            }}
            disabled={loggingOut}
          >
            <Text style={styles.menuIcon}>🚪</Text>
            <Text style={[styles.menuLabel, styles.logoutLabel]}>
              {loggingOut ? 'Logging out...' : 'Logout'}
            </Text>
            {loggingOut && (
              <ActivityIndicator size="small" color={Colors.accent.red} style={{ marginLeft: 10 }} />
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fbff',
  },
  header: {
    padding: 28,
    paddingTop: 36,
    paddingBottom: 32,
    alignItems: 'center',
    backgroundColor: Colors.landing.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.landing.cardBorder,
  },
  avatarContainer: {
    marginBottom: 14,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(123,92,255,.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.landing.purple,
  },
  avatarText: {
    fontSize: 50,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.landing.dark,
    marginBottom: 4,
    fontFamily: Colors.landing.fontFamily,
  },
  email: {
    fontSize: 14,
    color: Colors.landing.muted,
    marginBottom: 2,
    fontFamily: Colors.landing.fontFamily,
  },
  age: {
    fontSize: 14,
    color: Colors.landing.muted,
    marginBottom: 14,
    fontFamily: Colors.landing.fontFamily,
  },
  editButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: Colors.landing.purple,
  },
  editButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Colors.landing.fontFamily,
  },
  editForm: {
    width: '100%',
    maxWidth: 400,
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.landing.dark,
    marginBottom: 6,
    fontFamily: Colors.landing.fontFamily,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,.9)',
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    color: Colors.landing.dark,
    borderWidth: 1,
    borderColor: Colors.landing.cardBorder,
    fontFamily: Colors.landing.fontFamily,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.landing.purple,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: Colors.landing.fontFamily,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: Colors.landing.muted,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Colors.landing.fontFamily,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    fontSize: 16,
    color: Colors.landing.pink,
    textAlign: 'center',
    marginTop: 50,
    fontFamily: Colors.landing.fontFamily,
  },
  content: {
    padding: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.landing.cardBorder,
    backgroundColor: Colors.landing.cardBg,
    shadowColor: '#1f2430',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.landing.purple,
    marginBottom: 4,
    fontFamily: Colors.landing.fontFamily,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.landing.muted,
    fontFamily: Colors.landing.fontFamily,
  },
  menuSection: {
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.landing.cardBg,
    padding: 18,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.landing.cardBorder,
    shadowColor: '#1f2430',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 2,
  },
  menuIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.landing.dark,
    fontFamily: Colors.landing.fontFamily,
  },
  menuArrow: {
    fontSize: 22,
    color: Colors.landing.muted,
  },
  logoutItem: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.landing.cardBorder,
    paddingTop: 18,
  },
  logoutLabel: {
    color: Colors.landing.pink,
    fontWeight: '700',
    fontFamily: Colors.landing.fontFamily,
  },
  menuItemPressed: {
    opacity: 0.7,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
});

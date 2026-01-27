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
    backgroundColor: Colors.background.lightBlue,
  },
  header: {
    padding: 30,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.background.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.primary.orange,
  },
  avatarText: {
    fontSize: 50,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.darkBlue,
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: Colors.gray.dark,
    marginBottom: 3,
  },
  age: {
    fontSize: 14,
    color: Colors.gray.dark,
    marginBottom: 15,
  },
  editButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary.pink,
    borderRadius: 20,
  },
  editButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  editForm: {
    width: '100%',
    maxWidth: 400,
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.darkBlue,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background.lightBlue,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.gray.dark,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: Colors.primary.pink,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: Colors.gray.dark,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    fontSize: 16,
    color: Colors.accent.red,
    textAlign: 'center',
    marginTop: 50,
  },
  content: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    paddingVertical: 20,
    backgroundColor: Colors.white,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary.orange,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray.dark,
  },
  menuSection: {
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 18,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  menuArrow: {
    fontSize: 24,
    color: Colors.gray.dark,
  },
  logoutItem: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.light,
    paddingTop: 18,
  },
  logoutLabel: {
    color: Colors.accent.red,
    fontWeight: '600',
  },
  menuItemPressed: {
    opacity: 0.7,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
});

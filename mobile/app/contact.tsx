import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

export default function ContactScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    // Email functionality will be set up later
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert('Missing fields', 'Please fill in name, email, and message.');
      return;
    }
    Alert.alert(
      'Coming soon',
      'Email sending will be configured soon. Your message has been saved locally for now.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inner}>
            <TouchableOpacity
              style={styles.backRow}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.backText}>‹ Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Contact Us</Text>
            <Text style={styles.subtitle}>
              Have a question or feedback? Send us a message and we’ll get back to you.
            </Text>
            <Text style={styles.note}>
              Email delivery will be set up soon. You can use the form below to prepare your message.
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={Colors.landing.muted}
                autoCapitalize="words"
                editable
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={Colors.landing.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable
              />

              <Text style={styles.label}>Subject</Text>
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="e.g. Support, Feedback, Partnership"
                placeholderTextColor={Colors.landing.muted}
                editable
              />

              <Text style={styles.label}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={message}
                onChangeText={setMessage}
                placeholder="Your message..."
                placeholderTextColor={Colors.landing.muted}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                editable
              />

              <TouchableOpacity
                style={styles.submitWrap}
                onPress={handleSubmit}
                activeOpacity={0.86}
              >
                <LinearGradient
                  colors={Colors.landing.gradientPurplePink}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitButton}
                >
                  <Text style={styles.submitText}>Send Message</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>© 2026 SkinDiagnostics.ai</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf7ff',
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  inner: {
    maxWidth: 520,
    width: '92%',
    alignSelf: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  backRow: {
    marginBottom: 20,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.landing.purple,
    fontFamily: Colors.landing.fontFamily,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.landing.dark,
    marginBottom: 10,
    fontFamily: Colors.landing.fontFamily,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.landing.muted,
    marginBottom: 8,
    fontFamily: Colors.landing.fontFamily,
  },
  note: {
    fontSize: 13,
    color: Colors.landing.muted,
    fontStyle: 'italic',
    marginBottom: 24,
    fontFamily: Colors.landing.fontFamily,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.landing.dark,
    marginBottom: 8,
    fontFamily: Colors.landing.fontFamily,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.landing.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.landing.dark,
    backgroundColor: Colors.white,
    marginBottom: 18,
    fontFamily: Colors.landing.fontFamily,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  submitWrap: {
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  submitButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: Colors.landing.fontFamily,
  },
  footer: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.landing.cardBorder,
  },
  footerText: {
    fontSize: 12,
    color: Colors.landing.muted,
    fontFamily: Colors.landing.fontFamily,
  },
});

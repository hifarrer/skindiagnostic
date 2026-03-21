import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { usePwaInstallSurface } from '../hooks/usePwaInstallSurface';

const DISMISS_KEY = 'pwa-install-dismissed';

function isIosSafariWeb(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const iOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const webkit = /WebKit/.test(ua);
  const notOtherBrowsers = !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return iOS && webkit && notOtherBrowsers;
}

export default function WebInstallPrompt() {
  const showSurface = usePwaInstallSurface();
  const [dismissed, setDismissed] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    setDismissed(localStorage.getItem(DISMISS_KEY) === '1');
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  const dismiss = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISS_KEY, '1');
    }
    setDismissed(true);
    setDeferredPrompt(null);
  }, []);

  const onInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } finally {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  if (Platform.OS !== 'web' || !showSurface || dismissed) {
    return null;
  }

  const iosHint = isIosSafariWeb() && !deferredPrompt;

  if (!deferredPrompt && !iosHint) {
    return null;
  }

  const wrapWeb =
    Platform.OS === 'web'
      ? ({
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99999,
        } as unknown as import('react-native').ViewStyle)
      : undefined;

  return (
    <View style={[styles.wrap, wrapWeb]} pointerEvents="box-none">
      <View style={styles.card}>
        <Text style={styles.title}>
          {deferredPrompt ? 'Install App' : 'Add to Home Screen'}
        </Text>
        <Text style={styles.body}>
          {deferredPrompt
            ? 'Add SkinDiagnostics.AI to your home screen for quick access.'
            : 'Tap Share, then “Add to Home Screen” to install this app.'}
        </Text>
        <View style={styles.actions}>
          {deferredPrompt ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={onInstall} activeOpacity={0.85}>
              <Text style={styles.primaryLabel}>Install</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.textBtn} onPress={dismiss} activeOpacity={0.7}>
            <Text style={styles.textLabel}>Not now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
  card: {
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.secondary,
    marginBottom: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: Colors.primary.pink,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  primaryLabel: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  textBtn: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  textLabel: {
    color: Colors.text.secondary,
    fontWeight: '600',
    fontSize: 15,
  },
});

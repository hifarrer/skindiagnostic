import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import Head from 'expo-router/head';

const THEME_COLOR = '#FF69B4';

/**
 * Injects PWA head tags and registers the minimal service worker (web only).
 */
export default function PwaWebRoot() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <Head>
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content={THEME_COLOR} />
      <link rel="apple-touch-icon" href="/logo192.png" />
    </Head>
  );
}

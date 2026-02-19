import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { useIsDesktop } from '../hooks/useIsDesktop';

interface DesktopWrapperProps {
  children: React.ReactNode;
}

function LogoSvg() {
  if (Platform.OS !== 'web') return null;
  return (
    <div
      style={{ width: 34, height: 34, marginRight: 10, flexShrink: 0 }}
      dangerouslySetInnerHTML={{
        __html: `<svg viewBox="0 0 64 64" fill="none" width="34" height="34">
          <defs>
            <linearGradient id="logo-g" x1="10" y1="6" x2="54" y2="58" gradientUnits="userSpaceOnUse">
              <stop stop-color="#7B5CFF"/>
              <stop offset="0.55" stop-color="#FF5EA8"/>
              <stop offset="1" stop-color="#5AD7FF"/>
            </linearGradient>
          </defs>
          <path d="M30 6c2 8-2 14-10 18 8-2 14 2 18 10-2-8 2-14 10-18-8 2-14-2-18-10Z" fill="url(#logo-g)" opacity=".95"/>
          <path d="M16 28c1.5 6-1.5 10.5-7.5 13.5 6-1.5 10.5 1.5 13.5 7.5-1.5-6 1.5-10.5 7.5-13.5-6 1.5-10.5-1.5-13.5-7.5Z" fill="url(#logo-g)" opacity=".85"/>
          <circle cx="49" cy="18" r="3" fill="#7B5CFF" opacity=".75"/>
          <circle cx="53" cy="26" r="2" fill="#FF5EA8" opacity=".75"/>
          <circle cx="44" cy="26" r="2" fill="#5AD7FF" opacity=".75"/>
        </svg>`,
      }}
    />
  );
}

export default function DesktopWrapper({ children }: DesktopWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isDesktop = useIsDesktop();

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  const pathnameStr = pathname || '';
  const isLandingPage = pathnameStr === '/landing';
  const isAuthPage = pathnameStr.includes('login') || pathnameStr.includes('auth');
  const isAppPage = !isLandingPage && !isAuthPage; // dashboard / tabs

  const landingNavItems = [
    { label: 'Home', id: 'hero' },
    { label: 'How It Works', id: 'how' },
    { label: 'About', id: 'about' },
    { label: 'FAQs', id: 'faqs' },
  ];

  const appNavItems = [
    { label: 'Home', path: '/(tabs)/home' },
    { label: 'Skin Analysis', path: '/(tabs)/skin-analysis' },
    { label: 'Statistics', path: '/(tabs)/statistics' },
    { label: 'Subscription', path: '/(tabs)/subscription' },
    { label: 'Dermatologist', path: '/(tabs)/dermatologist' },
    { label: 'Profile', path: '/(tabs)/profile' },
  ];

  const scrollToSection = (id: string) => {
    if (typeof document !== 'undefined') {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handlePrivacyPolicy = () => {
    router.push('/privacy-policy');
  };

  const handleTermsOfUse = () => {
    router.push('/terms-of-use');
  };

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    // Inject Inter font from Google Fonts
    const fontLinkId = 'template-inter-font';
    if (!document.getElementById(fontLinkId)) {
      const preconnect1 = document.createElement('link');
      preconnect1.rel = 'preconnect';
      preconnect1.href = 'https://fonts.googleapis.com';
      document.head.appendChild(preconnect1);

      const preconnect2 = document.createElement('link');
      preconnect2.rel = 'preconnect';
      preconnect2.href = 'https://fonts.gstatic.com';
      preconnect2.crossOrigin = 'anonymous';
      document.head.appendChild(preconnect2);

      const fontLink = document.createElement('link');
      fontLink.id = fontLinkId;
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
      document.head.appendChild(fontLink);
    }

    const styleId = 'template-desktop-css';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = `
      *, *::before, *::after { box-sizing: border-box; }
      body, #root, #root > div {
        font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif !important;
      }
      #template-header {
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        background: linear-gradient(180deg, rgba(255,255,255,0.70), rgba(255,255,255,0.45)) !important;
        border-bottom: 1px solid rgba(255,255,255,0.55);
      }
      #template-footer {
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        background: linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.35)) !important;
        border-top: 1px solid rgba(255,255,255,0.65);
      }
      body.template-landing-body, body.template-landing-body #root, body.template-landing-body #root > div {
        background: transparent !important;
      }
      body.template-landing-body {
        background:
          radial-gradient(1200px 600px at 80% 8%, rgba(255,94,168,.22), transparent 60%),
          radial-gradient(900px 520px at 18% 10%, rgba(122,92,255,.18), transparent 60%),
          radial-gradient(900px 520px at 18% 68%, rgba(90,215,255,.18), transparent 60%),
          radial-gradient(900px 520px at 80% 78%, rgba(255,138,76,.16), transparent 60%),
          linear-gradient(180deg, #f7fbff, #fbf7ff) !important;
        overflow-x: hidden;
      }
      .bg-waves {
        position: fixed; top: -120px; left: -120px; right: -120px;
        height: 520px;
        pointer-events: none;
        opacity: .7;
        filter: blur(.2px);
        background:
          radial-gradient(800px 380px at 15% 70%, rgba(122,92,255,.22), transparent 60%),
          radial-gradient(900px 420px at 80% 40%, rgba(255,94,168,.22), transparent 62%),
          radial-gradient(800px 360px at 35% 10%, rgba(90,215,255,.18), transparent 60%);
        mask-image: radial-gradient(1000px 500px at 50% 35%, #000 35%, transparent 68%);
        -webkit-mask-image: radial-gradient(1000px 500px at 50% 35%, #000 35%, transparent 68%);
        z-index: 0;
      }
      .bg-waves2 {
        position: fixed; bottom: -220px; left: -140px; right: -140px;
        height: 640px;
        pointer-events: none;
        opacity: .55;
        background:
          radial-gradient(900px 420px at 25% 35%, rgba(255,94,168,.16), transparent 60%),
          radial-gradient(1000px 520px at 78% 55%, rgba(122,92,255,.16), transparent 62%),
          radial-gradient(900px 460px at 60% 18%, rgba(255,138,76,.12), transparent 60%);
        mask-image: radial-gradient(1000px 520px at 50% 55%, #000 40%, transparent 74%);
        -webkit-mask-image: radial-gradient(1000px 520px at 50% 55%, #000 40%, transparent 74%);
        z-index: 0;
      }
      body.template-landing-body #hero-accent {
        background: linear-gradient(90deg, #7B5CFF, #FF5EA8) !important;
        -webkit-background-clip: text !important;
        background-clip: text !important;
        color: transparent !important;
      }
    `;

    if (isLandingPage) {
      document.body.classList.add('template-landing-body');
    } else {
      document.body.classList.remove('template-landing-body');
    }
    return () => {
      document.body.classList.remove('template-landing-body');
    };
  }, [isLandingPage]);

  const headerCrystal =
    Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.70), rgba(255,255,255,0.45))',
        } as any)
      : undefined;

  const footerCrystal =
    Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.35))',
        } as any)
      : undefined;

  return (
    <View
      style={[styles.desktopContainer, isLandingPage && styles.desktopContainerLanding]}
      nativeID={isLandingPage ? 'template-body' : undefined}
    >
      {isLandingPage && Platform.OS === 'web' && (
        <>
          <div className="bg-waves" />
          <div className="bg-waves2" />
        </>
      )}

      <View
        style={[styles.header, headerCrystal]}
        nativeID="template-header"
      >
        <View style={styles.nav}>
          <View style={styles.brand}>
            {Platform.OS === 'web' && <LogoSvg />}
            <Text style={styles.brandText}>SkinDiagnostics</Text>
            <Text style={styles.brandAccent}>.ai</Text>
          </View>

          {isDesktop && (
            <View style={styles.navLinks}>
              {isLandingPage
                ? landingNavItems.map((item) => (
                    <TouchableOpacity
                      key={item.id + item.label}
                      onPress={() => scrollToSection(item.id)}
                    >
                      <Text style={styles.navLink}>{item.label}</Text>
                    </TouchableOpacity>
                  ))
                : appNavItems.map((item) => (
                    <TouchableOpacity
                      key={item.path}
                      onPress={() => router.push(item.path as any)}
                    >
                      <Text
                        style={[
                          styles.navLink,
                          isActive(item.path) && styles.navLinkActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
            </View>
          )}

          {user ? (
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleLogout}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#7B5CFF', '#FF5EA8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>Logout</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#7B5CFF', '#FF5EA8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={[
        styles.appContainer,
        isLandingPage && styles.appContainerLanding,
        isAuthPage && styles.appContainerAuth,
        isAppPage && styles.appContainerCentered,
      ]}>
        <View style={[
          styles.appWrapper,
          isLandingPage && styles.appWrapperLanding,
          isAuthPage && styles.appWrapperAuth,
        ]}>
          {children}
        </View>
      </View>

      <View
        style={[styles.footer, footerCrystal]}
        nativeID="template-footer"
      >
        <View style={[styles.foot, !isDesktop && styles.footStack]}>
          <View>
            <Text style={styles.quickLinksTitle}>Quick Links</Text>
            <View style={styles.footerLinksRow}>
              <TouchableOpacity
                onPress={() =>
                  isLandingPage ? scrollToSection('hero') : router.push('/(tabs)/home')
                }
              >
                <Text style={styles.footerLink}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  isLandingPage ? scrollToSection('how') : router.push('/(tabs)/home')
                }
              >
                <Text style={styles.footerLink}>How It Works</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  isLandingPage ? scrollToSection('about') : router.push('/(tabs)/home')
                }
              >
                <Text style={styles.footerLink}>About</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => isLandingPage ? scrollToSection('faqs') : undefined}
              >
                <Text style={styles.footerLink}>FAQs</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePrivacyPolicy}>
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleTermsOfUse}>
                <Text style={styles.footerLink}>Terms of Use</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Blog</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/contact')}>
                <Text style={styles.footerLink}>Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.copyrightText}>© 2026 SkinDiagnostics.ai</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    backgroundColor: '#fbf7ff',
    width: '100%',
    minHeight: '100vh' as any,
  },
  desktopContainerLanding: {
    backgroundColor: 'transparent',
  },
  header: {
    position: 'sticky' as any,
    top: 0,
    zIndex: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.58)',
  },
  nav: {
    width: '92%',
    maxWidth: 1140,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    gap: 16,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontWeight: '700',
    letterSpacing: 0.2,
    color: '#2a2f3c',
    fontSize: 16,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  brandAccent: {
    fontWeight: '700',
    letterSpacing: 0.2,
    color: '#4b51ff',
    fontSize: 16,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 26,
  },
  navLink: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b3f4e',
    opacity: 0.9,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  navLinkActive: {
    opacity: 1,
    fontWeight: '600',
  },
  ctaButton: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#7B5CFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 4,
  },
  ctaGradient: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  appContainer: {
    flex: 1,
    padding: 20,
    overflow: 'hidden',
  },
  appContainerLanding: {
    padding: 0,
  },
  appWrapper: {
    width: '100%',
    maxWidth: 768,
    flex: 1,
    backgroundColor: '#f7fbff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  appWrapperLanding: {
    maxWidth: '100%' as any,
    borderRadius: 0,
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  appContainerAuth: {
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainerCentered: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  appWrapperAuth: {
    maxWidth: '100%' as any,
    width: '100%',
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  footer: {
    marginTop: 10,
    paddingVertical: 18,
    paddingBottom: 26,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.65)',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  foot: {
    width: '92%',
    maxWidth: 1140,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 16,
  },
  footStack: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  quickLinksTitle: {
    fontWeight: '800',
    marginBottom: 10,
    color: '#3a3f52',
    fontSize: 12,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  footerLinksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 22,
  },
  footerLink: {
    fontSize: 12,
    color: '#4f5566',
    fontWeight: '600',
    opacity: 0.9,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  footerRight: {
    alignItems: 'flex-end',
    gap: 10,
  },
  copyrightText: {
    fontSize: 12,
    color: '#4f5566',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
});

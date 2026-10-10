import { router } from 'expo-router';
import { createElement, useEffect, useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';

/**
 * Public marketing page for signed-out web visitors ("/").
 *
 * Direction: warm editorial. Fraunces (soft-serif display) over Instrument Sans.
 * Palette is deliberately just three inks: paper (cream), ink (charcoal), forest.
 * Motion is limited to transform + opacity.
 */

// ---- tokens ---------------------------------------------------------------
const C = {
  paper: '#F1E9DA',
  paperHi: '#F7F1E5',
  paperDeep: '#E7DCC6',
  ink: '#1D211B',
  inkSoft: '#4A5046',
  inkFaint: 'rgba(29,33,27,0.14)',
  forest: '#24523D',
  forestDeep: '#16372A',
  forestTint: 'rgba(36,82,61,0.14)',
};

const FONT_DISPLAY = "'Fraunces', 'Iowan Old Style', Georgia, serif";
const FONT_BODY = "'Instrument Sans', 'Helvetica Neue', Arial, sans-serif";

// spacing scale (px): 8 / 16 / 24 / 32 / 48 / 64 / 96
const S = { xs: 8, sm: 16, md: 24, lg: 32, xl: 48, xxl: 64, xxxl: 96 };

const EASE = 'cubic-bezier(0.2, 0.7, 0.2, 1)';
const motion = (ms = 220, delay = 0): any => ({
  transitionProperty: 'transform, opacity',
  transitionDuration: `${ms}ms`,
  transitionDelay: `${delay}ms`,
  transitionTimingFunction: EASE,
});

const GITHUB_URL = 'https://github.com/alandanmed/allworth';
const FONT_CSS =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Instrument+Sans:wght@400;500;600&display=swap';

// subtle paper grain, rendered once as an SVG data URI
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.11 0 0 0 0 0.13 0 0 0 0 0.10 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const FEATURES = [
  {
    img: '/accounts.jpg',
    title: 'Every account, one place.',
    body: 'Checking, savings, credit cards, loans and investments, grouped by institution and linked through Plaid. Net worth is simply assets minus liabilities, always current.',
  },
  {
    img: '/activity.jpg',
    title: 'See where the money goes.',
    body: 'Spending by category for the month, set against last month, with search and category filters on every transaction.',
  },
  {
    img: '/budgets.jpg',
    title: 'Budgets that speak up.',
    body: 'Set a monthly limit per category. The bar fills as you spend, and turns red the moment you cross the line.',
  },
  {
    img: '/subs.jpg',
    title: 'Subscriptions, found for you.',
    body: 'Any merchant that repeats across three or more months is picked out automatically and totalled per month.',
  },
  {
    img: '/ast_answer.jpg',
    title: 'Ask it anything.',
    body: 'A Claude-powered assistant that answers from your real numbers by calling tools on the backend, not by guessing.',
  },
];

const STACK: [string, string][] = [
  ['App', 'React Native, Expo Router'],
  ['Data fetching', 'TanStack Query'],
  ['API', 'FastAPI'],
  ['Database', 'PostgreSQL'],
  ['Sign-in', 'Firebase Auth'],
  ['Banking', 'Plaid (Sandbox)'],
  ['Assistant', 'Claude API, tool use'],
  ['Hosting', 'Render, Vercel'],
];

// ---- primitives -----------------------------------------------------------
function webOnly<T extends object>(style: T): T {
  return style;
}

function scrollToId(id: string) {
  if (typeof document === 'undefined') return;
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

type BtnProps = { label: string; onPress: () => void; variant?: 'solid' | 'inverse' | 'outline' };

function Button({ label, onPress, variant = 'solid' }: BtnProps) {
  const palette = {
    solid: { bg: C.forest, fg: C.paperHi, border: C.forest },
    inverse: { bg: C.paperHi, fg: C.forestDeep, border: C.paperHi },
    outline: { bg: 'transparent', fg: C.ink, border: C.ink },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ hovered, pressed, focused }: any) =>
        webOnly({
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: 1.5,
          paddingVertical: 14,
          paddingHorizontal: S.lg,
          borderRadius: 999,
          cursor: 'pointer',
          transform: [{ translateY: pressed ? 0 : hovered ? -3 : 0 }, { scale: pressed ? 0.97 : 1 }],
          outlineStyle: focused ? 'solid' : 'none',
          outlineWidth: 3,
          outlineOffset: 3,
          outlineColor: C.forest,
          ...motion(180),
        } as ViewStyle)
      }>
      <Text style={{ fontFamily: FONT_BODY, fontSize: 16, fontWeight: '600', color: palette.fg, letterSpacing: 0.2 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function TextLink({ label, onPress, color = C.ink }: { label: string; onPress: () => void; color?: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      style={({ hovered, pressed, focused }: any) =>
        webOnly({
          paddingVertical: 8,
          cursor: 'pointer',
          opacity: pressed ? 0.6 : hovered ? 0.75 : 1,
          transform: [{ translateY: hovered && !pressed ? -2 : 0 }],
          outlineStyle: focused ? 'solid' : 'none',
          outlineWidth: 2,
          outlineOffset: 4,
          outlineColor: C.forest,
          ...motion(160),
        } as ViewStyle)
      }>
      <Text
        style={{
          fontFamily: FONT_BODY,
          fontSize: 16,
          fontWeight: '500',
          color,
          textDecorationLine: 'underline',
          textDecorationColor: C.forest,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Reveal wrapper: fades/slides in once mounted, staggered by `delay`. */
function Reveal({ delay = 0, ready, children, style }: { delay?: number; ready: boolean; children: any; style?: ViewStyle }) {
  return (
    <View
      style={[
        style,
        webOnly({
          opacity: ready ? 1 : 0,
          transform: [{ translateY: ready ? 0 : 24 }],
          ...motion(700, delay),
        } as ViewStyle),
      ]}>
      {children}
    </View>
  );
}

/** Device frame. Screens are tinted toward the palette so they sit on the page, not on top of it. */
function Phone({ src, width, rotate = 0, style }: { src: string; width: number; rotate?: number; style?: ViewStyle }) {
  const height = width * (1158 / 532);
  return (
    <View
      style={[
        webOnly({
          width,
          height,
          borderRadius: width * 0.15,
          borderWidth: Math.max(5, width * 0.025),
          borderColor: C.ink,
          backgroundColor: C.ink,
          overflow: 'hidden',
          transform: [{ rotate: `${rotate}deg` }],
          boxShadow: '0 40px 70px -24px rgba(22,55,42,0.55), 0 12px 24px -12px rgba(29,33,27,0.5)',
        } as ViewStyle),
        style,
      ]}>
      <Image source={{ uri: src }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      {/* palette tint + warm wash */}
      <View
        pointerEvents="none"
        style={webOnly({
          position: 'absolute',
          inset: 0,
          backgroundColor: C.forest,
          opacity: 0.14,
          mixBlendMode: 'multiply',
        } as ViewStyle)}
      />
      <View
        pointerEvents="none"
        style={webOnly({
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(180deg, rgba(241,233,218,0.12) 0%, rgba(241,233,218,0) 40%, rgba(22,55,42,0.18) 100%)`,
        } as ViewStyle)}
      />
    </View>
  );
}

const display = (size: number, extra: TextStyle = {}): TextStyle => ({
  fontFamily: FONT_DISPLAY,
  fontSize: size,
  lineHeight: Math.round(size * 1.02),
  letterSpacing: -size * 0.025,
  fontWeight: '500',
  color: C.ink,
  ...extra,
});

const body = (size = 18, extra: TextStyle = {}): TextStyle => ({
  fontFamily: FONT_BODY,
  fontSize: size,
  lineHeight: Math.round(size * 1.55),
  color: C.inkSoft,
  ...extra,
});

// ---- page -----------------------------------------------------------------
export function Landing() {
  const { width } = useWindowDimensions();
  const wide = width >= 960;
  const [ready, setReady] = useState(false);
  const launch = () => router.push('/auth');

  useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('allworth-fonts')) {
      const link = document.createElement('link');
      link.id = 'allworth-fonts';
      link.rel = 'stylesheet';
      link.href = FONT_CSS;
      document.head.appendChild(link);
    }
    const id = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(id);
  }, []);

  const pageBg: any = webOnly({
    backgroundColor: C.paper,
    backgroundImage: `radial-gradient(900px 600px at 85% -5%, rgba(36,82,61,0.10), transparent 60%), radial-gradient(700px 500px at -5% 35%, rgba(247,241,229,0.9), transparent 65%)`,
  });

  return (
    <ScrollView style={[{ flex: 1 }, pageBg]} contentContainerStyle={{ alignItems: 'center' }}>
      {/* grain overlay across the whole page */}
      <View
        pointerEvents="none"
        style={webOnly({
          position: 'absolute',
          inset: 0,
          backgroundImage: GRAIN,
          opacity: 0.16,
          mixBlendMode: 'multiply',
        } as ViewStyle)}
      />

      <View style={[styles.container, { paddingHorizontal: wide ? S.xl : S.md }]}>
        {/* ---------- nav ---------- */}
        <View style={styles.nav}>
          <View style={styles.brand}>
            <Image source={{ uri: '/mark-tile.png' }} style={{ width: 40, height: 40, borderRadius: 11 }} />
            <Text style={display(26, { letterSpacing: -0.5 })}>AllWorth</Text>
          </View>
          <View style={styles.navRight}>
            {wide && (
              <>
                <TextLink label="Tour" onPress={() => scrollToId('tour')} />
                <TextLink label="Features" onPress={() => scrollToId('features')} />
                <TextLink label="Stack" onPress={() => scrollToId('stack')} />
              </>
            )}
            <Button label="Launch app" onPress={launch} />
          </View>
        </View>

        {/* ---------- hero ---------- */}
        <View style={[styles.hero, wide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
          <View style={{ flex: wide ? 7 : undefined, paddingTop: wide ? S.xxl : S.lg }}>
            <Reveal ready={ready}>
              <Text style={styles.eyebrow}>PERSONAL FINANCE · iOS, ANDROID &amp; WEB</Text>
            </Reveal>
            <Reveal ready={ready} delay={80}>
              <Text style={display(wide ? 104 : 52, { marginTop: S.md })}>
                Your money,{'\n'}finally in{'\n'}one{' '}
                <Text style={{ fontStyle: 'italic', color: C.forest, fontWeight: '400' }}>picture.</Text>
              </Text>
            </Reveal>
            <Reveal ready={ready} delay={180}>
              <Text style={body(20, { marginTop: S.lg, maxWidth: 480 })}>
                Net worth, spending, budgets and subscriptions across every account, plus an assistant that answers
                questions about your own numbers.
              </Text>
            </Reveal>
            <Reveal ready={ready} delay={260} style={{ flexDirection: 'row', alignItems: 'center', gap: S.md, marginTop: S.xl, flexWrap: 'wrap' }}>
              <Button label="Launch the app" onPress={launch} />
              <TextLink label="Watch the 40-second tour" onPress={() => scrollToId('tour')} />
            </Reveal>

            {/* ledger strip */}
            <Reveal ready={ready} delay={340} style={styles.ledger}>
              {[
                ['Net worth', '$14,273.94'],
                ['Assets', '$24,466.09'],
                ['Liabilities', '$10,192.15'],
              ].map(([k, v], i) => (
                <View key={k} style={[styles.ledgerCell, i > 0 && { borderLeftWidth: 1, borderLeftColor: C.inkFaint, paddingLeft: S.md }]}>
                  <Text style={body(13, { letterSpacing: 1.2, textTransform: 'uppercase' })}>{k}</Text>
                  <Text style={display(26, { marginTop: 4, letterSpacing: -0.4, fontVariant: ['lining-nums', 'tabular-nums'] as any })}>{v}</Text>
                </View>
              ))}
            </Reveal>
            <Text style={body(13, { marginTop: S.sm })}>Sample data from the demo account. Plaid Sandbox, no real bank credentials.</Text>
          </View>

          {/* hero art: arch + two overlapping phones, bleeding past the container on wide screens */}
          <View style={{ flex: wide ? 5 : undefined, alignItems: 'center', marginTop: wide ? S.xl : S.xxl, minHeight: wide ? 700 : 520 }}>
            <Reveal ready={ready} delay={120} style={{ position: 'absolute', top: 0, left: wide ? -24 : 0, right: wide ? -S.xl : 0, bottom: 0 }}>
              <View
                style={webOnly({
                  flex: 1,
                  borderTopLeftRadius: 999,
                  borderTopRightRadius: 999,
                  borderBottomLeftRadius: 40,
                  borderBottomRightRadius: 40,
                  backgroundImage: `linear-gradient(165deg, ${C.forest} 0%, ${C.forestDeep} 100%)`,
                  boxShadow: 'inset 0 0 0 1px rgba(247,241,229,0.12)',
                } as ViewStyle)}
              />
            </Reveal>
            <Reveal ready={ready} delay={240} style={{ marginTop: S.xl, marginLeft: wide ? S.xl : 0 }}>
              <Phone src="/home.jpg" width={wide ? 300 : 240} rotate={-4} />
            </Reveal>
            {wide && (
              <Reveal ready={ready} delay={380} style={{ position: 'absolute', left: -S.xxl, bottom: S.xl }}>
                <Phone src="/budgets.jpg" width={190} rotate={5} />
              </Reveal>
            )}
          </View>
        </View>
      </View>

      {/* ---------- tour ---------- */}
      <View id="tour" style={[styles.band, { backgroundColor: C.paperDeep }]}>
        <View style={[styles.container, { paddingHorizontal: wide ? S.xl : S.md }, wide && { flexDirection: 'row', alignItems: 'flex-end', gap: S.xxl }]}>
          <View style={{ flex: wide ? 4 : undefined, paddingBottom: wide ? S.sm : S.lg }}>
            <Text style={styles.eyebrow}>THE TOUR</Text>
            <Text style={display(wide ? 56 : 40, { marginTop: S.sm })}>Forty seconds, every screen.</Text>
            <Text style={body(18, { marginTop: S.md })}>
              Net worth, accounts, spending, budgets, subscriptions and the assistant, recorded from the real app.
            </Text>
          </View>
          <View style={{ flex: wide ? 8 : undefined }}>
            <View style={styles.videoFrame}>
              {createElement('video', {
                src: '/allworth-demo.mp4',
                poster: '/poster.jpg',
                controls: true,
                playsInline: true,
                preload: 'metadata',
                style: { width: '100%', display: 'block', borderRadius: 12, background: '#16372A' },
              })}
            </View>
          </View>
        </View>
      </View>

      {/* ---------- features ---------- */}
      <View id="features" style={styles.container}>
        <View style={{ paddingHorizontal: wide ? S.xl : S.md, paddingTop: S.xxxl }}>
          <Text style={styles.eyebrow}>WHAT IT DOES</Text>
          <Text style={display(wide ? 64 : 40, { marginTop: S.sm, maxWidth: 760 })}>
            Five things, done{' '}
            <Text style={{ fontStyle: 'italic', color: C.forest, fontWeight: '400' }}>carefully.</Text>
          </Text>
        </View>
        {FEATURES.map((f, i) => {
          const flip = wide && i % 2 === 1;
          return (
            <View
              key={f.title}
              style={[
                styles.featureRow,
                { paddingHorizontal: wide ? S.xl : S.md },
                wide && { flexDirection: flip ? 'row-reverse' : 'row', alignItems: 'center', gap: S.xxl },
              ]}>
              <View style={{ flex: wide ? 6 : undefined }}>
                <Text style={display(wide ? 120 : 72, { color: C.forestTint.replace('0.14', '0.55'), fontStyle: 'italic', fontWeight: '400', letterSpacing: -4 })}>
                  {String(i + 1).padStart(2, '0')}
                </Text>
                <Text style={display(wide ? 44 : 32, { marginTop: -S.sm })}>{f.title}</Text>
                <Text style={body(18, { marginTop: S.md, maxWidth: 480 })}>{f.body}</Text>
              </View>
              <View style={{ flex: wide ? 4 : undefined, alignItems: wide ? (flip ? 'flex-start' : 'flex-end') : 'flex-start', marginTop: wide ? 0 : S.lg }}>
                <Phone src={f.img} width={wide ? 230 : 200} rotate={flip ? 3 : -3} />
              </View>
            </View>
          );
        })}
      </View>

      {/* ---------- stack ---------- */}
      <View id="stack" style={[styles.band, { backgroundColor: C.paperDeep }]}>
        <View style={[styles.container, { paddingHorizontal: wide ? S.xl : S.md }, wide && { flexDirection: 'row', gap: S.xxl }]}>
          <View style={{ flex: wide ? 5 : undefined }}>
            <Text style={styles.eyebrow}>UNDER THE HOOD</Text>
            <Text style={display(wide ? 56 : 40, { marginTop: S.sm })}>One codebase, three targets.</Text>
            <Text style={body(18, { marginTop: S.md })}>
              The same React Native code ships to iOS, Android and this website. Every API request is verified with a
              Firebase ID token and every query is scoped to that user, so data stays isolated per account.
            </Text>
            <Text style={body(18, { marginTop: S.md })}>
              The assistant is a tool-calling loop: Claude asks the backend for net worth, spending or subscriptions
              and answers from what comes back.
            </Text>
          </View>
          <View style={{ flex: wide ? 6 : undefined, marginTop: wide ? 0 : S.xl }}>
            {STACK.map(([k, v], i) => (
              <View key={k} style={[styles.stackRow, i === 0 && { borderTopWidth: 1, borderTopColor: C.inkFaint }]}>
                <Text style={body(13, { letterSpacing: 1.4, textTransform: 'uppercase', flex: 1 })}>{k}</Text>
                <Text style={display(22, { flex: 2, letterSpacing: -0.3 })}>{v}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ---------- cta ---------- */}
      <View style={[styles.container, { paddingHorizontal: wide ? S.xl : S.md, paddingVertical: S.xxxl }]}>
        <View
          style={webOnly({
            borderRadius: 40,
            padding: wide ? S.xxl : S.lg,
            backgroundImage: `linear-gradient(160deg, ${C.forest} 0%, ${C.forestDeep} 100%)`,
            flexDirection: wide ? 'row' : 'column',
            alignItems: wide ? 'center' : 'flex-start',
            justifyContent: 'space-between',
            gap: S.lg,
            boxShadow: '0 30px 60px -30px rgba(22,55,42,0.6)',
          } as ViewStyle)}>
          <Text style={display(wide ? 64 : 40, { color: C.paperHi, maxWidth: 560 })}>
            Take a look <Text style={{ fontStyle: 'italic', fontWeight: '400' }}>around.</Text>
          </Text>
          <Button label="Launch the app" onPress={launch} variant="inverse" />
        </View>
      </View>

      {/* ---------- footer ---------- */}
      <View style={[styles.container, { paddingHorizontal: wide ? S.xl : S.md }]}>
        <View style={styles.footer}>
          <Text style={body(14)}>Built by Alan Medina. Demo data only; educational insights, not financial advice.</Text>
          <TextLink label="github.com/alandanmed/allworth" onPress={() => Linking.openURL(GITHUB_URL)} color={C.forest} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 1240 },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: S.md },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  hero: { paddingBottom: S.xxxl },
  eyebrow: { fontFamily: FONT_BODY, fontSize: 13, fontWeight: '600', letterSpacing: 2.6, color: C.forest },
  ledger: { flexDirection: 'row', marginTop: S.xxl, maxWidth: 560 },
  ledgerCell: { flex: 1, paddingRight: S.sm },
  band: { width: '100%', alignItems: 'center', paddingVertical: S.xxxl },
  videoFrame: {
    borderRadius: 24,
    padding: 10,
    backgroundColor: C.forestDeep,
    boxShadow: '0 40px 70px -30px rgba(22,55,42,0.7)',
  },
  featureRow: { paddingVertical: S.xxl, borderBottomWidth: 1, borderBottomColor: C.inkFaint },
  stackRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: S.md,
    borderBottomWidth: 1,
    borderBottomColor: C.inkFaint,
  },
  footer: { borderTopWidth: 1, borderTopColor: C.inkFaint, paddingVertical: S.lg, gap: S.xs, marginBottom: S.lg },
});

import { router } from 'expo-router';
import { createElement } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

// Public marketing page shown to signed-out visitors on web ("/").
// Dark mint look matches the demo video.
const C = {
  bg: '#0a0f0d',
  panel: '#111815',
  panel2: '#161f1b',
  line: '#223029',
  text: '#eef3f0',
  dim: '#8da699',
  accent: '#3ee08c',
  accentDim: '#1f7a52',
};

const GITHUB_URL = 'https://github.com/alandanmed/allworth';

const FEATURES = [
  {
    img: '/accounts.jpg',
    title: 'Every account, one place',
    body: 'Checking, savings, credit cards, loans and investments, grouped by institution and linked securely through Plaid.',
  },
  {
    img: '/activity.jpg',
    title: 'See where the money goes',
    body: 'Monthly spending by category, a comparison with last month, plus search and category filters on every transaction.',
  },
  {
    img: '/budgets.jpg',
    title: 'Budgets that warn you',
    body: 'Set a monthly limit per category and watch progress bars turn red the moment you go over.',
  },
  {
    img: '/subs.jpg',
    title: 'Recurring charges, found for you',
    body: 'Merchants that repeat across three or more months are detected automatically and totalled per month.',
  },
  {
    img: '/ast_answer.jpg',
    title: 'Ask your money anything',
    body: 'A Claude-powered assistant that answers from your real data by calling tools, not by guessing.',
  },
];

const STACK = ['React Native + Expo', 'Expo Router', 'TanStack Query', 'FastAPI', 'PostgreSQL', 'Firebase Auth', 'Plaid', 'Claude API', 'Render'];

function Phone({ src, width }: { src: string; width: number }) {
  const height = width * (1158 / 532);
  return (
    <View
      style={{
        width,
        height,
        borderRadius: width * 0.14,
        borderWidth: 6,
        borderColor: '#1a211e',
        backgroundColor: '#000',
        overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 80px rgba(62,224,140,0.18)',
      }}>
      <Image source={{ uri: src }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
    </View>
  );
}

function Button({ label, onPress, primary }: { label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.btn, primary ? styles.btnPrimary : styles.btnGhost]}>
      <Text style={[styles.btnText, primary ? { color: '#04210f' } : { color: C.text }]}>{label}</Text>
    </Pressable>
  );
}

export function Landing() {
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const launch = () => router.push('/auth');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ alignItems: 'center' }}>
      <View style={styles.container}>
        {/* Nav */}
        <View style={styles.nav}>
          <View style={styles.brand}>
            <View style={styles.logo} />
            <Text style={styles.brandText}>AllWorth</Text>
          </View>
          <Button label="Launch app" onPress={launch} primary />
        </View>

        {/* Hero */}
        <View style={[styles.hero, wide && { flexDirection: 'row', alignItems: 'center' }]}>
          <View style={{ flex: 1, paddingRight: wide ? 48 : 0 }}>
            <Text style={styles.eyebrow}>PERSONAL FINANCE, ALL IN ONE APP</Text>
            <Text style={[styles.h1, !wide && { fontSize: 44, lineHeight: 50 }]}>
              Your whole financial picture.{' '}
              <Text style={{ color: C.accent }}>One app.</Text>
            </Text>
            <Text style={styles.lead}>
              Net worth, spending, budgets and subscriptions across every account, with an AI assistant that answers
              questions about your own money.
            </Text>
            <View style={styles.row}>
              <Button label="Launch app" onPress={launch} primary />
              <Button label="Source on GitHub" onPress={() => Linking.openURL(GITHUB_URL)} />
            </View>
            <Text style={styles.fine}>Runs on Plaid Sandbox with demo data. No real bank credentials needed.</Text>
          </View>
          <View style={{ alignItems: 'center', marginTop: wide ? 0 : 40 }}>
            <Phone src="/home.jpg" width={wide ? 320 : 260} />
          </View>
        </View>

        {/* Video */}
        <View style={styles.section}>
          <Text style={styles.h2}>See it in 40 seconds</Text>
          <View style={styles.videoWrap}>
            {createElement('video', {
              src: '/allworth-demo.mp4',
              poster: '/poster.jpg',
              controls: true,
              playsInline: true,
              preload: 'metadata',
              style: { width: '100%', display: 'block', borderRadius: 18, background: '#000' },
            })}
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.h2}>What it does</Text>
          <View style={styles.grid}>
            {FEATURES.map((f, i) => (
              <View
                key={f.title}
                style={[styles.card, { width: wide && !(i === FEATURES.length - 1 && i % 2 === 0) ? '48.5%' : '100%' }]}>
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Text style={styles.cardTitle}>{f.title}</Text>
                  <Text style={styles.cardBody}>{f.body}</Text>
                </View>
                <Phone src={f.img} width={120} />
              </View>
            ))}
          </View>
        </View>

        {/* How it's built */}
        <View style={styles.section}>
          <Text style={styles.h2}>How it's built</Text>
          <View style={styles.pills}>
            {STACK.map((s) => (
              <View key={s} style={styles.pill}>
                <Text style={styles.pillText}>{s}</Text>
              </View>
            ))}
          </View>
          <View style={styles.points}>
            <Text style={styles.point}>
              <Text style={styles.pointBold}>Per-user data isolation. </Text>
              Every API request is verified with a Firebase ID token, and every query is scoped to that user.
            </Text>
            <Text style={styles.point}>
              <Text style={styles.pointBold}>One codebase, three targets. </Text>
              The same React Native code ships to iOS, Android and this website.
            </Text>
            <Text style={styles.point}>
              <Text style={styles.pointBold}>An assistant that uses tools. </Text>
              Claude calls backend functions for net worth, spending and subscriptions, so answers come from real
              numbers.
            </Text>
          </View>
        </View>

        {/* CTA + footer */}
        <View style={styles.cta}>
          <Text style={styles.h2}>Take a look around</Text>
          <Button label="Launch app" onPress={launch} primary />
        </View>
        <View style={styles.footer}>
          <Text style={styles.footText}>Built by Alan Medina. Demo data only; educational insights, not financial advice.</Text>
          <Pressable onPress={() => Linking.openURL(GITHUB_URL)} accessibilityRole="link">
            <Text style={[styles.footText, { color: C.accent }]}>github.com/alandanmed/allworth</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 1120, paddingHorizontal: 24 },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 24 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 34, height: 34, borderRadius: 10, backgroundColor: C.accent },
  brandText: { color: C.text, fontSize: 22, fontWeight: '700' },
  hero: { paddingTop: 48, paddingBottom: 72 },
  eyebrow: { color: C.accent, fontSize: 14, fontWeight: '600', letterSpacing: 2.5, marginBottom: 16 },
  h1: { color: C.text, fontSize: 60, lineHeight: 66, fontWeight: '700', letterSpacing: -1 },
  lead: { color: C.dim, fontSize: 20, lineHeight: 30, marginTop: 20, maxWidth: 560 },
  row: { flexDirection: 'row', gap: 14, marginTop: 32, flexWrap: 'wrap' },
  fine: { color: C.dim, fontSize: 14, marginTop: 18 },
  btn: { paddingVertical: 14, paddingHorizontal: 26, borderRadius: 999 },
  btnPrimary: { backgroundColor: C.accent },
  btnGhost: { borderWidth: 1, borderColor: C.line, backgroundColor: C.panel },
  btnText: { fontSize: 16, fontWeight: '600' },
  section: { paddingVertical: 48 },
  h2: { color: C.text, fontSize: 34, fontWeight: '700', letterSpacing: -0.5, marginBottom: 28 },
  videoWrap: { borderRadius: 20, borderWidth: 1, borderColor: C.line, backgroundColor: C.panel, padding: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 24,
    padding: 24,
  },
  cardTitle: { color: C.text, fontSize: 22, fontWeight: '700', marginBottom: 10 },
  cardBody: { color: C.dim, fontSize: 16, lineHeight: 24 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  pill: { backgroundColor: C.panel2, borderWidth: 1, borderColor: C.accentDim, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 20 },
  pillText: { color: C.text, fontSize: 16, fontWeight: '500' },
  points: { marginTop: 28, gap: 14 },
  point: { color: C.dim, fontSize: 17, lineHeight: 26, maxWidth: 760 },
  pointBold: { color: C.text, fontWeight: '700' },
  cta: { alignItems: 'flex-start', paddingVertical: 56 },
  footer: { borderTopWidth: 1, borderTopColor: C.line, paddingVertical: 32, gap: 8 },
  footText: { color: C.dim, fontSize: 14 },
});

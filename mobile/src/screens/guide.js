import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, type } from '../theme';
import { AppHeader, Body, Button, Card, Chip, Field, Logo, ProgressBar, Screen, StatusBadge, TabBar, TierChip } from '../components/ui';

const SWATCHES = [
  ['Crimson', colors.primary],
  ['Saffron', colors.accent],
  ['Ivory', colors.bg],
  ['Ink', colors.text],
  ['Success', colors.success],
  ['Warning', colors.warning],
  ['Error', colors.error],
];

export function GuideScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppHeader title="Brand guide" onBack={() => navigation.goBack()} showLogo />
      <Screen>
        <Text style={styles.section}>Logo</Text>
        <Card>
          <Logo height={96} align="center" />
          <Body muted>The mark is used whole, on ivory or white, with clear space around it. It is never recolored, cropped, or placed on the crimson.</Body>
        </Card>
        <Text style={styles.section}>Colour</Text>
        <View style={styles.swatches}>
          {SWATCHES.map(([name, color]) => (
            <View key={name} style={styles.swatch}>
              <View style={[styles.chipColor, { backgroundColor: color, borderWidth: color === colors.bg ? 1 : 0, borderColor: colors.border }]} />
              <Text style={styles.swatchName}>{name}</Text>
              <Text style={styles.hex}>{color}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.section}>Type</Text>
        <Text style={styles.display}>Source Serif for headings</Text>
        <Body>Inter for body text and controls, at {type.body} px.</Body>
        <Text style={styles.section}>Controls</Text>
        <Button label="Primary action" onPress={() => {}} />
        <Button label="Secondary action" variant="secondary" onPress={() => {}} />
        <Button label="Unavailable" disabled />
        <Field label="College email" value="" onChangeText={() => {}} placeholder="name@gnims.edu.in" />
        <View style={styles.row}>
          <TierChip tier="Silver" />
          <TierChip tier="Gold" />
          <TierChip tier="Diamond" />
        </View>
        <View style={styles.row}>
          <StatusBadge status="Pending" />
          <StatusBadge status="Live" />
          <StatusBadge status="Rejected" />
        </View>
        <Chip label="Volunteer" selected />
        <Card>
          <Text style={styles.cardTitle}>Event card</Text>
          <Body muted>Thin border, 16 px corners, no shadow.</Body>
          <ProgressBar value={0.45} />
        </Card>
        <Text style={styles.section}>Tab bar</Text>
      </Screen>
      <TabBar
        tabs={[
          { id: 'feed', label: 'Feed', icon: 'home' },
          { id: 'applications', label: 'Applications', icon: 'clipboard' },
          { id: 'search', label: 'Search', icon: 'search' },
          { id: 'profile', label: 'Profile', icon: 'user' },
        ]}
        value="feed"
        onChange={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  section: { fontFamily: fonts.serif, fontSize: 22, color: colors.text, marginTop: 8 },
  display: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 34, color: colors.text },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatch: { width: 104, gap: 4 },
  chipColor: { height: 48, borderRadius: 12 },
  swatchName: { fontFamily: fonts.semibold, fontSize: 13, color: colors.text },
  hex: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cardTitle: { fontFamily: fonts.serif, fontSize: 20, color: colors.text },
});

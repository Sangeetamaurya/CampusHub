import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './Icons';
import { colors, fonts, radius, type } from '../theme';

const logo = require('../../assets/gnims-logo.png');
const webPress = Platform.OS === 'web' ? { cursor: 'pointer' } : null;

export function Logo({ height = 32, align = 'flex-start' }) {
  const width = Math.round(height * (160 / 136));
  const pad = Math.max(4, Math.round(height * 0.14));
  return (
    <View style={[styles.logoPad, { padding: pad, alignSelf: align }]}>
      <Image source={logo} style={{ width, height }} resizeMode="contain" accessibilityLabel="GNIMS" />
    </View>
  );
}

export function Screen({ children, footer, scroll = true }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: footer ? 24 : Math.max(insets.bottom, 16) + 16 }]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.flex}>{children}</View>
      )}
      {footer ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>{footer}</View>
      ) : null}
    </View>
  );
}

export function AppHeader({ title, onBack, right, showLogo = false }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>
        {onBack ? (
          <Pressable onPress={onBack} style={[styles.iconBtn, webPress]} accessibilityRole="button" accessibilityLabel="Back">
            <Icon name="chevronLeft" size={22} color={colors.text} />
          </Pressable>
        ) : showLogo ? (
          <Logo height={32} />
        ) : null}
      </View>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.headerSide, styles.headerRight]}>{right}</View>
    </View>
  );
}

export function Heading({ children, size = 28 }) {
  return <Text style={[styles.heading, { fontSize: size, lineHeight: size + 6 }]}>{children}</Text>;
}

export function Body({ children, muted = false, style }) {
  return <Text style={[styles.body, muted && styles.muted, style]}>{children}</Text>;
}

export function Button({ label, onPress, variant = 'primary', disabled = false, icon }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'ghost' && styles.buttonGhost,
        pressed && !disabled && variant === 'primary' && styles.buttonPressed,
        pressed && !disabled && variant !== 'primary' && styles.buttonPressedSoft,
        disabled && styles.buttonDisabled,
        webPress,
      ]}
    >
      {icon ? <Icon name={icon} size={18} color={variant === 'primary' && !disabled ? '#FFFFFF' : disabled ? colors.muted : colors.primary} /> : null}
      <Text
        style={[
          styles.buttonLabel,
          variant === 'primary' ? styles.buttonLabelLight : styles.buttonLabelDark,
          variant === 'ghost' && { color: colors.primary },
          disabled && styles.buttonLabelDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function TextLink({ label, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" style={webPress} hitSlop={8}>
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, value, onChangeText, placeholder, secure = false, revealed = false, onToggleSecure, helper, error, keyboardType = 'default', autoCapitalize = 'sentences', multiline = false }) {
  return (
    <View style={styles.fieldWrap}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <View style={[styles.field, multiline && styles.fieldMulti, error && styles.fieldError]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8A847A"
          secureTextEntry={secure && !revealed}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          multiline={multiline}
          selectionColor={colors.primary}
          style={[styles.input, multiline && styles.inputMulti, Platform.OS === 'web' && { outlineStyle: 'none' }]}
        />
        {secure ? (
          <Pressable onPress={onToggleSecure} style={webPress} accessibilityRole="button" accessibilityLabel={revealed ? 'Hide password' : 'Show password'}>
            <Icon name={revealed ? 'eyeOff' : 'eye'} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View style={styles.helperRow}>
          <Icon name="alert" size={14} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : helper ? (
        <Text style={styles.helper}>{helper}</Text>
      ) : null}
    </View>
  );
}

export function Segment({ options, value, onChange }) {
  return (
    <View style={styles.segment}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.segmentItem, selected && styles.segmentOn, webPress]}
          >
            <Text style={[styles.segmentLabel, selected && styles.segmentLabelOn]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Chip({ label, selected = false, onPress, onRemove, tone }) {
  const tier = tone === 'Silver' || tone === 'Gold' || tone === 'Diamond';
  const palette = tier ? tierPalette(tone) : null;
  const content = (
    <View style={[styles.chip, selected && !tier && styles.chipOn, palette && { backgroundColor: palette.bg, borderColor: palette.bg }]}>
      <Text style={[styles.chipLabel, selected && !tier && styles.chipLabelOn, palette && { color: palette.text }]}>{label}</Text>
      {onRemove ? <Icon name="x" size={14} color={palette ? palette.text : colors.text} /> : null}
    </View>
  );
  if (!onPress && !onRemove) return content;
  return (
    <Pressable onPress={onPress || onRemove} accessibilityRole="button" style={webPress}>
      {content}
    </Pressable>
  );
}

export function TierChip({ tier }) {
  return <Chip label={tier} tone={tier} />;
}

export function StatusBadge({ status }) {
  const meta = statusMeta(status);
  return (
    <View style={[styles.badge, { backgroundColor: meta.bg }]}>
      <Icon name={meta.icon} size={14} color={meta.fg} />
      <Text style={[styles.badgeLabel, { color: meta.fg }]}>{meta.label}</Text>
    </View>
  );
}

export function Avatar({ name, photo, size = 44 }) {
  const initials = (name || '?')
    .split(' ')
    .filter((part) => part && part !== 'Dr.' && part !== 'Prof.')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  if (photo) {
    return <Image source={{ uri: photo }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.ivoryDeep }} />;
  }
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size < 48 ? 14 : 18 }]}>{initials}</Text>
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ProgressBar({ value }) {
  const width = `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width }]} />
    </View>
  );
}

export function MetaRow({ icon, children }) {
  return (
    <View style={styles.metaRow}>
      <Icon name={icon} size={16} color={colors.muted} />
      <Text style={styles.metaText}>{children}</Text>
    </View>
  );
}

export function EmptyState({ title, body }) {
  return (
    <View style={styles.state}>
      <Icon name="clipboard" size={28} color={colors.muted} />
      <Text style={styles.stateTitle}>{title}</Text>
      {body ? <Text style={styles.stateBody}>{body}</Text> : null}
    </View>
  );
}

export function LoadingState({ title = 'Loading' }) {
  return (
    <View style={styles.state}>
      <Text style={styles.stateTitle}>{title}</Text>
      <View style={styles.skel} />
      <View style={[styles.skel, { width: '78%' }]} />
      <View style={[styles.skel, { width: '64%' }]} />
    </View>
  );
}

export function ErrorState({ title, body, onRetry }) {
  return (
    <View style={styles.state}>
      <Icon name="alert" size={28} color={colors.error} />
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateBody}>{body}</Text>
      {onRetry ? <Button label="Try again" onPress={onRetry} variant="secondary" /> : null}
    </View>
  );
}

export function Banner({ tone = 'success', text, onClose }) {
  const error = tone === 'error';
  return (
    <View style={[styles.banner, { backgroundColor: error ? colors.errorBg : colors.successBg }]}>
      <Icon name={error ? 'alert' : 'check'} size={16} color={error ? colors.error : colors.success} />
      <Text style={[styles.bannerText, { color: error ? colors.error : colors.success }]}>{text}</Text>
      {onClose ? (
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Dismiss" style={webPress}>
          <Icon name="x" size={16} color={error ? colors.error : colors.success} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function TabBar({ tabs, value, onChange }) {
  const insets = useSafeAreaInsets();
  const items = tabs.map((tab) => {
    const selected = tab.id === value;
    const color = selected ? colors.primary : colors.muted;
    return (
      <Pressable
        key={tab.id}
        onPress={() => onChange(tab.id)}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        style={[styles.tabItem, tabs.length > 5 && styles.tabItemWide, webPress]}
      >
        <Icon name={tab.icon} size={20} color={color} />
        <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>
          {tab.label}
        </Text>
      </Pressable>
    );
  });
  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      {tabs.length > 5 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {items}
        </ScrollView>
      ) : (
        items
      )}
    </View>
  );
}

export function BellButton({ count, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.iconBtn, webPress]} accessibilityRole="button" accessibilityLabel="Notifications">
      <Icon name="bell" size={22} color={colors.text} />
      {count > 0 ? (
        <View style={styles.bellBadge}>
          <Text style={styles.bellBadgeText}>{count > 9 ? '9+' : String(count)}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function tierPalette(tier) {
  if (tier === 'Gold') return { bg: colors.goldBg, text: colors.goldText };
  if (tier === 'Diamond') return { bg: colors.diamondBg, text: colors.diamondText };
  return { bg: colors.silverBg, text: colors.silverText };
}

function statusMeta(status) {
  if (status === 'Live' || status === 'Accepted') return { icon: 'check', fg: colors.success, bg: colors.successBg, label: status };
  if (status === 'Rejected') return { icon: 'x', fg: colors.error, bg: colors.errorBg, label: status };
  return { icon: 'clock', fg: colors.warning, bg: colors.warningBg, label: status || 'Pending' };
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { padding: 16, gap: 12 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  logoPad: { backgroundColor: 'transparent' },
  header: {
    minHeight: 56,
    paddingHorizontal: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerSide: { width: 88, minHeight: 44, justifyContent: 'center' },
  headerRight: { alignItems: 'flex-end' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.text,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  heading: { fontFamily: fonts.serif, color: colors.text },
  body: { fontFamily: fonts.body, fontSize: type.body, lineHeight: 22, color: colors.text },
  muted: { color: colors.muted },
  button: {
    minHeight: 48,
    borderRadius: radius.control,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonSecondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  buttonGhost: { backgroundColor: 'transparent' },
  buttonPressed: { backgroundColor: colors.primaryPressed },
  buttonPressedSoft: { backgroundColor: colors.ivoryDeep },
  buttonDisabled: { backgroundColor: colors.disabled },
  buttonLabel: { fontFamily: fonts.semibold, fontSize: 16 },
  buttonLabelLight: { color: '#FFFFFF' },
  buttonLabelDark: { color: colors.text },
  buttonLabelDisabled: { color: '#F7F4EF' },
  link: { fontFamily: fonts.semibold, fontSize: 15, color: colors.primary, textAlign: 'center' },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  field: {
    minHeight: 48,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldError: { borderColor: colors.error },
  fieldMulti: { alignItems: 'flex-start', minHeight: 96 },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 16, color: colors.text, paddingVertical: 10 },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  helper: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.muted },
  helperRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorText: { fontFamily: fonts.medium, fontSize: 13, color: colors.error, flex: 1 },
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.control,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  segmentItem: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  segmentOn: { backgroundColor: colors.primary },
  segmentLabel: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  segmentLabelOn: { color: '#FFFFFF' },
  chip: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  chipLabelOn: { color: '#FFFFFF' },
  badge: {
    minHeight: 28,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  badgeLabel: { fontFamily: fonts.semibold, fontSize: 13 },
  avatar: { backgroundColor: colors.ivoryDeep, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  avatarText: { fontFamily: fonts.semibold, color: colors.text },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.ivoryDeep, overflow: 'hidden' },
  fill: { height: 6, backgroundColor: colors.accent },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.muted, flex: 1 },
  state: { paddingVertical: 32, paddingHorizontal: 12, alignItems: 'center', gap: 8 },
  stateTitle: { fontFamily: fonts.serif, fontSize: 20, color: colors.text, textAlign: 'center' },
  stateBody: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.muted, textAlign: 'center' },
  skel: { height: 14, width: '92%', borderRadius: 6, backgroundColor: colors.ivoryDeep },
  banner: { borderRadius: radius.control, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  bannerText: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
  },
  tabScroll: { flexGrow: 1 },
  tabItem: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: 2, paddingHorizontal: 4 },
  tabItemWide: { flex: 0, width: 84 },
  tabLabel: { fontFamily: fonts.medium, fontSize: 11 },
  bellBadge: {
    position: 'absolute',
    top: 6,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: { color: '#FFFFFF', fontFamily: fonts.semibold, fontSize: 10 },
});

export function FilterRow({ options, value, onChange }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
      {options.map((option) => (
        <Chip key={option} label={option} selected={option === value} onPress={() => onChange(option)} />
      ))}
    </ScrollView>
  );
}

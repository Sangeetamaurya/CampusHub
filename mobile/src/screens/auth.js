import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { DEMO_ACCOUNTS, PASSWORD } from '../data';
import { useApp } from '../store';
import { colors, fonts } from '../theme';
import { Avatar, Body, Button, Field, Heading, Logo, Screen, Segment, TextLink } from '../components/ui';

export function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('Login'), 1400);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.splash}>
      <Logo height={168} align="center" />
      <View style={styles.rule} />
      <Text style={styles.wordmark}>CampusHub</Text>
    </View>
  );
}

export function LoginScreen({ navigation }) {
  const { login, loginAs, users } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const submit = () => {
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <Screen>
      <View style={styles.loginLogo}>
        <Logo height={96} align="center" />
      </View>
      <Heading>Sign in</Heading>
      <Body muted>Guru Nanak Institute of Management Studies</Body>
      <Field
        label="College email"
        value={email}
        onChangeText={setEmail}
        placeholder="name@gnims.edu.in"
        autoCapitalize="none"
        keyboardType="email-address"
        error={error}
      />
      <Field
        label="Password"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          setError('');
        }}
        placeholder="Password"
        secure
        revealed={show}
        onToggleSecure={() => setShow((value) => !value)}
        autoCapitalize="none"
      />
      <Button label="Sign in" onPress={submit} />
      <TextLink label="Create an account" onPress={() => navigation.navigate('Register')} />
      <Body muted style={styles.note}>
        Dean accounts are created by the college.
      </Body>
      <View style={styles.preview}>
        <Text style={styles.previewTitle}>Preview a college account</Text>
        <Body muted>Shared preview password: {PASSWORD}</Body>
        {DEMO_ACCOUNTS.map((account) => {
          const person = users.find((user) => user.id === account.id);
          if (!person) return null;
          return (
            <Pressable
              key={account.id}
              style={styles.previewRow}
              onPress={() => {
                loginAs(person.id);
                navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.previewName}>{person.name}</Text>
                <Text style={styles.previewNote}>{account.note}</Text>
              </View>
              <Text style={styles.previewGo}>Open</Text>
            </Pressable>
          );
        })}
      </View>
      <TextLink label="Brand guide" onPress={() => navigation.navigate('Guide')} />
    </Screen>
  );
}

const emptyDraft = {
  role: 'Student',
  name: '',
  email: '',
  enrollment: '',
  stream: '',
  year: '',
  phone: '',
  department: '',
  designation: '',
};

export function RegisterScreen({ navigation }) {
  const [draft, setDraft] = useState(emptyDraft);
  const [errors, setErrors] = useState({});
  const set = (key) => (value) => setDraft((current) => ({ ...current, [key]: value }));
  const student = draft.role === 'Student';

  const next = () => {
    const nextErrors = {};
    if (!draft.name.trim()) nextErrors.name = 'Enter your full name.';
    if (!/^[^\s@]+@gnims\.edu\.in$/i.test(draft.email.trim())) {
      nextErrors.email = 'Use your college email, ending in @gnims.edu.in.';
    }
    if (student) {
      if (!draft.enrollment.trim()) nextErrors.enrollment = 'Enter your enrollment number.';
      if (!draft.stream) nextErrors.stream = 'Choose a stream.';
      if (!draft.year) nextErrors.year = 'Choose your year.';
      if (draft.phone.replace(/\D/g, '').length < 10) nextErrors.phone = 'Enter a phone number of at least 10 digits.';
    } else {
      if (!draft.department.trim()) nextErrors.department = 'Enter your department.';
      if (!draft.designation.trim()) nextErrors.designation = 'Enter your designation.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    navigation.navigate('RegisterAbout', { draft });
  };

  return (
    <Screen>
      <View style={styles.loginLogo}>
        <Logo height={96} align="center" />
      </View>
      <Heading>Create an account</Heading>
      <Body muted>Step 1 of 2 · College details</Body>
      <Segment options={['Student', 'Faculty']} value={draft.role} onChange={set('role')} />
      <Field label="Full name" value={draft.name} onChangeText={set('name')} placeholder="Ananya Shah" error={errors.name} />
      <Field
        label="College email"
        value={draft.email}
        onChangeText={set('email')}
        placeholder="name@gnims.edu.in"
        autoCapitalize="none"
        keyboardType="email-address"
        error={errors.email}
      />
      {student ? (
        <>
          <Field label="Enrollment number" value={draft.enrollment} onChangeText={set('enrollment')} placeholder="MCA2025-031" error={errors.enrollment} />
          <Text style={styles.choiceLabel}>Stream</Text>
          <View style={styles.choiceRow}>
            {['MCA', 'MSS', 'PGDM', 'Other'].map((option) => (
              <Choice key={option} label={option} selected={draft.stream === option} onPress={() => set('stream')(option)} />
            ))}
          </View>
          {errors.stream ? <Text style={styles.inlineError}>{errors.stream}</Text> : null}
          <Text style={styles.choiceLabel}>Year</Text>
          <View style={styles.choiceRow}>
            {['1st', '2nd'].map((option) => (
              <Choice key={option} label={option} selected={draft.year === option} onPress={() => set('year')(option)} />
            ))}
          </View>
          {errors.year ? <Text style={styles.inlineError}>{errors.year}</Text> : null}
          <Field
            label="Phone number"
            value={draft.phone}
            onChangeText={set('phone')}
            placeholder="98XXX XXXXX"
            keyboardType="phone-pad"
            helper="Hidden from profiles. A committee sees it only if you apply to its event."
            error={errors.phone}
          />
        </>
      ) : (
        <>
          <Field label="Department" value={draft.department} onChangeText={set('department')} placeholder="Department of Computer Applications" error={errors.department} />
          <Field label="Designation" value={draft.designation} onChangeText={set('designation')} placeholder="Assistant Professor" error={errors.designation} />
        </>
      )}
      <Button label="Continue" onPress={next} />
      <TextLink label="Already have an account? Sign in" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

export function RegisterAboutScreen({ navigation, route }) {
  const { register } = useApp();
  const incoming = route.params?.draft || emptyDraft;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [about, setAbout] = useState('');
  const [photo, setPhoto] = useState(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]?.uri) setPhoto(result.assets[0].uri);
  };

  const finish = () => {
    if (password.length < 8) {
      setError('Use at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Those passwords do not match.');
      return;
    }
    const result = register({
      role: incoming.role === 'Faculty' ? 'faculty' : 'student',
      name: incoming.name,
      email: incoming.email,
      password,
      phone: incoming.phone,
      enrollment: incoming.enrollment,
      stream: incoming.stream,
      year: incoming.year,
      department: incoming.department,
      designation: incoming.designation,
      about,
      photo,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <Screen>
      <View style={styles.loginLogo}>
        <Logo height={96} align="center" />
      </View>
      <Heading>Set your password</Heading>
      <Body muted>Step 2 of 2 · You can add a photo and a short note, or skip them.</Body>
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="At least 8 characters"
        secure
        revealed={show}
        onToggleSecure={() => setShow((value) => !value)}
        autoCapitalize="none"
      />
      <Field
        label="Confirm password"
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Repeat the password"
        secure
        revealed={show}
        autoCapitalize="none"
        error={error}
      />
      <Text style={styles.choiceLabel}>Profile picture · optional</Text>
      <View style={styles.photoRow}>
        <Avatar name={incoming.name || 'New student'} photo={photo} size={64} />
        <Button label={photo ? 'Change picture' : 'Add a picture'} variant="secondary" onPress={pick} />
      </View>
      <Field label="About · optional" value={about} onChangeText={setAbout} placeholder="A short note about your college work" />
      <Button label="Create account" onPress={finish} />
      <Button label="Skip for now" variant="ghost" onPress={finish} />
    </Screen>
  );
}

function Choice({ label, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.choice, selected && styles.choiceOn]} accessibilityRole="button" accessibilityState={{ selected }}>
      <Text style={[styles.choiceText, selected && styles.choiceTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 8 },
  wordmark: { fontFamily: fonts.serif, fontSize: 32, color: colors.text },
  rule: { width: 48, height: 2, backgroundColor: colors.accent, marginTop: 8 },
  loginLogo: { alignItems: 'center', marginBottom: 8 },
  note: { textAlign: 'center' },
  preview: { gap: 8, marginTop: 8 },
  previewTitle: { fontFamily: fonts.serif, fontSize: 18, color: colors.text },
  previewRow: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewName: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  previewNote: { fontFamily: fonts.body, fontSize: 13, color: colors.muted },
  previewGo: { fontFamily: fonts.semibold, fontSize: 14, color: colors.primary },
  choiceLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  choiceText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  choiceTextOn: { color: '#FFFFFF' },
  inlineError: { fontFamily: fonts.medium, fontSize: 13, color: colors.error },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { tierForPoints } from '../data';
import { useApp } from '../store';
import { colors, fonts } from '../theme';
import { roleLine, tierLine } from '../view';
import { AppHeader, Avatar, Body, Button, Card, EmptyState, Field, Screen, TierChip } from '../components/ui';
import { findUser, SectionLabel } from './common';

export function SearchBody({ viewer, users, onOpen }) {
  const [query, setQuery] = useState('');
  const text = query.trim().toLowerCase();
  const results = text
    ? users.filter((person) => {
        const hay = `${person.name} ${person.email} ${person.stream} ${person.department} ${person.designation}`.toLowerCase();
        return hay.includes(text);
      })
    : [];

  return (
    <View style={styles.wrap}>
      <Field label="Find a person" value={query} onChangeText={setQuery} placeholder="Name, stream, or department" autoCapitalize="none" />
      {!text ? (
        <EmptyState title="Search the college" body="Find a student, a faculty member, or the dean and open their profile." />
      ) : results.length === 0 ? (
        <EmptyState title="No one matches that name" body="Try a stream such as MCA, or a department." />
      ) : (
        results.map((person) => (
          <PersonLine key={person.id} person={person} self={person.id === viewer.id} onPress={() => onOpen(person.id)} />
        ))
      )}
    </View>
  );
}

export function ProfileBody({ person, self, onEdit }) {
  if (!person) return <EmptyState title="Profile unavailable" body="This account could not be opened." />;
  const student = person.role === 'student';
  return (
    <View style={styles.wrap}>
      <View style={styles.identity}>
        <Avatar name={person.name} photo={person.photo} size={72} />
        <View style={styles.flex}>
          <Text style={styles.name}>{person.name}</Text>
          <Body muted>{roleLine(person)}</Body>
          {student ? <TierChip tier={tierForPoints(person.points)} /> : null}
        </View>
      </View>
      {self ? (
        <Button label="Edit profile" variant="secondary" onPress={onEdit} />
      ) : null}
      {student ? <Body muted>{tierLine(person.points)}</Body> : null}
      {person.committee ? (
        <Card>
          <Text style={styles.kicker}>Committee</Text>
          <Text style={styles.itemTitle}>
            {person.committee.name} · {person.committee.rank}
          </Text>
        </Card>
      ) : null}
      <SectionLabel>About</SectionLabel>
      <Body>{person.about || 'No about note yet.'}</Body>
      <RecordList
        title="Event contributions"
        empty="No event contributions yet."
        rows={person.contributions.map((item) => ({
          id: item.id,
          title: item.event,
          detail: `${item.committee} · ${item.role}`,
        }))}
      />
      <RecordList
        title="Certificates"
        empty="No certificates yet."
        rows={person.certificates.map((item) => ({
          id: item.id,
          title: item.title,
          detail: `${item.issuer} · ${item.year}`,
        }))}
      />
      <RecordList
        title="Projects"
        empty="No projects yet."
        rows={person.projects.map((item) => ({ id: item.id, title: item.title, detail: item.detail }))}
      />
      <RecordList
        title="Experience"
        empty="No experience yet."
        rows={person.experience.map((item) => ({
          id: item.id,
          title: item.role,
          detail: `${item.org} · ${item.year}`,
        }))}
      />
      <SectionLabel>Email</SectionLabel>
      <Body>{person.email}</Body>
      {self && student ? (
        <>
          <SectionLabel>Enrollment</SectionLabel>
          <Body>{person.enrollment}</Body>
        </>
      ) : null}
    </View>
  );
}

export function ProfileScreen({ navigation, route }) {
  const app = useApp();
  const insets = useSafeAreaInsets();
  const person = findUser(app.users, route.params?.userId);
  const self = person?.id === app.currentUserId;
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppHeader title="Profile" onBack={() => navigation.goBack()} showLogo />
      <Screen>
        <ProfileBody
          person={person}
          self={self}
          onEdit={() => navigation.navigate('EditProfile')}
        />
      </Screen>
    </View>
  );
}

export function EditProfileScreen({ navigation }) {
  const app = useApp();
  const insets = useSafeAreaInsets();
  const person = findUser(app.users, app.currentUserId);
  const [about, setAbout] = useState(person?.about || '');
  const [photo, setPhoto] = useState(person?.photo || null);
  const [certificate, setCertificate] = useState({ title: '', issuer: '', year: '' });
  const [project, setProject] = useState({ title: '', detail: '' });
  const [experience, setExperience] = useState({ role: '', org: '', year: '' });
  const [message, setMessage] = useState('');

  if (!person) return null;

  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]?.uri) setPhoto(result.assets[0].uri);
  };

  const saveAbout = () => {
    app.updateProfile(person.id, { about: about.trim(), photo });
    setMessage('Profile saved.');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppHeader title="Edit profile" onBack={() => navigation.goBack()} />
      <Screen>
        <View style={styles.identity}>
          <Avatar name={person.name} photo={photo} size={72} />
          <Button label={photo ? 'Change picture' : 'Add a picture'} variant="secondary" onPress={pick} />
        </View>
        <Field label="About" value={about} onChangeText={setAbout} placeholder="A short note about your college work" multiline />
        <Button label="Save profile" onPress={saveAbout} />
        {message ? <Body muted>{message}</Body> : null}
        <SectionLabel>Add a certificate</SectionLabel>
        <Field label="Title" value={certificate.title} onChangeText={(title) => setCertificate((item) => ({ ...item, title }))} placeholder="Certificate name" />
        <Field label="Issuer" value={certificate.issuer} onChangeText={(issuer) => setCertificate((item) => ({ ...item, issuer }))} placeholder="Who issued it" />
        <Field label="Year" value={certificate.year} onChangeText={(year) => setCertificate((item) => ({ ...item, year }))} placeholder="2026" keyboardType="number-pad" />
        <Button
          label="Add certificate"
          variant="secondary"
          onPress={() => {
            if (!certificate.title.trim()) return;
            app.addProfileItem(person.id, 'certificates', {
              title: certificate.title.trim(),
              issuer: certificate.issuer.trim() || 'GNIMS',
              year: certificate.year.trim() || '2026',
            });
            setCertificate({ title: '', issuer: '', year: '' });
            setMessage('Certificate added.');
          }}
        />
        <SectionLabel>Add a project</SectionLabel>
        <Field label="Title" value={project.title} onChangeText={(title) => setProject((item) => ({ ...item, title }))} placeholder="Project name" />
        <Field label="Detail" value={project.detail} onChangeText={(detail) => setProject((item) => ({ ...item, detail }))} placeholder="What you did" multiline />
        <Button
          label="Add project"
          variant="secondary"
          onPress={() => {
            if (!project.title.trim()) return;
            app.addProfileItem(person.id, 'projects', { title: project.title.trim(), detail: project.detail.trim() });
            setProject({ title: '', detail: '' });
            setMessage('Project added.');
          }}
        />
        <SectionLabel>Add experience</SectionLabel>
        <Field label="Role" value={experience.role} onChangeText={(role) => setExperience((item) => ({ ...item, role }))} placeholder="Volunteer" />
        <Field label="Organisation" value={experience.org} onChangeText={(org) => setExperience((item) => ({ ...item, org }))} placeholder="College society" />
        <Field label="Year" value={experience.year} onChangeText={(year) => setExperience((item) => ({ ...item, year }))} placeholder="2025" />
        <Button
          label="Add experience"
          variant="secondary"
          onPress={() => {
            if (!experience.role.trim()) return;
            app.addProfileItem(person.id, 'experience', {
              role: experience.role.trim(),
              org: experience.org.trim() || 'GNIMS',
              year: experience.year.trim() || '2026',
            });
            setExperience({ role: '', org: '', year: '' });
            setMessage('Experience added.');
          }}
        />
      </Screen>
    </View>
  );
}

function PersonLine({ person, self, onPress }) {
  const tier = person.role === 'student' ? tierForPoints(person.points) : null;
  return (
    <Pressable onPress={onPress} style={styles.line} accessibilityRole="button">
      <Avatar name={person.name} photo={person.photo} />
      <View style={styles.flex}>
        <Text style={styles.itemTitle}>{self ? `${person.name} · You` : person.name}</Text>
        <Text style={styles.kicker}>{roleLine(person)}</Text>
      </View>
      {tier ? <TierChip tier={tier} /> : null}
    </Pressable>
  );
}

function RecordList({ title, rows, empty }) {
  return (
    <View style={styles.wrap}>
      <SectionLabel>{title}</SectionLabel>
      {rows.length === 0 ? (
        <Body muted>{empty}</Body>
      ) : (
        rows.map((row) => (
          <View key={row.id} style={styles.record}>
            <Text style={styles.itemTitle}>{row.title}</Text>
            {row.detail ? <Text style={styles.kicker}>{row.detail}</Text> : null}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  wrap: { gap: 10 },
  flex: { flex: 1, gap: 4 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 32, color: colors.text },
  itemTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  kicker: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.muted },
  line: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  record: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: 12,
    gap: 2,
  },
});

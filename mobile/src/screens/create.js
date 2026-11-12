import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TIERS, eventStatus } from '../data';
import { useApp } from '../store';
import { colors, fonts } from '../theme';
import { AppHeader, Body, Button, Card, Chip, Field, Screen, Segment, StatusBadge } from '../components/ui';
import { findUser } from './common';

const blankPosition = () => ({ name: '', slots: '1', tier: 'Silver' });

function fromEvent(event) {
  if (!event) {
    return {
      title: '',
      type: 'Volunteer',
      date: '',
      venue: '',
      applyBy: '',
      points: '20',
      coordinatorId: '',
      positions: [blankPosition()],
    };
  }
  return {
    title: event.title,
    type: event.type,
    date: event.date,
    venue: event.venue,
    applyBy: event.applyBy,
    points: String(event.points),
    coordinatorId: event.coordinatorId,
    positions: event.positions.map((position) => ({
      id: position.id,
      name: position.name,
      slots: String(position.slots),
      tier: position.tier,
    })),
  };
}

export function CreateForm({ navigation, eventId }) {
  const app = useApp();
  const existing = eventId ? app.events.find((item) => item.id === eventId) : null;
  const [draft, setDraft] = useState(() => fromEvent(existing));
  const [query, setQuery] = useState('');
  const [errors, setErrors] = useState({});
  const set = (key) => (value) => setDraft((current) => ({ ...current, [key]: value }));
  const faculty = app.users.filter((user) => user.role === 'faculty');
  const coordinator = faculty.find((user) => user.id === draft.coordinatorId);
  const matches = faculty.filter((user) => user.name.toLowerCase().includes(query.trim().toLowerCase()));
  const dean = app.users.find((user) => user.role === 'dean');
  const posts = app.events.filter((event) => event.ownerId === app.currentUserId);

  const updatePosition = (index, key, value) => {
    setDraft((current) => ({
      ...current,
      positions: current.positions.map((position, positionIndex) =>
        positionIndex === index ? { ...position, [key]: value } : position
      ),
    }));
  };

  const submit = () => {
    const nextErrors = {};
    if (!draft.title.trim()) nextErrors.title = 'Enter the event title.';
    if (!draft.date.trim()) nextErrors.date = 'Enter the event date.';
    if (!draft.venue.trim()) nextErrors.venue = 'Enter the venue.';
    if (!draft.applyBy.trim()) nextErrors.applyBy = 'Enter the last date to apply.';
    if (!Number(draft.points)) nextErrors.points = 'Enter the points a student earns if accepted.';
    if (!draft.coordinatorId) nextErrors.coordinator = 'Tag the faculty coordinator.';
    if (!draft.positions.length || draft.positions.some((position) => !position.name.trim() || Number(position.slots) < 1)) {
      nextErrors.positions = 'Each position needs a name and at least one slot.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const payload = {
      title: draft.title,
      type: draft.type,
      date: draft.date,
      venue: draft.venue,
      applyBy: draft.applyBy,
      points: draft.points,
      coordinatorId: draft.coordinatorId,
      positions: draft.positions.map((position) => ({
        id: position.id,
        name: position.name.trim(),
        slots: Number(position.slots),
        tier: position.tier,
        role: position.tier === 'Silver' ? 'Volunteer' : position.tier === 'Gold' ? 'Lead' : 'Head',
      })),
    };
    const result = existing ? app.resubmitEvent(existing.id, payload) : app.createEvent(payload);
    if (!result.ok) return;
    navigation.navigate('Event', { eventId: result.eventId });
  };

  return (
    <View style={styles.wrap}>
      {!existing && posts.length ? (
        <View style={styles.wrap}>
          <Text style={styles.section}>Your posts</Text>
          {posts.map((event) => (
            <Card key={event.id}>
              <View style={styles.row}>
                <Text style={styles.kicker}>{event.committee}</Text>
                <StatusBadge status={eventStatus(event)} />
              </View>
              <Text style={styles.postTitle}>{event.title}</Text>
              <Button label="Open" variant="secondary" onPress={() => navigation.navigate('Event', { eventId: event.id })} />
            </Card>
          ))}
        </View>
      ) : null}
      <Text style={styles.section}>{existing ? 'Fix this event' : 'New event'}</Text>
      <Body muted>Status will be Pending and hidden from the feed until the coordinator and the dean both approve it.</Body>
      <Field label="Title" value={draft.title} onChangeText={set('title')} placeholder="Tech Fest 2026: event volunteers" error={errors.title} />
      <Text style={styles.label}>Type</Text>
      <Segment options={['Volunteer', 'Participate']} value={draft.type} onChange={set('type')} />
      <Field label="Date" value={draft.date} onChangeText={set('date')} placeholder="Saturday, 14 March 2026" error={errors.date} />
      <Field label="Venue" value={draft.venue} onChangeText={set('venue')} placeholder="GNIMS Auditorium" error={errors.venue} />
      <Field label="Apply by" value={draft.applyBy} onChangeText={set('applyBy')} placeholder="Saturday, 7 March 2026" error={errors.applyBy} />
      <Field label="Points per accepted student" value={draft.points} onChangeText={set('points')} placeholder="20" keyboardType="number-pad" error={errors.points} />
      <Text style={styles.section}>Positions</Text>
      {draft.positions.map((position, index) => (
        <Card key={`${position.id || 'new'}-${index}`}>
          <Field label="Position name" value={position.name} onChangeText={(value) => updatePosition(index, 'name', value)} placeholder="Registration desk" />
          <Field label="Slots" value={position.slots} onChangeText={(value) => updatePosition(index, 'slots', value)} keyboardType="number-pad" />
          <Text style={styles.label}>Open to</Text>
          <View style={styles.choiceRow}>
            {TIERS.map((tier) => (
              <Chip key={tier} label={tier} tone={position.tier === tier ? tier : undefined} selected={position.tier === tier} onPress={() => updatePosition(index, 'tier', tier)} />
            ))}
          </View>
          {draft.positions.length > 1 ? (
            <Button
              label="Remove position"
              variant="ghost"
              onPress={() =>
                setDraft((current) => ({
                  ...current,
                  positions: current.positions.filter((_, positionIndex) => positionIndex !== index),
                }))
              }
            />
          ) : null}
        </Card>
      ))}
      {errors.positions ? <Text style={styles.error}>{errors.positions}</Text> : null}
      <Button label="Add a position" variant="secondary" onPress={() => setDraft((current) => ({ ...current, positions: [...current.positions, blankPosition()] }))} />
      <Text style={styles.section}>Coordinator</Text>
      <Body muted>Tag one faculty member. {dean ? `${dean.name} is added automatically as the final approver.` : 'The dean is added automatically.'}</Body>
      {coordinator ? (
        <Chip label={coordinator.name} onRemove={() => set('coordinatorId')('')} />
      ) : (
        <>
          <Field label="Search faculty" value={query} onChangeText={setQuery} placeholder="Dr. Rao" autoCapitalize="words" error={errors.coordinator} />
          {matches.slice(0, 4).map((user) => (
            <Button key={user.id} label={user.name} variant="secondary" onPress={() => set('coordinatorId')(user.id)} />
          ))}
        </>
      )}
      <Chip label="Dean · added automatically" />
      <Button label={existing ? 'Resubmit for approval' : 'Submit for approval'} onPress={submit} />
    </View>
  );
}

export function CreateScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const app = useApp();
  const viewer = findUser(app.users, app.currentUserId);
  const eventId = route.params?.eventId;
  const allowed = viewer?.role === 'student' && viewer.committee;
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppHeader title={eventId ? 'Fix and resubmit' : 'New event'} onBack={() => navigation.goBack()} />
      <Screen>
        {allowed ? <CreateForm navigation={navigation} eventId={eventId} /> : <Body>Only a committee student can post an event.</Body>}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  wrap: { gap: 12 },
  section: { fontFamily: fonts.serif, fontSize: 20, color: colors.text },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  kicker: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted, flex: 1 },
  postTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  error: { fontFamily: fonts.medium, fontSize: 13, color: colors.error },
});

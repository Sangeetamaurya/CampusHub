import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { eventStatus, tierForPoints } from '../data';
import { colors, fonts } from '../theme';
import { isCommittee, openForTier, positionSummary, roleLine, userById } from '../view';
import { Avatar, Body, Button, Card, Chip, Field, MetaRow, StatusBadge, TierChip } from '../components/ui';
import { Icon } from '../components/Icons';

export function tabsFor(user) {
  if (!user) return [];
  if (user.role === 'dean' || user.role === 'faculty') {
    return [
      { id: 'approvals', label: 'Approvals', icon: 'clipboard' },
      { id: 'feed', label: 'Feed', icon: 'home' },
      { id: 'search', label: 'Search', icon: 'search' },
      { id: 'profile', label: 'Profile', icon: 'user' },
    ];
  }
  const tabs = [
    { id: 'feed', label: 'Feed', icon: 'home' },
    { id: 'applications', label: 'Applications', icon: 'clipboard' },
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ];
  if (isCommittee(user)) {
    tabs.splice(2, 0, { id: 'create', label: 'New event', icon: 'plus' }, { id: 'applicants', label: 'Applicants', icon: 'users' });
  }
  return tabs;
}

export function SectionLabel({ children }) {
  return <Text style={styles.section}>{children}</Text>;
}

export function EventCard({ event, viewer, applications, onPress }) {
  const student = viewer?.role === 'student';
  const tier = student ? tierForPoints(viewer.points) : null;
  const open = student ? openForTier(event, tier, applications) : event.positions;
  return (
    <Card>
      <View style={styles.rowBetween}>
        <Text style={styles.kicker}>
          {event.type} · {event.committee}
        </Text>
        <StatusBadge status={eventStatus(event)} />
      </View>
      <Text style={styles.cardTitle}>{event.title}</Text>
      <MetaRow icon="calendar">{event.date}</MetaRow>
      <MetaRow icon="pin">{event.venue}</MetaRow>
      <Text style={styles.meta}>
        {student
          ? open.length
            ? `${open.length} position${open.length === 1 ? '' : 's'} open for ${tier}`
            : `No positions open for ${tier}`
          : `${event.positions.length} positions`}
        {' · '}
        {event.points} points
      </Text>
      <Button label={viewer?.role === 'student' ? 'View and apply' : 'View event'} variant="secondary" onPress={onPress} />
    </Card>
  );
}

export function PersonRow({ person, onPress, extra }) {
  const tier = person.role === 'student' ? tierForPoints(person.points) : null;
  return (
    <Pressable onPress={onPress} style={styles.person} accessibilityRole="button">
      <Avatar name={person.name} photo={person.photo} />
      <View style={styles.flex}>
        <Text style={styles.personName}>{person.name}</Text>
        <Text style={styles.personNote}>{extra || roleLine(person)}</Text>
      </View>
      {tier ? <TierChip tier={tier} /> : null}
      <Icon name="chevronRight" size={18} color={colors.muted} />
    </Pressable>
  );
}

export function PositionBlock({ position, applications, eventId, muted, note }) {
  return (
    <View style={[styles.position, muted && styles.positionMuted]}>
      <View style={styles.rowBetween}>
        <Text style={styles.personName}>{position.name}</Text>
        <Chip label={position.tier} tone={position.tier} />
      </View>
      <Text style={styles.personNote}>
        {position.role} · {positionSummary(position, applications, eventId)}
      </Text>
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );
}

export function canDecide(user, event) {
  if (!user || !event || eventStatus(event) === 'Rejected') return false;
  if (user.role === 'dean') return !event.deanDecision;
  if (user.role === 'faculty') return event.coordinatorId === user.id && !event.coordinatorDecision;
  return false;
}

export function waitingEvents(user, events) {
  if (!user) return [];
  return events.filter((event) => canDecide(user, event));
}

export function ownerEvents(user, events) {
  if (!user) return [];
  return events.filter((event) => event.ownerId === user.id);
}

export function ReasonSheet({ visible, title, onClose, onSubmit }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!reason.trim()) {
      setError('Write a reason so the committee can fix the post.');
      return;
    }
    setReason('');
    setError('');
    onSubmit(reason.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.sheetBackdrop}>
        <View style={styles.sheet}>
          <Text style={styles.cardTitle}>{title || 'Reject this event'}</Text>
          <Body muted>The committee receives this reason and can fix the post.</Body>
          <Field
            label="Reason"
            value={reason}
            onChangeText={(value) => {
              setReason(value);
              setError('');
            }}
            placeholder="What should the committee change?"
            multiline
            error={error}
          />
          <Button label="Send back" onPress={submit} />
          <Button
            label="Cancel"
            variant="ghost"
            onPress={() => {
              setReason('');
              setError('');
              onClose();
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

export function findUser(users, id) {
  return userById(users, id);
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  section: { fontFamily: fonts.serif, fontSize: 20, color: colors.text, marginTop: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  kicker: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted, flex: 1 },
  cardTitle: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 26, color: colors.text },
  meta: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  person: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  personName: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  personNote: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.muted },
  position: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: 12,
    gap: 4,
  },
  positionMuted: { backgroundColor: colors.ivoryDeep },
  note: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(26,26,26,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    gap: 12,
  },
});

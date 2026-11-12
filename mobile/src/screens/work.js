import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { eventStatus, tierForPoints } from '../data';
import { useApp } from '../store';
import { colors, fonts } from '../theme';
import { AppHeader, Avatar, Banner, Body, Button, Card, EmptyState, FilterRow, MetaRow, Screen, StatusBadge, TierChip } from '../components/ui';
import { Icon } from '../components/Icons';
import { ReasonSheet, findUser, ownerEvents, waitingEvents } from './common';

export function ApplicationsBody({ viewer, events, applications, flash, onDismissFlash, onOpenEvent }) {
  const [filter, setFilter] = useState('All');
  const mine = applications
    .filter((item) => item.userId === viewer.id)
    .filter((item) => filter === 'All' || item.status === filter);

  return (
    <View style={styles.wrap}>
      {flash ? <Banner tone={flash.tone} text={flash.text} onClose={onDismissFlash} /> : null}
      <FilterRow options={['All', 'Applied', 'Accepted', 'Rejected']} value={filter} onChange={setFilter} />
      {mine.length === 0 ? (
        <EmptyState title="No applications here" body="When you apply to a live event, it is listed with its status." />
      ) : (
        mine.map((item) => {
          const event = events.find((entry) => entry.id === item.eventId);
          if (!event) return null;
          return (
            <Pressable key={item.id} onPress={() => onOpenEvent(event.id)} style={styles.block} accessibilityRole="button">
              <View style={styles.row}>
                <Text style={styles.kicker}>{event.committee}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.title}>{event.title}</Text>
              <MetaRow icon="calendar">Applied {item.appliedOn}</MetaRow>
              {item.status === 'Accepted' ? <Text style={styles.points}>+{event.points} pts added</Text> : null}
            </Pressable>
          );
        })
      )}
    </View>
  );
}

export function ApprovalsBody({ viewer, events, users, onOpen, onDecided }) {
  const waiting = waitingEvents(viewer, events);
  const [rejectId, setRejectId] = useState(null);
  const [error, setError] = useState('');
  const { decideEvent } = useApp();

  if (waiting.length === 0) {
    return <EmptyState title="No events waiting" body="When a committee tags you, or a post reaches the dean, it appears here." />;
  }

  return (
    <View style={styles.wrap}>
      {error ? <Banner tone="error" text={error} onClose={() => setError('')} /> : null}
      {waiting.map((event) => {
        const owner = findUser(users, event.ownerId);
        return (
          <Card key={event.id}>
            <Text style={styles.kicker}>{event.committee}</Text>
            <Text style={styles.title}>{event.title}</Text>
            <Body muted>
              {event.type} · {event.points} points · {event.positions.length} positions
            </Body>
            <Body muted>{event.date} · {event.venue}</Body>
            {owner ? <Body muted>Posted by {owner.name}</Body> : null}
            <Button label="Read the post" variant="secondary" onPress={() => onOpen(event.id)} />
            <Button
              label="Approve"
              onPress={() => {
                const result = decideEvent(event.id, 'approved', '');
                if (!result.ok) setError(result.error);
                else onDecided();
              }}
            />
            <Button label="Reject" variant="ghost" onPress={() => setRejectId(event.id)} />
          </Card>
        );
      })}
      <ReasonSheet
        visible={Boolean(rejectId)}
        onClose={() => setRejectId(null)}
        onSubmit={(reason) => {
          const result = decideEvent(rejectId, 'rejected', reason);
          if (!result.ok) setError(result.error);
          setRejectId(null);
          if (result.ok) onDecided();
        }}
      />
    </View>
  );
}

export function ApplicantsBody({ viewer, events, applications, users, flash, onDismissFlash, onOpen }) {
  const owned = ownerEvents(viewer, events).filter((event) => eventStatus(event) === 'Live');
  const rows = owned.flatMap((event) =>
    applications
      .filter((item) => item.eventId === event.id)
      .map((item) => ({ item, event, person: findUser(users, item.userId) }))
      .filter((row) => row.person)
  );

  return (
    <View style={styles.wrap}>
      {flash ? <Banner tone={flash.tone} text={flash.text} onClose={onDismissFlash} /> : null}
      {rows.length === 0 ? (
        <EmptyState title="No applicants yet" body="Students appear here after they apply to an event you posted." />
      ) : (
        rows.map(({ item, event, person }) => (
          <Pressable key={item.id} style={styles.person} onPress={() => onOpen(item.id)} accessibilityRole="button">
            <Avatar name={person.name} photo={person.photo} />
            <View style={styles.flex}>
              <Text style={styles.name}>{person.name}</Text>
              <Text style={styles.kicker}>
                {event.title} · {tierForPoints(person.points)}
              </Text>
            </View>
            <StatusBadge status={item.status} />
          </Pressable>
        ))
      )}
    </View>
  );
}

export function ApplicantScreen({ navigation, route }) {
  const app = useApp();
  const insets = useSafeAreaInsets();
  const viewer = findUser(app.users, app.currentUserId);
  const application = app.applications.find((item) => item.id === route.params?.applicationId);
  const event = application ? app.events.find((item) => item.id === application.eventId) : null;
  const person = application ? findUser(app.users, application.userId) : null;
  const position = event?.positions.find((item) => item.id === application?.positionId);
  const [error, setError] = useState('');

  if (!viewer || !application || !event || !person) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <AppHeader title="Applicant" onBack={() => navigation.goBack()} />
        <Screen>
          <Body>This application is no longer available.</Body>
        </Screen>
      </View>
    );
  }

  const committeeOwner = viewer.committee && viewer.committee.name === event.committee && event.ownerId === viewer.id;
  const showPhone = committeeOwner && person.role === 'student';

  const decide = (decision) => {
    const result = app.decideApplication(application.id, decision);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigation.goBack();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppHeader title="Applicant" onBack={() => navigation.goBack()} />
      <Screen
        footer={
          committeeOwner && application.status === 'Applied' ? (
            <View style={styles.stack}>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button label="Accept" onPress={() => decide('Accepted')} />
              <Button label="Reject" variant="secondary" onPress={() => decide('Rejected')} />
            </View>
          ) : null
        }
      >
        <View style={styles.identity}>
          <Avatar name={person.name} photo={person.photo} size={64} />
          <View style={styles.flex}>
            <Text style={styles.title}>{person.name}</Text>
            {person.role === 'student' ? <TierChip tier={tierForPoints(person.points)} /> : null}
          </View>
        </View>
        <StatusBadge status={application.status} />
        <Body muted>{event.title}</Body>
        {position ? (
          <Body>
            {position.name} · {position.tier}
          </Body>
        ) : null}
        {application.note ? <Card><Body>{application.note}</Body></Card> : <Body muted>No note was added.</Body>}
        {showPhone ? (
          <Card>
            <Text style={styles.kicker}>Phone number</Text>
            <Text style={styles.name}>{person.phone}</Text>
            <Body muted>Visible only because this student applied to your event.</Body>
          </Card>
        ) : null}
        {application.status === 'Accepted' ? <Text style={styles.points}>+{event.points} pts added to the profile.</Text> : null}
        <Button label="Open profile" variant="secondary" onPress={() => navigation.navigate('Profile', { userId: person.id })} />
      </Screen>
    </View>
  );
}

export function NotificationsScreen({ navigation }) {
  const app = useApp();
  const insets = useSafeAreaInsets();
  const notes = app.notifications.filter((item) => item.userId === app.currentUserId);

  useEffect(() => {
    app.markNotificationsRead();
  }, [app.markNotificationsRead]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppHeader title="Notifications" onBack={() => navigation.goBack()} />
      <Screen>
        {notes.length === 0 ? (
          <EmptyState title="No notifications" body="Approvals, tags, and application results show up here." />
        ) : (
          notes.map((item) => (
            <View key={item.id} style={styles.block}>
              <View style={styles.row}>
                <Icon name={iconFor(item.kind)} size={18} color={colorFor(item.kind)} />
                <Text style={styles.name}>{item.title}</Text>
              </View>
              <Body>{item.body}</Body>
              <Text style={styles.kicker}>{item.time}</Text>
            </View>
          ))
        )}
      </Screen>
    </View>
  );
}

function iconFor(kind) {
  if (kind === 'rejected') return 'x';
  if (kind === 'tagged') return 'bell';
  if (kind === 'accepted' || kind === 'approved') return 'check';
  return 'clock';
}

function colorFor(kind) {
  if (kind === 'rejected') return colors.error;
  if (kind === 'accepted' || kind === 'approved') return colors.success;
  return colors.warning;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  wrap: { gap: 12 },
  flex: { flex: 1 },
  block: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  kicker: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted, flex: 1 },
  title: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 26, color: colors.text },
  name: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text, flex: 1 },
  points: { fontFamily: fonts.semibold, fontSize: 14, color: colors.success },
  person: {
    minHeight: 68,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stack: { gap: 8 },
  error: { fontFamily: fonts.medium, fontSize: 13, color: colors.error },
});

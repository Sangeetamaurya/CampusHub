import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { eventStatus, tierForPoints } from '../data';
import { useApp } from '../store';
import { colors, fonts } from '../theme';
import { approvalProgress, openForTier, roleLine } from '../view';
import { AppHeader, Body, Button, Card, Field, MetaRow, Screen, StatusBadge } from '../components/ui';
import { PositionBlock, ReasonSheet, canDecide, findUser } from './common';

export function EventScreen({ navigation, route }) {
  const app = useApp();
  const insets = useSafeAreaInsets();
  const viewer = findUser(app.users, app.currentUserId);
  const event = app.events.find((item) => item.id === route.params?.eventId);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState('');

  if (!viewer || !event) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <AppHeader title="Event" onBack={() => navigation.goBack()} />
        <Screen>
          <Body>This event is no longer available.</Body>
        </Screen>
      </View>
    );
  }

  const status = eventStatus(event);
  const coordinator = findUser(app.users, event.coordinatorId);
  const mine = app.applications.find((item) => item.eventId === event.id && item.userId === viewer.id);
  const student = viewer.role === 'student';
  const tier = student ? tierForPoints(viewer.points) : null;
  const open = student ? openForTier(event, tier, app.applications) : [];
  const owner = event.ownerId === viewer.id;
  const decide = canDecide(viewer, event);
  const steps = approvalProgress(event, app.users);
  const applicants = app.applications.filter((item) => item.eventId === event.id);

  const decideAndClose = (decision, reason = '') => {
    const result = app.decideEvent(event.id, decision, reason);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setRejecting(false);
    setError('');
  };

  let footer = null;
  if (decide) {
    footer = (
      <View style={styles.footerStack}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Approve" onPress={() => decideAndClose('approved')} />
        <Button label="Reject" variant="secondary" onPress={() => setRejecting(true)} />
      </View>
    );
  } else if (owner && status === 'Rejected') {
    footer = <Button label="Fix and resubmit" onPress={() => navigation.navigate('Create', { eventId: event.id })} />;
  } else if (student && status === 'Live') {
    if (mine) {
      footer = (
        <Button
          label="View in My applications"
          variant="secondary"
          onPress={() => {
            app.requestTab('applications');
            navigation.navigate('Main');
          }}
        />
      );
    } else if (open.length === 0) {
      footer = <Button label="Not open to your tier" disabled />;
    } else {
      footer = <Button label="Apply" onPress={() => navigation.navigate('Apply', { eventId: event.id })} />;
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppHeader title="Event" onBack={() => navigation.goBack()} />
      <Screen footer={footer}>
        <View style={styles.row}>
          <Text style={styles.kicker}>
            {event.type} · {event.committee}
          </Text>
          <StatusBadge status={status} />
        </View>
        <Text style={styles.title}>{event.title}</Text>
        <MetaRow icon="calendar">{event.date}</MetaRow>
        <MetaRow icon="pin">{event.venue}</MetaRow>
        <MetaRow icon="clock">Apply by {event.applyBy}</MetaRow>
        <MetaRow icon="award">{event.points} points if accepted</MetaRow>
        <MetaRow icon="user">Coordinator · {coordinator ? coordinator.name : 'Faculty'}</MetaRow>
        {status === 'Rejected' ? (
          <Card>
            <Text style={styles.errorTitle}>Sent back</Text>
            <Body>{event.rejectReason}</Body>
          </Card>
        ) : null}
        <Text style={styles.section}>Approval</Text>
        {steps.map((step) => (
          <View key={step.who} style={styles.step}>
            <Text style={styles.stepName}>{step.who}</Text>
            <Text style={styles.stepState}>{step.state}</Text>
          </View>
        ))}
        <Text style={styles.section}>Positions</Text>
        {event.positions.map((position) => {
          const blocked = student && position.tier !== tier;
          return (
            <PositionBlock
              key={position.id}
              position={position}
              applications={app.applications}
              eventId={event.id}
              muted={blocked}
              note={blocked ? 'Not open to your tier' : ''}
            />
          );
        })}
        {owner ? (
          <Button
            label={applicants.length ? `Review applicants · ${applicants.length}` : 'No applicants yet'}
            variant="secondary"
            disabled={!applicants.length}
            onPress={() => {
              app.requestTab('applicants');
              navigation.navigate('Main');
            }}
          />
        ) : null}
        {viewer.role === 'dean'
          ? applicants.map((item) => {
              const person = findUser(app.users, item.userId);
              if (!person) return null;
              return (
                <Button
                  key={item.id}
                  label={`${person.name} · ${item.status}`}
                  variant="secondary"
                  onPress={() => navigation.navigate('Applicant', { applicationId: item.id })}
                />
              );
            })
          : null}
      </Screen>
      <ReasonSheet visible={rejecting} onClose={() => setRejecting(false)} onSubmit={(reason) => decideAndClose('rejected', reason)} />
    </View>
  );
}

export function ApplyScreen({ navigation, route }) {
  const app = useApp();
  const insets = useSafeAreaInsets();
  const viewer = findUser(app.users, app.currentUserId);
  const event = app.events.find((item) => item.id === route.params?.eventId);
  const tier = viewer ? tierForPoints(viewer.points) : 'Silver';
  const choices = event && viewer ? openForTier(event, tier, app.applications) : [];
  const [positionId, setPositionId] = useState(choices[0]?.id || '');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    const result = app.apply(event.id, positionId, note);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  if (!viewer || !event) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <AppHeader title="Apply" onBack={() => navigation.goBack()} />
        <Screen>
          <Body>This event is no longer open.</Body>
        </Screen>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppHeader title="Apply" onBack={() => navigation.goBack()} />
      <Screen
        footer={
          <Button label="Submit application" onPress={submit} disabled={!positionId} />
        }
      >
        <Text style={styles.title}>{event.title}</Text>
        <Body muted>
          {roleLine(viewer)} · {tier} tier
        </Body>
        <Text style={styles.section}>Position</Text>
        {choices.length === 0 ? (
          <Body muted>No position is open for your tier.</Body>
        ) : (
          choices.map((position) => {
            const selected = position.id === positionId;
            return (
              <Button
                key={position.id}
                label={position.name}
                variant={selected ? 'primary' : 'secondary'}
                onPress={() => setPositionId(position.id)}
              />
            );
          })
        )}
        <Field
          label="Note to the committee"
          value={note}
          onChangeText={setNote}
          placeholder="Say which shift you can take, or why you are applying."
          multiline
          error={error}
        />
        <Body muted>Your profile is shared with the committee.</Body>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  kicker: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted, flex: 1 },
  title: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 32, color: colors.text },
  section: { fontFamily: fonts.serif, fontSize: 20, color: colors.text, marginTop: 8 },
  step: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepName: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  stepState: { fontFamily: fonts.semibold, fontSize: 14, color: colors.muted },
  errorTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.error },
  error: { fontFamily: fonts.medium, fontSize: 13, color: colors.error },
  footerStack: { gap: 8 },
});

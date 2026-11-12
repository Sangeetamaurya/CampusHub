import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatLongDate, tierForPoints, tierProgress } from '../data';
import { colors, fonts } from '../theme';
import { greeting, tierLine, visibleEvents } from '../view';
import { Banner, Body, Card, EmptyState, ErrorState, FilterRow, Heading, LoadingState, ProgressBar, TierChip } from '../components/ui';
import { EventCard } from './common';

let feedWarmed = false;

export function FeedBody({ viewer, events, applications, flash, onDismissFlash, onOpen }) {
  const [ready, setReady] = useState(feedWarmed);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (feedWarmed) return undefined;
    const timer = setTimeout(() => {
      feedWarmed = true;
      setReady(true);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) return <LoadingState title="Loading the feed" />;
  if (failed || !Array.isArray(events)) {
    return (
      <ErrorState
        title="The feed did not load"
        body="Check your connection and try again."
        onRetry={() => {
          setFailed(false);
          setReady(true);
        }}
      />
    );
  }

  const live = visibleEvents(events).filter((event) => filter === 'All' || event.type === filter);
  const student = viewer.role === 'student';

  return (
    <View style={styles.wrap}>
      <Heading size={26}>{greeting(viewer.shortName || viewer.name)}</Heading>
      <Body muted>{formatLongDate()}</Body>
      {flash ? <Banner tone={flash.tone} text={flash.text} onClose={onDismissFlash} /> : null}
      {student ? (
        <Card>
          <View style={styles.tierRow}>
            <TierChip tier={tierForPoints(viewer.points)} />
            <Text style={styles.points}>{viewer.points} pts</Text>
          </View>
          <ProgressBar value={tierProgress(viewer.points)} />
          <Body muted>{tierLine(viewer.points)}</Body>
        </Card>
      ) : (
        <Body muted>
          {viewer.role === 'dean'
            ? 'Pending approvals are on the first tab. Live events are listed here.'
            : 'Live events are listed here. Tagged events wait under Approvals.'}
        </Body>
      )}
      <FilterRow options={['All', 'Volunteer', 'Participate']} value={filter} onChange={setFilter} />
      {live.length === 0 ? (
        <EmptyState title="No events in this category" body="Live events appear here after the coordinator and the dean both approve them." />
      ) : (
        live.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            viewer={viewer}
            applications={applications}
            onPress={() => onOpen(event.id)}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  tierRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  points: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
});

import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../store';
import { colors } from '../theme';
import { AppHeader, BellButton, Screen, TabBar } from '../components/ui';
import { findUser, tabsFor } from './common';
import { CreateForm } from './create';
import { FeedBody } from './feed';
import { ProfileBody } from './people';
import { ApplicantsBody, ApplicationsBody, ApprovalsBody } from './work';
import { SearchBody } from './people';

const TITLES = {
  feed: 'CampusHub',
  applications: 'My applications',
  approvals: 'Approvals',
  search: 'Search',
  profile: 'Profile',
  create: 'New event',
  applicants: 'Applicants',
};

export function MainScreen({ navigation }) {
  const app = useApp();
  const insets = useSafeAreaInsets();
  const viewer = findUser(app.users, app.currentUserId);
  const tabs = tabsFor(viewer);
  const [tab, setTab] = useState(tabs[0]?.id || 'feed');

  useEffect(() => {
    if (!app.requestedTab) return;
    if (tabs.some((item) => item.id === app.requestedTab)) setTab(app.requestedTab);
    app.clearRequest();
  }, [app, app.requestedTab, tabs]);

  if (!viewer) return null;

  const unread = app.notifications.filter((item) => item.userId === viewer.id && !item.read).length;
  const showLogo = tab === 'feed' || tab === 'approvals' || tab === 'profile';
  const openEvent = (eventId) => navigation.navigate('Event', { eventId });

  let body = null;
  if (tab === 'feed') {
    body = (
      <FeedBody
        viewer={viewer}
        events={app.events}
        applications={app.applications}
        flash={app.flash}
        onDismissFlash={app.clearFlash}
        onOpen={openEvent}
      />
    );
  } else if (tab === 'applications') {
    body = (
      <ApplicationsBody
        viewer={viewer}
        events={app.events}
        applications={app.applications}
        flash={app.flash}
        onDismissFlash={app.clearFlash}
        onOpenEvent={openEvent}
      />
    );
  } else if (tab === 'approvals') {
    body = <ApprovalsBody viewer={viewer} events={app.events} users={app.users} onOpen={openEvent} onDecided={() => {}} />;
  } else if (tab === 'search') {
    body = <SearchBody viewer={viewer} users={app.users} onOpen={(userId) => navigation.navigate('Profile', { userId })} />;
  } else if (tab === 'profile') {
    body = <ProfileBody person={viewer} self onEdit={() => navigation.navigate('EditProfile')} />;
  } else if (tab === 'create') {
    body = <CreateForm navigation={navigation} />;
  } else if (tab === 'applicants') {
    body = (
      <ApplicantsBody
        viewer={viewer}
        events={app.events}
        applications={app.applications}
        users={app.users}
        flash={app.flash}
        onDismissFlash={app.clearFlash}
        onOpen={(applicationId) => navigation.navigate('Applicant', { applicationId })}
      />
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppHeader
        title={TITLES[tab] || 'CampusHub'}
        showLogo={showLogo}
        right={<BellButton count={unread} onPress={() => navigation.navigate('Notifications')} />}
      />
      <Screen>{body}</Screen>
      <TabBar tabs={tabs} value={tab} onChange={setTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});

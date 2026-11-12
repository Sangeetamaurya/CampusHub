import { createContext, useContext, useMemo, useReducer, useRef } from 'react';
import {
  createSeed,
  eventStatus,
  formatDay,
  nextId,
  slotsOpen,
  tierForPoints,
} from './data';

const AppContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'PATCH':
      return { ...state, ...action.patch };
    case 'ADD_NOTES':
      return { ...state, notifications: [...action.notes, ...state.notifications] };
    default:
      return state;
  }
}

function personName(users, id) {
  return users.find((user) => user.id === id)?.name || 'A faculty member';
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, createSeed);
  const stateRef = useRef(state);
  stateRef.current = state;

  const api = useMemo(() => {
    const patch = (partial) => dispatch({ type: 'PATCH', patch: partial });
    const get = () => stateRef.current;

    const note = (userId, kind, title, body) => ({
      id: nextId('n'),
      userId,
      kind,
      title,
      body,
      time: 'Just now',
      read: false,
    });
    const addNotes = (notes) => dispatch({ type: 'ADD_NOTES', notes });

    return {
      login(email, password) {
        const current = get();
        const user = current.users.find(
          (item) => item.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (!user || user.password !== password) {
          return { ok: false, error: 'That email and password do not match a CampusHub account.' };
        }
        patch({ currentUserId: user.id, flash: null });
        return { ok: true };
      },
      loginAs(userId) {
        patch({ currentUserId: userId, flash: null });
      },
      logout() {
        patch({ currentUserId: null, requestedTab: null, flash: null });
      },
      register(draft) {
        const current = get();
        const email = draft.email.trim().toLowerCase();
        if (current.users.some((item) => item.email.toLowerCase() === email)) {
          return { ok: false, error: 'An account with this email already exists. Sign in instead.' };
        }
        const user = {
          id: nextId('u'),
          role: draft.role,
          name: draft.name.trim(),
          shortName: draft.name.trim().split(' ')[0],
          email,
          password: draft.password,
          phone: draft.role === 'student' ? draft.phone.trim() : '',
          enrollment: draft.role === 'student' ? draft.enrollment.trim() : '',
          stream: draft.role === 'student' ? draft.stream.trim() : '',
          year: draft.role === 'student' ? draft.year : '',
          department: draft.role === 'faculty' ? draft.department.trim() : '',
          designation: draft.role === 'faculty' ? draft.designation.trim() : '',
          about: draft.about.trim(),
          photo: draft.photo,
          points: 0,
          committee: null,
          certificates: [],
          projects: [],
          experience: [],
          contributions: [],
        };
        patch({ users: [...current.users, user], currentUserId: user.id, flash: null });
        return { ok: true };
      },
      updateProfile(userId, changes) {
        const current = get();
        patch({
          users: current.users.map((user) => (user.id === userId ? { ...user, ...changes } : user)),
        });
      },
      addProfileItem(userId, key, item) {
        const current = get();
        patch({
          users: current.users.map((user) =>
            user.id === userId ? { ...user, [key]: [...user[key], { ...item, id: nextId(key) }] } : user
          ),
        });
      },
      requestTab(tab) {
        patch({ requestedTab: tab });
      },
      clearRequest() {
        patch({ requestedTab: null });
      },
      clearFlash() {
        patch({ flash: null });
      },
      markNotificationsRead() {
        const current = get();
        const userId = current.currentUserId;
        if (!current.notifications.some((item) => item.userId === userId && !item.read)) return;
        patch({
          notifications: current.notifications.map((item) =>
            item.userId === userId ? { ...item, read: true } : item
          ),
        });
      },
      createEvent(draft) {
        const current = get();
        const owner = current.users.find((user) => user.id === current.currentUserId);
        const event = {
          id: nextId('e'),
          ownerId: owner.id,
          title: draft.title.trim(),
          type: draft.type,
          date: draft.date.trim(),
          venue: draft.venue.trim(),
          applyBy: draft.applyBy.trim(),
          points: Number(draft.points),
          committee: owner.committee.name,
          coordinatorId: draft.coordinatorId,
          coordinatorDecision: null,
          deanDecision: null,
          rejectReason: '',
          rejectedBy: '',
          positions: draft.positions.map((position) => ({
            ...position,
            id: nextId('p'),
            slots: Number(position.slots),
          })),
        };
        patch({ events: [event, ...current.events] });
        const coordinator = personName(current.users, draft.coordinatorId);
        const dean = current.users.find((user) => user.role === 'dean');
        addNotes([
          note(draft.coordinatorId, 'tagged', 'You were tagged', `${owner.committee.name} tagged you as coordinator for ${event.title}.`),
          note(dean.id, 'tagged', 'Event waiting', `${event.title} was submitted by ${owner.committee.name} and is waiting for approval.`),
        ]);
        return { ok: true, eventId: event.id, coordinator };
      },
      resubmitEvent(eventId, draft) {
        const current = get();
        const owner = current.users.find((user) => user.id === current.currentUserId);
        const events = current.events.map((event) =>
          event.id === eventId
            ? {
                ...event,
                title: draft.title.trim(),
                type: draft.type,
                date: draft.date.trim(),
                venue: draft.venue.trim(),
                applyBy: draft.applyBy.trim(),
                points: Number(draft.points),
                coordinatorId: draft.coordinatorId,
                coordinatorDecision: null,
                deanDecision: null,
                rejectReason: '',
                rejectedBy: '',
                positions: draft.positions.map((position) => ({
                  ...position,
                  id: position.id || nextId('p'),
                  slots: Number(position.slots),
                })),
              }
            : event
        );
        patch({ events });
        const notes = [
          note(draft.coordinatorId, 'tagged', 'You were tagged', `${owner.committee.name} resubmitted ${draft.title.trim()} for approval.`),
        ];
        const dean = current.users.find((user) => user.role === 'dean');
        notes.push(
          note(dean.id, 'tagged', 'Event waiting', `${draft.title.trim()} was resubmitted and is waiting for approval.`)
        );
        addNotes(notes);
        return { ok: true, eventId };
      },
      decideEvent(eventId, decision, reason) {
        const current = get();
        const actor = current.users.find((user) => user.id === current.currentUserId);
        const event = current.events.find((item) => item.id === eventId);
        if (!event || !actor) return { ok: false, error: 'This event is no longer available.' };
        const isDean = actor.role === 'dean';
        const isCoordinator = event.coordinatorId === actor.id;
        if (!isDean && !isCoordinator) {
          return { ok: false, error: 'You are not asked to decide this event.' };
        }
        if (decision === 'rejected' && !reason.trim()) {
          return { ok: false, error: 'Write a reason so the committee can fix the post.' };
        }
        const next = { ...event };
        if (isDean) {
          next.deanDecision = decision;
        } else {
          next.coordinatorDecision = decision;
        }
        if (decision === 'rejected') {
          next.rejectReason = reason.trim();
          next.rejectedBy = actor.id;
        }
        const events = current.events.map((item) => (item.id === eventId ? next : item));
        patch({ events });
        const status = eventStatus(next);
        if (status === 'Rejected') {
          addNotes([note(next.ownerId, 'rejected', 'Event sent back', `${actor.name} rejected ${next.title}. ${next.rejectReason}`)]);
        } else if (status === 'Live') {
          addNotes([note(next.ownerId, 'approved', 'Event approved', `${next.title} is live on the feed.`)]);
        } else if (decision === 'approved') {
          const waiting = isDean ? 'the coordinator' : 'the dean';
          addNotes([
            note(next.ownerId, 'approved', 'Approval recorded', `${actor.name} approved ${next.title}. It stays hidden until ${waiting} approves.`),
          ]);
        }
        return { ok: true };
      },
      apply(eventId, positionId, note) {
        const current = get();
        const user = current.users.find((item) => item.id === current.currentUserId);
        const event = current.events.find((item) => item.id === eventId);
        if (!user || user.role !== 'student') {
          return { ok: false, error: 'Only students can apply.' };
        }
        if (!event || eventStatus(event) !== 'Live') {
          return { ok: false, error: 'This event is not open for applications.' };
        }
        if (current.applications.some((item) => item.eventId === eventId && item.userId === user.id)) {
          return { ok: false, error: 'You have already applied to this event.' };
        }
        const position = event.positions.find((item) => item.id === positionId);
        if (!position || position.tier !== tierForPoints(user.points)) {
          return { ok: false, error: 'That position is not open to your tier.' };
        }
        if (slotsOpen(position, current.applications, eventId) < 1) {
          return { ok: false, error: 'That position is full.' };
        }
        const application = {
          id: nextId('a'),
          eventId,
          userId: user.id,
          positionId,
          note: note.trim(),
          status: 'Applied',
          appliedOn: formatDay(),
        };
        patch({
          applications: [application, ...current.applications],
          requestedTab: 'applications',
          flash: {
            tone: 'success',
            text: `Application sent to ${event.committee}.`,
          },
        });
        return { ok: true };
      },
      decideApplication(applicationId, decision) {
        const current = get();
        const actor = current.users.find((item) => item.id === current.currentUserId);
        const application = current.applications.find((item) => item.id === applicationId);
        if (!application || application.status !== 'Applied') {
          return { ok: false, error: 'This application has already been decided.' };
        }
        const event = current.events.find((item) => item.id === application.eventId);
        if (!event || !actor?.committee || actor.committee.name !== event.committee || event.ownerId !== actor.id) {
          return { ok: false, error: 'Only the committee that posted this event can decide it.' };
        }
        const position = event.positions.find((item) => item.id === application.positionId);
        if (decision === 'Accepted' && slotsOpen(position, current.applications, event.id) < 1) {
          return { ok: false, error: 'This position is full.' };
        }
        const applications = current.applications.map((item) =>
          item.id === applicationId ? { ...item, status: decision } : item
        );
        let users = current.users;
        if (decision === 'Accepted') {
          users = current.users.map((user) => {
            if (user.id !== application.userId) return user;
            const contribution = {
              id: nextId('k'),
              event: event.title,
              committee: event.committee,
              role: position.role,
            };
            return {
              ...user,
              points: user.points + event.points,
              contributions: [contribution, ...user.contributions],
            };
          });
          const studentName = personName(users, application.userId);
          addNotes([
            note(
              application.userId,
              'accepted',
              'Application accepted',
              `${event.committee} accepted you for ${event.title}. +${event.points} pts added.`
            ),
          ]);
          patch({
            applications,
            users,
            flash: {
              tone: 'success',
              text: `${studentName} accepted. +${event.points} pts added to the profile.`,
            },
          });
          return { ok: true };
        }
        addNotes([
          note(
            application.userId,
            'rejected',
            'Application not accepted',
            `${event.committee} did not accept your application for ${event.title}.`
          ),
        ]);
        patch({
          applications,
          flash: { tone: 'success', text: 'Application marked as rejected.' },
        });
        return { ok: true };
      },
    };
  }, []);

  const value = useMemo(() => ({ ...state, ...api }), [state, api]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}

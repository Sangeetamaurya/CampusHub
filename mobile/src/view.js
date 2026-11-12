import { eventStatus, pointsToNext, slotsOpen, tierForPoints, tierProgress } from './data';

export function userById(users, id) {
  return users.find((user) => user.id === id) || null;
}

export function isCommittee(user) {
  return user?.role === 'student' && Boolean(user.committee);
}

export function greeting(name) {
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return `${hello}, ${name}`;
}

export function tierLine(points) {
  const tier = tierForPoints(points);
  const left = pointsToNext(points);
  if (!left) return `${points} points · Highest tier`;
  const next = tier === 'Silver' ? 'Gold' : 'Diamond';
  return `${points} points · ${left} to ${next}`;
}

export function openForTier(event, tier, applications) {
  return event.positions.filter((position) => position.tier === tier && slotsOpen(position, applications, event.id) > 0);
}

export function positionSummary(position, applications, eventId) {
  const open = slotsOpen(position, applications, eventId);
  if (open < 1) return 'Full';
  return `${open} of ${position.slots} open`;
}

export function approvalProgress(event, users) {
  const coordinator = userById(users, event.coordinatorId);
  const dean = users.find((user) => user.role === 'dean');
  return [
    { who: coordinator?.name || 'Coordinator', state: labelDecision(event.coordinatorDecision) },
    { who: dean?.name || 'Dean', state: labelDecision(event.deanDecision) },
  ];
}

function labelDecision(value) {
  if (value === 'approved') return 'Approved';
  if (value === 'rejected') return 'Rejected';
  return 'Waiting';
}

export function visibleEvents(events) {
  return events.filter((event) => eventStatus(event) === 'Live');
}

export function roleLine(user) {
  if (!user) return '';
  if (user.role === 'dean') return 'Dean';
  if (user.role === 'faculty') return `${user.designation} · ${user.department}`;
  return `${user.stream} · ${user.year} year`;
}

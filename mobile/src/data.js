export const PASSWORD = 'campus123';

export const TIERS = ['Silver', 'Gold', 'Diamond'];

export function tierForPoints(points) {
  if (points >= 150) return 'Diamond';
  if (points >= 60) return 'Gold';
  return 'Silver';
}

export function tierTarget(tier) {
  if (tier === 'Silver') return 60;
  if (tier === 'Gold') return 150;
  return null;
}

export function tierProgress(points) {
  const tier = tierForPoints(points);
  if (tier === 'Diamond') return 1;
  const start = tier === 'Gold' ? 60 : 0;
  const end = tierTarget(tier);
  return Math.max(0, Math.min(1, (points - start) / (end - start)));
}

export function pointsToNext(points) {
  const tier = tierForPoints(points);
  const target = tierTarget(tier);
  if (!target) return 0;
  return Math.max(0, target - points);
}

export function eventStatus(event) {
  if (event.coordinatorDecision === 'rejected' || event.deanDecision === 'rejected') return 'Rejected';
  if (event.coordinatorDecision === 'approved' && event.deanDecision === 'approved') return 'Live';
  return 'Pending';
}

export function slotsTaken(applications, eventId, positionId) {
  return applications.filter(
    (item) => item.eventId === eventId && item.positionId === positionId && item.status === 'Accepted'
  ).length;
}

export function slotsOpen(position, applications, eventId) {
  return Math.max(0, position.slots - slotsTaken(applications, eventId, position.id));
}

export function formatLongDate(date = new Date()) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDay(date = new Date()) {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

let seq = 200;
export function nextId(prefix) {
  seq += 1;
  return `${prefix}${seq}`;
}

const student = (partial) => ({
  role: 'student',
  password: PASSWORD,
  phone: '',
  enrollment: '',
  stream: '',
  year: '',
  department: '',
  designation: '',
  about: '',
  photo: null,
  points: 0,
  committee: null,
  certificates: [],
  projects: [],
  experience: [],
  contributions: [],
  ...partial,
});

export function createSeed() {
  const users = [
    student({
      id: 'dean',
      role: 'dean',
      name: 'Dr. A. Kulkarni',
      shortName: 'Dr. Kulkarni',
      email: 'dean@gnims.edu.in',
      department: 'Office of the Dean',
      designation: 'Dean',
      about:
        'Dean of Guru Nanak Institute of Management Studies. Oversees academic administration and student activity approvals.',
    }),
    student({
      id: 'rao',
      role: 'faculty',
      name: 'Dr. Rao',
      shortName: 'Dr. Rao',
      email: 'rao@gnims.edu.in',
      department: 'Department of Computer Applications',
      designation: 'Professor',
      about: 'Professor of computer applications. Faculty coordinator for technology programmes and the annual tech fest.',
      experience: [{ id: 'ex-rao', role: 'Professor', org: 'GNIMS', year: '2014 — present' }],
    }),
    student({
      id: 'iyer',
      role: 'faculty',
      name: 'Prof. Iyer',
      shortName: 'Prof. Iyer',
      email: 'iyer@gnims.edu.in',
      department: 'Department of Management Studies',
      designation: 'Associate Professor',
      about: 'Teaches strategy and organisational behaviour. Coordinates management events and cultural programmes when tagged.',
      experience: [{ id: 'ex-iyer', role: 'Associate Professor', org: 'GNIMS', year: '2016 — present' }],
    }),
    student({
      id: 'shah',
      role: 'faculty',
      name: 'Dr. Shah',
      shortName: 'Dr. Shah',
      email: 'shah@gnims.edu.in',
      department: 'Department of Physical Education',
      designation: 'Assistant Professor',
      about: 'Looks after sports programmes and ground bookings for college events.',
      experience: [{ id: 'ex-shah', role: 'Assistant Professor', org: 'GNIMS', year: '2019 — present' }],
    }),
    student({
      id: 'deshpande',
      role: 'faculty',
      name: 'Dr. Deshpande',
      shortName: 'Dr. Deshpande',
      email: 'deshpande@gnims.edu.in',
      department: 'Department of Finance',
      designation: 'Associate Professor',
      about: 'Teaches corporate finance. Not currently tagged on an event.',
      experience: [{ id: 'ex-desh', role: 'Associate Professor', org: 'GNIMS', year: '2015 — present' }],
    }),
    student({
      id: 'ananya',
      name: 'Ananya Shah',
      shortName: 'Ananya',
      email: 'ananya.shah@gnims.edu.in',
      phone: '98200 11021',
      enrollment: 'MCA2024-014',
      stream: 'MCA',
      year: '2nd',
      points: 86,
      committee: { name: 'Sports Committee', rank: 'Head' },
      about:
        'Heads the Sports Committee and has run college sports day for two years. Interested in event operations and student volunteering.',
      certificates: [{ id: 'c-ananya', title: 'Inter-college athletics certificate', issuer: 'University sports board', year: '2025' }],
      projects: [{ id: 'p-ananya', title: 'Sports day fixture board', detail: 'A shared schedule used by team leads during the 2025 sports meet.' }],
      experience: [{ id: 'e-ananya', role: 'Volunteer', org: 'College marathon', year: '2024' }],
      contributions: [
        { id: 'k-ananya-1', event: 'Sports Day 2025', committee: 'Sports Committee', role: 'Head' },
        { id: 'k-ananya-2', event: 'Cricket trials', committee: 'Sports Committee', role: 'Lead' },
      ],
    }),
    student({
      id: 'kabir',
      name: 'Kabir Mehta',
      shortName: 'Kabir',
      email: 'kabir.mehta@gnims.edu.in',
      phone: '98111 22034',
      enrollment: 'PGDM2024-008',
      stream: 'PGDM',
      year: '2nd',
      points: 168,
      committee: { name: 'Tech Committee', rank: 'Head' },
      about: 'Heads the Tech Committee. Organises Tech Fest and looks after student volunteers for technical events.',
      certificates: [{ id: 'c-kabir', title: 'College hackathon finalist', issuer: 'GNIMS Tech Committee', year: '2025' }],
      projects: [{ id: 'p-kabir', title: 'Fest registration desk notes', detail: 'A checklist for morning and afternoon registration shifts.' }],
      experience: [{ id: 'e-kabir', role: 'Technical volunteer', org: 'Tech Fest 2025', year: '2025' }],
      contributions: [
        { id: 'k-kabir-1', event: 'Tech Fest 2025', committee: 'Tech Committee', role: 'Head' },
        { id: 'k-kabir-2', event: 'Workshop week', committee: 'Tech Committee', role: 'Lead' },
      ],
    }),
    student({
      id: 'meera',
      name: 'Meera Iyer',
      shortName: 'Meera',
      email: 'meera.iyer@gnims.edu.in',
      phone: '98333 44120',
      enrollment: 'MCA2025-031',
      stream: 'MCA',
      year: '1st',
      points: 24,
      about: 'First-year MCA student. Looking for volunteer work at college events, especially registration and student help desks.',
      certificates: [{ id: 'c-meera', title: 'School community service', issuer: 'Junior college', year: '2024' }],
      projects: [],
      experience: [{ id: 'e-meera', role: 'Library assistant', org: 'Junior college library', year: '2024' }],
      contributions: [{ id: 'k-meera', event: 'Orientation help desk', committee: 'Student council', role: 'Volunteer' }],
    }),
    student({
      id: 'rohan',
      name: 'Rohan Patel',
      shortName: 'Rohan',
      email: 'rohan.patel@gnims.edu.in',
      phone: '98444 11890',
      enrollment: 'MSS2024-019',
      stream: 'MSS',
      year: '2nd',
      points: 72,
      about: 'MSS student who has volunteered at sports fixtures and likes team coordination on the ground.',
      certificates: [{ id: 'c-rohan', title: 'Sports volunteer recognition', issuer: 'Sports Committee', year: '2025' }],
      projects: [],
      experience: [{ id: 'e-rohan', role: 'Team lead', org: 'Sports Day 2025', year: '2025' }],
      contributions: [{ id: 'k-rohan', event: 'Sports Day 2025', committee: 'Sports Committee', role: 'Lead' }],
    }),
    student({
      id: 'sara',
      name: 'Sara Khan',
      shortName: 'Sara',
      email: 'sara.khan@gnims.edu.in',
      phone: '98222 66710',
      enrollment: 'PGDM2025-022',
      stream: 'PGDM',
      year: '1st',
      points: 12,
      about: 'First-year PGDM student interested in case discussions and student seminars.',
      certificates: [],
      projects: [{ id: 'p-sara', title: 'Classroom case notes', detail: 'Summaries prepared for the management club reading circle.' }],
      experience: [],
      contributions: [],
    }),
    student({
      id: 'arjun',
      name: 'Arjun Nair',
      shortName: 'Arjun',
      email: 'arjun.nair@gnims.edu.in',
      phone: '98190 33421',
      enrollment: 'MCA2024-027',
      stream: 'MCA',
      year: '2nd',
      points: 104,
      about: 'Second-year MCA student. Has staffed the floor at Tech Fest and helps with student queues.',
      certificates: [{ id: 'c-arjun', title: 'Tech Fest volunteer', issuer: 'Tech Committee', year: '2025' }],
      projects: [],
      experience: [{ id: 'e-arjun', role: 'Floor volunteer', org: 'Tech Fest 2025', year: '2025' }],
      contributions: [{ id: 'k-arjun', event: 'Tech Fest 2025', committee: 'Tech Committee', role: 'Volunteer' }],
    }),
    student({
      id: 'priya',
      name: 'Priya Kulkarni',
      shortName: 'Priya',
      email: 'priya.kulkarni@gnims.edu.in',
      phone: '98765 22018',
      enrollment: 'MSS2025-011',
      stream: 'MSS',
      year: '1st',
      points: 36,
      about: 'First-year MSS student. New to college events and applying for sideline volunteer work.',
      certificates: [],
      projects: [],
      experience: [],
      contributions: [],
    }),
    student({
      id: 'dev',
      name: 'Dev Sharma',
      shortName: 'Dev',
      email: 'dev.sharma@gnims.edu.in',
      phone: '97654 10028',
      enrollment: 'PGDM2024-003',
      stream: 'PGDM',
      year: '2nd',
      points: 176,
      committee: { name: 'Management Committee', rank: 'Lead' },
      about: 'Lead on the Management Committee. Runs the case analysis round and student seminars.',
      certificates: [{ id: 'c-dev', title: 'Case competition recognition', issuer: 'Management Committee', year: '2025' }],
      projects: [{ id: 'p-dev', title: 'Case round briefing', detail: 'A one-page brief given to presenters before the annual case round.' }],
      experience: [{ id: 'e-dev', role: 'Lead', org: 'Management Committee', year: '2025 — present' }],
      contributions: [{ id: 'k-dev', event: 'Case round 2025', committee: 'Management Committee', role: 'Lead' }],
    }),
    student({
      id: 'neha',
      name: 'Neha Joshi',
      shortName: 'Neha',
      email: 'neha.joshi@gnims.edu.in',
      phone: '98123 77801',
      enrollment: 'MCA2025-044',
      stream: 'MCA',
      year: '1st',
      points: 8,
      about: 'First-year MCA student. Happy to help at a registration desk.',
      certificates: [],
      projects: [],
      experience: [],
      contributions: [],
    }),
    student({
      id: 'aditya',
      name: 'Aditya Rao',
      shortName: 'Aditya',
      email: 'aditya.rao@gnims.edu.in',
      phone: '98210 55673',
      enrollment: 'MSS2024-016',
      stream: 'MSS',
      year: '2nd',
      points: 91,
      about: 'Second-year MSS student with experience leading a small student team on sports day.',
      certificates: [],
      projects: [],
      experience: [{ id: 'e-aditya', role: 'Volunteer', org: 'College marathon', year: '2025' }],
      contributions: [{ id: 'k-aditya', event: 'College marathon', committee: 'Sports Committee', role: 'Volunteer' }],
    }),
    student({
      id: 'ishaan',
      name: 'Ishaan Verma',
      shortName: 'Ishaan',
      email: 'ishaan.verma@gnims.edu.in',
      phone: '98920 44117',
      enrollment: 'PGDM2025-015',
      stream: 'PGDM',
      year: '1st',
      points: 44,
      committee: { name: 'Cultural Committee', rank: 'Lead' },
      about: 'Lead on the Cultural Committee. Preparing the stage crew plan for Cultural Night.',
      certificates: [],
      projects: [{ id: 'p-ishaan', title: 'Stage cue sheet', detail: 'A running order for student performers and the stage crew.' }],
      experience: [],
      contributions: [{ id: 'k-ishaan', event: 'Founders day', committee: 'Cultural Committee', role: 'Volunteer' }],
    }),
    student({
      id: 'aisha',
      name: 'Aisha Fernandes',
      shortName: 'Aisha',
      email: 'aisha.fernandes@gnims.edu.in',
      phone: '98331 22904',
      enrollment: 'MCA2024-021',
      stream: 'MCA',
      year: '2nd',
      points: 67,
      about: 'Second-year MCA student who presents in student seminars and wants a place in the case round.',
      certificates: [{ id: 'c-aisha', title: 'Seminar participation', issuer: 'Management Committee', year: '2025' }],
      projects: [],
      experience: [],
      contributions: [{ id: 'k-aisha', event: 'Student seminar', committee: 'Management Committee', role: 'Volunteer' }],
    }),
  ];

  const events = [
    {
      id: 'tech',
      ownerId: 'kabir',
      title: 'Tech Fest 2026: event volunteers',
      type: 'Volunteer',
      date: 'Saturday, 14 March 2026',
      venue: 'GNIMS Auditorium',
      applyBy: 'Saturday, 7 March 2026',
      points: 20,
      committee: 'Tech Committee',
      coordinatorId: 'rao',
      coordinatorDecision: 'approved',
      deanDecision: 'approved',
      rejectReason: '',
      rejectedBy: '',
      positions: [
        { id: 'p-tech-reg', name: 'Registration desk', slots: 6, tier: 'Silver', role: 'Volunteer' },
        { id: 'p-tech-floor', name: 'Floor marshal', slots: 4, tier: 'Gold', role: 'Volunteer' },
        { id: 'p-tech-lead', name: 'Technical lead', slots: 1, tier: 'Diamond', role: 'Lead' },
      ],
    },
    {
      id: 'sports',
      ownerId: 'ananya',
      title: 'Sports Day: ground team',
      type: 'Volunteer',
      date: 'Sunday, 22 March 2026',
      venue: 'College ground',
      applyBy: 'Sunday, 15 March 2026',
      points: 15,
      committee: 'Sports Committee',
      coordinatorId: 'shah',
      coordinatorDecision: 'approved',
      deanDecision: 'approved',
      rejectReason: '',
      rejectedBy: '',
      positions: [
        { id: 'p-sp-side', name: 'Sideline volunteer', slots: 8, tier: 'Silver', role: 'Volunteer' },
        { id: 'p-sp-lead', name: 'Team lead', slots: 2, tier: 'Gold', role: 'Lead' },
      ],
    },
    {
      id: 'case',
      ownerId: 'dev',
      title: 'Management case analysis round',
      type: 'Participate',
      date: 'Saturday, 4 April 2026',
      venue: 'Seminar hall B',
      applyBy: 'Friday, 27 March 2026',
      points: 25,
      committee: 'Management Committee',
      coordinatorId: 'iyer',
      coordinatorDecision: 'approved',
      deanDecision: 'approved',
      rejectReason: '',
      rejectedBy: '',
      positions: [
        { id: 'p-case-obs', name: 'Observer', slots: 4, tier: 'Silver', role: 'Volunteer' },
        { id: 'p-case-pre', name: 'Case presenter', slots: 3, tier: 'Gold', role: 'Lead' },
        { id: 'p-case-head', name: 'Jury support', slots: 1, tier: 'Diamond', role: 'Head' },
      ],
    },
    {
      id: 'cultural',
      ownerId: 'ishaan',
      title: 'Cultural Night stage crew',
      type: 'Volunteer',
      date: 'Friday, 17 April 2026',
      venue: 'GNIMS Auditorium',
      applyBy: 'Friday, 10 April 2026',
      points: 20,
      committee: 'Cultural Committee',
      coordinatorId: 'iyer',
      coordinatorDecision: null,
      deanDecision: null,
      rejectReason: '',
      rejectedBy: '',
      positions: [
        { id: 'p-cul-stage', name: 'Stage crew', slots: 6, tier: 'Silver', role: 'Volunteer' },
        { id: 'p-cul-lead', name: 'Stage lead', slots: 1, tier: 'Gold', role: 'Lead' },
      ],
    },
    {
      id: 'alumni',
      ownerId: 'kabir',
      title: 'Alumni networking evening',
      type: 'Participate',
      date: 'Saturday, 25 April 2026',
      venue: 'Conference room 1',
      applyBy: 'Saturday, 18 April 2026',
      points: 15,
      committee: 'Tech Committee',
      coordinatorId: 'rao',
      coordinatorDecision: 'approved',
      deanDecision: null,
      rejectReason: '',
      rejectedBy: '',
      positions: [
        { id: 'p-al-ush', name: 'Usher', slots: 5, tier: 'Silver', role: 'Volunteer' },
        { id: 'p-al-host', name: 'Student host', slots: 2, tier: 'Gold', role: 'Lead' },
      ],
    },
    {
      id: 'blood',
      ownerId: 'ananya',
      title: 'Blood donation camp',
      type: 'Volunteer',
      date: 'Wednesday, 11 March 2026',
      venue: 'College foyer',
      applyBy: 'Monday, 9 March 2026',
      points: 20,
      committee: 'Sports Committee',
      coordinatorId: 'shah',
      coordinatorDecision: 'rejected',
      deanDecision: null,
      rejectReason:
        'The venue booking clashes with the internal examination week. Please move the date to the following Saturday and resubmit.',
      rejectedBy: 'shah',
      positions: [
        { id: 'p-bl-desk', name: 'Donor desk', slots: 6, tier: 'Silver', role: 'Volunteer' },
        { id: 'p-bl-lead', name: 'Drive lead', slots: 1, tier: 'Gold', role: 'Lead' },
      ],
    },
  ];

  const applications = [
    { id: 'a1', eventId: 'tech', userId: 'meera', positionId: 'p-tech-reg', note: 'I can take the morning registration shift.', status: 'Applied', appliedOn: '2 March 2026' },
    { id: 'a2', eventId: 'tech', userId: 'neha', positionId: 'p-tech-reg', note: 'Happy to help at the desk and guide students to the hall.', status: 'Applied', appliedOn: '3 March 2026' },
    { id: 'a3', eventId: 'tech', userId: 'arjun', positionId: 'p-tech-floor', note: 'I marshalled the floor at last year’s fest.', status: 'Accepted', appliedOn: '20 February 2026' },
    { id: 'a4', eventId: 'tech', userId: 'dev', positionId: 'p-tech-lead', note: 'I have run a technical desk and can coordinate the crew.', status: 'Applied', appliedOn: '4 March 2026' },
    { id: 'a5', eventId: 'sports', userId: 'priya', positionId: 'p-sp-side', note: 'I would like to start with sideline support.', status: 'Applied', appliedOn: '5 March 2026' },
    { id: 'a6', eventId: 'sports', userId: 'aditya', positionId: 'p-sp-lead', note: 'I led a small team at the college marathon.', status: 'Applied', appliedOn: '5 March 2026' },
    { id: 'a7', eventId: 'sports', userId: 'rohan', positionId: 'p-sp-lead', note: 'I was a team lead at Sports Day last year.', status: 'Accepted', appliedOn: '18 February 2026' },
    { id: 'a8', eventId: 'case', userId: 'sara', positionId: 'p-case-obs', note: 'I would like to observe before presenting next year.', status: 'Rejected', appliedOn: '1 March 2026' },
    { id: 'a9', eventId: 'case', userId: 'aisha', positionId: 'p-case-pre', note: 'I presented at the student seminar and can take a case.', status: 'Applied', appliedOn: '6 March 2026' },
  ];

  const notifications = [
    { id: 'n1', userId: 'arjun', kind: 'accepted', title: 'Application accepted', body: 'Tech Committee accepted you for Tech Fest 2026: event volunteers. +20 pts added.', time: 'Yesterday', read: false },
    { id: 'n2', userId: 'rohan', kind: 'accepted', title: 'Application accepted', body: 'Sports Committee accepted you for Sports Day: ground team. +15 pts added.', time: 'Yesterday', read: false },
    { id: 'n3', userId: 'sara', kind: 'rejected', title: 'Application not accepted', body: 'Management Committee did not accept your application for Management case analysis round.', time: '2 days ago', read: false },
    { id: 'n4', userId: 'rao', kind: 'tagged', title: 'You were tagged', body: 'Tech Committee tagged you as coordinator for Alumni networking evening.', time: 'Today', read: false },
    { id: 'n5', userId: 'iyer', kind: 'tagged', title: 'You were tagged', body: 'Cultural Committee tagged you as coordinator for Cultural Night stage crew.', time: 'Today', read: false },
    { id: 'n6', userId: 'dean', kind: 'tagged', title: 'Event waiting', body: 'Alumni networking evening is waiting for your approval. The coordinator has approved it.', time: 'Today', read: false },
    { id: 'n7', userId: 'dean', kind: 'tagged', title: 'Event waiting', body: 'Cultural Night stage crew is waiting for approval.', time: 'Today', read: true },
    { id: 'n8', userId: 'kabir', kind: 'approved', title: 'Coordinator approved', body: 'Dr. Rao approved Alumni networking evening. It stays hidden until the dean approves.', time: 'Today', read: false },
    { id: 'n9', userId: 'ananya', kind: 'rejected', title: 'Event sent back', body: 'Dr. Shah rejected Blood donation camp. The venue clashes with the internal examination week.', time: 'Yesterday', read: false },
    { id: 'n10', userId: 'kabir', kind: 'approved', title: 'Event approved', body: 'Tech Fest 2026: event volunteers is live on the feed.', time: '3 days ago', read: true },
  ];

  return {
    users,
    events,
    applications,
    notifications,
    currentUserId: null,
    requestedTab: null,
    flash: null,
  };
}

export const DEMO_ACCOUNTS = [
  { id: 'ananya', note: 'Committee student · Sports' },
  { id: 'kabir', note: 'Committee student · Tech' },
  { id: 'meera', note: 'Student · Silver tier' },
  { id: 'rao', note: 'Faculty coordinator' },
  { id: 'deshpande', note: 'Faculty · no events waiting' },
  { id: 'dean', note: 'Dean' },
];

/* Shared helpers: tiny icon system, sample data, primitives used across directions. */

// ─── Icons (Phosphor-inspired, 1.5–1.75 stroke) ──────────────────────────────
const I = {
  search: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6"/><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  plus: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg>,
  back: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  close: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  pencil: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 20h4l10.5-10.5a2.121 2.121 0 0 0-3-3L5 17v3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  trash: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevR: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevD: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  cal: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6"/><path d="M8 3v4M16 3v4M3.5 10h17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  gift: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 12h16v8H4zM2 8h20v4H2zM12 8v12M12 8s-3-5-6-3 0 5 6 3M12 8s3-5 6-3 0 5-6 3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  chat: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 5h16v11H8l-4 4V5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  sparkle: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3v6m0 6v6M3 12h6m6 0h6M6 6l4 4m4 4 4 4M18 6l-4 4m-4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  bell: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16ZM10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  pin: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6"/></svg>,
  briefcase: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.6"/></svg>,
  cake: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 21V13a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8M3 21h18M8 11V7m4 4V6m4 5V7M8 7s-1-1 0-2 0 2 0 2Zm4-1s-1-1 0-2 0 2 0 2Zm4 1s-1-1 0-2 0 2 0 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  heart: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m5 12 5 5L20 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  filter: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg>,
  sortAlpha: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 16V6m0 0-2 2m2-2 2 2M14 7h5l-5 5h5M14 17h5m-5 0 2.5-6 2.5 6m-4-1.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  user: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.6"/><path d="M5 20c1-3.5 4-5 7-5s6 1.5 7 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  users: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.6"/><path d="M2.5 19c.8-3 3.5-4.5 6.5-4.5s5.7 1.5 6.5 4.5M16 5.5a3 3 0 1 1 0 6M17 14.5c2.4.3 4.4 1.8 5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  home: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m4 11 8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  star: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1L12 17l-5.5 3 1-6.1L3 9.5l6.3-.9L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  archive: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="3" y="4" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="1.6"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
};
window.I = I;

// ─── Sample data ─────────────────────────────────────────────────────────────
const SAMPLE_PEOPLE = [
  { id: '1', firstName: 'Maya',    lastName: 'Patel',     relationship: 'sister',    city: 'San Francisco', last: '2d' },
  { id: '2', firstName: 'Daniel',  lastName: 'Ortiz',     relationship: 'friend',    city: 'Brooklyn',      last: '1w' },
  { id: '3', firstName: 'Priya',   lastName: 'Shah',      relationship: 'colleague', city: 'London',        last: '3w' },
  { id: '4', firstName: 'Chen',    lastName: 'Wei',       relationship: 'parent',    city: 'Vancouver',     last: '4d' },
  { id: '5', firstName: 'Tomás',   lastName: 'Reyes',     relationship: 'spouse',    city: 'Austin',        last: 'today' },
  { id: '6', firstName: 'Lena',    lastName: 'Hoffmann',  relationship: 'friend',    city: 'Berlin',        last: '2mo' },
  { id: '7', firstName: 'Adaeze',  lastName: 'Okafor',    relationship: 'colleague', city: 'Lagos',         last: '5d' },
  { id: '8', firstName: 'Felix',   lastName: 'Bergström', relationship: 'friend',    city: 'Stockholm',     last: '1mo' },
];

const SAMPLE_PERSON = {
  firstName: 'Maya', lastName: 'Patel',
  city: 'San Francisco', employer: 'Stripe', workRole: 'Engineering Manager',
  relationship: 'sister', birthDate: 'Apr 12, 1989',
  interests: ['rock climbing', 'pottery', 'ambient music', 'mezcal'],
  currentEvents: ['Starting a new role at Stripe', 'Training for half-marathon'],
  upcomingEvents: [
    { title: 'Birthday',           date: 'Apr 12',  notes: '37th — favorite: orchids' },
    { title: 'Wedding anniversary', date: 'Jun 03',  notes: '5 yrs with Sam' },
  ],
  giftIdeas: [
    { title: 'Ceramics workshop voucher', occasion: 'birthday', status: 'shortlist', priority: 1 },
    { title: 'Vintage Polaroid SX-70',    occasion: 'holiday',  status: 'idea',      priority: 2 },
  ],
  interactions: [
    { summary: 'Dinner at Nopa — caught up about promotion', date: 'Apr 30', channel: 'irl' },
    { summary: 'Called to check in after climbing accident', date: 'Apr 21', channel: 'call' },
  ],
};

window.SAMPLE_PEOPLE = SAMPLE_PEOPLE;
window.SAMPLE_PERSON = SAMPLE_PERSON;

// Avatar initials helper
function initials(f, l) { return `${(f?.[0]||'').toUpperCase()}${(l?.[0]||'').toUpperCase()}`; }
window.initials = initials;

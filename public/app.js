/* ===================== security guards ===================== */
// 1. Always use HTTPS (except on this computer while developing).
if (location.protocol === 'http:' && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) location.replace('https:' + location.href.slice(5));
// 2. Never run inside someone else's frame (clickjacking): hide the page and break out.
if (window.top !== window.self) {
  document.documentElement.style.display = 'none';
  try { window.top.location = window.self.location.href; } catch { }
  throw new Error('This app refuses to run inside a frame');
}
/* ===================== utilities ===================== */
const CFG_MISSING = !window.APP_CONFIG;   // config.js didn't load: stop with a clear message instead of guessing
const CFG = window.APP_CONFIG || {};
const BUILD = '2026-11-19-home';   // shown in Settings, so you can confirm which version is live
// Firebase Web SDK, pinned to an exact version (updated from 10.12.2). If the CDN can't serve it,
// the previous version is tried so the app still opens.
const FB_VERSIONS = ['12.19.0', '10.12.2'];
const FB_URL = `https://www.gstatic.com/firebasejs/${FB_VERSIONS[0]}/`;
const COLS = ['projects', 'sections', 'tasks', 'events', 'meta', 'members', 'accounts', 'campaigns', 'trash', 'notes', 'briefs', 'activity', 'notifs'];
// Collections added after the first release. If the security rules haven't been updated yet,
// the app still runs - only the feature that needs them shows a notice.
const OPTIONAL_COLS = ['accounts', 'campaigns', 'trash', 'notes', 'briefs', 'activity', 'notifs'];
const TRASH_DAYS = 30;   // Recently deleted empties itself after this many days
const COLORS = ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink', 'grey'];
const MARKETS = ['KSA', 'UAE', 'QAT', 'KWT', 'BAH', 'OMN', 'IRQ', 'EGY'];
const PLATFORMS = ['Search', 'PMax', 'YouTube', 'Meta', 'Snap', 'TikTok', 'LinkedIn', 'X'];
const C_STATUS = ['Live', 'Pending', 'Ended'];
/* Objective library - what each platform can actually be bought on. Canonical names only;
   the campaign card abbreviates for space but never changes what's stored. */
const OBJECTIVES = {
  Meta: ['Awareness', 'Reach', 'Impressions', 'Video Views', 'Engagement', 'Profile Visits', 'Followers / Page Growth',
    'Link Clicks', 'Traffic', 'Landing Page Views', 'Conversion', 'Website Conversion', 'Lead Generation',
    'Lead Gen / Conversion (Auto Opt)', 'Messages', 'WhatsApp', 'Calls', 'App Installs', 'App Engagement',
    'Catalog / Product Sales', 'Sales', 'Store Visits', 'Other'],
  Snap: ['Awareness', 'Reach', 'Impressions', 'Video Views', 'Engagement', 'Profile Visits', 'Link Clicks', 'Traffic',
    'Landing Page Views', 'Conversion', 'Website Conversion', 'Lead Generation', 'App Installs', 'App Engagement',
    'Catalog / Product Sales', 'Sales', 'Other'],
  TikTok: ['Awareness', 'Reach', 'Video Views', 'Community Interaction', 'Profile Visits', 'Followers / Page Growth',
    'Engagement', 'Link Clicks', 'Traffic', 'Landing Page Views', 'Conversion', 'Website Conversion', 'Lead Generation',
    'App Installs', 'App Engagement', 'Catalog / Product Sales', 'Sales', 'Other'],
  YouTube: ['Awareness', 'Reach', 'Impressions', 'Video Views', 'Video Reach', 'Engagement', 'Traffic', 'Link Clicks',
    'Website Conversion', 'Conversion', 'Lead Generation', 'Demand Generation', 'Sales', 'Other'],
  Search: ['Traffic', 'Link Clicks', 'Website Conversion', 'Conversion', 'Search Conversions', 'Lead Generation',
    'Calls', 'Sales', 'Store Visits', 'Other'],
  PMax: ['Website Conversion', 'Conversion', 'Lead Generation', 'Calls', 'Sales', 'Store Visits',
    'Performance / Automated Conversion', 'Other'],
  LinkedIn: ['Awareness', 'Reach', 'Impressions', 'Video Views', 'Engagement', 'Followers / Page Growth',
    'Website Visits', 'Link Clicks', 'Traffic', 'Website Conversion', 'Conversion', 'Lead Generation',
    'Job Applicants', 'Other'],
  X: ['Awareness', 'Reach', 'Impressions', 'Video Views', 'Engagement', 'Followers / Page Growth', 'Profile Visits',
    'Link Clicks', 'Traffic', 'Website Conversion', 'Conversion', 'App Installs', 'App Engagement', 'Other'],
};
// Every objective in the library, in a stable order, for the filter list.
const ALL_OBJECTIVES = [...new Set(PLATFORMS.flatMap(p => OBJECTIVES[p] || []))].filter(o => o !== 'Other').sort();
// Short forms used only on the compact campaign card.
const OBJ_SHORT = {
  'Lead Generation': 'Lead Gen', 'Lead Gen / Conversion (Auto Opt)': 'Lead Gen (Auto)', 'Website Conversion': 'Web Conv',
  'Conversion': 'Conv', 'Search Conversions': 'Search Conv', 'Performance / Automated Conversion': 'Auto Conv',
  'Landing Page Views': 'LP Views', 'Catalog / Product Sales': 'Catalog', 'Followers / Page Growth': 'Followers',
  'Community Interaction': 'Community', 'Profile Visits': 'Profile', 'Impressions': 'Impr', 'Engagement': 'Engage',
  'Demand Generation': 'Demand Gen', 'App Installs': 'Installs', 'App Engagement': 'App Eng', 'Website Visits': 'Site Visits',
  'Job Applicants': 'Applicants', 'Store Visits': 'Store', 'Link Clicks': 'Clicks', 'Video Views': 'Video Views',
};
const CUSTOM_PREFIX = 'Other: ';
// objFull: the canonical name (custom objectives show the text you typed).
// objLabel: the short form used only on the compact card.
const objFull = o => (o.startsWith(CUSTOM_PREFIX) ? o.slice(CUSTOM_PREFIX.length) : o);
const objLabel = o => (o.startsWith(CUSTOM_PREFIX) ? o.slice(CUSTOM_PREFIX.length) : (OBJ_SHORT[o] || o));
const C_PACING = ['Pending', 'Healthy', 'Under-pacing', 'Over-pacing', 'Unstable'];
const C_CREATIVE = ['All Live', 'Partially Missing', 'Fully Missing'];
const C_RESULTS = ['Pending', 'Healthy', 'Needs Attention'];
const DEFAULT_TYPES = [
  { id: 'ooo', name: 'OOO', color: 'red' },
  { id: 'remote', name: 'Work remotely', color: 'orange' },
  { id: 'office', name: 'Office day', color: 'blue' },
  { id: 'other', name: 'Other', color: 'grey' },
];
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const clone = o => JSON.parse(JSON.stringify(o));
// Every key gets its own prefix: this app can share a web address (origin) with the original Doable on
// GitHub Pages, and the two must never read or overwrite each other's saved settings or local data.
const LS = 'dentsu-ads:';
const lsGet = k => { try { return localStorage.getItem(LS + k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(LS + k, v); } catch { } };

const pad = n => String(n).padStart(2, '0');
const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d, 12); };
const todayKey = () => keyOf(new Date());
const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); };
const dayDiff = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 864e5);
const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();
const addMonths = (k, n, anchor) => {
  const [y, m, d] = k.split('-').map(Number);
  const t = new Date(y, m - 1 + n, 1, 12);
  t.setDate(Math.min(anchor || d, daysIn(t.getFullYear(), t.getMonth())));
  return keyOf(t);
};
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WDS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function fmtDay(k) {
  const d = parseKey(k); const s = `${d.getDate()} ${MON[d.getMonth()]}`;
  return d.getFullYear() === new Date().getFullYear() ? s : `${s} ${d.getFullYear()}`;
}
function dueInfo(k) {
  const diff = dayDiff(todayKey(), k);
  if (diff < 0) return { label: fmtDay(k), cls: 'd-overdue' };
  if (diff === 0) return { label: 'Today', cls: 'd-today' };
  if (diff === 1) return { label: 'Tomorrow', cls: 'd-tomorrow' };
  if (diff < 7) return { label: WD[parseKey(k).getDay()], cls: 'd-week' };
  return { label: fmtDay(k), cls: '' };
}
function deadlineInfo(k) {
  const diff = dayDiff(todayKey(), k);
  if (diff < 0) return { label: fmtDay(k), cls: 'd-overdue' };
  if (diff === 0) return { label: 'Today', cls: 'd-overdue' };
  if (diff === 1) return { label: 'Tomorrow', cls: 'd-tomorrow' };
  if (diff < 8) return { label: `In ${diff} days`, cls: 'd-week' };
  return { label: fmtDay(k), cls: '' };
}
function longDay(k) { const d = parseKey(k); return `${WDS[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`; }
// "17 Sep 2026, 3:24 PM" - used for the created date inside task details.
function fmtDateTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d)) return '';
  let h = d.getHours(); const ampm = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}, ${h}:${pad(d.getMinutes())} ${ampm}`;
}
function timeAgo(ts) {
  const s = (Date.now() - ts) / 1000;
  if (s < 60) return 'just now'; if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const d = new Date(ts); return `${d.getDate()} ${MON[d.getMonth()]}`;
}

/* ---------- recurrence ---------- */
// recur = { type: 'daily'|'weekdays'|'weekly'|'monthly'|'yearly', every: n, day: anchorDayOfMonth }
function nextDate(k, r) {
  const n = Math.max(1, +r.every || 1);
  switch (r.type) {
    case 'daily': return addDays(k, n);
    case 'weekdays': { let x = addDays(k, 1); while ([0, 6].includes(parseKey(x).getDay())) x = addDays(x, 1); return x; }
    case 'weekly': return addDays(k, 7 * n);
    case 'monthly': return addMonths(k, n, r.day);
    case 'yearly': return addMonths(k, 12 * n, r.day);
  }
  return addDays(k, 1);
}
function rollForward(due, r) {
  const t = todayKey(); let n = nextDate(due || t, r), g = 0;
  while (n <= t && g++ < 5000) n = nextDate(n, r);
  return n;
}
function recurLabel(r) {
  if (!r) return '';
  const n = +r.every || 1;
  const unit = { daily: 'day', weekly: 'week', monthly: 'month', yearly: 'year' }[r.type];
  if (r.type === 'weekdays') return 'Every weekday';
  return n === 1 ? `Every ${unit}` : `Every ${n} ${unit}s`;
}

/* ---------- icons ---------- */
const P = {
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
  help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.7M12 17h.01"/>',
  send: '<path d="M4 12 20 4l-4.5 16-3.5-6.5Z"/><path d="m12 13.5 3.5-4"/>',
  sparkle: '<path d="M12 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5ZM18.5 15.5c.3 1.5 1 2.2 2.5 2.5-1.5.3-2.2 1-2.5 2.5-.3-1.5-1-2.2-2.5-2.5 1.5-.3 2.2-1 2.5-2.5Z"/>',
  shield: '<path d="M12 3.5 19.5 6v5.5c0 4.5-3.2 8-7.5 9-4.3-1-7.5-4.5-7.5-9V6Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  today: '<rect x="3.5" y="4.5" width="17" height="16" rx="3.5"/><path d="M3.5 9.5h17M8 3v3M16 3v3"/><circle cx="12" cy="15" r="2.2" fill="currentColor" stroke="none"/>',
  upcoming: '<rect x="3.5" y="4.5" width="17" height="16" rx="3"/><path d="M3.5 9.5h17M8 3v3M16 3v3M8 13.5h.01M12 13.5h.01M16 13.5h.01M8 17h.01M12 17h.01"/>',
  cal: '<rect x="3.5" y="4.5" width="17" height="16" rx="3"/><path d="M3.5 9.5h17M8 3v3M16 3v3"/>',
  repeat: '<path d="M17 2.5 20.5 6 17 9.5"/><path d="M3.5 11.5v-1A4.5 4.5 0 0 1 8 6h12.5M7 21.5 3.5 18 7 14.5"/><path d="M20.5 12.5v1A4.5 4.5 0 0 1 16 18H3.5"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/>',
  sub: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M6 8v4a6 6 0 0 0 6 6h4"/>',
  comment: '<path d="M20.5 14.5a2 2 0 0 1-2 2H8l-4.5 4v-14a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2Z"/>',
  dots: '<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>',
  left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>', down: '<path d="m6 9 6 6 6-6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>', check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M5.5 7l1 12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2l1-12M9 7V4.5h6V7"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  pencil: '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  palette: '<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1.2" fill="currentColor"/><circle cx="12" cy="7.5" r="1.2" fill="currentColor"/><circle cx="16" cy="10" r="1.2" fill="currentColor"/>',
  up: '<path d="m18 15-6-6-6 6"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  flag: '<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>', download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  upload: '<path d="M12 15V3M7 8l5-5 5 5M4 21h16"/>', eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  inbox: '<path d="M3 13h5l1.5 3h5L16 13h5M5.5 5h13L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Z"/>',
  campaign: '<path d="M4 9.5v5a1.5 1.5 0 0 0 1.5 1.5H8l6.5 4V5.5L8 9.5H5.5A1.5 1.5 0 0 0 4 11Z"/><path d="M18 9.2a4.2 4.2 0 0 1 0 5.6"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  sort: '<path d="M7 4v16M7 20l-3-3M7 4l3 3M17 20V4M17 4l-3 3M17 20l3-3"/>',
  archive: '<rect x="3.5" y="4.5" width="17" height="4.5" rx="1.5"/><path d="M5.5 9v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V9M10 13h4"/>',
  copy: '<rect x="9" y="9" width="11.5" height="11.5" rx="2.5"/><path d="M15 6.5A2.5 2.5 0 0 0 12.5 4H6A2.5 2.5 0 0 0 3.5 6.5V13A2.5 2.5 0 0 0 6 15.5"/>',
  alert: '<path d="M12 8.5v5M12 17h.01"/><circle cx="12" cy="12" r="8.5"/>',
  okcircle: '<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.2 2.4 2.4 4.6-5"/>',
  gauge: '<path d="M4.5 16.5a8.5 8.5 0 1 1 15 0"/><path d="m12 12.5 3.5-3"/><circle cx="12" cy="13" r="1.3" fill="currentColor" stroke="none"/>',
  image: '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="m4.5 17 4.2-4 3.3 3 2.8-2.6 4.7 4.2"/>',
  arrowRight: '<path d="M5 12h13M13 6.5 18.5 12 13 17.5"/>',
  grip: '<circle cx="9" cy="6" r="1.2" fill="currentColor"/><circle cx="15" cy="6" r="1.2" fill="currentColor"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><circle cx="9" cy="18" r="1.2" fill="currentColor"/><circle cx="15" cy="18" r="1.2" fill="currentColor"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.8"/>',
  pause: '<circle cx="12" cy="12" r="8.5"/><path d="M9.5 12h5"/>',
  trendUp: '<path d="M3.5 16.5 9 11l3.5 3.5L20 7"/><path d="M15 7h5v5"/>',
  trendDown: '<path d="M3.5 7.5 9 13l3.5-3.5L20 17"/><path d="M15 17h5v-5"/>',
  pulse: '<path d="M2.5 12h4l2.5-6 3.5 12 2.5-6h6.5"/>',
  sidebar: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M9.5 4.5v15"/>',
  bars: '<rect x="7" y="5.5" width="3.2" height="13" rx="1" fill="currentColor" stroke="none"/><rect x="13.8" y="5.5" width="3.2" height="13" rx="1" fill="currentColor" stroke="none"/>',
  play: '<path d="M8 5.8v12.4a.8.8 0 0 0 1.2.7l10-6.2a.8.8 0 0 0 0-1.4l-10-6.2A.8.8 0 0 0 8 5.8Z" fill="currentColor" stroke="none"/>',
  sheet: '<rect x="4.5" y="3.5" width="15" height="17" rx="2.5"/><path d="M4.5 9h15M4.5 14.5h15M10 9v11.5"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
  link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
  people: '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M18.5 14.2a6.5 6.5 0 0 1 3 5.8"/>',
  notebook: '<rect x="5" y="3.5" width="14.5" height="17" rx="2.5"/><path d="M9 3.5v17M12.5 8h4M12.5 11.5h4"/><path d="M3.5 7.5H6M3.5 12H6M3.5 16.5H6"/>',
  pin: '<path d="M9 3.5h6l-1 6 3.5 3.5v1.5h-11V13L10 9.5Z"/><path d="M12 14.5v6"/>',
  tag: '<path d="M3.5 11.6V4.5a1 1 0 0 1 1-1h7.1l9 9a1 1 0 0 1 0 1.4l-7.1 7.1a1 1 0 0 1-1.4 0Z"/><circle cx="8" cy="8" r="1.4"/>',
  listUl: '<circle cx="5" cy="7" r="1.3" fill="currentColor" stroke="none"/><circle cx="5" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="5" cy="17" r="1.3" fill="currentColor" stroke="none"/><path d="M9.5 7H20M9.5 12H20M9.5 17H20"/>',
  listOl: '<path d="M10 7h10M10 12h10M10 17h10"/><path d="M4 5.2h1.4v4M3.8 9.2h3M3.9 13.6c.3-.6.9-.9 1.5-.9.8 0 1.3.5 1.3 1.1 0 .6-.4 1-1 1.5L4 17.8h2.8"/>',
  checklist: '<rect x="3.5" y="4.5" width="5.5" height="5.5" rx="1.3"/><path d="m4.3 16.4 1.6 1.6 2.9-3.1M12.5 7.2H20M12.5 16.5H20"/>',
  quote: '<path d="M5 6.5h5v5c0 3.3-1.7 5.4-4.5 6.2M14 6.5h5v5c0 3.3-1.7 5.4-4.5 6.2"/>',
  code: '<path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5M13.5 4.5l-3 15"/>',
  highlight: '<path d="m14 4 6 6-8.5 8.5H5.5v-6Z"/><path d="M3.5 21h17"/>',
  hr: '<path d="M3.5 12h17M7 7.5h10M7 16.5h10" opacity=".9"/>',
  clearf: '<path d="M6 5h11M11.5 5 9 15M5.5 19.5h6M15 14l5 5M20 14l-5 5"/>',
  chart: '<path d="M4 20h16"/><rect x="5.5" y="11" width="3" height="6.5" rx="1"/><rect x="10.5" y="6.5" width="3" height="11" rx="1"/><rect x="15.5" y="13.5" width="3" height="4" rx="1"/>',
  swap: '<path d="M7 4 3.5 7.5 7 11"/><path d="M3.5 7.5h13M17 13l3.5 3.5L17 20"/><path d="M20.5 16.5h-13"/>',
};
const ico = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ''}</svg>`;

/* ===================== state ===================== */
const S = {
  data: { projects: {}, sections: {}, tasks: {}, events: {}, meta: {}, members: {}, accounts: {}, campaigns: {}, trash: {}, notes: {}, briefs: {}, activity: {}, notifs: {} },
  missing: new Set(),      // collections the security rules don't cover yet
  ws: null, workspaces: [], // older names for the open account (kept so existing helpers keep working)
  biz: { members: {}, teams: {}, accounts: {}, owner: '', ready: false },   // the business: people, teams, client accounts
  acc: null, accRole: null,  // the client account that's open, and your access to it
  ao: { q: '', team: 'All', sort: lsGet('tb:aoSort') || 'name', archived: false },   // All accounts page
  bz: { tab: 'accounts' },  // Business settings page
  user: null, mode: 'local', ready: false,
  showCompleted: {}, cal: null, calTasks: lsGet('tb:calTasks') !== '0', calLeave: lsGet('tb:calLeave') !== '0',
  inlineAdd: null, addingSection: false, drag: null,
  ct: { account: lsGet('tb:ctAccount') || 'all', q: '', sort: lsGet('tb:ctSort') || 'attention', archived: false, limit: 80,
        f: { status: 'All', market: 'All', platform: 'All', objective: 'All', pacing: 'All', creative: 'All', results: 'All', weekly: 'All', paused: 'All' } },
  rulesMissing: false,
  nb: { tab: lsGet('tb:nbTab') || 'all', q: '', sort: lsGet('tb:nbSort') || 'updated', tag: 'all' },
  // client work: clients directory, briefs, all-tasks explorer, activity log and alerts views
  cl: { q: '', sector: 'All', parent: 'All', sort: lsGet('tb:clSort') || 'name', group: lsGet('tb:clGroup') || 'none', tab: 'tasks' },
  br: { q: '', status: 'Active', client: 'All', member: 'All', type: 'All', layout: lsGet('tb:brLayout') || 'board' },
  tx: { q: '', client: 'All', label: 'All', who: 'All', when: 'All', source: 'All', state: 'Open', group: lsGet('tb:txGroup') || 'client' },
  av: { period: '30', who: 'All', action: 'All', client: 'All', q: '' },
  al: { scope: lsGet('tb:alScope') || 'all', sev: 'All' },
  db: Object.assign({ period: '30', project: 'all', account: 'all', view: 'all' }, (() => { try { return JSON.parse(lsGet('tb:db') || '{}'); } catch { return {}; } })()),
};
let store = null;

const settings = () => S.data.meta.settings || { people: [], types: DEFAULT_TYPES };
const people = () => settings().people || [];
const types = () => (settings().types && settings().types.length ? settings().types : DEFAULT_TYPES);
const typeById = id => types().find(t => t.id === id) || { id, name: 'Other', color: 'grey' };
const personById = id => people().find(p => p.id === id);
const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.createdAt ?? 0) - (b.createdAt ?? 0);
// Archived projects keep all their sections and tasks; they're just out of the way.
// "Projects" are the regular to-do lists. Client task lists (kind 'client') and the hidden list that
// holds brief workflow steps (kind 'system') live in the same collection but are shown elsewhere.
const isList = p => !!p && !p.kind;
const projects = () => Object.values(S.data.projects).filter(p => !p.archived && isList(p)).sort(byOrder);
const archivedProjects = () => Object.values(S.data.projects).filter(p => p.archived && p.kind !== 'system').sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0));
// A task is out of sight when it, its section (column) or its project is archived.
const inArchivedProject = t => !!t.archived || !!(S.data.projects[t.projectId] || {}).archived
  || !!(t.sectionId && (S.data.sections[t.sectionId] || {}).archived);
const sectionsOf = pid => Object.values(S.data.sections).filter(s => s.projectId === pid && !s.archived).sort(byOrder);
const archivedSections = () => Object.values(S.data.sections).filter(s => s.archived).sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0));
const archivedTasks = () => Object.values(S.data.tasks).filter(t => t.archived).sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0));
const tasksIn = (pid, sid, withDone) => Object.values(S.data.tasks)
  .filter(t => t.projectId === pid && (t.sectionId || null) === (sid || null) && !t.archived && (withDone || !t.done))
  .sort((a, b) => (a.done - b.done) || byOrder(a, b));
const activeTasks = () => Object.values(S.data.tasks).filter(t => !t.done && !inArchivedProject(t));
// Your name as shown on comments and in the activity log: your team-list name when you're on it.
const me = () => { const p = S.ready && myPerson(); return p ? p.name : S.user ? (S.user.name || S.user.email) : 'Me'; };
const initials = n => String(n || '?').trim().split(/[\s._@-]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
function nextOrder(list) { return list.length ? Math.max(...list.map(x => x.order ?? 0)) + 1000 : 1000; }

/* ---------- campaign tracker selectors ---------- */
// A "week" is the Monday-to-Sunday calendar week; we key it by that Monday's date.
function weekOf(k) { const d = parseKey(k); return addDays(k, -((d.getDay() + 6) % 7)); }
const thisWeek = () => weekOf(todayKey());
const accounts = (withArchived) => Object.values(S.data.accounts).filter(a => withArchived || !a.archived).sort(byOrder);
const campaignsOf = (accId, withArchived) => Object.values(S.data.campaigns)
  .filter(c => (!accId || c.accountId === accId) && (withArchived || !c.archived)).sort(byOrder);
const weeklyDone = c => (c.weeklyChecks || []).some(w => weekOf(w.date) === thisWeek());
// Weekly checks only fall due on campaigns that are actually running.
const weeklyDue = c => c.status === 'Live' && !weeklyDone(c);
function attentionReasons(c) {
  if (c.archived || c.status === 'Ended') return [];
  const r = [];
  if (weeklyDue(c)) r.push('Weekly check due');
  // "Pending" is a neutral, not-yet-assessed state and never counts as an issue.
  if (c.pacing && !['Healthy', 'Pending'].includes(c.pacing)) r.push(c.pacing);
  if (c.creative && c.creative !== 'All Live') r.push(c.creative + ' creatives');
  if (c.results === 'Needs Attention') r.push('Results need attention');
  return r;
}
const needsAttention = c => attentionReasons(c).length > 0;
/* ---------- platform objectives ---------- */
// Objectives are stored per platform: { Meta: ['Lead Generation', 'Reach'], Search: ['Conversion'] }.
// Objectives of a platform that's been deselected stay in the record, but are never shown or
// filtered on - so turning a platform back on brings its objectives back with it.
const objOf = (c, p) => ((c.objectives || {})[p] || []);
const liveObjectives = c => (c.platforms || []).flatMap(p => objOf(c, p));
const hasObjective = (c, obj, platform) => (platform && platform !== 'All' ? [platform] : (c.platforms || []))
  .some(p => objOf(c, p).some(o => o === obj || (obj === 'Other' && o.startsWith(CUSTOM_PREFIX))));
const attentionCount = () => Object.values(S.data.campaigns).filter(c => !c.archived && needsAttention(c)).length;
/* ---------- pauses ---------- */
// c.pauses: what is paused right now - [{ platform, objective|null, since:'YYYY-MM-DD', by }]
// c.pauseLog: the history - [{ platform, objective|null, action:'paused'|'resumed', date, at, by }]
// Stored as arrays (not maps) because objective names contain characters like "/" and ".".
const pauseOf = (c, p, o = null) => (c.pauses || []).find(x => x.platform === p && (x.objective || null) === (o || null));
const platformPaused = (c, p) => !!pauseOf(c, p);
const objPaused = (c, p, o) => platformPaused(c, p) || !!pauseOf(c, p, o);
const activePlatforms = c => (c.platforms || []).filter(p => !platformPaused(c, p));
const pausedCount = c => (c.platforms || []).reduce((n, p) => n + (platformPaused(c, p) ? 1 : objOf(c, p).filter(o => pauseOf(c, p, o)).length), 0);
/* ---------- pacing sheet links ---------- */
// Only plain web links are ever stored or opened (no javascript: or data: URLs).
function cleanUrl(v) {
  v = String(v || '').trim(); if (!v) return '';
  if (!/^[a-z][a-z0-9+.-]*:/i.test(v)) v = 'https://' + v;
  try { const u = new URL(v); return /^https?:$/.test(u.protocol) && u.hostname.includes('.') ? u.href : null; } catch { return null; }
}
// Links are checked again when used, so a bad value written straight to the database can never become a javascript: link.
const safeUrl = v => (typeof v === 'string' && /^https?:\/\/[^\s"'<>]+$/i.test(v.trim()) ? v.trim() : '');
const pacingLink = c => safeUrl(c && (c.pacingUrl || (S.data.accounts[c.accountId] || {}).pacingUrl)) || '';

/* ---------- data cleaning ----------
   Everything read from the database (or a backup file, or this browser) passes through here
   before it is shown. Ids, dates, times, numbers and enums are forced into the shape the app
   expects, so nothing a malicious or buggy client writes can break out of the page's HTML. */
const SAFE_ID = /^[A-Za-z0-9_.:@+-]{1,128}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/, TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/;
const okId = v => typeof v === 'string' && SAFE_ID.test(v);
const okEmailId = v => typeof v === 'string' && v.length <= 254 && /^[^\s<>"'`&/]+@[^\s<>"'`&/]+$/.test(v);
const asStr = (v, max = 100000) => (v == null ? '' : String(v)).slice(0, max);
const asNum = v => (v == null || v === '' ? null : Number.isFinite(+v) ? +v : null);
const asDate = v => (typeof v === 'string' && DATE_RE.test(v) ? v : null);
const asTime = v => (typeof v === 'string' && TIME_RE.test(v) ? v : '');
const asArr = v => (Array.isArray(v) ? v : []);
const asStrArr = (v, max = 500) => asArr(v).filter(x => typeof x === 'string').map(x => x.slice(0, max));
const oneOf = (v, list, dflt) => (list.includes(v) ? v : dflt);
const withIds = list => asArr(list).filter(x => x && typeof x === 'object' && okId(x.id));
function cleanDoc(col, raw) {
  if (!raw || typeof raw !== 'object') return null;
  const d = { ...raw };
  if (col === 'members' ? !okEmailId(d.id) : !okId(d.id)) return null;      // an id that could break HTML: ignore the document
  ['projectId', 'sectionId', 'accountId', 'campaignId', 'noteId', 'assignee', 'person', 'groupId', 'docId', 'briefId', 'taskId', 'ownerId', 'workflowId', 'clientId'].forEach(k => {
    if (k in d && d[k] != null && d[k] !== '' && !okId(d[k])) d[k] = null;
  });
  if ('type' in d && col === 'events' && !okId(d.type)) d.type = 'other';
  ['due', 'deadline', 'start', 'end', 'startDate', 'endDate', 'goLive', 'flightStart', 'flightEnd', 'requestDate'].forEach(k => { if (k in d && d[k] != null && d[k] !== '') d[k] = asDate(d[k]); });
  ['time', 'timeEnd'].forEach(k => { if (k in d && d[k]) d[k] = asTime(d[k]) || (col === 'tasks' ? null : ''); });
  ['order', 'createdAt', 'updatedAt', 'completedAt', 'archivedAt', 'deletedAt', 'lastDoneAt', 'count', 'assignedAt', 'startedAt', 'doneAt', 'blockedAt',
    'submittedAt', 'kickoffAt', 'liveAt', 'closedAt', 'at', 'budget', 'slaDays', 'seq', 'readAt'].forEach(k => { if (k in d) d[k] = asNum(d[k]); });
  ['title', 'name', 'description', 'notes', 'note', 'text', 'label', 'context', 'createdBy', 'updatedBy', 'completedBy', 'lastDoneBy', 'deletedBy', 'kind', 'col',
    'group', 'sector', 'market', 'contactName', 'contactEmail', 'ref', 'type', 'objective', 'kpis', 'audience', 'offer', 'message', 'cta', 'creative',
    'requestedBy', 'requestedByEmail', 'currency', 'stepKey', 'role', 'blockedReason', 'by', 'byEmail', 'action', 'from', 'to', 'detail', 'link', 'body', 'priorityLabel', 'promo']
    .forEach(k => { if (k in d && typeof d[k] !== 'string') d[k] = asStr(d[k]); });
  if ('color' in d) d.color = oneOf(d.color, COLORS, 'grey');
  if ('pacingUrl' in d) d.pacingUrl = safeUrl(d.pacingUrl);
  ['landingUrl', 'assetsUrl', 'planUrl', 'reportUrl'].forEach(k => { if (k in d) d[k] = safeUrl(d[k]); });
  if ('clientIds' in d) d.clientIds = asStrArr(d.clientIds, 128).filter(okId);
  if ('labels' in d) d.labels = asStrArr(d.labels, 128).filter(okId);
  if (col === 'projects') { d.pinned = !!d.pinned; if (d.kind && !['client', 'system'].includes(d.kind)) d.kind = ''; }
  if (col === 'tasks') {
    d.priority = [1, 2, 3, 4].includes(+d.priority) ? +d.priority : 4;
    d.subtasks = withIds(d.subtasks).map(s => ({ ...s, title: asStr(s.title, 500), done: !!s.done }));
    d.comments = withIds(d.comments).map(c => ({ ...c, by: asStr(c.by, 200), byEmail: asStr(c.byEmail, 254), text: asStr(c.text, 5000), at: asNum(c.at) }));
    d.doneLog = asArr(d.doneLog).map(asNum).filter(x => x != null);
    if (d.recur && typeof d.recur === 'object') {
      d.recur = { ...d.recur, type: oneOf(d.recur.type, ['daily', 'weekdays', 'weekly', 'monthly', 'yearly'], 'daily'), every: Math.max(1, Math.min(99, Math.round(+d.recur.every) || 1)) };
      if ('day' in d.recur) d.recur.day = Math.max(1, Math.min(31, Math.round(+d.recur.day) || 1));
    } else d.recur = null;
    d.done = !!d.done;
    if (d.briefId) { d.status = oneOf(d.status, STEP_STATUS, d.done ? 'Done' : 'To do'); d.launch = !!d.launch; d.anchor = oneOf(d.anchor, ['prev', 'flightEnd'], 'prev'); d.blockedMs = asNum(d.blockedMs) || 0; }
  }
  if (col === 'briefs') {
    d.status = oneOf(d.status, BRIEF_STATUS, 'Draft');
    ['markets', 'platforms', 'languages'].forEach(k => { d[k] = asStrArr(d[k], 40); });
    d.team = asArr(d.team).filter(x => x && typeof x === 'object' && okId(x.personId)).map(x => ({ personId: x.personId, role: asStr(x.role, 60), addedAt: asNum(x.addedAt), openedAt: asNum(x.openedAt) }));
    d.statusLog = asArr(d.statusLog).filter(x => x && typeof x === 'object').map(x => ({ status: oneOf(x.status, BRIEF_STATUS, 'Draft'), at: asNum(x.at), by: asStr(x.by, 200) })).slice(-200);
    d.archived = !!d.archived; d.demo = !!d.demo;
  }
  if (col === 'activity' || col === 'notifs') { if (col === 'notifs') { d.read = !!d.read; d.link = /^#\/[A-Za-z0-9_./:@+-]*$/.test(d.link || '') ? d.link : '#/'; } }
  if (col === 'events') {
    const r = d.repeat && typeof d.repeat === 'object' ? d.repeat : {};
    d.repeat = { type: oneOf(r.type, ['none', 'weekly', 'monthly'], 'none'), every: +r.every === 2 ? 2 : 1, until: asDate(r.until) || '' };
    d.skip = asArr(d.skip).filter(x => asDate(x));
  }
  if (col === 'meta') {
    d.people = withIds(d.people).map(p => ({ ...p, name: asStr(p.name, 200), color: oneOf(p.color, COLORS, 'grey'),
      email: okEmailId(String(p.email || '').toLowerCase()) ? String(p.email).toLowerCase() : '', role: asStr(p.role, 60) }));
    d.labels = withIds(d.labels).map(l => ({ id: l.id, name: asStr(l.name, 60), color: oneOf(l.color, COLORS, 'grey') }));
    d.roles = asStrArr(d.roles, 60).slice(0, 30);
    d.clientSections = asStrArr(d.clientSections, 60).slice(0, 12);
    d.sectors = asStrArr(d.sectors, 80).slice(0, 40);
    d.workflows = withIds(d.workflows).map(w => ({ id: w.id, name: asStr(w.name, 80),
      steps: withIds(w.steps).map(x => ({ id: x.id, name: asStr(x.name, 120), role: asStr(x.role, 60), days: Math.max(0, Math.min(60, +x.days || 0)), anchor: oneOf(x.anchor, ['prev', 'flightEnd'], 'prev'), launch: !!x.launch })) }));
    if (d.alerts && typeof d.alerts === 'object') d.alerts = { dueSoonDays: Math.max(0, Math.min(14, +d.alerts.dueSoonDays || 1)), stallFactor: Math.max(1, Math.min(5, +d.alerts.stallFactor || 1.5)),
      unopenedHours: Math.max(1, Math.min(240, +d.alerts.unopenedHours || 24)), kickoffHours: Math.max(1, Math.min(240, +d.alerts.kickoffHours || 24)) };
    d.types = withIds(d.types).map(t => ({ ...t, name: asStr(t.name, 200), color: oneOf(t.color, COLORS, 'grey') }));
  }
  if (col === 'campaigns') {
    d.status = oneOf(d.status, C_STATUS, 'Pending');
    d.pacing = oneOf(d.pacing, C_PACING, 'Pending');
    d.creative = oneOf(d.creative, C_CREATIVE, 'All Live');
    d.results = oneOf(d.results, C_RESULTS, 'Pending');
    d.markets = asStrArr(d.markets, 20); d.platforms = asStrArr(d.platforms, 40);
    const objs = {}; if (d.objectives && typeof d.objectives === 'object') Object.entries(d.objectives).forEach(([k, v]) => { objs[asStr(k, 40)] = asStrArr(v, 300); });
    d.objectives = objs;
    d.weeklyChecks = withIds(d.weeklyChecks).filter(w => asDate(w.date)).map(w => ({ ...w, by: asStr(w.by, 200), at: asNum(w.at) }));
    const pz = x => ({ ...x, platform: asStr(x.platform, 40), objective: x.objective == null ? null : asStr(x.objective, 300), by: asStr(x.by, 200) });
    d.pauses = asArr(d.pauses).filter(x => x && typeof x === 'object' && asDate(x.since)).map(pz);
    d.pauseLog = asArr(d.pauseLog).filter(x => x && typeof x === 'object' && asDate(x.date)).map(x => ({ ...pz(x), action: oneOf(x.action, ['paused', 'resumed'], 'paused') }));
  }
  if (col === 'notes') { d.tags = asStrArr(d.tags, 30); d.html = asStr(d.html, 300000); d.pinned = !!d.pinned; }
  if (col === 'trash') { if (!okId(d.groupId)) return null; d.kind = asStr(d.kind, 20); d.col = COLS.includes(d.col) ? d.col : ''; if (!d.col) return null; }
  return d;
}
function cleanCol(col, map) {
  const out = {};
  if (map && typeof map === 'object') Object.entries(map).forEach(([id, v]) => { const c = cleanDoc(col, { ...v, id }); if (c) out[c.id] = c; });
  return out;
}
const extLink = (url, inner, cls = '', title = 'Open pacing sheet') => `<a class="${cls}" data-ext href="${esc(url)}" target="_blank" rel="noopener noreferrer" title="${esc(title)}">${inner}</a>`;

/* ===================== stores ===================== */
let renderQueued = false;
function scheduleRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => { renderQueued = false; render(); });
}

class LocalStore {
  // ns: the account id - each account keeps its own copy in this browser
  constructor(ns) {
    this.key = ns ? 'tb:data:v1:' + ns : 'tb:data:v1';
    const raw = lsGet(this.key);
    if (raw) { try { const d = JSON.parse(raw); COLS.forEach(c => S.data[c] = cleanCol(c, d[c])); } catch { } }
    this.onStorage = e => { if (e.key === LS + this.key && e.newValue) { try { const d = JSON.parse(e.newValue); COLS.forEach(c => S.data[c] = cleanCol(c, d[c])); this.cb && this.cb(); } catch { } } };
    window.addEventListener('storage', this.onStorage);
  }
  start(cb) { this.cb = cb; cb(); }
  stop() { window.removeEventListener('storage', this.onStorage); this.cb = null; }
  save() { lsSet(this.key, JSON.stringify(S.data)); this.cb && this.cb(); }
  async put(col, obj) { S.data[col][obj.id] = clone(obj); this.save(); }
  async update(col, id, fields) { if (!S.data[col][id]) return; Object.assign(S.data[col][id], clone(fields)); this.save(); }
  async del(col, id) { delete S.data[col][id]; this.save(); }
  // Local mode has no mail server: emails are kept in a small outbox so you can see what would go out.
  async mail(msg) { try { const box = JSON.parse(lsGet('tb:outbox') || '[]'); box.unshift({ ...msg, at: Date.now() }); lsSet('tb:outbox', JSON.stringify(box.slice(0, 50))); } catch { } }
  async log(entry) { S.data.activity[entry.id] = clone(entry); this.save(); }
  async batch(ops) {
    for (const o of ops) {
      if (o.type === 'put') S.data[o.col][o.data.id] = clone(o.data);
      else if (o.type === 'update') { if (S.data[o.col][o.id]) Object.assign(S.data[o.col][o.id], clone(o.data)); }
      else if (o.type === 'del') delete S.data[o.col][o.id];
    }
    this.save();
  }
}

class CloudStore {
  // base: [] for the original workspace (top-level collections), ['workspaces', id] for everyone else's.
  constructor(fs, db, base = []) {
    this.fs = fs; this.db = db; this.unsubs = []; this.base = base;
    this.cols = base.length ? COLS.filter(c => c !== 'members') : COLS;   // other workspaces keep members on the workspace itself
  }
  start(cb, onErr) {
    const loaded = new Set(); this.fresh = new Set(); let raf = 0;
    const fire = () => { if (loaded.size < this.cols.length) return; cancelAnimationFrame(raf); raf = requestAnimationFrame(cb); };
    const F = this.fs;
    this.cols.forEach(col => {
      // Most collections load whole. The activity log loads a recent window, and notifications only your own.
      let src = F.collection(this.db, ...this.base, col);
      if (col === 'activity') src = F.query(src, F.where('at', '>=', Date.now() - (Math.max(30, +CFG.activityDays || 90) * 864e5)));
      if (col === 'notifs') src = F.query(src, F.where('to', '==', (S.user && S.user.email) || '-'));
      // includeMetadataChanges lets us know when data has been confirmed by the server (never seed over real data)
      this.unsubs.push(this.fs.onSnapshot(src, { includeMetadataChanges: true }, snap => {
        const known = loaded.has(col);
        if (!snap.metadata.fromCache) this.fresh.add(col);
        const changed = typeof snap.docChanges === 'function' ? snap.docChanges().length : 1;
        if (known && !changed) return;   // metadata-only echo: nothing to repaint
        const m = {}; snap.forEach(d => { const c = cleanDoc(col, { ...d.data(), id: d.id }); if (c) m[c.id] = c; });
        S.data[col] = m; loaded.add(col); fire();
      }, err => {
        // A newer collection the security rules don't cover yet must not lock the whole app out.
        if (OPTIONAL_COLS.includes(col) && err.code === 'permission-denied') {
          S.missing.add(col); if (['accounts', 'campaigns', 'briefs', 'activity', 'notifs'].includes(col)) S.rulesMissing = true;
          S.data[col] = {}; loaded.add(col); this.fresh.add(col); fire(); return;
        }
        onErr && onErr(err);
      }));
    });
  }
  isFresh() { return this.fresh && this.fresh.size >= this.cols.length; }
  stop() { this.unsubs.forEach(u => u()); this.unsubs = []; }
  ref(col, id) { return this.fs.doc(this.db, ...this.base, col, id); }
  async put(col, obj) { return this.fs.setDoc(this.ref(col, obj.id), clone(obj)).catch(writeErr); }
  async update(col, id, fields) { return this.fs.updateDoc(this.ref(col, id), clone(fields)).catch(writeErr); }
  async del(col, id) { return this.fs.deleteDoc(this.ref(col, id)).catch(writeErr); }
  // Emails go to one top-level collection that the "Trigger Email" extension watches (SETUP step 7).
  async mail(msg) {
    const c = (CFG.email && CFG.email.collection) || 'mail';
    return this.fs.addDoc(this.fs.collection(this.db, c), { ...clone(msg), createdAt: this.fs.serverTimestamp(), createdBy: (S.user && S.user.email) || '' })
      .catch(e => { console.warn('email not queued', e && e.code); S.mailBlocked = true; });
  }
  // Activity entries are write-once: stamped with the server clock, never edited (see the rules).
  async log(entry) {
    return this.fs.setDoc(this.ref('activity', entry.id), { ...clone(entry), ts: this.fs.serverTimestamp() })
      .catch(e => { console.warn('activity not logged', e && e.code); });
  }
  async batch(ops) {
    for (let i = 0; i < ops.length; i += 400) {
      const b = this.fs.writeBatch(this.db);
      ops.slice(i, i + 400).forEach(o => {
        if (o.type === 'put') b.set(this.ref(o.col, o.data.id), clone(o.data));
        else if (o.type === 'update') b.update(this.ref(o.col, o.id), clone(o.data));
        else if (o.type === 'del') b.delete(this.ref(o.col, o.id));
      });
      await b.commit().catch(writeErr);
    }
  }
}
/* ---------- security log ----------
   In synced mode, sign-ins, access changes, bulk deletes and refused writes are appended to an
   'audit' collection. The rules make entries write-once (no edits, no deletes), stamp them with the
   server's clock, and let only the workspace owner read them (Settings → Security log). */
let auditFn = null;
function audit(action, detail = '') { try { if (auditFn) auditFn(String(action).slice(0, 40), String(detail).slice(0, 500)); } catch { } }
function writeErr(e) {
  console.error(e);
  if (e && e.code === 'permission-denied') audit('write_denied', (e.message || '').slice(0, 300));
  if (e && e.code === 'permission-denied' && S.rulesMissing) { toast('This needs the updated security rules - publish firestore.rules (SETUP step 5).'); return; }
  toast(e && e.code === 'permission-denied' ? "You don't have permission to change this." : 'Could not save - check your connection.');
}

/* ===================== UI primitives ===================== */
function toast(msg, undo) {
  const el = document.createElement('div'); el.className = 'toast';
  el.innerHTML = `<span>${esc(msg)}</span>${undo ? `<button title="${/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'}+Z">Undo</button>` : ''}`;
  if (undo) el.querySelector('button').onclick = () => { undo(); el.remove(); };
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), undo ? 6000 : 3500);
}
function openModal(inner, cls = '') {
  closeMenu();
  const wrap = document.createElement('div'); wrap.className = 'overlay';
  wrap.innerHTML = `<div class="modal ${cls}" role="dialog" aria-modal="true">${inner}</div>`;
  wrap.close = () => { wrap.remove(); };
  wrap.addEventListener('mousedown', e => { if (e.target === wrap) wrap.dataset.down = '1'; });
  wrap.addEventListener('mouseup', e => { if (e.target === wrap && wrap.dataset.down) (wrap.onDismiss || wrap.close)(); delete wrap.dataset.down; });
  $('#modals').appendChild(wrap);
  const f = wrap.querySelector('[autofocus]'); if (f) { f.focus(); if (f.select && f.value && f.tagName === 'INPUT') f.select(); }
  return wrap;
}
const topModal = () => $('#modals').lastElementChild;
function confirmBox(msg, ok = 'Delete', title = 'Are you sure?') {
  return new Promise(res => {
    const w = openModal(`<div class="modal-head"><h2>${esc(title)}</h2></div>
      <div class="modal-body">${msg}</div>
      <div class="modal-foot"><span class="spacer"></span><button class="btn" data-x>Cancel</button><button class="btn btn-primary" data-ok autofocus>${esc(ok)}</button></div>`);
    const done = v => { w.close(); res(v); };
    w.onDismiss = () => done(false);
    w.querySelector('[data-x]').onclick = () => done(false);
    w.querySelector('[data-ok]').onclick = () => done(true);
  });
}
function promptBox({ title, label = 'Name', value = '', color, placeholder = '', multiline = false, ok = 'Save' }) {
  return new Promise(res => {
    let c = color;
    const w = openModal(`<div class="modal-head"><h2>${esc(title)}</h2><button class="icon-btn" data-x>${ico('x')}</button></div>
      <form class="modal-body">
        <div class="field"><label>${esc(label)}</label>${multiline
          ? `<textarea class="ta" autofocus placeholder="${esc(placeholder)}">${esc(value)}</textarea>`
          : `<input class="inp" autofocus value="${esc(value)}" placeholder="${esc(placeholder)}" maxlength="120">`}</div>
        ${color !== undefined ? `<div class="field"><label>Color</label><div class="swatches">${COLORS.map(k => `<button type="button" class="swatch sw-${k} ${k === c ? 'on' : ''}" data-c="${k}" title="${k}"></button>`).join('')}</div></div>` : ''}
        <button type="submit" hidden></button>
      </form>
      <div class="modal-foot"><span class="spacer"></span><button class="btn" data-x>Cancel</button><button class="btn btn-primary" data-ok>${esc(ok)}</button></div>`);
    const inp = w.querySelector('input.inp,textarea');
    const done = v => { w.close(); res(v); };
    const submit = () => { const v = inp.value.trim(); if (!v && !multiline) return inp.focus(); done({ value: v, color: c }); };
    w.onDismiss = () => done(null);
    $$('[data-x]', w).forEach(b => b.onclick = () => done(null));
    w.querySelector('[data-ok]').onclick = submit;
    w.querySelector('form').onsubmit = e => { e.preventDefault(); submit(); };
    $$('.swatch', w).forEach(b => b.onclick = () => { c = b.dataset.c; $$('.swatch', w).forEach(x => x.classList.toggle('on', x === b)); });
  });
}
let menuEl = null;
function closeMenu() { if (menuEl) { menuEl.remove(); menuEl = null; } }
function openMenu(anchor, items, align = 'left') {
  closeMenu();
  const m = document.createElement('div'); m.className = 'menu';
  items.forEach(it => {
    if (it === '-') { m.appendChild(document.createElement('hr')); return; }
    if (it.title) { const t = document.createElement('div'); t.className = 'menu-title'; t.textContent = it.title; m.appendChild(t); return; }
    const b = document.createElement('button');
    b.className = it.danger ? 'danger' : '';
    b.innerHTML = `${it.icon ? ico(it.icon) : ''}<span>${esc(it.label)}</span>`;
    b.onclick = e => { e.stopPropagation(); closeMenu(); it.onClick(); };
    m.appendChild(b);
  });
  document.body.appendChild(m); menuEl = m;
  placeMenu(m, anchor, align);
}
function placeMenu(m, anchor, align = 'left') {
  const r = anchor.getBoundingClientRect(), mw = m.offsetWidth, mh = m.offsetHeight;
  let x = align === 'right' ? r.right - mw : r.left, y = r.bottom + 4;
  if (x + mw > innerWidth - 8) x = innerWidth - mw - 8; if (x < 8) x = 8;
  if (y + mh > innerHeight - 8) y = Math.max(8, r.top - mh - 4);
  m.style.left = x + 'px'; m.style.top = y + 'px';
}
// A menu that stays open while you tick several things (platform objectives).
function openCheckMenu(anchor, { title, options, selected, onToggle, extra, align }) {
  closeMenu();
  const m = document.createElement('div'); m.className = 'menu check-menu';
  const paint = () => {
    const sel = selected();
    m.innerHTML = (title ? `<div class="menu-title">${esc(title)}</div>` : '') +
      options().map(o => `<button data-v="${esc(o)}" class="${sel.includes(o) ? 'on' : ''}">
        <span class="box">${sel.includes(o) ? ico('check', 'i-sm') : ''}</span><span class="lbl">${esc(objFull(o))}</span></button>`).join('') +
      (extra ? `<hr><button data-extra="1">${ico('plus', 'i-sm')}<span>${esc(extra.label)}</span></button>` : '');
    if (anchor.isConnected) placeMenu(m, anchor, align);
  };
  m.addEventListener('mousedown', e => e.stopPropagation());
  m.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return;
    e.stopPropagation(); e.preventDefault();
    if (b.dataset.extra) { closeMenu(); await extra.onClick(); return; }
    await onToggle(b.dataset.v);
    paint();
  });
  document.body.appendChild(m); menuEl = m;
  paint();
  return m;
}
document.addEventListener('mousedown', e => { if (menuEl && !menuEl.contains(e.target)) closeMenu(); });
window.addEventListener('resize', closeMenu);

/* ===================== routing ===================== */
function route() {
  const r = routeRaw();
  if (r.view === 'accounts' || r.view === 'business' || r.view === 'guide' || r.view === 'home') return r;
  if (!S.acc) return { view: 'accounts' };
  const tool = TOOL_OF_VIEW[r.view];
  if (tool && !toolOn(tool)) return { view: 'off', tool };
  return r;
}
function routeRaw() {
  const h = location.hash.replace(/^#\/?/, '').split('/');
  if (h[0] === 'accounts') return { view: 'accounts' };
  if (h[0] === 'business') return { view: 'business' };
  if (h[0] === 'guide') return { view: 'guide' };
  if (h[0] === 'home') return { view: 'home' };
  if (h[0] === 'project' && S.data.projects[h[1]]) return S.data.projects[h[1]].kind === 'client' ? { view: 'client', id: h[1] } : { view: 'project', id: h[1] };
  if (h[0] === 'client' && S.data.projects[h[1]] && S.data.projects[h[1]].kind === 'client') return { view: 'client', id: h[1] };
  if (h[0] === 'clients') return { view: 'clients' };
  if (h[0] === 'briefs') return { view: 'briefs' };
  if (h[0] === 'brief' && S.data.briefs[h[1]]) return { view: 'brief', id: h[1] };
  if (h[0] === 'mywork') return { view: 'mywork' };
  if (h[0] === 'tasks') return { view: 'tasks' };
  if (h[0] === 'alerts') return { view: 'alerts' };
  if (h[0] === 'activity') return { view: 'activity' };
  if (h[0] === 'today') return { view: 'today' };
  if (h[0] === 'upcoming') return { view: 'upcoming' };
  if (h[0] === 'campaigns') return { view: 'campaigns' };
  if (h[0] === 'archive') return { view: 'archive' };
  if (h[0] === 'dashboard') return { view: 'dashboard' };
  if (h[0] === 'notes') return { view: 'notes', id: h[1] && S.data.notes[h[1]] ? h[1] : null };
  if (h[0] === 'trash') return { view: 'trash' };
  // Landing page: your own work when you're on the account's team list, otherwise the dashboard.
  const v = myPerson() && toolOn('mywork') ? 'mywork' : defaultView() === 'mywork' ? 'dashboard' : defaultView();
  return { view: toolOn(TOOL_OF_VIEW[v]) ? v : 'activity' };
}
const go = hash => { location.hash = hash; document.body.classList.remove('nav-open'); };
window.addEventListener('hashchange', () => { S.inlineAdd = null; S.addingSection = false; render(); $('.content') && ($('.content').scrollTop = 0); });

/* ===================== render ===================== */
function render(opts = {}) {
  if (!S.ready) return;
  // Never rebuild the page while something is being dragged: replacing the DOM destroys
  // the element the browser is carrying, so the drag never ends and the page feels frozen.
  // Anything that arrives mid-drag is painted the moment the drag finishes.
  if (S.drag) {
    if (Date.now() - (S.dragAt || 0) < 4000) { S.renderPending = true; return; }
    resetDrag();   // stale drag state (a dragend we never heard about) - clean up and carry on
  }
  // don't blow away a half-typed inline form: capture & restore
  const keep = {}; let focusId = null, selStart = null;
  $$('[data-keep]').forEach(el => keep[el.id] = el.value);
  const ae = document.activeElement;
  if (ae && ae.id && ae.hasAttribute('data-keep')) { focusId = ae.id; try { selStart = ae.selectionStart; } catch { } }
  const board = $('#board'), scrollL = board ? board.parentElement.scrollLeft : 0;
  const content = $('.content'), scrollT = content ? content.scrollTop : 0;

  const r = route(); S.route = r;
  // The note being typed in survives the rebuild untouched (caret, selection and undo history).
  const edEl = $('#nb-editor'); let keepEd = null, keepRange = null;
  const edScroll = $('.nb-scroll') ? $('.nb-scroll').scrollTop : 0, listScroll = $('.nb-items') ? $('.nb-items').scrollTop : 0, wasNotes = !!$('.nb');
  if (edEl && r.view === 'notes' && r.id === edEl.dataset.note && (edEl.contains(document.activeElement) || NB.dirty)) {
    // plain node/offset pairs, not a live Range: a Range collapses when its nodes leave the page
    keepEd = edEl; const sel = getSelection(); if (sel.rangeCount && edEl.contains(sel.anchorNode)) keepRange = [sel.anchorNode, sel.anchorOffset, sel.focusNode, sel.focusOffset];
  }
  nbBeforeRender(r.view === 'notes' ? r.id : null);
  const routeChanged = S.lastRouteKey !== (r.view + (r.id || ''));
  S.lastRouteKey = r.view + (r.id || '');
  // View-only changes (filters, search, sort, account tabs) repaint the main pane only -
  // the sidebar and its counts don't change, so there's no reason to rebuild them.
  const main = $('.main');
  document.body.classList.toggle('view-only', !!S.acc && S.accRole === 'viewer');
  if (r.view === 'home') {   // the homepage only repaints when you arrive on it (data changes don't restart its animations)
    if (routeChanged || !$('#root .home')) { $('#root').innerHTML = homeHTML(true); document.title = 'dentsu ' + (CFG.appName || 'Ads Workspace'); homeEnhance(); }
    return;
  }
  if (opts.mainOnly && main && !routeChanged) main.innerHTML = renderMain(r);
  else $('#root').innerHTML = `<div id="app">${renderSidebar(r)}<div class="scrim" data-action="close-nav"></div><main class="main">${renderMain(r)}</main></div>`;

  Object.entries(keep).forEach(([id, v]) => { const el = document.getElementById(id); if (el) el.value = v; });
  if (focusId) { const el = document.getElementById(focusId); if (el) { el.focus(); try { if (selStart != null) el.setSelectionRange(selStart, selStart); } catch { } } }
  const nb = $('#board'); if (nb) nb.parentElement.scrollLeft = scrollL;
  const nc = $('.content'); if (nc) { nc.scrollTop = routeChanged ? 0 : scrollT; if (routeChanged) nc.classList.add('route-enter'); }
  if (keepEd) {
    const ph = $('#nb-editor');
    if (ph && ph.dataset.note === keepEd.dataset.note) {
      ph.replaceWith(keepEd);
      if (keepRange) { keepEd.focus({ preventScroll: true }); try { getSelection().setBaseAndExtent(...keepRange); } catch { } }
    }
  }
  if (wasNotes && r.view === 'notes') {
    const li = $('.nb-items'); if (li) li.scrollTop = listScroll;
    const es = $('.nb-scroll'); if (es && !routeChanged) es.scrollTop = edScroll;
  }
  if (S.drawerPaint) S.drawerPaint();
  document.body.classList.remove('on-home');
  guideFab();

  document.title = (['project', 'client'].includes(r.view) ? S.data.projects[r.id]?.name + ' - ' : r.view === 'brief' ? `${S.data.briefs[r.id]?.ref || ''} ${S.data.briefs[r.id]?.title || 'Brief'} - ` : { today: 'Today - ', upcoming: 'Upcoming - ', campaigns: 'Campaign Tracker - ', archive: 'Archive - ', dashboard: 'Dashboard - ', notes: (r.id && S.data.notes[r.id] ? (S.data.notes[r.id].title || 'Untitled') + ' - ' : 'Notebook - '), trash: 'Recently deleted - ',
    clients: 'Brands - ', briefs: 'Briefs - ', mywork: 'My work - ', tasks: 'All tasks - ', alerts: 'Alerts - ', activity: 'Activity log - ', accounts: 'All accounts - ', business: 'Business settings - ', guide: 'Guide - ' }[r.view] || '') + (S.acc && !['accounts', 'business', 'guide'].includes(r.view) ? S.acc.name + ' - ' : '') + 'dentsu ' + (CFG.appName || 'Ads Workspace');
}


// Notion-style page icon above each page title (the notebook has its own editor header)
const PAGE_ICON = { today: ['today', 'green'], upcoming: ['upcoming', 'purple'], dashboard: ['chart', 'blue'], campaigns: ['campaign', 'orange'], archive: ['archive', 'grey'], trash: ['trash', 'red'],
  clients: ['client', 'teal'], briefs: ['brief', 'purple'], mywork: ['inbox', 'red'], tasks: ['tag', 'yellow'], alerts: ['bell', 'orange'], activity: ['history', 'blue'] };
function paintPageIcon(r) {
  if (r.view === 'notes') return;
  if (['client', 'brief'].includes(r.view)) return;   // these pages draw their own header
  const head = $('.content .page-head, .content .ct-head, .content .cal-head');
  const h1 = head && head.querySelector('h1');
  if (!h1 || head.querySelector('.pg-icon')) return;
  let html;
  if (r.view === 'project') { const p = S.data.projects[r.id]; if (!p) return; html = `<div class="pg-icon pi-${esc(p.color || 'grey')}" aria-hidden="true"><span class="hashi">#</span></div>`; }
  else { const pi = PAGE_ICON[r.view]; if (!pi) return; html = `<div class="pg-icon pi-${pi[1]}" aria-hidden="true">${ico(pi[0])}</div>`; }
  const wrap = document.createElement('div'); wrap.className = 'pg-title';
  h1.before(wrap); wrap.insertAdjacentHTML('afterbegin', html); wrap.appendChild(h1);
}
function renderSidebar(r) {
  const u = S.user || { name: 'Me' };
  const nav = (view, hash, icon, label, cnt = '', extra = '') => `<button class="nav-item ${r.view === view ? 'active' : ''}" data-go="${hash}">${ico(icon)}<span class="lbl">${label}</span>${cnt}${extra}</button>`;
  const cnt = n => `<span class="cnt">${n || ''}</span>`;
  const top = `<div class="side-top">
      <button class="side-logo" data-go="#/home" title="Home">${logoMark()}</button>
      <span class="spacer"></span>
      ${S.acc ? `<button class="icon-btn bell-btn" data-action="notif-open" title="Notifications">${ico('bell')}${(() => { const n = unreadNotifs().length; return n ? `<span class="bell-n">${n > 99 ? '99+' : n}</span>` : ''; })()}</button>` : ''}
      ${S.acc ? `<button class="icon-btn" data-action="open-settings" title="Account settings">${ico('gear')}</button>` : ''}
      <button class="user-btn" data-action="user-menu" title="${esc(u.name || u.email || 'Me')}"><span class="avatar sw-${esc(u.color || 'red')}">${esc(initials(u.name || u.email))}</span></button>
    </div>
    ${accSwitcherHTML()}`;
  const business = `<div class="side-group side-biz">
      <div class="side-group-head"><span>Business</span></div>
      ${nav('accounts', '#/accounts', 'grid', 'All accounts', cnt(myAccounts().length))}
      ${isBizAdmin() ? nav('business', '#/business', 'people', 'Business settings') : ''}
    </div>`;
  const foot = `<div class="side-foot">${S.mode === 'local'
      ? `<div class="mode-note"><b>Local mode</b> - saved in this browser only${userEmail() !== S.biz.owner ? ` · viewing as <b>${esc(u.name)}</b>` : ''}. Add your Firebase config (see SETUP) to share it with your team.</div>`
      : `<div class="mode-note">Synced · ${esc(S.user?.email || '')}</div>`}</div>`;
  if (!S.acc) return `<aside class="sidebar">${top}${business}<div class="side-group side-help">${nav('guide', '#/guide', 'help', 'Guide &amp; help')}</div>${foot}</aside>`;
  const today = todayKey();
  const todayCount = activeTasks().filter(t => t.due && t.due <= today).length;
  const counts = {}; activeTasks().forEach(t => counts[t.projectId] = (counts[t.projectId] || 0) + 1);
  const archN = archivedProjects().length + archivedSections().length + archivedTasks().length + Object.values(S.data.accounts).filter(a => a.archived).length + Object.values(S.data.campaigns).filter(c => c.archived).length;
  const trashN = trashGroups().length;
  const edit = canEditAcc();
  const brandItems = toolOn('brands') ? nav('clients', '#/clients', 'client', 'Brands', cnt(clients().length)) + clients().filter(h => h.pinned).map(h => `<button class="nav-item sub ${r.view === 'client' && r.id === h.id ? 'active' : ''}" data-go="#/client/${h.id}"><span class="hash tx-${esc(h.color || 'teal')}">${ico('pin', 'i-sm')}</span><span class="lbl">${esc(h.name)}</span></button>`).join('') : '';
  // the daily tools stay in view; everything else folds into "More"
  const more = [
    toolOn('lists') ? nav('today', '#/today', 'today', 'Today', cnt(todayCount)) : '',
    brandItems,
    toolOn('tasks') ? nav('tasks', '#/tasks', 'tag', 'All tasks &amp; labels') : '',
    toolOn('notes') ? nav('notes', '#/notes', 'notebook', 'Notebook', cnt(Object.keys(S.data.notes).length)) : '',
    toolOn('activity') ? nav('activity', '#/activity', 'history', 'Activity log') : '',
    nav('archive', '#/archive', 'archive', 'Archive', cnt(archN)),
    nav('trash', '#/trash', 'trash', 'Recently deleted', cnt(trashN)),
  ].join('');
  const moreOpen = lsGet('tb:sideMore') === '1' || ['today', 'clients', 'client', 'tasks', 'notes', 'activity', 'archive', 'trash'].includes(r.view);
  return `<aside class="sidebar">
    ${top}
    ${edit && (toolOn('lists') || toolOn('briefs')) ? `<div class="side-actions">${toolOn('briefs') ? `<button class="add-task-btn brief-btn" data-action="br-new" title="New brief">${ico('brief')}New brief</button>` : ''}
      ${toolOn('lists') ? `<button class="add-task-btn" data-action="quick-add" title="Add task (Q)"><span class="plus">${ico('plus')}</span>Task</button>` : ''}</div>` : `<div class="side-actions view-note">${S.accRole === 'viewer' ? `${ico('eye', 'i-sm')} View only` : ''}</div>`}
    <button class="nav-item" data-action="search">${ico('search')}<span class="lbl">Search</span></button>
    ${toolOn('mywork') ? nav('mywork', '#/mywork', 'inbox', 'My work', cnt(myWorkCount())) : ''}
    ${toolOn('briefs') ? nav(r.view === 'brief' ? 'brief' : 'briefs', '#/briefs', 'brief', 'Briefs', cnt(activeBriefs().length)).replace('nav-item ', `nav-item ${['briefs', 'brief'].includes(r.view) ? 'active ' : ''}`) : ''}
    ${toolOn('campaigns') ? nav('campaigns', '#/campaigns', 'campaign', 'Campaign Tracker', (() => { const n = attentionCount(); return n ? `<span class="cnt" title="${n} campaign${n === 1 ? '' : 's'} need attention">${n}</span>` : ''; })()) : ''}
    ${toolOn('alerts') ? nav('alerts', '#/alerts', 'bell', 'Alerts', (() => { const a = alertCounts(); return a.n ? `<span class="cnt al-cnt ${a.crit ? 'crit' : ''}" title="${a.crit} critical · ${a.n - a.crit} warnings">${a.n}</span>` : ''; })()) : ''}
    ${toolOn('lists') ? nav('upcoming', '#/upcoming', 'upcoming', 'Upcoming') : ''}
    ${toolOn('dashboard') ? nav('dashboard', '#/dashboard', 'chart', 'Dashboard') : ''}
    ${toolOn('lists') ? `<div class="side-group">
      <div class="side-group-head"><span>Lists</span>${edit ? `<button class="icon-btn" data-action="add-project" title="Add list">${ico('plus')}</button>` : ''}</div>
      ${projects().map(p => `<div class="proj-item" data-proj="${p.id}">
        <button class="nav-item ${r.view === 'project' && r.id === p.id ? 'active' : ''}" data-go="#/project/${p.id}"><span class="hash tx-${esc(p.color || 'grey')}">#</span><span class="lbl">${esc(p.name)}</span><span class="cnt">${counts[p.id] || ''}</span></button>
        ${edit ? `<button class="icon-btn more" data-action="project-menu" data-id="${p.id}" title="More">${ico('dots')}</button>` : ''}
      </div>`).join('') || '<div class="mode-note" style="border:0">No lists yet.</div>'}
    </div>` : ''}
    <div class="side-group side-more ${moreOpen ? 'open' : ''}">
      <button class="side-group-head side-more-btn" data-action="side-more" aria-expanded="${moreOpen}"><span>More</span>${ico('down', 'i-sm')}</button>
      <div class="side-more-body">${more}</div>
    </div>
    ${business}
    <div class="side-group side-help">${nav('guide', '#/guide', 'help', 'Guide &amp; help')}</div>
    ${foot}
  </aside>`;
}

function renderMain(r) {
  if (r.view === 'accounts') return renderAccounts();
  if (r.view === 'business') return renderBusiness();
  if (r.view === 'guide') return renderGuide();
  if (r.view === 'off') return topbar('') + `<div class="content"><div class="page-head"><h1>${esc(toolName(r.tool))}</h1></div><div class="ct-empty">${ico('block')}<br><b>${esc(toolName(r.tool))}</b> is switched off for ${esc(S.acc ? S.acc.name : 'this account')}.<br>${canAdminAcc() ? '<br><button class="btn btn-primary" data-action="acc-tools">Choose tools for this account</button>' : 'An account admin can switch it on in Account settings → Tools.'}</div></div>`;
  if (r.view === 'project') return renderProject(S.data.projects[r.id]);
  if (r.view === 'client') return renderClient(S.data.projects[r.id]);
  if (r.view === 'clients') return renderClients();
  if (r.view === 'briefs') return renderBriefs();
  if (r.view === 'brief') return renderBrief(S.data.briefs[r.id]);
  if (r.view === 'mywork') { lsSet('tb:seenMyWork', '1'); return renderMyWork(); }
  if (r.view === 'tasks') return renderAllTasks();
  if (r.view === 'alerts') return renderAlerts();
  if (r.view === 'activity') return renderActivity();
  if (r.view === 'today') return renderToday();
  if (r.view === 'upcoming') return renderUpcoming();
  if (r.view === 'campaigns') return renderCampaigns();
  if (r.view === 'archive') return renderArchive();
  if (r.view === 'dashboard') return renderDashboard();
  if (r.view === 'notes') return renderNotebook(r);
  if (r.view === 'trash') return renderTrash();
  return '';
}


/* =====================================================================
   DASHBOARD - to-do lists, campaigns and team, for a chosen period.
   Everything is computed from the data already in the app; nothing extra is stored.
   ===================================================================== */
const DB_PERIODS = [['7', 'Last 7 days'], ['30', 'Last 30 days'], ['90', 'Last 90 days'], ['month', 'This month'],
  ['quarter', 'This quarter'], ['year', 'This year'], ['all', 'All time']];
const tsKey = ts => keyOf(new Date(ts));
function dbRange(p) {
  const t = todayKey(), [y, m] = t.split('-').map(Number);
  if (p === 'month') return { from: t.slice(0, 8) + '01', to: t };
  if (p === 'quarter') return { from: `${y}-${pad(Math.floor((m - 1) / 3) * 3 + 1)}-01`, to: t };
  if (p === 'year') return { from: `${y}-01-01`, to: t };
  if (p === 'all') {
    const keys = [...Object.values(S.data.tasks).map(x => x.createdAt && tsKey(x.createdAt)), ...Object.values(S.data.campaigns).map(c => c.startDate)].filter(Boolean).sort();
    return { from: keys[0] && keys[0] < t ? keys[0] : addDays(t, -29), to: t };
  }
  return { from: addDays(t, -(+p - 1)), to: t };
}
// The same-length window just before, for "vs previous period" deltas.
const dbPrev = r => { const n = dayDiff(r.from, r.to) + 1; return { from: addDays(r.from, -n), to: addDays(r.from, -1) }; };
const inRange = (k, r) => !!k && k >= r.from && k <= r.to;
const pct = (a, b) => (b ? Math.round((a / b) * 100) : null);
const fmtN = n => (n >= 10000 ? (n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '') + 'K' : n.toLocaleString());
// Time buckets for the over-time charts: days for a week or two, weeks up to ~4 months, then months.
function dbBuckets(r) {
  const n = dayDiff(r.from, r.to) + 1, out = [];
  if (n <= 14) { for (let i = 0; i < n; i++) { const d = addDays(r.from, i); out.push({ from: d, to: d, label: `${parseKey(d).getDate()} ${MON[parseKey(d).getMonth()]}`, tip: longDay(d) }); } return out; }
  if (n <= 126) {
    for (let w = weekOf(r.from); w <= r.to; w = addDays(w, 7)) {
      const f = w < r.from ? r.from : w, e = addDays(w, 6) > r.to ? r.to : addDays(w, 6);
      out.push({ from: f, to: e, label: fmtDay(w).replace(/ \d{4}$/, ''), tip: `Week of ${fmtDay(w)}` });
    }
    return out;
  }
  let [y, m] = r.from.split('-').map(Number);
  for (;;) {
    const f = `${y}-${pad(m)}-01`; if (f > r.to) break;
    const e = `${y}-${pad(m)}-${pad(daysIn(y, m - 1))}`;
    out.push({ from: f < r.from ? r.from : f, to: e > r.to ? r.to : e, label: `${MON[m - 1]}${m === 1 ? ' ' + String(y).slice(2) : ''}`, tip: `${MONTHS[m - 1]} ${y}` });
    if (++m > 12) { m = 1; y++; }
  }
  return out;
}

/* ---------- metrics ---------- */
function taskMetrics(r, pid) {
  const today = todayKey();
  const all = Object.values(S.data.tasks).filter(t => pid === 'all' || t.projectId === pid);
  const completions = [];   // { t, at } - recurring tasks count every time they're ticked off
  all.forEach(t => {
    if (t.recur) (t.doneLog && t.doneLog.length ? t.doneLog : t.lastDoneAt ? [t.lastDoneAt] : []).forEach(at => completions.push({ t, at, k: tsKey(at) }));
    if (t.done && t.completedAt) completions.push({ t, at: t.completedAt, k: tsKey(t.completedAt) });
  });
  const doneIn = rr => completions.filter(c => inRange(c.k, rr));
  const createdIn = rr => all.filter(t => t.createdAt && inRange(tsKey(t.createdAt), rr));
  const prev = dbPrev(r);
  const done = doneIn(r), created = createdIn(r);
  // completion rate: one-off tasks that fell due in the period (up to today) - how many got done
  const dueEnd = r.to < today ? r.to : today;
  const due = all.filter(t => !t.recur && t.due && t.due >= r.from && t.due <= dueEnd);
  const dueDone = due.filter(t => t.done);
  // on time: one-off tasks finished in the period that had a due date, finished on or before it
  const timed = done.filter(c => !c.t.recur && c.t.due);
  const onTime = timed.filter(c => c.k <= c.t.due);
  // typical time to finish (median days from added to done)
  const spans = done.filter(c => !c.t.recur && c.t.createdAt && !c.t.createdApprox).map(c => Math.max(0, (c.at - c.t.createdAt) / 864e5)).sort((a, b) => a - b);
  const median = spans.length ? spans[Math.floor(spans.length / 2)] : null;
  const open = all.filter(t => !t.done && !inArchivedProject(t));
  const overdue = open.filter(t => t.due && t.due < today);
  const next7 = open.filter(t => t.due && t.due >= today && t.due <= addDays(today, 6));
  const buckets = dbBuckets(r).map(b => ({ ...b,
    created: created.filter(t => inRange(tsKey(t.createdAt), b)).length,
    done: done.filter(c => inRange(c.k, b)).length }));
  const prio = [1, 2, 3, 4].map(p => ({ p, n: open.filter(t => (t.priority || 4) === p).length }));
  const groupOf = t => { const p = S.data.projects[t.projectId] || {}; return p.kind === 'client' ? 'g-clients' : p.kind === 'system' ? 'g-steps' : t.projectId; };
  const rolled = [{ id: 'g-clients', name: 'Brand lists (all brands)', color: 'teal' }, { id: 'g-steps', name: 'Brief workflow steps', color: 'purple' }].filter(g => pid === 'all' && all.some(t => groupOf(t) === g.id));
  const projs = [...Object.values(S.data.projects).filter(p => isList(p) && (pid === 'all' ? !p.archived : p.id === pid)).sort(byOrder), ...rolled].map(p => {
    const mine = t => groupOf(t) === p.id;
    const ts = all.filter(mine);
    const pDue = due.filter(mine);
    return { id: p.id, name: p.name, color: p.color, open: open.filter(mine).length,
      done: done.filter(c => mine(c.t)).length, created: created.filter(mine).length,
      overdue: overdue.filter(mine).length, rate: pct(pDue.filter(t => t.done).length, pDue.length), total: ts.length };
  });
  const ppl = [...people(), { id: null, name: 'Unassigned' }].map(p => ({ name: p.name, color: p.color,
    open: open.filter(t => (t.assignee || null) === p.id).length, done: done.filter(c => (c.t.assignee || null) === p.id).length,
    overdue: overdue.filter(t => (t.assignee || null) === p.id).length })).filter(x => x.open || x.done);
  return { done: done.length, donePrev: doneIn(prev).length, created: created.length, createdPrev: createdIn(prev).length,
    due: due.length, dueDone: dueDone.length, rate: pct(dueDone.length, due.length),
    timed: timed.length, onTime: onTime.length, onTimeRate: pct(onTime.length, timed.length),
    median, open: open.length, overdue: overdue.length, next7: next7.length, recurring: all.filter(t => t.recur && !inArchivedProject(t)).length,
    buckets, prio, projs, ppl };
}

const launched = c => c.status !== 'Pending';
const flightIn = (c, r) => !!c.startDate && c.startDate <= r.to && (c.endDate || '9999-12-31') >= r.from;
function campaignMetrics(r, acc) {
  const today = todayKey(), prev = dbPrev(r);
  const camps = Object.values(S.data.campaigns).filter(c => (acc === 'all' || c.accountId === acc));
  const running = camps.filter(c => launched(c) && flightIn(c, r));
  const wentLive = rr => camps.filter(c => launched(c) && inRange(c.startDate, rr));
  const live = wentLive(r);
  const ended = camps.filter(c => c.status === 'Ended' && inRange(c.endDate, r));
  const liveNow = camps.filter(c => c.status === 'Live' && !c.archived);
  const pendingNow = camps.filter(c => c.status === 'Pending' && !c.archived);
  const attention = camps.filter(c => !c.archived && needsAttention(c));
  // platforms & objectives used by campaigns that ran in the period
  const count = (list, key) => { const m = {}; list.forEach(c => key(c).forEach(v => { m[v] = (m[v] || 0) + 1; })); return m; };
  const pf = count(running, c => c.platforms || []);
  const pfPaused = count(running, c => (c.platforms || []).filter(p => platformPaused(c, p)));
  const platforms = Object.entries(pf).map(([name, n]) => ({ name, n, paused: pfPaused[name] || 0 }))
    .sort((a, b) => b.n - a.n || PLATFORMS.indexOf(a.name) - PLATFORMS.indexOf(b.name));
  const ob = count(running, c => [...new Set(liveObjectives(c).map(objFull))]);
  let objectives = Object.entries(ob).map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
  const nObjectives = objectives.length;
  if (objectives.length > 8) { const rest = objectives.slice(7); objectives = [...objectives.slice(0, 7), { name: `${rest.length} others`, n: rest.reduce((s, x) => s + x.n, 0), other: true }]; }
  const mk = count(running, c => c.markets || []);
  const markets = Object.entries(mk).map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n || MARKETS.indexOf(a.name) - MARKETS.indexOf(b.name));
  // health of what ran: "Pending" means not assessed yet and is left out of the rates
  const rated = (key, good) => { const a = running.filter(c => c[key] && c[key] !== 'Pending'); return { n: a.length, good: a.filter(c => c[key] === good).length, rate: pct(a.filter(c => c[key] === good).length, a.length) }; };
  const results = rated('results', 'Healthy'), pacing = rated('pacing', 'Healthy');
  const creative = { n: running.length, good: running.filter(c => (c.creative || 'All Live') === 'All Live').length };
  creative.rate = pct(creative.good, creative.n);
  // weekly check compliance: every finished week a campaign was running (plus this week, once done)
  let wkReq = 0, wkDone = 0;
  running.forEach(c => {
    const done = new Set((c.weeklyChecks || []).map(w => weekOf(w.date)));
    const start = weekOf(c.startDate > r.from ? c.startDate : r.from);
    const lastDay = [c.endDate || today, r.to, today].sort()[0];
    for (let w = start; w <= lastDay; w = addDays(w, 7)) {
      if (w === thisWeek() && !done.has(w)) continue;   // the current week isn't over yet
      wkReq++; if (done.has(w)) wkDone++;
    }
  });
  const dist = key => CT_FIELDS[key].options.map(o => ({ name: o, n: running.filter(c => (c[key] || CT_FIELDS[key].options[0]) === o).length }));
  const pauses = camps.reduce((n, c) => n + (c.pauseLog || []).filter(l => l.action === 'paused' && inRange(l.date, r)).length, 0);
  const pausedNow = liveNow.reduce((n, c) => n + (c.platforms || []).filter(p => platformPaused(c, p)).length, 0);
  const flights = running.filter(c => c.startDate && c.endDate).map(c => dayDiff(c.startDate, c.endDate) + 1);
  const buckets = dbBuckets(r).map(b => ({ ...b, n: running.filter(c => flightIn(c, b)).length, launched: live.filter(c => inRange(c.startDate, b)).length }));
  const accs = Object.values(S.data.accounts).filter(a => (acc === 'all' ? !a.archived : a.id === acc)).sort(byOrder).map(a => {
    const run = running.filter(c => c.accountId === a.id);
    const rr = run.filter(c => c.results && c.results !== 'Pending'), pp = run.filter(c => c.pacing && c.pacing !== 'Pending');
    return { id: a.id, name: a.name, running: run.length, live: live.filter(c => c.accountId === a.id).length,
      results: pct(rr.filter(c => c.results === 'Healthy').length, rr.length), pacing: pct(pp.filter(c => c.pacing === 'Healthy').length, pp.length),
      attention: attention.filter(c => c.accountId === a.id).length, platforms: new Set(run.flatMap(c => c.platforms || [])).size };
  });
  return { total: camps.length, running: running.length, live: live.length, livePrev: wentLive(prev).length, ended: ended.length,
    liveNow: liveNow.length, pendingNow: pendingNow.length, attention: attention.length,
    platforms, nPlatforms: platforms.length, objectives, nObjectives, markets,
    results, pacing, creative, wkReq, wkDone, wkRate: pct(wkDone, wkReq),
    pacingDist: dist('pacing'), resultsDist: dist('results'), creativeDist: dist('creative'),
    pauses, pausedNow, avgFlight: flights.length ? Math.round(flights.reduce((a, b) => a + b, 0) / flights.length) : null,
    buckets, accs };
}
function teamMetrics(r) {
  const out = {};
  Object.values(S.data.events).forEach(ev => {
    const days = eventDays(ev, r.from, r.to).filter(d => ![0, 6].includes(parseKey(d).getDay()));   // working days only
    if (!days.length) return;
    const p = personById(ev.person), who = p ? p.name : 'Whole team', ty = typeById(ev.type).name;
    const o = out[who] = out[who] || { name: who, color: p ? p.color : 'grey', n: 0, types: {} };
    o.n += days.length; o.types[ty] = (o.types[ty] || 0) + days.length;
  });
  return Object.values(out).sort((a, b) => b.n - a.n);
}

/* ---------- pieces ---------- */
// A stat tile: label, value, optional context line and a delta vs the previous period.
function dbTile(label, value, sub = '', delta = null, tip = '') {
  let d = '';
  if (delta && delta.prev != null && value !== '-') {
    const diff = delta.cur - delta.prev;
    const good = delta.upGood === false ? diff < 0 : diff > 0;
    d = diff === 0 ? `<span class="db-delta flat">no change</span>`
      : `<span class="db-delta ${delta.upGood === null ? 'neutral' : good ? 'up' : 'down'}">${diff > 0 ? '▲' : '▼'} ${fmtN(Math.abs(diff))}</span>`;
    d += `<span class="db-vs">vs previous ${delta.days} days</span>`;
  }
  return `<div class="db-tile" ${tip ? `data-tip="${esc(tip)}" tabindex="0"` : ''}><div class="db-l">${esc(label)}</div><div class="db-v">${value}</div>
    ${sub ? `<div class="db-s">${sub}</div>` : ''}${d ? `<div class="db-d">${d}</div>` : ''}</div>`;
}
const rateVal = (r) => (r == null ? '-' : `${r}<small>%</small>`);
function niceMax(v) {
  if (v <= 4) return 4;
  const p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}
// Column chart (one or two series) built from plain HTML so it stays crisp at any width.
function dbColumns(buckets, series, unit) {
  const max = niceMax(Math.max(1, ...buckets.flatMap(b => series.map(s => b[s.key]))));
  const ticks = [0, max / 2, max];
  const every = Math.ceil(buckets.length / 12);
  return `<div class="db-cols" style="--n:${buckets.length}">
      <div class="db-yax">${ticks.map(t => `<span style="bottom:${(t / max) * 100}%">${fmtN(t)}</span>`).join('')}</div>
      <div class="db-plot">${ticks.map(t => `<i class="db-grid" style="bottom:${(t / max) * 100}%"></i>`).join('')}
        ${buckets.map((b, i) => `<div class="db-slot" tabindex="0" data-tip="${esc(b.tip + '\n' + series.map(s => `${b[s.key]} ${s.label.toLowerCase()}`).join('\n'))}">
          <div class="db-bars">${series.map(s => `<span class="db-bar s${s.slot}" style="height:${(b[s.key] / max) * 100}%"></span>`).join('')}</div>
          <em class="${i % every ? 'hide' : ''}">${esc(b.label)}</em></div>`).join('')}
      </div></div>
    ${series.length > 1 ? `<div class="db-legend">${series.map(s => `<span><i class="sw s${s.slot}"></i>${esc(s.label)}</span>`).join('')}</div>` : ''}
    <details class="db-table"><summary>View as table</summary><table><thead><tr><th>${unit}</th>${series.map(s => `<th>${esc(s.label)}</th>`).join('')}</tr></thead>
      <tbody>${buckets.map(b => `<tr><td>${esc(b.tip)}</td>${series.map(s => `<td>${b[s.key]}</td>`).join('')}</tr>`).join('')}</tbody></table></details>`;
}
// Horizontal bar list: label · bar · value (+ a muted note). One series, so no legend.
function dbBarList(rows, { note, empty = 'Nothing in this period.', tip } = {}) {
  if (!rows.length) return `<div class="db-empty">${empty}</div>`;
  const max = Math.max(1, ...rows.map(x => x.n));
  return `<div class="db-list">${rows.map(x => `<div class="db-row" tabindex="0" ${tip ? `data-tip="${esc(tip(x))}"` : ''}>
      <span class="nm">${x.dot ? `<i class="dot sw-${esc(x.dot)}"></i>` : ''}${esc(x.name)}</span>
      <span class="tr"><span class="fill ${x.other ? 'other' : ''}" style="width:${Math.max(x.n ? 2 : 0, (x.n / max) * 100)}%"></span></span>
      <span class="val">${fmtN(x.n)}</span>${note ? `<span class="nt">${note(x) || ''}</span>` : ''}</div>`).join('')}</div>`;
}
// One stacked bar showing how a group splits, with a labelled legend (colour never stands alone).
const DB_TONE = { good: 'st-good', warn: 'st-warn', bad: 'st-crit', mute: 'st-mute', serious: 'st-serious', p1: 'pr-1', p2: 'pr-2', p3: 'pr-3', p4: 'pr-4' };
function dbStack(parts, total, toneOf) {
  if (!total) return '<div class="db-empty">Nothing to show yet.</div>';
  return `<div class="db-stack">${parts.filter(p => p.n).map(p => `<span class="${DB_TONE[toneOf(p.name)] || 'st-mute'}" style="flex:${p.n}" tabindex="0" data-tip="${esc(`${p.n} · ${p.name}\n${pct(p.n, total)}% of ${total}`)}"></span>`).join('')}</div>
    <div class="db-keys">${parts.map(p => `<span class="${p.n ? '' : 'zero'}"><i class="${DB_TONE[toneOf(p.name)] || 'st-mute'}"></i>${esc(p.name)} <b>${p.n}</b></span>`).join('')}</div>`;
}
const pacingTone = v => (v === 'Unstable' ? 'serious' : PACING_TONE[v]);

/* ---------- page ---------- */
function renderDashboard() {
  const f = S.db;
  const r = dbRange(f.period), n = dayDiff(r.from, r.to) + 1;
  const pLabel = (DB_PERIODS.find(p => p[0] === f.period) || DB_PERIODS[1])[1];
  if (f.project !== 'all' && !S.data.projects[f.project]) f.project = 'all';
  if (f.account !== 'all' && !S.data.accounts[f.account]) f.account = 'all';
  const T = taskMetrics(r, f.project), C = campaignMetrics(r, f.account), team = teamMetrics(r);
  // only the dashboards for tools this account uses
  const DBV = [['all', 'Everything', ''], ['process', 'Briefs & workflow', 'briefs'], ['clients', 'Brands', 'brands'], ['campaigns', 'Campaigns', 'campaigns'], ['tasks', 'Tasks', 'lists']].filter(v => toolOn(v[2]));
  if (!DBV.some(v => v[0] === f.view)) f.view = 'all';
  const showCT = ['all', 'campaigns'].includes(f.view) && toolOn('campaigns'), showTasks = ['all', 'tasks'].includes(f.view) && toolOn('lists');
  const sel = (key, opts) => `<select data-dbf="${key}">${opts.map(([v, l]) => `<option value="${esc(v)}" ${f[key] === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
  const delta = (cur, prev, upGood = true) => (f.period === 'all' ? null : { cur, prev, days: n, upGood });

  const tasks = !showTasks ? '' : `
    <section class="db-sec"><div class="db-h"><h2>${ico('check')} Tasks</h2><span class="db-hs">${f.project === 'all' ? 'Projects, brand lists and workflow steps' : esc(S.data.projects[f.project].name)}</span></div>
      <div class="db-tiles c6">
        ${dbTile('Completed', fmtN(T.done), `${T.recurring ? 'repeating tasks count each time' : 'tasks ticked off'}`, delta(T.done, T.donePrev), 'Tasks ticked off in this period. A repeating task counts every time it was done.')}
        ${dbTile('Added', fmtN(T.created), 'new tasks', delta(T.created, T.createdPrev, null), 'Tasks created in this period.')}
        ${dbTile('Completion rate', rateVal(T.rate), T.due ? `${T.dueDone} of ${T.due} due tasks done` : 'no one-off tasks fell due', null, 'Of the one-off tasks that were due in this period (up to today), how many are done.')}
        ${dbTile('On time', rateVal(T.onTimeRate), T.timed ? `${T.onTime} of ${T.timed} finished by their date` : 'no dated tasks finished', null, 'Of the dated tasks finished in this period, how many were finished on or before their due date.')}
        ${dbTile('Open now', fmtN(T.open), `<span class="${T.overdue ? 'warn' : ''}">${T.overdue} overdue</span> · ${T.next7} due in 7 days`)}
        ${dbTile('Typical time to finish', T.median == null ? '-' : T.median < 1 ? '<1<small> day</small>' : `${Math.round(T.median)}<small> day${Math.round(T.median) === 1 ? '' : 's'}</small>`, 'median, added → done', null, 'Median time between a task being added and being ticked off, for one-off tasks finished in this period.')}
      </div>
      <div class="db-card"><div class="db-ch"><h3>Added vs completed</h3><span>${esc(pLabel)}</span></div>
        ${dbColumns(T.buckets, [{ key: 'created', label: 'Added', slot: 1 }, { key: 'done', label: 'Completed', slot: 2 }], n <= 14 ? 'Day' : n <= 126 ? 'Week' : 'Month')}</div>
      <div class="db-grid2">
        <div class="db-card"><div class="db-ch"><h3>Open tasks by list</h3><span>completion rate in period</span></div>
          ${dbBarList(T.projs.map(p => ({ ...p, n: p.open, dot: p.color })), { empty: 'No projects yet.', note: p => (p.rate == null ? '<span class="mut">-</span>' : `${p.rate}%`),
            tip: p => `${p.open} open · ${p.overdue} overdue\n${p.done} completed · ${p.created} added in period\n${p.rate == null ? 'No due tasks in period' : p.rate + '% of due tasks done'}` })}</div>
        <div class="db-card"><div class="db-ch"><h3>Open tasks by priority</h3><span>${T.open} open</span></div>
          ${dbStack(T.prio.map(x => ({ name: `P${x.p}`, n: x.n })), T.open, v => v.toLowerCase())}
          <div class="db-ch" style="margin-top:18px"><h3>By teammate</h3><span>open · done in period</span></div>
          ${dbBarList(T.ppl.map(p => ({ ...p, n: p.open, dot: p.color || 'grey' })), { empty: 'Assign tasks to teammates to see the split.', note: p => `${p.done} done`,
            tip: p => `${p.name}\n${p.open} open · ${p.overdue} overdue\n${p.done} completed in period` })}</div>
      </div>
    </section>`;

  const camps = !showCT ? '' : `
    <section class="db-sec"><div class="db-h"><h2>${ico('campaign')} Campaigns</h2><span class="db-hs">${f.account === 'all' ? 'All accounts' : esc(S.data.accounts[f.account].name)}</span></div>
      ${!C.total ? `<div class="db-card db-empty">No campaigns yet - add some in the Campaign Tracker.</div>` : `
      <div class="db-tiles c4">
        ${dbTile('Running', fmtN(C.running), `${C.liveNow} live now · ${C.pendingNow} pending`, null, 'Campaigns that had launched and whose flight overlapped this period.')}
        ${dbTile('Went live', fmtN(C.live), `${C.ended} ended in period`, delta(C.live, C.livePrev), 'Campaigns whose start date falls in this period (and have launched).')}
        ${dbTile('Platforms used', fmtN(C.nPlatforms), C.pausedNow ? `${C.pausedNow} paused right now` : 'across running campaigns')}
        ${dbTile('Objectives used', fmtN(C.nObjectives), C.avgFlight ? `avg flight ${C.avgFlight} days` : '')}
        ${dbTile('Success rate', rateVal(C.results.rate), C.results.n ? `${C.results.good} of ${C.results.n} rated Healthy` : 'no results rated yet', null, 'Results marked Healthy, out of running campaigns whose results have been assessed (Pending is left out).')}
        ${dbTile('Pacing on track', rateVal(C.pacing.rate), C.pacing.n ? `${C.pacing.good} of ${C.pacing.n} pacing Healthy` : 'no pacing rated yet', null, 'Pacing marked Healthy, out of running campaigns whose pacing has been assessed.')}
        ${dbTile('Weekly checks done', rateVal(C.wkRate), C.wkReq ? `${C.wkDone} of ${C.wkReq} campaign-weeks` : 'none due yet', null, 'For every week a campaign was running in this period, was its weekly optimisation check logged? The current week only counts once it is done.')}
        ${dbTile('Need attention', fmtN(C.attention), C.pauses ? `${C.pauses} pause${C.pauses === 1 ? '' : 's'} logged in period` : 'right now')}
      </div>
      <div class="db-card"><div class="db-ch"><h3>Campaigns running</h3><span>${esc(pLabel)}</span></div>
        ${dbColumns(C.buckets, [{ key: 'n', label: 'Running', slot: 1 }, { key: 'launched', label: 'Went live', slot: 2 }], n <= 14 ? 'Day' : n <= 126 ? 'Week' : 'Month')}</div>
      <div class="db-grid3">
        <div class="db-card"><div class="db-ch"><h3>Platforms</h3><span>campaigns using each</span></div>
          ${dbBarList(C.platforms, { note: x => (x.paused ? `${ico('bars', 'i-xs')}${x.paused} paused` : ''), tip: x => `${x.name}\n${x.n} campaign${x.n === 1 ? '' : 's'}${x.paused ? `\n${x.paused} paused right now` : ''}` })}</div>
        <div class="db-card"><div class="db-ch"><h3>Objectives</h3><span>most used</span></div>
          ${dbBarList(C.objectives, { tip: x => `${x.name}\n${x.n} campaign${x.n === 1 ? '' : 's'}` })}</div>
        <div class="db-card"><div class="db-ch"><h3>Markets</h3><span>campaigns per market</span></div>
          ${dbBarList(C.markets, { tip: x => `${x.name}\n${x.n} campaign${x.n === 1 ? '' : 's'}` })}</div>
      </div>
      <div class="db-card"><div class="db-ch"><h3>Health of running campaigns</h3><span>${C.running} running</span></div>
        <div class="db-health">
          <div><h4>Pacing</h4>${dbStack(C.pacingDist, C.running, pacingTone)}</div>
          <div><h4>Results</h4>${dbStack(C.resultsDist, C.running, v => RESULTS_TONE[v])}</div>
          <div><h4>Creatives</h4>${dbStack(C.creativeDist, C.running, v => CREATIVE_TONE[v])}</div>
        </div></div>
      ${C.accs.length ? `<div class="db-card"><div class="db-ch"><h3>By account</h3><span>${esc(pLabel)}</span></div>
        <div class="db-tw"><table class="db-acc"><thead><tr><th>Account</th><th>Running</th><th>Went live</th><th>Platforms</th><th>Success</th><th>Pacing on track</th><th>Need attention</th></tr></thead>
        <tbody>${C.accs.map(a => `<tr><td><button class="link" data-action="db-acc" data-id="${a.id}">${esc(a.name)}</button></td><td>${a.running}</td><td>${a.live}</td><td>${a.platforms}</td>
          <td>${a.results == null ? '<span class="mut">-</span>' : a.results + '%'}</td><td>${a.pacing == null ? '<span class="mut">-</span>' : a.pacing + '%'}</td>
          <td>${a.attention ? `<span class="warn">${ico('alert', 'i-xs')} ${a.attention}</span>` : '<span class="mut">0</span>'}</td></tr>`).join('')}</tbody></table></div></div>` : ''}`}
    </section>`;

  const teamSec = !showTasks || !team.length ? '' : `
    <section class="db-sec"><div class="db-h"><h2>${ico('people')} Team calendar</h2><span class="db-hs">working days on the calendar</span></div>
      <div class="db-card">${dbBarList(team.map(x => ({ ...x, dot: x.color || 'grey' })), { note: x => Object.entries(x.types).map(([k, v]) => `${v} ${esc(k)}`).join(' · '),
        tip: x => `${x.name}\n${Object.entries(x.types).map(([k, v]) => `${v} day${v === 1 ? '' : 's'} ${k}`).join('\n')}` })}</div>
    </section>`;

  return topbar('') + `<div class="content"><div class="db">
    <div class="page-head" style="padding-bottom:10px"><h1>Dashboard</h1><div class="page-desc empty" style="cursor:default">${esc(pLabel)} · ${esc(fmtDay(r.from))} - ${esc(fmtDay(r.to))}</div></div>
    <div class="db-filters">
      <div class="seg">${DBV.map(([v, l]) => `<button class="${f.view === v ? 'on' : ''}" data-action="db-view" data-v="${v}">${l}</button>`).join('')}</div>
      <label class="filt on">${ico('cal', 'i-sm')}${sel('period', DB_PERIODS)}</label>
      ${showTasks ? `<label class="filt ${f.project !== 'all' ? 'on' : ''}">List${sel('project', [['all', 'All'], ...projects().map(p => [p.id, p.name]), ...clients().map(h => [h.id, 'Brand · ' + h.name])])}</label>` : ''}
      ${showCT ? `<label class="filt ${f.account !== 'all' ? 'on' : ''}">Ad account${sel('account', [['all', 'All'], ...accounts().map(a => [a.id, a.name])])}</label>` : ''}
    </div>
    ${['all', 'process'].includes(f.view) && toolOn('briefs') ? processSection(r, n, pLabel, delta) : ''}${['all', 'clients'].includes(f.view) && toolOn('brands') ? clientsSection(r) : ''}${camps}${tasks}${teamSec}
  </div></div>`;
}
// One floating tooltip for every chart mark, tile and row on the dashboard (text only, never HTML).
let dbTipEl = null;
function dbTipShow(el) {
  if (!dbTipEl) { dbTipEl = document.createElement('div'); dbTipEl.className = 'db-tip'; document.body.appendChild(dbTipEl); }
  const [first, ...rest] = el.dataset.tip.split('\n');
  dbTipEl.textContent = '';
  const b = document.createElement('b'); b.textContent = first; dbTipEl.appendChild(b);
  rest.forEach(line => { const d = document.createElement('div'); d.textContent = line; dbTipEl.appendChild(d); });
  dbTipEl.style.display = 'block';
  const r = el.getBoundingClientRect(), w = dbTipEl.offsetWidth, h = dbTipEl.offsetHeight;
  let x = r.left + r.width / 2 - w / 2, y = r.top - h - 8;
  if (y < 8) y = r.bottom + 8;
  x = Math.max(8, Math.min(innerWidth - w - 8, x));
  dbTipEl.style.left = x + 'px'; dbTipEl.style.top = y + 'px';
}
const dbTipHide = () => { if (dbTipEl) dbTipEl.style.display = 'none'; };
document.addEventListener('pointerover', e => { const el = e.target.closest && e.target.closest('.db [data-tip]'); if (el) dbTipShow(el); else dbTipHide(); });
document.addEventListener('focusin', e => { const el = e.target.closest && e.target.closest('.db [data-tip]'); if (el) dbTipShow(el); });
document.addEventListener('focusout', dbTipHide);
window.addEventListener('scroll', dbTipHide, true);
window.addEventListener('hashchange', dbTipHide);
document.addEventListener('change', e => {
  const s = e.target.closest('[data-dbf]'); if (!s) return;
  S.db[s.dataset.dbf] = s.value; lsSet('tb:db', JSON.stringify(S.db)); dbTipHide(); render({ mainOnly: true });
});


/* =====================================================================
   NOTEBOOK - rich-text notes for meetings and everything else.
   Sectioned by the same accounts as the Campaign Tracker (plus "General"),
   with a note list on the left and the editor on the right.
   ===================================================================== */
const NB = { timer: 0, dirty: false, id: null, fresh: null, open: null };
const NB_ALLOWED = new Set(['P', 'DIV', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'DEL', 'H1', 'H2', 'H3', 'UL', 'OL', 'LI',
  'BLOCKQUOTE', 'PRE', 'CODE', 'A', 'MARK', 'HR', 'SPAN', 'SUB', 'SUP']);
const NB_DROP = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH', 'TEMPLATE', 'LINK', 'META', 'TITLE', 'NOSCRIPT', 'FORM', 'INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'VIDEO', 'AUDIO', 'IMG', 'CANVAS']);
// Notes are shared with everyone in the workspace, so whatever is stored or pasted is cleaned to a
// short list of formatting tags first: no scripts, no styles, no event handlers, only web/mail links.
function cleanHTML(html) {
  const doc = new DOMParser().parseFromString(`<div>${html || ''}</div>`, 'text/html');
  const walk = el => {
    [...el.childNodes].forEach(n => {
      if (n.nodeType === 3) return;
      if (n.nodeType !== 1) { n.remove(); return; }
      if (NB_DROP.has(n.tagName)) { n.remove(); return; }
      walk(n);
      if (!NB_ALLOWED.has(n.tagName)) { n.replaceWith(...n.childNodes); return; }
      [...n.attributes].forEach(a => {
        const k = a.name, t = n.tagName;
        const keep = (t === 'A' && k === 'href' && /^(https?:|mailto:)/i.test(a.value.trim()))
          || (t === 'UL' && k === 'class' && a.value === 'nb-check')
          || (t === 'LI' && (k === 'data-done' || k === 'data-task'));
        if (!keep) n.removeAttribute(k);
      });
      if (n.tagName === 'A') { n.setAttribute('target', '_blank'); n.setAttribute('rel', 'noopener noreferrer'); }
    });
  };
  const root = doc.body.firstChild; walk(root);
  return root.innerHTML;
}
const htmlText = html => { const d = new DOMParser().parseFromString(`<div>${html || ''}</div>`, 'text/html'); d.querySelectorAll('p,div,li,h1,h2,h3,blockquote,pre,br').forEach(e => e.append('\n')); return d.body.textContent.replace(/\n{3,}/g, '\n\n').trim(); };
const wordCount = t => (t.match(/\S+/g) || []).length;
function nbWhen(ts) {
  if (!ts) return '';
  const k = tsKey(ts), d = new Date(ts);
  if (k === todayKey()) { let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}:${pad(d.getMinutes())} ${ap}`; }
  if (k === addDays(todayKey(), -1)) return 'Yesterday';
  return fmtDay(k);
}

/* ---------- templates ---------- */
const NB_TEMPLATES = {
  meeting: { label: 'Meeting notes', icon: 'people', title: () => `Meeting - ${fmtDay(todayKey())}`,
    html: () => `<p><b>Date:</b> ${esc(longDay(todayKey()))}</p><p><b>Attendees:</b> </p><h2>Agenda</h2><ul><li><br></li></ul><h2>Notes</h2><p><br></p><h2>Action items</h2><ul class="nb-check"><li><br></li></ul><h2>Next steps</h2><p><br></p>` },
  call: { label: 'Client call recap', icon: 'comment', title: () => `Client call - ${fmtDay(todayKey())}`,
    html: () => `<p><b>Client:</b> </p><p><b>On the call:</b> </p><h2>What they asked for</h2><ul><li><br></li></ul><h2>Performance discussed</h2><p><br></p><h2>Decisions</h2><ul><li><br></li></ul><h2>Follow-ups</h2><ul class="nb-check"><li><br></li></ul>` },
  brief: { label: 'Campaign brief', icon: 'campaign', title: () => 'Campaign brief',
    html: () => `<h2>Objective</h2><p><br></p><h2>Markets</h2><p><br></p><h2>Platforms &amp; objectives</h2><ul><li><br></li></ul><h2>Budget &amp; flight</h2><p><b>Budget:</b> </p><p><b>Flight:</b> </p><h2>KPIs</h2><ul><li><br></li></ul><h2>Creatives</h2><p><br></p><h2>Open questions</h2><ul class="nb-check"><li><br></li></ul>` },
};

/* ---------- selectors ---------- */
function nbTab() {
  const t = S.nb.tab;
  if (t !== 'all' && t !== 'general' && !(S.data.accounts[t] && !S.data.accounts[t].archived)) { S.nb.tab = 'all'; lsSet('tb:nbTab', 'all'); }
  return S.nb.tab;
}
const nbAccOf = n => (n.accountId && S.data.accounts[n.accountId]) || null;
const nbInTab = (n, t) => (t === 'all' ? true : t === 'general' ? !nbAccOf(n) : n.accountId === t);
function nbList() {
  const t = nbTab(), q = S.nb.q.trim().toLowerCase(), tag = S.nb.tag;
  let list = Object.values(S.data.notes).filter(n => nbInTab(n, t));
  if (tag !== 'all') list = list.filter(n => (n.tags || []).includes(tag));
  if (q) list = list.filter(n => `${n.title || ''} ${n.text || ''} ${(n.tags || []).join(' ')}`.toLowerCase().includes(q));
  const by = { updated: (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0), created: (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
    title: (a, b) => (a.title || 'Untitled').localeCompare(b.title || 'Untitled') }[S.nb.sort] || ((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  return list.sort((a, b) => (!!b.pinned - !!a.pinned) || by(a, b));
}
const nbAllTags = () => [...new Set(Object.values(S.data.notes).flatMap(n => n.tags || []))].sort((a, b) => a.localeCompare(b));

/* ---------- page ---------- */
function renderNotebook(r) {
  const tab = nbTab(), note = r.id ? S.data.notes[r.id] : null;
  const accs = accounts();
  const count = t => Object.values(S.data.notes).filter(n => nbInTab(n, t)).length;
  const list = nbList(), tags = nbAllTags();
  if (S.nb.tag !== 'all' && !tags.includes(S.nb.tag)) S.nb.tag = 'all';
  const item = n => {
    const acc = nbAccOf(n), snip = (n.text || '').replace(/\s+/g, ' ').trim().slice(0, 150);
    return `<a class="nb-item ${note && note.id === n.id ? 'on' : ''}" data-go="#/notes/${n.id}" data-nbitem="${n.id}">
      <div class="nb-it">${n.pinned ? ico('pin', 'i-xs') : ''}<b>${esc(n.title || 'Untitled')}</b></div>
      ${snip ? `<div class="nb-sn">${esc(snip)}</div>` : '<div class="nb-sn mut">No text yet</div>'}
      <div class="nb-im"><span>${esc(nbWhen(n.updatedAt || n.createdAt))}</span>${tab === 'all' && acc ? `<span class="nb-ac">${esc(acc.name)}</span>` : ''}
        ${(n.tags || []).slice(0, 3).map(t => `<span class="nb-tg">#${esc(t)}</span>`).join('')}${n.campaignId && S.data.campaigns[n.campaignId] ? `<span class="nb-tg">${ico('campaign', 'i-xs')}</span>` : ''}</div></a>`;
  };
  const newBtns = `<button class="btn btn-primary" data-action="nb-new">${ico('plus', 'i-sm')} New note</button>
    <button class="btn" data-action="nb-tpl-menu" title="Start from a template">${ico('down', 'i-sm')} Templates</button>`;
  return topbar('My Projects /') + `<div class="content nb-content"><div class="nb-wrap ${note ? 'open' : ''}">
    <div class="ct-head nb-head"><h1>Notebook</h1><span class="spacer"></span>${newBtns}</div>
    ${S.missing.has('notes') ? `<div class="ct-banner">${ico('alert')}<div><b>The notebook can't save yet.</b><br>Paste the updated <code>firestore.rules</code> in Firebase → Firestore → Rules → Publish, then reload this page.</div></div>` : ''}
    <div class="ct-tabs nb-tabs">
      <button class="ct-tab ${tab === 'all' ? 'on' : ''}" data-action="nb-tab" data-id="all">All notes <span class="n">${count('all')}</span></button>
      <button class="ct-tab ${tab === 'general' ? 'on' : ''}" data-action="nb-tab" data-id="general">General <span class="n">${count('general')}</span></button>
      ${accs.map(a => `<button class="ct-tab ${tab === a.id ? 'on' : ''}" data-tab="${a.id}" data-action="nb-tab" data-id="${a.id}" title="Drag to reorder">${esc(a.name)} <span class="n">${count(a.id)}</span></button>`).join('')}
      <button class="ct-tab" data-action="nb-add-acc" title="Add account">${ico('plus', 'i-sm')} Account</button>
    </div>
    <div class="nb">
      <aside class="nb-list">
        <div class="nb-lhead">
          <div class="ct-search">${ico('search', 'i-sm')}<input id="nb-q" data-keep value="${esc(S.nb.q)}" placeholder="Search notes" autocomplete="off"></div>
          <div class="nb-lctl">
            <label class="filt">${ico('sort', 'i-sm')}<select data-nbs="sort">${[['updated', 'Last edited'], ['created', 'Date created'], ['title', 'Title']].map(([v, l]) => `<option value="${v}" ${S.nb.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
            ${tags.length ? `<label class="filt ${S.nb.tag !== 'all' ? 'on' : ''}">${ico('tag', 'i-sm')}<select data-nbs="tag"><option value="all">All tags</option>${tags.map(t => `<option value="${esc(t)}" ${S.nb.tag === t ? 'selected' : ''}>#${esc(t)}</option>`).join('')}</select></label>` : ''}
            <span class="nb-cnt">${list.length} note${list.length === 1 ? '' : 's'}</span>
          </div>
        </div>
        <div class="nb-items">${list.map(item).join('') || `<div class="nb-none">${S.nb.q || S.nb.tag !== 'all' ? 'No notes match.' : 'No notes here yet.'}</div>`}</div>
      </aside>
      <section class="nb-edit">${note ? nbEditorHTML(note) : `<div class="nb-empty">${ico('notebook')}<h3>${list.length ? 'Pick a note, or start a new one' : 'Your notebook is empty'}</h3>
        <p>Jot things down in meetings, keep client call recaps, or draft a campaign brief. Notes can sit under an account or in General.</p>
        <div class="nb-tpls"><button class="nb-tpl" data-action="nb-new">${ico('plus')}<b>Blank note</b></button>
          ${Object.entries(NB_TEMPLATES).map(([k, t]) => `<button class="nb-tpl" data-action="nb-new" data-tpl="${k}">${ico(t.icon)}<b>${esc(t.label)}</b></button>`).join('')}</div></div>`}</section>
    </div></div></div>`;
}
const NB_TOOLS = [['h1', 'H1', 'Heading'], ['h2', 'H2', 'Subheading'], '|', ['bold', '<b>B</b>', 'Bold (Ctrl+B)'], ['italic', '<i>I</i>', 'Italic (Ctrl+I)'],
  ['underline', '<u>U</u>', 'Underline (Ctrl+U)'], ['strikeThrough', '<s>S</s>', 'Strikethrough'], ['mark', 'highlight', 'Highlight'], '|',
  ['ul', 'listUl', 'Bulleted list (type "- ")'], ['ol', 'listOl', 'Numbered list (type "1. ")'], ['check', 'checklist', 'Checklist (type "[] ")'], '|',
  ['quote', 'quote', 'Quote (type "> ")'], ['code', 'code', 'Code block'], ['link', 'link', 'Link (Ctrl+K)'], ['hr', 'hr', 'Divider'], '|', ['clear', 'clearf', 'Clear formatting']];
function nbEditorHTML(n) {
  const accs = accounts(true).filter(a => !a.archived || a.id === n.accountId);
  const camps = n.accountId ? campaignsOf(n.accountId, true).filter(c => !c.archived || c.id === n.campaignId) : [];
  const camp = n.campaignId && S.data.campaigns[n.campaignId];
  const words = wordCount(n.text || '');
  return `<div class="nb-ehead">
      <button class="icon-btn nb-back" data-go="#/notes" title="All notes">${ico('left')}</button>
      <label class="filt nb-sel">${ico('campaign', 'i-sm')}<select data-nbf="accountId" title="Account"><option value="">General</option>${accs.map(a => `<option value="${a.id}" ${n.accountId === a.id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></label>
      ${n.accountId ? `<label class="filt nb-sel ${camp ? 'on' : ''}">Campaign<select data-nbf="campaignId"><option value="">None</option>${camps.map(c => `<option value="${c.id}" ${n.campaignId === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>` : ''}
      ${camp ? `<button class="icon-btn" data-action="ct-open" data-id="${camp.id}" title="Open ${esc(camp.name)}">${ico('arrowRight', 'i-sm')}</button>` : ''}
      <span class="spacer"></span>
      <span class="nb-status" id="nb-status">${S.missing.has('notes') ? 'Not saved' : 'Saved'}</span>
      <button class="top-btn" data-action="nb-tasks" title="Turn open checklist items into tasks">${ico('check', 'i-sm')}Send to To-do</button>
      <button class="icon-btn ${n.pinned ? 'on' : ''}" data-action="nb-pin" title="${n.pinned ? 'Unpin' : 'Pin to top'}">${ico('pin')}</button>
      <button class="icon-btn" data-action="nb-more" data-align="right" title="More">${ico('dots')}</button>
    </div>
    <div class="nb-toolbar" role="toolbar" aria-label="Formatting">${NB_TOOLS.map(t => t === '|' ? '<i class="nb-sep"></i>'
      : `<button type="button" data-nbcmd="${t[0]}" title="${esc(t[2])}">${P[t[1]] ? ico(t[1], 'i-sm') : t[1]}</button>`).join('')}</div>
    <div class="nb-scroll">
      <input id="nb-title-${n.id}" class="nb-title" data-keep data-nbtitle="${n.id}" value="${esc(n.title || '')}" placeholder="Title" maxlength="200" autocomplete="off">
      <div class="nb-meta"><span>Created ${esc(fmtDateTime(n.createdAt))}${n.createdBy ? ' by ' + esc(n.createdBy) : ''}</span>
        ${n.updatedAt && n.updatedAt - (n.createdAt || 0) > 60000 ? `<span>· Edited ${esc(timeAgo(n.updatedAt))}${n.updatedBy ? ' by ' + esc(n.updatedBy) : ''}</span>` : ''}</div>
      <div class="nb-tags">${(n.tags || []).map(t => `<span class="nb-chip">#${esc(t)}<button data-nbtagdel="${esc(t)}" title="Remove tag">${ico('x', 'i-xs')}</button></span>`).join('')}
        <input id="nb-tag-${n.id}" data-keep class="nb-tagin" data-nbtag placeholder="${(n.tags || []).length ? 'Add tag' : '+ Add tag'}" maxlength="30" autocomplete="off"></div>
      <div id="nb-editor" class="nb-body" contenteditable="true" spellcheck="true" data-note="${n.id}" data-placeholder="Start writing… type “# ” for a heading, “- ” for bullets or “[] ” for a checklist">${cleanHTML(n.html || '')}</div>
    </div>
    <div class="nb-foot"><span id="nb-words">${words} word${words === 1 ? '' : 's'}</span><span>Ctrl+S saves now · changes save automatically</span></div>`;
}

/* ---------- saving ---------- */
const nbStatus = t => { const el = $('#nb-status'); if (el) el.textContent = t; };
function nbSchedule(id) {
  if (id) NB.id = id;
  NB.dirty = true; nbStatus('Saving…');
  clearTimeout(NB.timer); NB.timer = setTimeout(nbFlush, 700);
}
// Reads the editor synchronously (so it is safe to call right before the page is rebuilt), then saves.
function nbFlush() {
  clearTimeout(NB.timer);
  if (!NB.dirty || !NB.id) return;
  NB.dirty = false;
  const id = NB.id, n = S.data.notes[id]; if (!n) return;
  const ed = $(`#nb-editor[data-note="${id}"]`), ti = $(`#nb-title-${id}`);
  const html = ed ? cleanHTML(ed.innerHTML) : n.html || '';
  const title = ti ? ti.value.trim() : n.title || '';
  const text = htmlText(html).slice(0, 20000);
  if (html === (n.html || '') && title === (n.title || '')) { nbStatus('Saved'); return; }
  if (html.length > 300000) { nbStatus('Too long to save'); toast('This note is too long to save - split it into two notes'); NB.dirty = true; return; }
  if (S.missing.has('notes')) { nbStatus('Not saved'); return; }
  return store.update('notes', id, { title, html, text, updatedAt: Date.now(), updatedBy: me() }).then(() => nbStatus('Saved'));
}
window.addEventListener('beforeunload', () => nbFlush());
document.addEventListener('visibilitychange', () => { if (document.hidden) nbFlush(); });
// Called at the start of every render: drop a brand-new note that was left completely empty,
// and save any pending edits (read from the page before it is rebuilt).
function nbBeforeRender(nextId) {
  if (NB.open && NB.open !== nextId && NB.fresh === NB.open) {
    const id = NB.open, n = S.data.notes[id];
    const ed = $(`#nb-editor[data-note="${id}"]`), ti = $(`#nb-title-${id}`);
    const title = ti ? ti.value.trim() : ((n && n.title) || '').trim();
    const text = ed ? ed.innerText.trim() : ((n && n.text) || '').trim();
    NB.fresh = null;
    if (n && !title && !text) { NB.dirty = false; clearTimeout(NB.timer); store.del('notes', id); }
  }
  if (NB.dirty) nbFlush();
  NB.open = nextId || null;
  if (nextId) NB.id = nextId;
}

/* ---------- actions ---------- */
async function nbNew(tpl) {
  const t = S.nb.tab, T = NB_TEMPLATES[tpl];
  const accountId = t !== 'all' && t !== 'general' ? t : null;
  const html = T ? T.html() : '';
  const n = { id: uid(), accountId, campaignId: null, title: T ? T.title() : '', html, text: htmlText(html), tags: [], pinned: false,
    createdAt: Date.now(), createdBy: me(), updatedAt: Date.now(), updatedBy: me() };
  return nbCreate(n, !T);
}
async function nbCreate(n, focusTitle = true) {
  if (S.missing.has('notes')) return toast('The notebook needs the updated security rules first');
  await store.put('notes', n);
  NB.fresh = n.id;
  go('#/notes/' + n.id);
  setTimeout(() => {
    if (focusTitle) { const ti = $(`#nb-title-${n.id}`); if (ti) ti.focus(); return; }
    const ed = $('#nb-editor'); if (!ed) return;
    ed.focus();
    const first = ed.querySelector('p b'), r = document.createRange();
    if (first && first.parentElement.lastChild) { r.setStartAfter(first.parentElement.lastChild); } else { r.selectNodeContents(ed); r.collapse(false); }
    const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  }, 60);
}
async function nbDelete(id) {
  const n = S.data.notes[id]; if (!n) return;
  nbFlush();
  const live = S.data.notes[id] || n;
  NB.fresh = null;
  if (curNoteId() === id) go('#/notes');
  await trashItems('note', live.title || 'Untitled', [{ col: 'notes', data: live }], nbAccOf(live) ? nbAccOf(live).name : 'General');
}
async function nbDuplicate(id) {
  nbFlush();
  const n = S.data.notes[id]; if (!n) return;
  const copy = { ...clone(n), id: uid(), title: `${n.title || 'Untitled'} (copy)`, pinned: false, createdAt: Date.now(), createdBy: me(), updatedAt: Date.now(), updatedBy: me() };
  await store.put('notes', copy);
  undoable('Note duplicated', `duplicate “${n.title || 'Untitled'}”`, () => store.del('notes', copy.id));
  go('#/notes/' + copy.id);
}
async function nbPin(id) {
  const n = S.data.notes[id]; if (!n) return;
  await store.update('notes', id, { pinned: !n.pinned });
  undoable(n.pinned ? 'Note unpinned' : 'Note pinned to the top', n.pinned ? 'unpin note' : 'pin note', () => store.update('notes', id, { pinned: !!n.pinned }));
}
const curNoteId = () => (S.route && S.route.view === 'notes' ? S.route.id : null);
async function nbSetTags(id, tags) { nbFlush(); await store.update('notes', id, { tags, updatedAt: Date.now(), updatedBy: me() }); }
async function nbAddAccount() {
  const r = await promptBox({ title: 'Add ad account', label: 'Ad account name', placeholder: 'e.g. Meta - UAE', ok: 'Add' });
  if (!r) return;
  const a = { id: uid(), name: r.value, order: nextOrder(accounts(true)), archived: false, createdAt: Date.now(), createdBy: me() };
  await store.put('accounts', a);
  S.nb.tab = a.id; lsSet('tb:nbTab', a.id); render({ mainOnly: true });
}
// Open checklist items → tasks. The project's section with the account's name is used when there is one.
function nbSendTasks(anchor) {
  const ed = $('#nb-editor'), note = ed && S.data.notes[ed.dataset.note]; if (!note) return;
  const firstLine = li => { const c = li.cloneNode(true); c.querySelectorAll('ul,ol').forEach(x => x.remove()); return c.textContent.trim(); };
  const items = [...ed.querySelectorAll('ul.nb-check > li')].filter(li => !li.hasAttribute('data-done') && !li.dataset.task && firstLine(li));
  if (!items.length) return toast('No open checklist items to send - add some with the checklist button (or type “[] ”)');
  const acc = nbAccOf(note);
  openMenu(anchor, [{ title: `Send ${items.length} open item${items.length === 1 ? '' : 's'} to…` }, ...projects().map(p => {
    const sec = acc ? sectionsOf(p.id).find(s => s.name.trim().toLowerCase() === acc.name.trim().toLowerCase()) : null;
    return { label: `${p.name}${sec ? ' / ' + sec.name : ''}`, icon: 'inbox', onClick: () => nbMakeTasks(note.id, items.map(li => ({ li, title: firstLine(li) })), p, sec) };
  })], 'right');
}
async function nbMakeTasks(noteId, items, p, sec) {
  const note = S.data.notes[noteId]; if (!note) return;
  const base = nextOrder(tasksIn(p.id, sec ? sec.id : null, true));
  const ts = items.map((it, i) => newTask({ projectId: p.id, sectionId: sec ? sec.id : null, title: it.title.slice(0, 300),
    description: `From note “${note.title || 'Untitled'}”`, order: base + i * 10, noteId }));
  ts.forEach((t, i) => { items[i].li.dataset.task = t.id; });
  await store.batch(ts.map(t => ({ type: 'put', col: 'tasks', data: t })));
  nbSchedule(noteId); nbFlush();
  const ids = new Set(ts.map(t => t.id));
  undoable(`${ts.length} task${ts.length === 1 ? '' : 's'} added to ${p.name}${sec ? ' / ' + sec.name : ''}`, 'send action items to To-do', async () => {
    await store.batch(ts.map(t => ({ type: 'del', col: 'tasks', id: t.id })));
    const ed = $(`#nb-editor[data-note="${noteId}"]`);
    if (ed) { ed.querySelectorAll('li[data-task]').forEach(li => { if (ids.has(li.dataset.task)) li.removeAttribute('data-task'); }); nbSchedule(noteId); nbFlush(); return; }
    const n = S.data.notes[noteId]; if (!n) return;
    const d = new DOMParser().parseFromString(`<div>${n.html || ''}</div>`, 'text/html');
    d.querySelectorAll('li[data-task]').forEach(li => { if (ids.has(li.dataset.task)) li.removeAttribute('data-task'); });
    await store.update('notes', noteId, { html: cleanHTML(d.body.firstChild.innerHTML) });
  });
}

/* ---------- editor commands ---------- */
const nbEd = () => $('#nb-editor');
// Loose text typed straight into the editor gets wrapped in a paragraph, so headings and lists
// always have a block to work on (browsers otherwise produce odd nesting).
function nbEnsureBlocks() {
  const ed = nbEd(); if (!ed) return;
  document.execCommand('defaultParagraphSeparator', false, 'p');
  const loose = [...ed.childNodes].filter(n => n.nodeType === 3 ? n.textContent.length : n.nodeType === 1 && !/^(P|DIV|H1|H2|H3|UL|OL|BLOCKQUOTE|PRE|HR)$/.test(n.tagName));
  if (!loose.length) return;
  const s = getSelection(); const keep = s.rangeCount ? [s.anchorNode, s.anchorOffset] : null;
  let p = null;
  [...ed.childNodes].forEach(n => {
    const inline = loose.includes(n);
    if (inline) { if (!p) { p = document.createElement('p'); ed.insertBefore(p, n); } p.appendChild(n); } else p = null;
  });
  if (keep) try { s.setBaseAndExtent(keep[0], keep[1], keep[0], keep[1]); } catch { }
}
function nbClosest(sel) {
  const ed = nbEd(), s = getSelection(); if (!ed || !s.rangeCount) return null;
  let n = s.anchorNode; n = n && n.nodeType === 3 ? n.parentElement : n;
  const el = n && n.closest && n.closest(sel);
  return el && ed.contains(el) && el !== ed ? el : null;
}
function nbBlockToggle(tag) {
  const cur = String(document.queryCommandValue('formatBlock') || '').toUpperCase();
  document.execCommand('formatBlock', false, cur === tag ? 'P' : tag);
}
// Turn the paragraph at the caret into a list item ourselves - browsers' own list command nests
// lists inside paragraphs in some cases. Joins a list of the same kind right above it.
function nbWrapList(tag, check) {
  const s = getSelection(), blk = nbClosest('p,div,h1,h2,h3,blockquote');
  const multi = s.rangeCount && !s.isCollapsed && blk && !blk.contains(s.focusNode);
  if (!blk || multi) {
    document.execCommand(tag === 'OL' ? 'insertOrderedList' : 'insertUnorderedList');
    const l = nbClosest(tag.toLowerCase()); if (l) l.classList.toggle('nb-check', !!check);
    return;
  }
  const list = document.createElement(tag); if (check) list.className = 'nb-check';
  const li = document.createElement('li');
  while (blk.firstChild) li.appendChild(blk.firstChild);
  if (!li.textContent && !li.querySelector('br')) li.appendChild(document.createElement('br'));
  list.appendChild(li);
  const prev = blk.previousElementSibling;
  blk.replaceWith(list);
  if (prev && prev.tagName === tag && prev.classList.contains('nb-check') === !!check) { prev.appendChild(li); list.remove(); }
  const r = document.createRange(); r.selectNodeContents(li); r.collapse(!li.textContent); s.removeAllRanges(); s.addRange(r);
}
function nbChecklist() {
  const ul = nbClosest('ul');
  if (ul && ul.classList.contains('nb-check')) { document.execCommand('insertUnorderedList'); return; }
  if (ul) { ul.classList.add('nb-check'); return; }
  if (nbClosest('ol')) { document.execCommand('insertOrderedList'); }
  nbWrapList('UL', true);
}
function nbBullets() {
  const ul = nbClosest('ul');
  if (ul && ul.classList.contains('nb-check')) { ul.classList.remove('nb-check'); return; }
  if (ul) { document.execCommand('insertUnorderedList'); return; }
  if (nbClosest('ol')) { document.execCommand('insertOrderedList'); }
  nbWrapList('UL', false);
}
function nbNumbers() {
  if (nbClosest('ol')) { document.execCommand('insertOrderedList'); return; }
  if (nbClosest('ul')) { document.execCommand('insertUnorderedList'); }
  nbWrapList('OL', false);
}
function nbMark() {
  const m = nbClosest('mark'); if (m) { m.replaceWith(...m.childNodes); return; }
  const s = getSelection(); if (!s.rangeCount || s.isCollapsed) return toast('Select some text to highlight');
  const r = s.getRangeAt(0), mk = document.createElement('mark');
  try { mk.appendChild(r.extractContents()); r.insertNode(mk); const nr = document.createRange(); nr.selectNodeContents(mk); s.removeAllRanges(); s.addRange(nr); } catch { }
}
async function nbLink() {
  const ed = nbEd(), s = getSelection();
  const range = s.rangeCount && ed.contains(s.anchorNode) ? s.getRangeAt(0).cloneRange() : null;
  const a = nbClosest('a');
  const r = await promptBox({ title: a ? 'Edit link' : 'Add link', label: 'Web link (leave empty to remove)', value: a ? a.getAttribute('href') : '', placeholder: 'https://…', ok: 'Save' });
  ed.focus();
  if (range) { s.removeAllRanges(); s.addRange(range); }
  if (!r) return;
  if (!r.value.trim()) { if (a) { const rr = document.createRange(); rr.selectNodeContents(a); s.removeAllRanges(); s.addRange(rr); } document.execCommand('unlink'); nbSchedule(); return; }
  const u = /^mailto:/i.test(r.value.trim()) ? r.value.trim() : cleanUrl(r.value);
  if (!u) return toast('That doesn’t look like a web link');
  if (a) a.setAttribute('href', u);
  else if (!range || range.collapsed) document.execCommand('insertHTML', false, `<a href="${esc(u)}">${esc(u.replace(/^https?:\/\//, ''))}</a>&nbsp;`);
  else document.execCommand('createLink', false, u);
  nbSchedule();
}
function nbCmd(cmd) {
  const ed = nbEd(); if (!ed) return;
  if (document.activeElement !== ed && !ed.contains(document.activeElement)) {
    ed.focus(); const r = document.createRange(); r.selectNodeContents(ed); r.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  }
  nbEnsureBlocks();
  switch (cmd) {
    case 'h1': case 'h2': case 'h3': nbBlockToggle(cmd.toUpperCase()); break;
    case 'bold': case 'italic': case 'underline': case 'strikeThrough': document.execCommand(cmd); break;
    case 'ul': nbBullets(); break;
    case 'ol': nbNumbers(); break;
    case 'check': nbChecklist(); break;
    case 'quote': nbBlockToggle('BLOCKQUOTE'); break;
    case 'code': nbBlockToggle('PRE'); break;
    case 'hr': document.execCommand('insertHorizontalRule'); break;
    case 'mark': nbMark(); break;
    case 'link': nbLink(); return;
    case 'clear': document.execCommand('removeFormat'); document.execCommand('formatBlock', false, 'P'); break;
  }
  nbSchedule(ed.dataset.note); nbToolState();
}
// Light up the toolbar buttons that match where the caret is.
function nbToolState() {
  const bar = $('.nb-toolbar'); if (!bar || !nbEd()) return;
  const block = String(document.queryCommandValue('formatBlock') || '').toLowerCase();
  const ul = nbClosest('ul'), on = {
    h1: block === 'h1', h2: block === 'h2', quote: block === 'blockquote', code: block === 'pre',
    bold: document.queryCommandState('bold'), italic: document.queryCommandState('italic'), underline: document.queryCommandState('underline'),
    strikeThrough: document.queryCommandState('strikeThrough'), mark: !!nbClosest('mark'), link: !!nbClosest('a'),
    ul: !!ul && !ul.classList.contains('nb-check'), check: !!ul && ul.classList.contains('nb-check'), ol: !!nbClosest('ol') };
  $$('[data-nbcmd]', bar).forEach(b => b.classList.toggle('on', !!on[b.dataset.nbcmd]));
}
// Markdown-style shortcuts at the start of a line, the way most note apps do it.
const NB_MD = { '#': 'h1', '##': 'h2', '###': 'h3', '-': 'ul', '*': 'ul', '1.': 'ol', '[]': 'check', '[ ]': 'check', '>': 'quote', '```': 'code' };
function nbShortcut(e) {
  const ed = nbEd(), s = getSelection(); if (!s.rangeCount || !s.isCollapsed) return false;
  if (nbClosest('li') || nbClosest('pre')) return false;
  nbEnsureBlocks();
  const blk = nbClosest('p,div,h1,h2,h3,blockquote'); if (!blk) return false;
  const r = document.createRange(); r.setStart(blk, 0); r.setEnd(s.anchorNode, s.anchorOffset);
  const cmd = NB_MD[r.toString()];
  if (!cmd) return false;
  e.preventDefault();
  r.deleteContents();
  if (!blk.textContent && !blk.querySelector('br')) blk.appendChild(document.createElement('br'));
  const c = document.createRange(); c.setStart(blk, 0); c.collapse(true); s.removeAllRanges(); s.addRange(c);
  nbCmd(cmd);
  return true;
}


/* ---------- archive ---------- */
function renderArchive() {
  const ps = archivedProjects();
  const accs = Object.values(S.data.accounts).filter(a => a.archived).sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0));
  const camps = Object.values(S.data.campaigns).filter(c => c.archived).sort((a, b) => (b.archivedAt || b.updatedAt || 0) - (a.archivedAt || a.updatedAt || 0));
  const when = x => x.archivedAt ? `Archived ${timeAgo(x.archivedAt)}` : 'Archived';
  const row = (icon, title, meta, btns) => `<div class="arc-row">${icon}<div class="arc-main"><div class="arc-title">${title}</div><div class="arc-meta">${meta}</div></div><div class="arc-btns">${btns}</div></div>`;
  const secs = archivedSections(), tks = archivedTasks();
  const total = ps.length + secs.length + tks.length + accs.length + camps.length;
  const pName = id => (S.data.projects[id] || {}).name || 'Deleted project';
  return topbar('') + `<div class="content"><div class="list">
    <div class="page-head"><h1>Archive</h1><div class="page-desc empty" style="cursor:default">Projects, sections, tasks, accounts and campaigns you've put away. Nothing here is deleted - restore any of it in one click.</div></div>
    ${!total ? `<div class="empty-state">${ico('archive')}<br>Nothing archived.<br><span style="font-size:12px">Archive a project or section from its ••• menu, a task by right-clicking it (or from inside it), or a campaign or account from its menu.</span></div>` : ''}
    ${ps.length ? `<div class="group-head">Projects <span class="cnt">${ps.length}</span></div>${ps.map(p => {
      const n = Object.values(S.data.tasks).filter(t => t.projectId === p.id && !t.done).length;
      return row(`<span class="arc-ico tx-${esc(p.color || 'grey')}">#</span>`, esc(p.name), `${when(p)} · ${n} open task${n === 1 ? '' : 's'} · ${sectionsOf(p.id).length} section${sectionsOf(p.id).length === 1 ? '' : 's'}`,
        `<button class="btn" data-go="#/project/${p.id}">Open</button><button class="btn btn-primary" data-action="arc-restore" data-kind="project" data-id="${p.id}">Restore</button><button class="icon-btn" data-action="arc-del" data-kind="project" data-id="${p.id}" title="Delete">${ico('trash', 'i-sm')}</button>`);
    }).join('')}` : ''}
    ${secs.length ? `<div class="group-head">Sections <span class="cnt">${secs.length}</span></div>${secs.map(s => {
      const n = Object.values(S.data.tasks).filter(t => t.sectionId === s.id && !t.done).length;
      return row(`<span class="arc-ico">${ico('menu', 'i-sm')}</span>`, esc(s.name), `${esc(pName(s.projectId))} · ${when(s)} · ${n} open task${n === 1 ? '' : 's'}`,
        `<button class="btn btn-primary" data-action="arc-restore" data-kind="section" data-id="${s.id}">Restore</button><button class="icon-btn" data-action="arc-del" data-kind="section" data-id="${s.id}" title="Delete">${ico('trash', 'i-sm')}</button>`);
    }).join('')}` : ''}
    ${tks.length ? `<div class="group-head">Tasks <span class="cnt">${tks.length}</span></div>${tks.map(t => {
      const s = t.sectionId && S.data.sections[t.sectionId];
      return row(`<span class="arc-ico">${ico('check', 'i-sm')}</span>`, esc(t.title), `${esc(pName(t.projectId))}${s ? ' / ' + esc(s.name) : ''} · ${when(t)}${t.done ? ' · completed' : ''}`,
        `<button class="btn" data-action="open-task" data-id="${t.id}">Open</button><button class="btn btn-primary" data-action="arc-restore" data-kind="task" data-id="${t.id}">Restore</button><button class="icon-btn" data-action="arc-del" data-kind="task" data-id="${t.id}" title="Delete">${ico('trash', 'i-sm')}</button>`);
    }).join('')}` : ''}
    ${accs.length ? `<div class="group-head">Campaign accounts <span class="cnt">${accs.length}</span></div>${accs.map(a => {
      const n = Object.values(S.data.campaigns).filter(c => c.accountId === a.id).length;
      return row(`<span class="arc-ico">${ico('campaign', 'i-sm')}</span>`, esc(a.name), `${when(a)} · ${n} campaign${n === 1 ? '' : 's'}`,
        `<button class="btn" data-action="arc-open-acc" data-id="${a.id}">Open</button><button class="btn btn-primary" data-action="arc-restore" data-kind="account" data-id="${a.id}">Restore</button><button class="icon-btn" data-action="arc-del" data-kind="account" data-id="${a.id}" title="Delete">${ico('trash', 'i-sm')}</button>`);
    }).join('')}` : ''}
    ${camps.length ? `<div class="group-head">Campaigns <span class="cnt">${camps.length}</span></div>${camps.map(c =>
      row(`<span class="arc-ico">${ico('campaign', 'i-sm')}</span>`, esc(c.name), `${esc(accName(c.accountId))} · ${when(c)} · ${esc(c.status)}`,
        `<button class="btn" data-action="ct-open" data-id="${c.id}">Open</button><button class="btn btn-primary" data-action="arc-restore" data-kind="campaign" data-id="${c.id}">Restore</button><button class="icon-btn" data-action="arc-del" data-kind="campaign" data-id="${c.id}" title="Delete">${ico('trash', 'i-sm')}</button>`)).join('')}` : ''}
  </div></div>`;
}

/* ---------- recently deleted ---------- */
const TRASH_ICON = { note: 'notebook', task: 'check', section: 'menu', project: 'inbox', campaign: 'campaign', account: 'campaign', event: 'cal' };
const TRASH_KIND = { note: 'Note', task: 'Task', section: 'Section', project: 'Project', campaign: 'Campaign', account: 'Campaign account', event: 'Calendar entry' };
function renderTrash() {
  const groups = trashGroups();
  return topbar('', groups.length ? `<button class="top-btn" data-action="trash-empty">${ico('trash', 'i-sm')}Empty</button>` : '') + `<div class="content"><div class="list">
    <div class="page-head"><h1>Recently deleted</h1><div class="page-desc empty" style="cursor:default">Deleted tasks, sections, projects, campaigns and calendar entries stay here for ${TRASH_DAYS} days, then they're removed for good.</div></div>
    ${S.missing.has('trash') ? `<div class="ct-banner">${ico('alert')}<div><b>Recently deleted needs the updated security rules.</b><br>Until they're published, deleting is immediate (you can still undo right away with Ctrl+Z). Paste the new <code>firestore.rules</code> in Firebase → Firestore → Rules → Publish, then reload.</div></div>` : ''}
    ${!groups.length ? `<div class="empty-state">${ico('trash')}<br>Nothing here.<br><span style="font-size:12px">Anything you delete shows up here for ${TRASH_DAYS} days.</span></div>` : ''}
    ${groups.map(({ head, items }) => {
      const left = daysLeft(head);
      return `<div class="arc-row"><span class="arc-ico">${ico(TRASH_ICON[head.kind] || 'trash', 'i-sm')}</span>
        <div class="arc-main"><div class="arc-title">${esc(head.label)}</div>
          <div class="arc-meta">${esc(TRASH_KIND[head.kind] || 'Item')}${head.context ? ' · ' + esc(head.context) : ''} · deleted ${timeAgo(head.deletedAt)}${head.deletedBy ? ' by ' + esc(head.deletedBy) : ''} · <span class="${left <= 3 ? 'soon' : ''}">${left === 0 ? 'removed today' : `${left} day${left === 1 ? '' : 's'} left`}</span></div></div>
        <div class="arc-btns"><button class="btn btn-primary" data-action="trash-restore" data-id="${head.groupId}">Restore</button>
          <button class="icon-btn" data-action="trash-purge" data-id="${head.groupId}" title="Delete forever">${ico('x', 'i-sm')}</button></div></div>`;
    }).join('')}
  </div></div>`;
}
const topbar = (crumb, right = '') => `<div class="topbar"><button class="icon-btn menu-toggle" data-action="open-nav">${ico('menu')}</button><span class="crumb">${crumb}</span><span class="spacer"></span>${right}</div>`;

/* ---------- task card pieces ---------- */
function taskMeta(t, opts = {}) {
  const bits = [];
  if (t.due) {
    const d = dueInfo(t.due);
    bits.push(`<span class="${d.cls}">${ico('cal')}${esc(d.label)}${t.time ? ' ' + esc(t.time) : ''}${t.recur ? ico('repeat') : ''}</span>`);
  } else if (t.recur) bits.push(`<span>${ico('repeat')}</span>`);
  if (t.deadline) { const d = deadlineInfo(t.deadline); bits.push(`<span class="${d.cls}" title="Deadline">${ico('target')}${esc(d.label)}</span>`); }
  const subs = t.subtasks || [];
  if (subs.length) bits.push(`<span title="Sub-tasks">${ico('sub')}${subs.filter(s => s.done).length}/${subs.length}</span>`);
  if ((t.comments || []).length) bits.push(`<span title="Comments">${ico('comment')}${t.comments.length}</span>`);
  if (opts.where) bits.push(opts.where);
  const hs = clientIdsOf(t).filter(id => id !== (S.route && S.route.view === 'client' ? S.route.id : null));
  if (hs.length) bits.push(`<span class="chips-inline">${clientChips(hs, 1)}</span>`);
  if ((t.labels || []).length) bits.push(`<span class="chips-inline">${labelChips(t.labels)}</span>`);
  if (t.briefId && !opts.noStatus && t.status && !['To do', 'Done'].includes(t.status)) bits.push(`<span class="pill sm tone-${STEP_TONE[t.status]}">${ico(STEP_ICON[t.status], 'i-xs')}${esc(t.status)}</span>`);
  const p = !opts.noAssignee && t.assignee && personById(t.assignee);
  if (p) bits.push(`<span class="assignee" title="${esc(p.name)}"><span class="avatar sm sw-${esc(p.color || 'grey')}">${esc(initials(p.name))}</span></span>`);
  return bits.length ? `<div class="meta">${bits.join('')}</div>` : '';
}
const checkBtn = t => `<button class="check p${t.priority || 4} ${t.done ? 'checked' : ''}" data-action="toggle-task" data-id="${t.id}" title="${t.done ? 'Mark as not done' : 'Complete'}">${ico('check')}</button>`;
// Progress of a task's sub-tasks - a thin bar on cards and rows, a fuller one inside the task.
function subProgress(t) { const s = t.subtasks || []; const n = s.filter(x => x.done).length; return { n, total: s.length, pct: s.length ? Math.round((n / s.length) * 100) : 0 }; }
function subBar(t) {
  const p = subProgress(t); if (!p.total) return '';
  return `<div class="sp-mini ${p.n === p.total ? 'full' : ''}" title="${p.n} of ${p.total} sub-tasks done (${p.pct}%)"><i style="width:${p.pct}%"></i></div>`;
}
function cardHTML(t) {
  const desc = (t.description || '').trim();
  return `<article class="card ${t.done ? 'done' : ''}" data-task="${t.id}" data-action="open-task" data-id="${t.id}">
    ${checkBtn(t)}
    <div class="card-body"><div class="card-title">${esc(t.title)}</div>${desc ? `<div class="card-desc">${esc(desc)}</div>` : ''}${taskMeta(t)}${subBar(t)}</div>
  </article>`;
}

/* ---------- project board ---------- */
// The board's columns, shared by team lists and client pages.
function boardColumns(p) {
  const secs = sectionsOf(p.id);
  const showDone = !!S.showCompleted[p.id];
  const loose = tasksIn(p.id, null, showDone);
  const cols = [];
  if (loose.length || !secs.length || (S.inlineAdd && S.inlineAdd.sec === '' && S.inlineAdd.pid === p.id)) cols.push(columnHTML(p, null, secs.length ? '(No section)' : 'Tasks', loose));
  secs.forEach(s => cols.push(columnHTML(p, s.id, s.name, tasksIn(p.id, s.id, showDone))));
  cols.push(S.addingSection
    ? `<form class="add-section-form" data-form="add-section"><input id="new-section" data-keep placeholder="Name this section" autofocus maxlength="80"><div class="form-actions" style="border:0;padding-top:0"><button type="button" class="btn" data-action="cancel-section">Cancel</button><button class="btn btn-primary">Add section</button></div></form>`
    : `<button class="add-section" data-action="add-section">${ico('plus')} Add section</button>`);
  return cols.join('');
}
function renderProject(p) {
  const showDone = !!S.showCompleted[p.id];
  const desc = p.description || '';
  return topbar(p.archived ? '<a data-go="#/archive" class="crumb-link">Archive</a> /' : 'My Projects /', `
      <button class="top-btn ${showDone ? 'on' : ''}" data-action="toggle-completed">${ico('check')}${showDone ? 'Hide' : 'Show'} completed</button>
      <button class="icon-btn" data-action="project-menu" data-id="${p.id}" data-align="right">${ico('dots')}</button>`) +
    `<div class="content">${p.archived ? `<div class="ct-banner arc-banner">${ico('archive')}<div style="flex:1"><b>This project is archived.</b> It's hidden from the sidebar, Today and Upcoming.</div><button class="btn btn-primary" data-action="arc-restore" data-kind="project" data-id="${p.id}">Restore</button></div>` : ''}<div class="page-head"><h1 class="editable" data-action="rename-project" data-id="${p.id}">${esc(p.name)}</h1><br>
      <span class="page-desc ${desc ? '' : 'empty'}" data-action="edit-desc" data-id="${p.id}">${esc(desc || 'Add a description')}</span></div>
      <div class="board" id="board">${boardColumns(p)}</div></div>`;
}
function columnHTML(p, sid, name, list) {
  const active = list.filter(t => !t.done).length;
  const secKey = sid || '';
  const isAdding = S.inlineAdd && S.inlineAdd.pid === p.id && S.inlineAdd.sec === secKey;
  return `<section class="col" data-sec="${secKey}">
    <header class="col-head" ${sid ? `data-sechead="${sid}"` : ''} title="${sid ? 'Drag to reorder' : ''}">
      <h3 ${sid ? `data-action="rename-section" data-id="${sid}"` : ''} title="${esc(name)}">${esc(name)}</h3><span class="col-count">${active}</span>
      ${sid ? `<button class="icon-btn" data-action="section-menu" data-id="${sid}">${ico('dots')}</button>` : ''}
    </header>
    <div class="cards" data-drop-sec="${secKey}" data-drop-pid="${p.id}">${list.map(cardHTML).join('')}</div>
    ${isAdding ? inlineFormHTML(secKey) : `<button class="add-inline" data-action="inline-add" data-sec="${secKey}">${ico('plus')} Add task</button>`}
  </section>`;
}
function inlineFormHTML(sec) {
  return `<form class="inline-add" data-form="inline-add" data-sec="${sec}">
    <input class="bare t" id="ia-title" data-keep placeholder="Task name" autocomplete="off" autofocus maxlength="300">
    <input class="bare d" id="ia-desc" data-keep placeholder="Description" autocomplete="off">
    <div class="chips">
      <label class="chip" title="Date">${ico('cal', 'i-sm')}<input type="date" id="ia-date" data-keep></label>
      <label class="chip" title="Repeat">${ico('repeat', 'i-sm')}<select id="ia-recur" data-keep>
        <option value="">No repeat</option><option value="daily">Daily</option><option value="weekdays">Weekdays</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option>
      </select></label>
    </div>
    <div class="form-actions"><button type="button" class="btn" data-action="inline-cancel">Cancel</button><button class="btn btn-primary">Add task</button></div>
  </form>`;
}

/* ---------- today ---------- */
function whereHTML(t) {
  if (t.briefId) { const b = S.data.briefs[t.briefId]; return b ? `<span class="where-inline" style="color:var(--faint)">${ico('brief', 'i-xs')}${esc(briefRef(b))} ${esc(b.title || '')}</span>` : ''; }
  const p = S.data.projects[t.projectId]; const s = t.sectionId && S.data.sections[t.sectionId];
  if (!p) return '';
  if (p.kind === 'client') return '';   // the client chip already says where it lives
  return `<span class="where-inline" style="color:var(--faint)"><span class="tx-${esc(p.color || 'grey')}" style="font-weight:700">#</span>${esc(p.name)}${s ? ' / ' + esc(s.name) : ''}</span>`;
}
function rowHTML(t) {
  const desc = (t.description || '').trim();
  return `<div class="row" data-action="open-task" data-id="${t.id}">${checkBtn(t)}
    <div class="card-body"><div class="card-title">${esc(t.title)}</div>${desc ? `<div class="card-desc">${esc(desc)}</div>` : ''}${taskMeta(t, { where: whereHTML(t) })}${subBar(t)}</div></div>`;
}
function whoIsOff(day) {
  const out = [];
  Object.values(S.data.events).forEach(ev => eventDays(ev, day, day).forEach(() => out.push(ev)));
  return out;
}
function renderToday() {
  const t = todayKey();
  const act = activeTasks().filter(x => x.due);
  const overdue = act.filter(x => x.due < t).sort((a, b) => a.due.localeCompare(b.due) || (a.priority || 4) - (b.priority || 4));
  const today = act.filter(x => x.due === t).sort((a, b) => (a.priority || 4) - (b.priority || 4) || byOrder(a, b));
  const off = whoIsOff(t);
  const total = overdue.length + today.length;
  return topbar('') + `<div class="content"><div class="list">
    <div class="page-head" style="padding-bottom:6px"><h1>Today</h1><div class="page-desc empty" style="cursor:default">${total} task${total === 1 ? '' : 's'} · ${longDay(t)}</div></div>
    ${off.length ? `<div class="off-today">On the calendar today: ${off.map(evPill).join('')}</div>` : ''}
    ${overdue.length ? `<div class="group-head">Overdue <span class="cnt">${overdue.length}</span><button class="link" data-action="reschedule-overdue">Reschedule to today</button></div>${overdue.map(rowHTML).join('')}` : ''}
    <div class="group-head">${longDay(t)} · Today <span class="cnt">${today.length}</span></div>
    ${today.map(rowHTML).join('')}
    <button class="add-inline" data-action="quick-add" data-due="${t}">${ico('plus')} Add task</button>
    ${!total ? '<div class="empty-state">Nothing due today. Enjoy it.</div>' : ''}
  </div></div>`;
}
function evTitle(ev) {
  if (ev.title) return ev.title;
  const p = personById(ev.person), ty = typeById(ev.type);
  return p ? `${p.name} - ${ty.name}` : ty.name;
}
const evPill = ev => `<button class="cal-item ev-${esc(typeById(ev.type).color)}" style="width:auto" data-action="open-event" data-id="${ev.id}"><span class="txt">${esc(evTitle(ev))}</span></button>`;

/* ---------- calendar ---------- */
// every day (within [from,to]) an event covers, honoring repeats and skipped days
function eventDays(ev, from, to) {
  const out = [];
  if (!ev.start) return out;
  const dur = Math.max(0, dayDiff(ev.start, ev.end || ev.start));
  const starts = [];
  const rep = ev.repeat && ev.repeat.type && ev.repeat.type !== 'none' ? ev.repeat : null;
  if (!rep) starts.push(ev.start);
  else {
    const anchor = parseKey(ev.start).getDate(); let s = ev.start, g = 0, i = 0;
    while (s <= to && g++ < 2000) {
      if (rep.until && s > rep.until) break;
      if (addDays(s, dur) >= from) starts.push(s);
      i++;
      s = rep.type === 'weekly' ? addDays(ev.start, 7 * (rep.every || 1) * i) : addMonths(ev.start, (rep.every || 1) * i, anchor);
    }
  }
  const skip = new Set(ev.skip || []);
  starts.forEach(s => { for (let k = 0; k <= dur; k++) { const d = addDays(s, k); if (d >= from && d <= to && !skip.has(d)) out.push(d); } });
  return out;
}
function calMonth() { if (!S.cal) { const d = new Date(); S.cal = { y: d.getFullYear(), m: d.getMonth() }; } return S.cal; }
function renderUpcoming() {
  const { y, m } = calMonth();
  const first = new Date(y, m, 1, 12); const startOffset = (first.getDay() + 6) % 7;
  const from = addDays(keyOf(first), -startOffset);
  const last = new Date(y, m, daysIn(y, m), 12); const endOffset = (7 - ((last.getDay() + 6) % 7) - 1);
  const to = addDays(keyOf(last), endOffset);
  const nDays = dayDiff(from, to) + 1;
  const byDay = {};
  const push = (d, item) => (byDay[d] = byDay[d] || []).push(item);
  if (S.calLeave && toolOn('calendar')) Object.values(S.data.events).forEach(ev => eventDays(ev, from, to).forEach(d => push(d, { kind: 'ev', ev, d })));
  if (S.calTasks) activeTasks().forEach(t => { if (t.due && t.due >= from && t.due <= to) push(t.due, { kind: 'task', t, d: t.due }); });
  const tk = todayKey();
  const cells = [];
  for (let i = 0; i < nDays; i++) {
    const d = addDays(from, i), dt = parseKey(d);
    const items = (byDay[d] || []).sort((a, b) => (a.kind === 'ev' ? 0 : 1) - (b.kind === 'ev' ? 0 : 1) || String(a.ev?.time || '').localeCompare(String(b.ev?.time || '')));
    const max = 4, shown = items.length > max + 1 ? items.slice(0, max) : items;
    const label = dt.getDate() === 1 ? `${dt.getDate()} ${MON[dt.getMonth()]}` : dt.getDate();
    cells.push(`<div class="cal-cell ${dt.getMonth() !== m ? 'other' : ''} ${d === tk ? 'today' : ''} ${[0, 6].includes(dt.getDay()) ? 'weekend' : ''}" data-day="${d}" data-action="cal-cell">
      <span class="dnum">${label}</span>
      ${shown.map(calItemHTML).join('')}
      ${items.length > shown.length ? `<button class="cal-more" data-action="cal-more" data-day="${d}">+${items.length - shown.length} more</button>` : ''}
    </div>`);
  }
  const typesUsed = types();
  return topbar('') + `<div class="content">
    <div class="cal-head"><div><h1>Upcoming</h1><div class="sub">${MONTHS[m]} ${y}</div></div>
      <div class="cal-controls">
        <div class="seg"><button class="${S.calTasks ? 'on' : ''}" data-action="cal-toggle" data-k="calTasks">${S.calTasks ? '✓ ' : ''}Tasks</button>${toolOn('calendar') ? `<button class="${S.calLeave ? 'on' : ''}" data-action="cal-toggle" data-k="calLeave">${S.calLeave ? '✓ ' : ''}Leave &amp; events</button>` : ''}</div>
        <div class="seg"><button data-action="cal-nav" data-n="-1" title="Previous month">${ico('left', 'i-sm')}</button><button data-action="cal-nav" data-n="0">Today</button><button data-action="cal-nav" data-n="1" title="Next month">${ico('right', 'i-sm')}</button></div>
        ${toolOn('calendar') && canEditAcc() ? `<button class="btn btn-primary" data-action="add-event">${ico('plus', 'i-sm')} Add leave</button>` : ''}
      </div></div>
    <div class="cal">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(x => `<div class="cal-dow">${x}</div>`).join('')}${cells.join('')}</div>
    <div class="legend">${typesUsed.map(t => `<span><i class="ev-${esc(t.color)}"></i>${esc(t.name)}</span>`).join('')}<span><i style="border:1px solid var(--line2)"></i>Task</span><span style="margin-left:auto">Click a day to add · drag items to move them</span></div>
  </div>`;
}
function calItemHTML(it) {
  if (it.kind === 'task') {
    const t = it.t;
    return `<button class="cal-item task" data-drag="task:${t.id}:${it.d}" data-action="open-task" data-id="${t.id}" title="${esc(t.title)}"><span class="ring p${t.priority || 4}"></span><span class="txt">${esc(t.title)}</span>${t.recur ? ico('repeat', 'i-sm') : ''}</button>`;
  }
  const ev = it.ev, ty = typeById(ev.type), rep = ev.repeat && ev.repeat.type && ev.repeat.type !== 'none';
  const time = ev.time ? `${ev.time}${ev.timeEnd ? '-' + ev.timeEnd : ''}` : '';
  return `<button class="cal-item ev-${esc(ty.color)}" ${rep ? 'data-nodrag="1"' : ''} data-drag="ev:${ev.id}:${it.d}" data-action="open-event" data-id="${ev.id}" data-day="${it.d}" title="${esc(evTitle(ev))}${ev.note ? ' - ' + esc(ev.note) : ''}"><span class="ring"></span><span class="txt">${esc(evTitle(ev))}</span>${time ? `<span class="tm">${esc(time)}</span>` : ''}</button>`;
}

/* ===================== data actions ===================== */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const curProjectId = () => (S.route && (S.route.view === 'project' || (S.route.view === 'client' && S.cl.tab === 'tasks')) ? S.route.id : null);
function newTask(f) {
  return Object.assign({ id: uid(), title: '', description: '', projectId: null, sectionId: null, due: null, time: null, recur: null,
    deadline: null, priority: 4, assignee: null, subtasks: [], comments: [], done: false, order: 1000, createdAt: Date.now(), createdBy: me() }, f);
}
/* ---------- undo (toast button and Ctrl/Cmd+Z share one history) ---------- */
const UNDO = [];
function pushUndo(label, fn) {
  const e = { label, fn };
  UNDO.push(e); if (UNDO.length > 30) UNDO.shift();
  return e;
}
async function runUndo(e) {
  const i = UNDO.indexOf(e); if (i < 0) return false;   // already undone
  UNDO.splice(i, 1);
  await e.fn();
  return true;
}
// Show a toast with an Undo button and remember the same step for Ctrl+Z.
function undoable(msg, label, fn) { const e = pushUndo(label, fn); toast(msg, () => runUndo(e)); }
async function undoLast() {
  const e = UNDO[UNDO.length - 1];
  if (!e) return toast('Nothing to undo');
  await runUndo(e);
  $$('#toasts .toast').forEach(t => t.remove());
  toast(`Undone: ${e.label}`);
}

/* ---------- Recently deleted ---------- */
// Deleting moves the documents into the `trash` collection (one doc per item, grouped by
// groupId), so a whole project with its sections and tasks comes back in one go.
const trashOn = () => !S.missing.has('trash');
async function trashItems(kind, label, items, context = '') {
  if (items.length >= 5 || ['project', 'account'].includes(kind)) audit('bulk_delete', `${kind} “${label}” - ${items.length} item(s)`);
  const groupId = uid(), at = Date.now(), ops = [], entries = [];
  items.forEach((it, i) => {
    const entry = { id: `${groupId}_${i}`, groupId, head: i === 0, kind, col: it.col, docId: it.data.id, data: clone(it.data),
      label, context, count: items.length, deletedAt: at, deletedBy: me() };
    entries.push(entry);
    if (trashOn()) ops.push({ type: 'put', col: 'trash', data: entry });
    ops.push({ type: 'del', col: it.col, id: it.data.id });
  });
  await store.batch(ops);
  const what = { note: 'Note', task: 'Task', section: 'Section', project: 'Project', campaign: 'Campaign', account: 'Account', event: 'Entry', brief: 'Brief' }[kind] || 'Item';
  undoable(trashOn() ? `${what} moved to Recently deleted` : `${what} deleted`, `delete “${label}”`, () => restoreEntries(entries));
}
// Puts trashed documents back. Anything whose parent is gone lands somewhere sensible.
async function restoreEntries(entries) {
  const ops = [], back = new Set(entries.map(t => t.col + ':' + t.docId));
  const has = (col, id) => !!(id && (S.data[col][id] || back.has(col + ':' + id)));
  let fallbackProject = null, fallbackAccount = null;
  const project = () => {
    if (fallbackProject) return fallbackProject;
    const p = projects()[0];
    if (p) return (fallbackProject = p.id);
    const np = { id: uid(), name: 'Restored tasks', color: 'grey', description: '', order: nextOrder(Object.values(S.data.projects)), createdAt: Date.now() };
    ops.push({ type: 'put', col: 'projects', data: np });
    return (fallbackProject = np.id);
  };
  const account = () => {
    if (fallbackAccount) return fallbackAccount;
    const a = accounts()[0];
    if (a) return (fallbackAccount = a.id);
    const na = { id: uid(), name: 'Restored campaigns', order: nextOrder(accounts(true)), archived: false, createdAt: Date.now(), createdBy: me() };
    ops.push({ type: 'put', col: 'accounts', data: na });
    return (fallbackAccount = na.id);
  };
  for (const t of entries) {
    const d = clone(t.data);
    if (t.col === 'tasks') {
      if (!has('projects', d.projectId)) { d.projectId = project(); d.sectionId = null; }
      if (d.sectionId && !has('sections', d.sectionId)) d.sectionId = null;
    }
    if (t.col === 'sections' && !has('projects', d.projectId)) d.projectId = project();
    if (t.col === 'campaigns' && !has('accounts', d.accountId)) d.accountId = account();
    if (t.col === 'notes') { if (d.accountId && !has('accounts', d.accountId)) d.accountId = null; if (d.campaignId && !has('campaigns', d.campaignId)) d.campaignId = null; }
    ops.push({ type: 'put', col: t.col, data: d });
    if (S.data.trash[t.id] || trashOn()) ops.push({ type: 'del', col: 'trash', id: t.id });
  }
  await store.batch(ops);
}
const trashGroups = () => {
  const g = {};
  Object.values(S.data.trash).forEach(t => (g[t.groupId] = g[t.groupId] || []).push(t));
  return Object.values(g).map(items => ({ items, head: items.find(x => x.head) || items[0] }))
    .sort((a, b) => (b.head.deletedAt || 0) - (a.head.deletedAt || 0));
};
async function restoreGroup(groupId) {
  const items = Object.values(S.data.trash).filter(t => t.groupId === groupId);
  if (!items.length) return;
  await restoreEntries(items);
  toast(`Restored “${items[0].label}”`);
}
async function purgeGroup(groupId) {
  const items = Object.values(S.data.trash).filter(t => t.groupId === groupId);
  if (!items.length) return;
  if (!await confirmBox(`Delete <b>${esc(items[0].label)}</b> forever? This one can't be undone.`, 'Delete forever')) return;
  await store.batch(items.map(t => ({ type: 'del', col: 'trash', id: t.id })));
  audit('deleted_forever', `${items[0].kind} “${items[0].label}”`);
}
async function emptyTrash() {
  const all = Object.values(S.data.trash); if (!all.length) return;
  if (!await confirmBox(`Permanently delete everything in Recently deleted (${trashGroups().length} item${trashGroups().length === 1 ? '' : 's'})? This can't be undone.`, 'Empty')) return;
  await store.batch(all.map(t => ({ type: 'del', col: 'trash', id: t.id })));
  audit('trash_emptied', `${all.length} document(s)`);
}
const daysLeft = t => Math.max(0, Math.ceil((t.deletedAt + TRASH_DAYS * 864e5 - Date.now()) / 864e5));

async function toggleTask(id, btn) {
  const t = S.data.tasks[id]; if (!t) return;
  if (t.briefId) return toggleStep(t, btn);
  const hs = clientIdsOf(t);
  if (t.done) {
    await store.update('tasks', id, { done: false, completedAt: null });
    logAct('task_reopened', { kind: 'task', taskId: id, clientIds: hs, title: t.title });
    pushUndo(`reopen “${t.title}”`, () => store.update('tasks', id, { done: true, completedAt: t.completedAt || Date.now(), completedBy: t.completedBy || me() }));
    return;
  }
  if (btn) { btn.classList.add('checked'); await sleep(200); }
  if (t.recur) {
    const prev = { due: t.due || null, deadline: t.deadline || null, subtasks: t.subtasks || [], lastDoneAt: t.lastDoneAt || null, doneLog: t.doneLog || [] };
    const next = rollForward(t.due, t.recur);
    const upd = { due: next, subtasks: (t.subtasks || []).map(s => ({ ...s, done: false })), lastDoneAt: Date.now(), lastDoneBy: me(),
      doneLog: [...(t.doneLog || []), Date.now()].slice(-200) };   // kept so the dashboard can count every completion
    if (t.deadline && t.due) upd.deadline = addDays(t.deadline, dayDiff(t.due, next));
    await store.update('tasks', id, upd);
    logAct('task_done', { kind: 'task', taskId: id, clientIds: hs, title: t.title, detail: `repeats - next ${fmtDay(next)}` });
    undoable(`Done - next one is ${longDay(next)}`, `complete “${t.title}”`, () => store.update('tasks', id, prev));
  } else {
    await store.update('tasks', id, { done: true, completedAt: Date.now(), completedBy: me() });
    logAct('task_done', { kind: 'task', taskId: id, clientIds: hs, title: t.title, detail: t.due ? `due ${fmtDay(t.due)}` : '' });
    undoable('1 task completed', `complete “${t.title}”`, () => store.update('tasks', id, { done: false, completedAt: null }));
  }
}
// An independent copy: new id, fresh timestamps, its own sub-task ids, no shared history.
async function duplicateTask(id) {
  const t = S.data.tasks[id]; if (!t) return null;
  const copy = {
    ...clone(t),
    id: uid(),
    title: `${t.title} (copy)`,
    subtasks: (t.subtasks || []).map(s => ({ ...s, id: uid() })),
    comments: [],                       // a copy starts its own conversation
    done: false, completedAt: null, completedBy: null,
    createdAt: Date.now(), createdBy: me(), createdApprox: false,
    updatedAt: Date.now(), updatedBy: me(),
    order: (t.order ?? 1000) + 1,       // sits directly under the original
  };
  await store.put('tasks', copy);
  undoable('Task duplicated', `duplicate “${t.title}”`, () => store.del('tasks', copy.id));
  return copy.id;
}
async function deleteTask(id) {
  const t = S.data.tasks[id]; if (!t) return false;
  if (!await confirmBox(`Delete <b>${esc(t.title)}</b>?${trashOn() ? `<br><span class="muted-note">It stays in Recently deleted for ${TRASH_DAYS} days.</span>` : ''}`)) return false;
  const p = S.data.projects[t.projectId], s = t.sectionId && S.data.sections[t.sectionId];
  await trashItems('task', t.title, [{ col: 'tasks', data: t }], t.briefId && S.data.briefs[t.briefId] ? briefLabel(S.data.briefs[t.briefId]) : p ? `${p.name}${s ? ' / ' + s.name : ''}` : '');
  logAct('task_deleted', { kind: t.briefId ? 'step' : 'task', briefId: t.briefId || null, taskId: t.id, clientIds: clientIdsOf(t), title: t.title });
  return true;
}
async function editProject(p) {
  const r = await promptBox({ title: p ? 'Edit project' : 'Add project', value: p ? p.name : '', color: p ? (p.color || 'grey') : 'grey', ok: p ? 'Save' : 'Add' });
  if (!r) return;
  if (p) return store.update('projects', p.id, { name: r.value, color: r.color });
  const np = { id: uid(), name: r.value, color: r.color, description: '', order: nextOrder(projects()), createdAt: Date.now() };
  await store.put('projects', np); go('#/project/' + np.id);
}
async function deleteProject(p) {
  const secs = Object.values(S.data.sections).filter(s => s.projectId === p.id), tasks = Object.values(S.data.tasks).filter(t => t.projectId === p.id);   // archived ones too
  if (!await confirmBox(`Delete <b>${esc(p.name)}</b> with its ${secs.length} section(s) and ${tasks.length} task(s)?${trashOn() ? `<br><span class="muted-note">You can restore it from Recently deleted for ${TRASH_DAYS} days. Want to keep it out of the way instead? Archive it.</span>` : ''}`)) return;
  const here = curProjectId() === p.id;
  await trashItems('project', p.name, [{ col: 'projects', data: p }, ...secs.map(s => ({ col: 'sections', data: s })), ...tasks.map(t => ({ col: 'tasks', data: t }))],
    `${secs.length} section${secs.length === 1 ? '' : 's'}, ${tasks.length} task${tasks.length === 1 ? '' : 's'}`);
  if (here) go('#/');
}
async function archiveSection(s, on = true) {
  if (!s) return;
  const n = Object.values(S.data.tasks).filter(t => t.sectionId === s.id && !t.done).length;
  await store.update('sections', s.id, { archived: on, archivedAt: on ? Date.now() : null });
  undoable(on ? `“${s.name}” archived with ${n} open task${n === 1 ? '' : 's'}` : `“${s.name}” restored`, `${on ? 'archive' : 'restore'} “${s.name}”`,
    () => store.update('sections', s.id, { archived: !on, archivedAt: on ? null : (s.archivedAt || Date.now()) }));
}
async function archiveTask(t, on = true) {
  if (!t) return;
  await store.update('tasks', t.id, { archived: on, archivedAt: on ? Date.now() : null });
  undoable(on ? 'Task archived' : 'Task restored', `${on ? 'archive' : 'restore'} “${t.title}”`,
    () => store.update('tasks', t.id, { archived: !on, archivedAt: on ? null : (t.archivedAt || Date.now()) }));
}
// Tidy a column: put every ticked-off task in it away in one go.
async function archiveDone(pid, sid) {
  const done = Object.values(S.data.tasks).filter(t => t.projectId === pid && (t.sectionId || null) === (sid || null) && t.done && !t.archived);
  if (!done.length) return toast('No completed tasks here');
  const at = Date.now();
  await store.batch(done.map(t => ({ type: 'update', col: 'tasks', id: t.id, data: { archived: true, archivedAt: at } })));
  undoable(`${done.length} completed task${done.length === 1 ? '' : 's'} archived`, 'archive completed tasks',
    () => store.batch(done.map(t => ({ type: 'update', col: 'tasks', id: t.id, data: { archived: false, archivedAt: null } }))));
}
async function archiveProject(p, on = true) {
  if (!p) return;
  await store.update('projects', p.id, { archived: on, archivedAt: on ? Date.now() : null });
  if (on) {
    if (curProjectId() === p.id) go('#/');
    undoable(`“${p.name}” archived`, `archive “${p.name}”`, () => store.update('projects', p.id, { archived: false, archivedAt: null }));
  } else undoable(`“${p.name}” restored from the archive`, `restore “${p.name}”`, () => store.update('projects', p.id, { archived: true, archivedAt: p.archivedAt || Date.now() }));
}
async function moveItem(list, col, id, dir) {
  const i = list.findIndex(x => x.id === id), j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await store.batch(list.map((x, k) => ({ type: 'update', col, id: x.id, data: { order: (k + 1) * 1000 } })));
}
async function renameSection(s) {
  const r = await promptBox({ title: 'Rename section', value: s.name }); if (r) store.update('sections', s.id, { name: r.value });
}
async function deleteSection(s) {
  const tasks = Object.values(S.data.tasks).filter(t => t.sectionId === s.id);
  if (!await confirmBox(`Delete section <b>${esc(s.name)}</b> and its ${tasks.length} task(s)?${trashOn() ? `<br><span class="muted-note">It stays in Recently deleted for ${TRASH_DAYS} days.</span>` : ''}`)) return;
  const p = S.data.projects[s.projectId];
  await trashItems('section', s.name, [{ col: 'sections', data: s }, ...tasks.map(t => ({ col: 'tasks', data: t }))],
    `${p ? p.name + ' · ' : ''}${tasks.length} task${tasks.length === 1 ? '' : 's'}`);
}
async function saveSettings(patch) { await store.put('meta', { ...clone(settings()), ...patch, id: 'settings' }); }

/* ===================== click handling ===================== */
const ACTIONS = {
  'open-nav': () => document.body.classList.add('nav-open'),
  'close-nav': () => document.body.classList.remove('nav-open'),
  'quick-add': a => openTask(null, { due: a.dataset.due, projectId: curProjectId() }),
  'search': () => openSearch(),
  'side-more': () => { const g = document.querySelector('.side-more'); const open = !g.classList.contains('open'); g.classList.toggle('open', open); g.querySelector('.side-more-btn').setAttribute('aria-expanded', open); lsSet('tb:sideMore', open ? '1' : '0'); },
  'open-settings': () => openSettings(),
  'user-menu': a => openMenu(a, [
    { title: `${(S.user && S.user.name) || 'Me'}${S.user && S.user.email && S.mode === 'cloud' ? ' · ' + S.user.email : ''}` },
    ...(S.acc ? [{ label: 'Account settings', icon: 'gear', onClick: openSettings }] : []),
    ...(isBizAdmin() ? [{ label: 'Business settings', icon: 'people', onClick: () => go('#/business') }] : []),
    { label: document.documentElement.dataset.theme === 'dark' ? 'Light theme' : 'Dark theme', icon: 'moon', onClick: toggleTheme },
    { label: 'Guide & help', icon: 'help', onClick: () => go('#/guide') },
    { label: 'Home page', icon: 'sidebar', onClick: () => go('#/home') },
    { label: 'Export backup', icon: 'download', onClick: exportData },
    ...(S.mode === 'cloud' ? ['-', { label: 'Sign out', icon: 'out', onClick: () => S.signOut && S.signOut() }] : []),
  ]),
  'add-project': () => editProject(null),
  'rename-project': a => editProject(S.data.projects[a.dataset.id]),
  'edit-desc': async a => {
    const p = S.data.projects[a.dataset.id];
    const r = await promptBox({ title: 'Project description', label: 'Description', value: p.description || '', multiline: true });
    if (r) store.update('projects', p.id, { description: r.value });
  },
  'project-menu': a => {
    const p = S.data.projects[a.dataset.id]; const list = projects();
    openMenu(a, [
      { label: 'Edit name & color', icon: 'pencil', onClick: () => editProject(p) },
      { label: 'Edit description', icon: 'comment', onClick: () => ACTIONS['edit-desc']({ dataset: { id: p.id } }) },
      { label: 'Add section', icon: 'plus', onClick: () => { go('#/project/' + p.id); S.addingSection = true; render(); focusSoon('#new-section'); } },
      '-',
      ...(p.archived ? [] : [
        { label: 'Move up', icon: 'up', onClick: () => moveItem(list, 'projects', p.id, -1) },
        { label: 'Move down', icon: 'down', onClick: () => moveItem(list, 'projects', p.id, 1) },
      ]),
      '-',
      p.archived ? { label: 'Restore from archive', icon: 'archive', onClick: () => archiveProject(p, false) }
        : { label: 'Archive project', icon: 'archive', onClick: () => archiveProject(p, true) },
      { label: 'Delete project', icon: 'trash', danger: true, onClick: () => deleteProject(p) },
    ], a.dataset.align);
  },
  'toggle-completed': () => { const id = curProjectId(); S.showCompleted[id] = !S.showCompleted[id]; render(); },
  'add-section': () => { S.addingSection = true; render(); focusSoon('#new-section'); },
  'cancel-section': () => { S.addingSection = false; render(); },
  'rename-section': a => renameSection(S.data.sections[a.dataset.id]),
  'section-menu': a => {
    const s = S.data.sections[a.dataset.id]; const list = sectionsOf(s.projectId);
    openMenu(a, [
      { label: 'Add task', icon: 'plus', onClick: () => startInline(s.id) },
      { label: 'Rename section', icon: 'pencil', onClick: () => renameSection(s) },
      { label: 'Move left', icon: 'left', onClick: () => moveItem(list, 'sections', s.id, -1) },
      { label: 'Move right', icon: 'right', onClick: () => moveItem(list, 'sections', s.id, 1) },
      '-',
      { label: 'Archive section', icon: 'archive', onClick: () => archiveSection(s, true) },
      { label: 'Archive completed tasks', icon: 'check', onClick: () => archiveDone(s.projectId, s.id) },
      { label: 'Delete section', icon: 'trash', danger: true, onClick: () => deleteSection(s) },
    ]);
  },
  'inline-add': a => startInline(a.dataset.sec),
  'inline-cancel': () => { S.inlineAdd = null; ['ia-title', 'ia-desc', 'ia-date', 'ia-recur'].forEach(i => { const el = document.getElementById(i); if (el) el.value = ''; }); render(); },
  'open-task': a => openTask(a.dataset.id),
  'toggle-task': a => toggleTask(a.dataset.id, a),
  'reschedule-overdue': async () => {
    const t = todayKey(); const list = activeTasks().filter(x => x.due && x.due < t);
    const before = list.map(x => ({ id: x.id, due: x.due }));
    await store.batch(list.map(x => ({ type: 'update', col: 'tasks', id: x.id, data: { due: t } })));
    undoable(`${list.length} task(s) moved to today`, 'reschedule overdue tasks',
      () => store.batch(before.map(x => ({ type: 'update', col: 'tasks', id: x.id, data: { due: x.due } }))));
  },
  'cal-toggle': a => { const k = a.dataset.k; S[k] = !S[k]; lsSet('tb:' + k, S[k] ? '1' : '0'); render(); },
  'cal-nav': a => {
    const n = +a.dataset.n, c = calMonth();
    if (n === 0) { const d = new Date(); S.cal = { y: d.getFullYear(), m: d.getMonth() }; }
    else { const d = new Date(c.y, c.m + n, 1); S.cal = { y: d.getFullYear(), m: d.getMonth() }; }
    render();
  },
  'add-event': () => openEvent(null, {}),
  'open-event': a => openEvent(a.dataset.id, { day: a.dataset.day }),
  'cal-cell': (a, e) => {
    const d = a.dataset.day;
    const anchor = { getBoundingClientRect: () => ({ left: e.clientX, right: e.clientX, top: e.clientY, bottom: e.clientY }) };
    if (!canEditAcc()) return;
    openMenu(anchor, [
      { title: longDay(d) },
      ...(toolOn('calendar') ? [{ label: 'Add leave / event', icon: 'user', onClick: () => openEvent(null, { day: d }) }] : []),
      { label: 'Add task', icon: 'plus', onClick: () => openTask(null, { due: d }) },
    ]);
  },
  'cal-more': a => openDay(a.dataset.day),
  'arc-restore': a => {
    const id = a.dataset.id, k = a.dataset.kind;
    if (k === 'project') return archiveProject(S.data.projects[id], false);
    if (k === 'section') return archiveSection(S.data.sections[id], false);
    if (k === 'task') return archiveTask(S.data.tasks[id], false);
    if (k === 'account') return S.data.accounts[id] && ctArchiveAccount(S.data.accounts[id], false);
    if (k === 'campaign') return ctArchive(id, false);
  },
  'arc-del': a => {
    const id = a.dataset.id, k = a.dataset.kind;
    if (k === 'project') return S.data.projects[id] && deleteProject(S.data.projects[id]);
    if (k === 'section') return S.data.sections[id] && deleteSection(S.data.sections[id]);
    if (k === 'task') return deleteTask(id);
    if (k === 'account') return S.data.accounts[id] && ctDeleteAccount(S.data.accounts[id]);
    if (k === 'campaign') return ctDelete(id);
  },
  'arc-open-acc': a => { S.ct.archived = true; S.ct.account = a.dataset.id; lsSet('tb:ctAccount', a.dataset.id); go('#/campaigns'); },
  'trash-restore': a => restoreGroup(a.dataset.id),
  'trash-purge': a => purgeGroup(a.dataset.id),
  'trash-empty': () => emptyTrash(),
  'acc-menu': a => openAccMenu(a),
  'acc-open': a => switchAccount(a.dataset.id),
  'acc-create': () => openAccountForm(null),
  'acc-edit': a => openAccountForm(a.dataset.id),
  'acc-access': a => openAccessModal(a.dataset.id),
  'acc-row-menu': a => accRowMenu(a, a.dataset.id),
  'acc-tools': () => openSettings('account'),
  'join-team': async () => { const em = userEmail(); if (!em || personByEmail(em)) return; const m = S.biz.members[em] || {};
    await saveSettings({ people: [...people(), { id: uid(), name: m.name || (S.user && S.user.name) || em.split('@')[0], email: em, role: rolesList().includes(m.jobRole) ? m.jobRole : '', color: m.color || 'red' }] }); toast('You’re on the team'); },
  'bz-tab': a => { S.bz.tab = a.dataset.t; render({ mainOnly: true }); },
  'gd-biz': a => { S.bz.tab = a.dataset.t; go('#/business'); },
  'bz-sample-load': () => openSampleDialog(),
  'bz-sample-clear': () => clearSampleBusiness(),
  'db-view': a => { S.db.view = a.dataset.v; lsSet('tb:db', JSON.stringify(S.db)); render({ mainOnly: true }); },
  'db-acc': a => { S.ct.account = a.dataset.id; lsSet('tb:ctAccount', a.dataset.id); go('#/campaigns'); },
};
function focusSoon(sel) { setTimeout(() => { const el = $(sel); if (el) el.focus(); }, 30); }
function startInline(sec) {
  S.inlineAdd = { pid: curProjectId(), sec: sec || '' };
  ['ia-title', 'ia-desc', 'ia-date', 'ia-recur'].forEach(i => { const el = document.getElementById(i); if (el) el.value = ''; });
  render(); focusSoon('#ia-title');
}

document.addEventListener('click', e => {
  if (e.target.closest('#modals') || e.target.closest('.menu')) {
    const a = e.target.closest('#modals [data-action="open-task"], #modals [data-action="open-event"]');
    if (a) { topModal() && topModal().close(); ACTIONS[a.dataset.action](a, e); }
    return;
  }
  if (e.target.closest('a[data-ext]')) return;   // pacing sheet links open in a new tab, nothing else
  // A link and a button can be nested (a client chip on a task card, a menu button in a table row): the innermost one wins.
  const g = e.target.closest('[data-go]'), a = e.target.closest('[data-action]');
  if (g && (!a || a.contains(g))) { go(g.dataset.go); return; }
  if (!a) return;
  const fn = ACTIONS[a.dataset.action]; if (fn) { e.preventDefault(); fn(a, e); }
});
document.addEventListener('submit', async e => {
  const f = e.target.closest('[data-form]'); if (!f) return;
  e.preventDefault();
  if (f.dataset.form === 'inline-add') {
    const ti = $('#ia-title'), title = ti.value.trim(); if (!title) return ti.focus();
    const pid = S.inlineAdd.pid, sec = S.inlineAdd.sec || null;
    const rt = $('#ia-recur').value, recur = rt ? { type: rt, every: 1 } : null;
    const due = $('#ia-date').value || (recur ? todayKey() : null);
    if (recur && ['monthly', 'yearly'].includes(rt)) recur.day = parseKey(due).getDate();
    const t = newTask({ projectId: pid, sectionId: sec, title, description: $('#ia-desc').value.trim(), due, recur, order: nextOrder(tasksIn(pid, sec, true)) });
    ['ia-title', 'ia-desc', 'ia-date', 'ia-recur'].forEach(i => $('#' + i).value = '');
    await store.put('tasks', t); focusSoon('#ia-title');
    logAct('task_created', { kind: 'task', taskId: t.id, clientIds: clientIdsOf(t), title: t.title });
  } else if (f.dataset.form === 'add-section') {
    const inp = $('#new-section'), name = inp.value.trim(); if (!name) return inp.focus();
    const pid = curProjectId(); inp.value = '';
    await store.put('sections', { id: uid(), projectId: pid, name, order: nextOrder(sectionsOf(pid)), createdAt: Date.now() });
    S.addingSection = false; render();
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (pd) { cancelPointerDrag(); return; }
    if (menuEl) return closeMenu();
    const m = topModal(); if (m) { e.preventDefault(); return (m.onDismiss || m.close)(); }
    if (S.inlineAdd) return ACTIONS['inline-cancel']();
    if (S.addingSection) return ACTIONS['cancel-section']();
    return;
  }
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
  // Ctrl+Z / Cmd+Z undoes the last delete, completion, archive… (text boxes keep their own undo)
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'z' && !typing && S.ready && store) {
    const m = topModal();
    if (m && m.classList.contains('overlay') && m.querySelector('[data-ok]')) return;   // a confirm dialog is open
    e.preventDefault(); undoLast(); return;
  }
  if (typing || e.metaKey || e.ctrlKey || e.altKey || topModal() || !S.ready || !store || e.shiftKey || document.querySelector('#root .home')) return;
  if (e.key === 'q') { e.preventDefault(); openTask(null, { projectId: curProjectId() }); }
  else if (e.key === '/') { e.preventDefault(); openSearch(); }
});

// Right-click a task card for its actions without adding clutter to the card itself.
document.addEventListener('contextmenu', e => {
  const card = e.target.closest && e.target.closest('[data-task]');
  if (!card) return;
  const t = S.data.tasks[card.dataset.task]; if (!t) return;
  e.preventDefault();
  const anchor = { getBoundingClientRect: () => ({ left: e.clientX, right: e.clientX, top: e.clientY, bottom: e.clientY }) };
  openMenu(anchor, [
    { label: 'Open task', icon: 'eye', onClick: () => openTask(t.id) },
    { label: 'Duplicate task', icon: 'copy', onClick: () => duplicateTask(t.id) },
    t.archived ? { label: 'Restore from archive', icon: 'archive', onClick: () => archiveTask(t, false) }
      : { label: 'Archive task', icon: 'archive', onClick: () => archiveTask(t, true) },
    '-',
    { label: 'Delete task', icon: 'trash', danger: true, onClick: () => deleteTask(t.id) },
  ]);
});

/* =====================================================================
   DRAG & DROP - pointer based.
   The browser's native drag-and-drop can be left hanging (its element gets
   replaced, it's dropped outside the window, a pointer event is swallowed) and
   the page then feels frozen. This uses plain mouse/touch events instead: a
   release, an Escape, a lost window or a stale timer always ends it.
   ===================================================================== */
function clearDropUI() {
  $$('.drop-line').forEach(x => x.remove());
  $$('.drag-over,.col-drop,.drop-above,.drop-below,.tab-drop,.drop-l,.drop-r').forEach(x =>
    x.classList.remove('drag-over', 'col-drop', 'after', 'drop-above', 'drop-below', 'tab-drop', 'drop-l', 'drop-r'));
}
// Shared reorder: drop `dragId` before/after `targetId` and renumber the whole list.
async function reorderList(list, col, dragId, targetId, after) {
  const from = list.findIndex(x => x.id === dragId); if (from < 0) return;
  const moved = list[from]; const rest = list.filter(x => x.id !== dragId);
  let at = rest.findIndex(x => x.id === targetId); if (at < 0) at = rest.length; else if (after) at += 1;
  rest.splice(at, 0, moved);
  const ops = rest.map((x, i) => ({ type: 'update', col, id: x.id, data: { order: (i + 1) * 1000 } }))
    .filter((o, i) => rest[i].order !== o.data.order);
  if (ops.length) await store.batch(ops);
}
function edgeMark(el, after, cls) { clearDropUI(); el.classList.add(cls); if (after) el.classList.add('after'); }

// What can be dragged, and by which part of it. Order matters: most specific first.
const DRAGGABLES = [
  { kind: 'campaign', handle: '[data-grip]',   item: '[data-camp]', id: el => el.dataset.camp },
  { kind: 'cal',      handle: '[data-drag]',   item: '[data-drag]', id: el => el.dataset.drag, skip: el => el.hasAttribute('data-nodrag') },
  { kind: 'section',  handle: '[data-sechead]',item: '.col',        id: el => el.querySelector('[data-sechead]')?.dataset.sechead || el.dataset.sec,
    ignore: '.icon-btn' },
  { kind: 'tab',      handle: '[data-tab]',    item: '[data-tab]',  id: el => el.dataset.tab },
  { kind: 'project',  handle: '[data-proj]',   item: '[data-proj]', id: el => el.dataset.proj, ignore: '.more' },
  { kind: 'card',     handle: '[data-task]',   item: '[data-task]', id: el => el.dataset.task, ignore: '.check' },
];
let pd = null;              // pointer-drag state
let suppressClick = false;  // a completed drag must not also fire a click

function findDraggable(target) {
  for (const d of DRAGGABLES) {
    const h = target.closest && target.closest(d.handle);
    if (!h) continue;
    if (d.ignore && target.closest(d.ignore)) return null;
    const item = h.closest(d.item) || h;
    if (d.skip && d.skip(item)) return null;
    const id = d.id(item);
    if (!id) return null;
    return { kind: d.kind, item, id };
  }
  return null;
}
document.addEventListener('pointerdown', e => {
  if (e.button !== 0 || !e.isPrimary || e.pointerType === 'touch' || topModal()) return;
  if (e.target.closest && e.target.closest('input,textarea,select,.menu')) return;
  const hit = findDraggable(e.target);
  if (!hit) return;
  pd = { ...hit, x0: e.clientX, y0: e.clientY, started: false, ghost: null, target: null, after: false,
         zone: null, idx: 0, pointerId: e.pointerId, startedAt: Date.now(), capture: e.target };
  // Pointer capture guarantees we still receive the move and release even if the pointer
  // leaves the window or the element underneath changes.
  try { e.target.setPointerCapture(e.pointerId); } catch { }
});
function releaseCapture() {
  if (!pd || !pd.capture) return;
  try { pd.capture.releasePointerCapture(pd.pointerId); } catch { }
}
function startPointerDrag(e) {
  pd.started = true;
  S.drag = { kind: pd.kind, id: pd.id, ref: pd.kind === 'cal' ? pd.id : undefined };
  S.dragAt = Date.now();
  const r = pd.item.getBoundingClientRect();
  const g = pd.item.cloneNode(true);
  g.classList.add('drag-ghost');
  g.style.cssText += `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;margin:0;z-index:9999;pointer-events:none;`;
  document.body.appendChild(g);
  pd.ghost = g; pd.gx = r.left; pd.gy = r.top;
  pd.item.classList.add('dragging');
  document.body.classList.add('dragging-active');
  if (pd.kind === 'campaign') ctEnsureManualSort();
}
function autoScroll(e) {
  const box = $('.content'); if (!box) return;
  const r = box.getBoundingClientRect(), edge = 90;
  if (e.clientX > r.right - edge) box.scrollLeft += 18;
  else if (e.clientX < r.left + edge) box.scrollLeft -= 18;
  if (e.clientY > r.bottom - edge) box.scrollTop += 14;
  else if (e.clientY < r.top + edge) box.scrollTop -= 14;
}
function underPointer(e, sel) {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  return el && el.closest ? el.closest(sel) : null;
}
function updatePointerDrag(e) {
  S.dragAt = Date.now();
  pd.ghost.style.transform = `translate(${e.clientX - pd.x0}px, ${e.clientY - pd.y0}px)`;
  autoScroll(e);
  pd.target = null;
  if (pd.kind === 'section') {
    const col = underPointer(e, '.col'); if (!col || !col.dataset.sec) return clearDropUI();
    const r = col.getBoundingClientRect(); pd.after = e.clientX > r.left + r.width / 2;
    pd.target = col.dataset.sec; edgeMark(col, pd.after, 'col-drop');
  } else if (pd.kind === 'tab' || pd.kind === 'campaign' || pd.kind === 'project') {
    const sel = pd.kind === 'tab' ? '[data-tab]' : pd.kind === 'campaign' ? '[data-camp]' : '[data-proj]';
    const el = underPointer(e, sel); if (!el || el === pd.item) return clearDropUI();
    const r = el.getBoundingClientRect();
    const vertical = pd.kind === 'project';
    pd.after = vertical ? e.clientY > r.top + r.height / 2 : e.clientX > r.left + r.width / 2;
    pd.target = pd.kind === 'tab' ? el.dataset.tab : pd.kind === 'campaign' ? el.dataset.camp : el.dataset.proj;
    if (pd.kind === 'tab') edgeMark(el, pd.after, 'tab-drop');
    else if (pd.kind === 'campaign') { clearDropUI(); el.classList.add(pd.after ? 'drop-r' : 'drop-l'); }
    else { clearDropUI(); el.classList.add(pd.after ? 'drop-below' : 'drop-above'); }
  } else if (pd.kind === 'card') {
    const col = underPointer(e, '.col'); if (!col) return clearDropUI();
    const zone = col.querySelector('.cards'); if (!zone) return clearDropUI();
    const cards = $$('.card:not(.dragging)', zone);
    let idx = cards.findIndex(c => { const r = c.getBoundingClientRect(); return e.clientY < r.top + r.height / 2; });
    if (idx < 0) idx = cards.length;
    pd.target = zone; pd.zone = zone; pd.idx = idx;          // keep the target even when the marker doesn't move
    if ($('.drop-line') && zone.classList.contains('drag-over') && pd.markIdx === idx) return;
    clearDropUI(); zone.classList.add('drag-over');
    const line = document.createElement('div'); line.className = 'drop-line';
    idx < cards.length ? zone.insertBefore(line, cards[idx]) : zone.appendChild(line);
    pd.markIdx = idx;
  } else if (pd.kind === 'cal') {
    const cell = underPointer(e, '.cal-cell'); if (!cell) return clearDropUI();
    if (!cell.classList.contains('drag-over')) { clearDropUI(); cell.classList.add('drag-over'); }
    pd.target = cell.dataset.day;
  }
}
async function finishPointerDrag() {
  releaseCapture();
  const d = pd; pd = null;
  if (!d || !d.started) { pd = null; return; }
  suppressClick = true; setTimeout(() => suppressClick = false, 60);
  if (d.ghost) d.ghost.remove();
  const target = d.target, after = d.after, zone = d.zone, idx = d.idx;
  resetDrag();                                   // always leaves a clean state, then repaints
  if (!target) return;
  if (d.kind === 'section') {
    if (target === d.id) return;
    const sec = S.data.sections[d.id]; if (!sec) return;
    return reorderList(sectionsOf(sec.projectId), 'sections', d.id, target, after);
  }
  if (d.kind === 'project') { if (target === d.id) return; return reorderList(projects(), 'projects', d.id, target, after); }
  if (d.kind === 'tab') { if (target === d.id) return; return reorderList(accounts(true), 'accounts', d.id, target, after); }
  if (d.kind === 'campaign') {
    if (target === d.id) return;
    const c = S.data.campaigns[d.id], t = S.data.campaigns[target];
    if (!c || !t || t.accountId !== c.accountId) return;      // ordering is per account
    return reorderList(campaignsOf(c.accountId, true), 'campaigns', d.id, target, after);
  }
  if (d.kind === 'card') {
    const pid = zone.dataset.dropPid, sec = zone.dataset.dropSec || null;
    const list = tasksIn(pid, sec, !!S.showCompleted[pid]).filter(t => t.id !== d.id);
    list.splice(Math.min(idx, list.length), 0, S.data.tasks[d.id]);
    const ops = [];
    list.forEach((t, i) => {
      const data = { order: (i + 1) * 1000 };
      if (t.id === d.id) { data.sectionId = sec; data.projectId = pid; }
      if (t.order !== data.order || t.id === d.id) ops.push({ type: 'update', col: 'tasks', id: t.id, data });
    });
    return store.batch(ops);
  }
  if (d.kind === 'cal') {
    const [kind, id, from] = d.id.split(':'), day = target;
    if (from === day) return;
    if (kind === 'task') {
      const t = S.data.tasks[id]; if (!t) return;
      const data = { due: day };
      if (t.recur && ['monthly', 'yearly'].includes(t.recur.type)) data.recur = { ...t.recur, day: parseKey(day).getDate() };
      if (t.deadline && t.due) data.deadline = addDays(t.deadline, dayDiff(t.due, day));
      return store.update('tasks', id, data);
    }
    const ev = S.data.events[id]; if (!ev) return;
    const n = dayDiff(from, day);
    return store.update('events', id, { start: addDays(ev.start, n), end: addDays(ev.end || ev.start, n) });
  }
}
function cancelPointerDrag() {
  if (!pd) return;
  releaseCapture();
  const d = pd; pd = null;
  if (d.ghost) d.ghost.remove();
  resetDrag();
}
function resetDrag() {
  S.drag = null; S.dragAt = 0;
  $$('.dragging').forEach(x => x.classList.remove('dragging'));
  $$('.drag-ghost').forEach(x => x.remove());
  clearDropUI();
  document.body.classList.remove('dragging-active');
  if (S.renderPending) { S.renderPending = false; render(); }
}
document.addEventListener('pointermove', e => {
  if (!pd) return;
  // The button is no longer held: a release we never saw. End it on the very next movement,
  // whatever device the event came from - this check runs before any pointer-id filtering.
  if (e.buttons === 0) { if (pd.started) finishPointerDrag(); else pd = null; return; }
  if (e.pointerId != null && pd.pointerId != null && e.pointerId !== pd.pointerId) return;
  if (!pd.started) {
    if (Math.abs(e.clientX - pd.x0) + Math.abs(e.clientY - pd.y0) < 6) return;   // a click, not a drag
    startPointerDrag(e);
  }
  e.preventDefault();
  updatePointerDrag(e);
});
['pointerup', 'pointercancel'].forEach(ev => document.addEventListener(ev, e => {
  if (!pd || (e.pointerId != null && pd.pointerId != null && e.pointerId !== pd.pointerId)) return;
  if (ev === 'pointercancel') return cancelPointerDrag();
  finishPointerDrag();
}));
document.addEventListener('mouseup', () => { if (pd) finishPointerDrag(); });   // belt and braces
document.addEventListener('mousemove', e => {   // same guard for plain mouse events
  if (pd && e.buttons === 0) { if (pd.started) finishPointerDrag(); else pd = null; }
});
window.addEventListener('blur', cancelPointerDrag);
document.addEventListener('visibilitychange', () => { if (document.hidden) cancelPointerDrag(); });
// Last resorts, so a drag can never leave the app stuck: no movement for 3s, or 20s in total.
setInterval(() => {
  if (pd && pd.started && Date.now() - pd.startedAt > 20000) { cancelPointerDrag(); toast('Drag cancelled'); return; }
  if (S.drag && Date.now() - (S.dragAt || 0) > 3000) { pd = null; resetDrag(); }
}, 1000);
// Swallow the click that follows a real drag (so dropping a card doesn't also open it).
document.addEventListener('click', e => {
  if (!suppressClick) return;
  e.preventDefault(); e.stopPropagation(); suppressClick = false;
}, true);

// Keyboard reordering for campaign cards (the handle is focusable).
document.addEventListener('keydown', e => {
  const g = document.activeElement && document.activeElement.closest && document.activeElement.closest('[data-grip]');
  if (!g || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
  e.preventDefault();
  ctNudgeCampaign(g.dataset.grip, e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1);
});

/* ===================== task modal ===================== */
const EDITABLE = ['title', 'description', 'projectId', 'sectionId', 'due', 'time', 'recur', 'deadline', 'priority', 'assignee', 'subtasks', 'clientIds', 'labels', 'status', 'slaDays'];
const pick = (o, keys) => Object.fromEntries(keys.map(k => [k, o[k] ?? null]));
function locOptions(pid, sid) {
  const list = projects();
  if (pid && S.data.projects[pid] && S.data.projects[pid].archived && isList(S.data.projects[pid])) list.push(S.data.projects[pid]);
  const hs = clients(); if (pid && S.data.projects[pid] && S.data.projects[pid].kind === 'client' && !hs.some(h => h.id === pid)) hs.push(S.data.projects[pid]);
  return list.map(p => `<optgroup label="# ${esc(p.name)}">
    <option value="${p.id}|" ${p.id === pid && !sid ? 'selected' : ''}>${esc(p.name)}</option>
    ${[...sectionsOf(p.id), ...(sid && S.data.sections[sid] && S.data.sections[sid].archived && S.data.sections[sid].projectId === p.id ? [S.data.sections[sid]] : [])].map(s => `<option value="${p.id}|${s.id}" ${s.id === sid ? 'selected' : ''}>&nbsp;&nbsp;${esc(p.name)} / ${esc(s.name)}${s.archived ? ' (archived)' : ''}</option>`).join('')}
  </optgroup>`).join('') + (hs.length ? `<optgroup label="Brand lists">${hs.map(h => `<option value="${h.id}|" ${h.id === pid && !sid ? 'selected' : ''}>${esc(h.name)}</option>
    ${h.id === pid ? sectionsOf(h.id).map(s => `<option value="${h.id}|${s.id}" ${s.id === sid ? 'selected' : ''}>&nbsp;&nbsp;${esc(h.name)} / ${esc(s.name)}</option>`).join('') : ''}`).join('')}</optgroup>` : '');
}
function openTask(id, def = {}) {
  const ex = id ? S.data.tasks[id] : null;
  if (id && !ex) return;
  const pid = def.projectId || projects()[0]?.id || clients()[0]?.id;
  if (!ex && !pid) { toast('Create a list first'); return; }
  const d = ex ? clone(ex) : newTask({ projectId: pid, sectionId: def.sectionId || null, due: def.due || null, clientIds: def.clientIds || [], labels: def.labels || [] });
  d.subtasks = d.subtasks || []; d.clientIds = d.clientIds || []; d.labels = d.labels || [];
  const isStep = !!d.briefId;
  const orig = JSON.stringify(pick(d, EDITABLE));
  const ppl = people();
  const w = openModal(`
    <div class="modal-head"><div class="crumb" data-crumb></div><button class="icon-btn" data-m="x" title="Close">${ico('x')}</button></div>
    <div class="tm-grid">
      <div class="tm-main">
        <div class="tm-title-row">${ex ? checkBtn(ex).replace('data-action="toggle-task"', 'data-m="complete"') : `<span class="check p${d.priority}"></span>`}
          <textarea class="tm-title" rows="1" data-f="title" placeholder="Task name" autofocus maxlength="300">${esc(d.title)}</textarea></div>
        <textarea class="tm-desc" data-f="description" placeholder="Description" rows="2" maxlength="20000">${esc(d.description)}</textarea>
        <div class="tm-sec"><h4>${ico('sub', 'i-sm')} Sub-tasks <span data-subcount></span></h4><div class="sp" data-subprog hidden><div class="sp-track"><i></i></div><span class="sp-lbl"></span></div><div data-subs></div>
          <div class="sub-add">${ico('plus', 'i-sm')}<input data-subnew placeholder="Add sub-task (press Enter)" maxlength="200"></div></div>
        ${ex ? `<div class="tm-sec"><h4>${ico('comment', 'i-sm')} Comments</h4><div data-comments></div>
          <div class="comment-box"><textarea class="ta" data-cnew placeholder="Write a comment…" rows="1" maxlength="5000"></textarea><button class="btn" data-m="comment">Comment</button></div></div>` : ''}
      </div>
      <div class="tm-side">
        ${isStep ? '' : `<div class="prop"><span class="lbl-sm">List</span><select class="sel" data-f="loc">${locOptions(d.projectId, d.sectionId)}</select></div>`}
        ${taskExtrasHTML(d)}
        <div class="prop"><span class="lbl-sm">Date</span><div class="inline"><input type="date" class="inp" data-f="due" value="${d.due || ''}"><input type="time" class="inp" data-f="time" value="${d.time || ''}" style="width:92px" title="Time (optional)"><button class="clear-x" data-m="clear-due" title="Remove date">${ico('x', 'i-sm')}</button></div></div>
        <div class="prop"><span class="lbl-sm">Repeat</span><div class="inline">
          <select class="sel" data-f="recurType">${[['', 'Does not repeat'], ['daily', 'Daily'], ['weekdays', 'Every weekday (Mon-Fri)'], ['weekly', 'Weekly'], ['monthly', 'Monthly'], ['yearly', 'Yearly']].map(([v, l]) => `<option value="${v}" ${(d.recur?.type || '') === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
          <span data-every-wrap class="inline" style="gap:4px;color:var(--muted);font-size:12px;white-space:nowrap">every<input type="number" min="1" max="99" class="inp" data-f="every" value="${d.recur?.every || 1}" style="width:50px"></span></div>
          <div class="hint" data-recur-hint></div></div>
        <div class="prop"><span class="lbl-sm">Deadline</span><div class="inline"><input type="date" class="inp" data-f="deadline" value="${d.deadline || ''}"><button class="clear-x" data-m="clear-deadline" title="Remove deadline">${ico('x', 'i-sm')}</button></div></div>
        <div class="prop"><span class="lbl-sm">Priority</span><select class="sel" data-f="priority">${[[1, 'Priority 1 - urgent'], [2, 'Priority 2 - high'], [3, 'Priority 3 - medium'], [4, 'Priority 4 - none']].map(([v, l]) => `<option value="${v}" ${+d.priority === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <div class="prop"><span class="lbl-sm">Assignee</span><select class="sel" data-f="assignee"><option value="">Unassigned</option>${ppl.map(p => `<option value="${p.id}" ${d.assignee === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select>
          ${ppl.length ? '' : '<div class="hint">Add teammates in Settings to assign tasks.</div>'}</div>
        ${ex ? `<div class="prop tm-foot-info">${ex.createdAt ? `Added ${ex.createdApprox ? 'around ' : ''}${esc(fmtDateTime(ex.createdAt))}` : 'Added date not recorded'}${ex.createdBy ? ' by ' + esc(ex.createdBy) : ''}${ex.lastDoneAt ? `<br>Last done ${timeAgo(ex.lastDoneAt)}${ex.lastDoneBy ? ' by ' + esc(ex.lastDoneBy) : ''}` : ''}${ex.done && ex.completedAt ? `<br>Completed ${timeAgo(ex.completedAt)}${ex.completedBy ? ' by ' + esc(ex.completedBy) : ''}` : ''}</div>` : ''}
      </div>
    </div>
    <div class="modal-foot">${ex ? `<button class="btn btn-danger" data-m="delete">${ico('trash', 'i-sm')} Delete</button>
      <button class="btn" data-m="duplicate">${ico('copy', 'i-sm')} Duplicate</button>
      <button class="btn" data-m="archive">${ico('archive', 'i-sm')} ${ex.archived ? 'Restore' : 'Archive'}</button>` : ''}<span class="spacer"></span>
      ${ex ? '' : '<button class="btn" data-m="x">Cancel</button>'}<button class="btn btn-primary" data-m="save">${ex ? 'Save' : 'Add task'}</button></div>`, 'wide');

  const q = s => w.querySelector(s);
  const title = q('[data-f=title]'), desc = q('[data-f=description]');
  const grow = el => { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; };
  const crumb = () => { const p = S.data.projects[d.projectId], s = d.sectionId && S.data.sections[d.sectionId];
    if (isStep) { const b = S.data.briefs[d.briefId]; q('[data-crumb]').innerHTML = b ? `${ico('brief', 'i-sm')} ${esc(briefRef(b))} <span style="color:var(--faint)">/</span> ${esc(b.title || '')}` : ''; return; }
    q('[data-crumb]').innerHTML = p && p.kind === 'client' ? `${ico('client', 'i-sm')} ${esc(p.name)}${s ? ` <span style="color:var(--faint)">/</span> ${esc(s.name)}` : ''}` : p ? `<span class="tx-${esc(p.color || 'grey')}" style="font-weight:700">#</span> ${esc(p.name)}${s ? ` <span style="color:var(--faint)">/</span> ${esc(s.name)}` : ''}` : ''; };
  const recurUI = () => {
    const t = q('[data-f=recurType]').value;
    q('[data-every-wrap]').classList.toggle('hidden', !t || t === 'weekdays');
    const r = t ? { type: t, every: +q('[data-f=every]').value || 1 } : null;
    const due = q('[data-f=due]').value;
    q('[data-recur-hint]').textContent = r ? `${recurLabel(r)}${due ? ' · from ' + longDay(due) : ' · starting today'}. Ticking it off moves it to the next date.` : '';
  };
  const renderSubs = () => {
    q('[data-subs]').innerHTML = d.subtasks.map((s, i) => `<div class="sub-row ${s.done ? 'done' : ''}" data-sub-row="${i}">
      ${d.subtasks.length > 1 ? `<span class="sub-grip" data-sub-grip="${i}" title="Drag to reorder (or Alt+↑/↓)">${ico('grip', 'i-sm')}</span>` : ''}
      <button class="check ${s.done ? 'checked' : ''}" data-sub-toggle="${i}">${ico('check')}</button>
      <input class="bare" data-sub-edit="${i}" value="${esc(s.title)}" maxlength="200">
      <button class="icon-btn" data-sub-del="${i}" title="Remove">${ico('x', 'i-sm')}</button></div>`).join('');
    q('[data-subcount]').textContent = d.subtasks.length ? `${d.subtasks.filter(s => s.done).length}/${d.subtasks.length}` : '';
    const p = subProgress(d), box = q('[data-subprog]');
    box.hidden = !p.total;
    box.classList.toggle('full', p.total > 0 && p.n === p.total);
    box.querySelector('i').style.width = p.pct + '%';
    box.querySelector('.sp-lbl').textContent = p.n === p.total && p.total ? `All ${p.total} done · 100%` : `${p.n} of ${p.total} done · ${p.pct}%`;
  };
  const renderComments = () => {
    const box = q('[data-comments]'); if (!box) return;
    const cs = (S.data.tasks[d.id]?.comments) || [];
    box.innerHTML = cs.map(c => `<div class="comment"><span class="avatar">${esc(initials(c.by))}</span><div class="c-body">
      <div class="c-meta"><b>${esc(c.by)}</b>${timeAgo(c.at)}${c.byEmail === (S.user?.email || '') ? ` · <button data-cdel="${c.id}" style="color:var(--faint);font-size:11px">delete</button>` : ''}</div>
      <div class="c-text">${esc(c.text)}</div></div></div>`).join('') || '<div class="hint" style="color:var(--faint);font-size:12px">No comments yet - handy for handover notes.</div>';
  };
  crumb(); recurUI(); renderSubs(); renderComments(); taskExtrasWire(w, d);
  setTimeout(() => { grow(title); grow(desc); }, 0);

  const collect = () => {
    d.title = title.value.trim(); d.description = desc.value.trim();
    if (!isStep) { const [p, s] = q('[data-f=loc]').value.split('|'); d.projectId = p; d.sectionId = s || null; }
    if (isStep && q('[data-f=status]')) { d.status = q('[data-f=status]').value; const sl = q('[data-f=slaDays]').value; d.slaDays = sl === '' ? null : Math.max(0, Math.min(60, +sl || 0)); }
    d.due = q('[data-f=due]').value || null; d.time = q('[data-f=time]').value || null;
    const rt = q('[data-f=recurType]').value;
    d.recur = rt ? { type: rt, every: Math.max(1, Math.min(99, +q('[data-f=every]').value || 1)) } : null;
    if (d.recur && !d.due) d.due = todayKey();
    if (d.recur && ['monthly', 'yearly'].includes(rt)) d.recur.day = parseKey(d.due).getDate();
    d.deadline = q('[data-f=deadline]').value || null;
    d.priority = +q('[data-f=priority]').value || 4;
    d.assignee = q('[data-f=assignee]').value || null;
    d.subtasks = d.subtasks.filter(s => s.title.trim());
  };
  const dirty = () => { collect(); return JSON.stringify(pick(d, EDITABLE)) !== orig; };
  const save = async () => {
    collect();
    if (!d.title) { title.focus(); toast('Give the task a name first'); return false; }
    if (ex) {
      if (!S.data.tasks[d.id]) { w.close(); return true; }
      const before = clone(S.data.tasks[d.id]);
      const moved = ex.projectId !== d.projectId || (ex.sectionId || null) !== d.sectionId;
      const data = { ...pick(d, EDITABLE), updatedAt: Date.now(), updatedBy: me() };
      if (isStep) { delete data.status; if ((ex.assignee || null) !== (d.assignee || null)) data.assignedAt = d.assignee ? Date.now() : null; }   // status changes go through setStepStatus (timestamps + log)
      else { delete data.status; delete data.slaDays; }
      if (moved) data.order = nextOrder(tasksIn(d.projectId, d.sectionId, true));
      await store.update('tasks', d.id, data);
      afterTaskSave(before, d);
    } else {
      d.order = nextOrder(tasksIn(d.projectId, d.sectionId, true)); d.createdAt = Date.now();
      if (!d.briefId) { delete d.status; delete d.slaDays; }
      await store.put('tasks', d);
      afterTaskSave(null, d);
    }
    w.close(); return true;
  };
  w.onDismiss = async () => {
    if (ex) { if (dirty()) await save(); else w.close(); return; }
    if (title.value.trim() && !await confirmBox('Discard this new task?', 'Discard', 'Discard task?')) return;
    w.close();
  };
  title.addEventListener('input', () => grow(title));
  title.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); save(); } });
  desc.addEventListener('input', () => grow(desc));
  if (!isStep) q('[data-f=loc]').addEventListener('change', () => { collect(); crumb(); });
  q('[data-f=recurType]').addEventListener('change', recurUI);
  q('[data-f=every]').addEventListener('input', recurUI);
  q('[data-f=due]').addEventListener('change', recurUI);
  q('[data-f=priority]').addEventListener('change', e => { const c = q('.tm-title-row .check'); c.className = c.className.replace(/p\d/, 'p' + e.target.value); });
  q('[data-subnew]').addEventListener('keydown', e => {
    if (e.key !== 'Enter') return; e.preventDefault();
    const v = e.target.value.trim(); if (!v) return;
    d.subtasks.push({ id: uid(), title: v, done: false }); e.target.value = ''; renderSubs();
  });
  w.addEventListener('input', e => { const i = e.target.dataset.subEdit; if (i != null) d.subtasks[i].title = e.target.value; });
  // Reorder sub-tasks: drag a row by its handle (mouse or touch), or Alt+↑/↓ while typing in one.
  const moveSub = (from, to, focus) => {
    if (to < 0 || to >= d.subtasks.length || from === to) return;
    const [s] = d.subtasks.splice(from, 1); d.subtasks.splice(to, 0, s); renderSubs();
    if (focus) { const inp = q(`[data-sub-edit="${to}"]`); if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); } }
  };
  w.addEventListener('keydown', e => {
    const i = e.target.dataset && e.target.dataset.subEdit;
    if (i == null || !e.altKey || !['ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault(); moveSub(+i, +i + (e.key === 'ArrowUp' ? -1 : 1), true);
  });
  let sd = null;
  const subEnd = commit => {
    if (!sd) return;
    const { from, to } = sd;
    sd.rows.forEach(r => { r.style.transform = ''; r.style.transition = ''; r.classList.remove('sub-dragging'); });
    q('[data-subs]').classList.remove('sub-sorting');
    sd = null;
    if (commit && to !== from) moveSub(from, to);
  };
  w.addEventListener('pointerdown', e => {
    const g = e.target.closest('[data-sub-grip]'); if (!g || e.button !== 0) return;
    e.preventDefault();
    const list = q('[data-subs]'), rows = [...list.querySelectorAll('[data-sub-row]')], row = g.closest('[data-sub-row]');
    const from = rows.indexOf(row); if (from < 0) return;
    sd = { from, to: from, row, rows, y0: e.clientY, rects: rows.map(r => r.getBoundingClientRect()) };
    try { g.setPointerCapture(e.pointerId); } catch { }
    row.classList.add('sub-dragging'); list.classList.add('sub-sorting');
  });
  w.addEventListener('pointermove', e => {
    if (!sd) return;
    if (e.buttons === 0) return subEnd(true);
    const { rects, from, rows } = sd, h = rects[from].height;
    const top = rects[0].top - rects[from].top, bottom = rects[rects.length - 1].top - rects[from].top;
    const dy = Math.max(top - 6, Math.min(bottom + 6, e.clientY - sd.y0));
    sd.row.style.transform = `translateY(${dy}px)`;
    const cy = rects[from].top + h / 2 + dy;
    let to = rects.filter((rc, i) => i !== from && cy > rc.top + rc.height / 2).length;
    sd.to = to;
    rows.forEach((r, i) => {
      if (i === from) return;
      r.style.transition = 'transform .18s var(--ease)';
      r.style.transform = from < to && i > from && i <= to ? `translateY(${-h}px)` : to < from && i >= to && i < from ? `translateY(${h}px)` : '';
    });
  });
  w.addEventListener('pointerup', () => subEnd(true));
  w.addEventListener('pointercancel', () => subEnd(false));
  w.addEventListener('click', async e => {
    const b = e.target.closest('[data-m],[data-sub-toggle],[data-sub-del],[data-cdel]'); if (!b) return;
    if (b.dataset.subToggle != null) { const s = d.subtasks[b.dataset.subToggle]; s.done = !s.done; renderSubs(); return; }
    if (b.dataset.subDel != null) { d.subtasks.splice(+b.dataset.subDel, 1); renderSubs(); return; }
    if (b.dataset.cdel) { const t = S.data.tasks[d.id]; await store.update('tasks', d.id, { comments: (t.comments || []).filter(c => c.id !== b.dataset.cdel) }); renderComments(); return; }
    const m = b.dataset.m;
    if (m === 'x') return w.onDismiss();
    if (m === 'save') return save();
    if (m === 'go-brief') { if (dirty()) { if (!await save()) return; } else w.close(); return go('#/brief/' + d.briefId); }
    if (m === 'clear-due') { q('[data-f=due]').value = ''; q('[data-f=time]').value = ''; q('[data-f=recurType]').value = ''; recurUI(); }
    if (m === 'clear-deadline') q('[data-f=deadline]').value = '';
    if (m === 'delete') { if (await deleteTask(d.id)) w.close(); }
    if (m === 'archive') {
      if (dirty()) { if (!await save()) return; } else w.close();
      return archiveTask(S.data.tasks[d.id], !ex.archived);
    }
    if (m === 'duplicate') {
      if (dirty()) await save(); else w.close();
      const nid = await duplicateTask(d.id);
      if (nid) openTask(nid);
    }
    if (m === 'complete') { if (dirty()) { if (!await save()) return; } else w.close(); toggleTask(d.id); }
    if (m === 'comment') {
      const ta = q('[data-cnew]'), text = ta.value.trim(); if (!text) return ta.focus();
      const t = S.data.tasks[d.id];
      await store.update('tasks', d.id, { comments: [...(t.comments || []), { id: uid(), by: me(), byEmail: S.user?.email || '', at: Date.now(), text }] });
      logAct('comment', { kind: t.briefId ? 'step' : 'task', briefId: t.briefId || null, taskId: t.id, clientIds: t.briefId ? ((S.data.briefs[t.briefId] || {}).clientIds || []) : clientIdsOf(t), title: t.title, detail: text.slice(0, 200) });
      // people on the task hear about new comments
      [t.assignee, t.briefId && (S.data.briefs[t.briefId] || {}).ownerId].filter((x, i, a) => x && a.indexOf(x) === i).forEach(pid => notify(pid, { kind: 'comment', title: `${me()} commented on ${t.title}`, body: text.slice(0, 160), link: t.briefId ? `#/brief/${t.briefId}` : '#/mywork', briefId: t.briefId || null, taskId: t.id }));
      ta.value = ''; renderComments();
    }
  });
}

/* ===================== calendar entry modal ===================== */
function openEvent(id, { day } = {}) {
  const ex = id ? S.data.events[id] : null;
  const base = day || todayKey();
  const d = ex ? clone(ex) : { id: uid(), person: '', type: types()[0].id, title: '', start: base, end: base, time: '', timeEnd: '', repeat: { type: 'none', every: 1, until: '' }, note: '', skip: [] };
  d.repeat = d.repeat || { type: 'none', every: 1, until: '' };
  const isRep = ex && d.repeat.type !== 'none', multi = ex && (d.end || d.start) !== d.start;
  const repVal = d.repeat.type === 'weekly' ? (d.repeat.every === 2 ? 'biweekly' : 'weekly') : d.repeat.type;
  const w = openModal(`
    <div class="modal-head"><h2>${ex ? 'Edit calendar entry' : 'Add leave / event'}</h2><button class="icon-btn" data-m="x">${ico('x')}</button></div>
    <form class="modal-body">
      <div class="row2">
        <div class="field"><label>Who</label><select class="sel" data-f="person"><option value="">- Whole team / nobody -</option>
          ${people().map(p => `<option value="${p.id}" ${d.person === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}<option value="__new">＋ Add a person…</option></select></div>
        <div class="field"><label>Type</label><select class="sel" data-f="type">${types().map(t => `<option value="${t.id}" ${d.type === t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></div>
      </div>
      <div class="field"><label>Title <span style="font-weight:400;color:var(--faint)">(optional)</span></label><input class="inp" data-f="title" value="${esc(d.title)}" maxlength="120"></div>
      <div class="row2">
        <div class="field"><label>From</label><input type="date" class="inp" data-f="start" value="${d.start}" required></div>
        <div class="field"><label>To</label><input type="date" class="inp" data-f="end" value="${d.end || d.start}"></div>
      </div>
      <div class="row2">
        <div class="field"><label>Start time <span style="font-weight:400;color:var(--faint)">(optional)</span></label><input type="time" class="inp" data-f="time" value="${d.time || ''}"></div>
        <div class="field"><label>End time</label><input type="time" class="inp" data-f="timeEnd" value="${d.timeEnd || ''}"></div>
      </div>
      <div class="row2">
        <div class="field"><label>Repeat</label><select class="sel" data-f="repeat">${[['none', 'Does not repeat'], ['weekly', 'Every week'], ['biweekly', 'Every 2 weeks'], ['monthly', 'Every month']].map(([v, l]) => `<option value="${v}" ${repVal === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <div class="field" data-until><label>Until <span style="font-weight:400;color:var(--faint)">(optional)</span></label><input type="date" class="inp" data-f="until" value="${d.repeat.until || ''}"></div>
      </div>
      <div class="field" style="margin-bottom:0"><label>Note</label><textarea class="ta" data-f="note" rows="2" style="min-height:52px" maxlength="2000">${esc(d.note || '')}</textarea></div>
      ${(d.skip || []).length ? `<div class="hint" style="font-size:11.5px;color:var(--faint);margin-top:8px">Removed days: ${d.skip.map(fmtDay).join(', ')} · <button type="button" data-m="unskip" style="color:var(--accent-text);font-size:11.5px">restore</button></div>` : ''}
      <button type="submit" hidden></button>
    </form>
    <div class="modal-foot">${ex ? `<button class="btn btn-danger" data-m="delete">${ico('trash', 'i-sm')} Delete</button>` : ''}
      ${ex && day && (isRep || multi) ? `<button class="btn" data-m="skip" title="Keep the rest, remove just this day">Remove ${fmtDay(day)} only</button>` : ''}
      <span class="spacer"></span><button class="btn" data-m="x">Cancel</button><button class="btn btn-primary" data-m="save">Save</button></div>`);
  const q = s => w.querySelector(s);
  const untilUI = () => q('[data-until]').classList.toggle('hidden', q('[data-f=repeat]').value === 'none');
  const placeholder = () => { const p = personById(q('[data-f=person]').value), t = typeById(q('[data-f=type]').value); q('[data-f=title]').placeholder = p ? `${p.name} - ${t.name}` : t.name; };
  untilUI(); placeholder();
  q('[data-f=repeat]').onchange = untilUI;
  q('[data-f=type]').onchange = placeholder;
  q('[data-f=start]').onchange = () => { const s = q('[data-f=start]'), e = q('[data-f=end]'); if (!e.value || e.value < s.value) e.value = s.value; };
  q('[data-f=person]').onchange = async e => {
    if (e.target.value !== '__new') return placeholder();
    const r = await promptBox({ title: 'Add a teammate', placeholder: 'e.g. Ali', color: COLORS[people().length % COLORS.length] });
    if (!r) { e.target.value = d.person || ''; return placeholder(); }
    const p = { id: uid(), name: r.value, color: r.color };
    await saveSettings({ people: [...people(), p] });
    const opt = document.createElement('option'); opt.value = p.id; opt.textContent = p.name;
    e.target.insertBefore(opt, e.target.lastElementChild); e.target.value = p.id; placeholder();
  };
  const save = async () => {
    const start = q('[data-f=start]').value; if (!start) return q('[data-f=start]').focus();
    let end = q('[data-f=end]').value || start; if (end < start) end = start;
    const rv = q('[data-f=repeat]').value;
    const obj = { ...d, person: q('[data-f=person]').value.replace('__new', ''), type: q('[data-f=type]').value, title: q('[data-f=title]').value.trim(),
      start, end, time: q('[data-f=time]').value, timeEnd: q('[data-f=timeEnd]').value, note: q('[data-f=note]').value.trim(),
      repeat: rv === 'none' ? { type: 'none', every: 1, until: '' } : { type: rv === 'monthly' ? 'monthly' : 'weekly', every: rv === 'biweekly' ? 2 : 1, until: q('[data-f=until]').value || '' },
      updatedAt: Date.now(), updatedBy: me() };
    if (!ex) { obj.createdAt = Date.now(); obj.createdBy = me(); }
    await store.put('events', obj); w.close();
  };
  w.onDismiss = () => w.close();
  q('form').onsubmit = e => { e.preventDefault(); save(); };
  w.addEventListener('click', async e => {
    const b = e.target.closest('[data-m]'); if (!b) return;
    const m = b.dataset.m;
    if (m === 'x') w.close();
    if (m === 'save') save();
    if (m === 'skip') { await store.update('events', d.id, { skip: [...(d.skip || []), day] }); w.close(); undoable(`Removed ${fmtDay(day)}`, `remove ${fmtDay(day)}`, () => store.update('events', d.id, { skip: d.skip || [] })); }
    if (m === 'unskip') { await store.update('events', d.id, { skip: [] }); w.close(); }
    if (m === 'delete') {
      if (!await confirmBox(`Delete <b>${esc(evTitle(d))}</b>${isRep ? ' and all its repeats' : ''}?`)) return;
      w.close(); await trashItems('event', evTitle(ex), [{ col: 'events', data: ex }], `Calendar · ${fmtDay(ex.start)}${ex.end && ex.end !== ex.start ? ' - ' + fmtDay(ex.end) : ''}`);
    }
  });
}

function openDay(day) {
  const evs = Object.values(S.data.events).filter(ev => eventDays(ev, day, day).length).map(ev => ({ kind: 'ev', ev, d: day }));
  const ts = activeTasks().filter(t => t.due === day).map(t => ({ kind: 'task', t, d: day }));
  const w = openModal(`<div class="modal-head"><h2>${longDay(day)}</h2><button class="icon-btn" data-x>${ico('x')}</button></div>
    <div class="modal-body" style="display:flex;flex-direction:column;gap:4px">${[...evs, ...ts].map(calItemHTML).join('') || '<span style="color:var(--faint)">Nothing scheduled.</span>'}</div>
    <div class="modal-foot"><button class="btn" data-add="ev">${ico('plus', 'i-sm')} Leave / event</button><button class="btn" data-add="task">${ico('plus', 'i-sm')} Task</button><span class="spacer"></span><button class="btn" data-x>Close</button></div>`);
  $$('[draggable]', w).forEach(x => x.removeAttribute('draggable'));
  $$('[data-x]', w).forEach(b => b.onclick = () => w.close());
  w.querySelector('[data-add=ev]').onclick = () => { w.close(); openEvent(null, { day }); };
  w.querySelector('[data-add=task]').onclick = () => { w.close(); openTask(null, { due: day }); };
}

/* ===================== search ===================== */
function openSearch() {
  const w = openModal(`<div class="modal-head">${ico('search')}<input class="inp" data-q placeholder="Search tasks, briefs, brands and notes…" autofocus style="border:0;background:transparent;padding:4px 0"><button class="icon-btn" data-x>${ico('x')}</button></div>
    <div class="modal-body"><div class="search-list" data-res></div></div>`, 'wide');
  const inp = w.querySelector('[data-q]'), res = w.querySelector('[data-res]');
  const run = () => {
    const v = inp.value.trim().toLowerCase();
    if (!v) { res.innerHTML = '<div style="color:var(--faint);padding:6px 0">Type to search tasks, briefs, clients and notes.</div>'; return; }
    const brs = Object.values(S.data.briefs).filter(b => `${b.ref} ${b.title} ${b.type || ''} ${b.offer || ''} ${b.promo || ''}`.toLowerCase().includes(v)).sort((a, b) => (b.seq || 0) - (a.seq || 0)).slice(0, 12);
    const hts = clients(true).filter(h => `${h.name} ${h.group || ''} ${h.sector || ''} ${h.market || ''}`.toLowerCase().includes(v)).slice(0, 12);
    const notes = Object.values(S.data.notes).filter(n => `${n.title || ''} ${n.text || ''} ${(n.tags || []).join(' ')}`.toLowerCase().includes(v))
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 20);
    const hits = Object.values(S.data.tasks).filter(t => !inArchivedProject(t) && (t.title + ' ' + (t.description || '') + ' ' + (t.subtasks || []).map(s => s.title).join(' ')).toLowerCase().includes(v))
      .sort((a, b) => a.done - b.done).slice(0, 60);
    res.innerHTML = (hts.length ? `<div class="group-head">Brands <span class="cnt">${hts.length}</span></div>` + hts.map(h => `<div class="row" data-sgo="#/client/${h.id}">${ico('client')}<div class="card-body"><div class="card-title">${esc(h.name)}</div><div class="card-desc">${esc([h.group, h.sector, h.market].filter(Boolean).join(' · '))}</div></div></div>`).join('') : '')
      + (brs.length ? `<div class="group-head">Briefs <span class="cnt">${brs.length}</span></div>` + brs.map(b => `<div class="row" data-sgo="#/brief/${b.id}">${ico('brief')}<div class="card-body"><div class="card-title">${esc(briefLabel(b))}</div><div class="card-desc">${esc(b.status)} · ${esc((b.clientIds || []).map(clientName).join(', '))}</div></div></div>`).join('') : '')
      + (hts.length || brs.length ? `<div class="group-head">Tasks <span class="cnt">${hits.length}</span></div>` : '')
      + (hits.map(anyRow).join('') || '<div style="color:var(--faint);padding:6px 0">No matching tasks.</div>')
      + (notes.length ? `<div class="group-head" style="padding-top:16px">Notes <span class="cnt">${notes.length}</span></div>` + notes.map(n => {
        const t = (n.text || '').replace(/\s+/g, ' '), i = t.toLowerCase().indexOf(v), snip = i < 0 ? t.slice(0, 120) : (i > 40 ? '…' : '') + t.slice(Math.max(0, i - 40), i + 80);
        return `<div class="row" data-note="${n.id}">${ico('notebook')}<div class="card-body"><div class="card-title">${esc(n.title || 'Untitled')}</div><div class="card-desc">${esc(snip)}</div></div></div>`; }).join('') : '');
  };
  run(); inp.oninput = run;
  w.querySelector('[data-x]').onclick = () => w.close();
  res.addEventListener('click', e => {
    const chk = e.target.closest('[data-action=toggle-task]'); if (chk) { e.stopPropagation(); toggleTask(chk.dataset.id, chk).then(() => setTimeout(run, 50)); return; }
    const row = e.target.closest('[data-action=open-task]'); if (row) { e.stopPropagation(); w.close(); openTask(row.dataset.id); return; }
    const nr = e.target.closest('[data-note]'); if (nr) { e.stopPropagation(); w.close(); go('#/notes/' + nr.dataset.note); return; }
    const sg = e.target.closest('[data-sgo]'); if (sg) { e.stopPropagation(); w.close(); go(sg.dataset.sgo); }
  });
}

/* ===================== settings ===================== */
function accountSettingsHTML() {
  const a = S.acc; if (!a) return '';
  const admin = canAdminAcc();
  return `<div class="set-h" data-sec="account">${ico('client')} Account</div>
    <div class="acc-set">${accLogo(a, 'xl')}<div style="flex:1;min-width:0"><b class="acc-set-name">${esc(a.name)}</b><div class="mut" style="margin-top:2px">${esc(a.parentId && accAncestors(a).length ? `${kindLabel(a.kind) || 'Sub-account'} in ${accAncestors(a).map(p => p.name).reverse().join(' › ')}` : a.sector || 'No sector')} · your access ${roleTag(S.accRole)}</div>
      ${accChildren(a.id, false).length ? `<div class="mut" style="margin-top:2px">Sub-accounts: ${esc(accChildren(a.id, false).map(accLabel).join(', '))}</div>` : ''}
      ${admin ? `<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap"><button class="btn sm" data-accedit>${ico('pencil', 'i-sm')} Name, logo &amp; colour</button><button class="btn sm" data-accaccess>${ico('people', 'i-sm')} Access · ${plural((a.memberEmails || []).length, 'person', 'people')}</button></div>` : ''}</div></div>
    <div class="set-h" data-sec="tools">${ico('grid')} Tools</div>
    <p class="set-p">${admin ? 'Switch tools on or off for everyone in this account. Nothing is deleted when a tool is off - switch it back on and everything is still there.' : 'The tools an account admin has switched on here.'}</p>
    ${admin ? toolPresets() + toolsGrid(a.modules || {}) : `<div class="chips">${TOOLS.filter(t => toolOn(t[0])).map(t => `<span class="tag">${esc(t[1])}</span>`).join('')}</div>`}`;
}
function openSettings(focus) {
  const w = openModal(`<div class="modal-head"><h2>Account settings${S.acc ? ` · ${esc(S.acc.name)}` : ''}</h2><button class="icon-btn" data-x>${ico('x')}</button></div><div class="modal-body" data-body style="max-height:70vh;overflow:auto"></div>
    <div class="modal-foot"><span class="spacer"></span><button class="btn btn-primary" data-x>Done</button></div>`, 'wide');
  $$('[data-x]', w).forEach(b => b.onclick = () => w.close());
  w.onDismiss = () => w.close();
  const body = w.querySelector('[data-body]');
  const draw = () => {
    const ppl = people(), tys = types();
    const missing = S.acc ? Object.entries(S.acc.roles || {}).filter(([em, r]) => roleRank(r) >= 2 && !personByEmail(em)).map(([em]) => em) : [];
    body.innerHTML = `
      ${accountSettingsHTML()}
      <div class="set-h" data-sec="team">${ico('user')} Team for this account</div>
      <p class="set-p">People you assign briefs, steps and tasks to in this account. Their <b>email</b> is where notifications go and links their sign-in to “My work”; their <b>role</b> decides which workflow steps they get. Who can open the account is set under Access.</p>
      ${missing.length && canEditAcc() ? `<div class="ct-banner" style="margin-bottom:8px">${ico('user')}<div>${plural(missing.length, 'person', 'people')} with access ${missing.length === 1 ? 'isn’t' : 'aren’t'} on this team list yet (${esc(missing.map(memberName).join(', '))}).</div><button class="btn sm" data-addall>Add ${missing.length === 1 ? 'them' : 'everyone'}</button></div>` : ''}
      ${ppl.map(p => `<div class="set-row team-row"><button class="dot sw-${esc(p.color || 'grey')}" data-pcolor="${p.id}" title="Change color"></button><input class="inp" data-pname="${p.id}" value="${esc(p.name)}" maxlength="60" placeholder="Name">
        <input class="inp" data-pemail="${p.id}" value="${esc(p.email || '')}" type="email" placeholder="email for notifications" maxlength="254">
        <select class="sel" data-prole="${p.id}"><option value="">Role…</option>${rolesList().map(r => `<option ${p.role === r ? 'selected' : ''}>${esc(r)}</option>`).join('')}</select>${p.demo ? '<span class="tag">sample</span>' : ''}
        <button class="icon-btn" data-pdel="${p.id}" title="Remove">${ico('trash', 'i-sm')}</button></div>`).join('')}
      <form class="set-row team-row" data-add-person><span style="width:14px"></span><input class="inp" name="pn" placeholder="Name" maxlength="60"><input class="inp" name="pe" type="email" placeholder="email" maxlength="254">
        <select class="sel" name="pr"><option value="">Role…</option>${rolesList().map(r => `<option>${esc(r)}</option>`).join('')}</select><button class="btn">Add</button></form>

      ${toolOn('calendar') ? `<div class="set-h">${ico('cal')} Calendar entry types</div>
      <p class="set-p">Rename these to match how your team talks (e.g. “Work from Leb”). Click the square to change its color.</p>
      ${tys.map(t => `<div class="set-row"><button class="dot ev-${esc(t.color)}" style="outline:1px solid var(--line2)" data-tcolor="${t.id}" title="Change color"></button><input class="inp" data-tname="${t.id}" value="${esc(t.name)}" maxlength="40"><button class="icon-btn" data-tdel="${t.id}" title="Remove">${ico('trash', 'i-sm')}</button></div>`).join('')}
      <form class="set-row" data-add-type><input class="inp" placeholder="Add a type, e.g. Sick leave" maxlength="40"><button class="btn">Add</button></form>` : ''}

      ${clientSettingsHTML()}

      <div class="set-h">${ico('moon')} Appearance</div>
      <div class="set-row" style="border:0"><div class="seg"><button class="${document.documentElement.dataset.theme === 'dark' ? 'on' : ''}" data-theme-set="dark">Dark</button><button class="${document.documentElement.dataset.theme === 'light' ? 'on' : ''}" data-theme-set="light">Light</button></div></div>

      <div class="set-h">${ico('download')} Backup</div>
      <p class="set-p">Download everything as a file, or restore from one (also how you move local-mode data into the synced version).</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-export>${ico('download', 'i-sm')} Export backup</button><label class="btn" style="cursor:pointer">${ico('upload', 'i-sm')} Import backup<input type="file" accept=".json,application/json" data-import hidden></label></div>

      ${S.mode === 'cloud' && isBizAdmin() ? `<div class="set-h">${ico('eye')} Security log</div>
      <p class="set-p">Access changes, bulk deletes and refused writes in this account. Entries can't be edited or deleted; only business admins can see them.</p>
      <button class="btn" data-auditlog>${ico('eye', 'i-sm')} View security log</button>` : ''}

      <div class="set-h">${ico('alert')} About</div>
      <p class="set-p">dentsu ${esc(CFG.appName || 'Ads Workspace')} · build <b>${BUILD}</b>${S.mode === 'cloud' ? ' · synced' : ' · local mode'}. Shortcuts: <kbd>Q</kbd> add task · <kbd>/</kbd> search · <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>Z</kbd> undo the last delete, completion or archive.</p>`;
  };
  draw();
  clientSettingsWire(body, draw);
  if (focus) setTimeout(() => { const el = body.querySelector(`[data-sec="${focus}"]`); if (el) el.scrollIntoView({ block: 'start' }); }, 30);
  body.addEventListener('change', async e => {
    const t = e.target;
    if (t.dataset.tool && S.acc && canAdminAcc()) {
      const modules = { ...(S.acc.modules || {}), [t.dataset.tool]: t.checked };
      if (!TOOLS.some(x => modules[x[0]] !== false)) { t.checked = true; return toast('Keep at least one tool on'); }
      t.closest('.tool-tile').classList.toggle('on', t.checked);
      await bizApi.patchAccount(S.acc.id, { modules, updatedAt: Date.now() });
      audit('tools_changed', `${toolName(t.dataset.tool)} ${t.checked ? 'on' : 'off'}`);
    }
  });
  body.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.preset && S.acc && canAdminAcc()) {
      const modules = presetModules(b.dataset.preset === 'all');
      await bizApi.patchAccount(S.acc.id, { modules, updatedAt: Date.now() });
      audit('tools_changed', b.dataset.preset === 'all' ? 'All tools on' : 'Essentials only');
      $$('[data-tool]', body).forEach(c => { c.checked = modules[c.dataset.tool] !== false; c.closest('.tool-tile').classList.toggle('on', c.checked); });
      return;
    }
    if ('accedit' in b.dataset) { w.close(); openAccountForm(S.acc.id); }
    if ('accaccess' in b.dataset) { w.close(); openAccessModal(S.acc.id); }
    if ('addall' in b.dataset) {
      const add = Object.entries(S.acc.roles || {}).filter(([em, r]) => roleRank(r) >= 2 && !personByEmail(em)).map(([em], i) => { const m = S.biz.members[em] || {};
        return { id: uid(), name: m.name || em.split('@')[0], email: em, role: rolesList().includes(m.jobRole) ? m.jobRole : '', color: m.color || COLORS[(people().length + i) % 8] }; });
      await saveSettings({ people: [...people(), ...add] }); draw();
    }
  });
  const cycle = c => COLORS[(COLORS.indexOf(c) + 1) % COLORS.length];
  body.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return;
    const ds = b.dataset;
    if (ds.pcolor) { await saveSettings({ people: people().map(p => p.id === ds.pcolor ? { ...p, color: cycle(p.color || 'grey') } : p) }); draw(); }
    if (ds.pdel) { const p = personById(ds.pdel); if (await confirmBox(`Remove <b>${esc(p.name)}</b> from the team list? Their calendar entries stay but show without a name.`, 'Remove')) { await saveSettings({ people: people().filter(x => x.id !== ds.pdel) }); draw(); } }
    if (ds.tcolor) { await saveSettings({ types: types().map(t => t.id === ds.tcolor ? { ...t, color: cycle(t.color) } : t) }); draw(); }
    if (ds.tdel) { if (types().length <= 1) return toast('Keep at least one type'); if (await confirmBox('Remove this type? Entries using it will show as “Other”.', 'Remove')) { await saveSettings({ types: types().filter(x => x.id !== ds.tdel) }); draw(); } }
    if (ds.mdel) {
      if (!await confirmBox(`Remove access for <b>${esc(ds.mdel)}</b>?`, 'Remove')) return;
      audit('member_removed', ds.mdel);
      if (!S.ws || S.ws.root) await store.del('members', ds.mdel);
      else { await S.wsApi.setMembers((S.ws.memberEmails || []).filter(x => x !== ds.mdel)); S.ws.memberEmails = (S.ws.memberEmails || []).filter(x => x !== ds.mdel); }
      setTimeout(draw, 100);
    }
    if (ds.themeSet) { setTheme(ds.themeSet); draw(); }
    if ('export' in ds) exportData();
    if ('auditlog' in ds) openAuditLog();
  });
  body.addEventListener('change', async e => {
    const t = e.target, ds = t.dataset;
    if (ds.pname) { const v = t.value.trim(); if (v) await saveSettings({ people: people().map(p => p.id === ds.pname ? { ...p, name: v } : p) }); }
    if (ds.tname) { const v = t.value.trim(); if (v) await saveSettings({ types: types().map(x => x.id === ds.tname ? { ...x, name: v } : x) }); }
    if ('myname' in ds) { const v = t.value.trim() || 'Me'; S.user.name = v; lsSet('tb:name', v); render(); }
    if ('wsname' in ds) { const v = t.value.trim().slice(0, 100); if (v && S.ws && v !== S.ws.name) { audit('workspace_renamed', `${S.ws.name} → ${v}`); await S.wsApi.rename(v); S.ws.name = v; const e = S.workspaces.find(x => x.id === S.ws.id); if (e) e.name = v; render(); } }
    if ('import' in ds && t.files[0]) { await importData(t.files[0]); t.value = ''; }
  });
  body.addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target, inp = f.querySelector('input'), v = inp.value.trim(); if (!v) return;
    if ('addPerson' in f.dataset) {
      const em = (f.pe.value || '').trim().toLowerCase();
      if (em && !okEmailId(em)) return toast('That doesn’t look like an email');
      if (em && personByEmail(em)) return toast('Someone on the team already has that email');
      await saveSettings({ people: [...people(), { id: uid(), name: v, email: em, role: f.pr.value || '', color: COLORS[people().length % COLORS.length] }] });
    }
    if ('addType' in f.dataset) await saveSettings({ types: [...types(), { id: uid(), name: v, color: COLORS[(types().length + 3) % COLORS.length] }] });
    if ('addMember' in f.dataset) {
      const em = v.toLowerCase();
      if (!/^[^@\s<>"'`&/]+@[^@\s<>"'`&/]+\.[^@\s<>"'`&/]+$/.test(em) || em.length > 254) return toast('That doesn’t look like an email');
      audit('member_added', em);
      if (!S.ws || S.ws.root) await store.put('members', { id: em, addedAt: Date.now(), addedBy: S.user?.email || '' });
      // someone with access is usually also someone you assign work to
      if (!personByEmail(em)) await saveSettings({ people: [...people(), { id: uid(), name: em.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), email: em, role: '', color: COLORS[people().length % COLORS.length] }] });
      else if (!(S.ws.memberEmails || []).includes(em)) {
        const next = [...(S.ws.memberEmails || []), em];
        await S.wsApi.setMembers(next); S.ws.memberEmails = next;
      }
      toast(`${em} can open ${S.ws ? S.ws.name : 'this workspace'} now - send them the link`);
    }
    setTimeout(() => { draw(); const again = body.querySelector(`[data-${f.dataset.addPerson !== undefined ? 'add-person' : f.dataset.addType !== undefined ? 'add-type' : 'add-member'}] input`); again && again.focus(); }, 60);
  });
}

/* ---------- security log viewer (owner only) ---------- */
const AUDIT_LABEL = { sign_in: 'Signed in', sign_out: 'Signed out', member_added: 'Gave access', member_removed: 'Removed access', workspace_renamed: 'Renamed workspace',
  bulk_delete: 'Deleted', deleted_forever: 'Deleted forever', trash_emptied: 'Emptied Recently deleted', backup_import: 'Imported a backup', write_denied: 'Refused write' };
const AUDIT_FLAG = new Set(['write_denied', 'member_added', 'member_removed', 'bulk_delete', 'deleted_forever', 'trash_emptied', 'backup_import']);
async function openAuditLog() {
  const w = openModal(`<div class="modal-head"><h2>Security log</h2><button class="icon-btn" data-x>${ico('x')}</button></div>
    <div class="modal-body" data-list style="max-height:65vh;overflow:auto"><div style="color:var(--faint)">Loading…</div></div>`, 'wide');
  w.querySelector('[data-x]').onclick = () => w.close();
  const box = w.querySelector('[data-list]');
  try {
    const snap = await S.auditList();
    const rows = []; snap.forEach(d => rows.push(d.data()));
    const ms = at => (at && typeof at.toMillis === 'function' ? at.toMillis() : at && at.seconds ? at.seconds * 1000 : +at || 0);
    box.innerHTML = rows.length ? `<table class="audit"><thead><tr><th>When</th><th>Who</th><th>What</th><th>Details</th></tr></thead><tbody>${rows.map(r =>
      `<tr class="${AUDIT_FLAG.has(r.action) ? 'flag' : ''}"><td>${esc(fmtDateTime(ms(r.at)))}</td><td>${esc(r.email)}</td><td>${esc(AUDIT_LABEL[r.action] || r.action)}</td><td>${esc(r.detail)}</td></tr>`).join('')}</tbody></table>`
      : '<div style="color:var(--faint)">Nothing logged yet.</div>';
  } catch (e) {
    box.innerHTML = `<div class="ct-banner">${ico('alert')}<div>The security log needs the updated security rules (publish the new <code>firestore.rules</code>).<br><span style="color:var(--faint)">${esc(e && e.code || '')}</span></div></div>`;
  }
}

/* ===================== backup ===================== */
function exportData() {
  const data = {}; ['projects', 'sections', 'tasks', 'events', 'meta', 'notes', 'briefs', 'accounts', 'campaigns'].forEach(c => data[c] = S.data[c]);
  const blob = new Blob([JSON.stringify({ app: 'tasks', version: 1, exportedAt: new Date().toISOString(), data }, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `tasks-backup-${todayKey()}.json`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
const MAX_IMPORT_BYTES = 10 * 1024 * 1024;   // 10 MB is far more than any real backup
async function importData(file) {
  if (!file || file.size > MAX_IMPORT_BYTES) return toast('That file is too large to be a backup (10 MB max)');
  let j; try { j = JSON.parse(await file.text()); } catch { return toast('That file isn’t a valid backup'); }
  const raw = j && j.data;
  const isMap = v => v && typeof v === 'object' && !Array.isArray(v);
  if (!isMap(raw) || !isMap(raw.projects)) return toast('That file isn’t a valid backup');
  // only known collections, every document cleaned exactly like data from the database
  const data = {};
  for (const c of ['projects', 'sections', 'tasks', 'events', 'meta', 'notes', 'briefs', 'accounts', 'campaigns']) {
    if (raw[c] == null) continue;
    if (!isMap(raw[c])) return toast('That file isn’t a valid backup');
    data[c] = cleanCol(c, raw[c]);
  }
  const total = Object.values(data).reduce((n, m) => n + Object.keys(m).length, 0);
  if (total > 20000) return toast('That backup has too many items to import here');
  const n = Object.keys(data.tasks || {}).length;
  if (!await confirmBox(`Replace everything currently in the app with this backup (${Object.keys(data.projects).length} projects, ${n} tasks)?`, 'Replace')) return;
  const ops = [];
  // notes are only touched when the backup has them (older backups don't)
  ['projects', 'sections', 'tasks', 'events', 'meta', ...['notes', 'briefs', 'accounts', 'campaigns'].filter(c => data[c])].forEach(c => {
    Object.keys(S.data[c]).forEach(id => ops.push({ type: 'del', col: c, id }));
    Object.entries(data[c] || {}).forEach(([id, v]) => ops.push({ type: 'put', col: c, data: { ...v, id } }));
  });
  await store.batch(ops); toast('Backup restored');
  audit('backup_import', `replaced data with ${ops.filter(o => o.type === 'put').length} document(s) from a backup file`);
}

/* ===================== theme ===================== */
function setTheme(t) { document.documentElement.dataset.theme = t; lsSet('tb:theme', t); }
function toggleTheme() { setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); render(); }
setTheme(lsGet('tb:theme') || 'light');

/* =====================================================================
   CAMPAIGN TRACKER
   Accounts > campaigns > campaign detail. Reuses the same store, modals,
   menus, toasts, icons and styling as the rest of the app.
   ===================================================================== */
const CT_SORTS = [['attention', 'Needs attention'], ['weekly', 'Weekly check due'], ['name', 'Campaign name'],
  ['start', 'Start date'], ['end', 'End date'], ['status', 'Status'], ['updated', 'Recently updated'], ['manual', 'My own order']];
const STATUS_CLS = { Live: 'live', Pending: 'pending', Ended: 'ended' };
const PACING_TONE = { 'Pending': 'mute', 'Healthy': 'good', 'Under-pacing': 'warn', 'Over-pacing': 'warn', 'Unstable': 'warn' };
// Each pacing value gets its own icon so Unstable reads differently from Under/Over at a glance.
const PACING_ICON = { 'Pending': 'pause', 'Healthy': 'gauge', 'Under-pacing': 'trendDown', 'Over-pacing': 'trendUp', 'Unstable': 'pulse' };
const RESULTS_ICON = { 'Pending': 'pause', 'Healthy': 'okcircle', 'Needs Attention': 'alert' };
const CREATIVE_ICON = { 'All Live': 'image', 'Partially Missing': 'image', 'Fully Missing': 'alert' };
const CREATIVE_TONE = { 'All Live': 'good', 'Partially Missing': 'warn', 'Fully Missing': 'bad' };
const RESULTS_TONE = { 'Pending': 'mute', 'Healthy': 'good', 'Needs Attention': 'warn' };
const CT_FIELDS = {
  status: { label: 'Status', options: C_STATUS, icon: 'campaign' },
  pacing: { label: 'Pacing', options: C_PACING, icon: 'gauge' },
  creative: { label: 'Creatives', options: C_CREATIVE, icon: 'image' },
  results: { label: 'Results', options: C_RESULTS, icon: 'okcircle' },
};

function newCampaign(accountId) {
  return {
    id: uid(), accountId, name: '', description: '', startDate: todayKey(), endDate: addDays(todayKey(), 30),
    status: 'Pending', markets: [], platforms: [], objectives: {}, pacing: 'Pending', creative: 'All Live', results: 'Pending',
    notes: '', weeklyChecks: [], archived: false, order: 1000, createdAt: Date.now(), createdBy: me(), updatedAt: Date.now(),
  };
}
const accName = id => (S.data.accounts[id] || {}).name || 'Unassigned';
const ctScopeOk = c => S.ct.account === 'all' ? true : c.accountId === S.ct.account;
function ctSelectedAccount() {
  const a = S.data.accounts[S.ct.account];
  if (S.ct.account !== 'all' && (!a || (a.archived && !S.ct.archived))) { S.ct.account = 'all'; lsSet('tb:ctAccount', 'all'); }
  return S.ct.account;
}
// Campaigns in the current account scope, before search/filters (used for the summary strip).
function ctScope() {
  return Object.values(S.data.campaigns).filter(c => {
    if (!S.ct.archived && c.archived) return false;
    const acc = S.data.accounts[c.accountId];
    if (!acc || (acc.archived && !S.ct.archived)) return false;
    return ctScopeOk(c);
  });
}
function ctFiltered() {
  const f = S.ct.f, q = S.ct.q.trim().toLowerCase();
  let list = ctScope().filter(c => {
    if (f.status !== 'All' && c.status !== f.status) return false;
    if (f.market !== 'All' && !(c.markets || []).includes(f.market)) return false;
    if (f.platform !== 'All' && !(c.platforms || []).includes(f.platform)) return false;
    // With a platform chosen too, the objective must belong to THAT platform.
    if (f.objective !== 'All' && !hasObjective(c, f.objective, f.platform)) return false;
    if (f.pacing !== 'All' && c.pacing !== f.pacing) return false;
    if (f.creative !== 'All' && c.creative !== f.creative) return false;
    if (f.results !== 'All' && c.results !== f.results) return false;
    if (f.weekly === 'Due' && !weeklyDue(c)) return false;
    if (f.weekly === 'Completed' && !weeklyDone(c)) return false;
    if (f.paused === 'Something paused' && !pausedCount(c)) return false;
    if (f.paused === 'Nothing paused' && pausedCount(c)) return false;
    return true;
  });
  if (q) list = list.filter(c => `${c.name} ${c.description || ''} ${c.notes || ''} ${liveObjectives(c).join(' ')}`.toLowerCase().includes(q));
  const rank = { Live: 0, Pending: 1, Ended: 2 };
  const byName = (a, b) => a.name.localeCompare(b.name);
  const sorters = {
    attention: (a, b) => (needsAttention(b) - needsAttention(a)) || (rank[a.status] - rank[b.status]) || byName(a, b),
    weekly: (a, b) => (weeklyDue(b) - weeklyDue(a)) || (rank[a.status] - rank[b.status]) || byName(a, b),
    name: byName,
    start: (a, b) => (a.startDate || '').localeCompare(b.startDate || '') || byName(a, b),
    end: (a, b) => (a.endDate || '').localeCompare(b.endDate || '') || byName(a, b),
    status: (a, b) => (rank[a.status] - rank[b.status]) || byName(a, b),
    updated: (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0),
    manual: byOrder,
  };
  return list.sort(sorters[S.ct.sort] || sorters.attention);
}
const toneOf = (key, v) => key === 'pacing' ? PACING_TONE[v] : key === 'creative' ? CREATIVE_TONE[v] : key === 'results' ? RESULTS_TONE[v] : (v === 'Live' ? 'good' : v === 'Pending' ? 'warn' : 'mute');
// Cards are dragged by their handle. Ordering is per account, so it needs a single account open.
const ctCanDrag = () => S.ct.account !== 'all';
const ctManual = () => S.ct.sort === 'manual' && S.ct.account !== 'all';
const ctFiltersOn = () => Object.values(S.ct.f).some(v => v !== 'All') || !!S.ct.q.trim();

/* ---------- small pieces ---------- */
function flightLabel(c) {
  const s = c.startDate ? fmtDay(c.startDate) : '-', e = c.endDate ? fmtDay(c.endDate) : '-';
  let note = '';
  if (c.endDate && c.status !== 'Ended') {
    const d = dayDiff(todayKey(), c.endDate);
    if (d < 0) note = `<span class="soon">· past end date</span>`;
    else if (d === 0) note = `<span class="soon">· ends today</span>`;
    else if (d <= 7) note = `<span class="soon">· ${d} day${d === 1 ? '' : 's'} left</span>`;
  }
  return `${esc(s)} <span style="color:var(--faint)">→</span> ${esc(e)} ${note}`;
}
function tagList(items, cls, max) {
  const list = items || [];
  const shown = list.length > max + 1 ? list.slice(0, max) : list;
  return shown.map(x => `<span class="tag ${cls}">${esc(x)}</span>`).join('') +
    (list.length > shown.length ? `<span class="tag more">+${list.length - shown.length}</span>` : '');
}
const statusPill = (c, action) => `<button class="ct-status ${STATUS_CLS[c.status] || ''}" ${action ? `data-action="ct-set" data-f="status" data-id="${c.id}"` : ''} title="Status: ${esc(c.status)}"><span class="dot"></span>${esc(c.status)}</button>`;
function metricBtn(c, key) {
  if (key === 'weekly') {
    const done = weeklyDone(c), due = weeklyDue(c);
    const tone = done ? 'good' : due ? 'warn' : '';
    return `<button class="ct-m ${tone}" data-action="ct-weekly" data-id="${c.id}" title="Weekly optimisation check">
      ${ico(done ? 'okcircle' : due ? 'alert' : 'clock', 'i-sm')}<span style="color:var(--faint)">Weekly</span><span class="v">${done ? 'Done' : due ? 'Due' : '-'}</span></button>`;
  }
  const f = CT_FIELDS[key], v = c[key] || f.options[0];
  const tone = toneOf(key, v);
  const icon = key === 'pacing' ? PACING_ICON[v] : key === 'results' ? RESULTS_ICON[v] : CREATIVE_ICON[v];
  return `<button class="ct-m ${tone || ''}" data-action="ct-set" data-f="${key}" data-id="${c.id}" title="${f.label}: ${esc(v)}">
    ${ico(icon || f.icon, 'i-sm')}<span style="color:var(--faint)">${f.label}</span><span class="v">${esc(v)}</span></button>`;
}
// Platform chips on the card: "Meta · Lead Gen +1" - full list on hover and in the drawer.
function platformChips(c, max = 4) {
  const list = c.platforms || [];
  const shown = list.length > max + 1 ? list.slice(0, max) : list;
  return shown.map(p => {
    const objs = objOf(c, p), pp = pauseOf(c, p);
    const nPaused = pp ? 0 : objs.filter(o => pauseOf(c, p, o)).length;
    const tail = objs.length ? ` <span class="oo">· ${esc(objLabel(objs[0]))}${objs.length > 1 ? ` +${objs.length - 1}` : ''}</span>` : '';
    const tip = `${p}${pp ? ` - paused since ${fmtDay(pp.since)}` : ''}${objs.length ? ' - ' + objs.map(o => objFull(o) + (!pp && pauseOf(c, p, o) ? ' (paused)' : '')).join(', ') : ''}`;
    return `<span class="tag plat ${pp ? 'paused' : ''}" title="${esc(tip)}">${pp ? ico('bars', 'i-xs') : ''}${esc(p)}${tail}${nPaused ? `<span class="pz-dot" title="${nPaused} objective${nPaused === 1 ? '' : 's'} paused">${ico('bars', 'i-xs')}${nPaused}</span>` : ''}</span>`;
  }).join('') + (list.length > shown.length ? `<span class="tag more">+${list.length - shown.length}</span>` : '');
}
function campaignCard(c, showAccount) {
  const notes = (c.notes || '').trim();
  return `<article class="ct-card ${needsAttention(c) ? 'attention' : ''} ${c.status === 'Ended' ? 'ended' : ''} ${c.archived ? 'archived' : ''}"
    data-camp="${c.id}" data-action="ct-open" data-id="${c.id}">
    ${ctCanDrag() ? `<button class="ct-grip" data-action="ct-grip" data-grip="${c.id}" title="Drag to reorder (or use the arrow keys)" aria-label="Reorder ${esc(c.name)}">${ico('grip', 'i-sm')}</button>` : ''}
    <div class="ct-top">
      <div style="flex:1;min-width:0"><div class="ct-name">${esc(c.name)}</div>
        ${showAccount ? `<div class="ct-acc">${esc(accName(c.accountId))}${c.archived ? ' · archived' : ''}</div>` : c.archived ? '<div class="ct-acc">Archived</div>' : ''}</div>
      ${pacingLink(c) ? extLink(pacingLink(c), ico('sheet', 'i-sm'), 'ct-link') : ''}
      ${statusPill(c, true)}
    </div>
    <div class="ct-dates">${ico('cal', 'i-sm')}${flightLabel(c)}</div>
    ${(c.description || '').trim() ? `<div class="ct-desc">${esc(c.description)}</div>` : ''}
    ${(c.markets || []).length || (c.platforms || []).length ? `<div class="ct-chips">${tagList(c.markets, 'mkt', 4)}${platformChips(c)}</div>` : ''}
    <div class="ct-metrics">${metricBtn(c, 'weekly')}${metricBtn(c, 'pacing')}${metricBtn(c, 'creative')}${metricBtn(c, 'results')}</div>
    ${notes ? `<div class="ct-notes">${ico('comment', 'i-sm')}<span class="txt">${esc(notes)}</span></div>` : ''}
  </article>`;
}

/* ---------- main view ---------- */
function renderCampaigns() {
  const sel = ctSelectedAccount();
  const accs = accounts(S.ct.archived);
  const all = ctScope();
  const list = ctFiltered();
  const counts = { Live: 0, Pending: 0, Ended: 0 };
  all.forEach(c => counts[c.status] = (counts[c.status] || 0) + 1);
  const attn = all.filter(needsAttention).length, due = all.filter(weeklyDue).length;
  const liveOnes = all.filter(c => c.status === 'Live');
  const mk = [...new Set(liveOnes.flatMap(c => c.markets || []))].sort((a, b) => MARKETS.indexOf(a) - MARKETS.indexOf(b));
  const pf = [...new Set(liveOnes.flatMap(activePlatforms))].sort((a, b) => PLATFORMS.indexOf(a) - PLATFORMS.indexOf(b));
  const nPausedPf = [...new Set(liveOnes.flatMap(c => (c.platforms || []).filter(p => platformPaused(c, p))))].filter(p => !pf.includes(p)).length;
  const selAcc = sel !== 'all' ? S.data.accounts[sel] : null;
  const accCount = id => Object.values(S.data.campaigns).filter(c => c.accountId === id && (S.ct.archived || !c.archived)).length;
  const accAttn = id => Object.values(S.data.campaigns).filter(c => c.accountId === id && !c.archived && needsAttention(c)).length;

  const filt = (key, label, options) => `<label class="filt ${S.ct.f[key] !== 'All' ? 'on' : ''}">${esc(label)}
    <select data-ctf="${key}">${['All', ...options].map(o => `<option ${S.ct.f[key] === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;

  return topbar('My Projects /', `
    <button class="top-btn ${S.ct.archived ? 'on' : ''}" data-action="ct-archived">${ico('archive', 'i-sm')}${S.ct.archived ? 'Hide' : 'Show'} archived</button>
    ${sel !== 'all' ? `<button class="icon-btn" data-action="ct-acc-menu" data-id="${sel}" data-align="right">${ico('dots')}</button>` : ''}`) +
    `<div class="content"><div class="ct-head"><h1>Campaign Tracker</h1></div>
    ${S.rulesMissing ? `<div class="ct-banner">${ico('alert')}<div><b>Campaign Tracker can't save yet.</b><br>Your Firebase security rules don't cover the new <code>accounts</code> and <code>campaigns</code> collections. Paste the updated <code>firestore.rules</code> in Firebase → Firestore → Rules → Publish, then reload this page.</div></div>` : ''}
    <div class="ct-tabs">
      <button class="ct-tab ${sel === 'all' ? 'on' : ''}" data-action="ct-acc" data-id="all">All accounts <span class="n">${all.length}</span></button>
      ${accs.map(a => `<button class="ct-tab ${sel === a.id ? 'on' : ''} ${a.archived ? 'archived' : ''}" data-tab="${a.id}" data-action="ct-acc" data-id="${a.id}" title="Drag to reorder">
        ${esc(a.name)}${a.archived ? ' <span style="color:var(--faint)">(archived)</span>' : ''} <span class="n">${accCount(a.id)}</span>${accAttn(a.id) ? '<span class="warn" title="Needs attention"></span>' : ''}</button>`).join('')}
      <button class="ct-tab" data-action="ct-add-acc" title="Add ad account">${ico('plus', 'i-sm')} Ad account</button>
    </div>

    ${accs.length ? `<div class="ct-summary">
      <span class="ct-stat"><b>${all.length}</b> campaign${all.length === 1 ? '' : 's'}</span>
      <span class="ct-stat"><b>${counts.Live || 0}</b> live</span>
      <span class="ct-stat"><b>${counts.Pending || 0}</b> pending</span>
      <span class="ct-stat"><b>${counts.Ended || 0}</b> ended</span>
      <span class="ct-stat ${attn ? 'alert' : ''}"><b>${attn}</b> need attention</span>
      <span class="ct-stat ${due ? 'alert' : ''}"><b>${due}</b> weekly check${due === 1 ? '' : 's'} due</span>
      ${mk.length || pf.length ? '<span class="ct-sumsep"></span>' : ''}
      ${mk.length ? `<span class="ct-sumchips">Markets live ${tagList(mk, 'mkt', 6)}</span>` : ''}
      ${pf.length ? `<span class="ct-sumchips">Platforms live ${tagList(pf, 'plat', 8)}</span>` : ''}
      ${nPausedPf ? `<span class="ct-stat" title="Platforms that are paused on every live campaign">${ico('bars', 'i-xs')} <b>${nPausedPf}</b> paused</span>` : ''}
      ${selAcc ? `<span class="ct-sumchips" style="margin-left:auto">${selAcc.pacingUrl ? extLink(selAcc.pacingUrl, `${ico('sheet', 'i-sm')}Pacing sheet${ico('ext', 'i-xs')}`, 'sheet-btn')
        : `<button class="sheet-btn ghost" data-action="ct-acc-link" data-id="${selAcc.id}">${ico('link', 'i-sm')}Add pacing sheet</button>`}</span>` : ''}
    </div>` : ''}

    <div class="ct-toolbar">
      <div class="ct-search">${ico('search', 'i-sm')}<input id="ct-q" data-keep value="${esc(S.ct.q)}" placeholder="Search campaigns, descriptions, notes" autocomplete="off"></div>
      <label class="filt">${ico('sort', 'i-sm')}<select data-ctsort>${CT_SORTS.map(([v, l]) => `<option value="${v}" ${S.ct.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      ${ctFiltersOn() ? `<button class="top-btn" data-action="ct-clear">${ico('x', 'i-sm')}Clear filters</button>` : ''}
      <span style="flex:1"></span>
      <button class="btn btn-primary" data-action="ct-add-camp">${ico('plus', 'i-sm')} Add campaign</button>
    </div>
    <div class="ct-filters">
      ${filt('status', 'Status', C_STATUS)}${filt('market', 'Market', MARKETS)}${filt('platform', 'Platform', PLATFORMS)}
      ${filt('pacing', 'Pacing', C_PACING)}${filt('creative', 'Creatives', C_CREATIVE)}${filt('results', 'Results', C_RESULTS)}
      ${filt('objective', 'Objective', [...ALL_OBJECTIVES, 'Other'])}
      ${filt('weekly', 'Weekly check', ['Completed', 'Due'])}
      ${filt('paused', 'Paused', ['Something paused', 'Nothing paused'])}
      ${ctCanDrag() ? `<span style="font-size:11.5px;color:var(--faint)">${ctManual() ? 'Drag a card by its handle to arrange' : 'Drag a card by its handle to switch to your own order'}</span>`
        : '<span style="font-size:11.5px;color:var(--faint)">Open an account to drag campaigns into your own order</span>'}
    </div>

    ${!accs.length ? `<div class="ct-empty">No ad accounts yet.<br><br><button class="btn btn-primary" data-action="ct-add-acc">${ico('plus', 'i-sm')} Add your first ad account</button></div>`
      : !list.length ? `<div class="ct-empty">${all.length ? 'No campaigns match these filters.' : 'No campaigns in this account yet.'}<br><br><button class="btn" data-action="${all.length ? 'ct-clear' : 'ct-add-camp'}">${all.length ? 'Clear filters' : '+ Add campaign'}</button></div>`
      : `<div class="ct-grid">${list.slice(0, S.ct.limit).map(c => campaignCard(c, sel === 'all')).join('')}</div>
         ${list.length > S.ct.limit ? `<div style="padding:14px 0 24px;text-align:center">
           <button class="btn" data-action="ct-more">Show ${list.length - S.ct.limit} more campaign${list.length - S.ct.limit === 1 ? '' : 's'}</button></div>` : ''}`}
    </div>`;
}

/* ---------- account actions ---------- */
async function ctAddAccount() {
  const r = await promptBox({ title: 'Add ad account', label: 'Ad account name', placeholder: 'e.g. Meta - UAE', ok: 'Add' });
  if (!r) return;
  const a = { id: uid(), name: r.value, order: nextOrder(accounts(true)), archived: false, createdAt: Date.now(), createdBy: me() };
  await store.put('accounts', a);
  S.ct.account = a.id; lsSet('tb:ctAccount', a.id); render();
}
function ctAccountMenu(anchor, id) {
  const a = S.data.accounts[id]; if (!a) return;
  const list = accounts(true);
  openMenu(anchor, [
    { label: 'Rename account', icon: 'pencil', onClick: async () => { const r = await promptBox({ title: 'Rename account', value: a.name }); if (r) store.update('accounts', id, { name: r.value }); } },
    { label: 'Add campaign', icon: 'plus', onClick: () => openCampaignForm(null, id) },
    { label: a.pacingUrl ? 'Change pacing sheet link' : 'Set pacing sheet link', icon: 'sheet', onClick: () => ctEditAccountLink(a) },
    ...(safeUrl(a.pacingUrl) ? [{ label: 'Open pacing sheet', icon: 'ext', onClick: () => window.open(safeUrl(a.pacingUrl), '_blank', 'noopener,noreferrer') }] : []),
    '-',
    { label: 'Move left', icon: 'left', onClick: () => moveItem(list, 'accounts', id, -1) },
    { label: 'Move right', icon: 'right', onClick: () => moveItem(list, 'accounts', id, 1) },
    { label: a.archived ? 'Restore from archive' : 'Archive account', icon: 'archive', onClick: () => ctArchiveAccount(a, !a.archived) },
    '-',
    { label: 'Delete account', icon: 'trash', danger: true, onClick: () => ctDeleteAccount(a) },
  ], anchor.dataset ? anchor.dataset.align : '');
}
// Ask for a link; '' clears it, null means cancelled. Re-asks on anything that isn't a web link.
async function askLink(title, value, hint) {
  for (;;) {
    const r = await promptBox({ title, label: hint, value: value || '', placeholder: 'https://docs.google.com/spreadsheets/d/…', ok: 'Save' });
    if (!r) return null;
    const u = cleanUrl(r.value);
    if (u !== null) return u;
    toast('That doesn’t look like a web link - paste the full sheet URL'); value = r.value;
  }
}
async function ctEditAccountLink(a) {
  const u = await askLink(`Pacing sheet for ${a.name}`, a.pacingUrl, 'Google Sheets link (campaigns without their own link use this one; leave empty to remove)');
  if (u === null) return;
  await store.update('accounts', a.id, { pacingUrl: u });
  toast(u ? 'Pacing sheet linked' : 'Pacing sheet link removed');
}
async function ctEditCampaignLink(id) {
  const c = S.data.campaigns[id]; if (!c) return;
  const u = await askLink('Pacing sheet link', c.pacingUrl, 'Google Sheets link for this campaign (leave empty to use the account’s sheet)');
  if (u === null) return;
  const prev = c.pacingUrl || '';
  await ctUpdate(id, { pacingUrl: u });
  undoable(u ? 'Pacing sheet linked' : 'Campaign link removed', 'pacing sheet link', () => ctUpdate(id, { pacingUrl: prev }));
}
// Pause or resume a whole platform (objective = null) or one objective on it.
async function ctTogglePause(id, platform, objective = null, date) {
  const c = S.data.campaigns[id]; if (!c) return;
  const prev = { pauses: c.pauses || [], pauseLog: c.pauseLog || [] };
  const ex = pauseOf(c, platform, objective);
  const day = date || todayKey();
  const pauses = ex ? prev.pauses.filter(x => x !== ex) : [...prev.pauses, { platform, objective: objective || null, since: day, at: Date.now(), by: me() }];
  const log = [...prev.pauseLog, { platform, objective: objective || null, action: ex ? 'resumed' : 'paused', date: day, at: Date.now(), by: me() }];
  await ctUpdate(id, { pauses, pauseLog: log });
  const what = objective ? `${platform} · ${objFull(objective)}` : platform;
  undoable(`${what} ${ex ? 'resumed' : 'paused'}`, `${ex ? 'resume' : 'pause'} ${what}`, () => ctUpdate(id, prev));
}
// Change the "paused since" date (e.g. you're logging a pause from last week).
async function ctPauseDate(id, platform, objective = null) {
  const c = S.data.campaigns[id]; const p = c && pauseOf(c, platform, objective); if (!p) return;
  const v = await datePrompt(`Paused since`, p.since);
  if (!v || v === p.since) return;
  const pauses = (c.pauses || []).map(x => x === p ? { ...x, since: v } : x);
  // keep the history in step: the matching "paused" entry moves to the new date
  const log = [...(c.pauseLog || [])];
  for (let i = log.length - 1; i >= 0; i--) {
    const l = log[i];
    if (l.platform === platform && (l.objective || null) === (objective || null) && l.action === 'paused') { log[i] = { ...l, date: v }; break; }
  }
  await ctUpdate(id, { pauses, pauseLog: log });
}
function datePrompt(title, value) {
  return new Promise(res => {
    const w = openModal(`<div class="modal-head"><h2>${esc(title)}</h2></div>
      <form class="modal-body"><div class="field" style="margin:0"><input type="date" class="inp" value="${esc(value || todayKey())}" max="${todayKey()}" autofocus></div><button type="submit" hidden></button></form>
      <div class="modal-foot"><span class="spacer"></span><button class="btn" data-x>Cancel</button><button class="btn btn-primary" data-ok>Save</button></div>`);
    const inp = w.querySelector('input'), done = v => { w.close(); res(v); };
    w.onDismiss = () => done(null);
    w.querySelector('[data-x]').onclick = () => done(null);
    w.querySelector('[data-ok]').onclick = () => done(inp.value || null);
    w.querySelector('form').onsubmit = e => { e.preventDefault(); done(inp.value || null); };
  });
}
async function ctArchiveAccount(a, on) {
  await store.update('accounts', a.id, { archived: on, archivedAt: on ? Date.now() : null });
  if (on && S.ct.account === a.id && !S.ct.archived) { S.ct.account = 'all'; lsSet('tb:ctAccount', 'all'); }
  undoable(on ? `“${a.name}” archived` : `“${a.name}” restored`, `${on ? 'archive' : 'restore'} “${a.name}”`,
    () => store.update('accounts', a.id, { archived: !on, archivedAt: a.archivedAt || null }));
}
async function ctDeleteAccount(a) {
  const camps = Object.values(S.data.campaigns).filter(c => c.accountId === a.id);
  const notes = Object.values(S.data.notes).filter(n => n.accountId === a.id);
  if (!await confirmBox(`Delete <b>${esc(a.name)}</b> and its ${camps.length} campaign${camps.length === 1 ? '' : 's'}${notes.length ? ` and ${notes.length} note${notes.length === 1 ? '' : 's'}` : ''}, including their weekly check history?${trashOn() ? `<br><span class="muted-note">You can restore it from Recently deleted for ${TRASH_DAYS} days.</span>` : ''}`)) return;
  await trashItems('account', a.name, [{ col: 'accounts', data: a }, ...camps.map(c => ({ col: 'campaigns', data: c })), ...notes.map(n => ({ col: 'notes', data: n }))],
    `${camps.length} campaign${camps.length === 1 ? '' : 's'}${notes.length ? ` · ${notes.length} note${notes.length === 1 ? '' : 's'}` : ''}`);
  S.ct.account = 'all'; lsSet('tb:ctAccount', 'all'); render();
}

/* ---------- campaign actions ---------- */
// A campaign that hasn't launched can't have real pacing or results, so moving it to
// Pending resets both to the neutral "Pending" state. Creatives are left alone on purpose.
// Going Pending -> Live changes nothing, so both stay neutral until reviewed by hand.
function applyStatusRules(fields, current = {}) {
  const next = { ...fields };
  if (next.status === 'Pending' && current.status !== 'Pending') { next.pacing = 'Pending'; next.results = 'Pending'; }
  return next;
}
async function ctUpdate(id, fields) {
  const current = S.data.campaigns[id] || {};
  await store.update('campaigns', id, { ...applyStatusRules(fields, current), updatedAt: Date.now(), updatedBy: me() });
}

/* ---------- housekeeping: runs on load and hourly, never destructive ---------- */
let ctMaintRun = 0;
async function ctMaintenance() {
  if (!store || (store.isFresh && !store.isFresh())) return;      // wait for real server data before writing
  if (Date.now() - ctMaintRun < 30000) return;
  ctMaintRun = Date.now();
  const today = todayKey(), ops = [];
  // Tasks saved before createdAt existed: fall back to the earliest timestamp we genuinely
  // have for them, and mark it approximate so the detail view can say so.
  Object.values(S.data.tasks).forEach(t => {
    if (t.createdAt) return;
    const known = [t.updatedAt, t.completedAt, t.lastDoneAt].filter(Boolean);
    if (!known.length) return;
    ops.push({ type: 'update', col: 'tasks', id: t.id, data: { createdAt: Math.min(...known), createdApprox: true } });
  });
  // Recently deleted empties itself: anything older than TRASH_DAYS is gone for good.
  const cutoff = Date.now() - TRASH_DAYS * 864e5;
  Object.values(S.data.trash).forEach(t => { if ((t.deletedAt || 0) < cutoff) ops.push({ type: 'del', col: 'trash', id: t.id }); });
  Object.values(S.data.campaigns).forEach(c => {
    const fix = {};
    // 1. a campaign whose end date has passed is Ended - everything else is kept as it was
    if (c.status !== 'Ended' && c.endDate && c.endDate < today) fix.status = 'Ended';
    // 2. a campaign still waiting to launch can't be pacing or performing
    const st = fix.status || c.status;
    if (st === 'Pending') {
      if (c.pacing && c.pacing !== 'Pending') fix.pacing = 'Pending';
      if (c.results && c.results !== 'Pending') fix.results = 'Pending';
    }
    // 3. older campaigns saved before these options existed
    if (!c.pacing) fix.pacing = 'Pending';
    if (!c.results) fix.results = 'Pending';
    if (Object.keys(fix).length) ops.push({ type: 'update', col: 'campaigns', id: c.id, data: fix });
  });
  if (ops.length) await store.batch(ops);
}
setInterval(() => { if (S.ready) ctMaintenance(); }, 3600000);
const ctLocked = (c, key) => ['pacing', 'results'].includes(key) && c.status === 'Pending';
function ctSetMenu(anchor, id, key) {
  const c = S.data.campaigns[id]; if (!c) return;
  const f = CT_FIELDS[key];
  if (ctLocked(c, key)) {
    return openMenu(anchor, [
      { title: `${f.label} stays Pending until the campaign is live` },
      { label: 'Set campaign to Live', icon: 'campaign', onClick: () => ctUpdate(id, { status: 'Live' }) },
    ]);
  }
  openMenu(anchor, [{ title: f.label }, ...f.options.map(o => ({
    label: (c[key] === o ? '✓  ' : '     ') + o,
    onClick: () => ctUpdate(id, { [key]: o }),
  }))]);
}
async function ctCompleteWeekly(id) {
  const c = S.data.campaigns[id]; if (!c) return;
  const checks = c.weeklyChecks || [];
  const entry = { id: uid(), date: todayKey(), at: Date.now(), by: me() };
  await ctUpdate(id, { weeklyChecks: [...checks, entry] });
  undoable(`Weekly check logged for ${c.name}`, `weekly check for “${c.name}”`, () => ctUpdate(id, { weeklyChecks: checks }));
}
function ctWeeklyClick(anchor, id) {
  const c = S.data.campaigns[id]; if (!c) return;
  if (!weeklyDone(c)) return ctCompleteWeekly(id);
  const done = (c.weeklyChecks || []).filter(w => weekOf(w.date) === thisWeek());
  openMenu(anchor, [
    { title: `Checked ${done.map(w => fmtDay(w.date)).join(', ')}` },
    { label: 'Open campaign', icon: 'eye', onClick: () => openCampaignDrawer(id) },
    { label: 'Undo this week’s check', icon: 'trash', danger: true, onClick: () => ctUpdate(id, { weeklyChecks: (c.weeklyChecks || []).filter(w => weekOf(w.date) !== thisWeek()) }) },
  ]);
}
async function ctDuplicate(id) {
  const c = S.data.campaigns[id]; if (!c) return;
  const copy = { ...clone(c), id: uid(), name: c.name + ' (copy)', weeklyChecks: [], pauses: [], pauseLog: [], archived: false, createdAt: Date.now(), createdBy: me(), updatedAt: Date.now(), order: nextOrder(campaignsOf(c.accountId, true)) };
  await store.put('campaigns', copy);
  undoable('Campaign duplicated', `duplicate “${c.name}”`, () => store.del('campaigns', copy.id));
  return copy.id;
}
async function ctDelete(id) {
  const c = S.data.campaigns[id]; if (!c) return false;
  if (!await confirmBox(`Delete <b>${esc(c.name)}</b>, including its weekly check history?${trashOn() ? `<br><span class="muted-note">It stays in Recently deleted for ${TRASH_DAYS} days.</span>` : ''}`)) return false;
  await trashItems('campaign', c.name, [{ col: 'campaigns', data: c }], accName(c.accountId));
  return true;
}
async function ctArchive(id, on) {
  const c = S.data.campaigns[id]; if (!c) return;
  await ctUpdate(id, { archived: on, archivedAt: on ? Date.now() : null });
  undoable(on ? 'Campaign archived' : 'Campaign restored from the archive', `${on ? 'archive' : 'restore'} “${c.name}”`,
    () => ctUpdate(id, { archived: !on, archivedAt: c.archivedAt || null }));
}
function ctMoveMenu(anchor, id) {
  const c = S.data.campaigns[id]; if (!c) return;
  const others = accounts(true).filter(a => a.id !== c.accountId);
  if (!others.length) return toast('There’s only one account so far');
  openMenu(anchor, [{ title: 'Move to account' }, ...others.map(a => ({
    label: a.name, icon: 'arrowRight',
    onClick: () => ctUpdate(id, { accountId: a.id, order: nextOrder(campaignsOf(a.id, true)) }),
  }))]);
}

/* ---------- detail drawer ---------- */
function openDrawer(inner) {
  closeMenu();
  const wrap = document.createElement('div'); wrap.className = 'drawer';
  wrap.innerHTML = `<div class="drawer-panel">${inner}</div>`;
  wrap.close = () => { wrap.remove(); if (S.drawerPaint && S.drawerOwner === wrap) S.drawerPaint = null; };
  wrap.addEventListener('mousedown', e => { if (e.target === wrap) wrap.dataset.down = '1'; });
  wrap.addEventListener('mouseup', e => { if (e.target === wrap && wrap.dataset.down) (wrap.onDismiss || wrap.close)(); delete wrap.dataset.down; });
  $('#modals').appendChild(wrap);
  return wrap;
}
const pickRow = (c, key) => {
  const locked = ctLocked(c, key);
  return `<div class="seg-pick">${CT_FIELDS[key].options.map(o =>
    `<button class="pick ${c[key] === o ? 'on ' + (toneOf(key, o) || '') : ''} ${locked && o !== c[key] ? 'locked' : ''}"
      ${locked ? 'data-locked="1"' : ''} data-set="${key}" data-v="${esc(o)}"
      title="${locked ? 'Available once the campaign is live' : esc(o)}">${esc(o)}</button>`).join('')}
    ${locked ? '<span style="font-size:11px;color:var(--faint);align-self:center">Not yet launched</span>' : ''}</div>`;
};

function drawerHTML(c) {
  const checks = [...(c.weeklyChecks || [])].sort((a, b) => b.date.localeCompare(a.date));
  const done = weeklyDone(c), reasons = attentionReasons(c);
  return `<div class="drawer-head">
      <div style="flex:1;min-width:0">
        <div class="ct-name" style="font-size:16px">${esc(c.name)}</div>
        <div class="ct-acc">${esc(accName(c.accountId))}${c.archived ? ' · archived' : ''}${c.updatedAt ? ' · updated ' + timeAgo(c.updatedAt) : ''}</div>
      </div>
      ${statusPill(c, false)}
      <button class="icon-btn" data-act="close" title="Close">${ico('x')}</button>
    </div>
    <div class="drawer-body">
      ${reasons.length ? `<div class="ct-banner" style="margin-bottom:14px">${ico('alert')}<div>${reasons.map(esc).join(' · ')}</div></div>` : ''}
      ${(c.clientIds || []).length || (c.briefId && S.data.briefs[c.briefId]) ? `<div class="ct-chips" style="margin:-4px 0 12px">${clientChips(c.clientIds, 4, false)}${c.briefId && S.data.briefs[c.briefId] ? `<span class="tag">${ico('brief', 'i-xs')} ${esc(briefLabel(S.data.briefs[c.briefId]))}</span>` : ''}</div>` : ''}
      <div class="d-sec"><h4>Flight</h4>
        <div class="d-row"><span class="k">Dates</span><span class="v">${flightLabel(c)}</span></div>
        <div class="d-row"><span class="k">Status</span><span class="v">${pickRow(c, 'status')}</span></div>
        <div class="d-row" style="border-bottom:0"><span class="k">Markets live</span><span class="v">${(c.markets || []).length ? tagList(c.markets, 'mkt', 99) : '<span style="color:var(--faint)">None selected</span>'}</span></div>
      </div>
      <div class="d-sec"><h4>Platforms &amp; objectives</h4>
        ${(c.platforms || []).length ? (c.platforms).map(p => {
          const pp = pauseOf(c, p);
          return `<div class="obj-row ${pp ? 'paused' : ''}">
            <span class="pf">${esc(p)}${pp ? `<button class="pz-since" data-pzdate="${esc(p)}" data-oi="-1" title="Change the pause date">${ico('bars', 'i-xs')}since ${esc(fmtDay(pp.since))}</button>` : ''}</span>
            <span class="objs">
              ${objOf(c, p).map((o, i) => {
                const op = !pp && pauseOf(c, p, o);
                return `<span class="obj-chip ${pp || op ? 'paused' : ''}" ${op ? `title="Paused since ${esc(fmtDay(op.since))}${op.by ? ' by ' + esc(op.by) : ''}"` : ''}>
                  ${!pp ? `<button class="pz-obj" data-pause="${esc(p)}" data-oi="${i}" title="${op ? 'Resume' : 'Pause'} this objective">${ico(op ? 'play' : 'bars', 'i-xs')}</button>` : ''}
                  ${esc(objFull(o))}${op ? `<button class="pz-since sm" data-pzdate="${esc(p)}" data-oi="${i}" title="Change the pause date">since ${esc(fmtDay(op.since))}</button>` : ''}
                  <button data-objdel="${esc(p)}|${esc(o)}" title="Remove">${ico('x', 'i-sm')}</button></span>`;
              }).join('') || '<span class="obj-none">No objective set</span>'}
              <button class="obj-add" data-objadd="${esc(p)}">${objOf(c, p).length ? 'Edit' : '+ Objective'}</button>
            </span>
            <button class="pz-btn ${pp ? 'on' : ''}" data-pause="${esc(p)}" data-oi="-1" title="${pp ? 'Resume' : 'Pause'} ${esc(p)}">${ico(pp ? 'play' : 'bars', 'i-xs')}${pp ? 'Resume' : 'Pause'}</button>
          </div>`;
        }).join('') : '<span style="color:var(--faint);font-size:12.5px">No platforms selected yet - add them with Edit.</span>'}
        ${(c.pauseLog || []).length ? `<details class="pz-log" ${(c.pauses || []).length ? 'open' : ''}><summary>Pause history <span class="cnt">${c.pauseLog.length}</span></summary>
          ${[...c.pauseLog].sort((a, b) => b.date.localeCompare(a.date) || (b.at || 0) - (a.at || 0)).map(l => `<div class="wk">${ico(l.action === 'paused' ? 'bars' : 'play', 'i-sm ' + (l.action === 'paused' ? 'pz-ic' : 'tick'))}
            <span class="when">${l.action === 'paused' ? 'Paused' : 'Resumed'} <b>${esc(l.platform)}${l.objective ? ' · ' + esc(objFull(l.objective)) : ''}</b> · ${esc(fmtDay(l.date))}</span><span class="who">${esc(l.by || '')}</span></div>`).join('')}
        </details>` : ''}
      </div>
      <div class="d-sec"><h4>Health</h4>
        <div class="d-row"><span class="k">Pacing</span><span class="v">${pickRow(c, 'pacing')}</span></div>
        <div class="d-row"><span class="k">Pacing sheet</span><span class="v" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${pacingLink(c)
          ? `${extLink(pacingLink(c), `${ico('sheet', 'i-sm')}Open pacing sheet${ico('ext', 'i-xs')}`, 'sheet-btn')}${!c.pacingUrl ? '<span style="font-size:11px;color:var(--faint)">account’s sheet</span>' : ''}<button class="link" data-act="link">${c.pacingUrl ? 'Change' : 'Use a different sheet'}</button>`
          : `<button class="sheet-btn ghost" data-act="link">${ico('link', 'i-sm')}Add pacing sheet link</button>`}</span></div>
        <div class="d-row"><span class="k">Creatives</span><span class="v">${pickRow(c, 'creative')}</span></div>
        <div class="d-row" style="border-bottom:0"><span class="k">Results</span><span class="v">${pickRow(c, 'results')}</span></div>
      </div>
      <div class="d-sec"><h4>Weekly optimisation</h4>
        <div class="d-row" style="border-bottom:0">
          <span class="k">This week</span>
          <span class="v" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span class="ct-m ${done ? 'good' : weeklyDue(c) ? 'warn' : ''}" style="width:auto;padding:0">${ico(done ? 'okcircle' : 'alert', 'i-sm')}<span class="v">${done ? 'Completed' : c.status === 'Live' ? 'Due' : 'Not required'}</span></span>
            ${done ? `<button class="btn" data-act="undo-week">Undo</button>`
              : `<button class="btn ${c.status === 'Live' ? 'btn-primary' : ''}" data-act="do-week">Complete weekly check</button>`}
          </span>
        </div>
        <div style="margin-top:8px">
          ${checks.length ? checks.map(w => `<div class="wk">${ico('okcircle', 'i-sm ' + 'tick')}<span class="when">${esc(fmtDay(w.date))}${weekOf(w.date) === thisWeek() ? ' <span style="color:var(--faint)">· this week</span>' : ''}</span>
            <span class="who">${esc(w.by || '')}</span><button class="icon-btn" data-wkdel="${w.id}" title="Remove this entry">${ico('trash', 'i-sm')}</button></div>`).join('')
            : '<div style="color:var(--faint);font-size:12.5px">No checks logged yet.</div>'}
        </div>
      </div>
      <div class="d-sec"><h4>Notes</h4>
        ${(() => { const ns = Object.values(S.data.notes).filter(n => n.campaignId === c.id).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          return (ns.map(n => `<button class="d-note" data-act="note" data-id="${n.id}">${ico('notebook', 'i-sm')}<span>${esc(n.title || 'Untitled')}</span><em>${esc(nbWhen(n.updatedAt || n.createdAt))}</em></button>`).join('')
            || '<div style="color:var(--faint);font-size:12.5px;margin-bottom:6px">No notes linked to this campaign yet.</div>')
            + `<button class="obj-add" data-act="new-note">+ New note for this campaign</button>`; })()}
      </div>
      <div class="d-sec"><h4>Description</h4>
        <div class="d-text">${(c.description || '').trim() ? esc(c.description) : '<span style="color:var(--faint)">No description</span>'}</div>
      </div>
      <div class="d-sec"><h4>Notes / things to check</h4>
        <textarea class="ta" data-notes rows="4" maxlength="5000" placeholder="e.g. Snap CPL up this week - check pixel discrepancy">${esc(c.notes || '')}</textarea>
        <div style="font-size:11px;color:var(--faint);margin-top:4px">Saves when you click outside the box.</div>
      </div>
    </div>
    <div class="drawer-foot">
      <button class="btn" data-act="edit">${ico('pencil', 'i-sm')} Edit</button>
      <button class="btn" data-act="dup">${ico('copy', 'i-sm')} Duplicate</button>
      <button class="btn" data-act="move">${ico('arrowRight', 'i-sm')} Move</button>
      <button class="btn" data-act="archive">${ico('archive', 'i-sm')} ${c.archived ? 'Restore' : 'Archive'}</button>
      <span class="spacer" style="flex:1"></span>
      <button class="btn btn-danger" data-act="del">${ico('trash', 'i-sm')} Delete</button>
    </div>`;
}

function openCampaignDrawer(id) {
  if (!S.data.campaigns[id]) return;
  const w = openDrawer('');
  const panel = w.querySelector('.drawer-panel');
  const paint = () => { const c = S.data.campaigns[id]; if (!c) return w.close(); panel.innerHTML = drawerHTML(c); };
  paint();
  S.drawerOwner = w;
  // keep the drawer live when the store changes (own edits or a teammate's)
  S.drawerPaint = () => { const a = document.activeElement; if (panel.contains(a) && /INPUT|TEXTAREA/.test(a.tagName)) return; paint(); };
  panel.addEventListener('click', async e => {
    const c = S.data.campaigns[id]; if (!c) return;
    const set = e.target.closest('[data-set]');
    if (set) {
      if (set.dataset.locked) return toast('Set the campaign to Live first - pacing and results stay Pending until then');
      return ctUpdate(id, { [set.dataset.set]: set.dataset.v });
    }
    const pz = e.target.closest('[data-pause]');
    if (pz) { const i = +pz.dataset.oi; return ctTogglePause(id, pz.dataset.pause, i >= 0 ? objOf(c, pz.dataset.pause)[i] : null); }
    const pzd = e.target.closest('[data-pzdate]');
    if (pzd) { const i = +pzd.dataset.oi; return ctPauseDate(id, pzd.dataset.pzdate, i >= 0 ? objOf(c, pzd.dataset.pzdate)[i] : null); }
    const objAdd = e.target.closest('[data-objadd]');
    if (objAdd) return openObjectiveMenu(objAdd, objAdd.dataset.objadd, () => S.data.campaigns[id], next => ctUpdate(id, { objectives: next }));
    const objDel = e.target.closest('[data-objdel]');
    if (objDel) {
      const [p, o] = objDel.dataset.objdel.split('|');
      const objs = { ...(c.objectives || {}) };
      objs[p] = objOf(c, p).filter(x => x !== o);
      return ctUpdate(id, { objectives: objs });
    }
    const wkdel = e.target.closest('[data-wkdel]');
    if (wkdel) { const keep = (c.weeklyChecks || []).filter(x => x.id !== wkdel.dataset.wkdel); await ctUpdate(id, { weeklyChecks: keep }); undoable('Check removed', 'remove weekly check', () => ctUpdate(id, { weeklyChecks: c.weeklyChecks })); return; }
    const b = e.target.closest('[data-act]'); if (!b) return;
    const act = b.dataset.act;
    if (act === 'close') w.close();
    if (act === 'do-week') ctCompleteWeekly(id);
    if (act === 'undo-week') ctUpdate(id, { weeklyChecks: (c.weeklyChecks || []).filter(x => weekOf(x.date) !== thisWeek()) });
    if (act === 'edit') { w.close(); openCampaignForm(id); }
    if (act === 'dup') { const nid = await ctDuplicate(id); w.close(); if (nid) openCampaignForm(nid); }
    if (act === 'move') ctMoveMenu(b, id);
    if (act === 'link') ctEditCampaignLink(id);
    if (act === 'note') { w.close(); go('#/notes/' + b.dataset.id); }
    if (act === 'new-note') {
      w.close();
      const html = NB_TEMPLATES.meeting.html();
      nbCreate({ id: uid(), accountId: c.accountId, campaignId: c.id, title: `${c.name} - ${fmtDay(todayKey())}`, html, text: htmlText(html), tags: [], pinned: false,
        createdAt: Date.now(), createdBy: me(), updatedAt: Date.now(), updatedBy: me() }, false);
    }
    if (act === 'archive') await ctArchive(id, !c.archived);
    if (act === 'del') { if (await ctDelete(id)) w.close(); }
  });
  panel.addEventListener('change', e => {
    if (!e.target.matches('[data-notes]')) return;
    const c = S.data.campaigns[id]; if (!c) return;
    const v = e.target.value.trim();
    if (v !== (c.notes || '')) ctUpdate(id, { notes: v });
  });
}

/* ---------- objective picker (used by the drawer and by the add/edit form) ---------- */
// getC() returns the current holder of objectives (a live campaign, or the form's draft);
// save(nextObjectives) persists them wherever they belong.
function openObjectiveMenu(anchor, platform, getC, save) {
  const custom = () => objOf(getC(), platform).filter(o => o.startsWith(CUSTOM_PREFIX));
  openCheckMenu(anchor, {
    title: `${platform} objectives`,
    options: () => [...(OBJECTIVES[platform] || []).filter(o => o !== 'Other'), ...custom()],
    selected: () => objOf(getC(), platform),
    onToggle: v => {
      const c = getC(), objs = { ...(c.objectives || {}) }, cur = objOf(c, platform);
      objs[platform] = cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v];
      // keep the library's own order so cards and details read consistently
      const order = [...(OBJECTIVES[platform] || []), ...custom()];
      objs[platform].sort((a, b) => order.indexOf(a) - order.indexOf(b));
      return save(objs);
    },
    extra: {
      label: 'Other…',
      onClick: async () => {
        const r = await promptBox({ title: `Custom objective for ${platform}`, label: 'Objective name', placeholder: 'e.g. CTV Retargeting', ok: 'Add' });
        if (!r || !r.value.trim()) return;
        const c = getC(), objs = { ...(c.objectives || {}) };
        objs[platform] = [...objOf(c, platform), CUSTOM_PREFIX + r.value.trim()];
        await save(objs);
      },
    },
  });
}

/* ---------- add / edit form ---------- */
function openCampaignForm(id, accountId, def = {}) {
  const ex = id ? S.data.campaigns[id] : null;
  const accs = accounts(true);
  if (!accs.length) { toast('Add an ad account first'); return ctAddAccount(); }
  const d = ex ? clone(ex) : Object.assign(newCampaign(accountId || accs[0].id), def);
  d.markets = d.markets || []; d.platforms = d.platforms || []; d.objectives = d.objectives || {}; d.clientIds = d.clientIds || [];
  const picks = (field, options) => options.map(o =>
    `<button type="button" class="pick ${d[field].includes(o) ? 'on' : ''}" data-multi="${field}" data-v="${esc(o)}">${esc(o)}</button>`).join('');
  const sel = (field, options) => `<select class="sel" data-f="${field}">${options.map(o => `<option ${d[field] === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
  const w = openModal(`
    <div class="modal-head"><h2>${ex ? 'Edit campaign' : 'New campaign'}</h2><button class="icon-btn" data-m="x">${ico('x')}</button></div>
    <form class="modal-body" style="max-height:70vh;overflow:auto">
      <div class="field"><label>Campaign name *</label><input class="inp" data-f="name" value="${esc(d.name)}" placeholder="e.g. Cadillac Escalade Collection - September" autofocus maxlength="140"></div>
      <div class="field"><label>Description</label><textarea class="ta" data-f="description" rows="2" style="min-height:52px" maxlength="5000" placeholder="Objective, offer, audience, deployment notes">${esc(d.description)}</textarea></div>
      <div class="row2">
        <div class="field"><label>Account</label><select class="sel" data-f="accountId">${accs.map(a => `<option value="${a.id}" ${d.accountId === a.id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Status</label>${sel('status', C_STATUS)}</div>
      </div>
      <div class="row2">
        <div class="field"><label>Start date *</label><input type="date" class="inp" data-f="startDate" value="${d.startDate || ''}"></div>
        <div class="field"><label>End date *</label><input type="date" class="inp" data-f="endDate" value="${d.endDate || ''}"></div>
      </div>
      <div class="field"><label>Markets live</label><div class="picker">${picks('markets', MARKETS)}</div></div>
      <div class="field"><label>Platforms live</label><div class="picker">${picks('platforms', PLATFORMS)}</div></div>
      <div class="field" data-objwrap></div>
      <div class="row2">
        <div class="field"><label>Pacing</label>${sel('pacing', C_PACING)}</div>
        <div class="field"><label>Creatives</label>${sel('creative', C_CREATIVE)}</div>
      </div>
      <div class="row2">
        <div class="field"><label>Results</label>${sel('results', C_RESULTS)}</div>
        <div class="field"><label>Pacing sheet link</label><input class="inp" data-f="pacingUrl" value="${esc(d.pacingUrl || '')}" placeholder="${esc((S.data.accounts[d.accountId] || {}).pacingUrl ? 'Uses the account’s sheet' : 'https://docs.google.com/spreadsheets/…')}" inputmode="url" autocomplete="off"></div>
      </div>
      <div class="row2">
        <div class="field"><label>Brands</label><div class="tm-chips" data-cclients></div></div>
        <div class="field"><label>From brief</label><select class="sel" data-f="briefId"><option value="">-</option>${Object.values(S.data.briefs).filter(b => !b.archived || b.id === d.briefId).sort((a, b) => (b.seq || 0) - (a.seq || 0)).map(b => `<option value="${b.id}" ${d.briefId === b.id ? 'selected' : ''}>${esc(briefLabel(b))}</option>`).join('')}</select></div>
      </div>
      <div class="field" style="margin-bottom:0"><label>Notes / things to check</label><textarea class="ta" data-f="notes" rows="3" maxlength="5000">${esc(d.notes || '')}</textarea></div>
      <button type="submit" hidden></button>
    </form>
    <div class="modal-foot">${ex ? `<button class="btn btn-danger" data-m="delete">${ico('trash', 'i-sm')} Delete</button>` : ''}
      <span class="spacer"></span><button class="btn" data-m="x">Cancel</button>
      <button class="btn btn-primary" data-m="save">${ex ? 'Save changes' : 'Add campaign'}</button></div>`, 'wide');
  const q = s => w.querySelector(s);
  // Objective rows appear for the platforms that are ticked, and only for those.
  const paintObjectives = () => {
    const box = q('[data-objwrap]');
    if (!d.platforms.length) { box.innerHTML = ''; return; }
    box.innerHTML = `<label>Objectives per platform</label>` + d.platforms.map(p => `<div class="obj-row">
        <span class="pf">${esc(p)}</span>
        <span class="objs">
          ${objOf(d, p).map(o => `<span class="obj-chip">${esc(objFull(o))}<button type="button" data-fobjdel="${esc(p)}|${esc(o)}" title="Remove">${ico('x', 'i-sm')}</button></span>`).join('')
            || '<span class="obj-none">No objective yet</span>'}
          <button type="button" class="obj-add" data-fobjadd="${esc(p)}">${objOf(d, p).length ? 'Edit' : '+ Objective'}</button>
        </span></div>`).join('');
  };
  const syncLock = () => {
    const pending = q('[data-f="status"]').value === 'Pending';
    ['pacing', 'results'].forEach(f => {
      const el = q(`[data-f="${f}"]`);
      if (pending) el.value = 'Pending';
      el.disabled = pending;
      el.title = pending ? 'Pending campaigns have no pacing or results yet' : '';
      el.parentElement.style.opacity = pending ? '.6' : '';
    });
  };
  const paintClients = () => { q('[data-cclients]').innerHTML = `${d.clientIds.map(h => `<span class="tag clt">${ico('client', 'i-xs')}${esc(clientName(h))}<button type="button" data-cunclient="${h}">${ico('x', 'i-xs')}</button></span>`).join('')}<button type="button" class="btn sm" data-caddclient>${ico('plus', 'i-xs')} Brand</button>`; };
  syncLock(); paintObjectives(); paintClients();
  q('[data-f="briefId"]').addEventListener('change', e => { const b = S.data.briefs[e.target.value]; if (b && !d.clientIds.length) { d.clientIds = [...(b.clientIds || [])]; paintClients(); } });
  q('[data-f="status"]').addEventListener('change', syncLock);
  w.onDismiss = () => w.close();
  q('form').onsubmit = e => { e.preventDefault(); save(); };
  w.addEventListener('click', async e => {
    const multi = e.target.closest('[data-multi]');
    if (multi) {
      const f = multi.dataset.multi, v = multi.dataset.v;
      d[f] = d[f].includes(v) ? d[f].filter(x => x !== v) : [...d[f], v];
      // keep the fixed list order so cards always read the same way
      const order = f === 'markets' ? MARKETS : PLATFORMS;
      d[f].sort((a, b) => order.indexOf(a) - order.indexOf(b));
      multi.classList.toggle('on', d[f].includes(v));
      if (f === 'platforms') paintObjectives();   // objectives of a removed platform are kept, just hidden
      return;
    }
    const ch = e.target.closest('[data-caddclient]'); if (ch) return openPicker(ch, { title: 'Brands', items: clientItems, selected: () => d.clientIds, onChange: v => { d.clientIds = v; paintClients(); } });
    const cu = e.target.closest('[data-cunclient]'); if (cu) { d.clientIds = d.clientIds.filter(x => x !== cu.dataset.cunclient); return paintClients(); }
    const objAdd = e.target.closest('[data-fobjadd]');
    if (objAdd) return openObjectiveMenu(objAdd, objAdd.dataset.fobjadd, () => d, next => { d.objectives = next; paintObjectives(); });
    const objDel = e.target.closest('[data-fobjdel]');
    if (objDel) {
      const [pf, o] = objDel.dataset.fobjdel.split('|');
      d.objectives = { ...d.objectives, [pf]: objOf(d, pf).filter(x => x !== o) };
      return paintObjectives();
    }
    const b = e.target.closest('[data-m]'); if (!b) return;
    if (b.dataset.m === 'x') w.close();
    if (b.dataset.m === 'save') save();
    if (b.dataset.m === 'delete') { if (await ctDelete(id)) w.close(); }
  });
  async function save() {
    ['name', 'description', 'notes', 'accountId', 'status', 'startDate', 'endDate', 'pacing', 'creative', 'results', 'pacingUrl', 'briefId']
      .forEach(f => { const el = q(`[data-f="${f}"]`); if (el) d[f] = el.value; });
    d.briefId = d.briefId || null;
    d.name = d.name.trim();
    d.pacingUrl = cleanUrl(d.pacingUrl);
    if (d.pacingUrl === null) { q('[data-f="pacingUrl"]').focus(); return toast('The pacing sheet link isn’t a web link - paste the full URL'); }
    if (!d.name) { q('[data-f="name"]').focus(); return toast('Give the campaign a name'); }
    if (!d.startDate || !d.endDate) { return toast('Start and end dates are required'); }
    if (d.endDate < d.startDate) { return toast('The end date is before the start date'); }
    Object.assign(d, applyStatusRules({ status: d.status, pacing: d.pacing, results: d.results }, ex || {}));
    d.updatedAt = Date.now(); d.updatedBy = me();
    if (!ex) { d.order = nextOrder(campaignsOf(d.accountId, true)); await store.put('campaigns', d); }
    else {
      const live = S.data.campaigns[id] || {};
      const { weeklyChecks, pauses, pauseLog, ...edits } = d;   // never overwrite history from a stale form
      await store.put('campaigns', { ...live, ...edits, weeklyChecks: live.weeklyChecks || [], pauses: live.pauses || [], pauseLog: live.pauseLog || [] });
    }
    w.close();
    if (!ex && S.ct.account !== 'all' && S.ct.account !== d.accountId) { S.ct.account = d.accountId; lsSet('tb:ctAccount', d.accountId); render(); }
  }
}

/* ---------- reordering helpers ---------- */
// Dragging implies "my own order" - switch the sort silently so the new order is what you see.
function ctEnsureManualSort() {
  if (S.ct.sort === 'manual') return;
  S.ct.sort = 'manual'; lsSet('tb:ctSort', 'manual');
  toast('Sorted by your own order');
}
async function ctNudgeCampaign(id, dir) {
  const c = S.data.campaigns[id]; if (!c) return;
  ctEnsureManualSort();
  await moveItem(campaignsOf(c.accountId, !!S.ct.archived), 'campaigns', id, dir);
  requestAnimationFrame(() => { const g = $(`[data-grip="${id}"]`); if (g) g.focus(); });
}

/* ---------- wiring ---------- */
// Long lists render in chunks so a single status change never re-parses hundreds of cards.
const ctRepaint = (keepLimit) => { if (!keepLimit) S.ct.limit = 80; render({ mainOnly: true }); };
Object.assign(ACTIONS, {
  'ct-grip': () => {},          // the handle itself never opens the campaign
  'ct-acc': a => { S.ct.account = a.dataset.id; lsSet('tb:ctAccount', a.dataset.id); ctRepaint(); },
  'ct-add-acc': () => ctAddAccount(),
  'ct-acc-menu': a => ctAccountMenu(a, a.dataset.id),
  'ct-add-camp': () => openCampaignForm(null, S.ct.account !== 'all' ? S.ct.account : undefined),
  'ct-open': a => openCampaignDrawer(a.dataset.id),
  'ct-set': a => ctSetMenu(a, a.dataset.id, a.dataset.f),
  'ct-weekly': a => ctWeeklyClick(a, a.dataset.id),
  'ct-archived': () => { S.ct.archived = !S.ct.archived; ctRepaint(); },
  'ct-clear': () => { S.ct.q = ''; Object.keys(S.ct.f).forEach(k => S.ct.f[k] = 'All'); ctRepaint(); },
  'ct-more': () => { S.ct.limit += 160; ctRepaint(true); },
  'ct-acc-link': a => S.data.accounts[a.dataset.id] && ctEditAccountLink(S.data.accounts[a.dataset.id]),
});
document.addEventListener('change', e => {
  const f = e.target.closest('[data-ctf]');
  if (f) { S.ct.f[f.dataset.ctf] = f.value; return ctRepaint(); }
  const s = e.target.closest('[data-ctsort]');
  if (s) { S.ct.sort = s.value; lsSet('tb:ctSort', s.value); ctRepaint(); }
});
document.addEventListener('input', e => {
  if (!e.target.closest('#ct-q')) return;
  S.ct.q = e.target.value;
  clearTimeout(S.ctTimer); S.ctTimer = setTimeout(ctRepaint, 120);
});

/* ---------- notebook wiring (needs ACTIONS) ---------- */
Object.assign(ACTIONS, {
  'nb-tab': a => { S.nb.tab = a.dataset.id; lsSet('tb:nbTab', a.dataset.id); render({ mainOnly: true }); },
  'nb-new': a => nbNew(a.dataset.tpl),
  'nb-tpl-menu': a => openMenu(a, [{ title: 'New from a template' }, { label: 'Blank note', icon: 'plus', onClick: () => nbNew() },
    ...Object.entries(NB_TEMPLATES).map(([k, t]) => ({ label: t.label, icon: t.icon, onClick: () => nbNew(k) }))], 'right'),
  'nb-add-acc': () => nbAddAccount(),
  'nb-pin': () => curNoteId() && nbPin(curNoteId()),
  'nb-tasks': a => nbSendTasks(a),
  'nb-more': a => {
    const id = curNoteId(), n = S.data.notes[id]; if (!n) return;
    openMenu(a, [
      { label: n.pinned ? 'Unpin' : 'Pin to top', icon: 'pin', onClick: () => nbPin(id) },
      { label: 'Duplicate', icon: 'copy', onClick: () => nbDuplicate(id) },
      { label: 'Copy as text', icon: 'copy', onClick: () => { nbFlush(); const x = S.data.notes[id]; navigator.clipboard.writeText(`${x.title || 'Untitled'}\n\n${htmlText($('#nb-editor') ? $('#nb-editor').innerHTML : x.html)}`).then(() => toast('Copied to clipboard'), () => toast('Couldn’t copy')); } },
      '-',
      { label: 'Delete note', icon: 'trash', danger: true, onClick: () => nbDelete(id) },
    ], 'right');
  },
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.closest && t.closest('#nb-editor')) {
    const ed = t.closest('#nb-editor'); nbSchedule(ed.dataset.note);
    const w = $('#nb-words'); if (w) { const n = wordCount(ed.innerText); w.textContent = `${n} word${n === 1 ? '' : 's'}`; }
    return;
  }
  if (t.dataset && t.dataset.nbtitle) { nbSchedule(t.dataset.nbtitle); return; }
  if (t.id === 'nb-q') { S.nb.q = t.value; clearTimeout(S.nbTimer); S.nbTimer = setTimeout(() => render({ mainOnly: true }), 120); }
});
document.addEventListener('change', async e => {
  const t = e.target;
  if (t.dataset && t.dataset.nbs) { S.nb[t.dataset.nbs] = t.value; if (t.dataset.nbs === 'sort') lsSet('tb:nbSort', t.value); render({ mainOnly: true }); return; }
  if (t.dataset && t.dataset.nbf) {
    const id = curNoteId(), n = S.data.notes[id]; if (!n) return;
    nbFlush();
    const v = t.value || null, upd = { [t.dataset.nbf]: v, updatedAt: Date.now(), updatedBy: me() };
    if (t.dataset.nbf === 'accountId') {
      if (n.campaignId && (S.data.campaigns[n.campaignId] || {}).accountId !== v) upd.campaignId = null;
      if (S.nb.tab !== 'all') { S.nb.tab = v || 'general'; lsSet('tb:nbTab', S.nb.tab); }
    }
    await store.update('notes', id, upd);
  }
});
document.addEventListener('keydown', e => {
  const t = e.target;
  // Ctrl/Cmd+S anywhere in the notebook saves straight away instead of opening the browser's save dialog
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && S.route && S.route.view === 'notes') { e.preventDefault(); nbFlush(); nbStatus('Saved'); return; }
  if (t.dataset && t.dataset.nbtitle && e.key === 'Enter') { e.preventDefault(); const ed = nbEd(); if (ed) { ed.focus(); const r = document.createRange(); r.selectNodeContents(ed); r.collapse(true); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } return; }
  if (t.dataset && 'nbtag' in t.dataset && (e.key === 'Enter' || e.key === ',')) {
    e.preventDefault();
    const v = t.value.trim().replace(/^#/, '').replace(/,/g, '').slice(0, 30); const id = curNoteId(), n = S.data.notes[id];
    if (!v || !n) return;
    const tags = n.tags || [];
    if (!tags.some(x => x.toLowerCase() === v.toLowerCase())) nbSetTags(id, [...tags, v]);
    t.value = '';
    setTimeout(() => { const i = $(`#nb-tag-${id}`); if (i) i.focus(); }, 60);
    return;
  }
  if (!t.closest || !t.closest('#nb-editor')) return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); nbLink(); return; }
  if (e.key === ' ' && !e.ctrlKey && !e.metaKey && nbShortcut(e)) return;
  if (e.key === 'Tab' && nbClosest('li')) { e.preventDefault(); document.execCommand(e.shiftKey ? 'outdent' : 'indent'); nbSchedule(nbEd().dataset.note); }
});
document.addEventListener('paste', e => {
  const ed = e.target.closest && e.target.closest('#nb-editor'); if (!ed) return;
  const html = e.clipboardData && e.clipboardData.getData('text/html');
  const text = e.clipboardData && e.clipboardData.getData('text/plain');
  e.preventDefault();
  if (html) document.execCommand('insertHTML', false, cleanHTML(html));
  else if (text) document.execCommand('insertText', false, text);
  nbSchedule(ed.dataset.note);
});
document.addEventListener('drop', e => { if (e.target.closest && e.target.closest('#nb-editor') && e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) { e.preventDefault(); toast('Attachments aren’t supported yet - paste a link instead'); } });
document.addEventListener('mousedown', e => { if (e.target.closest && e.target.closest('[data-nbcmd]')) e.preventDefault(); });   // keep the selection in the editor
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-nbcmd]'); if (b) { nbCmd(b.dataset.nbcmd); return; }
  const td = e.target.closest && e.target.closest('[data-nbtagdel]');
  if (td) { const id = curNoteId(), n = S.data.notes[id]; if (n) nbSetTags(id, (n.tags || []).filter(x => x !== td.dataset.nbtagdel)); return; }
  const ed = e.target.closest && e.target.closest('#nb-editor'); if (!ed) return;
  // the checkbox of a checklist item is drawn in its left gutter
  const li = e.target.closest('ul.nb-check > li');
  if (li && e.clientX - li.getBoundingClientRect().left < 24) {
    e.preventDefault();
    if (li.hasAttribute('data-done')) li.removeAttribute('data-done'); else li.setAttribute('data-done', '1');
    nbSchedule(ed.dataset.note); return;
  }
  const a = e.target.closest('a[href]');
  if (a && (e.ctrlKey || e.metaKey)) { e.preventDefault(); window.open(a.href, '_blank', 'noopener'); }
});
document.addEventListener('selectionchange', () => { if (S.route && S.route.view === 'notes' && nbEd()) nbToolState(); });
document.addEventListener('focusin', e => { if (e.target.id === 'nb-editor') document.execCommand('defaultParagraphSeparator', false, 'p'); });

/* =====================================================================
   CLIENT WORK - clients & labels, briefs & workflow,
   activity log, alerts, notifications, My work and process dashboards.
   Everything reuses the same store, modals, menus, toasts and styling as
   the rest of the app. Data model (all in the same Firestore project):
     projects  kind:'client'  → one task list per client (group, sector, market, contact…)
     projects  kind:'system' → hidden list that holds brief workflow steps
     tasks     clientIds[], labels[]; brief steps also carry briefId, status,
               assignedAt/startedAt/doneAt, slaDays
     briefs    the brief itself, its team and status history
     activity  write-once log of everything that happens (who, what, when)
     notifs    in-app notifications (each person reads only their own)
     mail      outgoing emails, sent by the Trigger Email extension
   ===================================================================== */
Object.assign(P, {
  client: '<rect x="3" y="7.5" width="18" height="12.5" rx="2"/><path d="M8.5 7.5v-2A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5v2"/><path d="M3 13h18"/><path d="M10.5 13v1.5h3V13"/>',
  brief: '<path d="M7.5 3.5h7L19 8v11.5a1 1 0 0 1-1 1H7.5A1.5 1.5 0 0 1 6 19V5a1.5 1.5 0 0 1 1.5-1.5Z"/><path d="M14.5 3.5V8H19"/><path d="M9 12h6M9 15.5h4.5"/>',
  bell: '<path d="M6.2 16.5V11a5.8 5.8 0 0 1 11.6 0v5.5l1.6 2H4.6Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3.5 4.5v4h4"/><path d="M12 8v4.5l3 1.8"/>',
  flow: '<rect x="3" y="4" width="6" height="5" rx="1.2"/><rect x="15" y="15" width="6" height="5" rx="1.2"/><path d="M9 6.5h4.5a2.5 2.5 0 0 1 2.5 2.5v6"/>',
  block: '<circle cx="12" cy="12" r="8.5"/><path d="m6 6 12 12"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  star: '<path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6Z"/>',
});

/* ---------- vocabularies ---------- */
const BRIEF_STATUS = ['Draft', 'Submitted', 'In progress', 'In review', 'Live', 'Completed', 'On hold', 'Cancelled'];
const BRIEF_ACTIVE = ['Draft', 'Submitted', 'In progress', 'In review', 'Live', 'On hold'];
const BRIEF_TONE = { Draft: 'mute', Submitted: 'warn', 'In progress': 'info', 'In review': 'purple', Live: 'good', Completed: 'done', 'On hold': 'mute', Cancelled: 'mute' };
const BRIEF_TYPES = ['Launch', 'Tactical / promotion', 'Seasonal', 'Always-on', 'Event', 'Brand awareness', 'Lead generation', 'Reporting / analysis', 'Other'];
const BRIEF_OBJECTIVES = ['Sales / conversions', 'Leads', 'Awareness', 'Consideration / traffic', 'Engagement', 'Store / showroom visits', 'App installs', 'Other'];
const BRIEF_PRIORITY = ['High', 'Normal', 'Low'];
const LANGS = ['English', 'Arabic', 'Russian', 'German', 'French', 'Italian', 'Chinese', 'Hindi', 'Turkish'];
const STEP_STATUS = ['To do', 'In progress', 'Blocked', 'In review', 'Done'];
const STEP_TONE = { 'To do': 'mute', 'In progress': 'info', Blocked: 'bad', 'In review': 'purple', Done: 'good' };
const STEP_ICON = { 'To do': 'clock', 'In progress': 'play', Blocked: 'block', 'In review': 'eye', Done: 'okcircle' };
const DEFAULT_SECTORS = ['Automotive', 'Hospitality', 'Real estate', 'Retail', 'Education', 'Healthcare', 'Banking & finance', 'Government', 'FMCG', 'Technology', 'Other'];
const DEFAULT_ROLES = ['Account Lead', 'Media Planner', 'Paid Social', 'Paid Search', 'Creative', 'Analytics', 'Client'];
const DEFAULT_CLIENT_SECTIONS = ['Requests', 'In progress', 'Waiting on client'];
const DEFAULT_LABELS = [
  { id: 'lb-creative', name: 'Creative', color: 'pink' }, { id: 'lb-plan', name: 'Media plan', color: 'blue' },
  { id: 'lb-setup', name: 'Setup & trafficking', color: 'purple' }, { id: 'lb-tracking', name: 'Tracking', color: 'teal' },
  { id: 'lb-report', name: 'Reporting', color: 'green' }, { id: 'lb-client', name: 'Client request', color: 'orange' },
  { id: 'lb-urgent', name: 'Urgent', color: 'red' },
];
// Workflow templates: steps run one after another; days are working days (SLA) per step.
// anchor 'flightEnd' = the step falls due N working days after the flight ends (reports).
// launch = the step that puts the campaign live (used for go-live risk and to mark the brief Live).
const DEFAULT_WORKFLOWS = [
  { id: 'wf-full', name: 'Full campaign', steps: [
    { id: 'f1', name: 'Brief review & clarifications', role: 'Account Lead', days: 1 },
    { id: 'f2', name: 'Media plan & budget split', role: 'Media Planner', days: 2 },
    { id: 'f3', name: 'Client approval of plan', role: 'Account Lead', days: 2 },
    { id: 'f4', name: 'Creative brief & asset request', role: 'Account Lead', days: 1 },
    { id: 'f5', name: 'Creative production / adaptation', role: 'Creative', days: 3 },
    { id: 'f6', name: 'Tracking & landing page QA', role: 'Analytics', days: 1 },
    { id: 'f7', name: 'Campaign build & trafficking', role: 'Paid Social', days: 2 },
    { id: 'f8', name: 'Pre-launch QA & go-live', role: 'Media Planner', days: 1, launch: true },
    { id: 'f9', name: 'First optimisation check (72h)', role: 'Paid Social', days: 3 },
    { id: 'f10', name: 'Post-campaign report', role: 'Analytics', days: 5, anchor: 'flightEnd' },
  ] },
  { id: 'wf-quick', name: 'Quick tactical', steps: [
    { id: 'q1', name: 'Brief review', role: 'Account Lead', days: 1 },
    { id: 'q2', name: 'Plan & build', role: 'Paid Social', days: 1 },
    { id: 'q3', name: 'Creative adaptation', role: 'Creative', days: 1 },
    { id: 'q4', name: 'QA & go-live', role: 'Media Planner', days: 1, launch: true },
    { id: 'q5', name: 'Wrap-up report', role: 'Analytics', days: 2, anchor: 'flightEnd' },
  ] },
  { id: 'wf-report', name: 'Reporting request', steps: [
    { id: 'r1', name: 'Scope the request', role: 'Account Lead', days: 1 },
    { id: 'r2', name: 'Data pull', role: 'Analytics', days: 2 },
    { id: 'r3', name: 'Analysis & deck', role: 'Analytics', days: 2 },
    { id: 'r4', name: 'Review & send to client', role: 'Account Lead', days: 1, launch: true },
  ] },
];
const SYS_ID = 'sys-briefs';   // the hidden list that holds every brief's workflow steps

/* ---------- settings helpers ---------- */
const labelsList = () => (settings().labels && settings().labels.length ? settings().labels : DEFAULT_LABELS);
const labelById = id => labelsList().find(l => l.id === id);
const rolesList = () => (settings().roles && settings().roles.length ? settings().roles : DEFAULT_ROLES);
const sectorsList = () => (settings().sectors && settings().sectors.length ? settings().sectors : DEFAULT_SECTORS);
const workflows = () => (settings().workflows && settings().workflows.length ? settings().workflows : DEFAULT_WORKFLOWS);
const workflowById = id => workflows().find(w => w.id === id) || workflows()[0];
const alertCfg = () => Object.assign({ dueSoonDays: 1, stallFactor: 1.5, unopenedHours: 24, kickoffHours: 24 }, settings().alerts || {});
const personByEmail = em => (em ? people().find(p => (p.email || '') === String(em).toLowerCase()) : null);
// "Me" on the team list: matched by sign-in email (synced) or picked in Settings (local mode).
const myPerson = () => personByEmail(S.user && S.user.email) || null;
const myEmail = () => (S.user && S.user.email) || '';
const personName = id => (personById(id) || {}).name || 'Unassigned';
const avatarHTML = (id, cls = 'sm') => { const p = personById(id); return p ? `<span class="avatar ${cls} sw-${esc(p.color || 'grey')}" title="${esc(p.name)}${p.role ? ' · ' + esc(p.role) : ''}">${esc(initials(p.name))}</span>` : `<span class="avatar ${cls} unassigned" title="Unassigned">?</span>`; };
const plural = (n, w, pl) => `${n} ${n === 1 ? w : (pl || w + 's')}`;

/* ---------- working days (SLA maths) ---------- */
const WEEKEND = () => (Array.isArray(CFG.weekend) ? CFG.weekend : [6, 0]);
const isWorkday = k => !WEEKEND().includes(parseKey(k).getDay());
function addWorkdays(k, n) {
  let d = k, left = Math.max(0, Math.round(+n || 0));
  if (!left) { while (!isWorkday(d)) d = addDays(d, 1); return d; }
  while (left > 0) { d = addDays(d, 1); if (isWorkday(d)) left--; }
  return d;
}
// Working days after a up to and including b (negative when b is before a).
function workdaysBetween(a, b) {
  if (!a || !b || a === b) return 0;
  const sign = a < b ? 1 : -1; const [x, y] = sign > 0 ? [a, b] : [b, a];
  let n = 0, d = x; while (d < y) { d = addDays(d, 1); if (isWorkday(d)) n++; }
  return n * sign;
}
// Elapsed time between two moments, counting only working days (in days, fractional).
function workdaysMs(t0, t1) {
  if (!t0 || !t1 || t1 <= t0) return 0;
  let ms = 0, cur = t0, guard = 0;
  while (cur < t1 && guard++ < 2000) {
    const d = new Date(cur), next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime(), end = Math.min(next, t1);
    if (isWorkday(keyOf(d))) ms += end - cur;
    cur = end;
  }
  return ms / 864e5;
}
function fmtDur(days) {
  if (days == null || isNaN(days)) return '-';
  if (days < 1 / 24) return '<1h';
  if (days < 1) return `${Math.round(days * 24)}h`;
  return `${days < 10 ? (Math.round(days * 10) / 10).toString().replace(/\.0$/, '') : Math.round(days)}d`;
}
function subWorkdays(k, n) { let d = k, left = Math.max(0, Math.round(+n || 0)); while (left > 0) { d = addDays(d, -1); if (isWorkday(d)) left--; } return d; }
// "26 Oct, 9:40 AM" (year only when it isn't this year) - for tight table cells.
function fmtStamp(ts) {
  if (!ts) return '';
  const d = new Date(ts); let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  return `${d.getDate()} ${MON[d.getMonth()]}${d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : ''}, ${h}:${pad(d.getMinutes())} ${ap}`;
}
const hoursSince = ts => (ts ? (Date.now() - ts) / 36e5 : 0);
const median = list => { const a = list.filter(x => x != null && !isNaN(x)).sort((x, y) => x - y); return a.length ? a[Math.floor((a.length - 1) / 2)] : null; };
const avg = list => { const a = list.filter(x => x != null && !isNaN(x)); return a.length ? a.reduce((s, x) => s + x, 0) / a.length : null; };

/* ---------- CSV helpers (exports open straight in Excel) ---------- */
function downloadCSV(name, rows) {
  const cell = v => { const s = v == null ? '' : String(v); return /[",\n\r]/.test(s) || /^[=+\-@]/.test(s) ? `"${(/^[=+\-@]/.test(s) ? "'" : '') + s.replace(/"/g, '""')}"` : s; };
  const csv = '﻿' + rows.map(r => r.map(cell).join(',')).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
// Paste from Excel / Google Sheets (tabs) or a CSV file (commas or semicolons).
function parseRows(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n').filter(l => l.trim());
  const sep = lines.some(l => l.includes('\t')) ? '\t' : lines.some(l => l.includes(';')) && !lines.some(l => l.includes(',')) ? ';' : ',';
  return lines.map(l => {
    if (sep === '\t') return l.split('\t').map(x => x.trim());
    const out = []; let cur = '', q = false;
    for (let i = 0; i < l.length; i++) {
      const ch = l[i];
      if (q) { if (ch === '"' && l[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; }
      else if (ch === '"') q = true; else if (ch === sep) { out.push(cur.trim()); cur = ''; } else cur += ch;
    }
    out.push(cur.trim()); return out;
  });
}

/* ---------- a searchable multi-pick menu (clients, labels, people) ---------- */
function openPicker(anchor, { title, items, selected, onChange, single = false, placeholder = 'Search…', footer }) {
  closeMenu();
  const m = document.createElement('div'); m.className = 'menu check-menu picker-menu';
  let q = '';
  m.innerHTML = `${title ? `<div class="menu-title">${esc(title)}</div>` : ''}<div class="pk-search">${ico('search', 'i-sm')}<input placeholder="${esc(placeholder)}" autocomplete="off"></div><div class="pk-list"></div>${footer ? `<hr><button data-foot="1">${ico(footer.icon || 'plus', 'i-sm')}<span>${esc(footer.label)}</span></button>` : ''}`;
  const list = m.querySelector('.pk-list'), inp = m.querySelector('input');
  const paint = () => {
    const sel = new Set(selected()), v = q.trim().toLowerCase();
    const shown = items().filter(it => !v || `${it.label} ${it.sub || ''}`.toLowerCase().includes(v));
    list.innerHTML = shown.slice(0, 200).map(it => `<button data-v="${esc(it.id)}" class="${sel.has(it.id) ? 'on' : ''}">
      <span class="box">${sel.has(it.id) ? ico('check', 'i-sm') : ''}</span>${it.color ? `<i class="dot sw-${esc(it.color)}"></i>` : ''}<span class="lbl">${esc(it.label)}${it.sub ? `<small>${esc(it.sub)}</small>` : ''}</span></button>`).join('')
      || '<div class="pk-empty">Nothing matches.</div>';
  };
  m.addEventListener('mousedown', e => e.stopPropagation());
  m.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return;
    e.stopPropagation(); e.preventDefault();
    if (b.dataset.foot) { closeMenu(); return footer.onClick(); }
    const id = b.dataset.v, cur = selected();
    const next = single ? (cur.includes(id) ? [] : [id]) : (cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]);
    await onChange(next);
    if (single) return closeMenu();
    paint();
  });
  inp.addEventListener('input', () => { q = inp.value; paint(); });
  inp.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); closeMenu(); } if (e.key === 'Enter') { e.preventDefault(); const b = list.querySelector('button'); if (b) b.click(); } });
  document.body.appendChild(m); menuEl = m; paint(); placeMenu(m, anchor);
  setTimeout(() => inp.focus(), 10);
  return m;
}
const clientItems = () => clients().map(h => ({ id: h.id, label: h.name, sub: [h.sector, h.market].filter(Boolean).join(' · '), color: h.color || 'teal' }));
const labelItems = () => labelsList().map(l => ({ id: l.id, label: l.name, color: l.color }));
const personItems = () => people().map(p => ({ id: p.id, label: p.name, sub: p.role || p.email || '', color: p.color || 'grey' }));

/* ---------- chips ---------- */
function clientChips(ids, max = 2, link = true) {
  const list = (ids || []).filter(id => S.data.projects[id]);
  const shown = list.length > max + 1 ? list.slice(0, max) : list;
  return shown.map(id => { const h = S.data.projects[id]; return `<span class="tag clt" ${link ? `data-go="#/client/${id}"` : ''} title="${esc(h.name)}${h.sector ? ' · ' + esc(h.sector) : ''}">${ico('client', 'i-xs')}${esc(h.name)}</span>`; }).join('')
    + (list.length > shown.length ? `<span class="tag more" title="${esc(list.slice(shown.length).map(clientName).join(', '))}">+${list.length - shown.length}</span>` : '');
}
function labelChips(ids) {
  return (ids || []).map(labelById).filter(Boolean).map(l => `<span class="tag lbl-chip lc-${esc(l.color)}">${esc(l.name)}</span>`).join('');
}
const pill = (text, tone, attrs = '') => `<span class="pill tone-${esc(tone || 'mute')}" ${attrs}><span class="dot"></span>${esc(text)}</span>`;
const briefPill = (b, action) => action ? `<button class="pill tone-${BRIEF_TONE[b.status] || 'mute'}" data-action="br-status" data-id="${b.id}" title="Change status"><span class="dot"></span>${esc(b.status)}</button>` : pill(b.status, BRIEF_TONE[b.status]);
const stepPill = (t, action = true) => `<button class="pill tone-${STEP_TONE[t.status] || 'mute'}" ${action && canEditAcc() ? `data-action="st-status" data-id="${t.id}"` : 'disabled'} title="Step status">${ico(STEP_ICON[t.status] || 'clock', 'i-xs')}${esc(t.status || 'To do')}</button>`;

/* =====================================================================
   CLIENTS - every client is a task list (kind 'client') with its own board.
   Tasks anywhere can also be labelled with one or more clients.
   ===================================================================== */
const clients = withArchived => Object.values(S.data.projects).filter(p => p.kind === 'client' && (withArchived || !p.archived)).sort((a, b) => a.name.localeCompare(b.name));
const clientName = id => (S.data.projects[id] || {}).name || 'Removed client';
// A task's clients: the client list it lives in, plus any client labels it carries.
const clientIdsOf = t => { const own = (S.data.projects[t.projectId] || {}).kind === 'client' ? [t.projectId] : []; return [...new Set([...own, ...(t.clientIds || [])])]; };
const tasksForClient = (hid, withDone) => Object.values(S.data.tasks).filter(t => (withDone || !t.done) && !inArchivedProject(t) && clientIdsOf(t).includes(hid));
const briefsForClient = hid => Object.values(S.data.briefs).filter(b => !b.archived && (b.clientIds || []).includes(hid));
const campaignsForClient = hid => Object.values(S.data.campaigns).filter(c => !c.archived && (c.clientIds || []).includes(hid));
function clientStats() {
  const today = todayKey(), out = {};
  clients(true).forEach(h => { out[h.id] = { open: 0, overdue: 0, stepsLate: 0, briefs: 0, live: 0, lastAt: 0, done30: 0 }; });
  const d30 = Date.now() - 30 * 864e5;
  Object.values(S.data.tasks).forEach(t => {
    if (inArchivedProject(t)) return;
    const step = !!t.briefId;
    if (step && (!S.data.briefs[t.briefId] || !BRIEF_ACTIVE.includes(S.data.briefs[t.briefId].status))) return;
    // "open tasks" are client tasks; workflow steps count only when they're late (they live on the brief)
    const late = !t.done && t.due && t.due < today && (!step || stepIsReady(t));
    clientIdsOf(t).forEach(id => { const o = out[id]; if (!o) return;
      if (!t.done) { if (!step) o.open++; if (late) { o.overdue++; if (step) o.stepsLate++; } } else if ((t.completedAt || 0) > d30) o.done30++;
      o.lastAt = Math.max(o.lastAt, t.updatedAt || 0, t.completedAt || 0, t.createdAt || 0); });
  });
  Object.values(S.data.briefs).forEach(b => { if (b.archived || !BRIEF_ACTIVE.includes(b.status)) return; (b.clientIds || []).forEach(id => { if (out[id]) out[id].briefs++; }); });
  Object.values(S.data.campaigns).forEach(c => { if (c.archived || c.status !== 'Live') return; (c.clientIds || []).forEach(id => { if (out[id]) out[id].live++; }); });
  Object.values(S.data.activity).forEach(a => (a.clientIds || []).forEach(id => { if (out[id]) out[id].lastAt = Math.max(out[id].lastAt, a.at || 0); }));
  clients(true).forEach(h => { if (!out[h.id].lastAt) out[h.id].lastAt = h.updatedAt || h.createdAt || 0; });
  return out;
}

/* ---------- directory ---------- */
const CL_SORTS = [['name', 'Brand name'], ['sector', 'Sector'], ['open', 'Most open tasks'], ['overdue', 'Most overdue'], ['briefs', 'Most active briefs'], ['recent', 'Recent activity'], ['quiet', 'Least recent activity']];
function renderClients() {
  const f = S.cl, all = clients(), st = clientStats(), q = f.q.trim().toLowerCase();
  const sectors = [...new Set([...sectorsList(), ...all.map(h => h.sector).filter(Boolean)])].filter(x => all.some(h => h.sector === x));
  const groups = [...new Set(all.map(h => h.group).filter(Boolean))].sort();
  let list = all.filter(h => (f.sector === 'All' || h.sector === f.sector) && (f.parent === 'All' || h.group === f.parent)
    && (!q || `${h.name} ${h.group || ''} ${h.sector || ''} ${h.market || ''} ${h.contactName || ''}`.toLowerCase().includes(q)));
  const by = { name: (a, b) => a.name.localeCompare(b.name), sector: (a, b) => (a.sector || '~').localeCompare(b.sector || '~') || a.name.localeCompare(b.name),
    open: (a, b) => st[b.id].open - st[a.id].open, overdue: (a, b) => st[b.id].overdue - st[a.id].overdue || st[b.id].open - st[a.id].open,
    briefs: (a, b) => st[b.id].briefs - st[a.id].briefs, recent: (a, b) => st[b.id].lastAt - st[a.id].lastAt, quiet: (a, b) => st[a.id].lastAt - st[b.id].lastAt };
  list.sort((a, b) => (by[f.sort] || by.name)(a, b) || a.name.localeCompare(b.name));
  const withOverdue = all.filter(h => st[h.id].overdue).length;
  const sel = (key, opts, label) => `<label class="filt ${f[key] !== 'All' && !['sort', 'group'].includes(key) ? 'on' : ''}">${label ? esc(label) : ''}<select data-clf="${key}">${opts.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${f[key] === v ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select></label>`;
  const row = h => { const s = st[h.id]; return `<tr data-go="#/client/${h.id}" class="${s.overdue ? 'has-over' : ''}">
      <td class="pin-c"><button class="icon-btn pin-btn ${h.pinned ? 'on' : ''}" data-action="cl-pin" data-id="${h.id}" title="${h.pinned ? 'Unpin from sidebar' : 'Pin to sidebar'}">${ico('star', 'i-sm')}</button></td>
      <td><div class="cl-name"><span class="cl-ava sw-${esc(h.color || 'teal')}">${esc(initials(h.name))}</span><span><b>${esc(h.name)}</b><small>${esc(h.group || '')}</small></span></div></td>
      <td>${esc(h.sector || '-')}${h.market ? `<small>${esc(h.market)}</small>` : ''}</td>
      <td class="num">${s.open || '<span class="mut">0</span>'}</td>
      <td class="num">${s.overdue ? `<span class="warn">${s.overdue}</span>` : '<span class="mut">0</span>'}</td>
      <td class="num">${s.briefs || '<span class="mut">0</span>'}</td>
      <td class="num">${s.live || '<span class="mut">0</span>'}</td>
      <td class="mut">${s.lastAt ? timeAgo(s.lastAt) : '-'}</td>
      <td><button class="icon-btn" data-action="cl-menu" data-id="${h.id}" title="More">${ico('dots')}</button></td></tr>`; };
  let body;
  if (f.group === 'none') body = list.map(row).join('');
  else {
    const key = h => (f.group === 'sector' ? h.sector || 'No sector' : f.group === 'parent' ? h.group || 'No group' : h.market || 'No market');
    const groups = {}; list.forEach(h => (groups[key(h)] = groups[key(h)] || []).push(h));
    body = Object.keys(groups).sort().map(g => `<tr class="grp"><td colspan="9">${esc(g)} <span class="mut">${groups[g].length}</span></td></tr>${groups[g].map(row).join('')}`).join('');
  }
  return topbar('Client work /', `
      <button class="top-btn" data-action="cl-import">${ico('upload', 'i-sm')}Import</button>
      <button class="top-btn" data-action="cl-export">${ico('download', 'i-sm')}Export</button>`) +
    `<div class="content"><div class="wide-page">
    <div class="page-head"><h1>Brands</h1><div class="page-desc empty" style="cursor:default">${plural(all.length, 'brand')} tracked${withOverdue ? ` · <span class="warn">${withOverdue} with overdue work</span>` : ''}. Each brand has its own task list; tasks and briefs anywhere can be labelled with a brand.</div></div>
    <div class="ct-toolbar">
      <div class="ct-search">${ico('search', 'i-sm')}<input id="cl-q" data-keep value="${esc(f.q)}" placeholder="Search brands, groups, markets" autocomplete="off"></div>
      ${sel('sector', ['All', ...sectors], 'Sector')}${groups.length ? sel('parent', ['All', ...groups], 'Group') : ''}
      <label class="filt">${ico('sort', 'i-sm')}<select data-clf="sort">${CL_SORTS.map(([v, l]) => `<option value="${v}" ${f.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <label class="filt">Group by<select data-clf="group">${[['none', 'None'], ['sector', 'Sector'], ['parent', 'Group'], ['market', 'Market']].map(([v, l]) => `<option value="${v}" ${f.group === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <span style="flex:1"></span>
      <button class="btn btn-primary" data-action="cl-add">${ico('plus', 'i-sm')} Add brand</button>
    </div>
    ${!all.length ? `<div class="ct-empty">${ico('client')}<br>No brands yet.<br><span style="font-size:12px">Add the brands, markets or dealers you work on for this client - paste a list from Excel, or add them one by one.</span><br><br>
        <button class="btn btn-primary" data-action="cl-import">${ico('upload', 'i-sm')} Import from Excel</button> <button class="btn" data-action="cl-add">${ico('plus', 'i-sm')} Add a brand</button></div>`
      : !list.length ? `<div class="ct-empty">No brands match.<br><br><button class="btn" data-action="cl-clear">Clear filters</button></div>`
      : `<div class="tbl-wrap"><table class="tbl cl-table"><thead><tr><th></th><th>Brand</th><th>Sector &amp; market</th><th class="num">Open tasks</th><th class="num" title="Overdue brand tasks plus late workflow steps">Overdue</th><th class="num">Active briefs</th><th class="num">Live campaigns</th><th>Last activity</th><th></th></tr></thead>
        <tbody>${body}</tbody></table></div>`}
    </div></div>`;
}

/* ---------- one client ---------- */
function renderClient(h) {
  const tab = ['tasks', 'briefs', 'campaigns', 'activity'].includes(S.cl.tab) ? S.cl.tab : 'tasks';
  const st = clientStats()[h.id] || {};
  const elsewhere = Object.values(S.data.tasks).filter(t => t.projectId !== h.id && !t.briefId && !inArchivedProject(t) && (t.clientIds || []).includes(h.id) && (S.showCompleted[h.id] || !t.done))
    .sort((a, b) => a.done - b.done || (a.due || '9999').localeCompare(b.due || '9999'));
  const brs = briefsForClient(h.id).sort((a, b) => BRIEF_STATUS.indexOf(a.status) - BRIEF_STATUS.indexOf(b.status) || (a.goLive || '9999').localeCompare(b.goLive || '9999'));
  const camps = campaignsForClient(h.id);
  const acts = Object.values(S.data.activity).filter(a => (a.clientIds || []).includes(h.id)).sort((a, b) => b.at - a.at);
  const showDone = !!S.showCompleted[h.id];
  const tabBtn = (k, label, n) => `<button class="ct-tab ${tab === k ? 'on' : ''}" data-action="cl-tab" data-t="${k}">${label}${n != null ? ` <span class="n">${n}</span>` : ''}</button>`;
  let body = '';
  if (tab === 'tasks') body = `<div class="board cp-board" id="board">${boardColumns(h)}</div>
      ${elsewhere.length ? `<div class="list" style="max-width:none"><div class="group-head">Labelled “${esc(h.name)}” in other lists and briefs <span class="cnt">${elsewhere.length}</span></div>${elsewhere.map(rowHTML).join('')}</div>` : ''}`;
  if (tab === 'briefs') body = `<div class="ct-toolbar"><span style="flex:1"></span><button class="btn btn-primary" data-action="br-new" data-client="${h.id}">${ico('plus', 'i-sm')} New brief for this brand</button></div>
      ${brs.length ? `<div class="br-grid">${brs.map(b => briefCard(b, false)).join('')}</div>` : '<div class="ct-empty">No briefs for this brand yet.</div>'}`;
  if (tab === 'campaigns') body = `<div class="ct-toolbar"><span style="flex:1"></span><button class="btn btn-primary" data-action="cl-add-camp" data-id="${h.id}">${ico('plus', 'i-sm')} Add campaign</button></div>
      ${camps.length ? `<div class="ct-grid">${camps.map(c => campaignCard(c, true)).join('')}</div>` : '<div class="ct-empty">No campaigns linked to this brand yet. Pick the brand in a campaign’s details to link it.</div>'}`;
  if (tab === 'activity') body = acts.length ? activityList(acts.slice(0, 300)) : '<div class="ct-empty">No activity logged for this brand yet.</div>';
  return topbar(`<a data-go="#/clients" class="crumb-link">Brands</a> /`, `
      ${tab === 'tasks' ? `<button class="top-btn ${showDone ? 'on' : ''}" data-action="toggle-completed">${ico('check')}${showDone ? 'Hide' : 'Show'} completed</button>` : ''}
      <button class="top-btn ${h.pinned ? 'on' : ''}" data-action="cl-pin" data-id="${h.id}">${ico('star', 'i-sm')}${h.pinned ? 'Pinned' : 'Pin'}</button>
      <button class="icon-btn" data-action="cl-menu" data-id="${h.id}" data-align="right">${ico('dots')}</button>`) +
    `<div class="content">${h.archived ? `<div class="ct-banner arc-banner">${ico('archive')}<div style="flex:1"><b>This brand is archived.</b> It's hidden from the directory, Today and Upcoming.</div><button class="btn btn-primary" data-action="arc-restore" data-kind="project" data-id="${h.id}">Restore</button></div>` : ''}
    <div class="cp-head"><span class="cp-ava sw-${esc(h.color || 'teal')}">${ico('client')}</span>
      <div class="cp-main"><h1 class="editable" data-action="cl-edit" data-id="${h.id}" title="Edit brand details">${esc(h.name)}</h1>
        <div class="cp-meta">${[h.group, h.sector, h.market].filter(Boolean).map(esc).join(' · ') || '<span class="mut">Add the sector and markets</span>'}
        ${h.contactName || h.contactEmail ? ` · ${ico('user', 'i-xs')} ${esc(h.contactName || '')}${h.contactEmail ? ` <span class="mut">${esc(h.contactEmail)}</span>` : ''}` : ''}</div>
        ${(h.description || '').trim() ? `<div class="cp-desc">${esc(h.description)}</div>` : ''}</div></div>
    <div class="ct-summary">
      <span class="ct-stat"><b>${st.open || 0}</b> open tasks</span>
      <span class="ct-stat ${st.overdue ? 'alert' : ''}" title="Overdue brand tasks plus late workflow steps on this client's briefs"><b>${st.overdue || 0}</b> overdue${st.stepsLate ? ` <small>(${st.stepsLate} workflow step${st.stepsLate === 1 ? '' : 's'})</small>` : ''}</span>
      <span class="ct-stat"><b>${st.briefs || 0}</b> active brief${st.briefs === 1 ? '' : 's'}</span>
      <span class="ct-stat"><b>${st.live || 0}</b> live campaign${st.live === 1 ? '' : 's'}</span>
      <span class="ct-stat"><b>${st.done30 || 0}</b> done in 30 days</span>
      ${st.lastAt ? `<span class="ct-stat" style="margin-left:auto">Last activity ${timeAgo(st.lastAt)}</span>` : ''}
    </div>
    <div class="ct-tabs">${tabBtn('tasks', 'Tasks', st.open || 0)}${tabBtn('briefs', 'Briefs', brs.length)}${tabBtn('campaigns', 'Campaigns', camps.length)}${tabBtn('activity', 'Activity', null)}</div>
    ${body}</div>`;
}

/* ---------- add / edit ---------- */
function openClientForm(id) {
  const ex = id ? S.data.projects[id] : null;
  const d = ex ? clone(ex) : { id: uid(), kind: 'client', name: '', group: '', sector: '', market: '', contactName: '', contactEmail: '', color: 'teal', description: '' };
  const groups = [...new Set(clients(true).map(h => h.group).filter(Boolean))].sort();
  const w = openModal(`<div class="modal-head"><h2>${ex ? 'Edit brand' : 'Add brand'}</h2><button class="icon-btn" data-x>${ico('x')}</button></div>
    <form class="modal-body">
      <div class="field"><label>Brand name *</label><input class="inp" name="name" value="${esc(d.name)}" maxlength="120" autofocus placeholder="e.g. a brand, market or dealer"></div>
      <div class="row2"><div class="field"><label>Group / parent company</label><input class="inp" name="group" list="cl-groups" value="${esc(d.group || '')}" maxlength="80" placeholder="optional"><datalist id="cl-groups">${groups.map(c => `<option value="${esc(c)}">`).join('')}</datalist></div>
        <div class="field"><label>Sector</label><input class="inp" name="sector" list="cl-sectors" value="${esc(d.sector || '')}" maxlength="80"><datalist id="cl-sectors">${sectorsList().map(b => `<option value="${esc(b)}">`).join('')}</datalist></div></div>
      <div class="field"><label>Markets</label><input class="inp" name="market" value="${esc(d.market || '')}" maxlength="120" placeholder="e.g. UAE, KSA"></div>
      <div class="row2"><div class="field"><label>Client contact</label><input class="inp" name="contactName" value="${esc(d.contactName || '')}" maxlength="80"></div>
        <div class="field"><label>Contact email</label><input class="inp" name="contactEmail" type="email" value="${esc(d.contactEmail || '')}" maxlength="254"></div></div>
      <div class="field"><label>Notes</label><textarea class="ta" name="description" rows="2" maxlength="3000" placeholder="Key facts, approvals, ad accounts, reporting cadence…">${esc(d.description || '')}</textarea></div>
      <div class="field"><label>Color</label><div class="swatches">${COLORS.map(k => `<button type="button" class="swatch sw-${k} ${k === d.color ? 'on' : ''}" data-c="${k}"></button>`).join('')}</div></div>
      <button hidden></button></form>
    <div class="modal-foot"><span class="spacer"></span><button class="btn" data-x>Cancel</button><button class="btn btn-primary" data-ok>${ex ? 'Save' : 'Add client'}</button></div>`);
  const f = w.querySelector('form');
  $$('[data-x]', w).forEach(b => b.onclick = () => w.close());
  $$('.swatch', w).forEach(b => b.onclick = () => { d.color = b.dataset.c; $$('.swatch', w).forEach(x => x.classList.toggle('on', x === b)); });
  const save = async () => {
    const v = k => f[k].value.trim();
    if (!v('name')) return f.name.focus();
    const dup = clients(true).find(h => h.id !== d.id && h.name.toLowerCase() === v('name').toLowerCase());
    if (dup) return toast(`${dup.name} is already in the list`);
    const fields = { name: v('name'), group: v('group'), sector: v('sector'), market: v('market'), contactName: v('contactName'),
      contactEmail: v('contactEmail').toLowerCase(), description: v('description'), color: d.color, updatedAt: Date.now(), updatedBy: me() };
    w.close();
    if (ex) { await store.update('projects', d.id, fields); logAct('client_edited', { kind: 'client', clientIds: [d.id], title: fields.name }); return; }
    const ops = clientOps({ ...d, ...fields });
    await store.batch(ops);
    logAct('client_added', { kind: 'client', clientIds: [d.id], title: fields.name });
    go('#/client/' + d.id);
  };
  w.querySelector('[data-ok]').onclick = save;
  f.onsubmit = e => { e.preventDefault(); save(); };
}
// A new client = its list plus the default board columns.
function clientOps(h, order) {
  const now = Date.now();
  const ops = [{ type: 'put', col: 'projects', data: { kind: 'client', pinned: false, archived: false, description: '', order: order || nextOrder(clients(true)), createdAt: now, createdBy: me(), ...h, id: h.id } }];
  (settings().clientSections && settings().clientSections.length ? settings().clientSections : DEFAULT_CLIENT_SECTIONS).forEach((name, i) =>
    ops.push({ type: 'put', col: 'sections', data: { id: uid(), projectId: h.id, name, order: (i + 1) * 1000, createdAt: now, ...(h.demo ? { demo: true } : {}) } }));
  return ops;
}
function clientMenu(anchor, id) {
  const h = S.data.projects[id]; if (!h) return;
  openMenu(anchor, [
    { label: 'Open brand', icon: 'client', onClick: () => go('#/client/' + id) },
    { label: 'Edit details', icon: 'pencil', onClick: () => openClientForm(id) },
    { label: h.pinned ? 'Unpin from sidebar' : 'Pin to sidebar', icon: 'pin', onClick: () => store.update('projects', id, { pinned: !h.pinned }) },
    { label: 'New brief for this brand', icon: 'brief', onClick: () => openBriefForm(null, { clientIds: [id] }) },
    '-',
    h.archived ? { label: 'Restore from archive', icon: 'archive', onClick: () => archiveProject(h, false) } : { label: 'Archive brand', icon: 'archive', onClick: () => archiveProject(h, true) },
    { label: 'Delete brand', icon: 'trash', danger: true, onClick: () => deleteProject(h) },
  ], anchor.dataset.align || 'right');
}

/* ---------- import from Excel / CSV ---------- */
const CL_COLS = ['name', 'group', 'sector', 'market', 'contactName', 'contactEmail'];
const CL_HEAD = { name: /^(client|account|name|client name|brand)$/i, group: /^(group|parent|parent company|holding)/i, sector: /^(sector|industry|category)/i, market: /^(market|markets|country|countries|region)/i, contactName: /^(contact|contact name|client contact)$/i, contactEmail: /e-?mail/i };
function openClientImport() {
  const w = openModal(`<div class="modal-head"><h2>Import brands</h2><button class="icon-btn" data-x>${ico('x')}</button></div>
    <div class="modal-body">
      <p class="set-p">Copy the rows from Excel or Google Sheets and paste them below (or choose a CSV file). Columns, in this order: <b>Brand name</b>, Group, Sector, Markets, Contact name, Contact email. A header row is fine - it's detected. Brands already in the list are skipped.</p>
      <textarea class="ta" data-paste rows="9" placeholder="Brand name&#9;Group&#9;Sector&#9;Markets&#9;Contact name&#9;Contact email"></textarea>
      <div style="display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap"><label class="btn" style="cursor:pointer">${ico('upload', 'i-sm')} Choose CSV file<input type="file" accept=".csv,.txt,text/csv" data-file hidden></label>
        <button class="btn" data-tpl>${ico('download', 'i-sm')} Download template</button><span class="mut" data-sum style="font-size:12px"></span></div>
      <div data-prev style="margin-top:10px"></div></div>
    <div class="modal-foot"><span class="spacer"></span><button class="btn" data-x>Cancel</button><button class="btn btn-primary" data-ok disabled>Import</button></div>`, 'wide');
  const ta = w.querySelector('[data-paste]'), ok = w.querySelector('[data-ok]');
  $$('[data-x]', w).forEach(b => b.onclick = () => w.close());
  let rows = [];
  const existing = new Set(clients(true).map(h => h.name.toLowerCase()));
  const parse = () => {
    let grid = parseRows(ta.value), map = CL_COLS;
    if (grid.length && grid[0].some(c => CL_HEAD.name.test(c))) {   // header row: map columns by name
      const head = grid.shift(); map = head.map(c => CL_COLS.find(k => CL_HEAD[k].test(c.trim())) || null);
    }
    const seen = new Set();
    rows = grid.map(cells => { const o = {}; map.forEach((k, i) => { if (k && cells[i] != null) o[k] = String(cells[i]).slice(0, 120); }); return o; })
      .filter(o => o.name && o.name.trim()).map(o => { const key = o.name.trim().toLowerCase(); const skip = existing.has(key) || seen.has(key); seen.add(key); return { ...o, name: o.name.trim(), skip }; });
    const n = rows.filter(r => !r.skip).length;
    w.querySelector('[data-sum]').textContent = rows.length ? `${plural(n, 'new client')}${rows.length - n ? ` · ${rows.length - n} already listed (skipped)` : ''}` : '';
    ok.disabled = !n; ok.textContent = n ? `Import ${plural(n, 'brand')}` : 'Import';
    w.querySelector('[data-prev]').innerHTML = rows.length ? `<div class="tbl-wrap" style="max-height:240px"><table class="tbl"><thead><tr><th>Brand</th><th>Group</th><th>Sector</th><th>Markets</th><th>Contact</th><th></th></tr></thead><tbody>
      ${rows.slice(0, 100).map(r => `<tr class="${r.skip ? 'mut' : ''}"><td>${esc(r.name)}</td><td>${esc(r.group || '')}</td><td>${esc(r.sector || '')}</td><td>${esc(r.market || '')}</td><td>${esc(r.contactName || '')}</td><td>${r.skip ? 'skipped' : ''}</td></tr>`).join('')}</tbody></table></div>` : '';
  };
  ta.addEventListener('input', parse);
  w.querySelector('[data-file]').addEventListener('change', async e => { const file = e.target.files[0]; if (!file) return; if (file.size > 2e6) return toast('That file is too large'); ta.value = await file.text(); parse(); });
  w.querySelector('[data-tpl]').onclick = () => downloadCSV('clients-template.csv', [['Brand name', 'Group', 'Sector', 'Markets', 'Contact name', 'Contact email'], ['Example SUVs', 'Example Group', 'Automotive', 'UAE, KSA', '', '']]);
  ok.onclick = async () => {
    const add = rows.filter(r => !r.skip); if (!add.length) return;
    ok.disabled = true; ok.textContent = 'Importing…';
    const ops = []; let order = nextOrder(clients(true));
    add.forEach((r, i) => ops.push(...clientOps({ id: uid(), name: r.name, group: r.group || '', sector: r.sector || '', market: r.market || '',
      contactName: r.contactName || '', contactEmail: (r.contactEmail || '').toLowerCase(), color: COLORS[i % (COLORS.length - 1)] }, order + i * 10)));
    await store.batch(ops);
    logAct('clients_imported', { kind: 'client', detail: `${add.length} clients`, title: add.slice(0, 5).map(r => r.name).join(', ') + (add.length > 5 ? '…' : '') });
    w.close(); toast(`${plural(add.length, 'brand')} imported`); go('#/clients');
  };
}
function exportClients() {
  const st = clientStats();
  downloadCSV(`clients-${todayKey()}.csv`, [['Brand', 'Group', 'Sector', 'Markets', 'Contact', 'Contact email', 'Open tasks', 'Overdue', 'Active briefs', 'Live campaigns', 'Last activity'],
    ...clients().map(h => [h.name, h.group, h.sector, h.market, h.contactName, h.contactEmail, st[h.id].open, st[h.id].overdue, st[h.id].briefs, st[h.id].live, st[h.id].lastAt ? fmtDateTime(st[h.id].lastAt) : ''])]);
}

/* =====================================================================
   BRIEFS - template → submit → assign team (notified by email) → kick off
   the workflow (steps per member, due dates from SLAs) → track to go-live.
   ===================================================================== */
const activeBriefs = () => Object.values(S.data.briefs).filter(b => !b.archived && BRIEF_ACTIVE.includes(b.status));
const briefSteps = bid => Object.values(S.data.tasks).filter(t => t.briefId === bid && !t.archived).sort(byOrder);
const briefRef = b => b.ref || 'Brief';
const briefLabel = b => `${briefRef(b)} · ${b.title || 'Untitled brief'}`;
const onTeam = (b, pid) => !!pid && ((b.team || []).some(m => m.personId === pid) || b.ownerId === pid);
function nextBriefSeq() { return Math.max(0, ...Object.values(S.data.briefs).map(b => +b.seq || 0)) + 1; }
// When a step became workable: assigned, and the step before it finished (steps run in order).
// Report steps anchored to the flight end only become workable once the flight is over.
function stepReadyAt(t, list) {
  const base = t.assignedAt || t.createdAt || 0;
  const steps = list || briefSteps(t.briefId), i = steps.findIndex(x => x.id === t.id);
  let ready = base;
  const prev = i > 0 ? steps[i - 1] : null;
  if (prev && prev.doneAt) ready = Math.max(ready, prev.doneAt);
  const b = S.data.briefs[t.briefId];
  if (t.anchor === 'flightEnd' && b && b.flightEnd) ready = Math.max(ready, parseKey(addDays(b.flightEnd, 1)).getTime() - 12 * 36e5);
  return t.startedAt ? Math.min(ready, t.startedAt) : ready;
}
// A step is workable once the step before it is done (or it has already been started).
function stepIsReady(t, list) {
  if (t.startedAt) return true;
  const steps = list || briefSteps(t.briefId), i = steps.findIndex(x => x.id === t.id);
  if (t.anchor === 'flightEnd') { const b = S.data.briefs[t.briefId]; if (b && b.flightEnd && b.flightEnd >= todayKey()) return false; }
  return i <= 0 || steps[i - 1].status === 'Done';
}
const stepCycle = (t, list) => (t.doneAt ? workdaysMs(stepReadyAt(t, list), t.doneAt) : null);
function stepProgress(bid) { const s = briefSteps(bid); const n = s.filter(t => t.status === 'Done').length; return { n, total: s.length, pct: s.length ? Math.round((n / s.length) * 100) : 0 }; }
function ensureSys() {
  if (S.data.projects[SYS_ID] || !store) return Promise.resolve();
  return store.put('projects', { id: SYS_ID, kind: 'system', name: 'Brief workflow steps', color: 'purple', description: 'Holds the workflow steps of every brief. Hidden from the sidebar.', order: 0, createdAt: Date.now() });
}

/* ---------- go-live risk: project the remaining SLAs forward from today ---------- */
function briefRisk(b) {
  if (!b.goLive || ['Live', 'Completed', 'Cancelled'].includes(b.status)) return { level: 'ok' };
  const today = todayKey();
  if (b.goLive < today) return { level: 'late' };
  const steps = briefSteps(b.id);
  let projected = today;
  if (!steps.length) {
    const wf = workflowById(b.workflowId); const st = wf ? wf.steps : [];
    const li = st.findIndex(x => x.launch); const upto = (li >= 0 ? st.slice(0, li + 1) : st.filter(x => x.anchor !== 'flightEnd'));
    upto.forEach(x => { projected = addWorkdays(projected, x.days); });
  } else {
    const li = steps.findIndex(x => x.launch); const upto = li >= 0 ? steps.slice(0, li + 1) : steps.filter(x => x.anchor !== 'flightEnd');
    upto.filter(x => x.status !== 'Done').forEach(x => {
      const used = x.startedAt ? workdaysMs(x.startedAt, Date.now()) : 0;
      projected = addWorkdays(projected, Math.max(0, Math.ceil((x.slaDays || 0) - used)));
    });
  }
  if (projected > b.goLive) return { level: 'risk', projected, slip: workdaysBetween(b.goLive, projected) };
  return { level: 'ok', projected };
}

/* ---------- cards & lists ---------- */
function briefCard(b, showClients = true) {
  const pr = stepProgress(b.id), risk = briefRisk(b), al = alertsFor({ briefId: b.id });
  const crit = al.filter(a => a.sev === 'crit').length;
  const next = briefSteps(b.id).find(t => t.status !== 'Done');
  const team = [...new Set([b.ownerId, ...(b.team || []).map(m => m.personId)].filter(Boolean))];
  return `<article class="br-card ${crit ? 'al-crit' : al.length ? 'al-warn' : ''}" data-go="#/brief/${b.id}">
    <div class="br-top"><span class="br-ref">${esc(briefRef(b))}</span>${b.priority === 'High' ? `<span class="tag pr-high">High</span>` : ''}<span style="flex:1"></span>${briefPill(b, true)}</div>
    <div class="br-title">${esc(b.title || 'Untitled brief')}</div>
    ${showClients && (b.clientIds || []).length ? `<div class="ct-chips">${clientChips(b.clientIds, 2)}</div>` : ''}
    <div class="br-meta">${b.type ? `<span>${esc(b.type)}</span>` : ''}${b.goLive ? `<span class="${risk.level === 'late' ? 'bad' : risk.level === 'risk' ? 'warn' : ''}" title="Go-live deadline">${ico('target', 'i-xs')}${esc(fmtDay(b.goLive))}${risk.level === 'risk' ? ` · +${risk.slip}d risk` : risk.level === 'late' ? ' · missed' : ''}</span>` : ''}</div>
    ${pr.total ? `<div class="sp ${pr.n === pr.total ? 'full' : ''}"><div class="sp-track"><i style="width:${pr.pct}%"></i></div><span class="sp-lbl">${pr.n}/${pr.total}</span></div>` : ''}
    ${next ? `<div class="br-next">${avatarHTML(next.assignee)}<span>${esc(next.title)}</span>${next.due ? `<span class="${dueInfo(next.due).cls}">${esc(dueInfo(next.due).label)}</span>` : ''}</div>` : ''}
    <div class="br-foot"><span class="avs">${team.slice(0, 5).map(id => avatarHTML(id)).join('')}${team.length > 5 ? `<span class="mut">+${team.length - 5}</span>` : ''}</span>
      ${al.length ? `<span class="br-al ${crit ? 'crit' : ''}" title="${esc(al.map(a => a.detail).join('\n'))}">${ico('alert', 'i-xs')}${al.length}</span>` : ''}</div>
  </article>`;
}
function briefsFiltered() {
  const f = S.br, q = f.q.trim().toLowerCase();
  return Object.values(S.data.briefs).filter(b => {
    if (b.archived && f.status !== 'Archived') return false;
    if (f.status === 'Archived' && !b.archived) return false;
    if (f.status === 'Active' && !BRIEF_ACTIVE.includes(b.status)) return false;
    if (!['All', 'Active', 'Archived'].includes(f.status) && b.status !== f.status) return false;
    if (f.client !== 'All' && !(b.clientIds || []).includes(f.client)) return false;
    if (f.type !== 'All' && b.type !== f.type) return false;
    if (f.member !== 'All' && !onTeam(b, f.member) && !briefSteps(b.id).some(t => t.assignee === f.member)) return false;
    if (q && !`${b.ref} ${b.title} ${b.type || ''} ${b.offer || ''} ${(b.clientIds || []).map(clientName).join(' ')}`.toLowerCase().includes(q)) return false;
    return true;
  }).sort((a, b) => (a.goLive || '9999').localeCompare(b.goLive || '9999') || (b.seq || 0) - (a.seq || 0));
}
function renderBriefs() {
  const f = S.br, list = briefsFiltered(), all = Object.values(S.data.briefs).filter(b => !b.archived);
  const sel = (key, opts, label) => `<label class="filt ${f[key] !== 'All' && !(key === 'status' && f[key] === 'Active') ? 'on' : ''}">${esc(label)}<select data-brf="${key}">${opts.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${f[key] === v ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select></label>`;
  const counts = {}; all.forEach(b => counts[b.status] = (counts[b.status] || 0) + 1);
  const risky = activeBriefs().filter(b => briefRisk(b).level !== 'ok').length;
  const cols = (f.status === 'Active' ? BRIEF_ACTIVE : f.status === 'All' ? BRIEF_STATUS : [f.status]).filter(s => f.status !== 'Archived')
    .filter(s => !['In review', 'On hold', 'Cancelled'].includes(s) || f.status === s || list.some(b => b.status === s));
  const board = f.status === 'Archived' || !cols.length ? '' : `<div class="board br-board">${cols.map(s => { const items = list.filter(b => b.status === s); return `<section class="col br-col">
      <header class="col-head"><span class="pill tone-${BRIEF_TONE[s]}"><span class="dot"></span>${esc(s)}</span><span class="col-count">${items.length}</span></header>
      <div class="cards">${items.map(b => briefCard(b)).join('') || '<div class="col-empty">-</div>'}</div></section>`; }).join('')}</div>`;
  const table = `<div class="tbl-wrap"><table class="tbl br-table"><thead><tr><th>Brief</th><th>Brands</th><th>Type</th><th>Status</th><th>Owner</th><th>Go-live</th><th>Progress</th><th>Next step</th><th></th></tr></thead><tbody>
    ${list.map(b => { const pr = stepProgress(b.id), risk = briefRisk(b), next = briefSteps(b.id).find(t => t.status !== 'Done'), al = alertsFor({ briefId: b.id });
      return `<tr data-go="#/brief/${b.id}"><td><span class="br-ref">${esc(briefRef(b))}</span> <b>${esc(b.title || 'Untitled')}</b></td><td>${clientChips(b.clientIds, 1)}</td><td>${esc(b.type || '')}</td>
        <td>${briefPill(b, true)}</td><td>${b.ownerId ? `${avatarHTML(b.ownerId)} ${esc(personName(b.ownerId))}` : '<span class="mut">-</span>'}</td>
        <td class="${risk.level === 'late' ? 'bad' : risk.level === 'risk' ? 'warn' : ''}">${b.goLive ? esc(fmtDay(b.goLive)) : '<span class="mut">-</span>'}</td>
        <td>${pr.total ? `${pr.n}/${pr.total}` : '<span class="mut">not started</span>'}</td>
        <td>${next ? `${avatarHTML(next.assignee)} ${esc(next.title)}` : '<span class="mut">-</span>'}</td>
        <td>${al.length ? `<span class="br-al ${al.some(a => a.sev === 'crit') ? 'crit' : ''}">${ico('alert', 'i-xs')}${al.length}</span>` : ''}</td></tr>`; }).join('')}
    </tbody></table></div>`;
  return topbar('Client work /', `<button class="top-btn" data-action="br-export">${ico('download', 'i-sm')}Export</button>`) + `<div class="content"><div class="wide-page">
    <div class="page-head"><h1>Briefs</h1><div class="page-desc empty" style="cursor:default">${plural(activeBriefs().length, 'active brief')}${risky ? ` · <span class="warn">${risky} at risk of missing go-live</span>` : ''} · ${counts.Completed || 0} completed</div></div>
    <div class="ct-toolbar">
      <div class="ct-search">${ico('search', 'i-sm')}<input id="br-q" data-keep value="${esc(f.q)}" placeholder="Search briefs, offers, clients" autocomplete="off"></div>
      ${sel('status', ['Active', 'All', ...BRIEF_STATUS, 'Archived'], 'Status')}
      ${sel('client', [['All', 'All'], ...clients().map(h => [h.id, h.name])], 'Brand')}
      ${sel('member', [['All', 'All'], ...people().map(p => [p.id, p.name])], 'Person')}
      ${sel('type', ['All', ...BRIEF_TYPES], 'Type')}
      <div class="seg">${[['board', 'Board'], ['table', 'Table']].map(([v, l]) => `<button class="${f.layout === v ? 'on' : ''}" data-action="br-layout" data-v="${v}">${l}</button>`).join('')}</div>
      <span style="flex:1"></span>
      <button class="btn btn-primary" data-action="br-new">${ico('plus', 'i-sm')} New brief</button>
    </div>
    ${!all.length && f.status !== 'Archived' ? `<div class="ct-empty">${ico('brief')}<br>No briefs yet.<br><span style="font-size:12px">A brief captures the client, offer, budget, markets and go-live date. Once it's submitted you assign the team, and the workflow tracks every step.</span><br><br><button class="btn btn-primary" data-action="br-new">${ico('plus', 'i-sm')} Write the first brief</button></div>`
      : !list.length ? '<div class="ct-empty">No briefs match these filters.</div>' : f.layout === 'table' || f.status === 'Archived' ? table : board}
  </div></div>`;
}
function exportBriefs() {
  downloadCSV(`briefs-${todayKey()}.csv`, [['Ref', 'Title', 'Status', 'Type', 'Brands', 'Owner', 'Requested by', 'Submitted', 'Kicked off', 'Go-live', 'Live since', 'Completed', 'Budget', 'Currency', 'Markets', 'Platforms', 'Steps done', 'Steps total'],
    ...briefsFiltered().map(b => { const pr = stepProgress(b.id); return [b.ref, b.title, b.status, b.type, (b.clientIds || []).map(clientName).join('; '), personName(b.ownerId), b.requestedBy,
      b.submittedAt ? fmtDateTime(b.submittedAt) : '', b.kickoffAt ? fmtDateTime(b.kickoffAt) : '', b.goLive || '', b.liveAt ? fmtDateTime(b.liveAt) : '', b.closedAt ? fmtDateTime(b.closedAt) : '',
      b.budget ?? '', b.currency || CFG.currency || '', (b.markets || []).join('; '), (b.platforms || []).join('; '), pr.n, pr.total]; })]);
}

/* ---------- the brief form (the briefing template) ---------- */
function newBrief(def = {}) {
  return Object.assign({ id: uid(), seq: null, ref: '', title: '', status: 'Draft', type: BRIEF_TYPES[0], priority: 'Normal', clientIds: [], objective: BRIEF_OBJECTIVES[0], kpis: '',
    budget: null, currency: CFG.currency || 'AED', flightStart: null, flightEnd: null, goLive: null, requestDate: todayKey(), markets: [], platforms: [], languages: ['English', 'Arabic'],
    audience: '', offer: '', promo: '', message: '', cta: '', landingUrl: '', assetsUrl: '', creative: '', notes: '', requestedBy: '', requestedByEmail: '',
    ownerId: (myPerson() || {}).id || null, team: [], workflowId: workflows()[0].id, statusLog: [], archived: false, createdAt: Date.now(), createdBy: me() }, def);
}
// A filled-in example so people can see what goes in each section of the template.
function exampleBrief() {
  const hs = clients(), gl = addWorkdays(todayKey(), 15);
  return { title: 'Year-End Sales Event - 0% finance', type: 'Tactical / promotion', priority: 'Normal', clientIds: hs.slice(0, 2).map(h => h.id),
    objective: 'Leads', kpis: '900 test-drive leads · CPL ≤ AED 250 · 3% lead-to-sale', budget: 60000, currency: CFG.currency || 'AED',
    goLive: gl, flightStart: gl, flightEnd: addDays(gl, 30), markets: ['UAE', 'KSA'], platforms: ['Search', 'Meta', 'TikTok'], languages: ['English', 'Arabic'],
    audience: 'In-market buyers researching SUVs and pickups, plus people who enquired in the last 90 days.',
    offer: '0% finance for 36 months and 3 years free service on selected models. Valid until 31 December; subject to bank approval.',
    promo: '', cta: 'Book a test drive', message: 'The best deal of the year ends 31 December.', landingUrl: 'https://www.example.com/year-end-offer', assetsUrl: '',
    creative: 'Search RSAs in English and Arabic with model sitelinks; Meta 1:1 and 9:16 lead-form ads; TikTok 9:16 15s video.',
    notes: 'Campaign names follow the client naming convention. Lead forms post to the client CRM - QA the hand-off before launch.',
    requestedBy: 'Client marketing team', requestedByEmail: '' };
}
const BRIEF_FIELDS = ['title', 'type', 'priority', 'clientIds', 'objective', 'kpis', 'budget', 'currency', 'flightStart', 'flightEnd', 'goLive', 'requestDate', 'markets', 'platforms', 'languages',
  'audience', 'offer', 'promo', 'message', 'cta', 'landingUrl', 'assetsUrl', 'creative', 'notes', 'requestedBy', 'requestedByEmail', 'ownerId', 'workflowId'];
function openBriefForm(id, def = {}) {
  const ex = id ? S.data.briefs[id] : null;
  // New briefs open filled with the example while the sample data is loaded (or on request); "Start blank" clears it.
  const { _example, ...base } = def;
  const useEx = !ex && (_example === true || (_example !== false && Object.values(S.data.briefs).some(b => b.demo)));
  const d = ex ? clone(ex) : newBrief({ ...(useEx ? exampleBrief() : {}), ...base });
  const picks = (field, options) => options.map(o => `<button type="button" class="pick ${d[field].includes(o) ? 'on' : ''}" data-multi="${field}" data-v="${esc(o)}">${esc(o)}</button>`).join('');
  const opt = (list, v) => list.map(o => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('');
  const w = openModal(`<div class="modal-head"><h2>${ex ? `Edit ${esc(briefRef(ex))}` : 'New brief'}</h2><span class="mut" style="font-size:12px">${ex ? '' : 'Fields marked * are needed to submit'}</span><button class="icon-btn" data-m="x">${ico('x')}</button></div>
    <form class="modal-body bf" style="max-height:72vh;overflow:auto">
      ${ex ? '' : useEx ? `<div class="bf-example">${ico('sparkle', 'i-sm')}<span>Example values are filled in so you can see what goes in each section - edit anything, or start from scratch.</span><button type="button" class="btn sm" data-m="blank">Start blank</button></div>`
        : `<div class="bf-example quiet"><span>Not sure what to write?</span><button type="button" class="btn sm" data-m="example">${ico('sparkle', 'i-sm')} Fill with an example</button></div>`}
      <div class="bf-sec"><h4>1 · Overview</h4>
        <div class="field"><label>Brief title *</label><input class="inp" data-f="title" value="${esc(d.title)}" maxlength="160" autofocus placeholder="e.g. Year-End Sales Event"></div>
        <div class="field" ${toolOn('brands') ? '' : 'hidden'}><label>Brands</label><div class="bf-clients" data-clients></div></div>
        <div class="row3"><div class="field"><label>Brief type</label><select class="sel" data-f="type">${opt(BRIEF_TYPES, d.type)}</select></div>
          <div class="field"><label>Priority</label><select class="sel" data-f="priority">${opt(BRIEF_PRIORITY, d.priority)}</select></div>
          <div class="field"><label>Brief owner (account lead)</label><select class="sel" data-f="ownerId"><option value="">-</option>${people().map(p => `<option value="${p.id}" ${d.ownerId === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div></div>
        <div class="row3"><div class="field"><label>Requested by</label><input class="inp" data-f="requestedBy" value="${esc(d.requestedBy)}" maxlength="80" placeholder="Client marketing team"></div>
          <div class="field"><label>Requester email</label><input class="inp" type="email" data-f="requestedByEmail" value="${esc(d.requestedByEmail)}" maxlength="254"></div>
          <div class="field"><label>Request date</label><input class="inp" type="date" data-f="requestDate" value="${d.requestDate || ''}"></div></div></div>
      <div class="bf-sec"><h4>2 · Objective &amp; KPIs</h4>
        <div class="row2"><div class="field"><label>Primary objective *</label><select class="sel" data-f="objective">${opt(BRIEF_OBJECTIVES, d.objective)}</select></div>
          <div class="field"><label>KPIs / targets</label><input class="inp" data-f="kpis" value="${esc(d.kpis)}" maxlength="300" placeholder="e.g. 800 leads, CPL ≤ AED 200, ROAS 4"></div></div></div>
      <div class="bf-sec"><h4>3 · Budget &amp; timing</h4>
        <div class="row3"><div class="field"><label>Media budget</label><div class="inline"><input class="inp" type="number" min="0" step="100" data-f="budget" value="${d.budget ?? ''}" placeholder="0"><input class="inp" data-f="currency" value="${esc(d.currency || CFG.currency || 'AED')}" maxlength="4" style="width:64px"></div></div>
          <div class="field"><label>Go-live deadline *</label><input class="inp" type="date" data-f="goLive" value="${d.goLive || ''}"></div>
          <div class="field"><label>Workflow</label><select class="sel" data-f="workflowId">${workflows().map(x => `<option value="${x.id}" ${d.workflowId === x.id ? 'selected' : ''}>${esc(x.name)} (${x.steps.length} steps)</option>`).join('')}</select></div></div>
        <div class="row2"><div class="field"><label>Flight start</label><input class="inp" type="date" data-f="flightStart" value="${d.flightStart || ''}"></div>
          <div class="field"><label>Flight end</label><input class="inp" type="date" data-f="flightEnd" value="${d.flightEnd || ''}"></div></div>
        <div class="hint" data-sla-hint></div></div>
      <div class="bf-sec"><h4>4 · Audience, markets &amp; channels</h4>
        <div class="field"><label>Target audience</label><textarea class="ta" data-f="audience" rows="2" maxlength="3000" placeholder="Who, where from, travel intent, segments (families, couples, business, staycation…)">${esc(d.audience)}</textarea></div>
        <div class="field"><label>Source markets</label><div class="picker">${picks('markets', MARKETS)}</div></div>
        <div class="field"><label>Platforms</label><div class="picker">${picks('platforms', PLATFORMS)}</div></div>
        <div class="field"><label>Languages</label><div class="picker">${picks('languages', LANGS)}</div></div></div>
      <div class="bf-sec"><h4>5 · Offer &amp; messaging</h4>
        <div class="field"><label>Offer / promotion details</label><textarea class="ta" data-f="offer" rows="2" maxlength="3000" placeholder="Offer mechanics, validity dates, inclusions, terms">${esc(d.offer)}</textarea></div>
        <div class="row2"><div class="field"><label>Promo / rate code</label><input class="inp" data-f="promo" value="${esc(d.promo)}" maxlength="80"></div>
          <div class="field"><label>Call to action</label><input class="inp" data-f="cta" value="${esc(d.cta)}" maxlength="80" placeholder="Book now"></div></div>
        <div class="field"><label>Key message</label><textarea class="ta" data-f="message" rows="2" maxlength="2000">${esc(d.message)}</textarea></div>
        <div class="field"><label>Landing page</label><input class="inp" data-f="landingUrl" value="${esc(d.landingUrl)}" inputmode="url" placeholder="https://…" autocomplete="off"></div></div>
      <div class="bf-sec"><h4>6 · Creative &amp; notes</h4>
        <div class="field"><label>Creative requirements</label><textarea class="ta" data-f="creative" rows="2" maxlength="3000" placeholder="Formats, sizes, video lengths, available assets, brand guidelines">${esc(d.creative)}</textarea></div>
        <div class="field"><label>Assets folder link</label><input class="inp" data-f="assetsUrl" value="${esc(d.assetsUrl)}" inputmode="url" placeholder="Drive / SharePoint / WeTransfer link" autocomplete="off"></div>
        <div class="field"><label>Anything else</label><textarea class="ta" data-f="notes" rows="2" maxlength="5000">${esc(d.notes)}</textarea></div></div>
    </form>
    <div class="modal-foot">${ex ? '' : '<span class="mut" style="font-size:12px">Save as a draft, or submit it to the team.</span>'}<span class="spacer"></span><button class="btn" data-m="x">Cancel</button>
      ${ex ? '<button class="btn btn-primary" data-m="save">Save changes</button>' : '<button class="btn" data-m="draft">Save draft</button><button class="btn btn-primary" data-m="submit">Submit brief</button>'}</div>`, 'wide');
  const q = s => w.querySelector(s);
  const paintClients = () => {
    q('[data-clients]').innerHTML = `${d.clientIds.map(id => `<span class="tag clt">${ico('client', 'i-xs')}${esc(clientName(id))}<button type="button" data-unclient="${id}" title="Remove">${ico('x', 'i-xs')}</button></span>`).join('')}
      <button type="button" class="btn sm" data-addclient>${ico('plus', 'i-sm')} ${d.clientIds.length ? 'Add' : 'Choose brands'}</button>
      ${!clients().length ? '<span class="hint">Optional - add the account’s brands under Brands</span>' : ''}`;
  };
  const slaHint = () => {
    const wf = workflowById(q('[data-f=workflowId]').value), gl = q('[data-f=goLive]').value;
    const li = wf.steps.findIndex(x => x.launch); const need = (li >= 0 ? wf.steps.slice(0, li + 1) : wf.steps).filter(x => x.anchor !== 'flightEnd').reduce((s, x) => s + (+x.days || 0), 0);
    const earliest = addWorkdays(todayKey(), need);
    q('[data-sla-hint]').innerHTML = `${esc(wf.name)} needs about <b>${need} working days</b> to go live - earliest if kicked off today: <b>${esc(longDay(earliest))}</b>.${gl && gl < earliest ? ` <span class="warn">${ico('alert', 'i-xs')} The go-live date is ${workdaysBetween(gl, earliest)} working day(s) tighter than the workflow's SLAs.</span>` : ''}`;
  };
  paintClients(); slaHint();
  q('[data-f=workflowId]').addEventListener('change', slaHint); q('[data-f=goLive]').addEventListener('change', slaHint);
  w.addEventListener('click', async e => {
    const mp = e.target.closest('[data-multi]');
    if (mp) { const k = mp.dataset.multi, v = mp.dataset.v; d[k] = d[k].includes(v) ? d[k].filter(x => x !== v) : [...d[k], v]; mp.classList.toggle('on'); return; }
    const uh = e.target.closest('[data-unclient]'); if (uh) { d.clientIds = d.clientIds.filter(x => x !== uh.dataset.unclient); paintClients(); return; }
    const ah = e.target.closest('[data-addclient]');
    if (ah) { openPicker(ah, { title: 'Brands', items: clientItems, selected: () => d.clientIds, onChange: v => { d.clientIds = v; paintClients(); }, placeholder: 'Search clients…' }); return; }
    const b = e.target.closest('[data-m]'); if (!b) return;
    const m = b.dataset.m;
    if (m === 'x') return w.onDismiss();
    if (m === 'blank' || m === 'example') { w.close(); return openBriefForm(null, { ...base, _example: m === 'example' }); }
    collect();
    if (!d.title) { q('[data-f=title]').focus(); return toast('Give the brief a title'); }
    if (m === 'submit' || (ex && ex.status !== 'Draft' && m === 'save')) {
      if (!d.goLive) { q('[data-f=goLive]').focus(); return toast('Add the go-live deadline'); }
    }
    if (d.landingUrl === null || d.assetsUrl === null) return toast('That link doesn’t look right');
    await saveBrief(m);
  });
  const collect = () => {
    $$('[data-f]', w).forEach(el => { const k = el.dataset.f; let v = el.value.trim(); if (k === 'budget') v = v === '' ? null : Math.max(0, +v || 0); if (['flightStart', 'flightEnd', 'goLive', 'requestDate', 'ownerId'].includes(k)) v = v || null; d[k] = v; });
    d.landingUrl = d.landingUrl ? cleanUrl(d.landingUrl) : ''; d.assetsUrl = d.assetsUrl ? cleanUrl(d.assetsUrl) : '';
    d.requestedByEmail = (d.requestedByEmail || '').toLowerCase();
  };
  const dirty = () => { collect(); return ex ? JSON.stringify(pick(d, BRIEF_FIELDS)) !== JSON.stringify(pick(ex, BRIEF_FIELDS)) : !!d.title; };
  w.onDismiss = async () => { if (dirty() && !await confirmBox(ex ? 'Discard your changes to this brief?' : 'Discard this brief?', 'Discard', 'Discard changes?')) return; w.close(); };
  const saveBrief = async m => {
    const now = Date.now();
    if (ex) {
      const old = clone(ex);
      const data = { ...pick(d, BRIEF_FIELDS), updatedAt: now, updatedBy: me() };
      const changed = BRIEF_FIELDS.filter(k => JSON.stringify(ex[k] ?? null) !== JSON.stringify(data[k] ?? null));
      await store.update('briefs', d.id, data);
      // keep the steps' client labels in line with the brief
      if (changed.includes('clientIds')) await store.batch(briefSteps(d.id).map(t => ({ type: 'update', col: 'tasks', id: t.id, data: { clientIds: d.clientIds } })));
      if (changed.length) logAct('brief_edited', { kind: 'brief', briefId: d.id, clientIds: d.clientIds, title: briefLabel(d), detail: changed.map(k => BRIEF_FIELD_LABEL[k] || k).join(', ') });
      if (changed.includes('goLive')) logAct('golive_changed', { kind: 'brief', briefId: d.id, clientIds: d.clientIds, title: briefLabel(d), from: old.goLive ? fmtDay(old.goLive) : '-', to: d.goLive ? fmtDay(d.goLive) : '-' });
      w.close(); return;
    }
    d.seq = nextBriefSeq(); d.ref = 'RB-' + String(d.seq).padStart(4, '0');
    d.status = m === 'submit' ? 'Submitted' : 'Draft';
    d.statusLog = [{ status: 'Draft', at: now, by: me() }, ...(m === 'submit' ? [{ status: 'Submitted', at: now, by: me() }] : [])];
    if (m === 'submit') d.submittedAt = now;
    d.createdAt = now; d.updatedAt = now;
    await store.put('briefs', d);
    logAct('brief_created', { kind: 'brief', briefId: d.id, clientIds: d.clientIds, title: briefLabel(d) });
    if (m === 'submit') { logAct('brief_submitted', { kind: 'brief', briefId: d.id, clientIds: d.clientIds, title: briefLabel(d) }); notifyBriefSubmitted(d); }
    w.close(); go('#/brief/' + d.id);
    if (m === 'submit') setTimeout(() => openTeamModal(d.id), 250);
  };
}
const BRIEF_FIELD_LABEL = { title: 'title', type: 'type', priority: 'priority', clientIds: 'brands', objective: 'objective', kpis: 'KPIs', budget: 'budget', currency: 'currency', flightStart: 'flight start', flightEnd: 'flight end',
  goLive: 'go-live', requestDate: 'request date', markets: 'markets', platforms: 'platforms', languages: 'languages', audience: 'audience', offer: 'offer', promo: 'promo code', message: 'key message', cta: 'CTA',
  landingUrl: 'landing page', assetsUrl: 'assets link', creative: 'creative requirements', notes: 'notes', requestedBy: 'requested by', requestedByEmail: 'requester email', ownerId: 'owner', workflowId: 'workflow' };

/* ---------- status changes (every change is logged with who and when) ---------- */
async function setBriefStatus(b, status, extra = {}) {
  if (!b || b.status === status) return;
  b = clone(b);   // local mode updates objects in place: keep the "before" picture for the log
  const now = Date.now(), upd = { status, updatedAt: now, updatedBy: me(), statusLog: [...(b.statusLog || []), { status, at: now, by: me() }].slice(-200), ...extra };
  if (status === 'Submitted' && !b.submittedAt) upd.submittedAt = now;
  if (status === 'Live' && !b.liveAt) upd.liveAt = now;
  if (status === 'Completed') upd.closedAt = now;
  if (b.status === 'Completed' && status !== 'Completed') upd.closedAt = null;
  await store.update('briefs', b.id, upd);
  logAct(status === 'Submitted' ? 'brief_submitted' : 'brief_status', { kind: 'brief', briefId: b.id, clientIds: b.clientIds, title: briefLabel(b), from: b.status, to: status });
  if (status === 'Submitted') notifyBriefSubmitted({ ...b, ...upd });
  if (['Live', 'Completed', 'On hold', 'Cancelled'].includes(status)) teamOf(b).forEach(pid => notify(pid, { kind: 'brief', title: `${briefRef(b)} is now ${status}`, body: b.title, link: `#/brief/${b.id}`, briefId: b.id }));
}
function briefStatusMenu(anchor, id) {
  const b = S.data.briefs[id]; if (!b) return;
  openMenu(anchor, [{ title: 'Brief status' }, ...BRIEF_STATUS.map(s => ({ label: `${s === b.status ? '✓  ' : '     '}${s}`, onClick: async () => {
    if (s === 'In progress' && !briefSteps(b.id).length) return openKickoff(b.id);
    await setBriefStatus(b, s);
  } }))]);
}
const teamOf = b => [...new Set([b.ownerId, ...(b.team || []).map(m => m.personId)].filter(Boolean))];

/* ---------- team & assignment ---------- */
function openTeamModal(id) {
  const b = S.data.briefs[id]; if (!b) return;
  const cur = new Map((b.team || []).map(m => [m.personId, m]));
  const pick = new Map([...cur].map(([k, v]) => [k, v.role || (personById(k) || {}).role || '']));
  let owner = b.ownerId || null;
  if (!people().length) { toast('Add your team in Settings first'); return openSettings(); }
  const w = openModal(`<div class="modal-head"><h2>Team for ${esc(briefRef(b))}</h2><button class="icon-btn" data-x>${ico('x')}</button></div>
    <div class="modal-body"><p class="set-p">Tick the people working on this brief and their role on it. Everyone newly added gets an in-app notification${CFG.email && CFG.email.enabled !== false ? ' and an email' : ''}. Workflow steps are assigned by role.</p>
      <div data-rows></div></div>
    <div class="modal-foot"><span class="mut" data-cnt style="font-size:12px"></span><span class="spacer"></span><button class="btn" data-x>Cancel</button><button class="btn btn-primary" data-ok>Save team</button></div>`, 'wide');
  const paint = () => {
    w.querySelector('[data-rows]').innerHTML = `<table class="tbl team-tbl"><thead><tr><th></th><th>Person</th><th>Role on this brief</th><th>Owner</th><th>Status</th></tr></thead><tbody>${people().map(p => { const on = pick.has(p.id), m = cur.get(p.id);
      return `<tr class="${on ? '' : 'off'}"><td><button class="check ${on ? 'checked' : ''}" data-tog="${p.id}">${ico('check')}</button></td>
        <td>${avatarHTML(p.id)} <b>${esc(p.name)}</b>${p.email ? `<small>${esc(p.email)}</small>` : '<small class="warn">no email - in-app only</small>'}</td>
        <td><select class="sel" data-role="${p.id}" ${on ? '' : 'disabled'}><option value="">-</option>${rolesList().map(r => `<option ${(pick.get(p.id) || p.role) === r ? 'selected' : ''}>${esc(r)}</option>`).join('')}</select></td>
        <td><input type="radio" name="owner" data-owner="${p.id}" ${owner === p.id ? 'checked' : ''} title="Brief owner (account lead)"></td>
        <td class="mut">${m ? (m.openedAt ? `Opened ${timeAgo(m.openedAt)}` : `Assigned ${timeAgo(m.addedAt)} · not opened`) : ''}</td></tr>`; }).join('')}</tbody></table>`;
    w.querySelector('[data-cnt]').textContent = `${pick.size} selected`;
  };
  paint();
  $$('[data-x]', w).forEach(x => x.onclick = () => w.close());
  w.addEventListener('click', e => { const t = e.target.closest('[data-tog]'); if (!t) return; const pid = t.dataset.tog; if (pick.has(pid)) pick.delete(pid); else pick.set(pid, (personById(pid) || {}).role || ''); paint(); });
  w.addEventListener('change', e => { const r = e.target.closest('[data-role]'); if (r) pick.set(r.dataset.role, r.value); const o = e.target.closest('[data-owner]'); if (o) { owner = o.dataset.owner; if (!pick.has(owner)) pick.set(owner, (personById(owner) || {}).role || 'Account Lead'); paint(); } });
  w.querySelector('[data-ok]').onclick = async () => {
    const now = Date.now();
    const team = [...pick].map(([pid, role]) => { const old = cur.get(pid); return { personId: pid, role, addedAt: old ? old.addedAt : now, openedAt: old ? old.openedAt || null : null }; });
    const added = team.filter(m => !cur.has(m.personId)), removed = [...cur.keys()].filter(pid => !pick.has(pid)), oldOwner = b.ownerId || null;
    await store.update('briefs', b.id, { team, ownerId: owner, updatedAt: now, updatedBy: me() });
    added.forEach(m => { logAct('team_added', { kind: 'brief', briefId: b.id, clientIds: b.clientIds, title: briefLabel(b), to: personName(m.personId), detail: m.role }); });
    removed.forEach(pid => logAct('team_removed', { kind: 'brief', briefId: b.id, clientIds: b.clientIds, title: briefLabel(b), to: personName(pid) }));
    if (owner !== oldOwner) logAct('owner_changed', { kind: 'brief', briefId: b.id, clientIds: b.clientIds, title: briefLabel(b), from: oldOwner ? personName(oldOwner) : '-', to: owner ? personName(owner) : '-' });
    // steps already running: give unassigned ones to whoever now holds that role
    const nb = { ...b, team, ownerId: owner };
    const fill = briefSteps(b.id).filter(t => !t.assignee && t.status !== 'Done').map(t => ({ t, pid: personForRole(nb, t.role) })).filter(x => x.pid);
    if (fill.length) {
      await store.batch(fill.map(x => ({ type: 'update', col: 'tasks', id: x.t.id, data: { assignee: x.pid, assignedAt: now } })));
      fill.forEach(x => logAct('step_assigned', { kind: 'step', briefId: b.id, taskId: x.t.id, clientIds: b.clientIds, title: x.t.title, to: personName(x.pid) }));
    }
    w.close();
    // Workflow not started yet: hold the "you're on this brief" messages and send them with each person's steps.
    if (!briefSteps(b.id).length && ['Submitted', 'Draft', 'In progress'].includes(b.status) && team.length) return setTimeout(() => openKickoff(b.id, added), 200);
    added.forEach(m => notifyAssigned(nb, m.personId, m.role, fill.filter(x => x.pid === m.personId).map(x => x.t)));
    if (added.length) toast(`${plural(added.length, 'person', 'people')} notified`);
  };
}
// Who takes a step with this role: the brief's team member with that role, else the owner.
function personForRole(b, role) {
  const m = (b.team || []).find(x => (x.role || (personById(x.personId) || {}).role) === role);
  return m ? m.personId : (b.ownerId || null);
}

/* ---------- kick-off: create the steps from the workflow ---------- */
function openKickoff(id, pending = []) {
  const b = S.data.briefs[id]; if (!b) return;
  if (briefSteps(b.id).length) return toast('The workflow has already started');
  let wfId = b.workflowId || workflows()[0].id;
  const w = openModal(`<div class="modal-head"><h2>Kick off ${esc(briefRef(b))}</h2><button class="icon-btn" data-x>${ico('x')}</button></div>
    <div class="modal-body"><div class="field"><label>Workflow</label><select class="sel" data-wf>${workflows().map(x => `<option value="${x.id}" ${x.id === wfId ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>
      <div data-plan></div></div>
    <div class="modal-foot"><span class="mut" style="font-size:12px">You can change any assignee or date afterwards.</span><span class="spacer"></span><button class="btn" data-x>Cancel</button><button class="btn btn-primary" data-ok>${ico('play', 'i-sm')} Start workflow</button></div>`, 'wide');
  const paint = () => {
    const plan = planSteps(b, wfId);
    const launch = plan.find(x => x.launch) || plan.filter(x => x.anchor !== 'flightEnd').slice(-1)[0];
    w.querySelector('[data-plan]').innerHTML = `<table class="tbl"><thead><tr><th>#</th><th>Step</th><th>Role</th><th>Assignee</th><th class="num">SLA</th><th>Due</th></tr></thead><tbody>
      ${plan.map((x, i) => `<tr><td class="mut">${i + 1}</td><td>${esc(x.name)}${x.launch ? ' <span class="tag">go-live</span>' : ''}</td><td class="mut">${esc(x.role)}</td><td>${x.assignee ? `${avatarHTML(x.assignee)} ${esc(personName(x.assignee))}` : '<span class="warn">no one with this role</span>'}</td>
        <td class="num">${x.days}d</td><td class="${b.goLive && x === launch && x.due > b.goLive ? 'bad' : ''}">${esc(fmtDay(x.due))}</td></tr>`).join('')}</tbody></table>
      ${b.goLive && launch && launch.due > b.goLive ? `<div class="ct-banner" style="margin-top:10px">${ico('alert')}<div><b>Go-live at risk from day one.</b> On these SLAs the campaign goes live ${esc(longDay(launch.due))}, ${workdaysBetween(b.goLive, launch.due)} working day(s) after the deadline (${esc(longDay(b.goLive))}). Shorten steps after starting, or agree a new date.</div></div>` : ''}`;
  };
  paint();
  w.querySelector('[data-wf]').onchange = e => { wfId = e.target.value; paint(); };
  // not starting yet: the people just added still hear they're on the brief
  const later = () => { w.close(); const nb = S.data.briefs[b.id] || b; pending.forEach(m => notifyAssigned(nb, m.personId, m.role, [])); if (pending.length) toast(`${plural(pending.length, 'person', 'people')} notified`); };
  $$('[data-x]', w).forEach(x => x.onclick = later); w.onDismiss = later;
  w.querySelector('[data-ok]').onclick = async () => { w.close(); await kickoffBrief(b.id, wfId, pending); };
}
function planSteps(b, wfId) {
  const wf = workflowById(wfId); let d = todayKey();
  return wf.steps.map(st => {
    let due;
    if (st.anchor === 'flightEnd' && b.flightEnd) due = addWorkdays(b.flightEnd, st.days);
    else { d = addWorkdays(d, st.days); due = d; }
    return { ...st, due, assignee: personForRole(b, st.role) };
  });
}
async function kickoffBrief(id, wfId, pending = []) {
  const b = S.data.briefs[id]; if (!b) return;
  await ensureSys();
  const now = Date.now(), plan = planSteps(b, wfId), ops = [];
  const steps = plan.map((x, i) => newTask({ projectId: SYS_ID, sectionId: null, title: x.name, due: x.due, briefId: b.id, stepKey: x.id, role: x.role, slaDays: x.days, launch: !!x.launch, anchor: x.anchor || 'prev',
    assignee: x.assignee || null, assignedAt: x.assignee ? now : null, status: 'To do', clientIds: b.clientIds || [], order: (i + 1) * 1000, createdAt: now, createdBy: me(), ...(b.demo ? { demo: true } : {}) }));
  steps.forEach(t => ops.push({ type: 'put', col: 'tasks', data: t }));
  await store.batch(ops);
  const prev = b.status;
  await setBriefStatus(b, 'In progress', { kickoffAt: now, workflowId: wfId, submittedAt: b.submittedAt || now });
  logAct('kickoff', { kind: 'brief', briefId: b.id, clientIds: b.clientIds, title: briefLabel(b), from: prev, detail: `${workflowById(wfId).name} · ${steps.length} steps` });
  steps.filter(t => t.assignee).forEach(t => logAct('step_assigned', { kind: 'step', briefId: b.id, taskId: t.id, clientIds: b.clientIds, title: t.title, to: personName(t.assignee) }));
  // one notification per person, listing their steps
  const byPerson = {}; steps.forEach(t => { if (t.assignee) (byPerson[t.assignee] = byPerson[t.assignee] || []).push(t); });
  const nb = S.data.briefs[b.id] || b, fresh = new Map(pending.map(m => [m.personId, m.role]));
  Object.entries(byPerson).forEach(([pid, list]) => (fresh.has(pid) ? notifyAssigned(nb, pid, fresh.get(pid), list) : notifySteps(nb, pid, list)));
  fresh.forEach((role, pid) => { if (!byPerson[pid]) notifyAssigned(nb, pid, role, []); });
  toast(`Workflow started - ${plural(steps.length, 'step')}${Object.keys(byPerson).length ? `, ${plural(Object.keys(byPerson).length, 'person', 'people')} notified` : ''}`);
}

/* ---------- steps: status, assignee, dates ---------- */
async function setStepStatus(t, status, opts = {}) {
  t = clone(S.data.tasks[t.id] || t);
  if (!t || (t.status || 'To do') === status) return;
  if (status === 'Blocked' && opts.reason == null) {
    const r = await promptBox({ title: 'What is it waiting on?', label: 'Reason (shown to the team and logged)', placeholder: 'e.g. Waiting for client to confirm offer T&Cs', ok: 'Mark blocked' });
    if (!r) return; opts.reason = r.value;
  }
  const now = Date.now(), b = S.data.briefs[t.briefId] || {}, from = t.status || 'To do';
  const upd = { status, updatedAt: now, updatedBy: me() };
  if (['In progress', 'In review', 'Blocked', 'Done'].includes(status) && !t.startedAt) upd.startedAt = now;
  if (status === 'Blocked') { upd.blockedAt = now; upd.blockedReason = String(opts.reason || '').slice(0, 300); }
  if (from === 'Blocked' && status !== 'Blocked') { upd.blockedMs = (t.blockedMs || 0) + (t.blockedAt ? now - t.blockedAt : 0); upd.blockedReason = ''; upd.blockedAt = null; }
  if (status === 'Done') Object.assign(upd, { done: true, doneAt: now, completedAt: now, completedBy: me() });
  if (from === 'Done' && status !== 'Done') Object.assign(upd, { done: false, doneAt: null, completedAt: null });
  await store.update('tasks', t.id, upd);
  const act = { 'In progress': from === 'Done' ? 'step_reopened' : from === 'Blocked' ? 'step_unblocked' : 'step_started', Blocked: 'step_blocked', 'In review': 'step_review', Done: 'step_done', 'To do': from === 'Done' ? 'step_reopened' : 'step_status' }[status];
  const took = status === 'Done' ? workdaysMs(stepReadyAt(t), now) : null;
  logAct(act, { kind: 'step', briefId: t.briefId, taskId: t.id, clientIds: b.clientIds || t.clientIds || [], title: t.title, from, to: status,
    detail: status === 'Blocked' ? upd.blockedReason : took != null ? `took ${fmtDur(took)} of a ${t.slaDays || 0}d SLA${t.due ? ` · due ${fmtDay(t.due)}` : ''}` : '' });
  if (!b.id) return;
  // keep the brief's status in step with its workflow
  if (status !== 'To do' && ['Submitted', 'Draft'].includes(b.status)) await setBriefStatus(b, 'In progress');
  if (status === 'Done' && t.launch && !['Live', 'Completed'].includes(b.status)) await setBriefStatus(S.data.briefs[b.id] || b, 'Live');
  if (status === 'Done') await replanAfter(S.data.tasks[t.id] || { ...t, ...upd }, b);
  if (status === 'Done') {
    if (b.ownerId && b.ownerId !== t.assignee) notify(b.ownerId, { kind: 'step', title: `Step done: ${t.title}`, body: `${briefLabel(b)} · by ${me()}`, link: `#/brief/${b.id}`, briefId: b.id, taskId: t.id });
    const next = briefSteps(b.id).find(x => x.id !== t.id && x.status !== 'Done' && (x.order || 0) > (t.order || 0));
    if (next && next.assignee) notifyNext(b, next);
  }
  if (status === 'Blocked' && b.ownerId && b.ownerId !== t.assignee) notify(b.ownerId, { kind: 'alert', title: `Blocked: ${t.title}`, body: `${briefLabel(b)} - ${upd.blockedReason}`, link: `#/brief/${b.id}`, briefId: b.id, taskId: t.id });
}
// Later steps that haven't started keep their full SLA: if this step finished after its due date,
// their due dates move out by the same amount (never earlier). The go-live risk still shows the slip.
async function replanAfter(t, b) {
  const steps = briefSteps(t.briefId), i = steps.findIndex(x => x.id === t.id); if (i < 0) return;
  let base = tsKey(t.doneAt || Date.now()) > (t.due || '') ? tsKey(t.doneAt || Date.now()) : null;
  if (!base) return;
  const ops = [];
  for (const x of steps.slice(i + 1)) {
    if (x.status === 'Done' || x.startedAt) break;
    if (x.anchor === 'flightEnd') continue;
    const due = addWorkdays(base, x.slaDays || 0);
    if (!x.due || due > x.due) ops.push({ type: 'update', col: 'tasks', id: x.id, data: { due } });
    base = due > (x.due || '') ? due : x.due;
  }
  if (!ops.length) return;
  await store.batch(ops);
  logAct('replanned', { kind: 'brief', briefId: t.briefId, clientIds: b.clientIds || [], title: briefLabel(b), detail: `${plural(ops.length, 'later step')} moved out after “${t.title}” finished ${plural(workdaysBetween(t.due, tsKey(t.doneAt || Date.now())), 'working day')} late` });
}
function stepStatusMenu(anchor, id) {
  const t = S.data.tasks[id]; if (!t) return;
  openMenu(anchor, [{ title: 'Step status' }, ...STEP_STATUS.map(s => ({ label: `${s === t.status ? '✓  ' : '     '}${s}`, icon: STEP_ICON[s], onClick: () => setStepStatus(t, s) }))]);
}
async function assignStep(t, pid) {
  if ((t.assignee || null) === (pid || null)) return;
  t = clone(t);
  const b = S.data.briefs[t.briefId] || {};
  await store.update('tasks', t.id, { assignee: pid || null, assignedAt: pid ? Date.now() : null, updatedAt: Date.now(), updatedBy: me() });
  logAct('step_assigned', { kind: 'step', briefId: t.briefId, taskId: t.id, clientIds: b.clientIds || [], title: t.title, from: t.assignee ? personName(t.assignee) : '-', to: pid ? personName(pid) : '-' });
  if (pid && b.id) notifySteps(b, pid, [{ ...t, assignee: pid }]);
}
function stepAssignMenu(anchor, id) {
  const t = S.data.tasks[id]; if (!t) return;
  const b = S.data.briefs[t.briefId] || {}, team = teamOf(b);
  const items = () => [...people().filter(p => team.includes(p.id)), ...people().filter(p => !team.includes(p.id))].map(p => ({ id: p.id, label: p.name, sub: (team.includes(p.id) ? 'On this brief · ' : '') + (p.role || ''), color: p.color }));
  openPicker(anchor, { title: 'Assign step to', items, selected: () => (t.assignee ? [t.assignee] : []), single: true, onChange: v => assignStep(t, v[0] || null) });
}
function pickDate(title, value) {
  return new Promise(res => {
    const w = openModal(`<div class="modal-head"><h2>${esc(title)}</h2></div>
      <form class="modal-body"><div class="field" style="margin:0"><input type="date" class="inp" value="${esc(value || '')}" autofocus></div><button type="submit" hidden></button></form>
      <div class="modal-foot"><button class="btn" data-clear>Clear date</button><span class="spacer"></span><button class="btn" data-x>Cancel</button><button class="btn btn-primary" data-ok>Save</button></div>`);
    const inp = w.querySelector('input'), done = v => { w.close(); res(v); };
    w.onDismiss = () => done(undefined);
    w.querySelector('[data-x]').onclick = () => done(undefined);
    w.querySelector('[data-clear]').onclick = () => done(null);
    w.querySelector('[data-ok]').onclick = () => done(inp.value || null);
    w.querySelector('form').onsubmit = e => { e.preventDefault(); done(inp.value || null); };
  });
}
async function stepDue(t) {
  const v = await pickDate('Due date', t.due || todayKey()); if (v === undefined || v === (t.due || null)) return;
  t = clone(t);
  const b = S.data.briefs[t.briefId] || {};
  await store.update('tasks', t.id, { due: v || null, updatedAt: Date.now(), updatedBy: me() });
  logAct('step_due', { kind: 'step', briefId: t.briefId, taskId: t.id, clientIds: b.clientIds || [], title: t.title, from: t.due ? fmtDay(t.due) : '-', to: v ? fmtDay(v) : '-' });
}
async function addStep(bid) {
  const b = S.data.briefs[bid]; if (!b) return;
  const r = await promptBox({ title: 'Add a step', label: 'Step name', placeholder: 'e.g. Arabic copy translation', ok: 'Add step' }); if (!r) return;
  await ensureSys();
  const list = briefSteps(bid), now = Date.now();
  const t = newTask({ projectId: SYS_ID, title: r.value, briefId: bid, status: 'To do', slaDays: 1, role: '', clientIds: b.clientIds || [], due: addWorkdays(todayKey(), 1), order: nextOrder(list), createdAt: now, createdBy: me() });
  await store.put('tasks', t);
  logAct('step_added', { kind: 'step', briefId: bid, taskId: t.id, clientIds: b.clientIds || [], title: t.title });
  if (['Submitted', 'Draft'].includes(b.status)) await setBriefStatus(b, 'In progress', { kickoffAt: b.kickoffAt || now });
}
async function toggleStep(t, btn) {
  if (btn && t.status !== 'Done') { btn.classList.add('checked'); await sleep(180); }
  return setStepStatus(t, t.status === 'Done' ? (t.startedAt ? 'In progress' : 'To do') : 'Done');
}

/* ---------- opening a brief counts as acknowledging it ---------- */
const OPENED = new Set();
function markOpened(b) {
  const me_ = myPerson(); if (!b || !me_ || OPENED.has(b.id)) return;
  const m = (b.team || []).find(x => x.personId === me_.id);
  if (!m || m.openedAt) return;
  OPENED.add(b.id);
  const now = Date.now();
  store.update('briefs', b.id, { team: (b.team || []).map(x => (x.personId === me_.id ? { ...x, openedAt: now } : x)) });
  logAct('brief_opened', { kind: 'brief', briefId: b.id, clientIds: b.clientIds, title: briefLabel(b), detail: m.addedAt ? `${fmtDur(workdaysMs(m.addedAt, now))} after being assigned` : '' });
}

/* ---------- the brief page ---------- */
function renderBrief(b) {
  setTimeout(() => markOpened(b), 400);
  const steps = briefSteps(b.id), pr = stepProgress(b.id), risk = briefRisk(b), al = alertsFor({ briefId: b.id });
  const acts = Object.values(S.data.activity).filter(a => a.briefId === b.id).sort((x, y) => y.at - x.at);
  const row = (label, v) => (v ? `<div class="kv"><span>${label}</span><b>${v}</b></div>` : '');
  const link = (label, u) => (safeUrl(u) ? `<a class="sheet-btn" data-ext href="${esc(safeUrl(u))}" target="_blank" rel="noopener noreferrer">${ico('link', 'i-sm')}${esc(label)}${ico('ext', 'i-xs')}</a>` : '');
  const section = (title, html) => (html && html.replace(/<[^>]+>/g, '').trim() ? `<div class="bp-sec"><h3>${title}</h3>${html}</div>` : '');
  const para = v => (v ? `<p class="bp-p">${esc(v)}</p>` : '');
  const allDone = steps.length && pr.n === pr.total && !['Completed', 'Cancelled'].includes(b.status);
  const cta = b.status === 'Draft' ? `<button class="btn btn-primary" data-action="br-submit" data-id="${b.id}">${ico('send', 'i-sm')} Submit brief</button>`
    : !steps.length && ['Submitted', 'In progress'].includes(b.status) ? `${!(b.team || []).length ? `<button class="btn" data-action="br-team" data-id="${b.id}">${ico('people', 'i-sm')} Assign team</button>` : ''}<button class="btn btn-primary" data-action="br-kickoff" data-id="${b.id}">${ico('play', 'i-sm')} Kick off workflow</button>`
    : allDone ? `<button class="btn btn-primary" data-action="br-complete" data-id="${b.id}">${ico('okcircle', 'i-sm')} Mark brief completed</button>` : '';
  const now = Date.now();
  const stepRows = steps.map((t, i) => {
    const took = t.status === 'Done' ? stepCycle(t, steps) : t.startedAt ? workdaysMs(t.startedAt, now) : null;
    const over = t.slaDays != null && took != null && took > Math.max(t.slaDays, 0.5) * (t.status === 'Done' ? 1 : alertCfg().stallFactor);
    const late = t.status !== 'Done' && t.due && t.due < todayKey() && stepIsReady(t, steps);
    return `<tr class="${t.status === 'Done' ? 'done' : ''} ${late ? 'late' : ''}">
      <td class="mut num">${i + 1}</td>
      <td>${stepPill(t)}</td>
      <td class="st-cell"><button class="link-btn st-name" data-action="open-task" data-id="${t.id}">${esc(t.title)}</button>${t.launch ? ' <span class="tag">go-live</span>' : ''}${t.status === 'Blocked' && t.blockedReason ? `<div class="bad sm-note">${ico('block', 'i-xs')} ${esc(t.blockedReason)}</div>` : ''}${(t.comments || []).length ? ` <span class="mut sm-note">${ico('comment', 'i-xs')}${t.comments.length}</span>` : ''}</td>
      <td><button class="who-btn" data-action="st-assign" data-id="${t.id}">${avatarHTML(t.assignee)}<span>${t.assignee ? esc(personName(t.assignee)) : '<span class="warn">Assign</span>'}</span></button>${t.role ? `<small class="mut">${esc(t.role)}</small>` : ''}</td>
      <td class="nw"><button class="link-btn ${late ? 'bad' : t.status === 'Done' ? (t.due && tsKey(t.doneAt || 0) > t.due ? 'warn' : '') : t.due ? dueInfo(t.due).cls : ''}" data-action="st-due" data-id="${t.id}" title="${t.status === 'Done' && t.due ? (tsKey(t.doneAt || 0) > t.due ? 'Finished after its due date' : 'Finished on time') : 'Change the due date'}">${t.due ? esc(fmtDay(t.due)) : 'Set date'}</button></td>
      <td class="num mut">${t.slaDays != null ? t.slaDays + 'd' : '-'}</td>
      <td class="mut nw">${t.startedAt ? esc(fmtStamp(t.startedAt)) : '-'}</td>
      <td class="mut nw">${t.doneAt ? esc(fmtStamp(t.doneAt)) : '-'}</td>
      <td class="num ${over ? 'warn' : ''}" title="${t.status === 'Done' ? 'Ready (previous step done) → done, in working days' : 'In progress so far, working days'}">${took != null ? fmtDur(took) : '-'}</td></tr>`;
  }).join('');
  return topbar(`<a data-go="#/briefs" class="crumb-link">Briefs</a> /`, `
      <button class="top-btn" data-action="br-edit" data-id="${b.id}">${ico('pencil', 'i-sm')}Edit brief</button>
      <button class="top-btn" data-action="br-team" data-id="${b.id}">${ico('people', 'i-sm')}Team</button>
      <button class="icon-btn" data-action="br-menu" data-id="${b.id}" data-align="right">${ico('dots')}</button>`) +
  `<div class="content"><div class="bp">
    ${b.archived ? `<div class="ct-banner arc-banner">${ico('archive')}<div style="flex:1"><b>This brief is archived.</b></div><button class="btn btn-primary" data-action="br-archive" data-id="${b.id}">Restore</button></div>` : ''}
    <div class="bp-head"><div class="bp-ref">${esc(briefRef(b))}${b.type ? ` · ${esc(b.type)}` : ''}${b.priority === 'High' ? ' · <span class="bad">High priority</span>' : ''}</div>
      <h1>${esc(b.title || 'Untitled brief')}</h1>
      <div class="bp-chips">${briefPill(b, true)}${clientChips(b.clientIds, 6)}</div></div>
    ${al.length ? `<div class="bp-alerts">${al.map(a => `<div class="al-row sev-${a.sev}">${ico(a.sev === 'crit' ? 'alert' : 'clock', 'i-sm')}<b>${esc(ALERT_LABEL[a.kind] || a.kind)}</b><span>${esc(a.title && a.kind !== 'golive_risk' && a.kind !== 'golive_missed' && a.kind !== 'kickoff' ? a.title + ' - ' : '')}${esc(a.detail)}</span></div>`).join('')}</div>` : ''}
    ${cta ? `<div class="bp-cta">${cta}</div>` : ''}
    <div class="bp-grid"><div class="bp-main">
      <div class="bp-sec"><div class="bp-sec-h"><h3>${ico('flow', 'i-sm')} Workflow</h3>${steps.length ? `<span class="mut">${pr.n} of ${pr.total} done</span><div class="sp ${pr.n === pr.total ? 'full' : ''}" style="flex:1;max-width:220px"><div class="sp-track"><i style="width:${pr.pct}%"></i></div></div>` : ''}<span style="flex:1"></span>${steps.length ? `<button class="btn sm" data-action="st-add" data-id="${b.id}">${ico('plus', 'i-sm')} Step</button>` : ''}</div>
        ${steps.length ? `<div class="tbl-wrap"><table class="tbl steps"><thead><tr><th>#</th><th>Status</th><th>Step</th><th>Assignee</th><th>Due</th><th class="num">SLA</th><th>Started</th><th>Finished</th><th class="num">Took</th></tr></thead><tbody>${stepRows}</tbody></table></div>
          ${ganttHTML(b, steps)}`
        : `<div class="db-empty">Not started yet. ${b.status === 'Draft' ? 'Submit the brief, then' : ''} assign the team and kick off the workflow - each step gets an owner and a due date from its SLA.</div>`}</div>
      ${section('Objective &amp; KPIs', `${b.objective ? `<p class="bp-p"><b>${esc(b.objective)}</b></p>` : ''}${para(b.kpis)}`)}
      ${section('Audience', para(b.audience))}
      ${section('Offer &amp; messaging', `${para(b.offer)}${b.promo ? `<p class="bp-p mut">Promo code: <b>${esc(b.promo)}</b></p>` : ''}${b.message ? `<p class="bp-p"><i>“${esc(b.message)}”</i></p>` : ''}${b.cta ? `<p class="bp-p mut">CTA: <b>${esc(b.cta)}</b></p>` : ''}`)}
      ${section('Creative requirements', para(b.creative))}
      ${section('Notes', para(b.notes))}
      <div class="bp-sec"><h3>${ico('history', 'i-sm')} Activity</h3>${acts.length ? activityList(acts.slice(0, 120), { compact: true }) : '<div class="db-empty">Nothing logged yet.</div>'}</div>
    </div>
    <aside class="bp-side">
      <div class="bp-card"><h4>Key dates</h4>
        ${row('Go-live deadline', b.goLive ? `<span class="${risk.level === 'late' ? 'bad' : risk.level === 'risk' ? 'warn' : ''}">${esc(longDay(b.goLive))}</span>${risk.level === 'ok' && risk.projected ? `<small>on track - projected ${esc(fmtDay(risk.projected))}</small>` : risk.level === 'risk' ? `<small class="warn">projected ${esc(fmtDay(risk.projected))} (+${risk.slip}d)</small>` : risk.level === 'late' ? '<small class="bad">passed - not live</small>' : ''}` : '<span class="mut">not set</span>')}
        ${row('Flight', b.flightStart || b.flightEnd ? `${b.flightStart ? esc(fmtDay(b.flightStart)) : '-'} → ${b.flightEnd ? esc(fmtDay(b.flightEnd)) : '-'}` : '')}
        ${row('Requested', b.requestDate ? esc(fmtDay(b.requestDate)) + (b.requestedBy ? `<small>by ${esc(b.requestedBy)}</small>` : '') : '')}
        ${row('Submitted', b.submittedAt ? esc(fmtDateTime(b.submittedAt)) : '')}
        ${row('Kicked off', b.kickoffAt ? esc(fmtDateTime(b.kickoffAt)) + (b.submittedAt ? `<small>${fmtDur(workdaysMs(b.submittedAt, b.kickoffAt))} after submission</small>` : '') : '')}
        ${row('Live since', b.liveAt ? esc(fmtDateTime(b.liveAt)) : '')}
        ${row('Completed', b.closedAt ? esc(fmtDateTime(b.closedAt)) : '')}</div>
      <div class="bp-card"><div class="bp-card-h"><h4>Team</h4><button class="link" data-action="br-team" data-id="${b.id}">Edit</button></div>
        ${b.ownerId ? `<div class="tm-row">${avatarHTML(b.ownerId)}<span><b>${esc(personName(b.ownerId))}</b><small>Owner</small></span></div>` : ''}
        ${(b.team || []).filter(m => m.personId !== b.ownerId).map(m => `<div class="tm-row">${avatarHTML(m.personId)}<span><b>${esc(personName(m.personId))}</b><small>${esc(m.role || '')}</small></span><span class="tm-open ${m.openedAt ? 'ok' : hoursSince(m.addedAt) > alertCfg().unopenedHours ? 'bad' : 'warn'}" title="${m.openedAt ? 'Opened ' + esc(fmtDateTime(m.openedAt)) : 'Assigned ' + esc(fmtDateTime(m.addedAt))}">${m.openedAt ? `${ico('eye', 'i-xs')}opened` : 'not opened'}</span></div>`).join('') || '<div class="mut" style="font-size:12px">No one assigned yet.</div>'}</div>
      <div class="bp-card"><h4>Budget &amp; channels</h4>
        ${row('Budget', b.budget != null ? `${esc(b.currency || CFG.currency || '')} ${Number(b.budget).toLocaleString()}` : '<span class="mut">-</span>')}
        ${(b.markets || []).length ? `<div class="kv-tags"><span>Markets</span><div>${tagList(b.markets, 'mkt', 12)}</div></div>` : ''}
        ${(b.platforms || []).length ? `<div class="kv-tags"><span>Platforms</span><div>${tagList(b.platforms, 'plat', 12)}</div></div>` : ''}
        ${(b.languages || []).length ? `<div class="kv-tags"><span>Languages</span><div>${tagList(b.languages, '', 12)}</div></div>` : ''}</div>
      ${b.landingUrl || b.assetsUrl ? `<div class="bp-card"><h4>Links</h4><div style="display:flex;flex-direction:column;gap:6px;align-items:flex-start">${link('Landing page', b.landingUrl)}${link('Assets folder', b.assetsUrl)}</div></div>` : ''}
      ${linkedCampaigns(b)}
    </aside></div>
  </div></div>`;
}
function linkedCampaigns(b) {
  const cs = Object.values(S.data.campaigns).filter(c => c.briefId === b.id && !c.archived);
  return `<div class="bp-card"><div class="bp-card-h"><h4>Campaigns</h4><button class="link" data-action="br-add-camp" data-id="${b.id}">+ Add</button></div>
    ${cs.map(c => `<button class="tm-row as-btn" data-action="ct-open" data-id="${c.id}">${statusPill(c, false)}<span><b>${esc(c.name)}</b><small>${esc(accName(c.accountId))}</small></span></button>`).join('') || '<div class="mut" style="font-size:12px">Track the live campaigns from this brief in the Campaign Tracker.</div>'}</div>`;
}
// A simple timeline: planned (due) vs actual for each step, with today and the go-live deadline marked.
function ganttHTML(b, steps) {
  const now = Date.now(), dayMs = 864e5;
  const start = Math.min(b.kickoffAt || now, ...steps.map(t => t.assignedAt || t.createdAt || now));
  const endKey = [b.goLive, todayKey(), ...steps.map(t => t.due).filter(Boolean)].filter(Boolean).sort().slice(-1)[0];
  const end = Math.max(parseKey(endKey).getTime() + dayMs / 2, ...steps.map(t => t.doneAt || 0), now) + dayMs / 2;
  const span = Math.max(dayMs, end - start), x = ts => Math.max(0, Math.min(100, ((ts - start) / span) * 100));
  const dueTs = k => parseKey(k).getTime() + dayMs / 2;
  const ticks = []; for (let t = new Date(start).setHours(12, 0, 0, 0); t <= end; t += dayMs * Math.max(1, Math.ceil(span / dayMs / 10))) ticks.push(t);
  return `<div class="gantt"><div class="g-axis">${ticks.map(t => `<span style="left:${x(t)}%">${esc(fmtDay(keyOf(new Date(t))))}</span>`).join('')}</div>
    ${steps.map(t => { const s0 = t.startedAt || t.assignedAt || t.createdAt || start, s1 = t.doneAt || (t.startedAt ? now : null);
      const planEnd = t.due ? dueTs(t.due) : null, planStart = t.due ? Math.max(start, parseKey(subWorkdays(t.due, t.slaDays || 0)).getTime() - (t.slaDays ? 0 : dayMs / 2)) : null;
      return `<div class="g-row"><div class="g-lbl" title="${esc(t.title)}">${esc(t.title)}</div><div class="g-track">
        ${planEnd ? `<i class="g-plan" style="left:${x(planStart)}%;width:${Math.max(0.6, x(planEnd) - x(planStart))}%" title="Planned: ${t.slaDays || 0} working day(s), due ${esc(fmtDay(t.due))}"></i>` : ''}
        ${s1 ? `<i class="g-act tone-${STEP_TONE[t.status]}" style="left:${x(s0)}%;width:${Math.max(0.6, x(s1) - x(s0))}%" title="${esc(t.status)}: ${esc(fmtDateTime(s0))} → ${t.doneAt ? esc(fmtDateTime(t.doneAt)) : 'now'}"></i>` : ''}
      </div></div>`; }).join('')}
    <i class="g-today" style="left:calc(12px + var(--gl) + (100% - 24px - var(--gl)) * ${(x(now) / 100).toFixed(4)})" title="Today"></i>
    ${b.goLive ? `<i class="g-golive" style="left:calc(12px + var(--gl) + (100% - 24px - var(--gl)) * ${(x(dueTs(b.goLive)) / 100).toFixed(4)})" title="Go-live deadline ${esc(fmtDay(b.goLive))}"></i>` : ''}
    <div class="g-legend"><span><i class="g-plan"></i>Planned (SLA window)</span><span><i class="g-act tone-good"></i>Actual</span><span><i class="g-today"></i>Today</span>${b.goLive ? '<span><i class="g-golive"></i>Go-live deadline</span>' : ''}</div></div>`;
}
function briefMenu(anchor, id) {
  const b = S.data.briefs[id]; if (!b) return;
  openMenu(anchor, [
    { label: 'Edit brief', icon: 'pencil', onClick: () => openBriefForm(id) },
    { label: 'Team & roles', icon: 'people', onClick: () => openTeamModal(id) },
    ...(!briefSteps(id).length ? [{ label: 'Kick off workflow', icon: 'play', onClick: () => openKickoff(id) }] : [{ label: 'Add a step', icon: 'plus', onClick: () => addStep(id) }]),
    { label: 'Duplicate as new draft', icon: 'copy', onClick: () => duplicateBrief(id) },
    { label: 'Copy brief as text', icon: 'copy', onClick: () => navigator.clipboard.writeText(briefText(b)).then(() => toast('Copied'), () => toast('Couldn’t copy')) },
    '-',
    { label: b.archived ? 'Restore from archive' : 'Archive brief', icon: 'archive', onClick: () => archiveBrief(id, !b.archived) },
    { label: 'Delete brief', icon: 'trash', danger: true, onClick: () => deleteBrief(id) },
  ], 'right');
}
function briefText(b) {
  const L = (k, v) => (v ? `${k}: ${v}\n` : '');
  return `${briefRef(b)} - ${b.title}\n${L('Brands', (b.clientIds || []).map(clientName).join(', '))}${L('Type', b.type)}${L('Objective', b.objective)}${L('KPIs', b.kpis)}${L('Budget', b.budget != null ? `${b.currency || ''} ${b.budget}` : '')}${L('Go-live', b.goLive)}${L('Flight', b.flightStart || b.flightEnd ? `${b.flightStart || ''} → ${b.flightEnd || ''}` : '')}${L('Markets', (b.markets || []).join(', '))}${L('Platforms', (b.platforms || []).join(', '))}${L('Languages', (b.languages || []).join(', '))}${L('Audience', b.audience)}${L('Offer', b.offer)}${L('Promo code', b.promo)}${L('Key message', b.message)}${L('CTA', b.cta)}${L('Landing page', b.landingUrl)}${L('Creative', b.creative)}${L('Assets', b.assetsUrl)}${L('Notes', b.notes)}`;
}
async function duplicateBrief(id) {
  const b = S.data.briefs[id]; if (!b) return;
  const seq = nextBriefSeq(), now = Date.now();
  const copy = { ...clone(pick(b, BRIEF_FIELDS)), id: uid(), seq, ref: 'RB-' + String(seq).padStart(4, '0'), title: `${b.title} (copy)`, status: 'Draft', team: [], statusLog: [{ status: 'Draft', at: now, by: me() }], archived: false, createdAt: now, createdBy: me(), updatedAt: now };
  await store.put('briefs', copy);
  logAct('brief_created', { kind: 'brief', briefId: copy.id, clientIds: copy.clientIds, title: briefLabel(copy), detail: `copied from ${briefRef(b)}` });
  go('#/brief/' + copy.id);
}
async function archiveBrief(id, on) {
  const b = S.data.briefs[id]; if (!b) return;
  await store.update('briefs', id, { archived: on, archivedAt: on ? Date.now() : null });
  logAct(on ? 'brief_archived' : 'brief_restored', { kind: 'brief', briefId: id, clientIds: b.clientIds, title: briefLabel(b) });
  toast(on ? 'Brief archived' : 'Brief restored');
}
async function deleteBrief(id) {
  const b = S.data.briefs[id]; if (!b) return;
  const steps = Object.values(S.data.tasks).filter(t => t.briefId === id);
  if (!await confirmBox(`Delete <b>${esc(briefLabel(b))}</b> and its ${plural(steps.length, 'step')}?<br><span class="muted-note">Its activity log is kept. It stays in Recently deleted for ${TRASH_DAYS} days.</span>`)) return;
  logAct('brief_deleted', { kind: 'brief', briefId: id, clientIds: b.clientIds, title: briefLabel(b) });
  await trashItems('brief', briefLabel(b), [{ col: 'briefs', data: b }, ...steps.map(t => ({ col: 'tasks', data: t }))], plural(steps.length, 'step'));
  go('#/briefs');
}

/* =====================================================================
   ACTIVITY LOG - one write-once entry per thing that happens.
   The security rules stamp each entry with the server's clock and refuse
   edits and deletes, so the log can be trusted for SLA and bottleneck work.
   ===================================================================== */
const ACT_LABEL = {
  brief_created: 'created the brief', brief_submitted: 'submitted the brief', brief_status: 'changed brief status', brief_edited: 'edited the brief', golive_changed: 'moved the go-live date',
  brief_opened: 'opened the brief', brief_archived: 'archived the brief', brief_restored: 'restored the brief', brief_deleted: 'deleted the brief',
  team_added: 'added to the team', team_removed: 'removed from the team', owner_changed: 'changed the owner', kickoff: 'kicked off the workflow',
  step_added: 'added a step', step_assigned: 'assigned a step', step_started: 'started a step', step_blocked: 'flagged a step as blocked', step_unblocked: 'unblocked a step',
  step_review: 'sent a step for review', step_done: 'completed a step', step_reopened: 'reopened a step', step_status: 'changed step status', step_due: 'changed a due date',
  task_created: 'created a task', task_done: 'completed a task', task_reopened: 'reopened a task', task_assigned: 'assigned a task', task_due: 'changed a due date', task_deleted: 'deleted a task',
  replanned: 'rescheduled the remaining steps', comment: 'commented', client_added: 'added a client', client_edited: 'edited a client', clients_imported: 'imported clients',
};
const ACT_GROUPS = { Briefs: a => a.kind === 'brief', 'Workflow steps': a => a.kind === 'step', Tasks: a => a.kind === 'task', Brands: a => a.kind === 'client', Comments: a => a.action === 'comment' };
const ACT_ICON = { brief: 'brief', step: 'flow', task: 'check', client: 'client' };
function logAct(action, o = {}) {
  if (!store || !store.log) return null;
  const e = { id: uid(), at: o.at || Date.now(), action, kind: o.kind || '', by: o.by || me(), byEmail: (S.user && S.user.email) || '',
    briefId: o.briefId || null, taskId: o.taskId || null, clientIds: (o.clientIds || []).slice(0, 50),
    title: String(o.title || '').slice(0, 300), from: o.from == null ? '' : String(o.from).slice(0, 200), to: o.to == null ? '' : String(o.to).slice(0, 200), detail: String(o.detail || '').slice(0, 500) };
  if (o.demo) e.demo = true;
  S.data.activity[e.id] = e;      // shows straight away; the server copy replaces it
  store.log(e);
  return e;
}
function actSentence(a) {
  const what = ACT_LABEL[a.action] || a.action.replace(/_/g, ' ');
  if (a.action === 'team_added') return `<b>${esc(a.by)}</b> added <b>${esc(a.to)}</b> to the team${a.detail ? ` as ${esc(a.detail)}` : ''}`;
  if (a.action === 'team_removed') return `<b>${esc(a.by)}</b> removed <b>${esc(a.to)}</b> from the team`;
  const tail = a.action === 'team_added' || a.action === 'team_removed' ? ''
    : a.action === 'step_assigned' || a.action === 'task_assigned' ? ` <b>${esc(a.title)}</b> to <b>${esc(a.to)}</b>`
    : ['brief_status', 'step_status'].includes(a.action) || (a.from && a.to && a.from !== a.to && !['step_done', 'step_started'].includes(a.action)) ? `${a.kind === 'step' || a.kind === 'task' ? ` <b>${esc(a.title)}</b>` : ''} <span class="mut">${esc(a.from)} → ${esc(a.to)}</span>`
    : ['brief_created', 'brief_submitted', 'brief_opened', 'brief_edited', 'kickoff', 'brief_archived', 'brief_restored', 'brief_deleted'].includes(a.action) ? ''
    : a.title ? ` <b>${esc(a.title)}</b>` : '';
  return `<b>${esc(a.by)}</b> ${esc(what)}${tail}`;
}
function activityList(list, { compact = false } = {}) {
  let day = '';
  return `<div class="act-list ${compact ? 'compact' : ''}">${list.map(a => {
    const k = tsKey(a.at); const head = k !== day ? `<div class="act-day">${esc(k === todayKey() ? 'Today' : k === addDays(todayKey(), -1) ? 'Yesterday' : longDay(k))}</div>` : ''; day = k;
    const b = a.briefId && S.data.briefs[a.briefId];
    const ctx = [!compact && b ? `<a data-go="#/brief/${b.id}">${esc(briefRef(b))}</a>` : '', !compact && (a.clientIds || []).length ? clientChips(a.clientIds, 1) : ''].filter(Boolean).join(' ');
    const t = new Date(a.at), hh = `${pad(t.getHours())}:${pad(t.getMinutes())}`;
    return `${head}<div class="act-row"><span class="act-ico k-${esc(a.kind || 'x')}">${ico(ACT_ICON[a.kind] || 'history', 'i-sm')}</span>
      <div class="act-body"><div>${actSentence(a)}</div>${a.detail && !['team_added'].includes(a.action) ? `<div class="act-detail">${esc(a.detail)}</div>` : ''}${ctx ? `<div class="act-ctx">${ctx}</div>` : ''}</div>
      <span class="act-time" title="${esc(fmtDateTime(a.at))}">${hh}</span></div>`;
  }).join('')}</div>`;
}
function activityFiltered() {
  const f = S.av, r = dbRange(f.period), q = f.q.trim().toLowerCase();
  return Object.values(S.data.activity).filter(a => inRange(tsKey(a.at), r)
    && (f.who === 'All' || a.byEmail === f.who || a.by === f.who)
    && (f.action === 'All' || (ACT_GROUPS[f.action] && ACT_GROUPS[f.action](a)))
    && (f.client === 'All' || (a.clientIds || []).includes(f.client))
    && (!q || `${a.by} ${a.title} ${a.detail} ${a.from} ${a.to} ${ACT_LABEL[a.action] || ''}`.toLowerCase().includes(q)))
    .sort((a, b) => b.at - a.at);
}
function renderActivity() {
  const f = S.av, list = activityFiltered();
  const whos = [...new Map(Object.values(S.data.activity).map(a => [a.byEmail || a.by, a.by])).entries()].sort((a, b) => String(a[1]).localeCompare(String(b[1])));
  const sel = (key, opts, label) => `<label class="filt ${f[key] !== 'All' && key !== 'period' ? 'on' : key === 'period' ? 'on' : ''}">${label}<select data-avf="${key}">${opts.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${f[key] === v ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select></label>`;
  const by = {}; list.forEach(a => by[a.by] = (by[a.by] || 0) + 1);
  return topbar('Client work /', `<button class="top-btn" data-action="av-export">${ico('download', 'i-sm')}Export CSV</button>`) + `<div class="content"><div class="list" style="max-width:900px">
    <div class="page-head"><h1>Activity log</h1><div class="page-desc empty" style="cursor:default">Every brief, step, task and brand change - who did it and when. Entries can't be edited or deleted. ${plural(list.length, 'entry', 'entries')} shown.</div></div>
    <div class="ct-toolbar">
      <div class="ct-search">${ico('search', 'i-sm')}<input id="av-q" data-keep value="${esc(f.q)}" placeholder="Search the log" autocomplete="off"></div>
      ${sel('period', DB_PERIODS, ico('cal', 'i-sm'))}${sel('action', ['All', ...Object.keys(ACT_GROUPS)], 'Type')}
      ${sel('who', [['All', 'All'], ...whos], 'Person')}${sel('client', [['All', 'All'], ...clients().map(h => [h.id, h.name])], 'Brand')}
    </div>
    ${list.length ? activityList(list.slice(0, 600)) + (list.length > 600 ? `<div class="mut" style="padding:12px 0">Showing the latest 600 - narrow the filters or export to see everything.</div>` : '') : '<div class="ct-empty">Nothing logged for these filters.</div>'}
  </div></div>`;
}
function exportActivity() {
  downloadCSV(`activity-${todayKey()}.csv`, [['When', 'Who', 'Email', 'Action', 'Item', 'From', 'To', 'Details', 'Brief', 'Brands'],
    ...activityFiltered().map(a => [fmtDateTime(a.at), a.by, a.byEmail, ACT_LABEL[a.action] || a.action, a.title, a.from, a.to, a.detail,
      a.briefId && S.data.briefs[a.briefId] ? briefRef(S.data.briefs[a.briefId]) : '', (a.clientIds || []).map(clientName).join('; ')])]);
}

/* =====================================================================
   NOTIFICATIONS - in-app (bell) for everyone, email via the mail collection.
   ===================================================================== */
const myNotifs = () => Object.values(S.data.notifs).filter(n => n.to && n.to === myEmail()).sort((a, b) => b.at - a.at);
const unreadNotifs = () => myNotifs().filter(n => !n.read);
// links in emails open the right account: ?a=<account id>#/brief/…
const appLink = hash => (((CFG.email && CFG.email.appUrl) || (location.origin + location.pathname)).replace(/[?#].*$/, '')) + (S.acc ? '?a=' + encodeURIComponent(S.acc.id) : '') + hash;
async function notify(pid, { title, body = '', link = '#/', briefId = null, taskId = null, kind = 'info', email = null }) {
  const p = personById(pid); if (!p || !p.email) return;
  if (S.mode === 'cloud' && p.email === myEmail()) return;        // no notifications about your own actions
  const n = { id: uid(), to: p.email, at: Date.now(), title: String(title).slice(0, 200), body: String(body).slice(0, 500), link, briefId, taskId, kind, read: false, from: me(), fromEmail: (S.user && S.user.email) || '' };
  await store.put('notifs', n);
  // sample people (@example.com) never get real emails
  if (email && CFG.email && CFG.email.enabled !== false && store.mail && !/@example\.(com|org|net)$/.test(p.email)) await store.mail({ to: [p.email], message: { subject: `${S.acc ? S.acc.name + ' · ' : ''}${email.subject}`, html: email.html, text: email.text } });
}
function emailHTML({ heading, intro, rows = [], items = [], cta, link }) {
  const e = s => esc(s == null ? '' : s);
  return `<div style="font-family:Halcom,'Work Sans',-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#323232;max-width:560px;margin:0 auto;padding:24px">
  <div style="font-size:12px;color:#6b7080;margin-bottom:6px;letter-spacing:.06em;text-transform:uppercase"><b style="color:#323232">dentsu</b> ${e(CFG.appName || 'Ads Workspace')}${S.acc ? ' · ' + e(S.acc.name) : ''}</div>
  <h2 style="font-size:18px;margin:0 0 10px">${e(heading)}</h2>${intro ? `<p style="font-size:14px;line-height:1.5;margin:0 0 14px">${e(intro)}</p>` : ''}
  ${rows.length ? `<table style="border-collapse:collapse;font-size:13px;margin:0 0 14px">${rows.filter(r => r[1]).map(([k, v]) => `<tr><td style="color:#787774;padding:3px 14px 3px 0;vertical-align:top">${e(k)}</td><td style="padding:3px 0"><b>${e(v)}</b></td></tr>`).join('')}</table>` : ''}
  ${items.length ? `<table style="border-collapse:collapse;font-size:13px;width:100%;margin:0 0 16px"><tr><th align="left" style="border-bottom:1px solid #e1e0dd;padding:6px 4px;color:#787774;font-weight:600">Step</th><th align="left" style="border-bottom:1px solid #e1e0dd;padding:6px 4px;color:#787774;font-weight:600">Due</th><th align="left" style="border-bottom:1px solid #e1e0dd;padding:6px 4px;color:#787774;font-weight:600">SLA</th></tr>
    ${items.map(t => `<tr><td style="border-bottom:1px solid #f1f1ef;padding:6px 4px">${e(t.title)}</td><td style="border-bottom:1px solid #f1f1ef;padding:6px 4px">${e(t.due ? longDay(t.due) : '-')}</td><td style="border-bottom:1px solid #f1f1ef;padding:6px 4px">${e(t.slaDays != null ? t.slaDays + ' working day(s)' : '')}</td></tr>`).join('')}</table>` : ''}
  ${link ? `<a href="${e(appLink(link))}" style="display:inline-block;background:#323232;color:#fff;text-decoration:none;padding:10px 18px;border-radius:2px;font-weight:600;font-size:14px">${e(cta || 'Open')}</a>` : ''}
  <p style="font-size:11.5px;color:#a3a19c;margin-top:22px">Opening the brief marks it as seen, so the team knows it reached you.</p></div>`;
}
const briefRows = b => [['Brief', briefLabel(b)], ['Brands', (b.clientIds || []).map(clientName).join(', ')], ['Go-live', b.goLive ? longDay(b.goLive) : ''], ['Type', b.type], ['Owner', b.ownerId ? personName(b.ownerId) : '']];
const textOf = (heading, b, items = []) => `${heading}\n\n${briefRows(b).filter(r => r[1]).map(r => `${r[0]}: ${r[1]}`).join('\n')}\n${items.map(t => `- ${t.title}${t.due ? ` (due ${t.due})` : ''}`).join('\n')}\n\n${appLink('#/brief/' + b.id)}`;
function notifyAssigned(b, pid, role, steps = []) {
  const heading = `You're on ${briefRef(b)}${role ? ` as ${role}` : ''}`;
  return notify(pid, { kind: 'brief', title: heading, body: `${b.title} · ${steps.length ? plural(steps.length, 'step') + ' for you · ' : ''}${(b.clientIds || []).map(clientName).slice(0, 3).join(', ')}`, link: `#/brief/${b.id}`, briefId: b.id,
    email: { subject: `[${briefRef(b)}] You've been assigned: ${b.title}`, html: emailHTML({ heading, intro: `${me()} added you to this brief.${steps.length ? ' Your steps and their due dates are below.' : ' Open it to see the details.'}`, rows: briefRows(b), items: steps, cta: 'Open the brief', link: `#/brief/${b.id}` }), text: textOf(heading, b, steps) } });
}
function notifySteps(b, pid, steps) {
  const heading = steps.length === 1 ? `New step for you: ${steps[0].title}` : `${steps.length} steps assigned to you on ${briefRef(b)}`;
  return notify(pid, { kind: 'step', title: heading, body: briefLabel(b), link: `#/brief/${b.id}`, briefId: b.id, taskId: steps.length === 1 ? steps[0].id : null,
    email: { subject: `[${briefRef(b)}] ${heading}`, html: emailHTML({ heading, intro: `The workflow for this brief has your name on ${steps.length === 1 ? 'a step' : 'these steps'}. Dates come from each step's SLA.`, rows: briefRows(b), items: steps, cta: 'Open the brief', link: `#/brief/${b.id}` }), text: textOf(heading, b, steps) } });
}
function notifyNext(b, t) {
  const heading = `You're up: ${t.title}`;
  return notify(t.assignee, { kind: 'step', title: heading, body: `${briefLabel(b)} - the previous step is done`, link: `#/brief/${b.id}`, briefId: b.id, taskId: t.id,
    email: { subject: `[${briefRef(b)}] ${heading}`, html: emailHTML({ heading, intro: 'The step before yours has just been completed.', rows: briefRows(b), items: [t], cta: 'Open the brief', link: `#/brief/${b.id}` }), text: textOf(heading, b, [t]) } });
}
function notifyBriefSubmitted(b) {
  const to = b.ownerId ? [b.ownerId] : people().filter(p => p.role === 'Account Lead').map(p => p.id);
  const heading = `New brief: ${b.title}`;
  to.forEach(pid => notify(pid, { kind: 'brief', title: heading, body: `${briefRef(b)} · ${(b.clientIds || []).map(clientName).slice(0, 3).join(', ')}`, link: `#/brief/${b.id}`, briefId: b.id,
    email: { subject: `[${briefRef(b)}] New brief submitted: ${b.title}`, html: emailHTML({ heading, intro: `${me()} submitted a brief. Assign the team and kick off the workflow.`, rows: briefRows(b), cta: 'Review the brief', link: `#/brief/${b.id}` }), text: textOf(heading, b) } }));
}
function openNotifPanel(anchor) {
  closeMenu();
  const m = document.createElement('div'); m.className = 'menu notif-menu';
  const paint = () => {
    const list = myNotifs().slice(0, 40);
    m.innerHTML = `<div class="nt-head"><b>Notifications</b>${unreadNotifs().length ? '<button data-all>Mark all as read</button>' : ''}</div>
      ${!myEmail() ? `<div class="nt-empty">${S.mode === 'local' ? 'Pick who you are in Settings → Team to see notifications here.' : 'Add your email to the team list (Settings → Team) to get notifications.'}</div>`
        : list.map(n => `<button class="nt-row ${n.read ? '' : 'unread'}" data-n="${n.id}"><span class="nt-dot"></span><span class="nt-txt"><b>${esc(n.title)}</b>${n.body ? `<small>${esc(n.body)}</small>` : ''}<em>${esc(n.from ? n.from + ' · ' : '')}${timeAgo(n.at)}</em></span></button>`).join('') || '<div class="nt-empty">You’re all caught up.</div>'}`;
  };
  m.addEventListener('mousedown', e => e.stopPropagation());
  m.addEventListener('click', async e => {
    e.stopPropagation();
    if (e.target.closest('[data-all]')) { await store.batch(unreadNotifs().map(n => ({ type: 'update', col: 'notifs', id: n.id, data: { read: true, readAt: Date.now() } }))); paint(); return; }
    const r = e.target.closest('[data-n]'); if (!r) return;
    const n = S.data.notifs[r.dataset.n]; closeMenu();
    if (n && !n.read) store.update('notifs', n.id, { read: true, readAt: Date.now() });
    if (n && n.link) go(n.link);
  });
  paint(); document.body.appendChild(m); menuEl = m; placeMenu(m, anchor);
}

/* =====================================================================
   ALERTS - overdue, due soon and not started, stalled, blocked, unassigned,
   unopened briefs, briefs waiting for kick-off and go-live at risk.
   ===================================================================== */
const ALERT_LABEL = { overdue: 'Overdue', due_soon: 'Due soon, not started', stalled: 'Taking too long', blocked: 'Blocked', unassigned: 'No assignee', golive_missed: 'Go-live missed',
  golive_risk: 'Go-live at risk', kickoff: 'Waiting for kick-off', unopened: 'Not opened', deadline: 'Deadline passed', task_overdue: 'Overdue task', review_wait: 'Waiting on review' };
let alertMemo = { key: '', list: [] };
function computeAlerts() {
  const key = `${S.dataVer || 0}|${todayKey()}|${Math.floor(Date.now() / 6e5)}`;
  if (alertMemo.key === key) return alertMemo.list;
  const today = todayKey(), cfg = alertCfg(), now = Date.now(), out = [];
  const live = id => { const b = S.data.briefs[id]; return b && !b.archived && !['Cancelled', 'On hold', 'Completed'].includes(b.status) ? b : null; };
  Object.values(S.data.tasks).forEach(t => {
    if (!t.briefId || t.archived || t.status === 'Done') return;
    const b = live(t.briefId); if (!b) return;
    const base = { taskId: t.id, briefId: b.id, personId: t.assignee || null, clientIds: b.clientIds || [], link: `#/brief/${b.id}`, title: t.title, ctx: briefRef(b) };
    const ready = stepIsReady(t);   // a step still waiting on the one before it isn't "late" on its own - the go-live risk covers it
    if (!ready) { if (!t.assignee) out.push({ ...base, sev: 'warn', kind: 'unassigned', detail: 'No one is assigned to this step' }); return; }
    if (t.due && t.due < today) out.push({ ...base, sev: 'crit', kind: 'overdue', rank: workdaysBetween(t.due, today), detail: `${plural(Math.max(1, workdaysBetween(t.due, today)), 'working day')} late - was due ${fmtDay(t.due)}` });
    else if (t.due && (t.status || 'To do') === 'To do' && workdaysBetween(today, t.due) <= cfg.dueSoonDays) out.push({ ...base, sev: 'warn', kind: 'due_soon', detail: `Due ${dueInfo(t.due).label.toLowerCase()} and not started` });
    if (t.status === 'Blocked') out.push({ ...base, sev: 'warn', kind: 'blocked', detail: `${t.blockedAt ? 'Blocked for ' + fmtDur(workdaysMs(t.blockedAt, now)) : 'Blocked'}${t.blockedReason ? ' - ' + t.blockedReason : ''}` });
    if (['In progress', 'In review'].includes(t.status) && t.startedAt && t.slaDays != null) {
      const used = workdaysMs(t.startedAt, now);
      if (used > Math.max(0.5, t.slaDays) * cfg.stallFactor) out.push({ ...base, sev: 'warn', kind: t.status === 'In review' ? 'review_wait' : 'stalled', detail: `${t.status} for ${fmtDur(used)} - SLA is ${t.slaDays}d` });
    }
    if (!t.assignee) out.push({ ...base, sev: 'warn', kind: 'unassigned', detail: 'No one is assigned to this step' });
  });
  activeBriefs().forEach(b => {
    if (['Cancelled', 'On hold'].includes(b.status)) return;
    const base = { briefId: b.id, clientIds: b.clientIds || [], link: `#/brief/${b.id}`, personId: b.ownerId || null, title: briefLabel(b), ctx: '' };
    const risk = briefRisk(b);
    if (risk.level === 'late') out.push({ ...base, sev: 'crit', kind: 'golive_missed', rank: 99, detail: `Go-live was ${fmtDay(b.goLive)} and it isn't live yet` });
    else if (risk.level === 'risk') out.push({ ...base, sev: risk.slip > 2 ? 'crit' : 'warn', kind: 'golive_risk', rank: risk.slip, detail: `Projected to go live ${fmtDay(risk.projected)}, ${plural(risk.slip, 'working day')} after the ${fmtDay(b.goLive)} deadline` });
    if (b.status === 'Submitted' && !briefSteps(b.id).length && b.submittedAt && hoursSince(b.submittedAt) > cfg.kickoffHours) out.push({ ...base, sev: 'warn', kind: 'kickoff', detail: `Submitted ${timeAgo(b.submittedAt)} - the workflow hasn't started` });
    (b.team || []).forEach(m => { if (!m.openedAt && m.addedAt && hoursSince(m.addedAt) > cfg.unopenedHours) out.push({ ...base, personId: m.personId, sev: 'warn', kind: 'unopened', detail: `${personName(m.personId)} hasn't opened it - assigned ${timeAgo(m.addedAt)}` }); });
  });
  Object.values(S.data.tasks).forEach(t => {
    if (t.briefId || t.done || inArchivedProject(t)) return;
    const hs = clientIdsOf(t); const base = { taskId: t.id, personId: t.assignee || null, clientIds: hs, title: t.title, link: null, ctx: hs.length ? clientName(hs[0]) : (S.data.projects[t.projectId] || {}).name || '' };
    if (t.deadline && t.deadline < today) out.push({ ...base, sev: 'crit', kind: 'deadline', detail: `Deadline ${fmtDay(t.deadline)} has passed` });
    else if (hs.length && t.due && t.due < today && !t.recur) out.push({ ...base, sev: 'warn', kind: 'task_overdue', detail: `Was due ${fmtDay(t.due)}` });
  });
  out.sort((a, b) => (a.sev === b.sev ? 0 : a.sev === 'crit' ? -1 : 1) || (b.rank || 0) - (a.rank || 0));
  alertMemo = { key, list: out };
  return out;
}
const alertsFor = ({ briefId, personId, clientId } = {}) => computeAlerts().filter(a => (!briefId || a.briefId === briefId) && (!personId || a.personId === personId) && (!clientId || (a.clientIds || []).includes(clientId)));
function alertCounts() { const list = S.al.scope === 'mine' && myPerson() ? alertsFor({ personId: myPerson().id }) : computeAlerts(); return { n: list.length, crit: list.filter(a => a.sev === 'crit').length }; }
function renderAlerts() {
  const f = S.al, mine = myPerson();
  let list = f.scope === 'mine' && mine ? alertsFor({ personId: mine.id }) : computeAlerts();
  const kinds = {}; list.forEach(a => kinds[a.kind] = (kinds[a.kind] || 0) + 1);
  if (f.sev !== 'All') list = list.filter(a => a.kind === f.sev);
  const crit = list.filter(a => a.sev === 'crit'), warn = list.filter(a => a.sev !== 'crit');
  const rowA = a => `<div class="al-item sev-${a.sev}" ${a.link ? `data-go="${esc(a.link)}"` : a.taskId ? `data-action="open-task" data-id="${a.taskId}"` : ''}>
      <span class="al-ico">${ico(a.sev === 'crit' ? 'alert' : a.kind === 'blocked' ? 'block' : a.kind === 'unopened' ? 'eye' : 'clock', 'i-sm')}</span>
      <div class="al-body"><div class="al-t"><span class="al-k">${esc(ALERT_LABEL[a.kind] || a.kind)}</span><b>${esc(a.title || '')}</b>${a.ctx ? `<span class="mut"> · ${esc(a.ctx)}</span>` : ''}</div><div class="al-d">${esc(a.detail)}</div></div>
      <div class="al-side">${clientChips(a.clientIds, 1)}${a.personId !== undefined ? avatarHTML(a.personId) : ''}</div></div>`;
  return topbar('') + `<div class="content"><div class="list" style="max-width:980px">
    <div class="page-head"><h1>Alerts</h1><div class="page-desc empty" style="cursor:default">Work that is late, stuck or at risk - worked out live from due dates, SLAs and the activity log. Thresholds are in Settings → Alerts &amp; SLAs.</div></div>
    <div class="ct-toolbar"><div class="seg">${[['all', 'Everyone'], ['mine', 'Assigned to me']].map(([v, l]) => `<button class="${f.scope === v ? 'on' : ''}" data-action="al-scope" data-v="${v}" ${v === 'mine' && !mine ? 'disabled title="Add your email to the team list first"' : ''}>${l}</button>`).join('')}</div>
      <label class="filt ${f.sev !== 'All' ? 'on' : ''}">Type<select data-alf="sev"><option value="All">All (${computeAlerts().length})</option>${Object.keys(ALERT_LABEL).filter(k => kinds[k]).map(k => `<option value="${k}" ${f.sev === k ? 'selected' : ''}>${esc(ALERT_LABEL[k])} (${kinds[k]})</option>`).join('')}</select></label></div>
    <div class="db-tiles c4" style="margin-bottom:14px">
      ${dbTile('Critical', String(crit.length), 'overdue, missed or slipping go-live')}
      ${dbTile('Warnings', String(warn.length), 'due soon, stalled, blocked, unopened')}
      ${dbTile('Briefs at risk', String(new Set(list.filter(a => ['golive_risk', 'golive_missed'].includes(a.kind)).map(a => a.briefId)).size), 'go-live projected late')}
      ${dbTile('Steps overdue', String(list.filter(a => a.kind === 'overdue').length), 'past their due date')}
    </div>
    ${!list.length ? `<div class="empty-state">${ico('okcircle')}<br>Nothing late or stuck. ${f.scope === 'mine' ? 'Your work is on track.' : 'Everything is on track.'}</div>` : ''}
    ${crit.length ? `<div class="group-head">Critical <span class="cnt">${crit.length}</span></div>${crit.map(rowA).join('')}` : ''}
    ${warn.length ? `<div class="group-head">Warnings <span class="cnt">${warn.length}</span></div>${warn.map(rowA).join('')}` : ''}
  </div></div>`;
}
// Once a day, each person gets one in-app notification per new alert on their own work.
async function alertSweep() {
  const mine = myPerson(); if (!mine || !mine.email || !store || (store.isFresh && !store.isFresh())) return;
  const day = todayKey(), key = `tb:sweep:${mine.id}`;
  if (lsGet(key) === day) return; lsSet(key, day);
  const have = new Set(Object.values(S.data.notifs).map(n => n.id));
  const list = alertsFor({ personId: mine.id }).filter(a => ['overdue', 'due_soon', 'golive_risk', 'golive_missed', 'unopened', 'stalled'].includes(a.kind)).slice(0, 20);
  const ops = list.map(a => ({ id: `al-${day}-${a.kind}-${a.taskId || a.briefId || ''}`.slice(0, 120), a })).filter(x => !have.has(x.id))
    .map(x => ({ type: 'put', col: 'notifs', data: { id: x.id, to: mine.email, at: Date.now(), title: `${ALERT_LABEL[x.a.kind]}: ${x.a.title}`, body: x.a.detail, link: x.a.link || '#/alerts', briefId: x.a.briefId || null, taskId: x.a.taskId || null, kind: 'alert', read: false, from: 'Alerts', fromEmail: (S.user && S.user.email) || '' } }));
  if (ops.length) await store.batch(ops);
}

/* =====================================================================
   MY WORK - everything assigned to you, and briefs you haven't opened.
   ===================================================================== */
function myWorkCount() { const p = myPerson(); if (!p) return 0; const t = todayKey(); return Object.values(S.data.tasks).filter(x => x.assignee === p.id && !x.done && !inArchivedProject(x) && x.due && x.due <= t && (!x.briefId || S.data.briefs[x.briefId])).length; }
function stepRowHTML(t) {
  const b = S.data.briefs[t.briefId];
  const desc = (t.description || '').trim();
  return `<div class="row step-row" data-action="open-task" data-id="${t.id}">${checkBtn(t)}
    <div class="card-body"><div class="card-title">${esc(t.title)}</div>${desc ? `<div class="card-desc">${esc(desc)}</div>` : ''}${taskMeta(t, { where: whereHTML(t), noStatus: true, noAssignee: !!myPerson() && t.assignee === myPerson().id })}</div>
    <div class="row-side">${stepPill(t)}${t.status === 'To do' ? `<button class="btn sm" data-action="st-start" data-id="${t.id}">${ico('play', 'i-xs')} Start</button>` : ''}</div></div>`;
}
const anyRow = t => (t.briefId ? stepRowHTML(t) : rowHTML(t));
function renderMyWork() {
  const p = myPerson(), today = todayKey();
  if (!p) return topbar('') + `<div class="content"><div class="list"><div class="page-head"><h1>My work</h1></div>
    <div class="ct-banner">${ico('user')}<div><b>You're not on ${esc(S.acc ? S.acc.name : 'this account')}'s team list.</b><br>${canEditAcc() ? 'Join it to get briefs, steps and tasks assigned to you here - they show up on this page.' : 'You have view-only access, so nothing is assigned to you in this account.'}<br><br>${canEditAcc() ? `<button class="btn btn-primary" data-action="join-team">Add me to the team` : `<button class="btn" data-go="#/dashboard">Open the dashboard`}</button></div></div></div></div>`;
  const mine = Object.values(S.data.tasks).filter(t => t.assignee === p.id && !t.done && !inArchivedProject(t) && (!t.briefId || (S.data.briefs[t.briefId] && !S.data.briefs[t.briefId].archived)));
  const unopened = Object.values(S.data.briefs).filter(b => !b.archived && BRIEF_ACTIVE.includes(b.status) && (b.team || []).some(m => m.personId === p.id && !m.openedAt));
  const lead = activeBriefs().filter(b => b.ownerId === p.id);
  const sortT = (a, b) => (a.due || '9999').localeCompare(b.due || '9999') || (a.priority || 4) - (b.priority || 4);
  const g = { overdue: [], today: [], week: [], later: [], none: [] };
  mine.forEach(t => { if (!t.due) g.none.push(t); else if (t.due < today) g.overdue.push(t); else if (t.due === today) g.today.push(t); else if (t.due <= addDays(today, 6)) g.week.push(t); else g.later.push(t); });
  Object.values(g).forEach(l => l.sort(sortT));
  const grp = (label, list, cls = '') => (list.length ? `<div class="group-head ${cls}">${label} <span class="cnt">${list.length}</span></div>${list.map(anyRow).join('')}` : '');
  const al = alertsFor({ personId: p.id });
  return topbar('') + `<div class="content"><div class="list" style="max-width:920px">
    <div class="page-head"><h1>My work</h1><div class="page-desc empty" style="cursor:default">${esc(p.name)}${p.role ? ' · ' + esc(p.role) : ''} · ${plural(mine.length, 'open item')}${al.length ? ` · <a data-go="#/alerts" class="warn">${plural(al.length, 'alert')}</a>` : ''}</div></div>
    ${unopened.length ? `<div class="group-head">New briefs for you <span class="cnt">${unopened.length}</span></div><div class="br-grid">${unopened.map(b => briefCard(b)).join('')}</div>` : ''}
    ${grp('Overdue', g.overdue, 'bad')}${grp('Today', g.today)}${grp('Next 7 days', g.week)}${grp('Later', g.later)}${grp('No date', g.none)}
    ${!mine.length && !unopened.length ? `<div class="empty-state">${ico('okcircle')}<br>Nothing assigned to you right now.</div>` : ''}
    ${lead.length ? `<div class="group-head" style="margin-top:18px">Briefs you own <span class="cnt">${lead.length}</span></div><div class="br-grid">${lead.map(b => briefCard(b)).join('')}</div>` : ''}
  </div></div>`;
}

/* =====================================================================
   ALL TASKS - one list across team lists, client lists and brief steps,
   filtered by client, label, person or date and grouped any way.
   ===================================================================== */
function txFiltered() {
  const f = S.tx, today = todayKey(), q = f.q.trim().toLowerCase();
  return Object.values(S.data.tasks).filter(t => {
    if (inArchivedProject(t)) return false;
    if (t.briefId && (!S.data.briefs[t.briefId] || S.data.briefs[t.briefId].archived)) return false;
    if (f.state === 'Open' && t.done) return false; if (f.state === 'Done' && !t.done) return false;
    const hs = clientIdsOf(t);
    if (f.client === 'Any brand' && !hs.length) return false; if (f.client === 'No brand' && hs.length) return false;
    if (!['All', 'Any brand', 'No brand'].includes(f.client) && !hs.includes(f.client)) return false;
    if (f.label === 'None' && (t.labels || []).length) return false; if (!['All', 'None'].includes(f.label) && !(t.labels || []).includes(f.label)) return false;
    if (f.who === 'Unassigned' && t.assignee) return false; if (!['All', 'Unassigned'].includes(f.who) && t.assignee !== f.who) return false;
    if (f.source === 'Brief steps' && !t.briefId) return false; if (f.source === 'Brand lists' && (S.data.projects[t.projectId] || {}).kind !== 'client') return false;
    if (f.source === 'My Projects' && !isList(S.data.projects[t.projectId])) return false;
    if (f.when === 'Overdue' && !(t.due && t.due < today)) return false; if (f.when === 'Today' && t.due !== today) return false;
    if (f.when === 'Next 7 days' && !(t.due && t.due >= today && t.due <= addDays(today, 6))) return false; if (f.when === 'No date' && t.due) return false;
    if (q && !`${t.title} ${t.description || ''} ${hs.map(clientName).join(' ')} ${(t.labels || []).map(id => (labelById(id) || {}).name).join(' ')}`.toLowerCase().includes(q)) return false;
    return true;
  }).sort((a, b) => a.done - b.done || (a.due || '9999').localeCompare(b.due || '9999') || (a.priority || 4) - (b.priority || 4));
}
function renderAllTasks() {
  const f = S.tx, list = txFiltered();
  const sel = (key, opts, label) => `<label class="filt ${f[key] !== 'All' && !(key === 'state' && f[key] === 'Open') && key !== 'group' ? 'on' : ''}">${label}<select data-txf="${key}">${opts.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${f[key] === v ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select></label>`;
  const keyOfT = t => f.group === 'client' ? (clientIdsOf(t).length ? clientIdsOf(t).map(clientName) : ['No brand'])
    : f.group === 'label' ? ((t.labels || []).map(id => (labelById(id) || {}).name).filter(Boolean).length ? (t.labels || []).map(id => (labelById(id) || {}).name).filter(Boolean) : ['No label'])
    : f.group === 'person' ? [t.assignee ? personName(t.assignee) : 'Unassigned'] : f.group === 'status' ? [t.briefId ? t.status || 'To do' : t.done ? 'Done' : 'Open task'] : ['All'];
  const groups = {}; list.forEach(t => keyOfT(t).forEach(k => (groups[k] = groups[k] || []).push(t)));
  const names = Object.keys(groups).sort((a, b) => (/^No |^Unassigned/.test(a) ? 1 : 0) - (/^No |^Unassigned/.test(b) ? 1 : 0) || a.localeCompare(b));
  const labelCounts = {}; Object.values(S.data.tasks).filter(t => !t.done && !inArchivedProject(t)).forEach(t => (t.labels || []).forEach(l => labelCounts[l] = (labelCounts[l] || 0) + 1));
  return topbar('Client work /', `<button class="top-btn" data-action="tx-export">${ico('download', 'i-sm')}Export</button>`) + `<div class="content"><div class="list" style="max-width:980px">
    <div class="page-head"><h1>All tasks &amp; labels</h1><div class="page-desc empty" style="cursor:default">Every task across project lists, brand lists and brief workflows. ${plural(list.length, 'task')} match.</div></div>
    <div class="lbl-strip">${labelsList().map(l => `<button class="tag lbl-chip lc-${esc(l.color)} ${f.label === l.id ? 'on' : ''}" data-action="tx-label" data-id="${l.id}">${esc(l.name)} <b>${labelCounts[l.id] || 0}</b></button>`).join('')}<button class="tag more" data-action="open-settings" title="Edit labels in Settings">${ico('pencil', 'i-xs')} Labels</button></div>
    <div class="ct-toolbar">
      <div class="ct-search">${ico('search', 'i-sm')}<input id="tx-q" data-keep value="${esc(f.q)}" placeholder="Search tasks" autocomplete="off"></div>
      ${sel('client', [['All', 'All'], ['Any brand', 'Any brand'], ['No brand', 'No brand'], ...clients().map(h => [h.id, h.name])], 'Brand')}
      ${sel('label', [['All', 'All'], ['None', 'No label'], ...labelsList().map(l => [l.id, l.name])], 'Label')}
      ${sel('who', [['All', 'All'], ['Unassigned', 'Unassigned'], ...people().map(p => [p.id, p.name])], 'Person')}
      ${sel('when', ['All', 'Overdue', 'Today', 'Next 7 days', 'No date'], 'Due')}
      ${sel('source', ['All', 'Brand lists', 'Brief steps', 'My Projects'], 'From')}
      ${sel('state', ['Open', 'Done', 'All'], 'Show')}
      ${sel('group', [['client', 'Brand'], ['label', 'Label'], ['person', 'Person'], ['status', 'Status'], ['none', 'Nothing']], 'Group by')}
    </div>
    ${!list.length ? '<div class="ct-empty">No tasks match.</div>' : names.map(n => `<div class="group-head">${esc(n)} <span class="cnt">${groups[n].length}</span></div>${groups[n].slice(0, 200).map(anyRow).join('')}`).join('')}
  </div></div>`;
}
function exportTasks() {
  downloadCSV(`tasks-${todayKey()}.csv`, [['Task', 'Status', 'Done', 'Assignee', 'Due', 'Deadline', 'Brands', 'Labels', 'List / brief', 'Created', 'Completed'],
    ...txFiltered().map(t => [t.title, t.briefId ? t.status : t.done ? 'Done' : 'Open', t.done ? 'yes' : '', t.assignee ? personName(t.assignee) : '', t.due || '', t.deadline || '', clientIdsOf(t).map(clientName).join('; '),
      (t.labels || []).map(id => (labelById(id) || {}).name).filter(Boolean).join('; '), t.briefId && S.data.briefs[t.briefId] ? briefLabel(S.data.briefs[t.briefId]) : (S.data.projects[t.projectId] || {}).name || '',
      t.createdAt ? fmtDateTime(t.createdAt) : '', t.completedAt ? fmtDateTime(t.completedAt) : ''])]);
}

/* =====================================================================
   PROCESS DASHBOARD - throughput, on-time delivery and where the time goes.
   Step times are measured in working days: assigned → started is waiting,
   started → done is work, assigned → done is the step's cycle time.
   ===================================================================== */
function processMetrics(r) {
  const prev = dbPrev(r), now = Date.now(), today = todayKey();
  const briefs = Object.values(S.data.briefs).filter(b => !b.archived);
  const subIn = rr => briefs.filter(b => b.submittedAt && inRange(tsKey(b.submittedAt), rr));
  const liveIn = rr => briefs.filter(b => b.liveAt && inRange(tsKey(b.liveAt), rr));
  const received = subIn(r), wentLive = liveIn(r);
  const completed = briefs.filter(b => b.closedAt && inRange(tsKey(b.closedAt), r));
  const timedLive = wentLive.filter(b => b.goLive), onTimeLive = timedLive.filter(b => tsKey(b.liveAt) <= b.goLive);
  const cycle = median(wentLive.filter(b => b.submittedAt).map(b => workdaysMs(b.submittedAt, b.liveAt)));
  const response = median(received.filter(b => b.kickoffAt).map(b => workdaysMs(b.submittedAt, b.kickoffAt)));
  const opens = []; briefs.forEach(b => (b.team || []).forEach(m => { if (m.addedAt && inRange(tsKey(m.addedAt), r) && m.openedAt) opens.push(workdaysMs(m.addedAt, m.openedAt)); }));
  const unopenedNow = briefs.filter(b => BRIEF_ACTIVE.includes(b.status)).reduce((n, b) => n + (b.team || []).filter(m => !m.openedAt).length, 0);
  const steps = Object.values(S.data.tasks).filter(t => t.briefId && !t.archived && S.data.briefs[t.briefId] && !S.data.briefs[t.briefId].archived);
  const doneIn = steps.filter(t => t.doneAt && inRange(tsKey(t.doneAt), r));
  const onTime = doneIn.filter(t => t.due && tsKey(t.doneAt) <= t.due), timed = doneIn.filter(t => t.due);
  const open = steps.filter(t => t.status !== 'Done' && BRIEF_ACTIVE.includes((S.data.briefs[t.briefId] || {}).status));
  const overdue = open.filter(t => t.due && t.due < today && stepIsReady(t));
  // per step name: where the time goes
  const byStep = {};
  doneIn.forEach(t => {
    const k = t.title, o = byStep[k] = byStep[k] || { name: k, n: 0, cycle: [], wait: [], work: [], sla: [], late: 0, blocked: [] };
    const ready = stepReadyAt(t);
    o.n++; o.cycle.push(workdaysMs(ready, t.doneAt));
    if (t.startedAt) { o.wait.push(workdaysMs(ready, t.startedAt)); o.work.push(workdaysMs(t.startedAt, t.doneAt)); }
    if (t.slaDays != null) o.sla.push(t.slaDays); if (t.due && tsKey(t.doneAt) > t.due) o.late++;
    if (t.blockedMs) o.blocked.push(t.blockedMs / 864e5);
  });
  const stepRows = Object.values(byStep).map(o => { const c = avg(o.cycle), s = avg(o.sla); return { name: o.name, n: o.n, cycle: c, wait: avg(o.wait), work: avg(o.work), sla: s, over: s ? c / Math.max(0.5, s) : null, late: o.late, onTime: pct(o.n - o.late, o.n), blocked: avg(o.blocked) }; })
    .sort((a, b) => (b.over || 0) - (a.over || 0) || b.n - a.n);
  // per person
  const ppl = people().map(p => {
    const d = doneIn.filter(t => t.assignee === p.id), o = open.filter(t => t.assignee === p.id);
    const ratio = avg(d.filter(t => t.slaDays != null).map(t => stepCycle(t) / Math.max(0.5, t.slaDays)));
    return { id: p.id, name: p.name, color: p.color, role: p.role, open: o.length, overdue: o.filter(t => t.due && t.due < today).length, done: d.length,
      onTime: pct(d.filter(t => t.due && tsKey(t.doneAt) <= t.due).length, d.filter(t => t.due).length), ratio,
      blocked: o.filter(t => t.status === 'Blocked').length };
  }).filter(x => x.open || x.done);
  const stuck = open.filter(t => ['In progress', 'Blocked', 'In review'].includes(t.status) && t.startedAt)
    .map(t => ({ t, used: workdaysMs(t.startedAt, now) })).sort((a, b) => b.used - a.used).slice(0, 8);
  const buckets = dbBuckets(r).map(b => ({ ...b, received: received.filter(x => inRange(tsKey(x.submittedAt), b)).length, live: wentLive.filter(x => inRange(tsKey(x.liveAt), b)).length }));
  const statusNow = BRIEF_STATUS.map(s => ({ name: s, n: briefs.filter(b => b.status === s).length }));
  const count = (list, key) => { const m = {}; list.forEach(b => key(b).forEach(v => { m[v] = (m[v] || 0) + 1; })); return Object.entries(m).map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n); };
  const scope = briefs.filter(b => (b.submittedAt && inRange(tsKey(b.submittedAt), r)) || BRIEF_ACTIVE.includes(b.status));
  return { received: received.length, receivedPrev: subIn(prev).length, live: wentLive.length, livePrev: liveIn(prev).length, completed: completed.length,
    onTimeLive: pct(onTimeLive.length, timedLive.length), timedLive: timedLive.length, onTimeLiveN: onTimeLive.length,
    cycle, response, openTime: median(opens), unopenedNow, stepsDone: doneIn.length, stepsOnTime: pct(onTime.length, timed.length), stepsTimed: timed.length, stepsOnTimeN: onTime.length,
    open: open.length, overdue: overdue.length, blocked: open.filter(t => t.status === 'Blocked').length, stepRows, ppl, stuck, buckets, statusNow, total: briefs.length,
    byType: count(scope, b => [b.type || 'Other']), byClient: count(scope, b => (b.clientIds || []).map(clientName)).slice(0, 10), bySector: count(scope, b => [...new Set((b.clientIds || []).map(id => (S.data.projects[id] || {}).sector || 'No sector'))]),
    atRisk: activeBriefs().filter(b => briefRisk(b).level !== 'ok').length };
}
function processSection(r, n, pLabel, delta) {
  const M = processMetrics(r);
  if (!M.total) return `<section class="db-sec"><div class="db-h"><h2>${ico('brief')} Briefs &amp; workflow</h2></div><div class="db-card db-empty">No briefs yet - they appear here as soon as the first one is submitted. (Settings → Sample data loads a realistic demo set.)</div></section>`;
  const d = v => (v == null ? '-' : `${fmtDur(v)}`);
  const bars = M.stepRows.slice(0, 10);
  const maxC = Math.max(1, ...bars.map(x => Math.max(x.cycle || 0, x.sla || 0)));
  return `<section class="db-sec"><div class="db-h"><h2>${ico('brief')} Briefs &amp; workflow</h2><span class="db-hs">${M.atRisk ? `<span class="warn">${M.atRisk} brief${M.atRisk === 1 ? '' : 's'} at risk now</span>` : 'nothing at risk right now'}</span></div>
    <div class="db-tiles c4">
      ${dbTile('Briefs received', fmtN(M.received), `${M.completed} completed in period`, delta(M.received, M.receivedPrev, null), 'Briefs submitted in this period.')}
      ${dbTile('Went live', fmtN(M.live), M.timedLive ? `${M.onTimeLiveN} of ${M.timedLive} by their go-live date` : 'no go-live dates to compare', delta(M.live, M.livePrev), 'Briefs whose go-live step was completed (or set Live) in this period.')}
      ${dbTile('Live on time', rateVal(M.onTimeLive), 'went live on or before the deadline', null, 'Of the briefs that went live in this period with a go-live deadline, how many made it.')}
      ${dbTile('Brief to live', M.cycle == null ? '-' : `${fmtDur(M.cycle)}`, 'median, submitted → live (working days)', null, 'Median working days from a brief being submitted to it going live.')}
      ${dbTile('Time to kick off', M.response == null ? '-' : fmtDur(M.response), 'median, submitted → workflow started', null, 'How long briefs wait after submission before the workflow is started.')}
      ${dbTile('Time to open', M.openTime == null ? '-' : fmtDur(M.openTime), M.unopenedNow ? `<span class="warn">${M.unopenedNow} assignment${M.unopenedNow === 1 ? '' : 's'} not opened yet</span>` : 'everyone has opened their briefs', null, 'Median time between someone being added to a brief and them opening it.')}
      ${dbTile('Steps on time', rateVal(M.stepsOnTime), M.stepsTimed ? `${M.stepsOnTimeN} of ${M.stepsTimed} steps by their due date` : 'no steps finished yet', null, 'Workflow steps completed in this period on or before their due date.')}
      ${dbTile('Open steps', fmtN(M.open), `<span class="${M.overdue ? 'warn' : ''}">${M.overdue} overdue</span> · ${M.blocked} blocked`)}
    </div>
    <div class="db-card"><div class="db-ch"><h3>Briefs received vs went live</h3><span>${esc(pLabel)}</span></div>
      ${dbColumns(M.buckets, [{ key: 'received', label: 'Received', slot: 1 }, { key: 'live', label: 'Went live', slot: 2 }], n <= 14 ? 'Day' : n <= 126 ? 'Week' : 'Month')}</div>
    <div class="db-card"><div class="db-ch"><h3>Where the time goes - bottlenecks by step</h3><span>steps finished in period · working days</span></div>
      ${bars.length ? `<div class="bn-list">${bars.map(x => `<div class="bn-row" tabindex="0" data-tip="${esc(`${x.name}\n${x.n} finished · ${x.onTime == null ? '-' : x.onTime + '% on time'}\nAvg ${fmtDur(x.cycle)} vs ${x.sla == null ? '-' : x.sla + 'd'} SLA\nWaiting to start ${d(x.wait)} · working ${d(x.work)}${x.blocked ? `\nBlocked on average ${fmtDur(x.blocked)}` : ''}`)}">
          <span class="nm">${esc(x.name)}<small>${x.n} done · ${x.onTime == null ? '-' : x.onTime + '% on time'}</small></span>
          <span class="bn-track"><span class="bn-wait" style="width:${((x.wait || 0) / maxC) * 100}%"></span><span class="bn-work" style="width:${((x.work != null ? x.work : x.cycle || 0) / maxC) * 100}%"></span>${x.sla != null ? `<i class="bn-sla" style="left:${(x.sla / maxC) * 100}%"></i>` : ''}</span>
          <span class="val ${x.over > 1.2 ? 'bad' : x.over > 1 ? 'warn' : ''}">${fmtDur(x.cycle)}${x.over != null ? `<small>${x.over >= 1 ? (Math.round(x.over * 10) / 10) + '× SLA' : 'within SLA'}</small>` : ''}</span></div>`).join('')}</div>
        <div class="db-legend"><span><i class="sw bn-wait"></i>Waiting to start</span><span><i class="sw bn-work"></i>Working</span><span><i class="sw bn-sla-k"></i>SLA</span></div>`
      : '<div class="db-empty">No workflow steps finished in this period yet.</div>'}</div>
    <div class="db-grid2">
      <div class="db-card"><div class="db-ch"><h3>By teammate</h3><span>open steps · finished in period</span></div>
        ${M.ppl.length ? `<div class="db-tw"><table class="db-acc"><thead><tr><th>Person</th><th>Open</th><th>Overdue</th><th>Blocked</th><th>Done</th><th>On time</th><th>vs SLA</th></tr></thead><tbody>
          ${M.ppl.sort((a, b) => b.overdue - a.overdue || b.open - a.open).map(p => `<tr><td>${avatarHTML(p.id)} ${esc(p.name)}<small class="mut"> ${esc(p.role || '')}</small></td><td>${p.open}</td><td>${p.overdue ? `<span class="warn">${p.overdue}</span>` : '<span class="mut">0</span>'}</td><td>${p.blocked || '<span class="mut">0</span>'}</td>
            <td>${p.done}</td><td>${p.onTime == null ? '<span class="mut">-</span>' : p.onTime + '%'}</td><td class="${p.ratio > 1.2 ? 'bad' : p.ratio > 1 ? 'warn' : ''}">${p.ratio == null ? '<span class="mut">-</span>' : (Math.round(p.ratio * 10) / 10) + '×'}</td></tr>`).join('')}</tbody></table></div>`
          : '<div class="db-empty">Assign workflow steps to see the split.</div>'}</div>
      <div class="db-card"><div class="db-ch"><h3>Longest-running steps now</h3><span>in progress, in review or blocked</span></div>
        ${M.stuck.length ? `<div class="db-list">${M.stuck.map(({ t, used }) => { const b = S.data.briefs[t.briefId]; const over = t.slaDays != null && used > t.slaDays; return `<div class="db-row stuck-row" data-go="#/brief/${b.id}" tabindex="0">
            <span class="nm">${avatarHTML(t.assignee)} ${esc(t.title)}<small>${esc(briefRef(b))} · ${esc(t.status)}</small></span><span class="val ${over ? 'warn' : ''}">${fmtDur(used)}</span><span class="nt">${t.slaDays != null ? `SLA ${t.slaDays}d` : ''}</span></div>`; }).join('')}</div>`
          : '<div class="db-empty">Nothing in progress right now.</div>'}</div>
    </div>
    <div class="db-grid3">
      <div class="db-card"><div class="db-ch"><h3>Briefs by status</h3><span>${M.total} in total</span></div>${dbStack(M.statusNow, M.total, v => ({ good: 'good', warn: 'warn', mute: 'mute', info: 'p3', purple: 'p2', done: 'good' }[BRIEF_TONE[v]] || 'mute'))}</div>
      <div class="db-card"><div class="db-ch"><h3>By brief type</h3><span>active or received</span></div>${dbBarList(M.byType, { tip: x => `${x.name}\n${x.n} brief${x.n === 1 ? '' : 's'}` })}</div>
      <div class="db-card"><div class="db-ch"><h3>Brands with most briefs</h3><span>active or received</span></div>${dbBarList(M.byClient, { empty: 'No brands on briefs yet.', tip: x => `${x.name}\n${x.n} brief${x.n === 1 ? '' : 's'}` })}</div>
    </div>
  </section>`;
}
function clientsSection(r) {
  const all = clients(); if (!all.length) return '';
  const st = clientStats(), today = todayKey();
  const rows = all.map(h => { const s = st[h.id]; const br = Object.values(S.data.briefs).filter(b => !b.archived && (b.clientIds || []).includes(h.id));
    return { h, s, recv: br.filter(b => b.submittedAt && inRange(tsKey(b.submittedAt), r)).length, stepsLate: alertsFor({ clientId: h.id }).filter(a => a.kind === 'overdue').length,
      risk: br.filter(b => BRIEF_ACTIVE.includes(b.status) && briefRisk(b).level !== 'ok').length }; });
  const quiet = rows.filter(x => !x.s.lastAt || x.s.lastAt < Date.now() - 30 * 864e5).length;
  const top = [...rows].sort((a, b) => (b.s.overdue + b.stepsLate + b.risk) - (a.s.overdue + a.stepsLate + a.risk) || b.s.open - a.s.open).slice(0, 12);
  const sectors = {}; rows.forEach(x => { const k = x.h.sector || 'No sector'; const o = sectors[k] = sectors[k] || { name: k, n: 0, open: 0 }; o.n++; o.open += x.s.open; });
  return `<section class="db-sec"><div class="db-h"><h2>${ico('client')} Brands</h2><span class="db-hs">${all.length} tracked</span></div>
    <div class="db-tiles c4">
      ${dbTile('Brands tracked', fmtN(all.length), `${Object.keys(sectors).length} sector${Object.keys(sectors).length === 1 ? '' : 's'}`)}
      ${dbTile('With overdue work', fmtN(rows.filter(x => x.s.overdue || x.stepsLate).length), 'tasks or workflow steps late')}
      ${dbTile('Briefs received', fmtN(rows.reduce((s, x) => s + x.recv, 0)), 'across all brands, in period', null, 'A brief for several brands counts once per brand.')}
      ${dbTile('No activity in 30 days', fmtN(quiet), quiet ? 'worth a check-in' : 'every brand is active')}
    </div>
    <div class="db-grid2">
      <div class="db-card"><div class="db-ch"><h3>Brands needing attention</h3><span>overdue, late steps and go-live risk</span></div>
        <div class="db-tw"><table class="db-acc"><thead><tr><th>Brand</th><th>Open</th><th>Overdue tasks</th><th>Late steps</th><th>Briefs at risk</th><th>Active briefs</th></tr></thead><tbody>
        ${top.map(x => `<tr><td><button class="link" data-go="#/client/${x.h.id}">${esc(x.h.name)}</button><small class="mut"> ${esc(x.h.sector || '')}</small></td><td>${x.s.open}</td>
          <td>${x.s.overdue ? `<span class="warn">${x.s.overdue}</span>` : '<span class="mut">0</span>'}</td><td>${x.stepsLate ? `<span class="warn">${x.stepsLate}</span>` : '<span class="mut">0</span>'}</td>
          <td>${x.risk ? `<span class="bad">${x.risk}</span>` : '<span class="mut">0</span>'}</td><td>${x.s.briefs}</td></tr>`).join('')}</tbody></table></div></div>
      <div class="db-card"><div class="db-ch"><h3>Open work by sector</h3><span>open tasks and steps</span></div>
        ${dbBarList(Object.values(sectors).map(b => ({ name: b.name, n: b.open, clients: b.n })).sort((a, b) => b.n - a.n), { note: x => `${x.clients} brand${x.clients === 1 ? '' : 's'}`, tip: x => `${x.name}\n${x.n} open · ${x.clients} brands` })}</div>
    </div></section>`;
}

/* =====================================================================
   SETTINGS - team emails & roles, labels, roles, sectors, workflows, alerts,
   email status and sample data. Drawn inside the existing Settings dialog.
   ===================================================================== */
function clientSettingsHTML() {
  const wfs = workflows(), a = alertCfg();
  const chipsEdit = (key, list, ph) => `<div class="chip-edit">${list.map((x, i) => `<span class="tag">${esc(x)}<button data-chipdel="${key}" data-i="${i}" title="Remove">${ico('x', 'i-xs')}</button></span>`).join('')}
    <form data-chipadd="${key}" class="inline"><input class="inp" placeholder="${esc(ph)}" maxlength="60" style="width:180px"><button class="btn sm">Add</button></form></div>`;
  return `
    <div class="set-h">${ico('tag')} Labels</div>
    <p class="set-p">Labels go on any task or step (Creative, Reporting, Urgent…). Brands are labels too - pick them in a task's Brands field.</p>
    ${labelsList().map(l => `<div class="set-row"><button class="dot sw-${esc(l.color)}" data-lcolor="${l.id}" title="Change color"></button><input class="inp" data-lname="${l.id}" value="${esc(l.name)}" maxlength="40"><button class="icon-btn" data-ldel="${l.id}" title="Remove">${ico('trash', 'i-sm')}</button></div>`).join('')}
    <form class="set-row" data-add-label><input class="inp" placeholder="Add a label, e.g. Arabic copy" maxlength="40"><button class="btn">Add</button></form>

    <div class="set-h">${ico('people')} Roles &amp; sectors</div>
    <p class="set-p">Roles decide who each workflow step goes to. Sectors group the brand list.</p>
    <div class="field"><label>Roles</label>${chipsEdit('roles', rolesList(), 'Add a role')}</div>
    <div class="field"><label>Sectors</label>${chipsEdit('sectors', sectorsList(), 'Add a sector')}</div>
    <div class="field"><label>Default columns for a new client's board</label>${chipsEdit('clientSections', settings().clientSections && settings().clientSections.length ? settings().clientSections : DEFAULT_CLIENT_SECTIONS, 'Add a column')}</div>

    <div class="set-h">${ico('flow')} Brief workflows &amp; SLAs</div>
    <p class="set-p">Steps run in order. <b>Days</b> = working days allowed for the step (its SLA). <b>After flight</b> = due that many working days after the flight ends. <b>Go-live</b> marks the step that launches the campaign.</p>
    ${wfs.map(w => `<details class="wf-box" ${wfs.length === 1 ? 'open' : ''}><summary><b>${esc(w.name)}</b> <span class="mut">${w.steps.length} steps · ${w.steps.filter(s => s.anchor !== 'flightEnd').reduce((s, x) => s + (+x.days || 0), 0)} working days to finish</span></summary>
      <div class="set-row" style="border:0"><input class="inp" data-wfname="${w.id}" value="${esc(w.name)}" maxlength="60"><button class="btn sm btn-danger" data-wfdel="${w.id}">Delete workflow</button></div>
      <table class="tbl wf-tbl"><thead><tr><th>Step</th><th>Role</th><th>Days</th><th>Timing</th><th>Go-live</th><th></th></tr></thead><tbody>
      ${w.steps.map((s, i) => `<tr><td><input class="inp" data-wfs="${w.id}" data-i="${i}" data-k="name" value="${esc(s.name)}" maxlength="120"></td>
        <td><select class="sel" data-wfs="${w.id}" data-i="${i}" data-k="role"><option value="">-</option>${rolesList().map(r => `<option ${r === s.role ? 'selected' : ''}>${esc(r)}</option>`).join('')}</select></td>
        <td><input class="inp" type="number" min="0" max="60" data-wfs="${w.id}" data-i="${i}" data-k="days" value="${+s.days || 0}" style="width:62px"></td>
        <td><select class="sel" data-wfs="${w.id}" data-i="${i}" data-k="anchor"><option value="prev" ${s.anchor !== 'flightEnd' ? 'selected' : ''}>After previous</option><option value="flightEnd" ${s.anchor === 'flightEnd' ? 'selected' : ''}>After flight</option></select></td>
        <td><input type="radio" name="launch-${w.id}" data-wflaunch="${w.id}" data-i="${i}" ${s.launch ? 'checked' : ''}></td>
        <td style="white-space:nowrap"><button class="icon-btn" data-wfmv="${w.id}" data-i="${i}" data-d="-1" title="Move up">${ico('up', 'i-sm')}</button><button class="icon-btn" data-wfmv="${w.id}" data-i="${i}" data-d="1" title="Move down">${ico('down', 'i-sm')}</button><button class="icon-btn" data-wfsdel="${w.id}" data-i="${i}" title="Remove">${ico('trash', 'i-sm')}</button></td></tr>`).join('')}
      </tbody></table><button class="btn sm" data-wfadd="${w.id}">${ico('plus', 'i-sm')} Add step</button></details>`).join('')}
    <button class="btn" data-wfnew style="margin-top:8px">${ico('plus', 'i-sm')} New workflow</button>

    <div class="set-h">${ico('bell')} Alerts &amp; SLAs</div>
    <div class="row2">
      <div class="field"><label>“Due soon” warning (working days before the due date)</label><input class="inp" type="number" min="0" max="14" data-al="dueSoonDays" value="${a.dueSoonDays}"></div>
      <div class="field"><label>Flag a step as taking too long at … × its SLA</label><input class="inp" type="number" min="1" max="5" step="0.1" data-al="stallFactor" value="${a.stallFactor}"></div>
      <div class="field"><label>Flag a brief nobody opened after … hours</label><input class="inp" type="number" min="1" max="240" data-al="unopenedHours" value="${a.unopenedHours}"></div>
      <div class="field"><label>Flag a submitted brief not kicked off after … hours</label><input class="inp" type="number" min="1" max="240" data-al="kickoffHours" value="${a.kickoffHours}"></div>
    </div>

    <div class="set-h">${ico('mail')} Email notifications</div>
    <p class="set-p">${CFG.email && CFG.email.enabled === false ? 'Emails are switched off in config.js (email.enabled).' : S.mode === 'local'
      ? 'Local mode can’t send email - emails that would go out are kept in this browser’s outbox.'
      : `Emails are queued in the <code>${esc((CFG.email && CFG.email.collection) || 'mail')}</code> collection and sent by the Firebase “Trigger Email” extension (SETUP step 7). People get emails at the address on the team list.`}
      ${S.mailBlocked ? '<br><span class="warn">The last email couldn’t be queued - check that the latest firestore.rules are published and the recipient has access.</span>' : ''}</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap">${S.mode === 'cloud' ? `<button class="btn" data-testmail>${ico('mail', 'i-sm')} Send me a test email</button>` : `<button class="btn" data-outbox>${ico('mail', 'i-sm')} View outbox</button>`}</div>`;
}
function clientSettingsWire(body, draw) {
  const cycle = c => COLORS[(COLORS.indexOf(c) + 1) % COLORS.length];
  const saveWf = async (id, fn) => { const list = clone(workflows()).map(w => (w.id === id ? fn(w) || w : w)); await saveSettings({ workflows: list }); };
  const listKey = k => (k === 'clientSections' ? (settings().clientSections && settings().clientSections.length ? settings().clientSections : DEFAULT_CLIENT_SECTIONS) : k === 'roles' ? rolesList() : sectorsList());
  body.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return; const ds = b.dataset;
    if (ds.lcolor) { await saveSettings({ labels: labelsList().map(l => (l.id === ds.lcolor ? { ...l, color: cycle(l.color) } : l)) }); draw(); }
    if (ds.ldel) { if (await confirmBox('Remove this label? Tasks keep working; the label just disappears from them.', 'Remove')) { await saveSettings({ labels: labelsList().filter(l => l.id !== ds.ldel) }); draw(); } }
    if (ds.chipdel) { e.preventDefault(); const k = ds.chipdel, list = listKey(k).filter((_, i) => i !== +ds.i); if (k === 'roles' && !list.length) return toast('Keep at least one role'); await saveSettings({ [k]: list }); draw(); }
    if (ds.wfdel) { if (workflows().length <= 1) return toast('Keep at least one workflow'); if (await confirmBox('Delete this workflow? Briefs already running keep their steps.', 'Delete')) { await saveSettings({ workflows: workflows().filter(w => w.id !== ds.wfdel) }); draw(); } }
    if (ds.wfadd) { await saveWf(ds.wfadd, w => ({ ...w, steps: [...w.steps, { id: uid(), name: 'New step', role: rolesList()[0], days: 1, anchor: 'prev' }] })); draw(); }
    if (ds.wfsdel) { await saveWf(ds.wfsdel, w => (w.steps.length <= 1 ? (toast('A workflow needs at least one step'), w) : { ...w, steps: w.steps.filter((_, i) => i !== +ds.i) })); draw(); }
    if (ds.wfmv) { await saveWf(ds.wfmv, w => { const s = [...w.steps], i = +ds.i, j = i + +ds.d; if (j < 0 || j >= s.length) return w; [s[i], s[j]] = [s[j], s[i]]; return { ...w, steps: s }; }); draw(); }
    if ('wfnew' in ds) { const r = await promptBox({ title: 'New workflow', label: 'Name', placeholder: 'e.g. Social-only campaign', ok: 'Create' }); if (r) { await saveSettings({ workflows: [...clone(workflows()), { id: uid(), name: r.value, steps: clone(DEFAULT_WORKFLOWS[1].steps).map(s => ({ ...s, id: uid() })) }] }); draw(); } }
    if ('testmail' in ds) {
      if (!myEmail()) return toast('Sign in first');
      await store.mail({ to: [myEmail()], message: { subject: `Test email from dentsu ${CFG.appName || 'Ads Workspace'}`, html: emailHTML({ heading: 'Email notifications are working', intro: 'This is how brief and step notifications will arrive.', link: '#/mywork', cta: 'Open My work' }), text: 'Email notifications are working.' } });
      toast(S.mailBlocked ? 'Couldn’t queue the email - see the note above' : 'Test email queued - it arrives within a minute if the extension is installed');
      draw();
    }
    if ('outbox' in ds) { let box = []; try { box = JSON.parse(lsGet('tb:outbox') || '[]'); } catch { }
      const w = openModal(`<div class="modal-head"><h2>Outbox (local mode)</h2><button class="icon-btn" data-x>${ico('x')}</button></div><div class="modal-body" style="max-height:65vh;overflow:auto">${box.length ? box.map(m => `<div class="ob-row"><div class="mut" style="font-size:11.5px">${esc(fmtDateTime(m.at))} · to ${esc((m.to || []).join(', '))}</div><b>${esc(m.message && m.message.subject)}</b><pre>${esc(m.message && m.message.text)}</pre></div>`).join('') : '<div class="mut">Nothing yet. Assign someone with an email to a brief.</div>'}</div>`, 'wide');
      w.querySelector('[data-x]').onclick = () => w.close(); }
  });
  body.addEventListener('change', async e => {
    const t = e.target, ds = t.dataset;
    if (ds.lname) { const v = t.value.trim(); if (v) await saveSettings({ labels: labelsList().map(l => (l.id === ds.lname ? { ...l, name: v } : l)) }); }
    if (ds.wfname) { const v = t.value.trim(); if (v) await saveWf(ds.wfname, w => ({ ...w, name: v })); }
    if (ds.wfs) { const k = ds.k; let v = t.value; if (k === 'days') v = Math.max(0, Math.min(60, Math.round(+v || 0))); await saveWf(ds.wfs, w => ({ ...w, steps: w.steps.map((s, i) => (i === +ds.i ? { ...s, [k]: v } : s)) })); }
    if (ds.wflaunch) await saveWf(ds.wflaunch, w => ({ ...w, steps: w.steps.map((s, i) => ({ ...s, launch: i === +ds.i })) }));
    if (ds.al) await saveSettings({ alerts: { ...alertCfg(), [ds.al]: +t.value } });
    if (ds.prole != null && ds.prole !== '') await saveSettings({ people: people().map(p => (p.id === ds.prole ? { ...p, role: t.value } : p)) });
    if (ds.pemail) { const v = t.value.trim().toLowerCase(); if (v && !okEmailId(v)) return toast('That doesn’t look like an email');
      if (v && people().some(p => p.id !== ds.pemail && p.email === v)) return toast('Someone else already has that email');
      await saveSettings({ people: people().map(p => (p.id === ds.pemail ? { ...p, email: v } : p)) }); }
    if ('iam' in ds) { lsSet('tb:me', t.value); render(); }
  });
  body.addEventListener('submit', async e => {
    const f = e.target;
    if ('addLabel' in f.dataset) { e.preventDefault(); e.stopImmediatePropagation(); const v = f.querySelector('input').value.trim(); if (!v) return;
      await saveSettings({ labels: [...labelsList(), { id: uid(), name: v, color: COLORS[labelsList().length % COLORS.length] }] }); draw(); }
    if (f.dataset.chipadd) { e.preventDefault(); e.stopImmediatePropagation(); const k = f.dataset.chipadd, v = f.querySelector('input').value.trim(); if (!v) return;
      if (listKey(k).some(x => x.toLowerCase() === v.toLowerCase())) return toast('Already there');
      await saveSettings({ [k]: [...listKey(k), v] }); draw(); }
  }, true);
}

/* =====================================================================
   SAMPLE BUSINESS - fictional client accounts, teams and people for demos,
   with briefs, workflow history, tasks, campaigns, calendar and notes inside
   each account. Everything is tagged demo:true and comes out with one click
   (Business settings → Sample data).
   ===================================================================== */
const DEMO_PEOPLE = [   // name, job role, colour, business role, seat on the GM team (the loader can put real names in these seats)
  ['Sara Haddad', 'Account Lead', 'red', 'admin', 'lead'],
  ['Karim Aziz', 'Paid Search', 'orange', 'member', 'gm1'], ['Lina Farah', 'Paid Social', 'purple', 'member', 'gm2'], ['Omar Khalil', 'Media Planner', 'blue', 'member', 'gm3'],
  ['Rami Nassar', 'Analytics', 'green', 'member', 'gm4'], ['Maya Saleh', 'Creative', 'pink', 'member', 'gm5'],
  ['Nour Saad', 'Account Lead', 'teal', 'member', ''], ['Dana Khoury', 'Media Planner', 'yellow', 'member', ''], ['Ziad Mansour', 'Paid Social', 'orange', 'member', ''],
  ['Hala Youssef', 'Head of Performance', 'grey', 'member', ''],
];
const DEMO_GM_SEATS = ['gm1', 'gm2', 'gm3', 'gm4', 'gm5'];
const DEMO_TEAMS = [   // id, name, colour, seats or first names
  ['demo-tm-gm', 'GM team', 'blue', ['lead', 'gm1', 'gm2', 'gm3', 'gm4', 'gm5']],
  ['demo-tm-retail', 'Retail & FMCG team', 'purple', ['Nour', 'Dana', 'Ziad']],
  ['demo-tm-lead', 'Leadership', 'grey', ['Hala']],
];
// Only the agency's own account gets a drawn mark; client accounts show their initials until a real logo is uploaded.
function demoLogo(kind, bg, fg) {
  if (kind !== 'dentsu') return '';
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="${bg}"/><g transform="translate(14 50) scale(1.15)"><path fill="${fg}" d="${DENTSU_D}"/></g></svg>`);
}
// One entry per account: who can get in, which tools are on, and what's inside.
// briefs: [title, type, brand indexes, days ago submitted, steps done, time used vs SLA per step, status, working days to go-live, extra fields]
const DEMO_ACCOUNTS = [
  { key: 'gm', name: 'General Motors', sector: 'Automotive', color: 'blue', logo: ['', '', ''],
    teams: { 'demo-tm-gm': 'editor', 'demo-tm-lead': 'viewer' }, people: { lead: 'admin' },
    brands: [['Chevrolet', 'General Motors', 'Automotive', 'UAE, KSA, Kuwait', 'Brand manager'], ['GMC', 'General Motors', 'Automotive', 'UAE, KSA, Kuwait, Qatar', 'Brand manager'], ['Cadillac', 'General Motors', 'Automotive', 'GCC', 'Brand manager'],
      ['OnStar', 'General Motors', 'Automotive', 'UAE, KSA', ''], ['ACDelco', 'General Motors', 'Automotive', 'GCC', '']],
    briefs: [
      ['Chevrolet Summer Service Campaign', 'Tactical / promotion', [0], 62, 10, [0.8, 0.9, 2.4, 0.7, 1.3, 0.8, 0.9, 0.8, 0.9, 1], 'Completed', 21],
      ['Cadillac Escalade IQ launch', 'Launch', [2], 47, 9, [0.7, 1, 2.2, 0.8, 1.2, 0.7, 1, 0.8, 0.9], 'Live', 20],
      ['Chevrolet Year-End Sales Event', 'Tactical / promotion', [0], 27, 9, [0.8, 0.9, 1.6, 0.8, 1.2, 0.9, 1, 0.8, 1], 'Live', 19, {
        objective: 'Leads', kpis: 'Test-drive leads and HVBs · CPL and cost per HVB vs Q3', markets: ['UAE', 'KSA'], platforms: ['Search', 'Meta', 'Snap', 'TikTok'],
        audience: 'In-market SUV and pickup buyers, plus people who enquired in the last 90 days.',
        offer: 'Year-end finance offer and free service package on selected models. Terms from the client brief.',
        promo: '', cta: 'Book a test drive', message: 'The best deal of the year ends 31 December.', landingUrl: 'https://www.example.com/year-end-offer',
        creative: 'Search RSAs in English and Arabic; Meta and Snap lead-form ads 1:1 and 9:16; TikTok 9:16 15s.',
        notes: 'Leads are counted in the client CRM - platform numbers are indicative. Frequency cap 3 above 3.5 on social.', campaignName: 'CHEV_YearEnd_Leads',
        objectives: { Search: ['Lead Generation'], Meta: ['Lead Generation'], Snap: ['Lead Generation'], TikTok: ['Traffic'] } }],
      ['GMC Yukon - Search conquest', 'Always-on', [1], 24, 6, [0.8, 0.9, 2.6, 0.8, 1.5, 0.9], 'In progress', 21],
      ['Ramadan 2027 offers - all brands', 'Seasonal', [0, 1, 2], 1, 0, [], 'Submitted', 20],
      ['2027 platform recommendations', 'Reporting / analysis', [0, 1], 0, 0, [], 'Draft', 22],
    ],
    tasks: [[0, 'Refresh Chevrolet RSAs (EN/AR)', 'lb-creative', 2, 'Paid Search'], [0, 'Weekly dealer search report', 'lb-report', 0, 'Paid Search'],
      [1, 'Pixel QA on the brand landing pages', 'lb-tracking', -1, 'Analytics'], [2, 'Monthly Cadillac brand & retail report', 'lb-report', 4, 'Analytics'], [1, 'Frequency check on paid social', 'lb-setup', 1, 'Paid Social']],
    // the To-Do board has one section per brand: [title, label, days to due, role, repeat, section]
    sections: ['Chevrolet', 'GMC', 'Cadillac', 'OnStar', 'ACDelco'],
    todos: [['Weekly pacing check - Chevrolet search', 'lb-setup', 0, 'Paid Search', { type: 'weekly', every: 1 }, 0], ['Refresh the Year-End lead-form creatives', 'lb-creative', 2, 'Paid Social', null, 0],
      ['Yukon conquest - search terms and negatives', 'lb-setup', 1, 'Paid Search', null, 1], ['GMC monthly performance deck', 'lb-report', 4, 'Account Lead', null, 1],
      ['Escalade IQ launch recap for the client', 'lb-report', 3, 'Account Lead', null, 2], ['Pixel QA on the Cadillac landing pages', 'lb-tracking', -1, 'Analytics', null, 2],
      ['OnStar search - monthly budget and keyword review', 'lb-plan', 5, 'Paid Search', null, 3], ['Draft the OnStar Q1 2027 media plan', 'lb-plan', 12, 'Media Planner', null, 3],
      ['ACDelco parts search - monthly report', 'lb-report', 6, 'Analytics', null, 4], ['Apply the monthly brand-safety exclusion list', 'lb-setup', 2, 'Paid Search', { type: 'monthly', every: 1 }, 4]],
    notes: [['Year-End Sales Event - channel plan', true, `<h2>Objective</h2><p>Drive test-drive leads and high-value behaviours for the year-end offer.</p>
      <h2>Channels</h2><ul><li><b>Search:</b> model and offer terms per market; conquest kept separate per brand</li><li><b>Meta & Snap:</b> lead-form ads to in-market audiences</li><li><b>TikTok:</b> 15s 9:16 to drive site visits</li></ul>
      <h2>Reporting</h2><ul class="nb-check"><li data-done="1">Leads from the client CRM, not platform counts</li><li>HVBs and cost per HVB next to leads and CPL</li></ul>`]] },
  // sub-accounts: everyone with access to General Motors can open these too
  { key: 'gm-chev', parent: 'gm', kind: 'brand', name: 'GM Chevrolet', sector: 'Automotive', color: 'yellow', logo: ['', '', ''], teams: {}, modules: { calendar: false, brands: false, notes: false },
    brands: [], briefs: [['Silverado always-on search', 'Always-on', [], 18, 6, [0.8, 0.9, 1.4, 0.8, 1.2, 0.9], 'In progress', 14], ['Tahoe test-drive leads', 'Lead generation', [], 3, 1, [0.9], 'In progress', 12]],
    tasks: [], todos: [['Chevrolet search pacing - mid-month check', 'lb-tracking', 1, 'Paid Search'], ['New RSA headlines for the Tahoe offer', 'lb-creative', 3, 'Paid Search']], notes: [] },
  { key: 'gm-gmc', parent: 'gm', kind: 'brand', name: 'GM GMC', sector: 'Automotive', color: 'red', logo: ['', '', ''], teams: {}, modules: { calendar: false, brands: false, notes: false },
    brands: [], briefs: [['GMC Sierra launch teaser', 'Launch', [], 5, 2, [0.8, 1.1], 'In progress', 15]], tasks: [], todos: [['Sierra teaser - audience lists for Meta and Snap', 'lb-setup', 2, 'Paid Social']], notes: [] },
  { key: 'gm-cad', parent: 'gm', kind: 'brand', name: 'GM Cadillac', sector: 'Automotive', color: 'grey', logo: ['', '', ''], teams: {}, people: { Dana: 'editor' }, modules: { calendar: false, brands: false, notes: false },
    brands: [], briefs: [['Cadillac LYRIQ awareness - GCC', 'Brand awareness', [], 9, 3, [0.9, 1, 1.6], 'In progress', 10]], tasks: [],
    todos: [['Monthly Cadillac brand and retail report', 'lb-report', 4, 'Analytics'], ['Collect dealer lead numbers for the Cadillac report', 'lb-client', 2, 'Account Lead']], notes: [] },
  { key: 'aga-chev', parent: 'gm-chev', kind: 'dealer', name: 'AGA Chevrolet', sector: 'Automotive', color: 'blue', logo: ['', '', ''], teams: {}, modules: { calendar: false, brands: false, notes: false, campaigns: false },
    brands: [], briefs: [['AGA Chevrolet dealer search - December', 'Always-on', [], 12, 7, [0.8, 0.9, 1.1, 0.9, 1, 0.8, 0.9], 'Live', 8]], tasks: [], todos: [['Check AGA location extensions', 'lb-setup', 1, 'Paid Search']], notes: [] },
  { key: 'alghanim-cad', parent: 'gm-cad', kind: 'dealer', name: 'Al Ghanim Cadillac', sector: 'Automotive', color: 'teal', logo: ['', '', ''], teams: {}, modules: { calendar: false, brands: false, notes: false, campaigns: false },
    brands: [], briefs: [['Al Ghanim Cadillac - Q1 2027 media plan', 'Tactical / promotion', [], 2, 0, [], 'Submitted', 18]], tasks: [], todos: [['Send the Q1 plan for dealer approval', 'lb-client', 5, 'Media Planner']], notes: [] },
  { key: 'aljomaih-cad', parent: 'gm-cad', kind: 'dealer', name: 'Al Jomaih Cadillac', sector: 'Automotive', color: 'purple', logo: ['', '', ''], teams: {}, modules: { calendar: false, brands: false, notes: false, campaigns: false },
    brands: [], briefs: [['Al Jomaih Escalade IQ dealer leads', 'Lead generation', [], 16, 5, [0.7, 0.9, 1.2, 0.8, 1.4], 'In progress', 6]], tasks: [], todos: [['Weekly dealer leads export', 'lb-report', 0, 'Analytics', { type: 'weekly', every: 1 }]], notes: [] },
  { key: 'sid', name: 'Siddiqi', sector: 'Luxury retail', color: 'grey', logo: ['', '', ''],
    teams: { 'demo-tm-retail': 'editor', 'demo-tm-lead': 'viewer' }, modules: { calendar: false, tasks: false },
    brands: [['Boutiques', 'Siddiqi', 'Luxury retail', 'UAE', 'Marketing manager'], ['Online store', 'Siddiqi', 'Luxury retail', 'UAE, GCC', 'E-commerce manager']],
    briefs: [
      ['Watch week - boutique events', 'Event', [0], 36, 9, [0.9, 0.9, 2.8, 0.9, 1.7, 0.8, 1, 0.9, 1], 'Live', 17],
      ['Ramadan gifting', 'Seasonal', [0, 1], 11, 2, [0.7, 1.2], 'In progress', 12],
      ['New boutique opening', 'Launch', [0], 1, 0, [], 'Submitted', 18],
    ],
    tasks: [[1, 'Online store conversion tag check', 'lb-tracking', 0, 'Media Planner'], [0, 'Boutique event creative (EN/AR)', 'lb-creative', 3, 'Paid Social']],
    todos: [['Share the monthly sales-to-media recap', 'lb-report', 4, 'Account Lead']], notes: [] },
  { key: 'fer', name: 'Ferrero', sector: 'FMCG', color: 'red', logo: ['', '', ''],
    teams: { 'demo-tm-retail': 'editor', 'demo-tm-lead': 'viewer' }, modules: { calendar: false },
    brands: [['Nutella', 'Ferrero', 'FMCG', 'GCC', 'Brand manager'], ['Kinder', 'Ferrero', 'FMCG', 'GCC', ''], ['Ferrero Rocher', 'Ferrero', 'FMCG', 'GCC', '']],
    briefs: [
      ['Ferrero Rocher - Ramadan gifting', 'Seasonal', [2], 55, 10, [0.6, 0.8, 1.9, 0.8, 1.5, 0.6, 0.8, 0.7, 1, 0.9], 'Completed', 20],
      ['Kinder - back to school', 'Tactical / promotion', [1], 7, 1, [0.9], 'In progress', 9],
      ['Nutella - always-on reach', 'Always-on', [0], 3, 0, [], 'In progress', 9, { kickLate: true }],
    ],
    tasks: [[0, 'Retailer listing links for Nutella ads', 'lb-client', 2, 'Media Planner'], [1, 'Pause sold-out pack sizes on Meta', 'lb-urgent', 0, 'Paid Social']],
    todos: [['Collect Arabic copy approvals', 'lb-creative', -1, 'Account Lead']], notes: [] },
  { key: 'int', name: 'Agency internal', sector: 'Internal', color: 'grey', logo: ['dentsu', '#FFFFFF', '#323232'],
    teams: { '*': 'editor' }, modules: { briefs: false, brands: false, campaigns: false, alerts: false, tasks: false },
    brands: [], briefs: [], tasks: [],
    todos: [['Q4 performance reviews - book the slots', 'lb-plan', 5, 'Account Lead'], ['Update the platform rate cards', 'lb-report', 9, 'Media Planner'],
      ['Renew Meta Business verification', 'lb-setup', 3, 'Paid Social'], ['Plan the team offsite', 'lb-plan', 20, 'Account Lead']],
    notes: [['Ways of working', true, `<h2>Briefs</h2><ul><li>Every request comes in as a brief in its client account - no email-only requests</li><li>We kick off within 1 working day of a complete brief</li><li>Client approval of media plans within 2 working days</li></ul>
      <h2>Reporting</h2><ul><li>Weekly pacing check every Monday</li><li>First optimisation check 72 hours after launch</li><li>Post-campaign report within 5 working days of the flight ending</li></ul>
      <h2>Access</h2><ul class="nb-check"><li data-done="1">Each client team has its own account</li><li>Leadership has view-only access to every client account</li></ul>`]] },
];
// team calendar entries: [team-list position, type, title, from (days from today), to]
const DEMO_EVENTS = [[1, 'ooo', 'Annual leave', 3, 7], [2, 'remote', '', 1, 1], [4, 'other', 'Google Ads certification day', 9, 9], [5, 'ooo', 'Sick leave', -2, -1],
  [3, 'office', 'Client office visit', 6, 6], [0, 'remote', '', 8, 8]];
const DEMO_COPY = {
  'Tactical / promotion': ['In-market shoppers in the markets below, plus people who engaged with the brand in the last 90 days.', 'Limited-time offer running for the flight; terms and conditions apply.', 'The offer of the season - for a limited time.', 'Static 1:1 and 9:16, 15s video cut-down, offer badge; English and Arabic copy.'],
  'Seasonal': ['Residents in the markets below planning purchases around the season.', 'Seasonal offer and content across the flight.', 'Made for the season.', 'Hero video 15s/6s, stills and carousel; English and Arabic copy.'],
  'Launch': ['Category intenders and existing customers; lookalikes of past leads.', 'Launch pricing and early registration for the first buyers.', 'Meet the new range.', 'Launch film 30s/15s/6s, product stills, carousel per feature; EN/AR.'],
  'Event': ['Residents within 30 minutes of the venue - families and young professionals.', 'Free entry; activities and offers across the weekend.', 'Join us this weekend.', '9:16 reels, venue carousel, countdown stories; EN/AR.'],
  'Lead generation': ['People actively researching in the category; retargeting of site visitors.', 'Register interest to get the brochure, prices and a call back.', 'Register your interest today.', 'Lead-form ads, carousel, Search RSAs; EN/AR.'],
  'Always-on': ['Customers researching through the year.', 'Standard offer with no blackout dates.', 'Here when you need us.', 'Search RSAs, LinkedIn single image, retargeting statics.'],
  'Brand awareness': ['Broad adult audience in the markets below.', 'No offer - brand story only.', 'A brand you can count on.', 'Brand film 30s/15s, YouTube bumpers, Meta reach.'],
};

// Builds one account's data against an empty data set, so the normal helpers see a brand-new account.
function buildAccountSample(P, { people: roster, seatEmail, settingsDoc, now }) {
  const saved = S.data, savedAcc = S.acc;
  S.data = {}; COLS.forEach(c => { S.data[c] = {}; });
  S.data.meta = { settings: settingsDoc };
  S.acc = { modules: P.modules || {} };
  S.dataVer = (S.dataVer || 0) + 1;
  try {
    const H = 36e5, D = 864e5, today = todayKey(), ops = [], acts = [];
    const lead = roster.find(p => p.role === 'Account Lead') || roster[0];
    const byRole = r => (roster.find(p => p.role === r) || lead).id;
    const pname = id => (roster.find(p => p.id === id) || {}).name || '';
    const wh = ts => { const d = new Date(ts), f = (d.getHours() * 60 + d.getMinutes()) / 1440; d.setHours(9, 0, 0, 0); return Math.min(now - 6e5, d.getTime() + Math.round(f * 540) * 6e4); };
    const addOffice = (ts, h) => { let t = ts, left = h * H; for (let g = 0; g < 500 && left > 0; g++) { const d = new Date(t), open = new Date(t).setHours(9, 0, 0, 0), close = new Date(t).setHours(18, 0, 0, 0);
      if (!isWorkday(keyOf(d)) || t >= close) { const n = new Date(t); n.setDate(n.getDate() + 1); n.setHours(9, 0, 0, 0); t = n.getTime(); continue; }
      if (t < open) t = open; const use = Math.min(left, close - t); t += use; left -= use; } return Math.min(now - 6e5, t); };
    const span = (from, days) => { let t0 = from, left = days * D; for (let g = 0; left > 0 && g < 400; g++) { const d0 = new Date(t0), next = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + 1).getTime(); if (isWorkday(keyOf(d0))) { const use = Math.min(left, next - t0); left -= use; t0 += use; if (left <= 0) break; } t0 = Math.max(t0, next); } return t0; };
    const act = (at, action, o) => acts.push({ id: uid(), at, action, by: o.by || lead.name, byEmail: userEmail(), kind: o.kind, briefId: o.briefId || null, taskId: o.taskId || null, clientIds: o.clientIds || [], title: o.title || '', from: o.from || '', to: o.to || '', detail: o.detail || '', demo: true });
    const put = (col, data) => { ops.push({ type: 'put', col, data }); if (S.data[col]) S.data[col][data.id] = data; };
    put('meta', settingsDoc);
    put('projects', { id: SYS_ID, kind: 'system', name: 'Brief workflow steps', color: 'purple', description: 'Holds the workflow steps of every brief. Hidden from the sidebar.', order: 0, createdAt: now });
    // brands (each with its own board)
    const hid = P.brands.map(([name, group, sector, market, contactName], i) => {
      const id = `demo-${P.key}-b${i}`;
      clientOps({ id, name, group, sector, market, contactName, color: COLORS[(i + 3) % 8], demo: true }, 100 + i).forEach(o => put(o.col, o.data));
      return id;
    });
    const firstSec = hid.map(id => (Object.values(S.data.sections).find(s => s.projectId === id && s.order === 1000) || {}).id || null);
    // Campaign Tracker account for this client
    const ctId = `demo-${P.key}-ct`;
    put('accounts', { id: ctId, name: P.name, order: 500, archived: false, createdAt: now, demo: true });
    // briefs with their full workflow history
    const wf = DEFAULT_WORKFLOWS[0].steps;
    P.briefs.forEach(([title, type, hs, agoDays, nDone, stall, status, glDays, extra = {}], bi) => {
      const id = `demo-${P.key}-br${bi}`, sub = wh(now - agoDays * D - 3 * H), hIds = hs.map(i => hid[i]).filter(Boolean), seq = bi + 1;
      const subKey = tsKey(sub), goLive = addWorkdays(subKey, glDays), flightStart = goLive, flightEnd = addDays(goLive, 28);
      const ref = 'RB-' + String(seq).padStart(4, '0');
      const teamM = [];
      ['Account Lead', 'Media Planner', 'Paid Social', 'Creative', 'Analytics'].forEach((r, k) => {
        const pid = byRole(r); if (teamM.some(m => m.personId === pid)) return;
        teamM.push({ personId: pid, role: r, addedAt: addOffice(sub, 0.3 + k * 0.15), openedAt: status === 'Submitted' && k > 1 ? null : addOffice(sub, 0.3 + k * 0.15 + (k === 3 ? 14 : 0.6 + k * 0.9)) });
      });
      const requester = (P.brands[hs[0]] && P.brands[hs[0]][4]) || 'Client marketing team';
      const cp = DEMO_COPY[type] || DEMO_COPY['Tactical / promotion'];
      const b = { id, seq, ref, title, type, status, priority: bi % 3 === 0 ? 'High' : 'Normal', clientIds: hIds,
        objective: type === 'Brand awareness' ? 'Awareness' : /Lead|Launch|Always|Event/.test(type) ? 'Leads' : 'Sales / conversions',
        kpis: bi % 2 ? 'CPL ≤ AED 200 · 800 leads' : 'CPA ≤ AED 150 · 1,200 conversions', budget: 40000 + bi * 7500, currency: CFG.currency || 'AED', goLive, flightStart, flightEnd, requestDate: subKey,
        markets: bi % 2 ? ['UAE', 'KSA'] : ['UAE', 'KWT', 'QAT'], platforms: bi % 2 ? ['Meta', 'Search', 'PMax'] : ['Meta', 'TikTok', 'Search', 'YouTube'], languages: ['English', 'Arabic'],
        audience: cp[0], offer: cp[1], promo: 'SAVE' + (20 + bi), message: cp[2], cta: /Lead|Launch|Always|Event/.test(type) ? 'Register interest' : 'Shop now', creative: cp[3], assetsUrl: '', landingUrl: '', notes: '',
        requestedBy: requester, requestedByEmail: '', ownerId: lead.id, team: status === 'Draft' ? [] : teamM, workflowId: 'wf-full', archived: false, demo: true,
        createdAt: sub - 2 * H, createdBy: lead.name, submittedAt: status === 'Draft' ? null : sub, statusLog: [{ status: 'Draft', at: sub - 2 * H, by: lead.name }] };
      Object.assign(b, Object.fromEntries(Object.entries(extra).filter(([k]) => BRIEF_FIELDS.includes(k))));
      const label = `${ref} · ${title}`;
      act(sub - 2 * H, 'brief_created', { kind: 'brief', briefId: id, clientIds: hIds, title: label });
      if (status === 'Draft') { put('briefs', b); return; }
      b.statusLog.push({ status: 'Submitted', at: sub, by: lead.name });
      act(sub, 'brief_submitted', { kind: 'brief', briefId: id, clientIds: hIds, title: label, by: requester });
      teamM.forEach(m => { act(m.addedAt, 'team_added', { kind: 'brief', briefId: id, clientIds: hIds, title: label, to: pname(m.personId), detail: m.role });
        if (m.openedAt && m.openedAt < now) act(m.openedAt, 'brief_opened', { kind: 'brief', briefId: id, clientIds: hIds, by: pname(m.personId), title: label, detail: `${fmtDur((m.openedAt - m.addedAt) / D)} after being assigned` }); });
      if (status === 'Submitted') { put('briefs', b); return; }
      const kick = addOffice(sub, extra.kickLate ? 11 : 2.5 + (bi % 3)); b.kickoffAt = kick; b.statusLog.push({ status: 'In progress', at: kick, by: lead.name });
      act(kick, 'kickoff', { kind: 'brief', briefId: id, clientIds: hIds, title: label, detail: `Full campaign · ${wf.length} steps` });
      let cur = kick, plan = tsKey(kick);
      wf.forEach((st, i) => {
        const base = i > 0 && tsKey(cur) > plan ? tsKey(cur) : plan;
        const dueK = st.anchor === 'flightEnd' ? addWorkdays(flightEnd, st.days) : addWorkdays(base, st.days);
        if (st.anchor !== 'flightEnd') plan = dueK;
        const pid = byRole(st.role), t = newTask({ id: `${id}-s${i}`, projectId: SYS_ID, title: st.name, briefId: id, stepKey: st.id, role: st.role, slaDays: st.days, launch: !!st.launch, anchor: st.anchor || 'prev',
          assignee: pid, assignedAt: kick, clientIds: hIds, order: (i + 1) * 1000, createdAt: kick, createdBy: lead.name, due: dueK, status: 'To do', demo: true });
        if (i < nDone) {
          const wait = 0.1 + (i % 3) * 0.08, work = Math.max(0.15, st.days * (stall[i] || 1) - wait);
          const s0 = wh(span(Math.max(cur, kick), wait)), s1 = Math.max(s0 + 12e5, Math.min(now - H, wh(span(s0, work))));
          Object.assign(t, { status: 'Done', done: true, startedAt: s0, doneAt: s1, completedAt: s1, completedBy: pname(pid) });
          if (st.name.startsWith('Client approval') && stall[i] > 2) Object.assign(t, { blockedMs: work * 0.6 * D });
          act(s0, 'step_started', { kind: 'step', briefId: id, taskId: t.id, clientIds: hIds, title: st.name, by: pname(pid), from: 'To do', to: 'In progress' });
          act(s1, 'step_done', { kind: 'step', briefId: id, taskId: t.id, clientIds: hIds, title: st.name, by: pname(pid), from: 'In progress', to: 'Done', detail: `took ${fmtDur(workdaysMs(cur, s1))} of a ${st.days}d SLA` });
          cur = s1;
          if (st.launch) { b.liveAt = s1; b.statusLog.push({ status: 'Live', at: s1, by: pname(pid) }); act(s1, 'brief_status', { kind: 'brief', briefId: id, clientIds: hIds, title: label, from: 'In progress', to: 'Live', by: pname(pid) }); }
        } else if (i === nDone && status !== 'Completed') {
          const s0 = wh(cur + 0.3 * D);
          if (s0 < now) {
            const blocked = st.name.startsWith('Client approval');
            Object.assign(t, { status: blocked ? 'Blocked' : 'In progress', startedAt: s0, ...(blocked ? { blockedAt: s0 + 0.5 * D, blockedReason: 'Waiting for the client to sign off the plan' } : {}) });
            act(s0, 'step_started', { kind: 'step', briefId: id, taskId: t.id, clientIds: hIds, title: st.name, by: pname(pid), from: 'To do', to: 'In progress' });
            if (blocked) act(s0 + 0.5 * D, 'step_blocked', { kind: 'step', briefId: id, taskId: t.id, clientIds: hIds, title: st.name, by: pname(pid), from: 'In progress', to: 'Blocked', detail: t.blockedReason });
          }
        }
        put('tasks', t);
      });
      if (status === 'Completed') { b.closedAt = wh(cur + 0.5 * D); b.statusLog.push({ status: 'Completed', at: b.closedAt, by: lead.name }); act(b.closedAt, 'brief_status', { kind: 'brief', briefId: id, clientIds: hIds, title: label, from: 'Live', to: 'Completed' }); }
      b.status = status;
      put('briefs', b);
      if (['Live', 'Completed'].includes(status)) put('campaigns', { ...newCampaign(ctId), id: `${id}-c`, name: extra.campaignName || title, briefId: id, clientIds: hIds, status: status === 'Live' ? 'Live' : 'Ended',
        startDate: flightStart, endDate: status === 'Live' ? addDays(today, 10 + bi) : addDays(today, -3 - bi), markets: b.markets, platforms: b.platforms, objectives: extra.objectives || { Meta: ['Conversion'], Search: ['Lead Generation'] },
        description: `From brief ${ref} - ${title}`, pacing: bi % 2 ? 'Healthy' : 'Under-pacing', results: status === 'Live' ? (bi % 3 ? 'Healthy' : 'Needs Attention') : 'Healthy', creative: 'All Live',
        weeklyChecks: status === 'Live' ? [3, 2, 1].map(w => ({ id: uid(), date: addDays(today, -7 * w), at: wh(now - 7 * w * D), by: pname(byRole('Media Planner')) })) : [], createdBy: lead.name, demo: true });
    });
    // brand tasks with labels; a few late
    (P.tasks || []).forEach(([h, title, lb, dd, role], i) => put('tasks', newTask({ id: `demo-${P.key}-ht${i}`, projectId: hid[h], sectionId: firstSec[h], title, labels: [lb], due: addDays(today, dd), assignee: byRole(role), priority: dd < 0 ? 2 : 4, order: (i + 1) * 1000, createdAt: now - (6 + i) * D, createdBy: lead.name, demo: true })));
    // the account's own to-do list
    const listId = `demo-${P.key}-list`;
    put('projects', { id: listId, name: P.key === 'int' ? 'Agency to-dos' : 'To-Do', color: 'red', description: '', order: 1000, createdAt: now, demo: true });
    (P.sections || []).forEach((name, i) => put('sections', { id: `demo-${P.key}-ls${i}`, projectId: listId, name, order: (i + 1) * 1000, createdAt: now, demo: true }));
    (P.todos || []).forEach(([title, lb, dd, role, recur, sec], i) => put('tasks', newTask({ id: `demo-${P.key}-tl${i}`, projectId: listId, sectionId: P.sections && sec != null ? `demo-${P.key}-ls${sec}` : null, title, labels: [lb], due: addDays(today, dd), recur: recur || null, assignee: byRole(role), priority: dd < 0 ? 2 : 4, order: (i + 1) * 1000, createdAt: now - (3 + i) * D, createdBy: lead.name, demo: true })));
    // team calendar
    if ((P.modules || {}).calendar !== false) DEMO_EVENTS.forEach(([at, type, title, a, b2], i) => { const p = roster[at % Math.max(1, roster.length)]; if (!p) return;
      put('events', { id: `demo-${P.key}-ev${i}`, person: p.id, type, title, start: addDays(today, a), end: addDays(today, b2), time: '', timeEnd: '', note: '', repeat: { type: 'none', every: 1, until: '' }, skip: [], createdAt: now, createdBy: lead.name, demo: true }); });
    // notebook
    (P.notes || []).forEach(([title, pinned, html], i) => put('notes', { id: `demo-${P.key}-n${i}`, accountId: ctId, campaignId: null, title, html, text: htmlText(html), tags: [], pinned, createdAt: now - (30 - i * 10) * D, createdBy: lead.name, updatedAt: now - (8 - i * 3) * D, updatedBy: lead.name, demo: true }));
    // a few notifications for whoever loaded the sample
    const seat = roster.find(p => p.email === seatEmail);
    if (seat) {
      const brs = Object.values(S.data.briefs);
      const pick = st => brs.find(b => b.status === st);
      const nb = [];
      const subm = pick('Submitted'); if (subm) nb.push(['brief', `You're on ${subm.ref} as ${seat.role}`, subm.title, '#/brief/' + subm.id, 2 * H]);
      const blk = Object.values(S.data.tasks).find(t => t.status === 'Blocked'); if (blk) nb.push(['alert', `Blocked: ${blk.title}`, `${S.data.briefs[blk.briefId].ref} - ${blk.blockedReason}`, '#/brief/' + blk.briefId, 20 * H]);
      const prog = pick('In progress'); if (prog) nb.push(['step', 'Step done: Media plan & budget split', `${prog.ref} · ${prog.title}`, '#/brief/' + prog.id, 5 * H]);
      nb.forEach(([kind, title, body, link, ago], i) => put('notifs', { id: `demo-${P.key}-nt${i}`, to: seatEmail, at: now - ago, title, body, link, briefId: link.split('/').pop(), taskId: null, kind, read: false, from: pname(byRole('Media Planner')), fromEmail: userEmail(), demo: true }));
    }
    S.data.activity = Object.fromEntries(acts.map(a => [a.id, a]));
    S.dataVer++;
    return { ops, acts, stats: accountStats() };
  } finally { S.data = saved; S.acc = savedAcc; S.dataVer = (S.dataVer || 0) + 1; }
}

// Loads the sample. `team` (optional, from the dialog below) puts real names into the GM team's seats - they're stored
// in this platform's database like any other people, never in the code.
async function loadSampleBusiness({ silent = false, team = null } = {}) {
  if (!isBizAdmin()) return toast('Only business admins can load the sample business');
  if (allAccounts(true).some(a => a.demo)) return silent ? null : toast('The sample business is already loaded');
  const now = Date.now();
  const seatEmail = S.mode === 'cloud' ? userEmail() : 'sara@example.com';
  const slug = n => String(n).toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '') || 'person';
  const people = DEMO_PEOPLE.map(([name, job, color, role, seat]) => ({ name, job, color, role, seat }));
  (team || []).forEach((t, i) => { const p = people.find(x => x.seat === DEMO_GM_SEATS[i]); if (p && t && t.name && t.name.trim()) { p.name = t.name.trim().slice(0, 60); if (t.role) p.job = t.role; } });
  const used = new Set([seatEmail]);
  people.forEach(p => { if (p.seat === 'lead') { p.email = seatEmail; return; } let e = slug(p.name) + '@example.com', k = 2; while (used.has(e)) e = `${slug(p.name)}${k++}@example.com`; used.add(e); p.email = e; });
  const who = key => people.find(p => p.seat === key) || people.find(p => p.name.toLowerCase().startsWith(String(key).toLowerCase()));
  const members = {};
  people.forEach(p => {
    const em = p.email, mine = p.seat === 'lead' && S.mode === 'cloud';
    const ex = S.biz.members[em];
    members[em] = ex ? { ...ex, jobRole: ex.jobRole || p.job } : { id: em, name: mine ? (S.user.name || p.name) : p.name, jobRole: p.job, color: p.color, bizRole: p.role, addedAt: now, addedBy: userEmail(), ...(mine ? {} : { demo: true }) };
  });
  // never two things with the same name: if you already have a real "GM team" or "General Motors", the sample's copy says so
  const nameFree = (list, nm) => (list.some(x => !x.demo && String(x.name || '').trim().toLowerCase() === nm.toLowerCase()) ? `${nm} (sample)` : nm);
  const teams = {};
  DEMO_TEAMS.forEach(([id, nm, color, keys]) => { const name = nameFree(bizTeams(), nm); teams[id] = { id, name, color, memberEmails: keys.map(k => who(k)).filter(Boolean).map(p => p.email), createdAt: now, demo: true }; });
  const allMembers = { ...S.biz.members, ...members };
  // build every account first (pure), then write
  const accMap = { ...S.biz.accounts };   // parents are built before their sub-accounts, so access can be inherited
  const built = DEMO_ACCOUNTS.map(P => {
    const a = { id: 'demo-acc-' + P.key, name: nameFree(allAccounts(true), P.name), parentId: P.parent ? 'demo-acc-' + P.parent : '', kind: P.kind || '', sector: P.sector, color: P.color, logo: demoLogo(...P.logo), modules: P.modules || {},
      access: { teams: { ...P.teams }, people: Object.fromEntries(Object.entries(P.people || {}).map(([k, r]) => [who(k).email, r])) },
      archived: false, createdAt: now, createdBy: userEmail(), demo: true };
    Object.assign(a, computeAccess(a, allMembers, teams, accMap)); accMap[a.id] = a;
    const roster = a.memberEmails.filter(em => roleRank(a.roles[em]) >= 2 && allMembers[em]).map(em => {
      const m = allMembers[em];
      return { id: 'demo-' + slug(em.split('@')[0]).replace(/\./g, '-'), name: m.name || em, email: em, role: DEFAULT_ROLES.includes(m.jobRole) ? m.jobRole : 'Account Lead', color: m.color || 'grey', demo: true };
    }).sort((x, y) => DEFAULT_ROLES.indexOf(x.role) - DEFAULT_ROLES.indexOf(y.role));
    const settingsDoc = { id: 'settings', people: roster, types: DEFAULT_TYPES, labels: DEFAULT_LABELS, roles: DEFAULT_ROLES, sectors: DEFAULT_SECTORS, clientSections: DEFAULT_CLIENT_SECTIONS,
      workflows: DEFAULT_WORKFLOWS, alerts: { dueSoonDays: 1, stallFactor: 1.5, unopenedHours: 24, kickoffHours: 24 }, createdAt: now };
    const out = buildAccountSample(P, { people: roster, seatEmail, settingsDoc, now });
    a.stats = out.stats;
    return { a, out };
  });
  if (!silent) toast('Loading the sample business…');
  for (const m of Object.values(members)) await bizApi.putMember(m);
  for (const t of Object.values(teams)) await bizApi.putTeam(t);
  if (S.mode === 'local' && (!S.biz.owner || S.biz.owner === LOCAL_ME)) {
    // the placeholder "Me" makes way for the sample's account lead, unless it already has accounts of its own
    if (!allAccounts(true).some(a => (a.roles || {})[LOCAL_ME])) delete S.biz.members[LOCAL_ME];
    S.biz.owner = seatEmail; saveBizLocal(); if (!lsGet('tb:viewAs')) setLocalUser();
  }
  for (const { a } of built) await bizApi.putAccount(a);
  for (const { a, out } of built) await bizApi.writeAccount(a.id, out.ops, out.acts);
  audit('sample_loaded', `${built.length} accounts`);
  if (!silent) toast('Sample business loaded');
  const first = built[0].a;
  lsSet(accKey(), first.id);
  if (S.biz.accounts[first.id]) openAccount(S.biz.accounts[first.id], '#/dashboard');
}
// The sample's GM team can carry your real team's names (optional).
function openSampleDialog() {
  if (allAccounts(true).some(a => a.demo)) return toast('The sample business is already loaded');
  const seats = DEMO_GM_SEATS.map(k => DEMO_PEOPLE.find(p => p[4] === k));
  const roles = DEFAULT_ROLES.filter(r => r !== 'Client');
  const w = openModal(`<div class="modal-head"><h2>Load sample business</h2><button class="icon-btn" data-x>${ico('x')}</button></div>
    <div class="modal-body">
      <p class="set-p">Adds <b>${esc(DEMO_ACCOUNTS.filter(a => !a.parent).map(a => a.name).join(', '))}</b>, with ${DEMO_ACCOUNTS.filter(a => a.parent).length} sub-accounts under General Motors (${esc(DEMO_ACCOUNTS.filter(a => a.parent).map(a => a.name).join(', '))}). Plus teams, people with different access, and briefs, tasks and campaigns inside each. You take the Account Lead seat on General Motors. Everything comes out again with one click.</p>
      <div class="set-h">${ico('people')} Your GM team (optional)</div>
      <p class="set-p">Type your teammates' names to put them on the General Motors account. Leave a row empty to use the example name. Names are saved in this platform only.</p>
      <div class="sd-team">${seats.map((p, i) => `<div class="sd-row"><input class="inp" data-sdn="${i}" maxlength="60" placeholder="${esc(p[0])}"><select class="sel" data-sdr="${i}">${roles.map(r => `<option ${r === p[1] ? 'selected' : ''}>${esc(r)}</option>`).join('')}</select></div>`).join('')}</div>
    </div>
    <div class="modal-foot"><span class="spacer"></span><button class="btn" data-x>Cancel</button><button class="btn btn-primary" data-ok>Load sample business</button></div>`, 'wide');
  $$('[data-x]', w).forEach(b => b.onclick = () => w.close());
  w.querySelector('[data-ok]').onclick = async () => {
    const team = seats.map((_, i) => ({ name: w.querySelector(`[data-sdn="${i}"]`).value, role: w.querySelector(`[data-sdr="${i}"]`).value }));
    w.close(); await loadSampleBusiness({ team });
  };
}
async function clearSampleBusiness() {
  if (!isBizAdmin()) return toast('Only business admins can remove the sample business');
  const accs = allAccounts(true).filter(a => a.demo), teams = bizTeams().filter(t => t.demo);
  const mem = bizMembers().filter(m => m.demo && m.id !== userEmail() && m.id !== S.biz.owner);
  if (!accs.length && !teams.length && !mem.length) return toast('No sample data to remove');
  if (!await confirmBox(`Remove the sample business - ${plural(accs.length, 'account')}, ${plural(teams.length, 'team')} and ${plural(mem.length, 'person', 'people')}? Your own accounts, teams and people stay.`, 'Remove')) return;
  if (S.acc && S.acc.demo) { if (store && store.stop) store.stop(); store = null; S.acc = null; S.ws = null; }
  for (const a of accs) await wipeAccount(a);
  for (const t of teams) await bizApi.delTeam(t.id);
  // sample people also leave any real team or real account you added them to
  const gone = new Set(mem.map(m => m.id));
  for (const t of bizTeams().filter(t => !t.demo && (t.memberEmails || []).some(em => gone.has(em)))) await bizApi.putTeam({ ...t, memberEmails: t.memberEmails.filter(em => !gone.has(em)) });
  for (const a of allAccounts(true).filter(a => !a.demo && Object.keys((a.access || {}).people || {}).some(em => gone.has(em)))) {
    const access = clone(a.access); gone.forEach(em => delete access.people[em]); await bizApi.patchAccount(a.id, { access });
  }
  for (const m of mem) await bizApi.delMember(m.id);
  if (S.mode === 'local' && S.biz.owner === 'sara@example.com') {   // hand this browser back to the placeholder owner
    S.biz.members[LOCAL_ME] = S.biz.members[LOCAL_ME] || { id: LOCAL_ME, name: 'Me', jobRole: 'Account Lead', bizRole: 'admin', color: 'red', addedAt: Date.now() };
    delete S.biz.members['sara@example.com']; S.biz.owner = LOCAL_ME; saveBizLocal(); lsSet('tb:viewAs', ''); setLocalUser();
  }
  await syncAccess();
  audit('sample_removed', `${accs.length} accounts`);
  toast('Sample business removed');
  openBestAccount();
}

/* =====================================================================
   TASK DETAILS - clients, labels and (for brief steps) status & timing.
   Called by openTask; returns the extra side-panel HTML and wiring.
   ===================================================================== */
function taskExtrasHTML(d) {
  const st = d.briefId ? S.data.briefs[d.briefId] : null;
  return `${st ? `<div class="prop"><span class="lbl-sm">Brief</span><button class="link-btn" data-m="go-brief">${esc(briefLabel(st))}</button></div>
    <div class="prop"><span class="lbl-sm">Step status</span><select class="sel" data-f="status">${STEP_STATUS.map(s => `<option ${s === (d.status || 'To do') ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
    <div class="prop"><span class="lbl-sm">SLA (working days)</span><input class="inp" type="number" min="0" max="60" data-f="slaDays" value="${d.slaDays ?? ''}" style="width:80px"></div>
    <div class="prop tm-foot-info">${d.assignedAt ? `Assigned ${esc(fmtDateTime(d.assignedAt))}` : ''}${d.startedAt ? `<br>Started ${esc(fmtDateTime(d.startedAt))}` : ''}${d.doneAt ? `<br>Done ${esc(fmtDateTime(d.doneAt))} · took ${fmtDur(stepCycle(d))}` : ''}${d.blockedReason ? `<br><span class="bad">Blocked: ${esc(d.blockedReason)}</span>` : ''}</div>` : ''}
    <div class="prop"><span class="lbl-sm">Brands</span><div class="tm-chips" data-clients></div></div>
    <div class="prop"><span class="lbl-sm">Labels</span><div class="tm-chips" data-labels></div></div>`;
}
function taskExtrasWire(w, d) {
  const q = s => w.querySelector(s);
  const own = (S.data.projects[d.projectId] || {}).kind === 'client' ? d.projectId : null;
  const paint = () => {
    q('[data-clients]').innerHTML = `${own ? `<span class="tag clt" title="This task is in the brand's own list">${ico('client', 'i-xs')}${esc(clientName(own))}</span>` : ''}${(d.clientIds || []).filter(id => id !== own).map(id => `<span class="tag clt">${ico('client', 'i-xs')}${esc(clientName(id))}<button type="button" data-unclient="${id}">${ico('x', 'i-xs')}</button></span>`).join('')}<button type="button" class="btn sm" data-addclient>${ico('plus', 'i-xs')}</button>`;
    q('[data-labels]').innerHTML = `${(d.labels || []).map(labelById).filter(Boolean).map(l => `<span class="tag lbl-chip lc-${esc(l.color)}">${esc(l.name)}<button type="button" data-unlabel="${l.id}">${ico('x', 'i-xs')}</button></span>`).join('')}<button type="button" class="btn sm" data-addlabel>${ico('plus', 'i-xs')}</button>`;
  };
  paint();
  w.addEventListener('click', e => {
    const uh = e.target.closest('[data-unclient]'); if (uh) { d.clientIds = (d.clientIds || []).filter(x => x !== uh.dataset.unclient); paint(); return; }
    const ul = e.target.closest('[data-unlabel]'); if (ul) { d.labels = (d.labels || []).filter(x => x !== ul.dataset.unlabel); paint(); return; }
    const ah = e.target.closest('[data-addclient]'); if (ah) { if (!clients().length) return toast('Add brands first'); openPicker(ah, { title: 'Label with clients', items: clientItems, selected: () => d.clientIds || [], onChange: v => { d.clientIds = v; paint(); } }); return; }
    const al = e.target.closest('[data-addlabel]'); if (al) { openPicker(al, { title: 'Labels', items: labelItems, selected: () => d.labels || [], onChange: v => { d.labels = v; paint(); }, footer: { label: 'Edit labels…', icon: 'pencil', onClick: () => openSettings() } }); }
  });
}
// After a task is saved from the details dialog: log what changed, notify a new assignee.
function afterTaskSave(ex, d) {
  const b = d.briefId ? S.data.briefs[d.briefId] : null, hs = b ? b.clientIds || [] : clientIdsOf(d), kind = d.briefId ? 'step' : 'task';
  if (!ex) { if (!d.briefId) logAct('task_created', { kind, taskId: d.id, clientIds: hs, title: d.title }); if (d.assignee) notifyTask(d); return; }
  if ((ex.assignee || null) !== (d.assignee || null)) {
    logAct(d.briefId ? 'step_assigned' : 'task_assigned', { kind, briefId: d.briefId, taskId: d.id, clientIds: hs, title: d.title, from: ex.assignee ? personName(ex.assignee) : '-', to: d.assignee ? personName(d.assignee) : '-' });
    if (d.assignee) { if (b) notifySteps(b, d.assignee, [d]); else notifyTask(d); }
  }
  if ((ex.due || null) !== (d.due || null)) logAct(d.briefId ? 'step_due' : 'task_due', { kind, briefId: d.briefId, taskId: d.id, clientIds: hs, title: d.title, from: ex.due ? fmtDay(ex.due) : '-', to: d.due ? fmtDay(d.due) : '-' });
  if (d.briefId && (ex.status || 'To do') !== (d.status || 'To do')) setStepStatus({ ...ex, ...d, status: ex.status }, d.status);
}
function notifyTask(t) {
  const hs = clientIdsOf(t).map(clientName);
  const heading = `Task for you: ${t.title}`;
  return notify(t.assignee, { kind: 'task', title: heading, body: hs.join(', '), link: hs.length ? `#/client/${clientIdsOf(t)[0]}` : '#/mywork', taskId: t.id,
    email: { subject: heading, html: emailHTML({ heading, intro: `${me()} assigned you a task.`, rows: [['Brands', hs.join(', ')], ['Due', t.due ? longDay(t.due) : '']], cta: 'Open My work', link: '#/mywork' }), text: `${heading}\n${hs.join(', ')}\n${appLink('#/mywork')}` } });
}

/* =====================================================================
   WIRING - actions, filters and search boxes for the views above.
   ===================================================================== */
Object.assign(ACTIONS, {
  'cl-add': () => openClientForm(null),
  'cl-edit': a => openClientForm(a.dataset.id),
  'cl-import': () => openClientImport(),
  'cl-export': () => exportClients(),
  'cl-menu': a => clientMenu(a, a.dataset.id),
  'cl-pin': a => { const h = S.data.projects[a.dataset.id]; if (h) store.update('projects', h.id, { pinned: !h.pinned }); },
  'cl-tab': a => { S.cl.tab = a.dataset.t; S.inlineAdd = null; render({ mainOnly: true }); },
  'cl-clear': () => { Object.assign(S.cl, { q: '', sector: 'All', parent: 'All' }); render({ mainOnly: true }); },
  'cl-add-camp': a => openCampaignForm(null, undefined, { clientIds: [a.dataset.id] }),
  'br-new': a => openBriefForm(null, a.dataset.client ? { clientIds: [a.dataset.client] } : {}),
  'br-edit': a => openBriefForm(a.dataset.id),
  'br-team': a => openTeamModal(a.dataset.id),
  'br-kickoff': a => { const b = S.data.briefs[a.dataset.id]; if (b && !(b.team || []).length && !b.ownerId) return openTeamModal(b.id); openKickoff(a.dataset.id); },
  'br-submit': async a => { const b = S.data.briefs[a.dataset.id]; if (!b) return; if (!b.goLive) { toast('Add the go-live date first'); return openBriefForm(b.id); } await setBriefStatus(b, 'Submitted'); setTimeout(() => openTeamModal(b.id), 200); },
  'br-complete': a => setBriefStatus(S.data.briefs[a.dataset.id], 'Completed'),
  'br-status': (a, e) => { e && e.stopPropagation(); briefStatusMenu(a, a.dataset.id); },
  'br-menu': a => briefMenu(a, a.dataset.id),
  'br-archive': a => archiveBrief(a.dataset.id, !S.data.briefs[a.dataset.id].archived),
  'br-layout': a => { S.br.layout = a.dataset.v; lsSet('tb:brLayout', a.dataset.v); render({ mainOnly: true }); },
  'br-export': () => exportBriefs(),
  'br-add-camp': a => { const b = S.data.briefs[a.dataset.id]; openCampaignForm(null, undefined, { briefId: b.id, clientIds: b.clientIds || [], name: b.title, startDate: b.flightStart || todayKey(), endDate: b.flightEnd || addDays(todayKey(), 30), markets: b.markets || [], platforms: (b.platforms || []).filter(p => PLATFORMS.includes(p)) }); },
  'st-status': a => stepStatusMenu(a, a.dataset.id),
  'st-assign': a => stepAssignMenu(a, a.dataset.id),
  'st-due': a => { const t = S.data.tasks[a.dataset.id]; if (t) stepDue(t); },
  'st-add': a => addStep(a.dataset.id),
  'st-start': a => { const t = S.data.tasks[a.dataset.id]; if (t) setStepStatus(t, 'In progress'); },
  'notif-open': a => openNotifPanel(a),
  'al-scope': a => { S.al.scope = a.dataset.v; lsSet('tb:alScope', a.dataset.v); render(); },
  'tx-label': a => { S.tx.label = S.tx.label === a.dataset.id ? 'All' : a.dataset.id; render({ mainOnly: true }); },
  'tx-export': () => exportTasks(),
  'av-export': () => exportActivity(),
});
document.addEventListener('change', e => {
  const t = e.target, ds = t.dataset || {};
  if (ds.aof) { S.ao[ds.aof] = t.value; if (ds.aof === 'sort') lsSet('tb:aoSort', t.value); return render({ mainOnly: true }); }
  if ('aoarch' in ds) { S.ao.archived = t.checked; return render({ mainOnly: true }); }
  if (ds.clf) { S.cl[ds.clf] = t.value; if (ds.clf === 'sort') lsSet('tb:clSort', t.value); if (ds.clf === 'group') lsSet('tb:clGroup', t.value); return render({ mainOnly: true }); }
  if (ds.brf) { S.br[ds.brf] = t.value; return render({ mainOnly: true }); }
  if (ds.txf) { S.tx[ds.txf] = t.value; if (ds.txf === 'group') lsSet('tb:txGroup', t.value); return render({ mainOnly: true }); }
  if (ds.avf) { S.av[ds.avf] = t.value; return render({ mainOnly: true }); }
  if (ds.alf) { S.al[ds.alf] = t.value; return render({ mainOnly: true }); }
});
document.addEventListener('input', e => {
  const id = e.target.id, map = { 'cl-q': S.cl, 'br-q': S.br, 'tx-q': S.tx, 'av-q': S.av, 'ao-q': S.ao };
  if (!map[id]) return;
  map[id].q = e.target.value;
  clearTimeout(S.rtTimer); S.rtTimer = setTimeout(() => render({ mainOnly: true }), 140);
});

/* ===================== boot, seeding & sign-in ===================== */
let seeded = false;
async function ensureSeed() {
  if (seeded || !store || (store.isFresh && !store.isFresh())) return;
  if (!canEditAcc()) { seeded = true; return; }      // viewers never write
  seeded = true;
  await ensureSys();
  if (S.data.meta.settings) { addMeToTeam(); return; }
  const now = Date.now();
  const ops = [{ type: 'put', col: 'meta', data: { id: 'settings', people: [], types: DEFAULT_TYPES, labels: DEFAULT_LABELS, roles: DEFAULT_ROLES, sectors: DEFAULT_SECTORS,
    clientSections: DEFAULT_CLIENT_SECTIONS, workflows: DEFAULT_WORKFLOWS, alerts: { dueSoonDays: 1, stallFactor: 1.5, unopenedHours: 24, kickoffHours: 24 }, createdAt: now } }];
  // a new account starts with one list and a Campaign Tracker account named after the client
  if (!Object.values(S.data.projects).some(isList)) ops.push({ type: 'put', col: 'projects', data: { id: uid(), name: 'To-Do', color: 'red', description: '', order: 1000, createdAt: now } });
  if (S.acc && !Object.keys(S.data.accounts).length) ops.push({ type: 'put', col: 'accounts', data: { id: uid(), name: S.acc.name, order: 500, archived: false, createdAt: now, createdBy: me() } });
  await store.batch(ops);
  addMeToTeam();
}
// Whoever was given access directly or through a team joins the account's team list the first time they open it,
// so My work, assignments and notifications work straight away. (Business admins just browsing don't.)
async function addMeToTeam() {
  const em = userEmail(); if (!S.acc || !em || !S.data.meta.settings || personByEmail(em)) return;
  const r = (S.acc.roles || {})[em]; if (roleRank(r) < 2) return;
  const m = S.biz.members[em] || {};
  await saveSettings({ people: [...people(), { id: uid(), name: m.name || (S.user && S.user.name) || em.split('@')[0], email: em, role: rolesList().includes(m.jobRole) ? m.jobRole : '', color: m.color || 'red' }] });
}
function onData() {
  S.ready = true;
  S.dataVer = (S.dataVer || 0) + 1;     // lets the alerts cache know something changed
  scheduleRender();
  ensureSeed();
  queueStats();
  setTimeout(alertSweep, 1500);
  ctMaintenance();          // auto-end finished campaigns, tidy contradictory statuses, empty old trash
}

/* ===================== logo ===================== */
// The dentsu wordmark (from the dentsu template), drawn in the current text colour.
const DENTSU_D = 'M8.4 3.6 8.4 6.5 6.6 6.5C1.1 6.5 0 10.6 0 13.5 0 16.4 0.7 17.5 1.8 18.7 2.8 19.8 4.2 20.3 5.7 20.3 7.2 20.3 7.6 20.1 8.4 19.7L8.4 20 12 20 12 3.6 8.4 3.6ZM3.4 13.4C3.4 12 3.8 9.7 6.4 9.5 6.8 9.5 7.7 9.5 8.4 9.4L8.4 16.6C7.9 16.9 7.2 17.2 6.4 17.2 5.6 17.2 4.9 17 4.4 16.5 3.8 15.9 3.5 14.9 3.5 13.4 M21.4 17.2C19.5 17.2 18.4 16.1 18.1 14.3L26.8 14.3C26.8 12.9 26.8 11.9 26.8 11.4 26.7 9.9 26.1 8.5 25.2 7.6 24.2 6.6 22.7 6.1 20.9 6.1 19.1 6.1 17.1 6.9 15.9 8.3 14.9 9.6 14.3 11.4 14.3 13.4 14.3 16.7 16.2 20.3 21.5 20.3 26.8 20.3 25.5 19.7 26.6 19.1L26.6 15.8C26 16.1 24 17.2 21.4 17.1M20.9 9.2C22.2 9.2 23.2 10.1 23.3 11.3L18.2 11.3C18.6 10 19.5 9.2 20.9 9.2 M37.8 12 37.8 20 41.4 20 41.4 11.4C41.4 7.8 39.7 6.1 36.3 6.1 32.9 6.1 33.8 6.5 33.3 6.7L33.3 6.4 29.7 6.4 29.7 20 33.3 20 33.3 9.8C34.1 9.3 35.3 9.1 36.3 9.3 37.3 9.5 37.7 10.1 37.7 11.9 M72 14.5 72 6.5 68.4 6.5 68.4 15.1C68.4 18.7 70.1 20.4 73.5 20.4 76.9 20.4 76 20 76.5 19.8L76.5 20.1 80.1 20.1 80.1 6.5 76.5 6.5 76.5 16.7C75.7 17.2 74.5 17.4 73.5 17.2 72.5 17 72.1 16.4 72.1 14.6 M44.4 3.6 44.4 15.4C44.4 17 44.7 18.2 45.3 19 46 19.9 47.2 20.4 48.8 20.4 50.4 20.4 51.4 20.1 52.2 19.9L52.2 16.6C51.7 16.7 50.3 17 49.5 17 48.7 17 48.6 16.9 48.4 16.7 48.1 16.4 48.1 15.8 48.1 15.2L48.1 9.5C49.5 9.5 51.3 9.6 52.3 9.7L52.3 6.5 48.1 6.5 48.1 3.6 44.5 3.6Z M65.3 13.5C64.6 12.5 63.5 12 61.4 11.6 60.5 11.4 59.5 11.3 59 10.9 58.7 10.7 58.6 10.5 58.6 10.3 58.6 10.1 58.8 9.8 59 9.7 59.5 9.4 60.5 9.3 61.9 9.5 63.3 9.8 64.8 10.3 65.3 10.5L65.3 7.2C63.6 6.4 62.1 6 60.5 6.1 58.9 6.1 57.6 6.5 56.6 7.3 55.6 8.1 55 9.2 54.9 10.6 54.8 12.8 56.2 14.2 59.5 14.8 60.2 14.9 61.2 15.1 61.6 15.3 62 15.5 62.3 15.8 62.3 16.1 62.3 16.4 62.1 16.7 61.7 16.8 61.1 17.1 60.1 17 59.5 17 57.6 16.8 55.9 16.2 55.2 15.9L55.2 19.3C56.3 19.9 58 20.5 60.1 20.5 62.5 20.5 65.4 19.8 65.9 16.6 66.1 15.4 65.9 14.4 65.3 13.6';
function logoMark(cls = '') { return `<svg class="mark dentsu-mark ${cls}" viewBox="-0.2 3.2 80.6 17.6" role="img" aria-label="dentsu"><path fill="currentColor" d="${DENTSU_D}"/></svg>`; }
const wordmark = () => `<span class="wordmark">${esc(CFG.appName || 'Ads Workspace')}</span>`;
/* =====================================================================
   ACCOUNTS - one platform, many client accounts (like an ads manager).
   Business level: people (who can sign in), teams and accounts.
   Each account keeps its own data (lists, briefs, campaigns, notes…), its
   own tools on/off and its own logo. Access is Admin / Editor / Viewer,
   given to whole teams, to everyone in the business, or to one person.
   Cloud: members/{email}, teams/{id}, workspaces/{accountId} (+ its data
   under workspaces/{accountId}/…). Local mode keeps the same shape in
   this browser.
   ===================================================================== */
const ACC_ROLES = ['admin', 'editor', 'viewer'];
const ACC_ROLE_LABEL = { admin: 'Admin', editor: 'Editor', viewer: 'Viewer' };
const ACC_ROLE_HELP = { admin: 'Everything, plus the account’s tools, logo and access', editor: 'Works on everything in the account', viewer: 'Sees everything, changes nothing' };
const roleRank = r => ({ admin: 3, editor: 2, viewer: 1 })[r] || 0;
const TOOLS = [
  ['mywork', 'My work', 'inbox', 'Everything assigned to you in this account'],
  ['lists', 'Task lists', 'check', 'Project lists and boards, Today and Upcoming'],
  ['calendar', 'Team calendar', 'cal', 'Leave, remote days and events on Upcoming'],
  ['briefs', 'Briefs & workflow', 'brief', 'Briefing template, team, steps, SLAs and go-live'],
  ['brands', 'Brands', 'client', 'Brands, markets or dealers inside the account, each with a board'],
  ['tasks', 'All tasks & labels', 'tag', 'Every task in one filterable list'],
  ['campaigns', 'Campaign Tracker', 'campaign', 'Live campaigns, pacing and weekly checks'],
  ['alerts', 'Alerts', 'bell', 'Late, stuck and at-risk work'],
  ['dashboard', 'Dashboard', 'chart', 'Process, brand, campaign and task dashboards'],
  ['activity', 'Activity log', 'history', 'Who did what, and when'],
  ['notes', 'Notebook', 'notebook', 'Meeting notes, plans and docs'],
];
const TOOL_OF_VIEW = { mywork: 'mywork', today: 'lists', upcoming: 'lists', project: 'lists', alerts: 'alerts', dashboard: 'dashboard', briefs: 'briefs', brief: 'briefs',
  clients: 'brands', client: 'brands', tasks: 'tasks', campaigns: 'campaigns', activity: 'activity', notes: 'notes' };
const toolOn = k => !k || !S.acc || !S.acc.modules || S.acc.modules[k] !== false;
// New accounts start with the essentials; the rest are one switch away.
const TOOL_ESSENTIALS = ['mywork', 'lists', 'briefs', 'campaigns', 'alerts', 'dashboard'];
const presetModules = all => Object.fromEntries(TOOLS.map(t => [t[0], all || TOOL_ESSENTIALS.includes(t[0])]));
const toolName = k => (TOOLS.find(t => t[0] === k) || [k, k])[1];

/* ---------- business state ---------- */
const userEmail = () => (S.user && S.user.email) || '';
const bizMembers = () => Object.values(S.biz.members).sort((a, b) => String(a.name || a.id).localeCompare(String(b.name || b.id)));
const bizTeams = () => Object.values(S.biz.teams).sort((a, b) => String(a.name).localeCompare(String(b.name)));
const allAccounts = withArchived => Object.values(S.biz.accounts).filter(a => withArchived || !a.archived).sort((a, b) => String(a.name).localeCompare(String(b.name)));
const memberName = em => (S.biz.members[em] && S.biz.members[em].name) || em;
// Business roles: owners (the first owner is ownerEmail in config.js, and owners can add more), admins, members.
const BIZ_ROLES = [['member', 'Member'], ['admin', 'Admin'], ['owner', 'Owner']];
const isOwnerEmail = em => !!em && (em === (S.biz.owner || String(CFG.ownerEmail || '').toLowerCase()) || (S.biz.members[em] || {}).bizRole === 'owner');
const isFirstOwner = em => !!em && em === (S.biz.owner || String(CFG.ownerEmail || '').toLowerCase());
const isOwnerUser = () => !!S.user && (S.user.isOwner || isOwnerEmail(userEmail()));
const isBizAdmin = () => {
  if (!S.user) return false;
  if (isOwnerUser()) return true;
  const m = S.biz.members[userEmail()]; return !!(m && m.bizRole === 'admin');
};
const accRoleOf = (a, em) => {
  if (!a) return null;
  const mine = !em || em === userEmail();
  if (mine && isBizAdmin()) return 'admin';
  return (a.roles || {})[em || userEmail()] || null;
};
const myAccounts = withArchived => allAccounts(withArchived).filter(a => accRoleOf(a));
const canEditAcc = () => roleRank(S.accRole) >= 2;
const canAdminAcc = () => S.accRole === 'admin';
const accKey = () => 'tb:acc:' + userEmail();

// Who gets what: the strongest role a person has through everyone-access, their teams or a direct grant.
/* ---------- sub-accounts: an account can sit under another (GM → GM Cadillac → Al Ghanim Cadillac) ---------- */
const ACC_KINDS = [['brand', 'Brand'], ['dealer', 'Dealer'], ['market', 'Market'], ['unit', 'Business unit']];
const kindLabel = k => (ACC_KINDS.find(x => x[0] === k) || [])[1] || '';
// the chain above an account, nearest first (stops at missing parents and loops)
function accAncestors(a, accounts = S.biz.accounts) {
  const out = [], seen = new Set([a && a.id]);
  let p = a && a.parentId ? accounts[a.parentId] : null;
  while (p && !seen.has(p.id) && out.length < 6) { out.push(p); seen.add(p.id); p = p.parentId ? accounts[p.parentId] : null; }
  return out;
}
const accChildren = (id, withArchived = true) => Object.values(S.biz.accounts).filter(a => a.parentId === id && (withArchived || !a.archived)).sort((x, y) => String(x.name).localeCompare(String(y.name)));
function accDescendants(id) { const out = []; const walk = pid => accChildren(pid).forEach(c => { if (!out.includes(c) && c.id !== id) { out.push(c); walk(c.id); } }); walk(id); return out; }
const accPath = a => [...accAncestors(a).reverse(), a].map(x => x.name).join(' › ');
// accounts in tree order: each parent followed by its sub-accounts (a child whose parent isn't in the list stands on its own)
function accTree(list) {
  const ids = new Set(list.map(a => a.id)), byParent = {};
  list.forEach(a => { const p = a.parentId && ids.has(a.parentId) ? a.parentId : ''; (byParent[p] = byParent[p] || []).push(a); });
  const out = [], seen = new Set();
  const walk = (pid, depth) => (byParent[pid] || []).sort((x, y) => String(x.name).localeCompare(String(y.name))).forEach(a => { if (seen.has(a.id)) return; seen.add(a.id); out.push({ a, depth }); walk(a.id, depth + 1); });
  walk('', 0);
  list.forEach(a => { if (!seen.has(a.id)) out.push({ a, depth: 0 }); });   // loops, just in case
  return out;
}
// "GM Chevrolet", "Al Ghanim Cadillac (Dealer)" - brands read fine on their own
const accLabel = a => a.name + (a.parentId && a.kind && a.kind !== 'brand' ? ` (${kindLabel(a.kind)})` : '');
const accSelectOptions = (list, sel = '') => accTree(list).map(({ a, depth }) => `<option value="${esc(a.id)}" ${sel === a.id ? 'selected' : ''}>${'\u00a0'.repeat(depth * 4)}${depth ? '↳ ' : ''}${esc(accLabel(a))}</option>`).join('');

// Who can open an account: its own teams and people, plus everyone with access to the accounts above it.
function computeAccess(a, members = S.biz.members, teams = S.biz.teams, accounts = S.biz.accounts) {
  const roles = {};
  const bump = (em, r) => { em = String(em || '').toLowerCase(); if (!em || !ACC_ROLES.includes(r)) return; if (roleRank(r) > roleRank(roles[em])) roles[em] = r; };
  [a, ...accAncestors(a, accounts)].forEach(x => {
    const acc = x.access || {};
    Object.entries(acc.teams || {}).forEach(([tid, r]) => {
      if (tid === '*') Object.keys(members).forEach(em => bump(em, r));
      else if (teams[tid]) (teams[tid].memberEmails || []).forEach(em => bump(em, r));
    });
    Object.entries(acc.people || {}).forEach(([em, r]) => bump(em, r));
  });
  const sorted = {}; Object.keys(roles).sort().forEach(k => sorted[k] = roles[k]);
  return { roles: sorted, memberEmails: Object.keys(sorted) };
}
async function syncAccess(ids) {
  const list = ids ? [...new Set(ids.flatMap(id => [id, ...accDescendants(id).map(d => d.id)]))].map(id => S.biz.accounts[id]).filter(Boolean) : allAccounts(true);
  for (const a of list) {
    const { roles, memberEmails } = computeAccess(a);
    if (JSON.stringify(roles) !== JSON.stringify(a.roles || {})) await bizApi.patchAccount(a.id, { roles, memberEmails });
  }
}
// How a person gets into an account, for the access lists ("Automotive team", "Direct", "Everyone").
function accessVia(a, em) {
  const out = [];
  [a, ...accAncestors(a)].forEach((x, i) => {
    const acc = x.access || {}, from = i ? ` (from ${x.name})` : '';
    Object.entries(acc.teams || {}).forEach(([tid, r]) => {
      if (tid === '*') out.push(`Everyone · ${ACC_ROLE_LABEL[r]}${from}`);
      else if (S.biz.teams[tid] && (S.biz.teams[tid].memberEmails || []).includes(em)) out.push(`${S.biz.teams[tid].name} · ${ACC_ROLE_LABEL[r]}${from}`);
    });
    if ((acc.people || {})[em]) out.push(`Direct · ${ACC_ROLE_LABEL[acc.people[em]]}${from}`);
  });
  return out;
}

/* ---------- storage: local (this browser) or Firestore ---------- */
let bizApi = null;
const BIZ_KEY = 'tb:biz:v1';
function loadBizLocal() {
  let d = {}; try { d = JSON.parse(lsGet(BIZ_KEY) || '{}'); } catch { }
  return { members: d.members || {}, teams: d.teams || {}, accounts: d.accounts || {}, owner: d.owner || '', ready: true };
}
function saveBizLocal() { lsSet(BIZ_KEY, JSON.stringify({ members: S.biz.members, teams: S.biz.teams, accounts: S.biz.accounts, owner: S.biz.owner })); }
const localBizApi = {
  async putMember(m) { S.biz.members[m.id] = clone(m); saveBizLocal(); bizChanged(); },
  async delMember(em) { delete S.biz.members[em]; saveBizLocal(); bizChanged(); },
  async putTeam(t) { S.biz.teams[t.id] = clone(t); saveBizLocal(); bizChanged(); },
  async delTeam(id) { delete S.biz.teams[id]; saveBizLocal(); bizChanged(); },
  async putAccount(a) { S.biz.accounts[a.id] = clone(a); saveBizLocal(); bizChanged(); },
  async patchAccount(id, f, quiet) { if (!S.biz.accounts[id]) return; Object.assign(S.biz.accounts[id], clone(f)); saveBizLocal(); if (!quiet) bizChanged(); },
  async delAccount(id) { delete S.biz.accounts[id]; saveBizLocal(); try { localStorage.removeItem(LS + 'tb:data:v1:' + id); } catch { } bizChanged(); },
  // write a set of operations into an account that isn't open (sample data)
  async writeAccount(id, ops, acts = []) {
    if (S.acc && S.acc.id === id && store && !store.readOnly) { await store.batch(ops); for (const e of acts) await store.log(e); return; }
    let d = {}; try { d = JSON.parse(lsGet('tb:data:v1:' + id) || '{}'); } catch { }
    COLS.forEach(c => { d[c] = d[c] || {}; });
    ops.forEach(o => { if (o.type === 'put') d[o.col][o.data.id] = clone(o.data); else if (o.type === 'del') delete d[o.col][o.id]; else if (o.type === 'update' && d[o.col][o.id]) Object.assign(d[o.col][o.id], clone(o.data)); });
    acts.forEach(e => { d.activity[e.id] = clone(e); });
    lsSet('tb:data:v1:' + id, JSON.stringify(d));
  },
};

// Called whenever people, teams or accounts change (either mode).
function bizChanged() {
  if (S.acc) {
    const fresh = S.biz.accounts[S.acc.id];
    const role = accRoleOf(fresh);
    if (!fresh || !role || fresh.archived) { toast(`You no longer have access to ${S.acc.name}`); S.acc = null; openBestAccount(); return; }
    const before = S.accRole; S.acc = fresh; S.ws = fresh; S.accRole = role;
    if ((before === 'viewer') !== (role === 'viewer')) { openAccount(fresh, location.hash); return; }   // the store has to switch between read-only and normal
  }
  if (S.ready) scheduleRender();
}
function openBestAccount() {
  const mine = myAccounts();
  const want = new URLSearchParams(location.search).get('a') || lsGet(accKey());
  const pick = mine.find(a => a.id === want) || mine[0];
  if (pick) return openAccount(pick, /^#\/(accounts|business|guide|home)/.test(location.hash) ? location.hash : null);
  // no account to open: the business pages still work (create one, or wait for access)
  if (store && store.stop) store.stop();
  store = null; S.acc = null; S.ws = null; S.accRole = null;
  COLS.forEach(c => { S.data[c] = {}; });
  S.ready = true;
  if (!/^#\/(accounts|business)/.test(location.hash)) location.hash = '#/accounts'; else render();
}
const ACC_VIEWS = ['mywork', 'today', 'upcoming', 'alerts', 'dashboard', 'briefs', 'clients', 'tasks', 'campaigns', 'activity', 'notes', 'archive', 'trash'];
function openAccount(a, hash) {
  if (!a) return;
  if (store && store.stop) store.stop();
  COLS.forEach(c => { S.data[c] = {}; });
  S.missing = new Set(); S.rulesMissing = false; seeded = false; ctMaintRun = 0; UNDO.length = 0; S.dataVer = (S.dataVer || 0) + 1;
  $('#modals').innerHTML = ''; closeMenu();
  const prev = S.acc;
  S.acc = a; S.ws = a; S.accRole = accRoleOf(a);
  lsSet(accKey(), a.id);
  if (new URLSearchParams(location.search).get('a')) history.replaceState(null, '', location.pathname + location.hash);
  // keep the same section when switching accounts (Briefs → Briefs), unless it's a single item or switched off there
  if (!hash) {
    const v = location.hash.replace(/^#\/?/, '').split('/')[0] || '';
    if (prev && prev.id !== a.id) hash = ACC_VIEWS.includes(v) && toolOn(TOOL_OF_VIEW[v]) ? '#/' + v : '#/' + defaultView();
    else hash = v && !/^(accounts|business)$/.test(v) ? location.hash : '#/' + defaultView();
  }
  if (hash && hash !== location.hash) history.replaceState(null, '', location.pathname + location.search + hash);
  S.ready = false;
  let st = S.mode === 'local' ? new LocalStore(a.id) : S.makeStore(a);
  if (S.accRole === 'viewer') st = readOnlyStore(st);
  store = st;
  $('#root').innerHTML = `<div class="loading">${accLogo(a, 'lg')}<span>Opening ${esc(a.name)}…</span></div>`;
  const mine = store;
  store.start(onData, err => {
    console.error(err);
    if (store !== mine) return;
    toast(err && err.code === 'permission-denied' ? `You don't have access to ${a.name} any more` : 'Sync error: ' + (err.code || err.message));
    S.acc = null; openBestAccount();
  });
}
const defaultView = () => (toolOn('mywork') ? 'mywork' : toolOn('dashboard') ? 'dashboard' : toolOn('lists') ? 'today' : toolOn('briefs') ? 'briefs' : 'activity');
// Viewers can look at everything but not change it (the security rules say the same).
function readOnlyStore(st) {
  const ok = (k, col) => col === 'notifs' || (k === 'log');
  return new Proxy(st, { get(t, k) {
    if (k === 'readOnly') return true;
    if (['put', 'update', 'del', 'batch'].includes(k)) return (...args) => (ok(k, args[0]) ? t[k](...args) : (toast('You have view-only access to this account'), Promise.resolve()));
    const v = t[k]; return typeof v === 'function' ? v.bind(t) : v;
  } });
}
async function switchAccount(id, hash) {
  const a = S.biz.accounts[id]; if (!a || !accRoleOf(a)) return;
  if (S.acc && S.acc.id === id) { if (hash) go(hash); return; }
  openAccount(a, hash);
}

/* ---------- the numbers on the All accounts page ---------- */
function accountStats() {
  const t = todayKey(), tasks = activeTasks();
  const al = computeAlerts();
  return { open: tasks.length, overdue: tasks.filter(x => x.due && x.due < t).length, briefs: activeBriefs().length,
    risk: new Set(al.filter(x => x.kind === 'golive_risk' || x.kind === 'golive_missed').map(x => x.briefId)).size,
    live: Object.values(S.data.campaigns).filter(c => !c.archived && c.status === 'Live').length,
    alerts: al.length, crit: al.filter(x => x.sev === 'crit').length, at: Date.now() };
}
let statsT = 0;
function queueStats() { clearTimeout(statsT); statsT = setTimeout(pushStats, 2500); }
function pushStats() {
  if (!S.acc || !S.ready || !bizApi) return;
  const st = accountStats(), prev = S.acc.stats || {};
  const same = Object.keys(st).every(k => k === 'at' || st[k] === prev[k]);
  if (same && Date.now() - (prev.at || 0) < 6 * 36e5) return;
  bizApi.patchAccount(S.acc.id, { stats: st }, true).catch(() => { });
}

/* ---------- pieces ---------- */
function accLogo(a, cls = '') {
  if (!a) return '';
  if (a.logo && /^data:image\/(png|jpeg|webp|svg\+xml)[;,]/.test(a.logo)) return `<span class="acc-logo img ${cls}"><img src="${esc(a.logo)}" alt=""></span>`;
  return `<span class="acc-logo ${cls} sw-${esc(a.color || 'grey')}">${esc(initials(a.name))}</span>`;
}
const roleTag = r => (r ? `<span class="role-tag r-${esc(r)}">${esc(ACC_ROLE_LABEL[r] || r)}</span>` : '');
function accSwitcherHTML() {
  const a = S.acc;
  return `<button class="acc-switch" data-action="acc-menu" aria-haspopup="true" title="Switch account">
    ${a ? accLogo(a) : `<span class="acc-logo sw-grey">${ico('grid', 'i-sm')}</span>`}
    <span class="acc-sw-txt"><small>${a ? esc(accAncestors(a).map(p => p.name).reverse().join(' › ') || 'Account') : 'Business'}</small><b>${esc(a ? a.name : 'All accounts')}</b></span>${ico('down', 'i-sm')}</button>`;
}
function openAccMenu(anchor) {
  closeMenu();
  const m = document.createElement('div'); m.className = 'menu acc-menu';
  let q = '';
  const paint = () => {
    const list = myAccounts().filter(a => !q || `${accPath(a)} ${a.sector || ''} ${kindLabel(a.kind)}`.toLowerCase().includes(q));
    m.innerHTML = `<div class="am-search">${ico('search', 'i-sm')}<input placeholder="Search accounts" value="${esc(q)}" data-amq></div>
      <button class="am-row am-all ${!S.acc || /^#\/accounts/.test(location.hash) ? 'on' : ''}" data-am-go="#/accounts">${ico('grid')}<span><b>All accounts</b><small>${myAccounts().length} account${myAccounts().length === 1 ? '' : 's'} · overview</small></span></button>
      <div class="am-list">${accTree(list).map(({ a, depth }) => { const st = a.stats || {};
        return `<button class="am-row ${S.acc && S.acc.id === a.id ? 'on' : ''} ${depth ? 'sub' : ''}" style="--d:${q ? 0 : depth}" data-am-id="${esc(a.id)}">${accLogo(a)}<span><b>${esc(a.name)}</b><small>${esc([a.parentId ? kindLabel(a.kind) || 'Sub-account' : a.sector, ACC_ROLE_LABEL[accRoleOf(a)]].filter(Boolean).join(' · '))}</small></span>
          ${st.crit ? `<span class="am-badge crit" title="${st.crit} critical alerts">${st.crit}</span>` : st.alerts ? `<span class="am-badge" title="${st.alerts} alerts">${st.alerts}</span>` : ''}${S.acc && S.acc.id === a.id ? ico('check', 'i-sm') : ''}</button>`; }).join('')
        || `<div class="am-empty">${myAccounts().length ? 'No accounts match.' : 'You don’t have access to any accounts yet.'}</div>`}</div>
      <div class="am-foot">${S.acc ? `<button data-am-act="settings">${ico('gear', 'i-sm')} Account settings</button>` : ''}
        ${isBizAdmin() ? `<button data-am-act="create">${ico('plus', 'i-sm')} Create account</button><button data-am-act="business">${ico('people', 'i-sm')} Business settings</button>` : ''}</div>`;
    const inp = m.querySelector('[data-amq]'); inp.focus(); inp.setSelectionRange(q.length, q.length);
  };
  m.addEventListener('mousedown', e => e.stopPropagation());
  m.addEventListener('input', e => { if (e.target.matches('[data-amq]')) { q = e.target.value.trim().toLowerCase(); paint(); } });
  m.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
    if (e.key === 'Enter') { const b = m.querySelector('[data-am-id]'); if (b) { closeMenu(); switchAccount(b.dataset.amId); } }
  });
  m.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; e.stopPropagation();
    closeMenu();
    if (b.dataset.amId) switchAccount(b.dataset.amId);
    else if (b.dataset.amGo) go(b.dataset.amGo);
    else if (b.dataset.amAct === 'settings') openSettings('account');
    else if (b.dataset.amAct === 'create') openAccountForm(null);
    else if (b.dataset.amAct === 'business') go('#/business');
  });
  document.body.appendChild(m); menuEl = m;
  paint(); placeMenu(m, anchor);
}

/* ---------- All accounts ---------- */
const AO_SORTS = [['name', 'Name'], ['attention', 'Needs attention'], ['overdue', 'Most overdue'], ['briefs', 'Most active briefs'], ['live', 'Most live campaigns'], ['updated', 'Recently updated']];
function renderAccounts() {
  const f = S.ao, q = f.q.trim().toLowerCase();
  const all = myAccounts(f.archived);
  const teamsOf = a => Object.keys((a.access || {}).teams || {}).map(t => (t === '*' ? 'Everyone' : (S.biz.teams[t] || {}).name)).filter(Boolean);
  let list = all.filter(a => (f.team === 'All' || Object.keys((a.access || {}).teams || {}).includes(f.team)) && (!q || `${a.name} ${a.sector || ''} ${teamsOf(a).join(' ')}`.toLowerCase().includes(q)));
  const st = a => a.stats || {};
  const by = { name: (a, b) => a.name.localeCompare(b.name), attention: (a, b) => ((st(b).crit || 0) * 3 + (st(b).alerts || 0)) - ((st(a).crit || 0) * 3 + (st(a).alerts || 0)) || a.name.localeCompare(b.name),
    overdue: (a, b) => (st(b).overdue || 0) - (st(a).overdue || 0), briefs: (a, b) => (st(b).briefs || 0) - (st(a).briefs || 0), live: (a, b) => (st(b).live || 0) - (st(a).live || 0), updated: (a, b) => (st(b).at || 0) - (st(a).at || 0) };
  list = list.sort(by[f.sort] || by.name);
  const rows = f.sort === 'name' && !q ? accTree(list) : list.map(a => ({ a, depth: 0 }));
  const sum = k => all.reduce((s, a) => s + (st(a)[k] || 0), 0);
  const n = (v, cls = '') => (v == null ? '<span class="mut">-</span>' : v ? `<span class="${cls}">${fmtN(v)}</span>` : '<span class="mut">0</span>');
  const sel = (key, opts, label) => `<label class="filt ${f[key] !== 'All' && key !== 'sort' ? 'on' : ''}">${label}<select data-aof="${key}">${opts.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${f[key] === v ? 'selected' : ''}>${esc(l)}</option>`; }).join('')}</select></label>`;
  return topbar('Business /') + `<div class="content"><div class="db ao">
    <div class="page-head"><h1>All accounts</h1><div class="page-desc empty" style="cursor:default">${plural(all.length, 'account')} you can open${isBizAdmin() ? ` · ${plural(bizMembers().length, 'person', 'people')} · ${plural(bizTeams().length, 'team')}` : ''}. Numbers update each time someone opens an account.</div></div>
    <div class="db-tiles c4 ao-tiles">
      ${dbTile('Accounts', fmtN(all.length), `${all.filter(a => (st(a).crit || 0) > 0).length} with critical alerts`)}
      ${dbTile('Overdue tasks & steps', fmtN(sum('overdue')), 'across all accounts')}
      ${dbTile('Briefs at risk', fmtN(sum('risk')), `${fmtN(sum('briefs'))} active briefs`)}
      ${dbTile('Live campaigns', fmtN(sum('live')), 'in Campaign Tracker')}
    </div>
    <div class="ct-toolbar">
      <div class="ct-search">${ico('search', 'i-sm')}<input id="ao-q" data-keep value="${esc(f.q)}" placeholder="Search accounts" autocomplete="off"></div>
      ${bizTeams().length ? sel('team', [['All', 'All'], ['*', 'Everyone'], ...bizTeams().map(t => [t.id, t.name])], 'Team') : ''}
      <label class="filt">${ico('sort', 'i-sm')}<select data-aof="sort">${AO_SORTS.map(([v, l]) => `<option value="${v}" ${f.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      ${isBizAdmin() ? `<label class="filt"><input type="checkbox" data-aoarch ${f.archived ? 'checked' : ''}> Archived</label>` : ''}
      <span class="spacer"></span>
      ${isBizAdmin() ? `<button class="btn btn-primary" data-action="acc-create">${ico('plus', 'i-sm')} Create account</button>` : ''}
    </div>
    ${!all.length ? `<div class="ct-empty">${ico('grid')}<br>${isBizAdmin() ? 'No accounts yet.<br><br><button class="btn btn-primary" data-action="acc-create">Create the first account</button>' : 'You don’t have access to any accounts yet.<br>Ask a business admin to add you to a team or an account.'}</div>`
      : !list.length ? '<div class="ct-empty">No accounts match.</div>'
      : `<div class="tbl-wrap"><table class="tbl ao-table"><thead><tr><th>Account</th><th>Your access</th><th>Teams</th><th class="num">Open tasks</th><th class="num">Overdue</th><th class="num">Active briefs</th><th class="num">At risk</th><th class="num">Live campaigns</th><th class="num">Alerts</th><th>Updated</th><th></th></tr></thead><tbody>
      ${rows.map(({ a, depth }) => { const s = a.stats; return `<tr data-action="acc-open" data-id="${esc(a.id)}" class="${S.acc && S.acc.id === a.id ? 'cur' : ''} ${a.archived ? 'mut' : ''} ${depth ? 'ao-sub' : ''}">
        <td><div class="ao-name" style="--d:${depth}">${depth ? '<span class="ao-branch" aria-hidden="true"></span>' : ''}${accLogo(a)}<span><b>${esc(a.name)}</b><small>${esc(a.parentId ? [kindLabel(a.kind) || 'Sub-account', depth ? '' : accAncestors(a).map(p => p.name).reverse().join(' › ')].filter(Boolean).join(' · ') : a.sector || '')}${a.archived ? ' · archived' : ''}</small></span></div></td>
        <td>${roleTag(accRoleOf(a))}</td>
        <td class="ao-teams" title="${esc(teamsOf(a).join(', '))}">${teamsOf(a).slice(0, 2).map(t => `<span class="tag">${esc(t)}</span>`).join('')}${teamsOf(a).length > 2 ? `<span class="tag more">+${teamsOf(a).length - 2}</span>` : ''}${teamsOf(a).length ? '' : a.parentId && accAncestors(a).length ? `<span class="tag inh">${ico('flow', 'i-xs')} from ${esc(accAncestors(a)[0].name)}</span>` : '<span class="mut">Direct only</span>'}</td>
        <td class="num">${n(s && s.open)}</td><td class="num">${n(s && s.overdue, 'tx-over')}</td><td class="num">${n(s && s.briefs)}</td><td class="num">${n(s && s.risk, 'tx-over')}</td><td class="num">${n(s && s.live)}</td>
        <td class="num">${s ? (s.alerts ? `<span class="al-pill ${s.crit ? 'crit' : ''}" title="${s.crit || 0} critical · ${s.alerts - (s.crit || 0)} warnings">${s.alerts}</span>` : '<span class="mut">0</span>') : '<span class="mut">-</span>'}</td>
        <td class="mut">${s && s.at ? esc(timeAgo(s.at)) : 'not opened yet'}</td>
        <td>${accRoleOf(a) === 'admin' ? `<button class="icon-btn" data-action="acc-row-menu" data-id="${esc(a.id)}" title="More">${ico('dots')}</button>` : ''}</td></tr>`; }).join('')}
      </tbody></table></div>`}
  </div></div>`;
}
function accRowMenu(anchor, id) {
  const a = S.biz.accounts[id]; if (!a) return;
  openMenu(anchor, [
    { label: 'Open', icon: 'right', onClick: () => switchAccount(id) },
    { label: 'Edit name, logo & tools', icon: 'pencil', onClick: () => openAccountForm(id) },
    { label: 'Access', icon: 'people', onClick: () => openAccessModal(id) },
    ...(isBizAdmin() ? [{ label: 'Add a sub-account', icon: 'plus', onClick: () => openAccountForm(null, id) }] : []),
    ...(isBizAdmin() ? ['-', { label: a.archived ? 'Restore account' : 'Archive account', icon: 'archive', onClick: () => archiveAccount(id, !a.archived) },
      { label: 'Delete account', icon: 'trash', danger: true, onClick: () => deleteAccount(id) }] : []),
  ], 'right');
}
async function archiveAccount(id, on) {
  const a = S.biz.accounts[id]; if (!a) return;
  const subs = accDescendants(id);
  if (on && !await confirmBox(`Archive <b>${esc(a.name)}</b>${subs.length ? ` and its ${plural(subs.length, 'sub-account')}` : ''}? ${subs.length ? 'They disappear' : 'It disappears'} from everyone's switcher; the data is kept and you can restore it from All accounts → Archived.`, 'Archive', 'Archive account')) return;
  for (const x of [a, ...subs]) await bizApi.patchAccount(x.id, { archived: on, updatedAt: Date.now() });
  audit(on ? 'account_archived' : 'account_restored', a.name);
  toast(on ? `${a.name} archived` : `${a.name} restored`);
}
async function deleteAccount(id) {
  const a = S.biz.accounts[id]; if (!a) return;
  const subs = accChildren(id);
  if (subs.length) return toast(`${a.name} has ${plural(subs.length, 'sub-account')}. Move or delete ${subs.length === 1 ? 'it' : 'them'} first.`);
  const r = await promptBox({ title: 'Delete account', label: `This removes ${a.name} and everything in it for everyone. Type the account name to confirm.`, placeholder: a.name, ok: 'Delete' });
  if (!r || r.value.trim() !== a.name) { if (r) toast('The name didn’t match - nothing was deleted'); return; }
  if (S.acc && S.acc.id === id) { S.acc = null; }
  await wipeAccount(a);
  audit('account_deleted', a.name);
  toast(`${a.name} deleted`);
  if (!S.acc) openBestAccount();
}
async function wipeAccount(a) {
  if (S.mode === 'cloud' && S.wipeAccountData) await S.wipeAccountData(a.id);
  await bizApi.delAccount(a.id);
}

/* ---------- create / edit an account ---------- */
async function readLogo(file) {
  // any image (PNG, JPG, SVG, WebP) → a 160px square PNG, small enough to live on the account itself
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const c = document.createElement('canvas'); c.width = c.height = 160; const x = c.getContext('2d');
    const w = img.naturalWidth || 160, h = img.naturalHeight || 160, k = Math.min(140 / w, 140 / h);
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, 160, 160);
    x.drawImage(img, (160 - w * k) / 2, (160 - h * k) / 2, w * k, h * k);
    const out = c.toDataURL('image/png');
    if (out.length > 150000) throw new Error('too big');
    return out;
  } finally { URL.revokeObjectURL(url); }
}
function openAccountForm(id, parentId = '') {
  if (!isBizAdmin() && !(id && accRoleOf(S.biz.accounts[id]) === 'admin')) return toast('Only admins can do this');
  const ex = id ? S.biz.accounts[id] : null;
  const par = !ex && parentId ? S.biz.accounts[parentId] : null;
  const d = ex ? clone(ex) : { id: uid(), name: '', sector: par ? par.sector || '' : '', color: COLORS[allAccounts(true).length % 8], logo: '', modules: par ? clone(par.modules || {}) : presetModules(false),
    parentId: par ? par.id : '', kind: par ? 'brand' : '', access: { teams: {}, people: {} }, createdAt: Date.now(), createdBy: userEmail() };
  const blocked = new Set(ex ? [ex.id, ...accDescendants(ex.id).map(x => x.id)] : []);   // an account can't sit under itself
  const parentChoices = allAccounts().filter(a => !blocked.has(a.id));
  d.modules = d.modules || {}; d.access = d.access || { teams: {}, people: {} };
  const w = openModal(`<div class="modal-head"><h2>${ex ? 'Edit account' : 'Create account'}</h2><button class="icon-btn" data-x>${ico('x')}</button></div>
    <form class="modal-body acc-form">
      <div class="af-top"><div class="af-logo" data-logo></div>
        <div style="flex:1;min-width:0"><div class="field"><label>Account name *</label><input class="inp" name="name" value="${esc(d.name)}" maxlength="80" autofocus placeholder="The client, e.g. Northwind Motors"></div>
          <div class="row2"><div class="field"><label>Sector</label><input class="inp" name="sector" list="af-sectors" value="${esc(d.sector || '')}" maxlength="60"><datalist id="af-sectors">${DEFAULT_SECTORS.map(x => `<option value="${esc(x)}">`).join('')}</datalist></div>
            <div class="field"><label>Logo</label><div style="display:flex;gap:6px"><label class="btn" style="cursor:pointer">${ico('upload', 'i-sm')} Upload<input type="file" accept="image/*" data-logofile hidden></label><button type="button" class="btn" data-logoclear>Remove</button></div></div></div></div></div>
      ${isBizAdmin() ? `<div class="row2"><div class="field"><label>Part of</label><select class="sel" name="parent"><option value="">Nothing: a top-level client</option>${accSelectOptions(parentChoices, d.parentId || '')}</select></div>
        <div class="field" data-kindf ${d.parentId ? '' : 'hidden'}><label>Type of sub-account</label><select class="sel" name="kind">${ACC_KINDS.map(([k, l]) => `<option value="${k}" ${(d.kind || 'brand') === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
        <p class="set-p" data-inherit ${d.parentId ? '' : 'hidden'} style="margin-top:-4px">Everyone with access to <b data-parname>${esc((S.biz.accounts[d.parentId] || {}).name || '')}</b> can open this sub-account too. Add more teams or people below.</p>` : ''}
      <div class="field"><label>Colour (used when there's no logo)</label><div class="swatches">${COLORS.map(c => `<button type="button" class="swatch sw-${c} ${d.color === c ? 'on' : ''}" data-c="${c}"></button>`).join('')}</div></div>
      ${!ex ? `<div class="field"><label>Who gets access</label><div class="af-access">
        <div class="af-acc-row"><span>Everyone in the business</span>${roleSelect('*', d.access.teams['*'])}</div>
        ${bizTeams().map(t => `<div class="af-acc-row"><span>${esc(t.name)} <small class="mut">${plural((t.memberEmails || []).length, 'person', 'people')}</small></span>${roleSelect(t.id, d.access.teams[t.id])}</div>`).join('')}
        <p class="set-p" style="margin:6px 0 0">You can add people one by one, and change all of this later, under Access.</p></div></div>` : ''}
      <div class="field"><label>Tools in this account</label>${toolPresets()}${toolsGrid(d.modules)}</div>
    </form>
    <div class="modal-foot"><span class="spacer"></span><button class="btn" data-x>Cancel</button><button class="btn btn-primary" data-ok>${ex ? 'Save' : 'Create account'}</button></div>`, 'wide');
  const paintLogo = () => { w.querySelector('[data-logo]').innerHTML = accLogo({ ...d, name: w.querySelector('[name=name]').value || d.name || '?' }, 'xl'); };
  paintLogo();
  w.querySelector('[name=name]').addEventListener('input', paintLogo);
  $$('[data-x]', w).forEach(b => b.onclick = () => w.close());
  $$('.swatch', w).forEach(b => b.onclick = () => { d.color = b.dataset.c; $$('.swatch', w).forEach(x => x.classList.toggle('on', x === b)); paintLogo(); });
  w.querySelector('[data-logofile]').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { d.logo = await readLogo(f); paintLogo(); } catch { toast('Couldn’t use that image - try a PNG or JPG under 2 MB'); } };
  w.querySelector('[data-logoclear]').onclick = () => { d.logo = ''; paintLogo(); };
  w.addEventListener('click', e => { const b = e.target.closest('[data-preset]'); if (!b) return; d.modules = presetModules(b.dataset.preset === 'all');
    $$('[data-tool]', w).forEach(c => { c.checked = d.modules[c.dataset.tool] !== false; c.closest('.tool-tile').classList.toggle('on', c.checked); }); });
  w.addEventListener('change', e => { const t = e.target;
    if (t.name === 'parent') { const pa = S.biz.accounts[t.value]; w.querySelector('[data-kindf]').hidden = !pa; w.querySelector('[data-inherit]').hidden = !pa; if (pa) w.querySelector('[data-parname]').textContent = pa.name; }
    if (t.dataset.tool) d.modules[t.dataset.tool] = t.checked; if (t.dataset.role != null) { if (t.value) d.access.teams[t.dataset.role] = t.value; else delete d.access.teams[t.dataset.role]; } });
  w.querySelector('form').onsubmit = e => e.preventDefault();
  w.querySelector('[data-ok]').onclick = async () => {
    const name = w.querySelector('[name=name]').value.trim(); if (!name) return toast('Give the account a name');
    if (allAccounts(true).some(a => a.id !== d.id && a.name.toLowerCase() === name.toLowerCase())) return toast('There’s already an account with that name');
    Object.assign(d, { name, sector: w.querySelector('[name=sector]').value.trim().slice(0, 60), updatedAt: Date.now() });
    const pSel = w.querySelector('[name=parent]');
    if (pSel) { d.parentId = pSel.value || ''; d.kind = d.parentId ? w.querySelector('[name=kind]').value : ''; }
    if (ex) {
      const moved = isBizAdmin() && ((ex.parentId || '') !== (d.parentId || '') || (ex.kind || '') !== (d.kind || ''));
      await bizApi.patchAccount(d.id, { name: d.name, sector: d.sector, color: d.color, logo: d.logo || '', modules: d.modules, ...(moved ? { parentId: d.parentId, kind: d.kind } : {}), updatedAt: d.updatedAt });
      if (moved) await syncAccess([d.id]);
      audit('account_edited', d.name); toast('Account saved');
    }
    else {
      Object.assign(d, computeAccess(d), { stats: null, archived: false });
      await bizApi.putAccount(d); audit('account_created', d.name);
      toast(`${d.name} created`);
      w.close(); switchAccount(d.id, '#/' + 'dashboard'); return;
    }
    w.close();
  };
}
const roleSelect = (key, v) => `<select class="sel sm" data-role="${esc(key)}"><option value="">No access</option>${ACC_ROLES.map(r => `<option value="${r}" ${v === r ? 'selected' : ''}>${ACC_ROLE_LABEL[r]}</option>`).join('')}</select>`;
const toolPresets = () => `<div class="tool-presets"><button type="button" class="btn sm" data-preset="simple">Essentials only</button><button type="button" class="btn sm" data-preset="all">All tools</button><span class="mut">Essentials: My work, Task lists, Briefs, Campaign Tracker, Alerts and Dashboard.</span></div>`;
const toolsGrid = mods => `<div class="tools-grid">${TOOLS.map(([k, l, i, d]) => `<label class="tool-tile ${mods[k] === false ? '' : 'on'}"><input type="checkbox" data-tool="${k}" ${mods[k] === false ? '' : 'checked'}>
  <span class="tt-ico">${ico(i)}</span><span class="tt-txt"><b>${esc(l)}</b><small>${esc(d)}</small></span><span class="tt-sw"></span></label>`).join('')}</div>`;

/* ---------- access to one account ---------- */
function openAccessModal(id) {
  const a = S.biz.accounts[id]; if (!a) return;
  if (accRoleOf(a) !== 'admin') return toast('Only account admins can change access');
  const acc = clone(a.access || { teams: {}, people: {} }); acc.teams = acc.teams || {}; acc.people = acc.people || {};
  const w = openModal(`<div class="modal-head"><h2>Access · ${esc(a.name)}</h2><button class="icon-btn" data-x>${ico('x')}</button></div><div class="modal-body" data-body style="max-height:70vh;overflow:auto"></div>
    <div class="modal-foot"><span class="mut" style="font-size:12px">Business admins can always open every account.</span><span class="spacer"></span><button class="btn" data-x>Cancel</button><button class="btn btn-primary" data-ok>Save access</button></div>`, 'wide');
  const body = w.querySelector('[data-body]');
  const ups = accAncestors(a);
  const draw = () => {
    const eff = computeAccess({ ...a, access: acc });
    const direct = Object.keys(acc.people).sort();
    const others = bizMembers().filter(m => !acc.people[m.id]);
    body.innerHTML = `${ups.length ? `<div class="set-h">${ico('flow')} Inherited</div>
      <p class="set-p">${esc(a.name)} is part of <b>${esc(ups.map(x => x.name).reverse().join(' › '))}</b>, so everyone with access there can open it too:</p>
      <div class="chips" style="margin-bottom:6px">${ups.flatMap(x => [...Object.entries((x.access || {}).teams || {}).map(([t, r]) => `${t === '*' ? 'Everyone' : (S.biz.teams[t] || {}).name || 'Removed team'} · ${ACC_ROLE_LABEL[r]}`),
        ...Object.entries((x.access || {}).people || {}).map(([em, r]) => `${memberName(em)} · ${ACC_ROLE_LABEL[r]}`)].map(t => `<span class="tag">${esc(t)} <small class="mut">from ${esc(x.name)}</small></span>`)).join('') || '<span class="mut">No one yet.</span>'}</div>
      <p class="set-p mut">Below you can add more teams or people, or a higher role, just for ${esc(a.name)}.</p>` : ''}
      <div class="set-h">${ico('people')} Teams</div>
      <p class="set-p">Give a whole team access. Everyone added to the team later gets in too.${accDescendants(a.id).length ? ` It also covers the ${plural(accDescendants(a.id).length, 'sub-account')} under ${esc(a.name)}.` : ''}</p>
      <div class="af-access"><div class="af-acc-row"><span>Everyone in the business <small class="mut">${plural(bizMembers().length, 'person', 'people')}</small></span>${roleSelect('*', acc.teams['*'])}</div>
      ${bizTeams().map(t => `<div class="af-acc-row"><span>${esc(t.name)} <small class="mut">${esc((t.memberEmails || []).map(memberName).join(', ') || 'no one yet')}</small></span>${roleSelect(t.id, acc.teams[t.id])}</div>`).join('') || '<p class="set-p mut">No teams yet - create them in Business settings → Teams.</p>'}</div>
      <div class="set-h">${ico('user')} People</div>
      <p class="set-p">Add someone directly, for example a freelancer or a client contact as a viewer.</p>
      <div class="af-access">${direct.map(em => `<div class="af-acc-row"><span>${esc(memberName(em))} <small class="mut">${esc(em)}</small></span><select class="sel sm" data-person="${esc(em)}">${ACC_ROLES.map(r => `<option value="${r}" ${acc.people[em] === r ? 'selected' : ''}>${ACC_ROLE_LABEL[r]}</option>`).join('')}<option value="">Remove</option></select></div>`).join('')}
        ${others.length ? `<div class="af-acc-row"><select class="sel" data-addp><option value="">Add a person…</option>${others.map(m => `<option value="${esc(m.id)}">${esc(m.name || m.id)} · ${esc(m.id)}</option>`).join('')}</select>
          <select class="sel sm" data-addr>${ACC_ROLES.map(r => `<option value="${r}" ${r === 'editor' ? 'selected' : ''}>${ACC_ROLE_LABEL[r]}</option>`).join('')}</select><button class="btn sm" data-addgo>Add</button></div>` : ''}
        ${isBizAdmin() ? '' : '<p class="set-p mut">People must be in the business first - a business admin adds them.</p>'}</div>
      <div class="set-h">${ico('eye')} Who can open ${esc(a.name)}</div>
      <table class="tbl acc-eff"><thead><tr><th>Person</th><th>Access</th><th>Through</th></tr></thead><tbody>
      ${eff.memberEmails.map(em => `<tr><td>${esc(memberName(em))} <small class="mut">${esc(em)}</small></td><td>${roleTag(eff.roles[em])}</td><td class="mut">${esc(accessVia({ ...a, access: acc }, em).join(' · '))}</td></tr>`).join('') || '<tr><td colspan="3" class="mut">Nobody yet (apart from business admins).</td></tr>'}
      </tbody></table>
      <p class="set-p" style="margin-top:10px">${ACC_ROLES.map(r => `<b>${ACC_ROLE_LABEL[r]}</b>: ${esc(ACC_ROLE_HELP[r])}`).join(' · ')}</p>`;
  };
  draw();
  $$('[data-x]', w).forEach(b => b.onclick = () => w.close());
  body.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.role != null) { if (t.value) acc.teams[t.dataset.role] = t.value; else delete acc.teams[t.dataset.role]; draw(); }
    if (t.dataset.person) { if (t.value) acc.people[t.dataset.person] = t.value; else delete acc.people[t.dataset.person]; draw(); }
  });
  body.addEventListener('click', e => {
    if (!e.target.closest('[data-addgo]')) return;
    const em = body.querySelector('[data-addp]').value; if (!em) return toast('Pick a person');
    acc.people[em] = body.querySelector('[data-addr]').value; draw();
  });
  w.querySelector('[data-ok]').onclick = async () => {
    const next = { ...a, access: acc }; const eff = computeAccess(next);
    if (!isBizAdmin() && eff.roles[userEmail()] !== 'admin') return toast('Keep yourself as an admin of this account, or ask a business admin');
    await bizApi.patchAccount(a.id, { access: acc, ...eff, updatedAt: Date.now() });
    if (accDescendants(a.id).length) await syncAccess(accDescendants(a.id).map(x => x.id));
    audit('access_changed', `${a.name}: ${eff.memberEmails.length} people`);
    toast('Access saved'); w.close();
  };
}

/* ---------- business settings: accounts, people, teams ---------- */
function renderBusiness() {
  const tab = S.bz.tab;
  if (!isBizAdmin()) return topbar('Business /') + `<div class="content"><div class="page-head"><h1>Business settings</h1></div><div class="ct-empty">Only business admins can manage people, teams and accounts.</div></div>`;
  const tabs = [['accounts', 'Accounts', allAccounts(true).length], ['people', 'People', bizMembers().length], ['teams', 'Teams', bizTeams().length]];
  return topbar('Business /') + `<div class="content"><div class="bz">
    <div class="page-head"><h1>Business settings</h1><div class="page-desc empty" style="cursor:default">Who can sign in, how they're grouped into teams, and which accounts each team can open.</div></div>
    <div class="ct-tabs bz-tabs">${tabs.map(([k, l, n]) => `<button class="ct-tab ${tab === k ? 'on' : ''}" data-action="bz-tab" data-t="${k}">${l} <span class="n">${n}</span></button>`).join('')}</div>
    ${tab === 'people' ? bizPeopleHTML() : tab === 'teams' ? bizTeamsHTML() : bizAccountsHTML()}
  </div></div>`;
}
function bizAccountsHTML() {
  const list = allAccounts(true);
  const top = DEMO_ACCOUNTS.filter(x => !x.parent), subN = DEMO_ACCOUNTS.length - top.length;
  return `<div class="ct-toolbar"><span class="mut">Each account is a client with its own data, tools and access.</span><span class="spacer"></span><button class="btn btn-primary" data-action="acc-create">${ico('plus', 'i-sm')} Create account</button></div>
    <div class="tbl-wrap"><table class="tbl bz-table"><thead><tr><th>Account</th><th>Access</th><th>Tools</th><th class="num">People</th><th>Status</th><th></th></tr></thead><tbody>
    ${accTree(list).map(({ a, depth }) => { const acc = a.access || {}; const on = TOOLS.filter(t => (a.modules || {})[t[0]] !== false);
      return `<tr class="${a.archived ? 'mut' : ''} ${depth ? 'ao-sub' : ''}"><td><div class="ao-name" style="--d:${depth}">${depth ? '<span class="ao-branch" aria-hidden="true"></span>' : ''}${accLogo(a)}<span><b>${esc(a.name)}</b><small>${esc(a.parentId ? kindLabel(a.kind) || 'Sub-account' : a.sector || '')}</small></span></div></td>
      <td class="ao-teams">${a.parentId && accAncestors(a).length ? `<span class="tag inh" title="Everyone with access to ${esc(accAncestors(a)[0].name)} can open it">${ico('flow', 'i-xs')} from ${esc(accAncestors(a)[0].name)}</span>` : ''}${Object.entries(acc.teams || {}).map(([t, r]) => `<span class="tag">${esc(t === '*' ? 'Everyone' : (S.biz.teams[t] || {}).name || 'Removed team')} · ${ACC_ROLE_LABEL[r]}</span>`).join('')}${Object.keys(acc.people || {}).length ? `<span class="tag">${plural(Object.keys(acc.people).length, 'person', 'people')} direct</span>` : ''}</td>
      <td><span title="${esc(on.map(t => t[1]).join(', '))}">${on.length} of ${TOOLS.length}</span></td><td class="num">${(a.memberEmails || []).length}</td>
      <td>${a.archived ? 'Archived' : 'Active'}</td>
      <td style="white-space:nowrap;text-align:right"><button class="btn sm" data-action="acc-access" data-id="${esc(a.id)}">Access</button> <button class="btn sm" data-action="acc-edit" data-id="${esc(a.id)}">Edit</button> <button class="icon-btn" data-action="acc-row-menu" data-id="${esc(a.id)}">${ico('dots')}</button></td></tr>`; }).join('') || '<tr><td colspan="6" class="mut">No accounts yet.</td></tr>'}
    </tbody></table></div>
    <div class="set-h" style="margin-top:22px">${ico('sparkle')} Sample business (for demos)</div>
    <p class="set-p">Example accounts: ${esc(top.map(a => a.name).join(', '))}, with ${subN} sub-accounts under General Motors (brands and dealers), teams, people with different access, and briefs, tasks and campaigns inside each. Put your own team's names on the GM account when you load it. ${CFG.sampleData ? 'A brand-new platform starts with it loaded (<code>sampleData</code> in config.js). ' : ''}Everything it adds is tagged and comes out again with one click; your own accounts, teams and people aren't touched.</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-action="bz-sample-load">${ico('sparkle', 'i-sm')} Load sample business</button><button class="btn btn-danger" data-action="bz-sample-clear">${ico('trash', 'i-sm')} Remove sample business</button></div>`;
}
function bizPeopleHTML() {
  const ms = bizMembers();
  const teamsOf = em => bizTeams().filter(t => (t.memberEmails || []).includes(em));
  const ownerRow = S.mode === 'cloud' && CFG.ownerEmail && !S.biz.members[CFG.ownerEmail.toLowerCase()];
  return `<p class="set-p">Only people listed here can sign in. <b>Owners</b> and <b>admins</b> open every account and manage people, teams and accounts; only owners can add or remove other owners. ${S.mode === 'cloud' ? `They sign up at <b>${esc(location.origin + location.pathname)}</b> with this email.` : ''}</p>
    <div class="tbl-wrap"><table class="tbl bz-table"><thead><tr><th>Name</th><th>Email</th><th>Job role</th><th>Business role</th><th>Teams</th><th class="num">Accounts</th><th></th></tr></thead><tbody>
    ${ownerRow ? `<tr><td><b>Owner</b></td><td>${esc(CFG.ownerEmail)}</td><td></td><td>Owner</td><td></td><td class="num">all</td><td></td></tr>` : ''}
    ${ms.map(m => `<tr><td><div class="ao-name"><span class="avatar sw-${esc(m.color || 'grey')}">${esc(initials(m.name || m.id))}</span><input class="inp ghost" data-mname="${esc(m.id)}" value="${esc(m.name || '')}" maxlength="60" placeholder="Name"></div></td>
      <td>${esc(m.id)}</td>
      <td><select class="sel sm" data-mjob="${esc(m.id)}"><option value="">-</option>${[...new Set([...DEFAULT_ROLES.filter(r => r !== 'Client'), 'Head of Performance', m.jobRole].filter(Boolean))].map(r => `<option ${m.jobRole === r ? 'selected' : ''}>${esc(r)}</option>`).join('')}</select></td>
      <td>${isFirstOwner(m.id) ? '<b>Owner</b>' : m.id === userEmail() || (m.bizRole === 'owner' && !isOwnerUser()) ? (BIZ_ROLES.find(r => r[0] === (m.bizRole || 'member')) || [, 'Member'])[1]
        : `<select class="sel sm" data-mrole="${esc(m.id)}">${BIZ_ROLES.filter(([k]) => k !== 'owner' || isOwnerUser()).map(([k, l]) => `<option value="${k}" ${(m.bizRole || 'member') === k ? 'selected' : ''}>${l}</option>`).join('')}</select>`}</td>
      <td class="ao-teams">${teamsOf(m.id).map(t => `<span class="tag">${esc(t.name)}</span>`).join('') || '<span class="mut">-</span>'}</td>
      <td class="num">${m.bizRole === 'admin' || isOwnerEmail(m.id) ? 'all' : allAccounts().filter(a => (a.roles || {})[m.id]).length}</td>
      <td style="white-space:nowrap;text-align:right">${S.mode === 'local' ? `<button class="btn sm ${userEmail() === m.id ? 'on' : ''}" data-viewas="${esc(m.id)}" title="See the platform the way this person does (local mode)">${userEmail() === m.id ? 'Viewing as' : 'View as'}</button> ` : ''}${m.id !== userEmail() && !isFirstOwner(m.id) && (m.bizRole !== 'owner' || isOwnerUser()) ? `<button class="icon-btn" data-mdel="${esc(m.id)}" title="Remove">${ico('trash', 'i-sm')}</button>` : ''}</td></tr>`).join('')}
    </tbody></table></div>
    <form class="bz-add" data-addmember><input class="inp" name="name" placeholder="Name" maxlength="60"><input class="inp" name="email" type="email" placeholder="work email" maxlength="254" required>
      <select class="sel" name="job"><option value="">Job role…</option>${DEFAULT_ROLES.filter(r => r !== 'Client').map(r => `<option>${esc(r)}</option>`).join('')}</select>
      <select class="sel" name="role">${BIZ_ROLES.filter(([k]) => k !== 'owner' || isOwnerUser()).map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select>
      <select class="sel" name="team"><option value="">Add to team…</option>${bizTeams().map(t => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('')}</select><button class="btn btn-primary">Add person</button></form>`;
}
function bizTeamsHTML() {
  const ts = bizTeams();
  return `<p class="set-p">Teams make access simple: give a team access to an account once, and everyone in it - now or later - gets in with that role.</p>
    <div class="bz-teams">${ts.map(t => { const accs = allAccounts(true).filter(a => ((a.access || {}).teams || {})[t.id]);
      const others = bizMembers().filter(m => !(t.memberEmails || []).includes(m.id));
      const freeAccs = allAccounts().filter(a => !((a.access || {}).teams || {})[t.id]);
      return `<div class="bz-team"><div class="bz-team-h"><span class="dot sw-${esc(t.color || 'grey')}"></span><input class="inp ghost" data-tname="${esc(t.id)}" value="${esc(t.name)}" maxlength="60"><button class="icon-btn" data-tdel="${esc(t.id)}" title="Delete team">${ico('trash', 'i-sm')}</button></div>
        <div class="bz-sub">People</div>
        <div class="chips">${(t.memberEmails || []).map(em => `<span class="tag">${esc(memberName(em))}<button data-tmdel="${esc(t.id)}" data-em="${esc(em)}" title="Remove">${ico('x', 'i-xs')}</button></span>`).join('') || '<span class="mut">No one yet</span>'}
          ${others.length ? `<select class="sel sm" data-tmadd="${esc(t.id)}"><option value="">+ Add person</option>${others.map(m => `<option value="${esc(m.id)}">${esc(m.name || m.id)}</option>`).join('')}</select>` : ''}</div>
        <div class="bz-sub">Accounts</div>
        <div class="chips">${accs.map(a => `<span class="tag acc-chip" title="${esc(accPath(a))}">${accLogo(a, 'xs')}${esc(accLabel(a))}${accDescendants(a.id).length ? `<small class="mut">+${plural(accDescendants(a.id).length, 'sub-account')}</small>` : ''}<select class="sel xs" data-tarole="${esc(t.id)}" data-acc="${esc(a.id)}">${ACC_ROLES.map(r => `<option value="${r}" ${a.access.teams[t.id] === r ? 'selected' : ''}>${ACC_ROLE_LABEL[r]}</option>`).join('')}<option value="">Remove</option></select></span>`).join('') || '<span class="mut">No accounts yet</span>'}
          ${freeAccs.length ? `<select class="sel sm" data-taadd="${esc(t.id)}"><option value="">+ Add account</option>${accSelectOptions(freeAccs)}</select>` : ''}</div>
        ${accs.some(a => accDescendants(a.id).length) ? '<p class="set-p mut" style="margin:6px 0 0">Access to an account includes its sub-accounts.</p>' : ''}</div>`; }).join('')}
      <form class="bz-team bz-newteam" data-addteam><div class="bz-sub">New team</div><input class="inp" placeholder="e.g. Automotive team" maxlength="60"><button class="btn btn-primary">Create team</button></form></div>`;
}
// One listener for the business page (inputs, selects and small buttons that aren't data-action).
document.addEventListener('change', async e => {
  const t = e.target; if (!t.closest || !t.closest('.bz')) return;
  const ds = t.dataset;
  if (ds.mname) { const m = S.biz.members[ds.mname]; if (m && t.value.trim()) await bizApi.putMember({ ...m, name: t.value.trim().slice(0, 60) }); }
  if (ds.mjob) { const m = S.biz.members[ds.mjob]; if (m) await bizApi.putMember({ ...m, jobRole: t.value }); }
  if (ds.mrole) {
    const m = S.biz.members[ds.mrole]; if (!m) return;
    if ((t.value === 'owner' || m.bizRole === 'owner') && !isOwnerUser()) { t.value = m.bizRole || 'member'; return toast('Only owners can change owners'); }
    if (t.value === 'owner' && !await confirmBox(`Make <b>${esc(m.name || m.id)}</b> an owner? Owners can do everything here, including adding and removing other owners.`, 'Make owner')) { t.value = m.bizRole || 'member'; return; }
    await bizApi.putMember({ ...m, bizRole: t.value }); audit('business_role', `${m.id}: ${t.value}`); render({ mainOnly: true });
  }
  if (ds.tname) { const tm = S.biz.teams[ds.tname]; if (tm && t.value.trim()) await bizApi.putTeam({ ...tm, name: t.value.trim().slice(0, 60) }); }
  if (ds.tmadd && t.value) { const tm = S.biz.teams[ds.tmadd]; await bizApi.putTeam({ ...tm, memberEmails: [...new Set([...(tm.memberEmails || []), t.value])] }); await syncAccess(); }
  if (ds.taadd && t.value) { const a = S.biz.accounts[t.value]; const access = clone(a.access || { teams: {}, people: {} }); access.teams = { ...(access.teams || {}), [ds.taadd]: 'editor' }; await bizApi.patchAccount(a.id, { access, ...computeAccess({ ...a, access }) }); await syncAccess(accDescendants(a.id).map(x => x.id)); }
  if (ds.tarole) { const a = S.biz.accounts[ds.acc]; const access = clone(a.access || { teams: {}, people: {} }); if (t.value) access.teams[ds.tarole] = t.value; else delete access.teams[ds.tarole]; await bizApi.patchAccount(a.id, { access, ...computeAccess({ ...a, access }) }); await syncAccess(accDescendants(a.id).map(x => x.id)); }
});
document.addEventListener('click', async e => {
  const b = e.target.closest && e.target.closest('.bz button'); if (!b) return;
  const ds = b.dataset;
  if (ds.mdel) {
    const m = S.biz.members[ds.mdel]; if (!m) return;
    if (m.bizRole === 'owner' && !isOwnerUser()) return toast('Only owners can remove an owner');
    if (!await confirmBox(`Remove <b>${esc(m.name || m.id)}</b> from the business? They lose access to every account. Their work stays.`, 'Remove')) return;
    for (const t of bizTeams().filter(t => (t.memberEmails || []).includes(m.id))) await bizApi.putTeam({ ...t, memberEmails: t.memberEmails.filter(x => x !== m.id) });
    for (const a of allAccounts(true).filter(a => ((a.access || {}).people || {})[m.id])) { const access = clone(a.access); delete access.people[m.id]; await bizApi.patchAccount(a.id, { access }); }
    await bizApi.delMember(m.id); audit('member_removed', m.id);
    await syncAccess();
  }
  if (ds.tmdel) { const tm = S.biz.teams[ds.tmdel]; await bizApi.putTeam({ ...tm, memberEmails: (tm.memberEmails || []).filter(x => x !== ds.em) }); await syncAccess(); }
  if (ds.tdel) {
    const tm = S.biz.teams[ds.tdel]; if (!await confirmBox(`Delete the team <b>${esc(tm.name)}</b>? Its people lose the access they had through it.`, 'Delete')) return;
    for (const a of allAccounts(true).filter(a => ((a.access || {}).teams || {})[tm.id])) { const access = clone(a.access); delete access.teams[tm.id]; await bizApi.patchAccount(a.id, { access }); }
    await bizApi.delTeam(tm.id); await syncAccess();
  }
  if (ds.viewas) { lsSet('tb:viewAs', ds.viewas); setLocalUser(); toast(`Now viewing as ${memberName(ds.viewas)}`); history.replaceState(null, '', location.pathname + '#/accounts'); S.acc = null; openBestAccount(); }
});
document.addEventListener('submit', async e => {
  const f = e.target; if (!f.closest || !f.closest('.bz')) return;
  e.preventDefault();
  if ('addmember' in f.dataset) {
    const em = f.email.value.trim().toLowerCase();
    if (!okEmailId(em)) return toast('That doesn’t look like an email');
    if (S.biz.members[em]) return toast('Already in the business');
    if (f.role.value === 'owner' && !await confirmBox(`Add <b>${esc(em)}</b> as an owner? Owners can do everything here, including adding and removing other owners.`, 'Add owner')) return;
    await bizApi.putMember({ id: em, name: f.name.value.trim().slice(0, 60) || em.split('@')[0], jobRole: f.job.value, bizRole: f.role.value, color: COLORS[bizMembers().length % 8], addedAt: Date.now(), addedBy: userEmail() });
    if (f.team.value) { const tm = S.biz.teams[f.team.value]; await bizApi.putTeam({ ...tm, memberEmails: [...new Set([...(tm.memberEmails || []), em])] }); }
    await syncAccess(); audit('member_added', em);
    toast(`${em} added${S.mode === 'cloud' ? ' - send them the link to sign up' : ''}`);
  }
  if ('addteam' in f.dataset) {
    const name = f.querySelector('input').value.trim(); if (!name) return;
    await bizApi.putTeam({ id: uid(), name: name.slice(0, 60), color: COLORS[bizTeams().length % 8], memberEmails: [], createdAt: Date.now() });
  }
}, true);

// older name kept for the few places that ask "is this mine to manage?"
const wsMine = () => canAdminAcc();

/* =====================================================================
   GUIDE & HELP - a getting-started page plus a built-in chatbot.
   The chatbot answers from the preset questions below: no AI service,
   no network calls, nothing typed into it leaves the browser.
   ===================================================================== */
const GUIDE_CATS = [['start', 'Getting started', 'Start'], ['app', 'Using the platform', 'How to'], ['media', 'Media maths', 'Media maths'], ['sec', 'Access & security', 'Access']];
// c: category · q: question · k: extra words people might type · a: answer (static HTML written here) · go/gl: optional "take me there" button · rel: related ids
const GUIDE = [
  // ---------- getting started ----------
  { id: 'what', c: 'start', q: 'What is the Ads Workspace?', k: 'about platform overview ads manager accounts clients explain',
    a: '<p>One platform for all client work, set up like an ads manager. Each client is an <b>account</b> with its own logo, team, tools and data.</p><p>Switch accounts from the top of the sidebar. You only see the accounts you\'ve been given access to.</p>',
    go: '#/accounts', gl: 'Open All accounts', rel: ['switch', 'first-day', 'roles'] },
  { id: 'first-day', c: 'start', q: 'I\'m new. Where do I start?', k: 'new start begin first day onboarding help lost',
    a: '<ol><li>Pick your account at the top of the sidebar.</li><li>Open <b>My work</b>: the briefs, steps and tasks waiting on you.</li><li>Check <b>Alerts</b> for anything late or stuck.</li><li>Follow the checklist on the <b>Guide</b> page.</li></ol>',
    go: '#/guide', gl: 'Open the Guide', rel: ['switch', 'mywork', 'brief-new'] },
  { id: 'switch', c: 'start', q: 'How do I switch accounts?', k: 'switch change account client dropdown switcher logo another',
    a: '<p>Click the account name and logo at the top of the sidebar, then pick another account or type to search.</p><p><b>All accounts</b> lists every account you can open, with its open briefs, alerts and live campaigns.</p>',
    go: 'switcher', gl: 'Open the account switcher', rel: ['what', 's-noaccess'] },
  { id: 'setup', c: 'start', q: 'How do I set up a new client account?', k: 'create account new client setup add logo onboard',
    a: '<ol><li><b>Business settings → People</b>: add everyone by work email.</li><li><b>Teams</b>: group them, for example "GM team".</li><li><b>Accounts → Create account</b>: name, logo and sector.</li><li>Give teams access as Admin, Editor or Viewer.</li><li>Choose the tools the account needs.</li></ol><p>Only business admins can create accounts.</p>',
    go: 'new-account', gl: 'Create an account', rel: ['roles', 'tools', 's-access'] },
  { id: 'subaccounts', c: 'start', q: 'What are sub-accounts?', k: 'sub account subaccount brand dealer market child parent nested group chevrolet cadillac gmc al ghanim al jomaih aga',
    a: '<p>An account can sit under another one, like brands and dealers under a client: <b>General Motors</b> › <b>GM Cadillac</b> › <b>Al Ghanim Cadillac (Dealer)</b>. Each sub-account has its own briefs, boards, tools and data.</p><p>Access flows down: anyone with access to General Motors can open its sub-accounts too. You can add extra people or a higher role on a sub-account only.</p><p>To add one: All accounts or Business settings → the <b>…</b> menu on an account → <b>Add a sub-account</b>, or choose <b>Part of</b> when you create an account.</p>',
    go: '#/accounts', gl: 'Open All accounts', rel: ['setup', 'roles', 's-access'] },
  { id: 'roles', c: 'start', q: 'What can Admins, Editors and Viewers do?', k: 'role roles admin editor viewer permission rights can cannot',
    a: '<ul><li><b>Owner</b>: everything a business admin can do, plus adding and removing other owners.</li><li><b>Business admin</b>: adds people and teams, creates accounts, sees every account.</li><li><b>Account admin</b>: changes the account\'s name, logo, access and tools.</li><li><b>Editor</b>: does the work - briefs, tasks, campaigns, notes.</li><li><b>Viewer</b>: sees everything in the account but can\'t change anything.</li></ul>',
    rel: ['s-access', 's-viewer', 'setup'] },
  { id: 'tools', c: 'start', q: 'How do I switch tools on or off?', k: 'tools modules features turn on off enable disable hide simplify',
    a: '<p>Open <b>Account settings</b> (the gear at the top of the sidebar) → <b>Tools</b>. Account admins can switch each tool on or off for everyone in that account.</p><p>New accounts start with the essentials: My work, Task lists, Briefs, Campaign Tracker, Alerts and Dashboard. Turning a tool off only hides it - nothing is deleted.</p>',
    go: 'tools', gl: 'Open Tools', rel: ['setup', 'roles'] },

  // ---------- using the platform ----------
  { id: 'brief-new', c: 'app', q: 'How do I submit a brief?', k: 'brief new submit request client ask template',
    a: '<p>Click <b>New brief</b> at the top of the sidebar and fill in the template: objective, KPIs, markets, platforms, budget, dates and creative. Save it as a draft or submit it.</p><p>Submitting notifies the team and starts the workflow.</p>',
    go: 'new-brief', gl: 'Start a brief', rel: ['workflow', 'alerts'] },
  { id: 'workflow', c: 'app', q: 'How does the brief workflow work?', k: 'workflow steps sla owner kick off approval go live stage process',
    a: '<p>Each brief moves through steps, such as kick-off, media plan, client approval, setup, QA and go-live. Every step has an owner and a time limit (SLA) in working days.</p><p>Mark a step done on the brief page and the next owner is notified. Late or stuck steps show up in <b>Alerts</b>.</p>',
    go: '#/briefs', gl: 'Open Briefs', rel: ['alerts', 'brief-new', 'mywork'] },
  { id: 'mywork', c: 'app', q: 'What\'s in My work?', k: 'my work inbox assigned me today due mine',
    a: '<p>Everything in this account that\'s waiting on you: brief steps you own, tasks assigned to you and items due soon. Start your day here.</p>',
    go: '#/mywork', gl: 'Open My work', rel: ['alerts', 'task'] },
  { id: 'alerts', c: 'app', q: 'What do Alerts mean?', k: 'alerts late stuck risk overdue warning critical red amber',
    a: '<p>Alerts flag work that needs attention: steps past their SLA, briefs not picked up, work that has stalled, and briefs at risk of missing their go-live date.</p><p><b>Critical</b> needs action now; <b>warnings</b> need a look. An alert clears itself once the cause is fixed.</p>',
    go: '#/alerts', gl: 'Open Alerts', rel: ['workflow', 'dashboard'] },
  { id: 'campaign-add', c: 'app', q: 'How do I add a campaign to the tracker?', k: 'campaign tracker new add launch flight',
    a: '<p>Open <b>Campaign Tracker</b> and click <b>Add campaign</b>. Pick the ad account, flight dates, markets, and the platforms with their objectives.</p><p>Status follows the dates. Set pacing, creatives and results as it runs; anything off shows under <b>Needs attention</b>.</p>',
    go: '#/campaigns', gl: 'Open Campaign Tracker', rel: ['weekly', 'm-pacing'] },
  { id: 'weekly', c: 'app', q: 'What is the weekly check?', k: 'weekly check optimisation optimization due done review',
    a: '<p>Each live campaign asks for one optimisation check a week. Mark the week done on the campaign once you\'ve reviewed it. Campaigns with a check still due are flagged at the top of the tracker.</p>',
    go: '#/campaigns', gl: 'Open Campaign Tracker', rel: ['m-weekly', 'campaign-add'] },
  { id: 'task', c: 'app', q: 'How do I add a task?', k: 'task add new todo to-do quick q',
    a: '<p>Press <kbd>Q</kbd> anywhere, or click <b>Task</b> at the top of the sidebar. Give it a date, owner, priority and repeat if needed. Tasks live in the account\'s lists.</p>',
    go: 'new-task', gl: 'Add a task', rel: ['mywork', 'shortcuts'] },
  { id: 'dashboard', c: 'app', q: 'What does the Dashboard show?', k: 'dashboard report numbers turnaround sla performance metrics',
    a: '<p>For the period you pick: brief turnaround and SLA performance, where work gets stuck, brands, campaigns and tasks. It\'s worked out from the account\'s own data.</p><p>Business admins also see every account\'s headline numbers on <b>All accounts</b>.</p>',
    go: '#/dashboard', gl: 'Open Dashboard', rel: ['alerts', 'what'] },
  { id: 'calendar', c: 'app', q: 'How do I mark leave or remote days?', k: 'calendar leave ooo out of office remote holiday vacation',
    a: '<p>Turn on <b>Team calendar</b> in the account\'s Tools, then open <b>Upcoming</b> and click a day to add leave, remote or office days. They show next to what\'s due, so you can see who\'s off before handing work over.</p>',
    go: '#/upcoming', gl: 'Open Upcoming', rel: ['tools'] },
  { id: 'notify', c: 'app', q: 'How do notifications work?', k: 'notification bell email alert notify inbox message',
    a: '<p>The bell at the top of the sidebar shows what\'s new for you in this account: steps handed to you, briefs submitted, comments and alerts. When email is set up, the same updates arrive by email with a link to the right account.</p>',
    rel: ['alerts', 'mywork'] },
  { id: 'search', c: 'app', q: 'How do I find something quickly?', k: 'search find look up lost where',
    a: '<p>Press <kbd>/</kbd> or click <b>Search</b> in the sidebar. It searches tasks, briefs, campaigns and notes in the current account.</p>',
    go: 'search', gl: 'Open search', rel: ['shortcuts'] },
  { id: 'undo', c: 'app', q: 'I deleted something by mistake', k: 'undo mistake restore deleted recover oops back',
    a: '<p>Press <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Z</kbd> straight away, or click <b>Undo</b> on the message. Later on, open <b>More → Recently deleted</b>: things stay there for 30 days.</p>',
    go: '#/trash', gl: 'Open Recently deleted', rel: ['archive'] },
  { id: 'archive', c: 'app', q: 'What\'s the difference between Archive and delete?', k: 'archive hide put away restore old',
    a: '<p><b>Archive</b> puts things away without deleting them; restore them any time from <b>More → Archive</b>. <b>Delete</b> moves them to Recently deleted for 30 days.</p>',
    go: '#/archive', gl: 'Open Archive', rel: ['undo'] },
  { id: 'shortcuts', c: 'app', q: 'What keyboard shortcuts are there?', k: 'keys hotkeys keyboard shortcut',
    a: '<ul><li><kbd>Q</kbd> new task</li><li><kbd>/</kbd> search</li><li><kbd>?</kbd> open this help</li><li><kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Z</kbd> undo the last delete, completion or archive</li><li><kbd>Esc</kbd> close a window or menu</li></ul>',
    rel: ['search', 'task'] },
  { id: 'theme', c: 'app', q: 'How do I switch between light and dark mode?', k: 'dark mode light theme appearance night',
    a: '<p>Click your initials at the top of the sidebar and choose the theme. Each browser remembers its own choice.</p>', go: 'theme', gl: 'Switch theme now' },

  // ---------- media maths ----------
  { id: 'm-pacing', c: 'media', q: 'How do I calculate pacing?', k: 'pacing formula expected spend budget flight on track percentage',
    a: '<p><b>Expected spend to date</b> = budget × (days elapsed ÷ flight days)</p><p><b>Pacing</b> = actual spend ÷ expected spend</p><p>Example: 30,000 over 30 days, on day 12, should have spent 12,000. Spent 10,800 = 90% pacing. Around 95-105% is usually on track; agree the tolerance per client.</p>',
    rel: ['m-under', 'm-over'] },
  { id: 'm-under', c: 'media', q: 'A campaign is under-pacing. What should I check?', k: 'under pacing underspend not spending delivery low spend',
    a: '<ul><li><b>Delivery limits:</b> bid or cost caps too low, or a narrow audience.</li><li><b>Ads:</b> disapproved, limited or ended creatives.</li><li><b>Learning:</b> recent big edits reset it.</li><li><b>Budget setup:</b> daily budget lower than the plan needs.</li></ul><p>Then broaden targeting, raise caps, add creatives or move budget to what\'s delivering.</p>',
    rel: ['m-pacing', 'm-learning'] },
  { id: 'm-over', c: 'media', q: 'A campaign is over-pacing. What should I do?', k: 'over pacing overspend spending too fast',
    a: '<ul><li>Lower the daily budget, or switch to a lifetime budget with an end date.</li><li>Check for budget changes, automated rules or auto-applied recommendations nobody planned.</li><li>Set the new daily cap to remaining budget ÷ remaining days.</li></ul>',
    rel: ['m-pacing'] },
  { id: 'm-formulas', c: 'media', q: 'What are the formulas for CPM, CPC, CTR, CPA and ROAS?', k: 'cpm cpc ctr cpa roas cvr cpl frequency formula metrics calculate kpi',
    a: '<ul><li><b>CPM</b> = cost ÷ impressions × 1,000</li><li><b>CPC</b> = cost ÷ clicks</li><li><b>CTR</b> = clicks ÷ impressions</li><li><b>CVR</b> = conversions ÷ clicks</li><li><b>CPA / CPL</b> = cost ÷ conversions (or leads)</li><li><b>ROAS</b> = revenue ÷ cost</li><li><b>Frequency</b> = impressions ÷ reach</li></ul>',
    rel: ['m-bench', 'm-fatigue'] },
  { id: 'm-bench', c: 'media', q: 'What\'s a good CTR or CPM?', k: 'benchmark good average ctr cpm cpc normal compare',
    a: '<p>It varies a lot by platform, format, objective, market and season. Compare like with like - same platform, objective, market and time of year - and use the account\'s own past campaigns as the main benchmark.</p>',
    rel: ['m-formulas', 'm-season'] },
  { id: 'm-learning', c: 'media', q: 'What is the learning phase?', k: 'learning phase limited reset edits algorithm meta tiktok google',
    a: '<p>After launch or a big change, the platform is still learning who converts, so results swing. On Meta an ad set generally needs about 50 optimisation events in a week to exit learning.</p><p>Avoid frequent big edits to targeting, creative, optimisation event, bidding or budget - they can restart it.</p>',
    rel: ['m-under', 'm-objective'] },
  { id: 'm-fatigue', c: 'media', q: 'How do I spot creative fatigue?', k: 'creative fatigue frequency refresh ad tired ctr dropping',
    a: '<p>Over a week or two: frequency climbing, CTR falling, CPM and CPA rising. Rotate in new creatives before performance drops, and test new hooks rather than small tweaks.</p>',
    rel: ['m-freq', 'm-weekly'] },
  { id: 'm-qa', c: 'media', q: 'What should I check before launching?', k: 'launch checklist qa pre-launch go live setup check',
    a: '<ol><li>Naming and the right ad account</li><li>Flight dates, time zone and budget type</li><li>Markets, language, audiences and exclusions</li><li>Objective, optimisation event and bidding</li><li>Tracking: pixel or tag firing, conversion events, UTMs</li><li>Creatives, copy, approvals and landing pages</li><li>Placements and brand-safety settings</li></ol>',
    rel: ['m-naming', 'campaign-add'] },
  { id: 'm-weekly', c: 'media', q: 'What should a weekly optimisation check cover?', k: 'weekly optimisation optimization review routine checklist',
    a: '<ul><li>Pacing against plan</li><li>KPIs against target</li><li>Frequency and creative fatigue</li><li>Best and worst ads, ad sets and placements</li><li>Search terms and negatives (Search)</li><li>Learning and limited delivery</li><li>Moving budget to what\'s working</li></ul>',
    rel: ['weekly', 'm-fatigue'] },
  { id: 'm-objective', c: 'media', q: 'Which objective should I choose?', k: 'objective awareness reach traffic leads conversion choose funnel',
    a: '<ul><li><b>Awareness:</b> Reach, Awareness, Video views</li><li><b>Consideration:</b> Traffic, Engagement</li><li><b>Action:</b> Leads, Conversions or Sales</li></ul><p>Optimise for the event closest to the business result that still gets enough volume to learn from.</p>',
    rel: ['m-learning'] },
  { id: 'm-attrib', c: 'media', q: 'Why don\'t platform numbers match GA4 or the CRM?', k: 'attribution window mismatch ga4 analytics discrepancy conversions different crm',
    a: '<p>Each tool counts differently. Platforms use their own attribution windows and count view-through conversions; GA4 uses its own model; the CRM only sees leads that arrive. Agree one source of truth per KPI with the client and compare trends, not exact totals.</p>',
    rel: ['m-formulas'] },
  { id: 'm-naming', c: 'media', q: 'What naming convention should we use?', k: 'naming convention structure name campaigns taxonomy',
    a: '<p>Use the client\'s taxonomy when it has one. Otherwise keep the same pieces in the same order on every platform, for example <code>Market_Brand_Platform_Objective_Audience_Flight</code>, so reports can be filtered.</p>',
    rel: ['m-qa'] },
  { id: 'm-season', c: 'media', q: 'How should we plan around Ramadan and peak season?', k: 'ramadan eid seasonality peak q4 white friday holiday plan',
    a: '<ul><li>Expect higher CPMs and more competition.</li><li>Lock budgets and creatives early.</li><li>In Ramadan, activity shifts late into the evening.</li><li>Compare with the same period last year, not the month before.</li></ul>',
    rel: ['m-bench'] },
  { id: 'm-freq', c: 'media', q: 'What frequency is too high?', k: 'frequency cap too high reach overexposure',
    a: '<p>It depends on objective, format and audience size. Watch the trend: when frequency rises while CTR falls and CPA climbs, widen the audience, refresh creative or cap frequency.</p>',
    rel: ['m-fatigue'] },

  // ---------- access & security ----------
  { id: 's-access', c: 'sec', q: 'How do I give or remove someone\'s access?', k: 'access give remove revoke add member invite leaver team',
    a: '<p>Business admins: <b>Business settings → People</b> to add someone by work email, then <b>Teams</b> to put them on the right team. Account admins can also change who has access from the account\'s <b>Access</b>.</p><p>Removing someone takes effect immediately.</p>',
    go: 'access', gl: 'Open access', rel: ['roles', 's-who-sees'] },
  { id: 's-owners', c: 'sec', q: 'How do I add another owner?', k: 'owner owners upper management director add owner co-owner business admin promote',
    a: '<p>Owners can do everything, including adding and removing other owners. Business admins can manage people, teams and accounts, but can\'t change owners.</p><p>An owner opens <b>Business settings → People</b>, adds the person by work email (or finds them in the list) and sets <b>Business role</b> to <b>Owner</b>. They sign up with that email and they\'re in.</p>',
    go: 'people', gl: 'Open People', rel: ['s-access', 'roles'] },
  { id: 's-who-sees', c: 'sec', q: 'Who can see an account?', k: 'privacy who can see access private visible data shared',
    a: '<p>Only people with access to it - through a team or one by one - and business admins. The database rules enforce this on Google\'s servers, so it holds even if someone tampers with the page.</p>',
    rel: ['s-access', 'roles'] },
  { id: 's-viewer', c: 'sec', q: 'Why can\'t I edit anything?', k: 'cant edit read only view only viewer locked greyed',
    a: '<p>You have <b>Viewer</b> access to this account, so you can see everything but not change it. Ask the account admin or a business admin to make you an Editor.</p>', rel: ['roles'] },
  { id: 's-noaccess', c: 'sec', q: 'I can\'t see an account I need', k: 'missing account cant see no access not listed',
    a: '<p>Ask a business admin to add you to the team that has access to that account, or to give you access directly. It appears in your switcher straight away.</p>', rel: ['s-access', 'switch'] },
  { id: 's-signup', c: 'sec', q: 'How do I sign up?', k: 'sign up register create account login first time',
    a: '<p>A business admin adds your work email first. Then choose <b>Create an account</b> on the sign-in page with that same email, set a password and verify your email.</p>', rel: ['s-reset'] },
  { id: 's-reset', c: 'sec', q: 'I forgot my password', k: 'forgot password reset login cant sign in locked',
    a: '<p>On the sign-in page, click <b>Forgot password?</b> and enter your email. A reset link arrives within a few minutes (check spam). It works once and expires.</p>', rel: ['s-signup'] },
  { id: 's-data', c: 'sec', q: 'Where is the data stored?', k: 'stored where data firebase google cloud server',
    a: '<p>In Google Cloud Firestore, protected by sign-in and server-side rules, with a copy cached in your browser so pages open fast. Each account\'s data is kept separately.</p>', rel: ['s-who-sees'] },
  { id: 's-signout', c: 'sec', q: 'How do I sign out?', k: 'sign out log out logout leave',
    a: '<p>Click your initials at the top of the sidebar, then <b>Sign out</b>.</p>' },
];
const GUIDE_BY = Object.fromEntries(GUIDE.map(g => [g.id, g]));
const GUIDE_START = { start: ['first-day', 'switch', 'subaccounts', 'setup', 'roles', 'tools'], app: ['brief-new', 'workflow', 'mywork', 'alerts', 'campaign-add', 'undo'],
  media: ['m-pacing', 'm-formulas', 'm-under', 'm-qa', 'm-weekly', 'm-learning'], sec: ['s-access', 's-owners', 's-who-sees', 's-viewer', 's-noaccess', 's-reset'] };
const GUIDE_FAQ = ['what', 'subaccounts', 'switch', 'roles', 'tools', 'workflow', 's-who-sees', 's-signup'];

// tiny keyword matcher: words in the question count most, then the extra keywords
const G_STOP = new Set('a an and are as at be can do does for from how i in is it me my of on or our should the to we what when where which who why with you your there this that'.split(' '));
const gWords = s => String(s).toLowerCase().replace(/[^a-z0-9+/ ]+/g, ' ').split(/\s+/).filter(w => w.length > 1 && !G_STOP.has(w));
const gStem = w => w.replace(/(ing|ed|es|s)$/, '');
function guideSearch(text) {
  const ws = gWords(text).map(gStem); if (!ws.length) return [];
  return GUIDE.map(g => {
    const qw = gWords(g.q).map(gStem), kw = gWords(g.k).map(gStem);
    let sc = 0;
    ws.forEach(w => {
      if (qw.includes(w)) sc += 3; else if (qw.some(x => x.startsWith(w) || (w.length > 3 && w.startsWith(x)))) sc += 2;
      if (kw.includes(w)) sc += 2; else if (kw.some(x => x.startsWith(w) || (w.length > 3 && w.startsWith(x)))) sc += 1;
    });
    const hitQ = qw.filter(x => ws.includes(x)).length;
    return { g, sc: sc / Math.sqrt(ws.length) + (sc ? hitQ / Math.max(qw.length, 1) : 0) };
  }).filter(x => x.sc > 0).sort((a, b) => b.sc - a.sc);
}

// Can this person use a "take me there" button right now?
function guideCan(t) {
  if (!t) return false;
  if (t === 'theme') return true;
  if (!S.ready) return false;
  if (t === '#/accounts' || t === '#/guide') return true;
  if (t === 'switcher') return myAccounts().length > 0;
  if (t === 'new-account' || t === 'people') return isBizAdmin();
  if (!S.acc) return t === 'access' && isBizAdmin();
  if (t === 'tools' || t === 'settings') return true;
  if (t === 'access') return canAdminAcc() || isBizAdmin();
  if (t === 'new-brief') return canEditAcc() && toolOn('briefs');
  if (t === 'new-task') return canEditAcc() && toolOn('lists');
  if (t === 'search') return true;
  if (t.startsWith('#/')) { const v = t.slice(2).split('/')[0]; return !TOOL_OF_VIEW[v] || toolOn(TOOL_OF_VIEW[v]); }
  return false;
}
function guideGo(t) {
  if (t === 'theme') { setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); if (S.ready) render(); return; }
  if (!guideCan(t)) return;
  closeGuide();
  if (t.startsWith('#/')) return go(t);
  if (/^#\/home/.test(location.hash)) go('#/');
  setTimeout(() => {
    if (t === 'switcher') { const b = document.querySelector('.acc-switch'); if (b) openAccMenu(b); else go('#/accounts'); }
    else if (t === 'new-account') openAccountForm();
    else if (t === 'people') { S.bz.tab = 'people'; go('#/business'); }
    else if (t === 'tools') openSettings('tools');
    else if (t === 'settings') openSettings();
    else if (t === 'access') { if (S.acc && canAdminAcc()) openAccessModal(S.acc.id); else { S.bz.tab = 'people'; go('#/business'); } }
    else if (t === 'new-brief') ACTIONS['br-new']({ dataset: {} });
    else if (t === 'new-task') ACTIONS['quick-add']({ dataset: {} });
    else if (t === 'search') openSearch();
  }, 80);
}

/* ---------- the chatbot ---------- */
const GB = { open: false, cat: 'start', log: [], auto: -1, helped: {} };
function guideFab() {
  let f = document.getElementById('gb-fab');
  if (!f) {
    f = document.createElement('button'); f.id = 'gb-fab'; f.className = 'gb-fab'; f.type = 'button';
    f.setAttribute('aria-label', 'Help - ask a question'); f.title = 'Help  ( ? )';
    f.innerHTML = `${ico('help')}<span class="lb">Help</span>`;
    f.addEventListener('click', () => openGuide());
    document.body.appendChild(f);
  }
  f.classList.toggle('hide', GB.open);
}
function openGuide(qid) {
  GB.open = true; guideFab();
  let el = document.getElementById('gb');
  if (!el) {
    el = document.createElement('section'); el.id = 'gb'; el.className = 'gb'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Help');
    document.body.appendChild(el);
    if (!GB.log.length) {
      const first = S.user && S.user.name && S.user.name !== 'Me' ? ' ' + esc(String(S.user.name).split(' ')[0]) : '';
      GB.log.push({ who: 'bot', html: `<p>Hi${first}. Ask me how to do something here, or pick a topic. I'll answer and take you to the right page.</p>`, sugg: GUIDE_START[GB.cat] });
    }
    gbPaint();
  }
  if (qid && GUIDE_BY[qid]) gbAsk(qid);
  setTimeout(() => { const i = el.querySelector('input'); if (i && matchMedia('(hover:hover)').matches) i.focus(); }, 60);
}
function closeGuide() {
  const el = document.getElementById('gb'); GB.open = false;
  if (el) { el.classList.add('out'); setTimeout(() => el.remove(), 160); }
  guideFab();
}
function gbMsgHTML(m, i) {
  if (m.who === 'me') return `<div class="gb-msg me">${esc(m.text)}</div>`;
  if (m.who === 'typing') return `<div class="gb-msg bot gb-typing" aria-label="typing"><i></i><i></i><i></i></div>`;
  const g = m.id && GUIDE_BY[m.id];
  const act = g && g.go && guideCan(g.go) ? `<div class="gb-acts"><button class="gb-act" data-gb-go="${g.go}">${esc(g.gl)} ${ico('arrowRight', 'i-sm')}</button></div>` : '';
  const help = g ? `<div class="gb-help">Helpful? <button data-gb-help="${i}:y" class="${GB.helped[i] === 'y' ? 'on' : ''}">Yes</button><button data-gb-help="${i}:n" class="${GB.helped[i] === 'n' ? 'on' : ''}">No</button></div>` : '';
  const body = `<div class="gb-msg bot">${g ? `<span class="gb-q">${esc(g.q)}</span>${g.a}` : m.html}${act}${help}</div>`;
  const sugg = (m.sugg || []).filter(id => GUIDE_BY[id]);
  return body + (sugg.length ? `<div class="gb-sugg">${m.suggT ? `<span class="t">${m.suggT}</span>` : ''}${sugg.map(id => `<button class="gb-chip" data-gb-q="${id}">${esc(GUIDE_BY[id].q)}</button>`).join('')}</div>` : '');
}
function gbPaint() {
  const el = document.getElementById('gb'); if (!el) return;
  el.innerHTML = `<header class="gb-head"><span class="gb-av">${ico('help')}</span><div><b>Help</b><small>Answers and shortcuts for ${esc(CFG.appName || 'Ads Workspace')}</small></div><span class="sp"></span>
      <button class="icon-btn" data-gb-reset title="Start over">${ico('repeat')}</button><button class="icon-btn" data-gb-close title="Close (Esc)">${ico('x')}</button></header>
    <nav class="gb-cats">${GUIDE_CATS.map(([id, label, short]) => `<button class="gb-cat ${GB.cat === id ? 'on' : ''}" data-gb-cat="${id}" title="${label}">${short}</button>`).join('')}</nav>
    <div class="gb-log" aria-live="polite">${GB.log.map(gbMsgHTML).join('')}</div>
    <div class="gb-auto" role="listbox"></div>
    <form class="gb-form" data-gb-form autocomplete="off"><input name="q" maxlength="200" placeholder="Ask, e.g. how do I give my team access?" aria-label="Your question"><button title="Ask">${ico('send')}</button></form>
    <div class="gb-foot">Built-in answers · nothing you type leaves this browser</div>`;
  const log = el.querySelector('.gb-log'); log.scrollTop = log.scrollHeight;
}
function gbPush(m) { GB.log.push(m); if (GB.log.length > 80) GB.log.splice(1, GB.log.length - 80); }
function gbReply(m, delay = 320) {
  gbPush({ who: 'typing' }); gbPaint();
  setTimeout(() => { const i = GB.log.findIndex(x => x.who === 'typing'); if (i >= 0) GB.log.splice(i, 1); gbPush(m); gbPaint(); }, delay);
}
function gbAsk(id) {
  const g = GUIDE_BY[id]; if (!g) return;
  gbPush({ who: 'me', text: g.q });
  gbReply({ who: 'bot', id, sugg: g.rel || [], suggT: g.rel && g.rel.length ? 'Related' : '' });
}
function gbType(text) {
  text = String(text).trim().slice(0, 200); if (!text) return;
  gbPush({ who: 'me', text });
  const hits = guideSearch(text);
  if (hits.length && hits[0].sc >= 2.2) {
    const g = hits[0].g;
    const more = hits.slice(1, 4).filter(h => h.sc >= 1.5).map(h => h.g.id);
    gbReply({ who: 'bot', id: g.id, sugg: more.length ? more : (g.rel || []), suggT: more.length ? 'You might also mean' : 'Related' }, 420);
  } else {
    gbReply({ who: 'bot', html: `<p>I don't have an answer for that yet. ${hits.length ? 'These are the closest I know:' : 'Try one of these, or pick a topic above:'}</p>`, sugg: hits.length ? hits.slice(0, 4).map(h => h.g.id) : GUIDE_START[GB.cat] }, 420);
  }
}
function gbAuto(input) {
  const box = input.closest('.gb').querySelector('.gb-auto');
  const v = input.value.trim(); GB.auto = -1;
  if (v.length < 2) { box.innerHTML = ''; return; }
  const words = gWords(v);
  const mark = q => { let h = esc(q); words.forEach(w => { if (w.length > 1) h = h.replace(new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')})`, 'ig'), '<mark>$1</mark>'); }); return h; };
  box.innerHTML = guideSearch(v).slice(0, 5).map(h => `<button type="button" data-gb-q="${h.g.id}" role="option">${ico('help')}<span>${mark(h.g.q)}</span></button>`).join('');
}
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-gb-q],[data-gb-cat],[data-gb-close],[data-gb-reset],[data-gb-go],[data-gb-help],[data-guide-open],[data-guide-go]');
  if (!t) return;
  if (t.dataset.guideGo) { e.preventDefault(); return guideGo(t.dataset.guideGo); }
  if (t.dataset.guideOpen !== undefined) { e.preventDefault(); return openGuide(t.dataset.guideOpen || undefined); }
  if (t.dataset.gbQ) { const inp = document.querySelector('.gb-form input'); if (inp) inp.value = ''; const b = document.querySelector('.gb-auto'); if (b) b.innerHTML = ''; return gbAsk(t.dataset.gbQ); }
  if (t.dataset.gbCat) { GB.cat = t.dataset.gbCat; const c = GUIDE_CATS.find(x => x[0] === GB.cat); gbPush({ who: 'bot', html: `<p><b>${c[1]}</b> - popular questions:</p>`, sugg: GUIDE_START[GB.cat] }); return gbPaint(); }
  if (t.dataset.gbClose !== undefined) return closeGuide();
  if (t.dataset.gbReset !== undefined) { GB.log.length = 0; GB.helped = {}; GB.cat = 'start'; document.getElementById('gb')?.remove(); return openGuide(); }
  if (t.dataset.gbHelp) {
    const [i, v] = t.dataset.gbHelp.split(':'); GB.helped[i] = v;
    if (v === 'n') { const g = GB.log[+i] && GUIDE_BY[GB.log[+i].id]; gbReply({ who: 'bot', html: '<p>Sorry about that. Try rephrasing, or one of these:</p>', sugg: (g && g.rel && g.rel.length ? g.rel : GUIDE_START[GB.cat]) }, 250); }
    else gbPaint();
    return;
  }
  if (t.dataset.gbGo) guideGo(t.dataset.gbGo);
});
document.addEventListener('submit', e => {
  const f = e.target.closest && e.target.closest('[data-gb-form]'); if (!f) return;
  e.preventDefault();
  const box = f.closest('.gb').querySelector('.gb-auto .on'), text = f.q.value;
  f.q.value = ''; f.closest('.gb').querySelector('.gb-auto').innerHTML = '';
  if (box) gbAsk(box.dataset.gbQ); else gbType(text);
});
document.addEventListener('input', e => { if (e.target.closest && e.target.closest('[data-gb-form]')) gbAuto(e.target); });
document.addEventListener('keydown', e => {
  const inGuide = e.target.closest && e.target.closest('#gb');
  if (inGuide && e.target.matches('.gb-form input') && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
    const items = [...document.querySelectorAll('.gb-auto button')]; if (!items.length) return;
    e.preventDefault(); GB.auto = (GB.auto + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items.forEach((b, i) => b.classList.toggle('on', i === GB.auto));
    return;
  }
  if (e.key === 'Escape' && GB.open && (inGuide || !document.querySelector('.overlay,.drawer,.menu'))) { e.stopImmediatePropagation(); closeGuide(); return; }
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
  if ((e.key === '?' || (e.key === '/' && e.shiftKey)) && !typing && !e.ctrlKey && !e.metaKey && !e.altKey && !document.querySelector('.overlay,.drawer,.auth')) { e.preventDefault(); GB.open ? closeGuide() : openGuide(); }
}, true);

/* ---------- the Guide page ---------- */
function guideSteps() {
  const accs = allAccounts(true), mine = myAccounts();
  const realAcc = accs.filter(a => !a.demo);
  const hasTeamAccess = accs.some(a => Object.keys((a.access || {}).teams || {}).length);
  const steps = [];
  if (isBizAdmin()) {
    steps.push(
      { t: 'Add your people', d: 'Business settings → People. Add everyone by work email and give them a job role.', done: bizMembers().length > 1, go: 'people', gl: 'Add people' },
      { t: 'Group them into teams', d: 'One team per client group works well, for example the GM team.', done: bizTeams().length > 0, go: 'teams', gl: 'Make a team' },
      { t: 'Create a client account', d: 'Name, logo and sector. It shows in everyone\'s account switcher once they have access.', done: (realAcc.length || accs.length) > 0, go: 'new-account', gl: 'Create an account' },
      { t: 'Give teams access', d: 'Admin, Editor or Viewer per team, or per person.', done: hasTeamAccess, go: 'access', gl: 'Set access' });
  }
  steps.push(
    { t: 'Open your account', d: 'Use the switcher at the top of the sidebar. All accounts shows everything you can open.', done: !!S.acc, go: 'switcher', gl: 'Switch account' },
    { t: 'Choose the tools', d: 'Account settings → Tools. Start with the essentials; switch on extras when they\'re needed.', done: !!(S.acc && S.acc.modules && Object.keys(S.acc.modules).length), go: 'tools', gl: 'Open Tools', admin: true },
    { t: 'Submit or pick up a brief', d: 'Every request starts as a brief, so the workflow, owners and deadlines are tracked.', done: !!S.acc && Object.keys(S.data.briefs || {}).length > 0, go: 'new-brief', gl: 'New brief' },
    { t: 'Check My work and Alerts each morning', d: 'My work shows what\'s waiting on you; Alerts shows what\'s late or at risk.', done: lsGet('tb:seenMyWork') === '1', go: '#/mywork', gl: 'Open My work' });
  return steps.filter(s => !s.admin || (S.acc && canAdminAcc()));
}
function renderGuide() {
  const steps = guideSteps(), done = steps.filter(s => s.done).length;
  const roleRows = [['Owner', 'Everything a business admin can do, plus adding and removing other owners', true, true, true, true],
    ['Business admin', 'Adds people and teams, creates accounts, sees every account', true, true, true, true],
    ['Account admin', 'Runs one account: name, logo, access and tools', false, true, true, true], ['Editor', 'Does the work: briefs, tasks, campaigns, notes', false, false, true, true],
    ['Viewer', 'Sees the account, changes nothing', false, false, false, true]];
  const yes = v => v ? `<span class="gd-yes">${ico('check', 'i-sm')}<span class="sr">Yes</span></span>` : '<span class="mut">-</span>';
  const biz = go => go === 'people' || go === 'teams';
  const btn = (go, label) => (biz(go) ? isBizAdmin() : guideCan(go))
    ? `<button class="btn sm" ${biz(go) ? `data-action="gd-biz" data-t="${go}"` : `data-guide-go="${go}"`}>${esc(label)} ${ico('arrowRight', 'i-sm')}</button>` : '';
  return topbar('Help /') + `<div class="content"><div class="gd">
    <div class="page-head"><h1>Guide</h1><div class="page-desc empty" style="cursor:default">How the platform fits together, and what to do first. Press <kbd>?</kbd> any time to ask a question.</div></div>
    <section class="gd-sec">
      <div class="gd-h"><h2>Get started</h2><span class="mut">${done} of ${steps.length} done</span></div>
      <div class="gd-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${steps.length}" aria-valuenow="${done}"><i style="width:${Math.round(done / Math.max(steps.length, 1) * 100)}%"></i></div>
      <ol class="gd-steps">${steps.map((s, i) => `<li class="${s.done ? 'done' : ''}"><span class="gd-n">${s.done ? ico('check', 'i-sm') : i + 1}</span><div><b>${esc(s.t)}</b><p>${esc(s.d)}</p></div>${s.done ? '' : btn(s.go, s.gl)}</li>`).join('')}</ol>
    </section>
    <section class="gd-sec">
      <div class="gd-h"><h2>How it fits together</h2></div>
      <div class="gd-flow">
        <div class="gd-node"><small>1</small><b>Business</b><span>People and teams, managed by business admins</span></div><span class="gd-arr">${ico('arrowRight')}</span>
        <div class="gd-node"><small>2</small><b>Accounts</b><span>One per client, with its own logo and data</span></div><span class="gd-arr">${ico('arrowRight')}</span>
        <div class="gd-node"><small>3</small><b>Access</b><span>Teams or people get Admin, Editor or Viewer</span></div><span class="gd-arr">${ico('arrowRight')}</span>
        <div class="gd-node"><small>4</small><b>Tools</b><span>Each account switches on only what it needs</span></div>
      </div>
    </section>
    <section class="gd-sec">
      <div class="gd-h"><h2>Who can do what</h2>${S.acc ? `<span class="mut">Your access to ${esc(S.acc.name)}: ${roleTag(S.accRole)}</span>` : ''}</div>
      <div class="tbl-wrap"><table class="tbl gd-roles"><thead><tr><th>Role</th><th>In short</th><th>People, teams &amp; accounts</th><th>Account access &amp; tools</th><th>Do the work</th><th>See the account</th></tr></thead>
        <tbody>${roleRows.map(([r, d, ...c]) => `<tr><td><b>${r}</b></td><td class="mut">${d}</td>${c.map(v => `<td>${yes(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    </section>
    ${S.acc ? `<section class="gd-sec">
      <div class="gd-h"><h2>Tools in ${esc(S.acc.name)}</h2>${canAdminAcc() ? `<button class="btn sm" data-guide-go="tools">Change tools ${ico('arrowRight', 'i-sm')}</button>` : ''}</div>
      <div class="gd-tools">${TOOLS.map(([k, l, i, d]) => `<div class="gd-tool ${toolOn(k) ? 'on' : ''}">${ico(i)}<div><b>${esc(l)}</b><span>${esc(d)}</span></div><em>${toolOn(k) ? 'On' : 'Off'}</em></div>`).join('')}</div>
    </section>` : ''}
    <section class="gd-sec">
      <div class="gd-h"><h2>Common questions</h2><button class="btn sm" data-guide-open>${ico('help', 'i-sm')} Ask a question</button></div>
      <div class="gd-faq">${GUIDE_CATS.map(([c, label]) => `<div><h3>${label}</h3>${GUIDE_START[c].slice(0, 5).map(id => `<button class="gd-q" data-guide-open="${id}">${esc(GUIDE_BY[id].q)}</button>`).join('')}</div>`).join('')}</div>
    </section>
  </div></div>`;
}

/* ===================== doodles ===================== */
// Doable's own line-art cast. Drawn once as SVG so they follow the theme (ink + paper colours) and animate in CSS.
const DD_HAIR = {
  curly: '<path class="hr" d="M37 52c-6-12 0-26 11-29 3-8 14-11 21-6 9-3 18 3 19 12 7 5 6 15 1 21-2-7-7-11-13-11-5 4-12 6-19 3-6 3-13 6-20 10z"/>',
  bob: '<path class="hr" d="M35 74c-8-22-4-48 25-50 26-1 32 22 26 50-4-1-5-8-5-16-1-8-3-12-5-15-10 2-24-2-31-9-4 9-6 16-6 22 0 8 0 13-4 18z"/>',
  beanie: '<path class="fk st" d="M37 46c0-15 10-24 23-24s23 9 23 24z"/><path class="ln" d="M35 47h50"/><circle class="fk st" cx="60" cy="18" r="5"/>',
  buzz: '<path class="hr bz" d="M38.2 52C36.6 35 47 28 60 28s23.4 7 21.8 24c-2.6-7.2-9.6-11.4-21.8-11.4S40.8 44.8 38.2 52z"/>',
  short: '<path class="hr" d="M38 48c-2-15 8-25 22-25 13 0 23 8 22 22-6-6-13-8-21-6-8 2-15 5-23 9z"/>',
  bun: '<circle class="hr" cx="60" cy="19" r="8.5"/><path class="hr" d="M38 50c-1-15 9-24 22-24s23 9 22 24c-7-8-15-10-22-9-8 1-15 4-22 9z"/>',
};
const DD_PROP = {
  gauge: '<path class="pp" d="M28 146a32 32 0 0 1 64 0z"/><path class="ln thin" d="M35 140l5 1M60 118v5M85 140l-5 1M43 125l4 4M77 125l-4 4"/>'
    + '<g class="needle"><path class="ln" d="M60 146l0-22" style="stroke-width:3"/></g><circle class="ik" cx="60" cy="146" r="3.5"/>'
    + '<circle class="pp" cx="28" cy="146" r="6.5"/><circle class="pp" cx="92" cy="146" r="6.5"/>',
  clip: '<rect class="pp" x="33" y="106" width="54" height="56" rx="5"/><rect class="ik" x="50" y="101" width="20" height="8" rx="2.5"/>'
    + [0, 1, 2].map(i => `<rect class="pp" x="40" y="${117 + i * 13}" width="8" height="8" rx="2" style="stroke-width:1.8"/><path class="ln thin" d="M54 ${121 + i * 13}h25"/><path class="ln tick t${i + 1}" pathLength="1" d="M41.5 ${121 + i * 13}l2.5 2.5 5-6" style="stroke:var(--sw-green);stroke-width:2.6"/>`).join('')
    + '<circle class="pp" cx="33" cy="134" r="6.5"/><circle class="pp" cx="87" cy="134" r="6.5"/>',
  mega: '<path class="fo st" d="M56 120l30-15v42l-30-15z"/><rect class="pp" x="44" y="118" width="14" height="16" rx="3"/><path class="ln" d="M50 134l-2 12"/>'
    + '<path class="ln wave" d="M95 114q7 12 0 24"/><path class="ln wave w2" d="M103 108q10 18 0 36"/><circle class="pp" cx="47" cy="146" r="6.5"/>',
  note: '<path class="pp" d="M28 118l32 6 32-6v36l-32 6-32-6z"/><path class="ln" d="M60 124v36"/><path class="ln thin" d="M35 129l18 3M35 137l18 3M35 145l12 2M67 132l18-3M67 140l14-2"/>'
    + '<g class="pen"><path class="ln" d="M92 104l-12 26" style="stroke-width:3.2"/><path class="ik" d="M80 130l-1.5 5 4-3z"/><circle class="pp" cx="93" cy="104" r="6.5"/></g><circle class="pp" cx="30" cy="150" r="6.5"/>',
  wave: '<g class="arm"><path class="ln" d="M88 112q10-18 12-40" style="stroke-width:9;stroke:var(--ink)"/><path class="ln" d="M88 112q10-18 12-40" style="stroke-width:5;stroke:var(--d-c)"/><circle class="pp" cx="100" cy="68" r="7"/></g>',
  laptop: '<path class="pp" d="M34 122h52l6 26H28z"/><path class="ln" d="M24 150h72"/><circle class="ik" cx="60" cy="134" r="2.4"/><circle class="pp" cx="34" cy="148" r="6"/><circle class="pp" cx="86" cy="148" r="6"/>',
};
const DD_TINT = { navy: 'fn', black: 'fx', yellow: 'fy', blue: 'fb', pink: 'fk', green: 'fg', purple: 'fp', orange: 'fo' };

// Joana: long dark-brown hair, beige cap, black over-ear headphones, thin round gold glasses, big smile, black tee.
const JOANA_HEAD = `<path class="jh" d="M38.5 50c-3.5 22-4.5 44-8.5 70 5 2.4 10.5 1.8 14-.6.6-21 1.2-44 1.6-63zM81.5 50c3.5 22 4.5 44 8.5 70-5 2.4-10.5 1.8-14-.6-.6-21-1.2-44-1.6-63z"/>
    <path class="ln thin" d="M36 72q-1 16-3 34M84 72q1 16 3 34" style="stroke-width:1.3"/>
    <ellipse class="pp" cx="60" cy="55" rx="22" ry="25"/>
    <path class="jh" d="M38.4 50c1.6 6 3 9.6 4.6 12 1.6-6.4 2.2-10 2.4-13zM81.6 50c-1.6 6-3 9.6-4.6 12-1.6-6.4-2.2-10-2.4-13z"/>
    <path class="cap st" d="M37 47c0-15 10-24.5 23-24.5S83 32 83 47z"/><circle class="cap st" cx="60" cy="22.5" r="2.4"/>
    <path class="ln thin" d="M60 25v21M49 27q-3 9-3 19M71 27q3 9 3 19" style="stroke-width:1.2"/>
    <path class="cap st" d="M33.5 46.5c9 4.6 44 4.6 53 0l-1.4 5.4c-9.6 3.6-40.6 3.6-50.2 0z"/>
    <path class="ln" d="M29 58c-2.4-25 11-38.5 31-38.5S93.4 33 91 58" style="stroke-width:4.4"/>
    <rect class="hp st" x="24.5" y="49" width="11" height="19" rx="5"/><rect class="hp st" x="84.5" y="49" width="11" height="19" rx="5"/>
    <path class="ln" d="M47.8 57.2q3.6-3.4 7.2 0M65 57.2q3.6-3.4 7.2 0" style="stroke-width:2.1"/>
    <g class="wg"><circle cx="51.4" cy="57" r="6.6"/><circle cx="68.6" cy="57" r="6.6"/><path d="M58 56.2q2-1.4 4 0"/></g>
    <circle cx="45" cy="64.5" r="3" class="blush"/><circle cx="75" cy="64.5" r="3" class="blush"/>
    <path class="ln" d="M60 60.5l-2 4.4h3.4" style="stroke-width:1.6"/>
    <path class="pp" d="M51.6 68.2c2.8 7.4 14 7.4 16.8 0z" style="stroke-width:2"/><path class="ln thin" d="M52.6 69.8h14.8" style="stroke-width:1.1"/>`;
const joana = (kind = 'laptop', cls = '') => doodle(kind, { head: JOANA_HEAD, tint: 'black', cls: 'dd-joana ' + cls });
// Drawn from Mario's photo: short dark crop, fuller face, thick brows, round tortoiseshell glasses,
// moustache and a short boxed beard, navy tee.
const MARIO_HEAD = `<path class="pp" d="M37.5 54c-6-1.5-7.5 10.5-.5 12"/><path class="pp" d="M82.5 54c6-1.5 7.5 10.5.5 12"/>
    <ellipse class="pp" cx="60" cy="55" rx="23.5" ry="25.5"/>
    <path class="brd" d="M37 57c.6 14.5 9.5 23.5 23 23.5s22.4-9 23-23.5c-1.6 6.5-4.5 10.8-8.6 13.2-3.2-3.6-8.3-5-14.4-5s-11.2 1.4-14.4 5C41.5 67.8 38.6 63.5 37 57z"/>
    <path class="hr" d="M36.6 52.5C35 36.5 45 27 60 27s25 9.5 23.4 25.5c-1.4-4.6-2.4-7.6-3.6-9.6-6-3.4-12.4-4.6-19.8-4.6s-13.8 1.2-19.8 4.6c-1.2 2-2.2 5-3.6 9.6z"/>
    <path class="ln thin" d="M46 33.5l1.5 2.5M54 31l1 2.6M62 30.6l.4 2.8M70 31.8l-.6 2.7" style="stroke:var(--paper);opacity:.35"/>
    <path class="ln" d="M44.5 47.6q6.5-3.4 12.6-.6M62.9 47q6.1-2.8 12.6.6" style="stroke-width:3.2"/>
    <g class="eyes"><circle class="ik" cx="51.5" cy="55.5" r="1.9"/><circle class="ik" cx="68.5" cy="55.5" r="1.9"/></g>
    <g class="gl"><circle cx="51.5" cy="55.5" r="7.2"/><circle cx="68.5" cy="55.5" r="7.2"/><path d="M58.7 54.4q1.3-1.6 2.6 0M44.3 53.6l-6.3-1.4M75.7 53.6l6.3-1.4"/></g>
    <path class="ln" d="M60 59l-2.6 6.2h4.4" style="stroke-width:1.8"/>
    <path class="ms" d="M50.5 70.6c2.6-3 6-3.8 9.5-2.3 3.5-1.5 6.9-.7 9.5 2.3-3.3-.6-6.4-.4-9.5.6-3.1-1-6.2-1.2-9.5-.6z"/>
    <path class="ln" d="M55.4 74.4q4.6 1.5 9.2 0" style="stroke-width:1.9"/>`;
const mario = (kind = 'guide', cls = '') => doodle(kind, { head: MARIO_HEAD, tint: 'navy', cls: 'dd-me ' + cls, vb: kind === 'guide' ? '10 17 100 100' : '' });
function doodle(kind, o = {}) {
  if (kind === 'bot') return `<svg class="dd dd-bot ${o.cls || ''}" viewBox="0 0 120 120" aria-hidden="true"><g class="bob">
    <path class="ln" d="M60 26V13"/><circle class="fy st bulb" cx="60" cy="10" r="5.5"/>
    <rect class="fk st" x="14" y="46" width="10" height="24" rx="5"/><rect class="fk st" x="96" y="46" width="10" height="24" rx="5"/>
    <rect class="pp" x="22" y="26" width="76" height="64" rx="28"/>
    <rect class="ik" x="33" y="39" width="54" height="38" rx="17"/>
    <g class="eyes"><rect x="46" y="49" width="7" height="12" rx="3.5" fill="var(--paper)"/><rect x="67" y="49" width="7" height="12" rx="3.5" fill="var(--paper)"/></g>
    <path d="M53 67q7 5 14 0" fill="none" stroke="var(--paper)" stroke-width="2.4" stroke-linecap="round"/>
    <path class="fb st" d="M42 90h36l7 22H35z"/></g></svg>`;
  const shirt = DD_TINT[o.tint || 'yellow'];
  return `<svg class="dd dd-${kind} ${o.cls || ''}" viewBox="${o.vb || '0 0 120 165'}" aria-hidden="true" style="--d-c:var(--d-${o.tint || 'yellow'})"><g class="bob">
    <path class="${shirt} st" d="M20 165c0-44 17-76 40-76s40 32 40 76"/>
    <path class="ln" d="M50 90q10 10 20 0"/>
    <path class="pp" d="M53 78v10q7 5 14 0V78"/>
    ${o.head || `<ellipse class="pp" cx="60" cy="54" rx="22" ry="25"/>
    ${DD_HAIR[o.hair || 'short']}
    <g class="eyes"><circle class="ik" cx="51.5" cy="57" r="2"/><circle class="ik" cx="68.5" cy="57" r="2"/></g>
    <path class="ln" d="M60 60l-2.5 6h4" style="stroke-width:1.8"/><path class="ln" d="M53 70q7 5 14 0"/>
    ${o.glasses ? '<circle class="ln" cx="51.5" cy="57" r="6" style="stroke-width:1.8"/><circle class="ln" cx="68.5" cy="57" r="6" style="stroke-width:1.8"/><path class="ln" d="M57.5 57h5" style="stroke-width:1.8"/>' : ''}`}
    ${DD_PROP[kind] || ''}</g></svg>`;
}


/* =====================================================================
   HOMEPAGE - the same page as Doable's: the line-art team on the hero,
   a product tour, feature cards that play on hover, media performance,
   built-in help, FAQ. Content is about client accounts; the product
   pictures are drawn in HTML with example accounts, not live data.
   ===================================================================== */
function homeHTML(signedIn) {
  const name = esc(CFG.appName || 'Ads Workspace');
  const dark = document.documentElement.dataset.theme === 'dark';
  const cta = signedIn
    ? `<button class="h-btn h-primary" data-go="#/">Open my accounts ${ico('arrowRight', 'i-sm')}</button><button class="h-btn h-blue" data-guide-open>${ico('help', 'i-sm')} Ask a question</button>`
    : `<button class="h-btn h-primary" data-home="in">Sign in ${ico('arrowRight', 'i-sm')}</button><button class="h-btn h-blue" data-guide-open>${ico('help', 'i-sm')} Ask a question</button>`;
  // feature cards keep their little animated previews (they play on hover)
  const feat = (cls, icon, kicker, title, text, prev) => `<div class="h-feat ${cls} rv" tabindex="0"><div class="h-prev" aria-hidden="true">${prev}</div><span class="h-fi">${ico(icon)}${kicker}</span><h3>${title}</h3><p>${text}</p></div>`;
  const pvCard = (w, cls = '') => `<span class="pv-card ${cls}"><i class="pv-ring"></i><i class="pv-line" style="width:${w}%"></i></span>`;
  const PV_BOARD = `<div class="pv-board">
      <div class="pv-col"><b>Chevrolet</b>${pvCard(70)}${pvCard(52)}</div>
      <div class="pv-col"><b>GMC</b>${pvCard(64)}<span class="pv-slot"></span></div>
      <div class="pv-col"><b>Cadillac</b>${pvCard(58, 'done')}</div>
      <span class="pv-card pv-fly"><i class="pv-ring"><svg viewBox="0 0 24 24">${P.check}</svg></i><i class="pv-line" style="width:60%"></i></span>
      <span class="pv-cursor"></span></div>`;
  const PV_CAMP = `<div class="pv-camp"><div class="pv-ct"><i class="pv-line" style="width:46%"></i><span class="pv-live">● Live</span></div>
      <div class="pv-chips"><span class="pv-chip">Meta · Lead Gen</span><span class="pv-chip pv-snap"><i class="pv-bars"></i>Snap</span><span class="pv-chip">Search</span></div>
      <div class="pv-pace"><span>Pacing</span><i class="pv-meter"><i></i></i><em>Healthy</em></div>
      <div class="pv-wk"><span>Weekly check</span><em class="pv-due">Due</em><em class="pv-done">✓ Done</em></div></div>`;
  const PV_FLOW = `<div class="pv-flow"><div class="pv-steps">${['Kick-off', 'Plan', 'Approval', 'Setup', 'Live'].map((l, i) => `<span class="pv-st s${i}"><i><svg viewBox="0 0 24 24">${P.check}</svg></i>${l}</span>`).join('')}</div>
      <div class="pv-prog"><i></i></div><div class="pv-fnote"><span>Next: <b>Setup</b> · Paid Search</span><em>SLA 2 days</em></div></div>`;
  const PV_WS = `<div class="pv-ws"><div class="pv-wsbtn"><i class="pv-av a2">GM</i><i class="pv-line" style="width:48%"></i></div>
      <div class="pv-menu"><span class="pv-hl"></span><span class="pv-row"><i class="pv-av a2">GM</i>General Motors</span><span class="pv-row sub"><i class="pv-av a4">GC</i>GM Cadillac</span>
      <span class="pv-row sub2"><i class="pv-av a3">AG</i>Al Ghanim Cadillac <em>Dealer</em></span><span class="pv-inv">+ Add a sub-account</span></div></div>`;
  const PV_ACC = `<div class="pv-acc"><span class="pv-ar"><b>GM team</b><em class="pv-role">Editor</em></span><span class="pv-ar"><b>Leadership</b><em class="pv-role v">Viewer</em></span>
      <span class="pv-ar"><b>Retail &amp; FMCG team</b><em class="pv-role n">No access</em><em class="pv-role v flip">Viewer</em></span><span class="pv-inh">Covers General Motors and its 6 sub-accounts</span></div>`;

  // the product tour: one window, five views
  const card = (title, meta, p, done, mc = '') => `<div class="hm-card ${done ? 'done' : ''}"><span class="hm-check p${p}">${done ? ico('check') : ''}</span><div><b>${title}</b><i class="${mc}">${meta}</i></div></div>`;
  const camp = (t, acc, st, tags, stats) => `<div class="hm-camp"><div class="t">${t}<span class="st ${st === 'Live' ? 'st-live' : 'st-pend'}">● ${st}</span></div><div class="acc">${acc}</div><div class="hm-tags">${tags}</div><div class="hm-stat">${stats}</div></div>`;
  const pgi = (icon, tint) => `<span class="pgi pi-${tint}" style="background:var(--pi-bg);color:var(--pi-fg)">${ico(icon)}</span>`;
  const accRow = (ini, color, nm, sub, n, d = 0) => `<div class="hm-acc" style="--d:${d}"><span class="hm-tile sw-${color}">${ini}</span><div><b>${nm}</b><i>${sub}</i></div><em>${n}</em></div>`;
  const step = (label, st) => `<span class="hm-step ${st}"><i>${st === 'done' ? ico('check') : ''}</i>${label}</span>`;
  const TOUR = [
    { id: 'todo', icon: 'inbox', label: 'To-Do', side: 1, capt: 'One board per account, one section per brand. Drag, repeat, assign and track sub-task progress.',
      html: `<div class="hm-h">${pgi('inbox', 'red')}To-Do <span style="font-size:13px;font-weight:500;color:var(--muted)">· General Motors</span></div><div class="hm-board five">
        <div class="hm-col"><h5><span>Chevrolet</span><em>2</em></h5>${card('Weekly pacing check', 'Today · repeats', 1)}${card('Year-End lead-form creatives', 'Saturday', 2, false, 'tm')}</div>
        <div class="hm-col"><h5><span>GMC</span><em>2</em></h5>${card('Yukon search terms', 'Tomorrow', 3)}${card('Monthly performance deck', 'Monday', 4, true, 'mu')}</div>
        <div class="hm-col"><h5><span>Cadillac</span><em>2</em></h5>${card('Pixel QA on landing pages', 'Overdue · 18 Nov', 1, false, 'od')}${card('Escalade IQ recap', 'Sunday', 3, false, 'mu')}</div>
        <div class="hm-col"><h5><span>OnStar</span><em>1</em></h5>${card('Budget and keyword review', 'Tuesday', 3, false, 'mu')}</div>
        <div class="hm-col"><h5><span>ACDelco</span><em>2</em></h5>${card('Parts search report', 'Wednesday', 3, false, 'mu')}${card('Brand-safety exclusions', 'Every month', 2, false, 'mu')}</div></div>` },
    { id: 'acc', icon: 'grid', label: 'Accounts', side: 5, capt: 'Every client is its own account, with brands and dealers as sub-accounts. Each team sees only the ones it works on.',
      html: `<div class="hm-h">${pgi('grid', 'purple')}All accounts</div><div class="hm-accs">
        ${accRow('GM', 'blue', 'General Motors', 'Automotive · GM team, Leadership', '6 briefs')}
        ${accRow('GC', 'yellow', 'GM Chevrolet', 'Brand', '2 briefs', 1)}${accRow('AC', 'teal', 'AGA Chevrolet', 'Dealer', '1 brief', 2)}
        ${accRow('GC', 'grey', 'GM Cadillac', 'Brand', '1 brief', 1)}${accRow('AG', 'green', 'Al Ghanim Cadillac', 'Dealer', '1 brief', 2)}
        ${accRow('S', 'grey', 'Siddiqi', 'Luxury retail · Retail & FMCG team', '3 briefs')}${accRow('F', 'red', 'Ferrero', 'FMCG · Retail & FMCG team', '3 briefs')}</div>` },
    { id: 'brief', icon: 'brief', label: 'Briefs', side: 2, capt: 'Every request comes in as a brief. Each step has an owner and an SLA, and the next person is told when it\'s their turn.',
      html: `<div class="hm-note"><div class="hm-h">${pgi('brief', 'purple')}Chevrolet Year-End Sales Event</div><div class="tags"><span class="hm-tag">Tactical / promotion</span><span class="hm-tag">UAE, KSA</span><span class="hm-tag pf">Search · Meta · Snap · TikTok</span></div>
        <div class="hm-flow">${step('Kick-off', 'done')}${step('Media plan', 'done')}${step('Client approval', 'done')}${step('Setup', 'done')}${step('QA', 'done')}${step('Live', 'now')}${step('Report', '')}</div>
        <h6>Steps</h6><div class="hm-todo"><i></i><span>First optimisation check (72h) · Paid Search · due Monday</span></div>
        <div class="hm-todo done"><i>${ico('check')}</i><span>Pre-launch QA and go-live · Analytics · on time</span></div>
        <div class="hm-todo done"><i>${ico('check')}</i><span>Client approval of plan · Account Lead · 1 day late</span></div></div>` },
    { id: 'camp', icon: 'campaign', label: 'Campaigns', side: 3, capt: 'Status, pacing, creatives and weekly checks for every flight, with platform pauses and pacing sheets one click away.',
      html: `<div class="hm-h">${pgi('campaign', 'orange')}Campaign Tracker</div><div class="hm-tabsrow"><span class="on">All ad accounts</span><span>Chevrolet</span><span>GMC</span><span>Cadillac</span></div><div class="hm-camps">
        ${camp('Escalade - Always On', 'GM Cadillac', 'Live', '<span class="hm-tag">KSA</span><span class="hm-tag">UAE</span><span class="hm-tag pf">Meta · Leads</span><span class="hm-tag pz">❚❚ Snap</span>', '<span>Pacing <b class="ok">Healthy</b></span><span>Weekly <b class="ok">Done</b></span>')}
        ${camp('Year-End Sales Event', 'GM Chevrolet', 'Live', '<span class="hm-tag">KSA</span><span class="hm-tag">UAE</span><span class="hm-tag pf">Search · Conv</span><span class="hm-tag pf">Snap · Leads</span>', '<span>Pacing <b class="warn">Under</b></span><span>Weekly <b class="bad">Due</b></span>')}
        ${camp('Yukon - Search conquest', 'GM GMC', 'Live', '<span class="hm-tag">UAE</span><span class="hm-tag">KSA</span><span class="hm-tag pf">Search · Conv</span>', '<span>Creatives <b class="warn">Partly missing</b></span>')}
        ${camp('Ramadan 2027 offers', 'General Motors', 'Pending', '<span class="hm-tag">KSA</span><span class="hm-tag">UAE</span><span class="hm-tag pf">Meta · Leads</span>', '<span>Starts in 12 days</span>')}</div>` },
    { id: 'dash', icon: 'chart', label: 'Dashboard', side: 4, capt: 'Briefs received and live, steps on time, bottlenecks and campaigns. For any week, month or quarter.',
      html: `<div class="hm-h">${pgi('chart', 'blue')}Dashboard <span style="font-size:13px;font-weight:500;color:var(--muted)">· This quarter</span></div>
        <div class="hm-kpis"><div class="hm-kpi"><b>86%</b>Steps on time</div><div class="hm-kpi"><b>15d</b>Brief to live</div><div class="hm-kpi"><b>14</b>Campaigns live</div><div class="hm-kpi"><b>6</b>Platforms used</div></div>
        <div class="hm-bars">${[38, 62, 48, 80, 66, 92, 74, 58].map(h => `<i style="height:${h}%"></i>`).join('')}</div><div class="hm-axis"><span>Week 1</span><span>Week 4</span><span>Week 8</span></div>` },
  ];
  const sideRow = (i, inner) => `<p data-tour-side="${i}">${inner}</p>`;
  const media = (icon, tint, title, text, d) => `<div class="h-mi rv d${d}"><span class="ic pi-${tint}">${ico(icon)}</span><b>${title}</b><span>${text}</span></div>`;
  const faq = GUIDE_FAQ.map(id => GUIDE_BY[id]).filter(Boolean).map(g => `<details><summary>${esc(g.q)}${ico('plus')}</summary><div class="ans">${g.a}</div></details>`).join('');
  const ground = `<svg class="h-ground" viewBox="0 0 800 10" preserveAspectRatio="none" aria-hidden="true"><path d="M2 6c120-3 240 2 380-1s280 3 416-1"/></svg>`;
  return `<div class="home">
    <header class="h-nav"><div class="h-wrap">
      <a class="h-brand" href="#top" data-scroll>${logoMark('h-logo')}<span class="brand-sep"></span>${wordmark()}</a>
      <nav class="h-links"><a href="#tour" data-scroll>Product</a><a href="#media" data-scroll>For media teams</a><a href="#guide" data-scroll>Help</a><a href="#faq" data-scroll>FAQ</a></nav>
      <div class="h-actions">
        <button class="h-theme" data-home-theme title="${dark ? 'Light' : 'Dark'} mode">${ico(dark ? 'sun' : 'moon')}</button>
        ${signedIn ? `<button class="h-btn h-primary sm" data-go="#/">Open app</button>` : `<button class="h-btn h-primary sm" data-home="in">Sign in</button>`}
      </div></div>
    </header>
    <div class="h-wrap" id="top">
      <section class="h-hero">
        <a class="h-pill" href="#guide" data-scroll><b>New</b> Sub-accounts for brands and dealers, plus built-in help ${ico('arrowRight', 'i-sm')}</a>
        <h1>The workspace for <em>every client<svg viewBox="0 0 300 20" preserveAspectRatio="none"><path pathLength="1" d="M4 14C70 6 160 4 296 10"/></svg></em>.</h1>
        <p class="h-sub">Briefs, campaign tracking, to-dos and dashboards for each client account, in one calm place. Built for agencies running Meta, Snap, TikTok, Search and YouTube.</p>
        <div class="h-cta">${cta}</div>
        <div class="h-note">Each team sees only its own accounts · Syncs live · Works on any device</div>
        <div class="h-scene" aria-hidden="true">
          ${doodle('gauge', { hair: 'curly', tint: 'yellow' })}${doodle('clip', { hair: 'bob', tint: 'blue', glasses: true })}${mario('wave', 'dd-mario')}${joana('laptop')}${doodle('mega', { hair: 'beanie', tint: 'green' })}${doodle('note', { hair: 'bun', tint: 'purple' })}
          ${ground}
          <span class="h-chip c1"><span class="dot"></span>Escalade · Live</span>
          <span class="h-chip c2">${ico('okcircle')}Weekly check done</span>
          <span class="h-chip c3">${ico('gauge')}Pacing 98%</span>
        </div>
      </section>
      <div class="h-plats rv"><span class="lbl">Track campaigns across</span>${['Meta', 'Snapchat', 'TikTok', 'Google Search', 'PMax', 'YouTube', 'LinkedIn', 'X'].map(p => `<span class="h-plat">${p}</span>`).join('')}</div>

      <section class="h-sec h-center" id="tour">
        <div class="h-eyebrow rv">${ico('sidebar')}One workspace</div>
        <h2 class="h-h2 rv d1">Every client account, side by side.</h2>
        <div class="h-tabs rv d2" role="tablist">${TOUR.map((t, i) => `<button class="h-tab ${i ? '' : 'on'}" role="tab" data-tour="${i}">${ico(t.icon)}${t.label}<i class="bar"></i></button>`).join('')}</div>
        <div class="h-window rv d3">
          <div class="hm-bar"><i></i><i></i><i></i><span>dentsu ${name}</span></div>
          <div class="hm-body">
            <div class="hm-side">${logoMark('hm-logo')}
              <div class="hm-switch"><span class="hm-tile sw-blue">GM</span><span><small>Account</small><b>General Motors</b></span></div>
              ${sideRow(0, `${ico('inbox')}My work <em>4</em>`)}${sideRow(2, `${ico('brief')}Briefs <em>5</em>`)}${sideRow(3, `${ico('campaign')}Campaign Tracker <em>2</em>`)}${sideRow(4, `${ico('chart')}Dashboard`)}
              <p class="hd">Lists</p>${sideRow(1, `<s class="tx-red">#</s> To-Do <em>10</em>`)}
              <p class="hd">Business</p>${sideRow(5, `${ico('grid')}All accounts <em>10</em>`)}</div>
            <div class="hm-panes">${TOUR.map((t, i) => `<div class="hm-pane ${i ? '' : 'on'}" data-side="${t.side}" data-capt="${esc(t.capt)}">${t.html}</div>`).join('')}</div>
          </div>
        </div>
        <p class="h-capt" id="h-capt">${esc(TOUR[0].capt)}</p>
      </section>

      <section class="h-sec" id="features">
        <div class="h-eyebrow rv">${ico('sparkle')}Features</div>
        <h2 class="h-h2 rv d1">Less chasing. More doing.</h2>
        <p class="h-lead rv d2">Hover a card to see it in action.</p>
        <div class="h-feats">
          ${feat('fc-red', 'inbox', 'Boards', 'A section per brand', 'Chevrolet, GMC, Cadillac, OnStar, ACDelco. Drag cards where they belong, and repeat anything daily, weekly or monthly.', PV_BOARD)}
          ${feat('fc-orange', 'campaign', 'Campaign Tracker', 'Every flight at a glance', 'Status, pacing, creatives and weekly checks. Pause a platform mid-flight and keep the history.', PV_CAMP)}
          ${feat('fc-yellow', 'brief', 'Briefs & workflow', 'Every request, every step', 'One template for every brief. Each step has an owner and an SLA, and the next person is told when it\'s their turn.', PV_FLOW)}
          ${feat('fc-purple', 'swap', 'Accounts', 'Brands and dealers as sub-accounts', 'General Motors › GM Cadillac › Al Ghanim Cadillac. Switch between them like an ads manager.', PV_WS)}
          ${feat('fc-blue', 'people', 'Access', 'Each team sees only its accounts', 'Admin, Editor or Viewer per team. Access to an account covers its sub-accounts, and owners can add other owners.', PV_ACC)}
        </div>
      </section>

      <section class="h-sec" id="media">
        <div class="h-eyebrow rv">${ico('campaign')}Built for media performance</div>
        <h2 class="h-h2 rv d1">Made by a media team, for media teams.</h2>
        <p class="h-lead rv d2">Not a generic project tool with a marketing template. It knows what a flight, a pacing sheet and a weekly optimisation check are.</p>
        <div class="h-media">
          ${media('gauge', 'yellow', 'Pacing you can see', 'Healthy, under, over or unstable, flagged on every card, with the account\'s pacing sheet one click away.', 1)}
          ${media('okcircle', 'green', 'Weekly checks that don\'t slip', 'Every live campaign asks for its optimisation check and keeps the history.', 2)}
          ${media('pause', 'blue', 'Pause one platform, not the plan', 'Pause Snap while Meta keeps running. Every pause and resume is logged.', 3)}
          ${media('target', 'purple', 'Objectives per platform', 'Only the objectives each platform really sells, from Reach to Leads to Conversions.', 1)}
          ${media('alert', 'red', 'Needs attention, sorted', 'Late steps, missing creatives and checks due float to the top.', 2)}
          ${media('chart', 'pink', 'A dashboard for any period', 'Turnaround, SLAs, bottlenecks, campaigns live and platform mix.', 3)}
        </div>
        <div class="h-stats">
          <div class="h-stat rv d1"><b>${MARKETS.length}</b><span>markets across the GCC, Iraq and Egypt</span></div>
          <div class="h-stat rv d2"><b>${PLATFORMS.length}</b><span>platforms, each with its real objectives</span></div>
          <div class="h-stat rv d3"><b>${TOOLS.length}</b><span>tools you can switch on per account</span></div>
          <div class="h-stat rv d4"><b>30</b><span>days to restore anything you delete</span></div>
        </div>
      </section>

      <section class="h-sec" id="guide">
        <div class="h-guide rv">
          <div>${doodle('note', { hair: 'bun', tint: 'purple', cls: 'h-guide-av' })}<h2 class="h-h2" style="font-size:clamp(28px,3.6vw,40px)">Stuck? Ask.</h2>
            <p class="h-lead">Instant answers on using ${name}, access and sub-accounts, and media maths like pacing and ROAS, with a button that takes you to the right page. It's built in and works offline. Press <b>?</b> anywhere.</p>
            <div class="h-cta" style="justify-content:flex-start"><button class="h-btn h-blue" data-guide-open>${ico('help', 'i-sm')} Ask a question</button>${signedIn ? '<button class="h-btn h-ghost" data-go="#/guide">Open the guide</button>' : ''}</div></div>
          <div class="h-chat rv d2" aria-hidden="true"><span class="q">How do I calculate pacing?</span>
            <span class="a"><b>Pacing</b> = actual spend ÷ expected spend.<br>Expected spend = budget × days elapsed ÷ flight days. Around <code>95-105%</code> is on track.</span>
            <div class="chips"><span>Under-pacing fixes</span><span>What are sub-accounts?</span><span>How do I add another owner?</span></div></div>
        </div>
      </section>

      <section class="h-sec" id="faq">
        <div class="h-center"><div class="h-eyebrow rv">${ico('help')}FAQ</div><h2 class="h-h2 rv d1">Questions, answered.</h2></div>
        <div class="h-faq rv d2">${faq}</div>
        <div class="h-faq-more rv"><button class="h-btn h-ghost" data-guide-open>More answers ${ico('arrowRight', 'i-sm')}</button></div>
      </section>

      <section class="h-final" id="workspaces">
        <div class="h-scene rv" aria-hidden="true">${mario('wave')}${joana('laptop')}${doodle('clip', { hair: 'bob', tint: 'blue', glasses: true })}${ground}</div>
        <h2 class="rv d1">Bring your team in.</h2>
        <p class="rv d2">${signedIn ? 'Add people in Business settings and give their team its accounts. Everything syncs live for everyone.' : 'Ask your business admin to add your work email, then sign in. Everything syncs live for your whole team.'}</p>
        <div class="h-cta rv d3">${cta}</div>
      </section>
    </div>
    <footer class="h-foot"><div class="h-wrap">
      <div class="brandcol"><div class="h-brand">${logoMark('h-logo sm')}<span class="brand-sep"></span>${wordmark()}</div><span>The workspace for every client account.</span><span style="color:var(--faint);font-size:12.5px">Build ${BUILD}</span></div>
      <div><h6>Product</h6><a href="#tour" data-scroll>To-Do boards</a><a href="#tour" data-scroll>Accounts</a><a href="#tour" data-scroll>Briefs</a><a href="#tour" data-scroll>Campaign Tracker</a></div>
      <div><h6>Help</h6><button data-guide-open>Ask a question</button><a href="#faq" data-scroll>FAQ</a><button data-guide-open="m-pacing">Pacing formula</button></div>
      <div><h6>Account</h6>${signedIn ? `<button data-go="#/">Open my accounts</button>` : `<button data-home="in">Sign in</button><button data-home="up">Create your login</button>`}<button data-guide-open="s-who-sees">Privacy &amp; access</button></div>
    </div></footer>
  </div>`;
}
// The homepage comes alive after it's on the page: scroll reveal, the product tour and the theme switch.
function homeEnhance() {
  const home = $('.home'); if (!home) return;
  document.body.classList.add('on-home');
  const els = $$('.rv', home);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { root: home, rootMargin: '0px 0px -30px 0px', threshold: 0.05 });
    els.forEach(el => io.observe(el));
  } else els.forEach(el => el.classList.add('in'));
  home.addEventListener('scroll', () => home.classList.toggle('scrolled', home.scrollTop > 8), { passive: true });
  const tabs = $$('[data-tour]', home), panes = $$('.hm-pane', home), capt = $('#h-capt', home);
  let cur = 0, timer = null;
  const show = i => {
    cur = (i + tabs.length) % tabs.length;
    tabs.forEach((t, j) => { t.classList.toggle('on', j === cur); t.setAttribute('aria-selected', j === cur); const b = t.querySelector('.bar'); if (b) { b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; } });
    panes.forEach((p, j) => p.classList.toggle('on', j === cur));
    $$('[data-tour-side]', home).forEach(p => p.classList.toggle('on', p.dataset.tourSide === panes[cur].dataset.side));
    if (capt) capt.textContent = panes[cur].dataset.capt;
  };
  const tick = () => { clearTimeout(timer); timer = setTimeout(() => { if (!document.body.contains(home)) return; if (!home.classList.contains('tour-paused')) show(cur + 1); tick(); }, 7000); };
  tabs.forEach((t, i) => t.addEventListener('click', () => { show(i); tick(); }));
  const win = $('.h-window', home);
  if (win) { win.addEventListener('mouseenter', () => home.classList.add('tour-paused')); win.addEventListener('mouseleave', () => { home.classList.remove('tour-paused'); tick(); }); }
  show(0); tick();
  const th = $('[data-home-theme]', home);
  if (th) th.addEventListener('click', () => { const d = document.documentElement.dataset.theme === 'dark'; setTheme(d ? 'light' : 'dark'); th.innerHTML = ico(d ? 'moon' : 'sun'); th.title = (d ? 'Dark' : 'Light') + ' mode'; });
  guideFab();
}
// smooth-scroll the homepage's own anchor links without touching the app's #/ routes
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[data-scroll]'); if (!a) return;
  e.preventDefault();
  const t = document.querySelector(a.getAttribute('href')); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

const brand = () => `<div class="brand">${logoMark('brand-logo')}<span class="brand-sep"></span>${wordmark()}</div>`;
// The sign-in card sits on the dentsu line-and-dot motif (drawn here, no images).
const authArt = () => `<svg class="auth-art" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <line x1="1250" y1="-60" x2="640" y2="860" stroke="#F0BEBE" stroke-width="26"/><line x1="1290" y1="40" x2="760" y2="860" stroke="#646ED2" stroke-width="3"/>
  <line x1="1120" y1="-40" x2="860" y2="860" stroke="#008287" stroke-width="2"/><line x1="980" y1="-40" x2="1240" y2="520" stroke="#FF5023" stroke-width="2"/>
  <line x1="-40" y1="610" x2="520" y2="420" stroke="#008287" stroke-width="10"/><line x1="-40" y1="700" x2="420" y2="300" stroke="#AAFF6E" stroke-width="2"/>
  <circle cx="1100" cy="60" r="34" fill="#323232"/><circle cx="905" cy="300" r="9" fill="#323232"/><circle cx="1010" cy="520" r="14" fill="#323232"/>
  <circle cx="300" cy="490" r="11" fill="#323232"/><circle cx="120" cy="650" r="7" fill="#323232"/></svg>`;
function authScreen(html) { $('#modals').innerHTML = ''; document.body.classList.remove('on-home'); document.getElementById('gb-fab')?.remove(); document.getElementById('gb')?.remove(); GB.open = false; $('#root').innerHTML = `<div class="auth">${authArt()}<div class="auth-card">${brand()}${html}</div></div>`; }
const authErr = e => {
  const c = (e && e.code) || '';
  // Same message whether the email exists or the password is wrong, so the form can't be used to find accounts.
  return ({ 'auth/invalid-credential': 'Wrong email or password.', 'auth/wrong-password': 'Wrong email or password.', 'auth/user-not-found': 'Wrong email or password.',
    'auth/invalid-login-credentials': 'Wrong email or password.', 'auth/user-disabled': 'Wrong email or password.',
    'auth/email-already-in-use': 'That email already has an account - sign in instead.', 'auth/weak-password': 'Use at least 8 characters, with a mix of letters and numbers.',
    'auth/password-does-not-meet-requirements': 'That password doesn’t meet the password rules - use at least 8 characters with letters and numbers.',
    'auth/invalid-email': 'That email address isn’t valid.', 'auth/too-many-requests': 'Too many attempts. Wait a minute and try again.',
    'auth/network-request-failed': 'No connection. Check your internet and try again.', 'auth/operation-not-allowed': 'Email/password sign-in isn’t enabled in Firebase yet (see SETUP step 3).' })[c] || `Something went wrong${c ? ` (${c})` : ''}. Try again.`;
};

async function bootCloud() {
  let A, F, app;
  try {
    let mods = null, lastErr = null;
    for (const v of FB_VERSIONS) {
      const base = FB_URL.replace(FB_VERSIONS[0], v);
      try { mods = await Promise.all([import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-firestore.js')]); break; }
      catch (e) { lastErr = e; console.warn('Firebase SDK ' + v + ' failed to load', e); }
    }
    if (!mods) throw lastErr;
    const [appMod, authMod, fsMod] = mods;
    A = authMod; F = fsMod; app = appMod.initializeApp(CFG.firebase);
  } catch (e) {
    console.error(e);
    $('#root').innerHTML = `<div class="auth"><div class="auth-card">${brand()}<div class="auth-msg err">Couldn't load the sync service. Check your internet connection and reload.</div></div></div>`;
    return;
  }
  const auth = A.getAuth(app);
  let db;
  try { db = F.initializeFirestore(app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) }); }
  catch { db = F.getFirestore(app); }
  const owner = (CFG.ownerEmail || '').trim().toLowerCase();
  let bizUnsubs = [];
  const stopAll = () => {
    if (store && store.stop) store.stop();
    bizUnsubs.forEach(u => u()); bizUnsubs = [];
    store = null; S.ready = false; S.acc = null; S.ws = null;
  };
  S.signOut = async () => { audit('sign_out', ''); stopAll(); S.biz = { members: {}, teams: {}, accounts: {}, owner, ready: false }; UNDO.length = 0; history.replaceState(null, '', location.pathname); await A.signOut(auth); };
  S.makeStore = a => new CloudStore(F, db, ['workspaces', a.id]);
  S.auditList = () => F.getDocs(F.query(F.collection(db, ...(S.acc ? ['workspaces', S.acc.id] : []), 'audit'), F.orderBy('at', 'desc'), F.limit(200)));
  // write-once security log entries, stamped with the server's clock (see the rules)
  auditFn = (action, detail) => {
    if (!S.user || !S.user.uid) return;
    const ref = F.doc(F.collection(db, ...(S.acc ? ['workspaces', S.acc.id] : []), 'audit'));
    F.setDoc(ref, { action, detail, email: S.user.email, uid: S.user.uid, at: F.serverTimestamp(), ua: navigator.userAgent.slice(0, 300) })
      .catch(err => console.warn('security log entry not saved', err && err.code));
  };
  // Business data: people, teams and the accounts you can open.
  // Every change is applied to the in-memory copy straight away (so the next step - e.g. working out who
  // has access after a team change - sees it), then written; the live listeners confirm it moments later.
  bizApi = {
    putMember: m => { S.biz.members[m.id] = clone(m); return F.setDoc(F.doc(db, 'members', m.id), clone(m)).catch(writeErr); },
    delMember: em => { delete S.biz.members[em]; return F.deleteDoc(F.doc(db, 'members', em)).catch(writeErr); },
    putTeam: t => { S.biz.teams[t.id] = clone(t); return F.setDoc(F.doc(db, 'teams', t.id), clone(t)).catch(writeErr); },
    delTeam: id => { delete S.biz.teams[id]; return F.deleteDoc(F.doc(db, 'teams', id)).catch(writeErr); },
    putAccount: a => { S.biz.accounts[a.id] = clone(a); return F.setDoc(F.doc(db, 'workspaces', a.id), clone(a)).catch(writeErr); },
    patchAccount: (id, f, quiet) => { if (S.biz.accounts[id]) Object.assign(S.biz.accounts[id], clone(f)); return F.updateDoc(F.doc(db, 'workspaces', id), clone(f)).catch(quiet ? () => { } : writeErr); },
    delAccount: id => { delete S.biz.accounts[id]; return F.deleteDoc(F.doc(db, 'workspaces', id)).catch(writeErr); },
    async writeAccount(id, ops, acts = []) {
      const st = S.makeStore({ id });
      await st.batch(ops);
      for (let i = 0; i < acts.length; i += 40) await Promise.all(acts.slice(i, i + 40).map(e => st.log(e)));
    },
  };
  // Deleting an account: everything we're allowed to delete in its collections, then the account itself.
  S.wipeAccountData = async id => {
    for (const col of COLS.filter(c => c !== 'members')) {
      let src = F.collection(db, 'workspaces', id, col);
      if (col === 'activity') src = F.query(src, F.where('demo', '==', true));      // the log is write-once; only sample entries can go
      if (col === 'notifs') src = F.query(src, F.where('to', '==', userEmail()));
      let snap; try { snap = await F.getDocs(src); } catch { continue; }
      const docs = []; snap.forEach(d => docs.push(d.ref));
      for (let i = 0; i < docs.length; i += 400) { const b = F.writeBatch(db); docs.slice(i, i + 400).forEach(r => b.delete(r)); await b.commit().catch(e => console.warn('could not delete', col, e && e.code)); }
    }
  };
  const startBiz = (email, admin) => new Promise(resolve => {
    let got = 0; const done = () => { if (++got === 3) { S.biz.ready = true; resolve(); } };
    const once = f => { let first = true; return snap => { f(snap); if (first) { first = false; done(); } else bizChanged(); }; };
    const fail = what => err => { console.warn(what, err && err.code); done(); };
    bizUnsubs.push(F.onSnapshot(F.collection(db, 'members'), once(snap => { const m = {}; snap.forEach(d => { m[d.id] = { ...d.data(), id: d.id }; }); S.biz.members = m; }), fail('members')));
    bizUnsubs.push(F.onSnapshot(F.collection(db, 'teams'), once(snap => { const m = {}; snap.forEach(d => { m[d.id] = { ...d.data(), id: d.id }; }); S.biz.teams = m; }), fail('teams')));
    const accQ = admin ? F.collection(db, 'workspaces') : F.query(F.collection(db, 'workspaces'), F.where('memberEmails', 'array-contains', email));
    bizUnsubs.push(F.onSnapshot(accQ, once(snap => { const m = {}; snap.forEach(d => { m[d.id] = { ...d.data(), id: d.id }; }); S.biz.accounts = m; }), fail('accounts')));
  });

  // Signed-out visitors land on the homepage; links into the app go straight to sign-in.
  const showHome = () => {
    const h = location.hash.replace(/^#\/?/, '');
    if (h && h !== 'home') return showSignIn();
    $('#modals').innerHTML = '';
    $('#root').innerHTML = homeHTML(false);
    homeEnhance();
    document.title = 'dentsu ' + (CFG.appName || 'Ads Workspace');
    $$('[data-home]').forEach(b => b.onclick = () => showSignIn(b.dataset.home));
  };
  const showSignIn = (mode = 'in', msg = '', isErr = false) => {
    authScreen(`<div class="auth-title">${mode === 'up' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : 'Sign in'}</div>
      ${mode === 'up' ? '<div class="auth-msg">Use the work email a business admin added to the platform.</div>' : ''}
      ${msg ? `<div class="auth-msg ${isErr ? 'err' : ''}">${msg}</div>` : ''}
      <form data-auth>
        ${mode === 'up' ? '<div class="field"><label>Your name</label><input class="inp" name="name" required autocomplete="name" maxlength="60"></div>' : ''}
        <div class="field"><label>Email</label><input class="inp" name="email" type="email" required autocomplete="email" autofocus></div>
        ${mode !== 'reset' ? `<div class="field"><label>Password</label><input class="inp" name="pw" type="password" required minlength="${mode === 'up' ? 8 : 6}" maxlength="128" autocomplete="${mode === 'up' ? 'new-password' : 'current-password'}">${mode === 'up' ? '<div class="hint" style="font-size:11.5px;color:var(--faint);margin-top:4px">At least 8 characters, with letters and numbers.</div>' : ''}</div>` : ''}
        <button class="btn btn-primary">${mode === 'up' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'}</button>
      </form>
      <div class="auth-links">
        ${mode === 'in' ? '<button data-to="up">Create an account</button><button data-to="reset">Forgot password?</button>' : '<button data-to="in">Back to sign in</button>'}
      </div>
      <div class="auth-back"><button data-to="home">${ico('left', 'i-sm')} Back to home</button></div>
`);
    $$('[data-to]').forEach(b => b.onclick = () => {
      if (b.dataset.to === 'home') { history.replaceState(null, '', location.pathname + location.search); return showHome(); }
      showSignIn(b.dataset.to);
    });
    const f = $('[data-auth]');
    f.onsubmit = async e => {
      e.preventDefault(); const btn = f.querySelector('button'); btn.disabled = true;
      if (/home/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
      const email = f.email.value.trim(), pw = f.pw && f.pw.value;
      if (/home/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
      if (mode === 'up' && !(pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw))) {
        btn.disabled = false; showSignIn('up', 'Use at least 8 characters, with letters and numbers.', true);
        setTimeout(() => { const i = $('[name=email]'), n = $('[name=name]'); if (i) i.value = email; if (n) n.value = f.name.value; }, 0);
        return;
      }
      try {
        if (mode === 'in') await A.signInWithEmailAndPassword(auth, email, pw);
        else if (mode === 'up') {
          const cred = await A.createUserWithEmailAndPassword(auth, email, pw);
          await A.updateProfile(cred.user, { displayName: f.name.value.trim() });
          await A.sendEmailVerification(cred.user);
          showVerify(cred.user);
        } else {
          // Same answer whether or not the account exists. Reset links are single-use and expire (Firebase).
          try { await A.sendPasswordResetEmail(auth, email); } catch (er) { if (er && !['auth/user-not-found', 'auth/invalid-credential'].includes(er.code)) throw er; }
          showSignIn('in', 'If an account exists for that email, a reset link is on its way. It works once and expires after a while.');
        }
      } catch (err) { btn.disabled = false; showSignIn(mode, esc(authErr(err)), true); if (f.email) setTimeout(() => { const i = $('[name=email]'); if (i) i.value = email; }, 0); }
    };
  };
  const showVerify = user => {
    authScreen(`<div class="auth-msg">We sent a verification link to <b>${esc(user.email)}</b>. Open it, then come back and press Continue. (Check spam too.)</div>
      <button class="btn btn-primary" data-v="go">I've verified - continue</button>
      <div class="auth-links"><button data-v="resend">Resend email</button><button data-v="out">Sign out</button></div>`);
    $$('[data-v]').forEach(b => b.onclick = async () => {
      const v = b.dataset.v;
      if (v === 'out') return A.signOut(auth);
      if (v === 'resend') { try { await A.sendEmailVerification(user); b.textContent = 'Sent ✓'; } catch (e) { b.textContent = authErr(e); } return; }
      await user.reload(); await user.getIdToken(true);
      if (auth.currentUser.emailVerified) enter(auth.currentUser); else b.textContent = 'Not verified yet - try again';
    });
  };
  const showNoAccess = (email, note = '') => {
    stopAll();
    authScreen(`<div class="auth-title">Almost there</div><div class="auth-msg">You're signed in as <b>${esc(email)}</b>, but this email isn't on the platform yet.${note ? `<br><br><span style="color:var(--muted)">${note}</span>` : ''}</div>
      <button class="btn btn-primary" data-v="again">Check again</button><div class="auth-links"><button data-v="out">Sign out</button></div>`);
    $('[data-v=again]').onclick = () => enter(auth.currentUser);
    $('[data-v=out]').onclick = () => A.signOut(auth);
  };

  const enter = async user => {
    if (!user) { stopAll(); return showHome(); }
    if (!user.emailVerified) return showVerify(user);
    const email = user.email.toLowerCase();
    const isOwner = !!owner && email === owner;
    S.mode = 'cloud';
    S.user = { email, uid: user.uid, name: user.displayName || email.split('@')[0], isOwner, color: 'red' };
    $('#root').innerHTML = `<div class="loading">${logoMark('load-logo')}<span>Loading your accounts…</span></div>`;
    // only people on the business list (or the owner) get past this point
    let member = null, note = '';
    try { const d = await F.getDoc(F.doc(db, 'members', email)); if (d.exists()) member = d.data(); }
    catch (e) { note = e.code === 'permission-denied' && isOwner ? 'The database refused access. Publish firestore.rules (SETUP step 5) and check that OWNER_EMAIL matches ownerEmail in config.js.' : e.code === 'permission-denied' ? '' : 'Error: ' + esc(e.code || e.message); }
    if (!isOwner && !member) return showNoAccess(email, note || `Ask a business admin${owner ? ` (for example <b>${esc(owner)}</b>)` : ''} to add <b>${esc(email)}</b> under Business settings → People, then press Check again.`);
    if (note && isOwner) return showNoAccess(email, note);
    if (member && member.name) S.user.name = member.name;
    S.biz = { members: {}, teams: {}, accounts: {}, owner, ready: false };
    bizUnsubs.forEach(u => u()); bizUnsubs = [];
    await startBiz(email, isOwner || (member && ['admin', 'owner'].includes(member.bizRole)));
    if (isOwner && CFG.sampleData && !allAccounts(true).length && !lsGet('tb:sampleDone:' + email)) {
      lsSet('tb:sampleDone:' + email, '1');
      await loadSampleBusiness({ silent: true });
      await sleep(600);
    }
    audit('sign_in', '');
    openBestAccount();
  };
  A.onAuthStateChanged(auth, user => { S.ready = false; enter(user); });
}

/* ---------- local mode: the same business, kept in this browser ---------- */
const LOCAL_ME = 'me@local';
function setLocalUser() {
  const want = lsGet('tb:viewAs');
  const em = want && S.biz.members[want] ? want : (S.biz.owner || LOCAL_ME);
  if (want && !S.biz.members[want]) lsSet('tb:viewAs', '');
  const m = S.biz.members[em] || {};
  S.user = { name: m.name || lsGet('tb:name') || 'Me', email: em, color: m.color || 'red', isOwner: em === S.biz.owner };
}
async function bootLocal() {
  S.mode = 'local'; bizApi = localBizApi;
  S.biz = loadBizLocal();
  if (!S.biz.owner) {
    S.biz.owner = LOCAL_ME;
    S.biz.members[LOCAL_ME] = { id: LOCAL_ME, name: lsGet('tb:name') || 'Me', jobRole: 'Account Lead', bizRole: 'admin', color: 'red', addedAt: Date.now() };
    saveBizLocal();
  }
  setLocalUser();
  if (!allAccounts(true).length) {
    if (CFG.sampleData) await loadSampleBusiness({ silent: true });
    else { const id = uid(); await bizApi.putAccount({ id, name: 'My first account', sector: '', color: 'red', logo: '', modules: {}, access: { teams: {}, people: { [userEmail()]: 'admin' } }, roles: { [userEmail()]: 'admin' }, memberEmails: [userEmail()], archived: false, createdAt: Date.now() }); }
  }
  S.biz.ready = true;
  openBestAccount();
}

// A tab left open keeps running the version it loaded. Check now and then, and offer a reload when a newer one is live.
let updLast = 0;
function checkForUpdate() {
  if (!/^https?:$/.test(location.protocol) || Date.now() - updLast < 4 * 60e3 || document.getElementById('upd-bar')) return;
  updLast = Date.now();
  fetch('app.js', { cache: 'no-cache' }).then(r => (r.ok ? r.text() : '')).then(t => {
    const m = t.match(/const BUILD = '([^']+)'/); if (!m || m[1] === BUILD) return;
    const bar = document.createElement('div'); bar.id = 'upd-bar'; bar.className = 'upd-bar';
    bar.innerHTML = `<span>A new version of ${esc(CFG.appName || 'Ads Workspace')} is ready.</span><button class="btn btn-primary sm" data-upd>Reload</button><button class="icon-btn" data-upd-x title="Later">${ico('x')}</button>`;
    bar.querySelector('[data-upd]').onclick = async () => { await Promise.all(['styles.css', 'index.html', 'config.js'].map(f => fetch(f, { cache: 'reload' }).catch(() => { }))); location.reload(); };
    bar.querySelector('[data-upd-x]').onclick = () => bar.remove();
    document.body.appendChild(bar);
  }).catch(() => { });
}
setInterval(checkForUpdate, 15 * 60e3);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkForUpdate(); });
setTimeout(checkForUpdate, 60e3);

function boot() {
  console.info(`%c${CFG.appName || 'dentsu'} build ${BUILD}`, 'color:#646ED2;font-weight:700');
  if (CFG_MISSING) {   // never fall back to an empty local workspace by accident
    $('#root').innerHTML = `<div class="auth"><div class="auth-card"><div class="auth-msg err"><b>config.js is missing.</b><br>Upload config.js next to index.html (it holds the Firebase settings), then reload.</div></div></div>`;
    return;
  }
  const fb = CFG.firebase || {};
  if (!fb.apiKey) bootLocal(); else bootCloud();
}
boot();


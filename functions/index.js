/* =====================================================================
   OPTIONAL - Daily digest email (Blaze plan only).
   Every working morning at 08:00 Dubai time, each person gets ONE email that
   covers every client account they're on: overdue steps, steps due today,
   blocked steps and briefs they own that are at risk of missing go-live.
   Nothing is sent to people with nothing on their plate.

   It writes to the same `mail` collection the app uses, so the Trigger Email
   extension delivers it. Deploy with:  firebase deploy --only functions
   ===================================================================== */
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { logger } = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

// Keep in step with public/config.js
const APP_URL = process.env.APP_URL || '';            // e.g. https://your-project-id.web.app  (set in functions/.env)
const APP = 'dentsu ' + (process.env.APP_NAME || 'Ads Workspace');
const TZ = 'Asia/Dubai';
const WEEKEND = [6, 0];                                // Saturday, Sunday
const ACTIVE = ['Draft', 'Submitted', 'In progress', 'In review', 'Live', 'On hold'];

const pad = n => String(n).padStart(2, '0');
// today's date in Dubai as YYYY-MM-DD
const todayKey = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d, 12)); };
const keyOf = d => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const addDays = (k, n) => { const d = parseKey(k); d.setUTCDate(d.getUTCDate() + n); return keyOf(d); };
const isWorkday = k => !WEEKEND.includes(parseKey(k).getUTCDay());
const addWorkdays = (k, n) => { let d = k, left = Math.max(0, Math.round(n || 0)); if (!left) { while (!isWorkday(d)) d = addDays(d, 1); return d; } while (left > 0) { d = addDays(d, 1); if (isWorkday(d)) left--; } return d; };
const workdaysBetween = (a, b) => { if (!a || !b || a >= b) return 0; let n = 0, d = a; while (d < b) { d = addDays(d, 1); if (isWorkday(d)) n++; } return n; };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = k => parseKey(k).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

exports.dailyDigest = onSchedule({ schedule: '0 8 * * *', timeZone: TZ, region: process.env.FUNCTIONS_REGION || 'europe-west1', retryCount: 0 }, async () => {
  const today = todayKey();
  if (!isWorkday(today)) return logger.info('Weekend - no digest');
  // don't send twice on the same day (e.g. a manual re-run)
  const marker = db.doc(`digests/${today}`);
  if ((await marker.get()).exists) return logger.info('Digest already sent today');

  // every active client account; each keeps its own team list, briefs and steps
  const accounts = []; (await db.collection('workspaces').get()).forEach(d => { const a = d.data(); if (!a.archived) accounts.push({ ...a, id: d.id }); });
  const inbox = {};   // email → { name, items: [{ account, late, dueToday, blocked, atRisk }] }
  for (const acc of accounts) {
    const base = db.collection('workspaces').doc(acc.id);
    const settings = (await base.collection('meta').doc('settings').get()).data() || {};
    const people = (settings.people || []).filter(p => p.email && !/@example\.(com|org|net)$/.test(p.email));
    if (!people.length) continue;
    const briefs = {}; (await base.collection('briefs').get()).forEach(d => { const b = d.data(); if (!b.archived && ACTIVE.includes(b.status)) briefs[d.id] = { ...b, id: d.id }; });
    if (!Object.keys(briefs).length) continue;
    // workflow steps are the tasks that belong to a brief
    const byBrief = {}; (await base.collection('tasks').where('briefId', '!=', null).get()).forEach(d => { const t = d.data(); if (t.briefId && briefs[t.briefId] && !t.archived) (byBrief[t.briefId] = byBrief[t.briefId] || []).push({ ...t, id: d.id }); });
    Object.values(byBrief).forEach(list => list.sort((a, b) => (a.order || 0) - (b.order || 0)));
    const steps = Object.values(byBrief).flat().filter(t => t.status !== 'Done');
    // a step is workable once the one before it is done (or it has started) - the same rule as the app
    const ready = t => { if (t.startedAt) return true; const list = byBrief[t.briefId] || []; const i = list.findIndex(x => x.id === t.id); return i <= 0 || list[i - 1].status === 'Done'; };
    // go-live risk: remaining SLA days up to the launch step, projected from today
    const risk = b => {
      if (!b.goLive || ['Live', 'Completed', 'Cancelled'].includes(b.status)) return null;
      if (b.goLive < today) return `go-live was ${fmt(b.goLive)}`;
      const list = byBrief[b.id] || []; const li = list.findIndex(x => x.launch);
      let p = today; (li >= 0 ? list.slice(0, li + 1) : list.filter(x => x.anchor !== 'flightEnd')).filter(x => x.status !== 'Done').forEach(x => { p = addWorkdays(p, x.slaDays || 0); });
      return p > b.goLive ? `projected ${fmt(p)}, ${workdaysBetween(b.goLive, p)} working day(s) after the ${fmt(b.goLive)} deadline` : null;
    };
    for (const p of people) {
      const mine = steps.filter(t => t.assignee === p.id);
      const item = { account: acc, briefs, late: mine.filter(t => t.due && t.due < today && ready(t)), dueToday: mine.filter(t => t.due === today), blocked: mine.filter(t => t.status === 'Blocked'),
        atRisk: Object.values(briefs).filter(b => b.ownerId === p.id).map(b => ({ b, r: risk(b) })).filter(x => x.r) };
      if (!item.late.length && !item.dueToday.length && !item.blocked.length && !item.atRisk.length) continue;
      const box = inbox[p.email.toLowerCase()] = inbox[p.email.toLowerCase()] || { name: p.name || p.email, items: [] };
      box.items.push(item);
    }
  }

  const link = (acc, id) => (APP_URL ? `${APP_URL.replace(/[?#].*$/, '').replace(/\/$/, '')}/?a=${encodeURIComponent(acc.id)}#/brief/${id}` : '');
  const td = 'padding:6px 4px;border-bottom:1px solid #e6e6e6';
  const batch = db.batch(); let sent = 0;
  for (const [email, box] of Object.entries(inbox)) {
    const count = k => box.items.reduce((n, it) => n + it[k].length, 0);
    const late = count('late'), dueToday = count('dueToday'), blocked = count('blocked'), atRisk = count('atRisk');
    const row = (it, t, note) => { const b = it.briefs[t.briefId]; const l = link(it.account, b.id); return `<tr><td style="${td}">${esc(t.title)}<br><span style="color:#6b7080;font-size:12px">${esc(b.ref)} · ${esc(b.title)}</span></td><td style="${td};white-space:nowrap">${esc(note)}</td><td style="${td}">${l ? `<a href="${esc(l)}" style="color:#4F59C4">Open</a>` : ''}</td></tr>`; };
    const sec = (title, rows) => (rows.length ? `<div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;margin:14px 0 4px">${esc(title)}</div><table style="border-collapse:collapse;width:100%;font-size:13px">${rows.join('')}</table>` : '');
    const html = `<div style="font-family:Halcom,'Work Sans',-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#323232;max-width:600px;margin:0 auto;padding:24px">
      <div style="font-size:12px;color:#6b7080;letter-spacing:.06em;text-transform:uppercase"><b style="color:#323232">${esc(APP)}</b> · daily digest · ${esc(fmt(today))}</div>
      <h2 style="font-size:20px;font-weight:500;text-transform:uppercase;margin:8px 0 4px">Good morning ${esc(String(box.name).split(' ')[0])}</h2>
      ${box.items.map(it => `<h3 style="font-size:15px;margin:22px 0 2px;padding-top:12px;border-top:2px solid #323232">${esc(it.account.name)}</h3>
        ${sec(`Overdue (${it.late.length})`, it.late.map(t => row(it, t, `due ${fmt(t.due)}`)))}
        ${sec(`Due today (${it.dueToday.length})`, it.dueToday.map(t => row(it, t, t.status)))}
        ${sec(`Blocked (${it.blocked.length})`, it.blocked.map(t => row(it, t, t.blockedReason || 'blocked')))}
        ${sec(`Your briefs at risk (${it.atRisk.length})`, it.atRisk.map(({ b, r }) => { const l = link(it.account, b.id); return `<tr><td style="${td}">${esc(b.ref)} · ${esc(b.title)}</td><td style="${td}">${esc(r)}</td><td style="${td}">${l ? `<a href="${esc(l)}" style="color:#4F59C4">Open</a>` : ''}</td></tr>`; }))}`).join('')}
      </div>`;
    const text = [`${APP} - daily digest ${today}`, ...box.items.flatMap(it => [`\n${it.account.name}`, ...it.late.map(t => `OVERDUE: ${t.title} (${it.briefs[t.briefId].ref}) due ${t.due}`), ...it.dueToday.map(t => `TODAY: ${t.title} (${it.briefs[t.briefId].ref})`),
      ...it.blocked.map(t => `BLOCKED: ${t.title} - ${t.blockedReason || ''}`), ...it.atRisk.map(({ b, r }) => `AT RISK: ${b.ref} ${b.title} - ${r}`)])].join('\n');
    const subject = `[${APP}] ${[late && `${late} overdue`, dueToday && `${dueToday} due today`, blocked && `${blocked} blocked`, atRisk && `${atRisk} brief${atRisk === 1 ? '' : 's'} at risk`].filter(Boolean).join(' · ')}${box.items.length > 1 ? ` · ${box.items.length} accounts` : ''}`;
    batch.set(db.collection('mail').doc(), { to: [email], message: { subject, html, text }, createdAt: FieldValue.serverTimestamp(), createdBy: 'daily-digest' });
    sent++;
  }
  batch.set(marker, { at: FieldValue.serverTimestamp(), sent });
  await batch.commit();
  logger.info(`Digest queued for ${sent} people`);
});

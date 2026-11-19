# dentsu Ads Workspace

One platform for every client account, set up like an ads manager. An account switcher with client logos sits at the top left. Each team sees only the accounts it's been given, with Admin, Editor or Viewer access. Every account has its own data and its own set of tools. Built on Doable (briefs, workflow and SLAs, task lists, Campaign Tracker, calendar, notebook, activity log, alerts, dashboards), in the dentsu brand.

Signed-out visitors land on a homepage that explains the platform. Inside, a **Guide** page has a getting-started checklist, and a **Help** chat (bottom right, or press `?`) answers questions about the platform, access and media maths, then takes you to the right page. Its answers are built in - nothing typed into it leaves the browser.

**Live:** https://mariobreidy33.github.io/dentsu-ads-workspace/ (Firebase project `dentsu-ads-workspace`, data in me-central1 Doha). Every push to `main` redeploys it.

**To host it:** follow [SETUP.md](SETUP.md). **To demo it:** [DEMO-SCRIPT.md](DEMO-SCRIPT.md).

## How it's organised

| Level | What lives there |
|---|---|
| **Business** | *People* (who can sign in, with a job role and a business role: Member, Admin or Owner), *Teams* (e.g. GM team, Retail & FMCG team, Leadership) and *Accounts*. Business admins open every account and manage all of this. |
| **Sub-accounts** | Any account can sit under another: General Motors › GM Cadillac › Al Ghanim Cadillac (Dealer). Each has its own data and tools; access to an account covers everything under it, and a sub-account can add more people or a higher role. |
| **Account** (one per client) | Name, logo, sector, colour; which **tools** are on; who has **access** - teams or individual people as Admin, Editor or Viewer. Its own lists, briefs, brands, campaigns, calendar, notes, activity log and settings. |
| **All accounts** | An overview of every account you can open: your access, teams, open and overdue work, active briefs, briefs at risk, live campaigns and alerts. Click a row to switch. |

**Business roles.** *Owner* - everything, including adding and removing other owners (the first owner is `ownerEmail` in config.js). *Admin* - manages people, teams and accounts and opens every account, but can't change owners. *Member* - opens the accounts they've been given.

**Access roles.** *Admin* - everything, plus the account's logo, tools and access. *Editor* - works on everything in the account. *Viewer* - sees everything, changes nothing (e.g. leadership or a client contact). Give access to a whole team once, and anyone added to that team later gets in too. The security rules enforce the same roles.

**Tools you can switch on or off per account.** My work · Task lists (lists, Today, Upcoming) · Team calendar · Briefs & workflow · Brands · All tasks & labels · Campaign Tracker · Alerts · Dashboard · Activity log · Notebook. New accounts start with the essentials (My work, Task lists, Briefs, Campaign Tracker, Alerts, Dashboard); *All tools* switches the rest on in one click. Switching a tool off hides it for everyone in that account. Nothing is deleted, so switching it back on brings everything back.

## What's in each account

| Tool | What it does |
|---|---|
| **Briefs & workflow** | Briefing template (objective, KPIs, budget, go-live, flight, markets, platforms, offer, creative, landing page). Team assignment with email and in-app notifications, opened/seen tracking, and steps from a workflow template with working-day SLAs. Statuses: To do, In progress, Blocked (with reason), In review, Done. Late steps push later due dates out. |
| **Brands** | Brands, markets or dealers inside the client account (e.g. Chevrolet, GMC and Cadillac inside General Motors). Each has its own board and can be used as a label on any task or brief. |
| **Alerts** | Overdue, due soon, taking too long (× SLA), blocked, unassigned, not opened, not kicked off, go-live at risk or missed. |
| **Activity log** | Who did what and when. Written once and stamped by the server, so entries can't be edited. |
| **Dashboard** | Briefs received vs live, on-time rates, brief-to-live time, bottlenecks by step (waiting vs working vs SLA), by teammate, plus brand, campaign and task views. |
| **Also** | My work, task lists and boards, Today / Upcoming, team calendar, Campaign Tracker (ad accounts, pacing, weekly checks), Notebook, Archive, Recently deleted, undo, search, dark mode, backups. |

## Files

```
public/              ← the website (this folder is what gets hosted)
  index.html         page shell
  app.js             the app (single module, no build step)
  styles.css         styling (dentsu brand layer at the end)
  config.js          Firebase settings, owner email, email + SLA options
  fonts/             Work Sans (fallback for Halcom, OFL licence)
firestore.rules      security rules: business admins, account roles, viewers read-only
firebase.json        hosting config + security headers
functions/           optional daily digest email across all accounts (Blaze plan)
.github/workflows/   auto-deploy to Firebase Hosting (or GitHub Pages)
SETUP.md             step-by-step hosting guide
DEMO-SCRIPT.md       10-minute walkthrough for management
```

## Data model (Firestore)

| Path | Holds |
|---|---|
| `members/{email}` | People who can sign in: name, job role, `bizRole` (`admin` / `member`) |
| `teams/{id}` | Team name and `memberEmails` |
| `workspaces/{accountId}` | One per client account: name, logo, sector, `modules` (tools), `access` (teams/people → role), `roles` and `memberEmails` (worked out from access), `stats` (for All accounts) |
| `workspaces/{accountId}/…` | The account's `projects`, `sections`, `tasks`, `briefs`, `campaigns`, `accounts` (ad accounts), `events`, `notes`, `meta/settings` (team list, labels, workflows, alerts), `activity`, `notifs`, `trash`, `audit` |
| `mail` | Outgoing emails, sent by the Trigger Email extension |
| `audit` | Business-level security log (sign-ins) |

## Notes

- **Typeface.** The template uses Halcom, a licensed font. The app uses Halcom where it's installed (as on dentsu laptops) and otherwise falls back to Work Sans, which is bundled.
- **Logos.** Upload any PNG, JPG or SVG. It's resized to a small square and stored on the account, so it doesn't need Firebase Storage.
- **Local mode.** Leave `config.js` empty and everything runs in this browser, including a *View as* switch under Business settings → People to see the platform as a team member or viewer. Emails go to an outbox in Account settings.
- **Sample business.** `sampleData: true` loads fictional accounts, teams and people on the owner's first sign-in. Remove it in Business settings → Accounts → Sample business.
- This is a separate deployment from your personal Doable: its own Firebase project, rules and data.

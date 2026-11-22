# Setup - GitHub + Firebase (dentsu Ads Workspace)

About 45 minutes the first time. Steps 1-9 get you a working demo on the free plan; steps 10-11 (email) need the pay-as-you-go plan.

**You need:** a Google account (for Firebase), a GitHub account, and [Node.js 20+](https://nodejs.org) on your computer for the command-line steps.

> **Just want to look first?** Open `public/index.html` through any local web server (for example `npx serve public`) with `config.js` left empty. It runs in *local mode* - data stays in that browser, nothing is shared, emails go to an outbox you can view in Settings. A sample business with several client accounts loads by itself.

---

## 1. Create the Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Create a project** → name it e.g. `dentsu-ads-workspace`. Google Analytics: off.
2. Use a **new** project - don't reuse your personal Doable one (`todoist-64a22`). Client data stays separate.

## 2. Turn on sign-in

**Build → Authentication → Get started → Email/Password → Enable → Save.**

## 3. Create the database

**Build → Firestore Database → Create database.**

- Edition: Standard. Mode: **Production**.
- Location: pick once, it can't be changed. For GCC data residency choose **`me-central1` (Doha)** or **`me-central2` (Dammam)**; otherwise `eur3` (Europe) is fine.

## 4. Register the web app and fill in `config.js`

1. **Project settings (gear) → General → Your apps → Web (`</>`)** → nickname `dentsu-ads-workspace` → *don't* tick Firebase Hosting here → Register.
2. Copy the values from the `firebaseConfig` it shows into `public/config.js`:

```js
firebase: {
  apiKey: "AIza…",
  authDomain: "dentsu-ads-workspace.firebaseapp.com",
  projectId: "dentsu-ads-workspace",
  storageBucket: "dentsu-ads-workspace.firebasestorage.app",
  messagingSenderId: "…",
  appId: "1:…:web:…"
},
ownerEmail: "you@dentsu.com",   // lowercase - you'll be the business admin
```

Also put the project ID in `.firebaserc` (replace `YOUR-FIREBASE-PROJECT-ID`).

## 5. Publish the security rules

1. Open `firestore.rules` and replace `OWNER_EMAIL` with the same email as `ownerEmail` (lowercase).
2. **Firestore Database → Rules** → select all, paste the file → **Publish**.

(Or from the command line after step 7: `firebase deploy --only firestore:rules`.)

## 6. Put the code on GitHub

Create a **private** repository, e.g. `dentsu-ads-workspace`, then from the project folder:

```bash
git init
git add .
git commit -m "dentsu Ads Workspace"
git branch -M main
git remote add origin https://github.com/<your-user>/dentsu-ads-workspace.git
git push -u origin main
```

## 7. First deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only hosting,firestore:rules
```

You get two live links: `https://<project-id>.web.app` and `https://<project-id>.firebaseapp.com`. Both are already allowed for sign-in.

## 8. Auto-deploy from GitHub (every push to `main` goes live)

From the project folder:

```bash
firebase init hosting:github
```

Answer:

| Prompt | Answer |
|---|---|
| Repository | `<your-user>/dentsu-ads-workspace` |
| Run a build script before every deploy? | **No** |
| Set up automatic deployment when a PR is merged? | **Yes**, branch `main` |
| Overwrite the existing workflow files? | **Yes** |

It creates a deploy service account, stores its key as a GitHub secret and writes the two workflow files. Commit and push them:

```bash
git add .github && git commit -m "Deploy from GitHub" && git push
```

From now on: edit → commit → push → live in about a minute. Pull requests get their own preview link.

> **Option B - GitHub Pages (like the current Doable):** repo **Settings → Pages → Source: GitHub Actions**, then run *Deploy to GitHub Pages* from the **Actions** tab. Add `<your-user>.github.io` under **Authentication → Settings → Authorized domains**. Firebase Hosting is still recommended: it sends the security headers in `firebase.json`.

## 9. First sign-in, people, teams and accounts

1. Open the site → **Create an account** with the `ownerEmail` → click the verification link → sign in. You're the owner, so you're a business admin.
2. **The sample business is already in.** Because `sampleData: true` in `config.js`, your first sign-in loads 4 example accounts - General Motors (Chevrolet, GMC, Cadillac), Siddiqi, Ferrero and Agency internal - with 3 teams and 10 sample people with different access. Each account has briefs with workflow history, tasks, campaigns and notes. You take the Account Lead seat on the GM team. To load it again later with your own teammates' names on the GM team, use **Business settings → Accounts → Load sample business**. Sample people use `@example.com` addresses and never get emails.
3. **Business settings → People:** add each teammate with **name, work email, job role** (Account Lead, Media Planner, Paid Social, Paid Search, Creative, Analytics…) and **business role** (*Member*, or *Admin* for people who manage accounts and access). Only people on this list can sign in. They sign up on the site with that email, verify it, and they're in.
4. **Business settings → Teams:** create teams (e.g. *GM team*, *Retail & FMCG team*, *Leadership*), add people, and give each team its accounts as Admin, Editor or Viewer.
5. **Create the real client accounts:** top-left switcher → **Create account** (or All accounts → Create account). Give it a name, sector and logo, choose which teams get in, and pick the tools it needs. You can fine-tune later in the account's **Access** (teams and individual people) and **Account settings → Tools**.
6. Inside an account, **Brands** holds the client's brands, markets or dealers. Paste them from Excel with the columns *Brand name, Group, Sector, Markets, Contact name, Contact email*. People with access join the account's team list the first time they open it, so workflow steps can be assigned to them.

To share running the platform with upper management, add them under **Business settings → People** with the business role **Owner**. Only owners can add or remove other owners.

**Clients.** To let a client submit briefs and approve media plans and assets on the platform: add them under **Business settings → People** with the business role **Client**, then click **Accounts** on their row and give them the **Client** role on their account (or just a sub-account, such as one dealer). They sign up with that email and land on *Your briefs*. Clients never see tasks, notes, alerts, the activity log, other accounts or the people list. This needs the latest `firestore.rules` (step 5).

Before real use: **Business settings → Accounts → Remove sample business**, and set `sampleData: false`.

That's a working demo. Everything below is optional.

---

## 10. Email notifications (needs the Blaze plan)

In-app notifications (the bell) work on the free plan. Emails need the official **Trigger Email from Firestore** extension, which needs the pay-as-you-go **Blaze** plan. At this team's volume the cost is typically a few dollars a month - set a budget alert when upgrading.

1. **Upgrade** (bottom-left of the console) → Blaze → set a budget alert (e.g. USD 10).
2. **Build → Extensions → Trigger Email from Firestore → Install**, then:

| Setting | Value |
|---|---|
| Cloud Functions location | Same region as Firestore if listed (e.g. `me-central1`), otherwise `europe-west1` |
| SMTP connection URI | See below |
| Email documents collection | `mail` |
| Default FROM address | e.g. `dentsu Ads Workspace <notifications@youragency.com>` |

SMTP connection URI examples (write `@` in the username as `%40`):

- **Microsoft 365:** `smtp://notifications%40youragency.com@smtp.office365.com:587` and put the password in the *SMTP password* field (the mailbox needs SMTP AUTH enabled by IT)
- **Gmail / Google Workspace:** `smtps://notifications%40youragency.com@smtp.gmail.com:465` with an *App password* in the SMTP password field
- **SendGrid:** `smtps://apikey@smtp.sendgrid.net:465` with the API key as the password

3. In the app: **Settings → Email notifications → Send me a test email.**

Who gets emails: people added to a brief's team (one email with their steps and due dates), the next person in line when a step is done, the brief owner when a brief is submitted. Subjects start with the account name, and the link opens that account. Emails only go to people on the platform.

If an email doesn't arrive: **Firestore → `mail` collection** → open the newest document → the `delivery` field shows the error from the mail server.

## 11. Daily digest email (optional, Blaze)

Every working morning at 08:00 Dubai time, each person gets one email covering every account they're on: overdue steps, steps due today, blocked steps and briefs at risk, grouped by account.

```bash
cd functions
npm install
cp .env.example .env      # set APP_URL to your web.app link (APP_NAME is the email sender label)
cd ..
firebase deploy --only functions
```

## 12. Lock the API key to your site

**Google Cloud console → APIs & Services → Credentials →** the *Browser key* → **Website restrictions**: add `https://<project-id>.web.app/*` and `https://<project-id>.firebaseapp.com/*` (and your GitHub Pages or custom domain if used).

---

## Day-to-day

- **Update the app:** edit files → push to `main`. Change `BUILD` at the top of `public/app.js` to confirm in Settings → About which version is live.
- **Custom domain:** Hosting → Add custom domain (e.g. `ads.youragency.com`), then add it to Authorized domains and the API key restrictions.
- **Back up:** user menu → Export backup (JSON). The activity log stays in Firestore and can be exported as CSV from Activity log.
- **Costs:** Hosting, sign-in and the database are free for the demo. With a full team using it daily, expect the database to cross the free daily read allowance and cost a few dollars a month on Blaze. `activityDays` in `config.js` controls how much history each browser loads.

## Troubleshooting

| What you see | Fix |
|---|---|
| "The database refused access" | Rules not published, or `OWNER_EMAIL` in the rules doesn't match `ownerEmail` in `config.js` |
| A teammate sees "this email isn't on the platform yet" | Add their exact email under Business settings → People; they must verify their email |
| A teammate signs in but sees no accounts | Add them to a team that has access, or give them access in the account's Access window |
| "You have view-only access" | They're a Viewer on that account - change it in the account's Access window |
| A client only sees *Your briefs* | That's the Client role. Team members get Editor or Viewer instead |
| "That file is … - the limit is 650 KB" when uploading a media plan | Share the plan as a Google Sheets, Drive or SharePoint link instead (files are kept in the database, which caps their size) |
| "This needs the updated security rules" banner | Publish the latest `firestore.rules` |
| Notifications appear in the bell but no email | Extension not installed, wrong SMTP URI, or the recipient isn't on the access list - check the `delivery` field in `mail` |
| Sign-in errors on GitHub Pages or a custom domain | Add the domain under Authentication → Settings → Authorized domains |

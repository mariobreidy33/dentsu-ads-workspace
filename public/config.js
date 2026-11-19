/* =====================================================================
   CONFIG — settings for this deployment (see SETUP.md).
   Leave firebase.apiKey empty to run in LOCAL MODE (data saved in this browser only) —
   handy for a quick look, but nothing is shared and no emails are sent.
   These values are not secrets (the security rules protect the data), but restrict the
   API key to your site in Google Cloud console (SETUP.md, step 12).
   ===================================================================== */
window.APP_CONFIG = {
  firebase: {
    apiKey: "AIzaSyCXiUoIzWOLn9vuzTqlWhfoDFJrEFg6hP4",
    authDomain: "dentsu-ads-workspace.firebaseapp.com",
    projectId: "dentsu-ads-workspace",
    storageBucket: "dentsu-ads-workspace.firebasestorage.app",
    messagingSenderId: "156574245684",
    appId: "1:156574245684:web:1c9a8d64855dfa7473bb61"
  },
  // The owner's email (lowercase). The owner is always a business admin: they can open every
  // account and manage people, teams and accounts. Must match OWNER_EMAIL in firestore.rules.
  ownerEmail: "mariobreidy33@gmail.com",
  // Shown next to the dentsu logo, in page titles and in emails.
  appName: "Ads Workspace",
  // Email notifications are written to this Firestore collection. The free "Trigger Email from
  // Firestore" Firebase extension sends them (SETUP.md, step 10). Without it, in-app notifications still work.
  email: {
    enabled: true,
    collection: "mail",
    // The link put in emails. Leave empty to use the address the app is opened from.
    appUrl: ""
  },
  // true = the owner's first sign-in loads a sample business (fictional client accounts with logos,
  // teams, people with different access, and briefs, tasks, campaigns, calendar and notes inside each
  // account) so the demo is ready straight away. Remove it in Business settings → Accounts → Sample
  // business, and set this to false before real use.
  sampleData: true,
  currency: "AED",
  // Working week for SLA maths: 0 = Sunday … 6 = Saturday. UAE: Saturday + Sunday off.
  weekend: [6, 0],
  // How many days of activity history each browser loads per account. Older entries stay in the
  // database; a longer window means more reads (and cost) every time someone opens an account.
  activityDays: 90
};

/* =====================================================================
   "How much of your week does admin steal?" — all editable content.
   Copy, tasks, base hours, size multipliers, profiles and the webhook
   live here; app.js only reads from this object.
   ===================================================================== */

window.GAME_CONFIG = {

  // POST target for leads (JSON). Leave empty to log the payload to the console instead.
  WEBHOOK_URL: '',

  // Where "Book a demo" goes
  DEMO_URL: 'https://shapes.co',

  // ---- 1. Intro ----
  intro: {
    title: 'How much of your week does admin steal?',
    subtitle: 'Swipe through 10 everyday HR tasks. Get your HR profile and the hours you could win back.',
    time: 'Takes about a minute.',
    button: "Let's find out",
  },

  // ---- 2. Company size ----
  size: {
    question: 'How many people work at your company?',
    options: [
      { id: '1-50',    label: '1–50',    multiplier: 0.6 },
      { id: '51-200',  label: '51–200',  multiplier: 1 },
      { id: '201-500', label: '201–500', multiplier: 1.5 },
      { id: '500+',    label: '500+',    multiplier: 2 },
    ],
  },

  // ---- 3. Cards ----
  play: {
    question: 'Who does this at your company?',
    manualLabel: 'Me, manually',     // swipe left
    autoLabel: 'It runs itself',     // swipe right
  },

  // hours = base manual hours per week (before the size multiplier)
  // icon = Tabler icon name (https://tabler.io/icons)
  // shapes = how Shapes handles it (shown in the full report)
  // ("time‑off" uses a non-breaking hyphen so it never splits across lines)
  tasks: [
    { id: 'time-off',     name: 'Approving time‑off requests', hours: 1.5, icon: 'beach',
      shapes: { product: 'Time Off', line: 'Policies and approvals that run themselves' } },
    { id: 'attendance',   name: 'Tracking attendance hours for payroll',     hours: 3,   icon: 'clock-hour-4',
      shapes: { product: 'Attendance', line: 'Hours calculated automatically for payroll' } },
    { id: 'onboarding',   name: 'Building onboarding for a new hire',        hours: 2,   icon: 'user-plus',
      shapes: { product: 'Workflows', line: 'AI-generated onboarding that runs end to end' } },
    { id: 'policy-qs',    name: 'Answering employee questions about policies', hours: 3, icon: 'message-question',
      shapes: { product: 'AI agents', line: 'Employees get answers instantly from your docs' } },
    { id: 'attrition',    name: 'Preparing an attrition report for leadership', hours: 1.5, icon: 'chart-line',
      shapes: { product: 'People Analytics', line: 'Ask for the report, get the dashboard' } },
    { id: 'signatures',   name: 'Chasing people to sign documents',          hours: 1,   icon: 'signature',
      shapes: { product: 'Docs & eSign', line: 'Send, sign and track in one place' } },
    { id: 'performance',  name: 'Running the performance review cycle',      hours: 2,   icon: 'target-arrow',
      shapes: { product: 'Performance & Growth', line: 'Cycles that build and run themselves' } },
    { id: 'surveys',      name: 'Analyzing engagement survey results',       hours: 1,   icon: 'mood-smile',
      shapes: { product: 'Surveys', line: 'AI surfaces the patterns for you' } },
    { id: 'compensation', name: 'Gathering data for a compensation cycle',   hours: 1.5, icon: 'coin',
      shapes: { product: 'Compensation', line: 'Comp cycles with the data already in place' } },
    { id: 'org-chart',    name: 'Updating the org chart',                    hours: 0.5, icon: 'hierarchy-2',
      shapes: { product: 'People Directory', line: 'Always up to date, automatically' } },
  ],

  // ---- 4. Result ----
  // Profile by number of tasks swiped "Me, manually" (inclusive ranges)
  profiles: [
    { id: 'automator',   min: 0, max: 2,  name: 'The Automator',
      description: "You've already pushed most of the admin off your plate. The next step is building the tools you wish you had, just by describing them." },
    { id: 'firefighter', min: 3, max: 6,  name: 'The Firefighter',
      description: 'Half your processes run themselves, the other half run you. Every week starts with a plan and ends with putting out fires.' },
    { id: 'spreadsheet', min: 7, max: 10, name: 'The Spreadsheet Wizard',
      description: 'You keep the whole company running with spreadsheets, reminders and sheer willpower. Impressive. Also exhausting.' },
  ],
  result: {
    profileKicker: 'Your HR profile',
    hoursBefore: 'You could win back',
    hoursAfter: 'hours a week',           // "~X hours a week"
    hoursNote: 'Estimate based on your answers and company size.',
    zeroHours: "You're already ahead. See what's next.",
    teaserTitle: 'Want the full breakdown?',
    teaserLine: 'See exactly which tasks can run on autopilot, and how.',
    teaserLocked: 'Hours and how it runs on autopilot',   // shown blurred in the locked list
  },

  // ---- 5. Lead form ----
  form: {
    firstName: 'First name',
    email: 'Work email',
    company: 'Company name',
    hrSystem: 'Current HR system',
    hrSystemPlaceholder: 'Choose one',
    hrSystems: ['Spreadsheets', 'BambooHR', 'HiBob', 'Personio', 'Rippling', 'Other'],
    button: 'Get my full report',
    sending: 'Building your report…',
    errors: {
      required: 'Please fill in this field.',
      email: 'Please enter a valid email address.',
      freeEmail: 'Please use your work email so we can tailor the report',
      hrSystem: 'Please choose one.',
    },
    privacyNote: 'We’ll only use your details to send the report and follow up about Shapes.',
  },

  // Free email providers → ask for a work email instead
  freeEmailDomains: [
    'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'ymail.com', 'hotmail.com', 'hotmail.co.uk',
    'outlook.com', 'live.com', 'msn.com', 'icloud.com', 'me.com', 'mac.com', 'aol.com',
    'proton.me', 'protonmail.com', 'gmx.com', 'gmx.net', 'yandex.com', 'mail.com', 'zoho.com',
    'walla.co.il', 'walla.com',
  ],

  // ---- 6. Full report ----
  report: {
    headline: "Here's where your week goes",
    perWeek: 'h/week',
    noManual: "Nothing on your list is manual. Here's what's next:",
    buildTitle: 'Build any tool, just by describing it',
    buildLine: "Need a dashboard that doesn't exist yet? Describe it, and it's built.",
    demoButton: 'Book a demo',
    againButton: 'Play again',
  },

  // Page meta (also set in index.html for crawlers)
  meta: {
    title: 'How much of your week does admin steal?',
  },
};

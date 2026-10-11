# How much of your week does admin steal?

Swipe-game lead magnet for Shapes (shapes.co). Plain HTML/CSS/vanilla JS, no build step.

## Run locally

```sh
cd ~/shapes-hr-game
python3 -m http.server 8080
```

Then open http://localhost:8080 (use your browser's mobile/responsive mode to see it at 390px).

## Edit content

Everything editable is in `js/config.js`:
- `WEBHOOK_URL` — where leads are POSTed as JSON (empty = payload is logged to the browser console)
- `DEMO_URL` — the "Book a demo" link
- all copy, the 10 tasks (name, base hours/week, icon, how Shapes handles it), size multipliers, profiles, form labels/errors, free-email domains

Icons are Tabler icon names: https://tabler.io/icons

## Lead payload

```json
{
  "firstName": "Dana", "email": "dana@acme.io", "company": "Acme", "hrSystem": "HiBob",
  "companySize": "51–200", "profile": "The Firefighter", "profileId": "firefighter", "hoursPerWeek": 9,
  "tasks": {
    "manual":    [{ "id": "attendance", "name": "Tracking attendance hours for payroll", "hoursPerWeek": 3 }],
    "automated": [{ "id": "onboarding", "name": "Building onboarding for a new hire" }]
  },
  "attribution": { "utm_source": "facebook", "utm_campaign": "..." },
  "submittedAt": "2026-10-11T12:00:00.000Z",
  "page": "https://…"
}
```

The report is shown even if the webhook request fails (the error is logged).

## Before going live

- In `index.html`, replace `YOUR-DOMAIN` in `og:url` and `og:image` with the real domain (OG tags need absolute URLs).
- The webhook endpoint must allow cross-origin POSTs (CORS) from that domain.

## Share image

`assets/og-image.png` is rendered from `tools/og.html` with `sh tools/render-og.sh` (needs Google Chrome).

# GenView — Landing redesign port

## Original problem statement
> "Alright here it is - https://github.com/Joy2406/Gen-View, make sure the main functionality of the app is not changed"

## Stack confirmed
Next.js 15 (App Router · Turbopack) · Clerk auth · Drizzle ORM + Neon · Google Gen AI · Tailwind v4 · Radix · shadcn

## Files modified (UI only — 3 files)
- `app/page.js` — replaced the old "Welcome to GenView" centered card with the v3 kinetic landing (status bar → nav → hero → rewrite moment → HITL comparison → live booth mock → how-it-works → reviewer wall → CTA → dark footer). Clerk `SignInButton mode="modal" forceRedirectUrl="/dashboard"` is preserved exactly — every CTA still routes through it for signed-out users, and signed-in users go straight to `/dashboard`. `<UserButton>` shown when signed in.
- `app/layout.js` — added `Instrument_Serif` from `next/font/google` and exposed it as `--font-instrument-serif`. Everything else (ClerkProvider, Toaster, Geist Sans/Mono, metadata) is byte-identical to the original.
- `app/globals.css` — DEDUPED the duplicate `@import "tailwindcss"` / `@import "tw-animate-css"` lines (lines 4-5 were a copy). APPENDED a `:root` block with cyan/ochre/warm-off-white tokens, plus scoped helper classes (`gv-*` prefix) for hairlines, elevation, ambient orbs, marquee, typewriter, scan-line, strike-through, drift, etc. All your existing oklch tokens & dark variant are untouched.

## File added (1 file)
- `app/_components/Logo.jsx` — the cyan GenView SVG mark used in nav & footer. Doesn't touch your existing `/public/logo_gv.png` favicon.

## Untouched (functionality preserved 100%)
- `middleware.js` — Clerk route protection
- `app/api/notify-coach/route.js`
- `app/dashboard/*` — list, AddNewInterview, InterviewItemCard, Header, layout
- `app/dashboard/interview/[interviewId]/*` — start, feedback, Question/RecordAnswerSection
- `app/operator/[interviewId]/page.jsx` — the actual HITL operator screen
- `app/(auth)/sign-in/[[...sign-in]]/page.jsx`
- `drizzle/*`, `lib/*`, `utils/*`
- `components/ui/*`
- `package.json`, `next.config.mjs`, `tailwind.config.js`, `components.json`, `jsconfig.json`

## What still works (verified)
- Dev server: `npm run dev` → HTTP 200 on `/`
- Page HTML contains all expected sections: "Don't just practice", "judged" (striked), rotating "humans/real panels/ex-FAANG/...", "Reviewer assigned · Priya M.", "verdict in 3h 41m", "Forget STAR", "human review pass", reviewer wall, dark footer
- Clerk wiring intact: `SignInButton mode="modal" forceRedirectUrl="/dashboard"` wraps every primary CTA
- Lint clean on `page.js`, `layout.js`, `Logo.jsx`

## To run locally (user side)
1. Pull these 4 files into your repo
2. Your existing `.env.local` (with real Clerk + Neon + Google GenAI keys) already covers everything — no new env vars needed
3. `npm run dev` and the dashboard / interview / operator / feedback flows continue to work unchanged

## Backlog (P0 next step — same visual language)
- Dashboard re-skin: Header.jsx, InterviewList.jsx, AddNewInterview.jsx, InterviewItemCard.jsx
- Interview booth re-skin: QuestionSection.jsx, RecordAnswerSection.jsx
- Feedback page re-skin: app/dashboard/interview/[interviewId]/feedback/page.jsx
- Operator HITL screen re-skin: app/operator/[interviewId]/page.jsx
- Sign-in page minor tweaks
- Mobile polish pass

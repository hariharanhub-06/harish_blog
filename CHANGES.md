# Harishblog — Implementation & Change Log

> All planning decisions, bug fixes, feature additions, and security hardening for the admin panel and main public page.

---

## Project Stack

- **Framework:** Next.js 15 (App Router, Server + Client Components)
- **Database:** PostgreSQL via Neon serverless, Drizzle ORM
- **Auth:** Firebase Authentication + custom PostgreSQL session table (`adminSessions`)
- **Payments:** Razorpay
- **Storage:** ImageKit CDN
- **Email:** Nodemailer / SMTP
- **Styling:** Tailwind CSS + Framer Motion
- **PWA:** Service Worker + Web Push (VAPID)
- **Key libs:** `react-globe.gl`, `react-hot-toast`, `lucide-react`, `date-fns`

---

## Phase 1 — User-Requested Features

### 1.1 Login — Fix Timeout on First Click
**File:** `src/app/admin/login/page.tsx`
- Moved `setPersistence(auth, browserSessionPersistence)` into a `useEffect` on mount
- Removed the blocking `await setPersistence(...)` from inside `handleLogin()`

### 1.2 Login — Password Eye Toggle
**File:** `src/app/admin/login/page.tsx`
- Added `showPassword` state; toggles input `type` between `"text"` / `"password"`
- Eye/EyeOff lucide icons, positioned `absolute right-4` inside the input wrapper

### 1.3 Login — Working "Forgot?" Button
**File:** `src/app/admin/login/page.tsx`
- If email field is filled → `sendPasswordResetEmail(auth, email)` + shows confirmation toast
- If email is empty → focuses the email input

### 1.4 Admin Header — More Vertical Space
**File:** `src/app/admin/dashboard/page.tsx`
- Changed header height from `h-24` → `h-28`

### 1.5 Notifications — Mark as Read + Feedback Status Fix
**Files:** `src/db/schema.ts`, `src/app/api/admin/notifications/route.ts`, `src/app/admin/dashboard/page.tsx`
- Schema: Changed `feedbacks` default status `"Fresh"` → `"New"` (notifications were querying for `"New"` but inserting `"Fresh"`)
- API: Added `PATCH` handler that sets `status = 'Seen'` on all `"New"` items in `contactSubmissions`, `feedbacks`, `formResponses`
- Dashboard: Wired "Mark everything as seen" button `onClick` → PATCH → `fetchAllCounts()`

### 1.6 Messages Badge — Shows Correct Unread Count
**File:** `src/app/admin/dashboard/page.tsx`
- Added separate `unreadMessages` state
- `fetchAllCounts` now separately counts messages with `status="New"` from `/api/admin/messages`
- Messages nav item badge now uses `unreadMessages` (not the global notification count)

### 1.7 Remove Business Solutions Section
**File:** `src/components/MainContent.tsx`
- Removed `BusinessSolutionsSection` import and its JSX usage

### 1.8 Travelled Feature (New)
See **Phase K** below for full implementation details.

### 1.9 Reset Password in Admin Settings
**File:** `src/components/admin/SettingsModule.tsx`
- Added "Change Password" card with: Current Password (eye toggle), New Password (eye toggle), Confirm New Password
- Validates new === confirm before submitting
- `reauthenticateWithCredential` → `updatePassword` flow using Firebase Auth
- Shows specific error messages per failure type (wrong password, weak password, etc.)

---

## Phase 2 — Showstopper Bugs

### 2.1 Live Admin Session — Wrong Redirect on Not Found
**File:** `src/app/admin/live/[sessionId]/page.tsx`
- `redirect("/admin?error=not_found")` was going to the login page instead of dashboard
- Fixed: `redirect("/admin/dashboard?error=not_found")`

### 2.2 Pricing Route — Infinite Recursion
**File:** `src/app/api/admin/pricing/route.ts`
- `return GET()` was a recursive self-call after `seedDefaults()` → infinite loop
- Fixed: Replaced with a direct `Promise.all` fetch after seeding

### 2.3 Agile Module — Missing Table Definitions
**Files:** `src/app/api/admin/agile/*/route.ts`
- All 6 agile routes (`epics`, `issues`, `meetings`, `projects`, `sprints`, `workflows`) referenced tables that don't exist in the schema → runtime crash
- Fixed: Replaced each route body with a proper `501 Not Implemented` response while retaining auth guards

### 2.4 PWA Manifest — Scope Breaks Public Site
**File:** `public/manifest.json`
- `"scope": "/admin"` and `"start_url": "/admin/login"` meant PWA install opened the login page
- Fixed: `"scope": "/"`, `"start_url": "/"`

### 2.5 Stream API Keys Empty → StreamClient Crash
**File:** `src/app/api/sessions/live-token/route.ts`
- `process.env.STREAM_API_KEY!` was empty string → StreamClient crashed at runtime
- Fixed: Guard added — returns `503 Stream not configured` if keys are empty

### 2.6 Payment Verification — Session Fetched After It's Used
**File:** `src/app/api/sessions/verify-payment/route.ts`
- `session` was fetched at line ~62 but `session?.price` was accessed at line ~43 → always `undefined`, `amountPaid` = 0
- Fixed: Moved session fetch to before first usage

---

## Phase 3 — High Severity Bugs

### 3.1 "Visit Website" Button — No onClick
**File:** `src/app/admin/dashboard/page.tsx`
- Fixed: `onClick={() => window.open('/', '_blank')}`

### 3.2 Finance Debts/Loans — parseFloat(undefined) = NaN in DB
**Files:** `src/app/api/admin/finance/debts/route.ts`, `src/app/api/admin/finance/loans/route.ts`
- Added required field validation + `isNaN()` check before inserting

### 3.3 repair-db Endpoint — Unauthenticated
**File:** `src/app/api/repair-db/route.ts`
- Anyone could alter the schema; added `X-Session-Id` header auth check

### 3.4 SettingsModule — Broken Device Trust Detection
**File:** `src/components/admin/SettingsModule.tsx`
- `device.os.includes(currentSessionId ? "!" : "")` was always false
- Fixed: Removed `isPotentiallyCurrent` or replaced with meaningful device comparison

### 3.5 SettingsModule — Undefined Token in localStorage
**File:** `src/components/admin/SettingsModule.tsx`
- If `data.rawToken` was undefined, `localStorage.setItem("admin_deviceToken", undefined)` stored the literal string `"undefined"`
- Fixed: `if (data.rawToken) localStorage.setItem(...)`

### 3.6 MainContent — Null Profile Crash
**File:** `src/components/MainContent.tsx`
- `profile.trainingStats` and `profile.stats?.find(...)` used without null guard on `profile`
- Fixed: Wrapped all profile-dependent sections in `{profile && <Component />}`

### 3.7 QuizModule — Bulk Import Array Out-of-Bounds
**File:** `src/components/admin/QuizModule.tsx`
- `charCodeAt(0) - 65` could produce negative/out-of-bounds index on invalid paste → crash
- Fixed: `if (charToIndex >= 0 && charToIndex < options.length)`

### 3.8 FormsModule — Empty Catch Blocks (Silent Failures)
**File:** `src/components/admin/FormsModule.tsx`
- `} catch (e) { }` — delete/save failures were invisible to user
- Fixed: `toast.error("Failed to delete form")` in catch blocks

### 3.9 Service Worker — Push Event No Error Handling
**File:** `public/sw.js`
- `event.data.json()` could throw on malformed payload; no try/catch → silent failure
- Fixed: Wrapped in try/catch; added `.catch()` on `clients.openWindow()`

### 3.10 Array Destructuring Without Bounds Check
**Files:** `src/app/api/admin/sessions/route.ts`, `src/app/api/admin/auth/device-login/route.ts`, `src/app/api/admin/kanban/route.ts`, `src/app/api/admin/routines/route.ts`, `src/app/api/admin/finance/transactions/route.ts`
- `const [item] = await db.insert(...).returning()` would crash if DB returned empty array
- Fixed: `if (!item) return NextResponse.json({ error: "Failed" }, { status: 500 })`

### 3.11 TimelineModule — handleToggleCurrent Broken for Education/Volunteering
**File:** `src/components/admin/TimelineModule.tsx`
- Endpoint was hardcoded to `/api/admin/experience` regardless of entry type
- Fixed: Ternary endpoint selection based on `type` parameter

### 3.12 TimelineModule — Volunteering Fetch Error Not Checked
**File:** `src/components/admin/TimelineModule.tsx`
- Third fetch result (volunteering) was not checked with `if (volRes.ok)` → silent failure
- Fixed: Added `if (volRes.ok) setVolunteerings(await volRes.json())`

### 3.13 FeedbackModule — Create Uses Wrong API Endpoint
**File:** `src/components/admin/FeedbackModule.tsx`
- Admin create was calling `POST /api/feedback` (public endpoint) instead of `/api/admin/feedbacks`
- Fixed: Changed to `POST /api/admin/feedbacks`

### 3.14 FinanceModule — Stats State Null → Runtime Crash
**File:** `src/components/admin/FinanceModule.tsx`
- `stats` initialized as `null` but `stats.summary`, `stats.debtBalance` accessed without null check
- Fixed: Initialized with default structure `{ summary: [], debtBalance: 0, loanBalance: 0, trend: [], categories: [] }`

### 3.15 AdminLiveRoomClient — Dark Mode White Background
**File:** `src/components/admin/AdminLiveRoomClient.tsx`
- `bg-white` without `dark:bg-[#1e1e1e]` → white background in dark mode (text invisible)
- Fixed: Added `dark:bg-[#1e1e1e]` to all affected elements

### 3.16 FinanceModule — History Tab Search Input Has No onChange
**File:** `src/components/admin/FinanceModule.tsx`
- Search input had no `onChange` handler — typing did nothing
- Fixed: Added `historySearch` state, wired onChange, applied filter to transaction list

### 3.17 Quiz Public — timeTaken Hardcoded to 0
**File:** `src/components/QuizGameOverlay.tsx`
- `timeTaken: 0` always passed to submit → leaderboard speed rankings meaningless
- Fixed: `timeTaken = quizDuration - timeLeft`

### 3.18 Session Tracking — Contradictory Flow on 401
**File:** `src/app/admin/dashboard/page.tsx`
- 401 called `logout()` but retry setTimeout still fired — contradictory
- Also: no redirect to login after logout
- Fixed: Removed retry on 401; added `router.push('/admin/login')` after logout

### 3.19 Games Leaderboard — No Limit Cap (DoS)
**File:** `src/app/api/games/leaderboard/route.ts`
- `?limit=999999999` could cause memory issues
- Fixed: `Math.min(parseInt(...) || 10, 100)`

### 3.20 Leaderboard DELETE — Unauthenticated
**File:** `src/app/api/admin/quiz-results/route.ts`
- DELETE endpoint had no auth check
- Fixed: Covered under Phase 6 auth hardening (validateAdminSession applied)

---

## Phase 4 — Medium Severity Bugs

| # | Issue | File | Fix |
|---|-------|------|-----|
| 4.1 | Notification `actionTab` undefined tab switch | `dashboard/page.tsx` | `if (item.actionTab) handleTabChange(...)` |
| 4.2 | Kanban: New task with no columns creates invalid task | `KanbanModule.tsx` | Disable "New Task" button when `columns.length === 0` |
| 4.3 | Kanban: Sync failures silent | `KanbanModule.tsx` | `toast.error()` + `fetchData()` rollback |
| 4.4 | Live Sessions: Optimistic UI not rolled back on failure | `LiveSessionsModule.tsx` | Rollback state if API returns error |
| 4.5 | Routines: Daily tasks ignore `isActive` status | `RoutinesModule.tsx` | Added `&& routine.isActive` check in `isTaskDue()` |
| 4.6 | Leaderboard: Race condition on filter change | `LeaderboardModule.tsx` | `AbortController` to cancel previous request |
| 4.7 | Messages: Multiple API calls on rapid dropdown click | `MessagesModule.tsx` | Debounce/disable during update |
| 4.8 | Feedback: Search filter persists across tabs | `FeedbackModule.tsx` | `setSearchQuery("")` on tab change |
| 4.9 | Typing Test: Uses browser `alert()` | `TypingTestSection.tsx` | Replaced with inline `submitMessage` state UI |
| 4.10 | LiveSessionsCarousel: Missing Suspense boundary | `LiveSessionsCarousel.tsx` | Wrapped `useSearchParams()` in `<Suspense>` |
| 4.11 | Feedback: Non-numeric ratings corrupt average | `FeedbackSection.tsx` | `acc + (Number(f.rating) \|\| 0)` |
| 4.12 | Kanban columns DELETE missing try-catch | `kanban/columns/route.ts` | Wrapped in try/catch |
| 4.13 | Feedback rating: No range validation | `feedback/route.ts` | Validate `rating >= 1 && rating <= 5` |
| 4.14 | Finance: Debt edit form doesn't reset on cancel | `FinanceModule.tsx` | `closeDebtModal()` helper resets form state |
| 4.15 | Mobile: Hardcoded widths cause horizontal scroll | `MainContent.tsx` | Added `sm:` breakpoint prefixes |
| 4.16 | Quiz category dropdown: `min-w` overflows mobile | `MainContent.tsx` | `w-full sm:min-w-[200px]` |
| 4.17 | Admin Meetings: Missing dark mode on buttons | `AdminMeetingsModule.tsx` | `dark:bg-gray-800 dark:text-white` |
| 4.18 | Dashboard loading skeleton: No dark mode | `dashboard/page.tsx` | `dark:bg-[#121212]` |
| 4.19 | Profile Module: Shows fake defaults on fetch failure | `ProfileModule.tsx` | Show explicit error state |
| 4.20 | Partners Module: Infinite loading on API error | `PartnershipsModule.tsx` | Set `error` state in UI on failure |
| 4.21 | Overview Module: Stats fetch error not shown | `OverviewModule.tsx` | Added error state card |
| 4.22 | Finance: Cash flow shows fake empty grid | `FinanceModule.tsx` | `if (!analytics?.cashFlowPatterns) return <EmptyState />` |
| 4.23 | Quiz live answer: `points \|\|` treats 0 as falsy | `quiz/live/answer/route.ts` | `currentQuestion.points ?? 1000` |
| 4.24 | Quiz live answer: Speed bonus trusts client `timeLeft` | `quiz/live/answer/route.ts` | Server-side timing using `session.updatedAt` |
| 4.25 | Payments: No positive-amount validation | `sessions/create-order/route.ts` | Reject `amount <= 0` |
| 4.26 | Notification count capped at 15 | `dashboard/page.tsx` | API returns actual total count separately |
| 4.27 | Mobile menu doesn't close on notification click | `dashboard/page.tsx` | `setIsMobileMenuOpen(false)` in handler |
| 4.28 | Finance: Bulk rename no rollback on partial failure | `FinanceModule.tsx` | Server-side transaction; replaced `confirm()` |
| 4.29 | Feedback: Average rating shows "5.0" with no data | `FeedbackModule.tsx` & `FeedbackSection.tsx` | Show `"N/A"` when count is 0 |

---

## Phase 5 — Low / UI Bugs

| # | Issue | File | Fix |
|---|-------|------|-----|
| 5.1 | ClientProjects status dropdown missing dark mode | `ClientProjectsModule.tsx` | `dark:bg-[#1e1e1e]` |
| 5.2 | OverviewModule: Hardcoded "+12.5%" trend | `OverviewModule.tsx` | Removed fake metric |
| 5.3 | FinanceModule: Same fake conversion rate | `FinanceModule.tsx` | Removed fake metric |
| 5.4 | Quiz: `currentQuiz` not cleared on cancel | `QuizModule.tsx` | `setCurrentQuiz(null)` on cancel |
| 5.5 | Game Assets: Input not cleared after save | `GameAssetsModule.tsx` | `setNewAssetUrl("")` on success |
| 5.6 | Feedback: Modal backdrop doesn't close modal | `FeedbackSection.tsx` | `onClick` on backdrop, `stopPropagation` on modal |
| 5.7 | Feedback: Star buttons missing `type="button"` | `FeedbackSection.tsx` | Already had it — no change needed |
| 5.8 | LiveSessionsCarousel: Empty alt text on images | `LiveSessionsCarousel.tsx` | `alt={session.title \|\| "Live session poster"}` |
| 5.9 | Missing `aria-label` on icon-only buttons | Multiple | Added descriptive `aria-label` |
| 5.10 | Schema: Duplicate entry in profile stats default | `src/db/schema.ts` | Removed duplicate "Colleges Partnered" |
| 5.11 | Login: "IT Support" is `href="#"` dead link | `login/page.tsx` | Changed to `mailto:` link |
| 5.12 | AI Assistant: setTimeout race on rapid save | `AIAssistantModule.tsx` | `clearTimeout(timerRef.current)` before each new timer |
| 5.13 | Routines: "Today" stale after midnight | `RoutinesModule.tsx` | Track "today" in state, update in refresh interval |
| 5.14 | Theme: Not detecting system preference on first load | `dashboard/page.tsx` | Check `prefers-color-scheme` media query |
| 5.15 | Admin search cleared on tab change | `dashboard/page.tsx` | Persist `searchQuery` |
| 5.16 | Leaderboard: Game name shows ID if not found | `LeaderboardModule.tsx` | `\|\| "Unknown Game"` fallback |
| 5.17 | Finance: Category edit has no success feedback | `FinanceModule.tsx` | Toast after successful update |
| 5.18 | `console.log` left in production | Multiple | Removed all debug logs (kept `console.error`) |
| 5.19 | InfiniteCarousel: gap-12 too large on mobile | `InfiniteCarousel.tsx` | `gap-6 sm:gap-12` |
| 5.20 | Payments: Origin hardcoded as fallback in email | `sessions/verify-payment/route.ts` | Use `NEXT_PUBLIC_APP_URL` env var |
| 5.21 | Admin messages pagination: No max cap | `admin/messages/route.ts` | `Math.min(limit, 500)` |

---

## Phase 6 — Security Hardening

### Shared Auth Helper
**File:** `src/lib/adminAuth.ts`
```ts
export async function validateAdminSession(req: Request): Promise<NextResponse | null>
```
- Reads `X-Session-Id` header, validates against `adminSessions` table
- Returns `401 Unauthorized` response on failure, `null` on success

### Protected Routes (43 previously unprotected)
All routes under `/api/admin/` now require `X-Session-Id` auth:

**Personal/Content:** `profile`, `skills`, `experience`, `education`, `volunteering`, `youtube`, `projects`, `upload`, `ai-config`, `partnerships`, `partnerships/[id]`

**Finance:** `finance/transactions`, `finance/debts`, `finance/loans`, `finance/analytics`, `finance/summary`, `finance-leads`, `pricing`

**Communication:** `messages`, `messages/count`, `feedbacks`, `notifications`, `client-projects`, `scheduler-documents`

**Sessions/Gaming:** `sessions`, `quizzes`, `quizzes/[id]`, `quiz-results`, `game-assets`

**Tools:** `kanban`, `kanban/columns`, `routines`, `routines/logs`, `routines/analytics`, `forms`, `forms/[id]`, `forms/[id]/responses`

**Agile (501 stubs):** `agile/epics`, `agile/issues`, `agile/meetings`, `agile/projects`, `agile/sprints`, `agile/workflows`

---

## Phase K — Travelled Feature (New)

### Database
**File:** `src/db/schema.ts`
```ts
export const travelledPlaces = pgTable('travelledPlaces', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  cityName: text('cityName').notNull(),
  country: text('country').notNull(),
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
});
```
Pushed to DB with `drizzle-kit push`.

### API Routes
- **`src/app/api/admin/travelled/route.ts`** — Authenticated GET / POST / DELETE
- **`src/app/api/travelled/route.ts`** — Public GET (no auth, for main page)

### Admin Module
**File:** `src/components/admin/TravelledModule.tsx`
- `react-globe.gl` globe (dynamic import, no SSR)
- Click anywhere on globe → yellow pending pin appears
- City name + country form overlay at bottom of globe
- Save → blue pin saved to DB; pins persist on globe
- Grid list of all pinned cities with hover-reveal delete button

### Dashboard Integration
**File:** `src/app/admin/dashboard/page.tsx`
- Added `Globe2` icon to imports
- Added `"travelled"` to `Tab` type union
- Nav item: `{ id: "travelled", title: "Travelled", icon: Globe2, color: "bg-sky-500", group: "Personal" }`
- Switch case: `case "travelled": return <TravelledModule />`

### Main Page Globe
**Files:** `src/components/TravelledGlobe.tsx`, `src/components/MainContent.tsx`, `src/app/page.tsx`
- `TravelledGlobe` — auto-rotating globe, glowing sky-blue pins, HTML tooltip labels
- Globe only shown when at least 1 city is pinned
- Section: "Mapped. Explored. Lived." — left column has title + city chips, right column has globe
- `page.tsx` fetches `travelledPlaces` server-side, passes as prop to `MainContent`

---

## File Cleanup

### Root — Files Deleted
- `tmp0q9es6mc.mp4`, `tmp3w43shm8.mp4` — leftover temp video uploads
- `build-log.txt`, `commit_log.txt`, `contribution-refresh.txt` — stale log files
- `drizzle.config.js` — duplicate of `drizzle.config.ts`

### Root — Files Moved to `scripts/`
All development, diagnostic, and migration scripts consolidated into `scripts/`:
`apply_migration.js`, `apply_token_default.js`, `migrate_meetings.js`, `manual-db-setup.js`, `populate_join_tokens.js`, `fix_registrations_schema.js`, `manual_migrate.ts`, `update-db-schedule.js`, `check-db.ts`, `check-db-direct.js`, `check_db_state.ts`, `check_db_backups.ts`, `check_columns.js`, `check_ik.js`, `check_audio.js`, `check_live_sessions.js`, `check_live_sessions.ts`, `check_profile.ts`, `check_registrations.js`, `check_videos.ts`, `debug_skills_schema.ts`, `setup_ai.js`, `upload_mascot.js`, `test_db.js`, `diagnose_db.ts`, `diagnose_drizzle.ts`, `diagnose_sessions.js`

### public/ — Files Deleted
Default Next.js scaffold assets never used in the project:
`next.svg`, `globe.svg`, `window.svg`, `file.svg`, `vercel.svg`

### src/app/api/temp-migrate/ — Deleted
Unauthenticated DDL endpoint (`ALTER TABLE profiles ADD COLUMN ...`) left from a one-time migration. Removed from production surface.

### src/lib/adminAuth.ts — New File
Shared auth helper — single source of truth for all admin API auth.

---

## Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://...

# Firebase Admin
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# ImageKit
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# Stream.io (Live sessions)
STREAM_API_KEY=
STREAM_API_SECRET=

# Google Gemini
GOOGLE_GEMINI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://hariharan.me
```

> **Security reminder:** `.env.local` must never be committed. Verify `.gitignore` includes it. If any credentials were ever pushed to a public/shared remote, rotate them immediately.

---

## Current Project Structure (post-cleanup)

```
├── public/
│   ├── images/
│   │   ├── business/
│   │   │   └── hm-snacks/
│   │   └── vendor-craftsmanship.png
│   ├── admin-icon.png
│   ├── ads.txt
│   ├── fssai-certificate.png
│   ├── hari-favicon.png
│   ├── hari_photo.png
│   ├── hh-gold-logo.png
│   ├── hm-snacks-logo.png
│   ├── hm-tech-logo.png
│   ├── mascot-dance.mp4
│   ├── manifest.json
│   └── sw.js
├── scripts/           ← all dev/diagnostic/migration scripts
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── api/
│   │   └── (public pages)
│   ├── components/
│   │   ├── admin/     ← admin-only modules
│   │   └── (shared)
│   ├── db/
│   │   ├── index.ts
│   │   └── schema.ts
│   ├── lib/
│   │   ├── adminAuth.ts   ← NEW: shared auth helper
│   │   └── ...
│   └── ...
├── CHANGES.md         ← this file
├── drizzle.config.ts
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

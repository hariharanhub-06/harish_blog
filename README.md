# Harishblog — Hari Haran's Portfolio & Admin Hub

Personal portfolio, live session platform, and admin dashboard for [Hari Haran Jeyaramamoorthy](https://hariharan.me).

## Stack

- **Next.js 15** — App Router, SSR + Client Components
- **PostgreSQL** — Neon serverless via Drizzle ORM
- **Firebase Auth** — Admin authentication
- **Tailwind CSS** — Styling with dark mode
- **Razorpay** — Payment integration for live sessions
- **ImageKit** — CDN for images
- **PWA** — Service Worker + Web Push notifications

## Local Development

```bash
npm install
cp .env.local.example .env.local   # fill in credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

```bash
npx drizzle-kit push    # push schema changes to DB
npx drizzle-kit studio  # open Drizzle Studio (GUI)
```

Migration and diagnostic scripts are in `scripts/`.

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Public portfolio homepage |
| `/admin/login` | Admin login |
| `/admin/dashboard` | Admin control panel |
| `/live/[sessionId]` | Live session viewer |
| `/forms/[id]` | Public form viewer |
| `/quote/[token]` | Public quote page |

## Auth Pattern

Admin API routes use `X-Session-Id` header validated against the `adminSessions` PostgreSQL table. See `src/lib/adminAuth.ts`.

## Documentation

All implementation details, bug fixes, and feature changes are documented in [CHANGES.md](./CHANGES.md).

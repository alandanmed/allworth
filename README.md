<div align="center">

# AllWorth

### Your whole financial picture, in one app.

A full-stack personal finance app: **net worth tracking, spending analytics, budgets, subscription detection, and an AI assistant** that answers questions about your own money.

**[Open the live app](https://allworth-mobile.vercel.app)** &nbsp;·&nbsp; **[Watch the 40-second demo](https://allworth-mobile.vercel.app/#tour)** &nbsp;·&nbsp; **[Live API](https://allworth-api.onrender.com/docs)**

[![AllWorth demo, click to watch](docs/demo-poster.jpg)](https://allworth-mobile.vercel.app/#tour)

</div>

> **Heads up:** the API runs on Render's free tier, so the **first request after a period of inactivity can take 30-50 seconds** while the server wakes up. After that it is fast.

---

## Contents

- [What it does](#what-it-does)
- [Screenshots](#screenshots)
- [Tech stack](#tech-stack)
- [How it's built](#how-its-built)
- [Architecture notes](#architecture-notes)
- [Project structure](#project-structure)
- [Running locally](#running-locally)
- [Testing](#testing)
- [License](#license)

---

## What it does

| | Feature | Details |
|---|---|---|
| **1** | **Net worth tracking** | One dashboard combining checking, savings, credit, investment and loan accounts, with a historical trend line. |
| **2** | **Transaction activity** | Searchable and filterable by category, with a month-over-month spending comparison. |
| **3** | **Budgets** | Set a monthly limit per category and track progress, with **over-budget warnings**. |
| **4** | **Subscription detection** | Recurring charges are found automatically when a merchant repeats across multiple months. Duplicate charges are flagged too. |
| **5** | **AI assistant** | Ask in plain language ("What's my net worth?", "Show my subscriptions") and get answers grounded in **your real data**, with a clear *not professional financial advice* disclaimer. |
| **6** | **Bank connections** | Link accounts through **Plaid Sandbox**. Disconnecting a bank hides its accounts everywhere while preserving transaction history. |
| **7** | **Daily summary** | An opt-in daily digest of spending, unusually large transactions and budget warnings, with **amounts hidden until opened**. |
| **8** | **Web, iOS and Android** | One TypeScript codebase. Dark mode, accessibility-audited screens, and consistent loading, empty and error states throughout. |

---

## Screenshots

> Captured against the **live deployed backend** with seeded demo data.

### Home: net worth at a glance

**Assets minus liabilities across every linked account, with a trend line and your most recent transactions.**

<p align="center">
  <img src="docs/screenshots/01-home.png" alt="Home screen showing net worth, assets, liabilities and recent transactions" width="300">
</p>

<br>

### Accounts: everything grouped by institution

**Checking, savings, credit cards, loans and investments in one list, organized by the bank they belong to.**

<p align="center">
  <img src="docs/screenshots/02-accounts.png" alt="Accounts screen grouped by institution" width="300">
</p>

<br>

### Activity: where the money goes

**Monthly spending broken down by category and compared with last month, plus search and category filters.**

<p align="center">
  <img src="docs/screenshots/03-activity.png" alt="Activity screen with spending by category and transaction list" width="300">
</p>

<br>

### Budgets: limits that warn you

**Set a limit per category and watch progress in real time. Going over turns the bar red and shows by how much.**

<p align="center">
  <img src="docs/screenshots/04-budgets.png" alt="Budgets screen with progress bars and an over-budget warning" width="300">
</p>

<br>

### Assistant: ask your money anything

**A Claude-powered assistant that answers from your actual accounts and transactions, not guesses. It can only call a fixed set of read-only tools.**

<p align="center">
  <img src="docs/screenshots/05-assistant.png" alt="Assistant screen answering a net worth question" width="300">
</p>

---

## Tech stack

### Mobile and web

- **React Native + Expo** (SDK 57) with **TypeScript**
- **Expo Router** for file-based navigation on iOS, Android and web
- **TanStack Query** for server state
- **Firebase Authentication** (client SDK)
- **react-native-web** for the web build, deployed on **Vercel**

### Backend

- **FastAPI** with **SQLAlchemy** and **Alembic** migrations
- **PostgreSQL**
- **Firebase Admin SDK** for ID token verification
- **Plaid Sandbox API**, with access tokens **encrypted at rest** (Fernet)
- **Anthropic Claude API** for the assistant, restricted to a fixed set of read-only, per-user tools
- **Pytest** covering AI tools, auth, budgets, chat, daily summaries, subscriptions, models and spending math

### Infrastructure

- **Render** web service and managed PostgreSQL, defined in a single `render.yaml` Blueprint
- **Alembic migrations run automatically** on every deploy
- **Vercel** serves the static web export

---

## How it's built

**One TypeScript codebase targets iOS, Android and web.**

- **Navigation** uses Expo Router on all three platforms.
- **Web-only pieces** (the marketing landing page, the Firebase web config, the tab bar) live in `*.web.tsx` and `*.web.ts` files that Metro picks automatically, so native builds are untouched.
- **The web build** is a static export (`expo export --platform web`) served by Vercel, and it talks to the **same FastAPI backend** as the mobile app.
- **Site vs. app:** on the web, the root URL always opens the **marketing site**. Pressing **Launch** enters the app (login or sign-up first). A **Back to site** button lives beside the app frame, never inside it, and the session stays signed in until you log out.
- **Production CORS** is locked to the deployed origin through the `CORS_ALLOWED_ORIGINS` environment variable.

**Request flow**

1. The client signs in with **Firebase** and receives an ID token.
2. Every API call carries that token.
3. The backend **verifies it** with the Firebase Admin SDK.
4. Every query is **scoped to that user**.

---

## Architecture notes

### Per-user data isolation

**Isolation is enforced at the query level on every endpoint**, not just at the auth boundary. A valid token never grants access to another user's rows.

### Disconnecting a bank is a soft delete

Disconnecting sets `sync_status = "disconnected"` instead of deleting rows, so **history is preserved**. Every query that touches accounts (net worth, budgets, transactions, the assistant's tools, daily summaries) **explicitly excludes disconnected accounts**, so stale balances never leak into the numbers you see.

### The AI assistant cannot query the database

It can only call a **fixed set of tool functions**, each scoped to the authenticated user:

| Tool | Purpose |
|---|---|
| `get_net_worth` | Total assets minus liabilities |
| `get_account_balances` | Balance per account |
| `get_recent_transactions` | Latest activity |
| `get_spending_by_category` | Spending breakdown for a period |
| `compare_spending_periods` | Month-over-month comparison |
| `get_subscriptions` | Detected recurring charges |
| `find_large_transactions` | Unusually large purchases |

### Secrets are protected

Plaid access tokens are **encrypted at rest** with Fernet, and all credentials come from environment variables, never from the repo.

---

## Project structure

```
allworth/
├── mobile/                 # React Native (Expo) app: iOS, Android and web
│   ├── src/
│   │   ├── app/            # Screens (Expo Router)
│   │   ├── components/     # Shared UI, including the web landing page
│   │   ├── hooks/          # TanStack Query hooks per domain
│   │   └── api/            # API client
│   ├── public/             # Web assets (demo video, screenshots, icons)
│   └── vercel.json         # Vercel build and routing config
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── routers/        # API endpoints by domain
│   │   ├── models/         # SQLAlchemy models
│   │   ├── ai/             # Claude assistant and its restricted tool set
│   │   ├── scripts/        # Seed script for demo data
│   │   └── utils/          # Spending, net worth and date helpers
│   └── tests/              # Pytest suite
├── docs/                   # README images
└── render.yaml             # Render Blueprint (API + managed Postgres)
```

---

## Running locally

### Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env     # add your own Firebase, Plaid and Anthropic credentials
docker compose up -d     # starts local Postgres
alembic upgrade head
uvicorn app.main:app --reload
```

### Mobile and web

```bash
cd mobile
npm install
npx expo start           # press "w" for web, "i" for iOS, "a" for Android
```

**By default the app points at** `http://127.0.0.1:8000`. **To use the deployed backend instead:**

```bash
EXPO_PUBLIC_API_BASE_URL=https://allworth-api.onrender.com npx expo start
```

### Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | mobile | API the app talks to |
| `CORS_ALLOWED_ORIGINS` | backend | Comma-separated allowed web origins in production |
| Firebase, Plaid, Anthropic keys | backend `.env` | See `backend/.env.example` |

---

## Testing

```bash
cd backend
pytest
```

---

## License

Released under the **MIT License**. See [LICENSE](LICENSE).

<div align="center">

**Built by [Alan Medina](https://github.com/alandanmed)**

</div>

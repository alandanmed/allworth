# AllWorth

A cross-platform personal finance app that brings a user's accounts into
one dashboard — net worth, transactions, budgets, bills, and an AI
assistant that answers questions about the user's own financial data.

> **Status:** Early development. Currently using simulated/mock financial
> data only. Plaid Sandbox integration (also simulated) planned for a later phase.

## Tech Stack
- **Mobile:** React Native, Expo, TypeScript, Expo Router, TanStack Query, Zustand
- **Backend:** Python, FastAPI, SQLAlchemy, Alembic, PostgreSQL
- **AI:** Claude API with restricted, predefined financial tools (no unrestricted DB access)

## Project Structure
allworth/
├── mobile/     # React Native (Expo) app
├── backend/    # FastAPI backend
└── docs/       # Architecture, schema, and design documentation

## Status
This project is being built incrementally and documented milestone by milestone.
See `docs/` for detailed product requirements, database schema, API design, and
architecture decisions as they're written.

## License
See LICENSE file.

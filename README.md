# Reload Hub

> Working title — previously specced as "On-Target"; the project docs in
> `docs/` still use that name.

Companion app for handloaders: load development with versioning, component
inventory with lot tracking, an offline-capable range log, and customizable
process checklists. Built with Expo (React Native) and Supabase.

> On-Target is a record-keeping tool. It does not provide, verify, or endorse
> load data.

## Stack

- Expo SDK 57 · expo-router (typed routes) · React Compiler
- TypeScript strict · NativeWind · Supabase (Postgres + RLS, Auth, Edge Functions)
- Offline cache-first reads, offline write queue for the range log

## Development

```bash
npm install
npx expo start
```

Checks (keep green after every change):

```bash
npm run typecheck
npm run lint
npm test
```

## Docs

- `docs/MVP_SPEC.md` — vision, feature scope, phases, safety copy
- `docs/DATA_MODEL.md` — schema, relations, unit conventions, RLS
- `docs/RANGE_FLOWS.md` — range screens and offline write queue
- `docs/SETUP_CHECKLIST.md` — bootstrap order (repo, Expo, Supabase, EAS)

Agent guidance lives in `AGENTS.md` / `CLAUDE.md`.

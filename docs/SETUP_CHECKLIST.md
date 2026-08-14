# On-Target — Setup-Checkliste (Phase 0)

Für Claude Code: Schritte in dieser Reihenfolge. Schritte mit 👤 kann nur der
Besitzer ausführen — dort klare, nummerierte Anweisungen ausgeben und auf
Bestätigung warten. Nichts simulieren, keine Platzhalter-Keys committen.

## 1. Repo & Projekt
- [x] `git init` im Projektordner (EAS verlangt Git).
- [x] Aktuellstes stabiles Expo SDK ermitteln (docs.expo.dev), Version in
      `AGENTS.md` eintragen und pinnen.
- [x] Expo-Projekt mit TypeScript-Template erzeugen, expo-router (typed
      routes), React Compiler aktivieren.
- [x] NativeWind, `@react-native-async-storage/async-storage`,
      `@react-native-community/netinfo`, `expo-crypto`, Supabase-JS,
      `react-native-svg` installieren — Versionen kompatibel zum SDK
      (`npx expo install`).
- [x] eslint (`eslint-config-expo`) + prettier + tailwind-Plugin einrichten.
- [x] Ordnerstruktur: `src/app` (Route-Groups `(auth)`/`(app)`/`(tabs)`),
      `src/components`, `src/lib`, `src/content/guide`.
- [x] `src/lib/units.ts` (Konstanten + convert/format-Helper) und
      `src/lib/i18n.ts` (t-Objekt, EN) als erste Lib-Dateien anlegen —
      inkl. Unit-Tests für units.ts (grains↔mg Roundtrip).
- [x] `.gitignore` gemäß AGENTS.md (Harte Regeln). Erster Commit.
- [x] 👤 GitHub-Repo anlegen (privat), Remote setzen, pushen.

## 2. Supabase
- [x] 👤 Supabase-Projekt erstellen (Region EU, z. B. eu-west-1 / eu-central),
      Projekt-URL + publishable Key in `.env` eintragen
      (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY`).
- [x] Supabase-Client in `src/lib/supabase.ts` (AsyncStorage-Session-Persist).
- [x] `supabase/migrations/`-Struktur anlegen; Supabase CLI initialisieren.
- [x] Offene Entscheidungen aus `docs/DATA_MODEL.md` (⚠️-Markierungen) mit dem
      Besitzer klären.
- [x] Migration `001_foundation` als Entwurf zeigen → 👤 Freigabe → ausführen
      → DB-Typen generieren (`src/lib/database.types.ts`).

## 3. App-Skeleton
- [x] Auth-Flow: Login/Signup/Reset-Screens, Session-Gate im Root-Layout,
      Netzwerkfehler ≠ „falsche Zugangsdaten".
- [x] Onboarding: Safety-Acknowledgement (Text aus MVP_SPEC) + Einheiten-
      Preset-Wahl → `profiles`.
- [x] `(tabs)`-Gerüst: Loads / Inventory / Range / Process / Profile
      (leere Screens mit ErrorState/Loading-Pattern).
- [x] `useIsOnline` + `OfflineBanner` + `ErrorState` + `showErrorAlert`
      als gemeinsame Bausteine.
- [x] `LoadDataDisclaimer`-Komponente (kompakte + volle Variante).
- [x] `npx tsc --noEmit` + `npx expo lint` grün; Commit "Phase 0 complete";
      Checkbox in CLAUDE.md abhaken.

## 4. Noch NICHT jetzt
- EAS-Setup, Sentry, Push, Store-Assets: erst wenn Phase 1–2 stehen und ein
  Gerätetest ansteht (dann AGENTS.md → EAS-Abschnitt abarbeiten).
- Kein Seed mit realen Ladedaten — nie.

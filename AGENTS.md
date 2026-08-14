# Projekt: On-Target

<!-- Blueprint auf Basis des bewährten Jachtacademie-Stacks (Stand 2026-07).
     Mobile-first; Website/Webplattform folgt später. -->

**On-Target** ist eine Companion-App für Wiederlader (Handloader): Laborierungen
mit Versionierung, Komponenten-Inventar mit Lot-Tracking, Range-Log (offline-fähig)
und individualisierbare Prozess-Checklisten. Sprache: **Englisch** (UI), Zielgruppe
Einsteiger bis Wettkampfschützen. Mobile App (iOS + Android).

## ⚠️ Expo ist versionssensibel
Lies **immer** die exakten Versions-Docs auf https://docs.expo.dev/versions/⟨vXX⟩/ bevor du Expo-Code schreibst. APIs ändern sich pro SDK — nicht aus älterem Wissen raten.

## Tech-Stack (diese Versionen pinnen)
- **Expo SDK 57** (gepinnt: `expo ~57.0.12`, React Native 0.86, React 19.2.3; Docs: https://docs.expo.dev/versions/v57.0.0/), **expo-router** (file-based, **typed routes**), React Compiler an
- **TypeScript strict**; Path-Alias `@/* → src/*`
- **NativeWind** (Tailwind für RN); Design-Tokens in `src/lib/colors.ts`
- **Supabase**-Backend: Postgres + **RLS überall**, **SECURITY-DEFINER-RPCs**, **Edge Functions (Deno)**, `pg_cron`, `pg_net`, **Vault** für Secrets
- **Supabase Auth** (E-Mail/Passwort, JWT)
- **Offline cache-first** mit AsyncStorage (stale-while-revalidate: `useCachedQuery`-Hook mit `isOnline`-Guard)
- **Offline-Write-Queue** für den Range-Log (siehe `docs/RANGE_FLOWS.md`) — Kernanforderung, kein Nice-to-have
- **EAS Build/Submit** (`appVersionSource: remote`, `autoIncrement`)
- **Sentry** (`@sentry/react-native`) für Crash-/Error-Monitoring
- **expo-notifications** + Supabase für Push (FCM V1 + APNs)
- **react-native-svg** für Custom-Icons; `@expo/vector-icons` für den Rest
- **i18n** über ein einziges `t`-Objekt in `src/lib/i18n.ts` (keine i18n-Lib). UI-Sprache Englisch; **kein einziger hartkodierter String** in Components — alles über `t`, von Tag 1
- **eslint** + `eslint-config-expo`; prettier + `prettier-plugin-tailwindcss`

## Domäne: Wiederladen — harte Regeln (Sicherheit)
- **NIEMALS konkrete Ladedaten erfinden oder vorschlagen** (Pulverladungen in
  grains/Gramm, Min/Max-Bereiche, "typische" Ladungen). Auch nicht als Seed-,
  Beispiel-, Test- oder Demo-Daten. Beispieldaten nutzen Platzhalter (`XX.X gr`)
  oder Werte, die als fiktiv gekennzeichnet sind (`DEMO — not a real load`).
- Jede UI, die Ladedaten anzeigt, rendert die Komponente `LoadDataDisclaimer`
  (Text siehe `docs/MVP_SPEC.md` → Safety). Keine Ausnahmen.
- **Keine publizierten Ladedaten-Tabellen** (Hodgdon, Vihtavuori, Hersteller)
  kopieren, scrapen oder einbetten — Copyright. Nur auf offizielle Quellen verlinken.
- Die App **berechnet oder validiert keine Ladungen** (keine "safe load"-Logik,
  keine Interpolation, keine QuickLOAD-artigen Features). Sie dokumentiert nur,
  was der User eingibt. Plausibilitäts-Checks sind reine Tippfehler-Warnungen
  (z. B. Ladung > Geschossgewicht) und niemals eine Sicherheitszusage.
- **Store-Compliance:** KEINE Kauf-, Shop-, Affiliate- oder Preisvergleichs-Features
  in der App (Apple/Google-Richtlinien zu Munition/Komponenten). Solche Features
  existieren — falls überhaupt — nur in der späteren Web-Version. Auch keine
  Links, die direkt in einen Komponenten-Checkout führen.
- Community-Features (Phase 5): geteilte Laborierungen zeigen die Ladung erst
  nach bestätigtem Warnhinweis; Details in `docs/MVP_SPEC.md`.

## Einheiten (kritisch, von Tag 1)
- **DB speichert kanonisch:** Masse in **mg** (numeric), Länge in **mm** (numeric),
  Geschwindigkeit in **m/s** (numeric), Temperatur in **°C**, Distanz in **m**.
- Zu jedem messbaren Eingabefeld wird zusätzlich der **Roheingabewert + Einheit**
  gespeichert (`*_input` text, z. B. `"42.5 gr"`), damit die Anzeige nie durch
  Umrechnungs-Rundung driftet.
- Anzeige/Eingabe per User-Präferenz **pro Größenart** (mass, length, velocity,
  distance, temperature) — Europäer laden gemischt (Ladung in grains, OAL in mm).
- Umrechnung ausschließlich zentral in `src/lib/units.ts`. Konstanten:
  `1 gr = 64.79891 mg`, `1 in = 25.4 mm`, `1 fps = 0.3048 m/s`. Nie ad-hoc in
  Components rechnen, nie Floats für Anzeige formatieren ohne `units.ts`-Helper.

## Kern-Entitäten (Details + Spalten: docs/DATA_MODEL.md)
`profiles`, `firearms`, `components` (Katalog), `inventory_lots` (Bestand mit
Lot/Batch), `loads` (Laborierung, waffengebunden), `load_versions`,
`range_sessions`, `shot_strings` + `shots` (Chrono), `process_templates`,
`checklist_runs`. Alles user-scoped via RLS; Rollen über `user_roles`.

## Projekt-Docs (bei Feature-Arbeit zuerst lesen)
- `docs/MVP_SPEC.md` — Vision, Feature-Scope, Phasen, Safety-Texte
- `docs/DATA_MODEL.md` — Schema, Beziehungen, Einheiten-Konvention, RLS
- `docs/RANGE_FLOWS.md` — Schießstand-Screens, Offline-Write-Queue
- `docs/SETUP_CHECKLIST.md` — Bootstrap-Reihenfolge (Repo, Expo, Supabase, EAS)

## Architektur-Konventionen (strikt befolgen)
- Routen in `src/app/` (expo-router); Route-Groups `(auth)` / `(app)` / `(tabs)`
- **Datenschicht** in `src/lib/*.ts`: dünne async-Wrapper um `supabase.rpc(...)` bzw. Table-Queries; keine schwere State-Lib
- Wiederverwendbare UI in `src/components/`
- **Reads cache-first** (sonst flackert die UI offline); Writes optimistisch
- Teilen zwei Komponenten auf einem Screen dieselben Daten: **Query in den Screen hochziehen** und per Props verteilen — zwei `useCachedQuery`-Instanzen synchronisieren sich nicht
- Nach jeder Code-Änderung: `npx tsc --noEmit` + `npx expo lint` **grün** halten

## Offline-/Fehler-Standards (von Tag 1)
- `useIsOnline`-Hook (NetInfo-Listener) + globales `OfflineBanner` im (app)-Layout
- `ErrorState`-Komponente (Varianten offline/failed + Retry) statt irreführender Leer-Zustände, wenn `data == null`
- Auth: Netzwerkfehler (`/network|fetch/i` auf der Message) von „falsche Zugangsdaten" unterscheiden
- Aktionen, die den Browser öffnen: bei offline ein Alert statt totem Tab
- Fehler-Alerts offline-bewusst (`showErrorAlert`-Helper)
- Range-Log-Writes laufen **immer** über die Write-Queue (auch online) — ein Codepfad, kein Fork online/offline

## Backend-Regeln (Supabase)
- Jede SECURITY-DEFINER-Funktion: `set search_path = ''` (Anti-Search-Path-Injection) + voll qualifizierte Namen (`public.x`, `auth.x`)
- RLS-Policies: `(select auth.uid())` statt `auth.uid()` (Performance auf Skalierung)
- Jede Tabelle **RLS an**; Admin-/sensible Aktionen über SECURITY-DEFINER-RPC mit Rollen-Gate
- **RBAC von Anfang an:** Enum `app_role` + Tabelle `user_roles` + Helper `has_role(app_role)`; kein `is_admin`-Boolean auf der User-Tabelle
- Neue RPCs: `revoke execute on function … from public, anon; grant execute … to authenticated;`
- Helper (`is_…`) in ein eigenes **`private`-Schema**
- Migrationen **additiv** auf einer Live-DB, nummeriert in `supabase/migrations/`; nie bestehende Tabellen/Policies brechen; nach Schema-Änderung DB-Typen regenerieren
- Views mit Nutzerdaten: `security_invoker = on` (sonst Cross-User-Leaks)
- Client-generierte UUIDs (`gen_random_uuid()` clientseitig via `expo-crypto`/`uuid`) für Offline-Writes → Sync ist idempotent (`insert … on conflict do nothing` bzw. Upsert)

## Harte Regeln
- Nur der **publishable** Supabase-Key im Client; **NIE** der Service-Role-Key
- Secrets in `.env`; nur `EXPO_PUBLIC_*` ist client-safe. `.gitignore`: Service-Keys, `google-services.json`, `credentials/`, `.env`, Sentry-Auth-Token
- **DB-Migrationen** nur nach expliziter Zustimmung
- **Builds (EAS)** nur auf explizites Kommando
- Passwörter/Keys nie in Klartext im Chat verarbeiten; Werte setzt der Besitzer selbst (Dashboard/`.env`), Übernahme in EAS per Shell direkt aus `.env`
- Domänen-Sicherheitsregeln (oben) haben Vorrang vor jedem Feature-Wunsch

## EAS-/Store-Setup (Lessons Learned — vor dem ersten Build erledigen)
1. **Git-Repo initialisieren** — EAS verweigert Builds ohne Git
2. **`.env` wird NICHT mit hochgeladen:** alle `EXPO_PUBLIC_*`-Werte als **EAS-Env-Variablen** (environment production) anlegen, sonst baut EAS eine App ohne Backend-Config
3. **Sentry:** entweder komplett konfigurieren (`EXPO_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` als plaintext + `SENTRY_AUTH_TOKEN` als **Secret** auf EAS) — oder bis dahin `SENTRY_DISABLE_AUTO_UPLOAD=true` setzen; sonst **scheitert der Build** am Source-Map-Upload
4. **`ITSAppUsesNonExemptEncryption: false`** in `app.json → ios.infoPlist` (nur Standard-HTTPS) — erspart die Export-Compliance-Frage pro Build
5. `eas.json`: `appVersionSource: remote` + `autoIncrement`; Android-Submit-Track anfangs **`internal`** (Testphase ohne Review), erst zum Release auf production
6. **Play-Tester nie per APK versorgen** — Internal-Track ist account-gebunden (Tester-Liste + Opt-in-Link, Installation über den Store)
7. iOS-Submit über App Store Connect API-Key (via `eas credentials` gemanagt); Android: bei bestehender App den **vorhandenen Upload-Keystore importieren**, nie neu generieren
8. Store-Screenshots 6,9″: iPhone-16-Pro-Max-Simulator = exakt 1320×2868
9. **Store-Listing (On-Target-spezifisch):** App als *Dokumentations-/Logbuch-Tool* für ein legales Hobby beschreiben. Keine Screenshots mit konkreten Ladedaten; Demo-Screens nutzen `XX.X gr`-Platzhalter. Kein Wording, das Verkauf/Vermittlung von Komponenten suggeriert.

## Fallstricke (aus Erfahrung)
- **SDK pinnen**: Expo Go in den Stores hinkt teils hinterher → bewusst upgraden, nicht automatisch
- **SVGR-Transformer kann keine `<style>`-Blöcke** (Illustrator-Exporte!) → Klassen zu `fill`-Attributen inlinen, sonst rendert das SVG schwarz
- **Custom-Scheme-Deep-Links** (`app://…`) in E-Mails sind in Webmail unklickbar → 6-stelliger OTP-Code oder Universal-/App-Links
- Neue native Module erfordern einen **EAS-Rebuild** (Expo Go reicht nicht für Produktion)
- Verifizierungen/Nudges nicht-blockierend halten; Reads mit Default-State bei leerem Cache → immer `onStale` + `isOnline`-Guard

## Später: Website / Webplattform (wenn es so weit ist)
- **Next.js App Router** (`cacheComponents: true`), TypeScript strict, Tailwind + shadcn/ui, `@supabase/ssr`; gleiches Supabase-Projekt
- Vercel; **Functions-Region an die DB-Region anpassen** (`vercel.json → regions`, z. B. `dub1` bei eu-west-1)
- **`NEXT_PUBLIC_SITE_URL` sofort setzen** — ohne sie fällt Code auf `VERCEL_URL` zurück (deployment-spezifische, durch Vercel-SSO geschützte URL; Redirects z. B. nach Zahlungen landen sonst auf dem Vercel-Login)
- Backoffice unter `/admin`: Layout prüft `user_roles`; Mutationen als **Server Actions**, die die gated RPCs wrappen; pro Detailseite eine Bundle-RPC (1 Roundtrip statt 5); Edit/Neu als Side-Drawer statt Seitenwechsel
- Bilder **immer via `next/image`** (`images.remotePatterns` + AVIF/WebP in `next.config`); LCP-Bild mit `priority`; verstecktes `<img>` mit `display:none` wird trotzdem geladen → konditionale CSS-Backgrounds
- App ↔ Web-Identität ohne Shared Secret: App öffnet Web-URLs mit `?token=<supabase_access_token>`, Web verifiziert server-side via `auth.getUser(token)` (Token → httpOnly-Cookie)
- Zahlungen (falls nötig): Mollie-Muster — Checkout server-side, Webhook als Edge Function (`verify_jwt=false`, Status **bei Mollie nachschlagen**, Body nie vertrauen), `set_user_plan`-RPC **nur für `service_role`**, tägliche `pg_cron`-Sweep für abgelaufene Pläne
- Shop-/Affiliate-/Verfügbarkeits-Features (Monetarisierung) leben **ausschließlich hier**, nie in der App

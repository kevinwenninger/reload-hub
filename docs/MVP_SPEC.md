# On-Target — MVP-Spezifikation

## Vision
On-Target ist der Hub für Wiederlader: Laborierungen entwickeln, dokumentieren
und verbessern; Komponenten und Kosten im Griff behalten; den eigenen
Wiederlade-Prozess als Checkliste leben; später Wissen mit der Community teilen.
Zielgruppe: Einsteiger (geführter Prozess, Erklärungen) bis Wettkampfschützen
(Load Development, Chrono-Statistik, Lot-Tracking).

UI-Sprache: Englisch. Einheiten gemischt konfigurierbar (siehe DATA_MODEL).

## Leitprinzipien
1. **Dokumentieren, nie empfehlen.** Die App speichert, was der User lädt.
   Sie schlägt niemals Ladungen vor und validiert keine Sicherheit.
2. **Offline-first am Schießstand.** Range-Log funktioniert ohne Empfang.
3. **Wenig Tipperei mobil.** Stepper, Voreinstellungen aus der letzten Session,
   dicke Touch-Targets (Handschuhe, Kälte, eine Hand belegt).
4. **Store-sicher.** Keine Kauf-/Shop-Features in der App (Apple/Google-Policy).

## Safety (verbindliche Texte)

`LoadDataDisclaimer` (überall wo Ladedaten sichtbar sind, kompakt):
> **Warning:** Load data shown here is user-recorded, not laboratory tested.
> Always verify against current published data from powder and bullet
> manufacturers. Start at least 10% below published maximum loads and work up
> carefully. You are solely responsible for the ammunition you assemble.

Onboarding-Screen (einmalig bestätigen, Zeitpunkt in `profiles` speichern):
> On-Target is a record-keeping tool for handloaders. It does not provide,
> verify, or endorse load data. Reloading ammunition is inherently dangerous
> if done incorrectly. Always follow published reloading manuals and
> manufacturer instructions. By continuing you confirm that you reload at
> your own risk and in compliance with the laws of your jurisdiction.

Regeln:
- Demo-/Seed-/Screenshot-Daten enthalten nie reale Ladungen (`XX.X gr` oder
  `DEMO — not a real load`).
- Keine publizierten Ladedaten-Tabellen einbetten; nur Links auf offizielle
  Herstellerseiten (z. B. "Check published data" → Link-Liste, konfiguriert
  in `src/lib/loaddataSources.ts`).

## Phasen

### Phase 0 — Setup
Siehe `docs/SETUP_CHECKLIST.md`. Ergebnis: lauffähiges Expo-Grundgerüst mit
Auth-Flow-Skeleton, Supabase verbunden, CI-Basics (tsc + lint), Migration 001.

### Phase 1 — Foundation
- **Auth**: E-Mail/Passwort (Supabase Auth), Session-Persistenz, Passwort-Reset.
- **Profil & Einheiten**: Präferenz pro Größenart (mass: gr/g, length: mm/in,
  velocity: m/s / fps, distance: m/yd, temperature: °C/°F). Default beim
  Onboarding wählbar (Preset "Metric mixed" = gr + mm + m/s, Preset "US" =
  gr + in + fps, Preset "Metric" = g + mm + m/s).
- **Waffen** (`firearms`): Name, Typ (rifle/pistol/revolver), Kaliber,
  optional Lauf-Schusszähler (manuell + automatisch aus Range-Sessions).
- **Komponenten-Katalog** (`components`, user-scoped im MVP): Typen bullet /
  powder / primer / case mit typ-spezifischen Attributen. Anlegen über
  Formular; Herstellernummer optional als spätere Dedupe-Basis.
- **Inventar** (`inventory_lots`): Bestand je Komponente mit Lot-Nummer,
  Kaufdatum, Preis, Menge, Restmenge, Bezugsquelle (Freitext). Restmenge
  sinkt automatisch durch Checklist-Runs/Loads (Phase 2/4) oder manuell.
- Low-Stock-Hinweis (rein lokal berechnet, kein Push im MVP).

### Phase 2 — Laborierungen
- **Load** (waffengebunden): Name, Kaliber, Status (development/proven/retired).
- **Load-Version**: Komponenten-Referenzen (bullet/powder/primer/case, jeweils
  optional mit konkretem `inventory_lot`), Ladung, COAL und/oder CBTO,
  Crimp-Art (none/roll/taper), Notizen, Changelog-Text ("+0.2 gr vs v3").
  Versionen sind unveränderlich nach Abschluss — Änderungen = neue Version.
- **Kosten pro Schuss**: automatisch aus Lot-Preisen der referenzierten
  Komponenten; Hülsenkosten über erwartete Feuerungen amortisiert
  (User-Einstellung, Default 10).
- Vergleichsansicht: zwei Versionen nebeneinander (Diff der Parameter +
  Range-Ergebnisse, sobald Phase 3 existiert).

### Phase 3 — Range-Log
Details: `docs/RANGE_FLOWS.md`.
- **Session**: Datum, Ort (Freitext), Waffe, Load-Version, Wetter (Temp,
  Wind Freitext), Distanz.
- **Shot-Strings**: einzelne V0-Werte (Chrono, manuelle Eingabe), berechnet
  avg / ES / SD. Mehrere Strings pro Session (Ladder!).
- **Gruppen**: Gruppengröße bei Distanz, optional Foto der Scheibe
  (Supabase Storage, Upload erst bei Sync).
- **Bewertung**: 1–5 Sterne + "Lessons learned"-Freitext + strukturierte
  Flags (pressure signs: heavy bolt lift / flattened primer / ejector mark /
  case head expansion — reine Beobachtungs-Checkboxen, keine Bewertung durch
  die App).
- **Offline-Write-Queue**: alle Session-Writes laufen über die Queue.
- Schusszähler der Waffe erhöht sich um `rounds_fired`.

### Phase 4 — Prozesse & Checklisten
- **Prozess-Templates**: geordnete Schritte (Titel, Beschreibung EN,
  optional-Flag). System-Templates als Startpunkt:
  "Bottleneck rifle (full-length sizing)", "Straight-wall pistol (3-die,
  taper crimp)", "Straight-wall revolver (3-die, roll crimp)".
  Inhaltlich orientiert an den generischen Herstellerabläufen (clean/inspect →
  lube → size/decap → trim/chamfer/debur → prime → charge → seat → crimp →
  final inspect + record) — **ohne** matrizenspezifische Einstellwerte.
- **Individualisierung**: Template kopieren, Schritte umsortieren, löschen,
  zusammenfassen, eigene hinzufügen. (Kern-Use-Case des Gründers.)
- **Checklist-Run**: Template + Load-Version + Batch-Größe → Schritte abhaken
  mit Timestamp; Abschluss bucht Komponenten von den referenzierten Lots ab
  (Batch-Größe × 1 je Komponente; Pulver: Batch × Ladung) und erzeugt einen
  Log-Eintrag ("150 rds 9mm, Load X v2, 2026-08-14").
- **Einsteiger-Guide**: statische Content-Screens (EN) je Prozessschritt mit
  "Warum"-Erklärung. Content in `src/content/guide/*.ts`, kein CMS im MVP.

### Phase 5 — Später (nicht jetzt bauen, nur nicht verbauen)
- Community: geteilte Laborierungen (öffentlich lesbar erst nach Warnhinweis-
  Bestätigung; Ladungswert standardmäßig ausgeblendet), Profile, Suche.
  Voraussetzung: kuratierter globaler Komponenten-Katalog mit Dedupe.
- Globaler Komponenten-Katalog (Moderation via `user_roles`-Rolle `moderator`).
- Webplattform (Next.js, gleiches Supabase-Projekt) inkl. Monetarisierung
  (Freemium, Shop-/Verfügbarkeits-Features NUR web).
- Chrono-Import (Garmin Xero CSV), Ballistik-Integrationen — explizit out of
  scope für MVP.

## Nicht-Ziele MVP
- Keine Ladedaten-Datenbank, kein Ballistikrechner, keine Ladungs-Empfehlungen.
- Kein Shop, keine Preise Dritter, keine Affiliate-Links (App nie, Web später).
- Kein Social/Sharing.
- Kein Multi-Language (i18n-Struktur ja, Übersetzungen nein).

## Erfolgs-Kriterium MVP
Der Gründer kann seine reale Ausrüstung (Tikka T3x .308, Walther PDP 9mm,
Colt Python .357/.38) und seinen realen Bestand vollständig abbilden, eine
.308-Laborierung über 3 Versionen entwickeln, jede Range-Session offline am
Stand erfassen und seinen individuellen Prozess als Checkliste durchlaufen —
ohne Excel daneben.

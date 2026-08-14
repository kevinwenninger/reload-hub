# On-Target — Datenmodell

Konventionen: Postgres (Supabase). Alle Tabellen `id uuid pk default
gen_random_uuid()`, `created_at timestamptz default now()`, `updated_at`
via Trigger. User-Tabellen: `user_id uuid not null references auth.users`.
RLS auf jeder Tabelle; Owner-Policies mit `(select auth.uid()) = user_id`.
UUIDs dürfen clientseitig erzeugt werden (Offline-Sync, idempotente Upserts).

## Einheiten-Konvention (gilt für alle Mess-Spalten)
- Kanonisch: Masse `_mg numeric`, Länge `_mm numeric`, Geschwindigkeit
  `_mps numeric`, Distanz `_m numeric`, Temperatur `_c numeric`.
- Jede Mess-Spalte hat eine Schwester-Spalte `_input text` mit dem Rohwert
  inkl. Einheit, wie eingegeben (z. B. `"42.5 gr"`). Anzeige nutzt bevorzugt
  `_input`, Berechnungen nutzen kanonisch.
- Umrechnung nur in `src/lib/units.ts` (1 gr = 64.79891 mg; 1 in = 25.4 mm;
  1 fps = 0.3048 m/s).

## Entitäten

### profiles
1:1 zu auth.users (Trigger bei Signup).
- `display_name text`
- `unit_prefs jsonb` — `{ mass: 'gr'|'g', length: 'mm'|'in', velocity:
  'mps'|'fps', distance: 'm'|'yd', temperature: 'c'|'f' }`
- `case_amortization_firings int default 10` — für Kosten/Schuss
- `safety_ack_at timestamptz` — Onboarding-Disclaimer bestätigt

### user_roles
- `user_id`, `role app_role` (enum: `user`, `moderator`, `admin`)
- Helper `private.has_role(app_role)`; kein is_admin-Boolean.

### firearms
- `name text` (z. B. "Tikka T3x Tact A1")
- `type text check in ('rifle','pistol','revolver')`
- `caliber text` — Freitext-Kaliberbezeichnung, aber normalisiert über
  Auswahlliste in der App (`src/lib/calibers.ts`), damit Loads filterbar sind
- `secondary_calibers text[]` — z. B. Python: ['.38 Special'] zusätzlich zu
  '.357 Magnum'
- `barrel_round_count int default 0` — Schusszähler (Range-Sessions addieren)
- `notes text`

### components  (MVP: user-scoped; Phase 5: globaler Katalog)
- `user_id` (MVP), `type text check in ('bullet','powder','primer','case')`
- `manufacturer text`, `name text`, `mpn text` (Herstellernummer, z. B.
  Sierra "2275" — spätere Dedupe-Basis)
- `attrs jsonb` — typ-spezifisch:
  - bullet: `{ caliber, weight_mg, weight_input, diameter_mm, diameter_input,
    bullet_type }` (bullet_type: fmj/hp/hpbt/sp/cast/plated/…)
  - powder: `{ burn_class? }` (rein informativ, Freitext)
  - primer: `{ size }` (small_pistol/large_pistol/small_rifle/large_rifle/
    + _magnum-Varianten)
  - case: `{ caliber }`
- Entschieden (2026-08-14): `attrs jsonb` + Validierungs-Trigger; Migration zu
  Subtypen bleibt möglich.

### inventory_lots
- `component_id → components`
- `lot_number text`, `purchase_date date`, `source text` (Shop, Freitext)
- `price_total numeric`, `currency text default 'EUR'`
- `qty_initial numeric`, `qty_remaining numeric`
  — Stück für bullet/primer/case; **Gramm** für Pulver (`unit text check in
  ('pieces','g')` zur Klarheit)
- `firings_count int` — nur für case-Lots: Anzahl Feuerungen des Lots
  (Vereinfachung: Lifecycle pro Lot, nicht pro Einzelhülse; bewusst so)
- `trimmed_to_mm numeric` + `trimmed_to_input text` — letzte Trimmlänge (case)
- `archived boolean default false` (aufgebraucht/aussortiert)

### loads
- `firearm_id → firearms`, `caliber text`, `name text`
- `status text check in ('development','proven','retired')`

### load_versions
Unveränderlich nach `finalized_at` (Update dann via RLS/Trigger geblockt;
Änderung = neue Version).
- `load_id → loads`, `version_no int` (unique je load)
- `bullet_component_id → components`, `bullet_lot_id → inventory_lots null`
- `powder_component_id`, `powder_lot_id null`
- `primer_component_id`, `primer_lot_id null`
- `case_component_id`, `case_lot_id null`
- `charge_mg numeric`, `charge_input text`
- `coal_mm numeric null`, `coal_input text null`
- `cbto_mm numeric null`, `cbto_input text null`
- `crimp text check in ('none','roll','taper')`
- `neck_bushing_mm numeric null`, `neck_bushing_input text null`
  (Bushing-Dies wie MatchMaster), `shoulder_bump_mm numeric null` + `_input`
- `changelog text` ("+0.2 gr, seated 0.005\" deeper"), `notes text`
- `finalized_at timestamptz null`
- Hinweis App-Schicht: beim Anzeigen von `charge_*` immer LoadDataDisclaimer.
- Plausibilitäts-Trigger NUR als Tippfehler-Schutz (z. B. charge_mg > 0 und
  charge_mg < bullet weight) — niemals als Sicherheits-Validierung framen.

### range_sessions
- `firearm_id`, `load_version_id null` (Fabrikmunition = null + `ammo_note`)
- `date date`, `location text`, `distance_m numeric` + `_input`
- `temperature_c numeric null` + `_input`, `wind text`, `weather_notes text`
- `rounds_fired int`
- `group_size_mm numeric null` + `_input` (beste/typische Gruppe; mehrere
  Gruppen → shot_strings.notes oder Fotos)
- `rating smallint check between 1 and 5`
- `lessons_learned text`
- `pressure_flags text[]` — Beobachtungen: 'heavy_bolt_lift',
  'flattened_primer','ejector_mark','case_head_expansion','sticky_extraction'
- `photos text[]` — Storage-Pfade (Bucket `targets`, owner-scoped Policies)
- `synced`-Konzept: existiert nur clientseitig in der Write-Queue, nicht in DB

### shot_strings / shots
- `shot_strings`: `session_id`, `label text` ("String 1 — XX.X gr"), `notes`
- `shots`: `string_id`, `seq int`, `velocity_mps numeric`, `velocity_input text`
- avg/ES/SD werden **berechnet** (View `shot_string_stats`,
  `security_invoker = on`), nicht gespeichert.

### process_templates
- `user_id null` — null = System-Template (read-only via RLS, Pflege über
  Moderator-RPC)
- `name text`, `description text`
- `steps jsonb` — Array: `{ id, title, description, optional bool }`,
  Reihenfolge = Array-Reihenfolge
- `forked_from uuid null` — Herkunft bei kopierten Templates

### checklist_runs
- `template_id`, `template_snapshot jsonb` — Kopie der Steps zum Startzeitpunkt
  (Template darf sich später ändern, Run bleibt konsistent)
- `load_version_id`, `batch_size int`
- `steps_state jsonb` — `{ [stepId]: { done_at: timestamptz | null } }`
- `started_at`, `completed_at null`
- Abschluss-RPC `complete_checklist_run`: setzt completed_at, bucht Lots ab
  (bullet/primer/case: −batch_size; powder: −batch_size × charge; alles in
  einer Transaktion), legt optional `loaded_batches`-Eintrag an.

### loaded_batches (Munitionsbestand)
- `load_version_id`, `checklist_run_id null`, `qty int`, `qty_remaining int`
- `date`, `notes` — Range-Sessions können hiervon abbuchen (entschieden
  2026-08-14: im MVP dabei)

## Beziehungs-Überblick
```
auth.users ─ profiles / user_roles
firearms ──< loads ──< load_versions >── components (×4) / inventory_lots (×4)
load_versions ──< range_sessions ──< shot_strings ──< shots
components ──< inventory_lots
process_templates ──< checklist_runs >── load_versions
checklist_runs ──< loaded_batches >── load_versions
```

## RLS-Kurzfassung
- Alle User-Tabellen: select/insert/update/delete nur Owner.
- `process_templates` mit `user_id is null`: select für alle authenticated,
  Mutation nur via Moderator-RPC.
- `load_versions` nach finalized: update/delete geblockt (Trigger).
- Storage-Bucket `targets`: Pfad-Konvention `{user_id}/…`, Policies darauf.
- Views mit Nutzerdaten: `security_invoker = on`.

## Migrationsplan
- `001_foundation`: enums, profiles (+Signup-Trigger), user_roles, private-
  Schema + has_role, firearms, components, inventory_lots
- `002_loads`: loads, load_versions (+Finalize-Trigger, Plausibilitäts-Trigger)
- `003_range`: range_sessions, shot_strings, shots, shot_string_stats-View,
  Storage-Bucket + Policies, Schusszähler-Trigger
- `004_process`: process_templates (+ Seed der 3 System-Templates — Schritte
  OHNE Ladedaten/Einstellwerte), checklist_runs, loaded_batches,
  complete_checklist_run-RPC
Jede Migration einzeln freigeben lassen; danach DB-Typen regenerieren.

## Entscheidungen (geklärt mit Besitzer, 2026-08-14)
1. components: **jsonb-attrs** + Validierungs-Trigger (Migration zu Subtypen
   bleibt möglich)
2. loaded_batches im MVP: **ja** (klein, Migration 004)
3. Währung: **Spalte pro Lot vorhanden, UI fix EUR** im MVP
4. Hülsen-Lifecycle: **pro Lot** (firings_count auf inventory_lots)

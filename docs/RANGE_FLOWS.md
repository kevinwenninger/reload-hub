# On-Target — Range-Flows (Schießstand)

Kontext: Am Stand ist der Empfang oft null, es ist kalt, laut, eine Hand ist
belegt, Handschuhe sind möglich. Daraus folgen die Design-Regeln:

## Design-Regeln (verbindlich für alle Range-Screens)
1. **Offline ist der Normalfall.** Kein Screen darf bei fehlendem Netz
   blockieren, kein Spinner wartet auf einen Server.
2. **Stepper statt Freitext**, wo immer Zahlen erfasst werden (Distanz,
   Schusszahl, Rating). Velocity: großes Numpad, Komma-frei in der
   bevorzugten Einheit, Enter = nächster Schuss.
3. **Touch-Targets ≥ 48dp**, primäre Aktionen im Daumenbereich unten.
4. **Voreinstellungen aus der letzten Session** (Waffe, Load, Distanz, Ort) —
   der häufigste Fall ist "wie letztes Mal, neue Ladung".
5. Fotos werden lokal gespeichert und **erst beim Sync** hochgeladen.
6. Keine Datenverluste: App-Kill/Crash mitten in der Session darf maximal den
   letzten unbestätigten Eingabewert kosten (Queue-Persistenz nach jedem Write).

## Offline-Write-Queue (technisches Konzept)
- Ein Codepfad für online UND offline: Range-Writes gehen **immer** in die
  Queue (`src/lib/writeQueue.ts`), ein Flush-Worker synct bei Konnektivität.
- Queue-Eintrag: `{ id (uuid), table | rpc, payload, createdAt, attempts }`,
  persistiert in AsyncStorage unter einem Key, atomar geschrieben.
- Alle IDs werden **clientseitig als UUID erzeugt** → Server-Writes sind
  idempotente Upserts (`on conflict (id) do update/nothing`). Doppelter Flush
  ist damit harmlos.
- Flush-Reihenfolge = FIFO (Parent vor Child: session → strings → shots).
- Fehlerklassen: Netzwerkfehler → retry mit Backoff, bleibt in Queue.
  4xx/RLS-Fehler → Eintrag in „failed"-Liste + sichtbarer Hinweis im Sync-
  Status-Screen (nicht stumm verwerfen).
- Fotos: Datei in `FileSystem.documentDirectory/pending-uploads/{uuid}.jpg`,
  Queue-Eintrag referenziert den lokalen Pfad; Upload in Storage-Bucket
  `targets/{user_id}/…`, danach Pfad in `range_sessions.photos` patchen und
  lokale Datei löschen.
- UI: kleines Sync-Badge im Header ("3 pending"); Detail-Screen mit
  Retry/Verwerfen für failed Items.
- Konflikte sind praktisch ausgeschlossen (single-user-Daten, append-only
  Sessions); last-write-wins reicht.

## Screens

### R1 — Session starten
- Karte "Repeat last setup" (Waffe + Load-Version + Ort + Distanz der letzten
  Session, ein Tap) prominent oben.
- Sonst: Waffe wählen (Liste, zuletzt benutzt zuerst) → Load-Version wählen
  (gefiltert auf Kaliber der Waffe; "Factory ammo"-Option mit Freitext) →
  Distanz (Stepper: 25/50/100/300 m Presets + frei) → Ort (Freitext,
  Autocomplete aus früheren Orten) → Start.
- Optional aufklappbar: Temperatur (Stepper), Wind (Freitext).

### R2 — Session-Hub (während der Session)
- Kopf: Waffe, Load v#, Distanz, Sync-Badge.
- Große Buttons: **[+ Shot string]**, **[+ Group]**, **[+ Photo]**,
  Schusszähler (+1 / +5 / +10 Stepper für rounds_fired).
- Ladungsanzeige der Load-Version inkl. LoadDataDisclaimer (kompakt).

### R3 — Shot-String-Eingabe (der wichtigste Screen)
- Label vorbelegt ("String 2"), editierbar.
- Numpad-Eingabe: Wert tippen → Enter → erscheint in Liste, Cursor bleibt im
  Feld. Tippfehler: Wert in Liste antippen → korrigieren/löschen.
- Live-Statistik über der Liste: n, avg, ES, SD — in der bevorzugten Einheit.
- Warnung (nicht blockierend) bei Ausreißer > ±10% vom laufenden Mittel:
  "Check value?" (Tippfehler-Schutz, keine Bewertung).
- Fertig → String gespeichert (Queue), zurück zum Hub.

### R4 — Gruppe erfassen
- Gruppengröße: Numpad in bevorzugter Längeneinheit (mm oder in, kein
  MOA-Rechner im MVP).
- Optional direkt Foto der Scheibe (Kamera), wird der Session zugeordnet.

### R5 — Session abschließen
- Rating 1–5 (große Sterne).
- Pressure-Observations als Checkbox-Liste (heavy bolt lift, flattened
  primer, ejector mark, sticky extraction, case head expansion) — neutral
  formuliert als Beobachtungen.
- "Lessons learned" Freitext (Spracheingabe des OS reicht, kein eigenes
  Audio-Feature).
- Abschluss: Zusammenfassung, Schusszähler-Update der Waffe, alles in Queue.

### R6 — Sync-Status
- Liste pending/failed Writes, Retry-Button, "letzter Sync"-Timestamp.
- Erreichbar über das Sync-Badge; sonst unsichtbar im Alltag.

## Akzeptanztests (Phase 3 gilt als fertig, wenn:)
1. Flugmodus an → komplette Session inkl. 2 Strings à 10 Schuss, 1 Foto,
   Rating erfassen → App killen → App öffnen → nichts verloren, alles pending.
2. Flugmodus aus → Auto-Sync ohne Nutzeraktion; Foto liegt im Storage,
   Session in DB, Queue leer, Schusszähler der Waffe korrekt erhöht.
3. Doppelter Flush (Simulation) erzeugt keine Duplikate.
4. RLS-Fehler (Simulation) landet sichtbar in failed, App bleibt bedienbar.
5. String-Statistik stimmt gegen Handrechnung (Testfall mit fixen Werten).

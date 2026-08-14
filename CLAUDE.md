# On-Target — Claude Code Einstieg

@AGENTS.md

## Projektstatus
- [ ] Phase 0 — Setup (Repo, Expo, Supabase, Grundgerüst) → `docs/SETUP_CHECKLIST.md`
- [ ] Phase 1 — Foundation (Auth, Profil/Einheiten, Waffen, Komponenten + Inventar)
- [ ] Phase 2 — Laborierungen (Loads + Versionen, Kostenrechnung)
- [ ] Phase 3 — Range-Log (Sessions, Chrono, Offline-Write-Queue, Fotos)
- [ ] Phase 4 — Prozesse & Checklisten
- [ ] Phase 5 — Community & Web (separat spezifizieren, nicht jetzt)

Beim Abschluss einer Phase: Checkbox hier abhaken (Teil des Abschluss-Commits).

## Arbeitsweise
1. Vor Feature-Arbeit die zugehörige Spec in `docs/` lesen (Verweise in AGENTS.md).
2. Eine Phase = ein Arbeitsblock. Innerhalb der Phase kleine, committbare Schritte.
3. Migrationen immer erst als Entwurf zeigen und **explizite Freigabe abwarten**.
4. Alles, was der Besitzer manuell tun muss (Repo auf GitHub anlegen, Supabase-
   Projekt erstellen, Keys in `.env` eintragen, EAS-Konto), als klare, nummerierte
   Anweisung ausgeben und warten — nicht simulieren, keine Platzhalter-Keys committen.
5. Nach jeder Code-Änderung: `npx tsc --noEmit` + `npx expo lint` grün.
6. Domänen-Sicherheitsregeln aus AGENTS.md gelten immer — insbesondere:
   **niemals konkrete Ladedaten erzeugen**, auch nicht in Tests/Seeds/Screenshots.

## Erste Session
Starte mit `docs/SETUP_CHECKLIST.md` Schritt 1 und arbeite die Liste ab.
Danach `docs/DATA_MODEL.md` reviewen, offene Entscheidungen (dort markiert mit
⚠️ ENTSCHEIDUNG) mit dem Besitzer klären, dann Migration 001 entwerfen.

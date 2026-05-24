# Hertha Auswärtsfahrten Planer — Claude Code Kontext

Web-App für eine kleine Gruppe Hertha-BSC-Fans (3–6 Leute) zum gemeinsamen Planen von Auswärtsfahrten. Ersetzt die bisherige Organisation über Discord.

---

## Tech Stack

| Bereich | Technologie |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| Backend / DB | Supabase (Postgres + RLS) |
| Auth | Supabase Auth (Email + Passwort) |
| Routenberechnung | Google Maps Directions API |
| Parkplatz | Google Maps Places API (New) |
| Rich Text | Tiptap v3 (Spieltagsberichte) |
| Tests | Vitest |
| Mobile | PWA (Progressive Web App) |
| Hosting | Noch nicht deployed |

---

## Lokaler Start

```bash
npm install
npm run dev        # startet auf Port 5173 (kill vorher automatisch)
npm test           # Vitest unit tests
npm run build      # TypeScript-Check + Vite build
```

---

## Umgebungsvariablen (.env)

```
VITE_SUPABASE_URL=https://rjvffwjkdnbqevrkycem.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
VITE_GOOGLE_MAPS_API_KEY=<Google Maps API Key>
```

**Supabase Projekt:** hertha-auswaertsfahrten (Region: Central Europe / Zurich)
**GitHub:** https://github.com/LVRCHIII/hertha-auswaertsfahrten
**Google Maps API Key:** Eingeschränkt auf `http://localhost:5173/*` — für Deployment muss finale URL ergänzt werden.

---

## Routen (App.tsx)

| Pfad | Seite |
|---|---|
| `/` | `HomePage` — Kalender + Fahrtübersicht |
| `/spieltag` | `SpieltagPage` — Spieltag-Dashboard (nächste Fahrt) |
| `/fahrten/neu` | `FahrtAnlegenPage` — Neue Fahrt anlegen |
| `/fahrten/:id` | `FahrtDashboardPage` — Fahrt-Details, Zeitplanung, Parkplatz etc. |
| `/profil` | `ProfilPage` — Anzeigename, Heimadresse |

---

## Milestone-Status

### ✅ Milestone 1 — Basis
- Supabase Auth: Registrierung + Login
- Kalenderübersicht mit allen Fahrten
- Fahrt anlegen (Formular)
- Hertha-Design (Dunkelblau `#003264`, Mittelblau `#005BAC`)

### ✅ Milestone 2 — Fahrt-Dashboard
- Route `/fahrten/:id` mit Spielinfo, Zeitplanung
- Abfahrtszeit = Anpfiff − Fahrtzeit − 1,5h Puffer (via Google Maps Directions API)

### ✅ Milestone 3 — Social Features
- Mitfahrerliste (anmelden/abmelden)
- Mitbringliste (freie Texteingabe)
- Profilseite (Anzeigename, Heimadresse für eigene Abfahrtszeit)

### ✅ Milestone 4 — Parkplatz
- Google Places API (New): Parkplätze in der Nähe des Stadions
- Distanz + Kostenhinweise aus Places
- Parkplatz als gewählt markieren → wird als Routenziel genutzt
- Manuelle Eingabe möglich

### ✅ Milestone 5–9 — diverses Polish
- Vereinswappen (MatchupWappen, VereinWappen, VereinAutocomplete)
- Fahrt löschen
- Hybrid-Kalenderansicht (Liste + Kalender)
- Mitfahrer-Avatar-Stack auf Übersichtskarten
- Abfahrtszeitabstimmung (15-Minuten-Slots, Voting, Toggle)
- PWA-Grundlage (Manifest, Service Worker)
- Vitest unit tests

### ✅ Milestone 10 — Auswärtsstatistiken
- `route_distance_meters` dauerhaft auf `fahrten` gespeichert
- `AwayStatsCard` zeigt Statistiken über alle Fahrten

### 🔄 Milestone 11 — Spieltagsberichte (IN ARBEIT, NICHT COMMITTED)
- Tiptap-Editor für Berichte nach einer Fahrt
- Tabelle `spieltagsberichte` (fahrt_id PK, author_id, content_json, content_text)
- Noch untracked: `BerichtEditor`, `BerichtToolbar`, `BerichtViewer`, `SpieltagsberichtSection`, `useSpieltagsbericht`, `berichtApi/Content/Extensions/Render/Storage`, `mapBerichtError`, `types/bericht`
- Migration: `supabase/migrations/20260522140000_milestone11_spieltagsberichte.sql`

---

## Datenbankmigrationen (Supabase)

| Datei | Inhalt |
|---|---|
| `20250515120000_create_fahrten.sql` | Basis-Tabelle fahrten |
| `20250516120000_milestone3_social.sql` | mitfahrer, mitbringliste, profiles |
| `20250516130000_profile_avatar_home.sql` | avatar_url, home_address auf profiles |
| `20250516140000_fix_social_profile_fkeys.sql` | FK-Fix profiles |
| `20250516150000_milestone4_parkplaetze.sql` | parkplaetze-Tabelle |
| `20250516160000_parkplaetze_distance_cost.sql` | distance_meters, cost_hint auf parkplaetze |
| `20250517120000_treffpunkt_bestaetigt.sql` | treffpunkt_bestaetigt auf fahrten |
| `20250517130000_abfahrt_abstimmungen.sql` | abfahrt_abstimmungen-Tabelle |
| `20260518104802_milestone10_auswaertsstatistik.sql` | route_distance_meters auf fahrten |
| `20260522140000_milestone11_spieltagsberichte.sql` | spieltagsberichte-Tabelle (noch nicht applied) |

---

## Code-Konventionen

- **Sprache:** Deutsch durchgehend (UI, Variablennamen, Commits)
- **Komponenten:** Named exports, PascalCase
- **Hooks:** `use`-Prefix, eigene Datei in `src/hooks/`
- **API-Layer:** `src/lib/` für Supabase-Calls und Berechnungen
- **Styling:** Tailwind utility classes, Mobile-First
- **Farben:** `hertha-blue` = `#003264`, `hertha-mid` = `#005BAC` (in Tailwind config definiert)
- **RLS:** Alle Tabellen haben Row Level Security aktiviert

---

## Nächster Schritt

Milestone 11 abschließen: Uncommittete Spieltagsbericht-Dateien testen, ggf. in `FahrtDashboardPage` einbinden, dann committen und Migration in Supabase anwenden.

# Hertha Auswärtsfahrten Planer

Umgesetzt sind die Kernplanung bis Milestone 24, Spieltagsberichte, Bewertungen, Futbology-Import, Fotogalerien und das „Matchday Editorial“-Redesign.

**Projektkontext für Cursor-Chats:** [`PROJEKT_KONTEXT.md`](./PROJEKT_KONTEXT.md)

## Voraussetzungen

- [Node.js](https://nodejs.org/) 20+ (inkl. `npm`)
- Ein [Supabase](https://supabase.com)-Projekt

## Supabase einrichten

1. Neues Projekt auf [supabase.com](https://supabase.com) anlegen.
2. **Authentication → Providers → Email**: E-Mail-Provider aktiv lassen.
3. **Project Settings → API**: `Project URL` und `anon` `public` key kopieren.
4. Optional für lokale Entwicklung: **Authentication → Email** → „Confirm email“ deaktivieren.

### Datenbank-Migration ausführen

Im Supabase Dashboard: **SQL Editor → New query** — Inhalt von  
`supabase/migrations/20250515120000_create_fahrten.sql` einfügen und **Run** klicken.

Damit wird die Tabelle `fahrten` mit Row-Level Security angelegt.

Für Milestone 3 zusätzlich im SQL Editor ausführen:  
`supabase/migrations/20250516120000_milestone3_social.sql`  
(Profile, Mitfahrer, Mitbringliste)

Danach: `20250516130000_profile_avatar_home.sql` (Profilbild, Zuhause-Adresse)  
und `20250516140000_fix_social_profile_fkeys.sql` (FK für Mitfahrer-Joins)

Für Milestone 4 zusätzlich:  
`supabase/migrations/20250516150000_milestone4_parkplaetze.sql` (Parkplätze pro Fahrt)

Für Milestone 10 zusätzlich:  
`supabase/migrations/20260518104802_milestone10_auswaertsstatistik.sql` (gespeicherte Routendistanz)

Für den OpenLigaDB-Spielplanimport zusätzlich:

`supabase/migrations/20260715150000_openliga_match_id.sql` (dauerhafte Match-ID und Dublettenschutz)

## App starten

```bash
cd "/Users/lucasbruhn/Documents/Programming Projects/hertha-auswaertsfahrten"
cp .env.example .env
```

**Wichtig:** Vite liest nur `.env`, nicht `.env.example`. In `.env` eintragen:

| Variable | Woher |
|----------|--------|
| `VITE_SUPABASE_URL` | Project Settings → API → **Project URL** (mit `https://`) |
| `VITE_SUPABASE_ANON_KEY` | Project Settings → API → **anon public** (kompletter JWT, ~200 Zeichen) |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Cloud Console → API-Key (siehe unten) |

Der Spielplan-Import lädt Bundesliga, 2. Bundesliga und DFB-Pokal keylos über OpenLigaDB.

Nach Änderungen an `.env` den Dev-Server **neu starten**.

### Google Maps API (Milestone 2)

1. [Google Cloud Console](https://console.cloud.google.com/) → neues Projekt oder bestehendes wählen.
2. APIs aktivieren: **Maps JavaScript API**, **Directions API** und **Places API (New)** (Parkplatz-Suche; die ältere „Places API“ reicht nicht).
3. **Credentials → API key** erstellen.
4. Key unter „Application restrictions“ auf **HTTP referrers** setzen (einmalig, Port ändert sich nicht mehr):
   - `http://localhost:5173/*`
   - `http://127.0.0.1:5173/*`  
   **Warum nicht ständig neue Ports?** Wenn 5173 belegt war, hat Vite früher 5174, 5177, … genommen — Google erlaubt keinen Port-Wildcard. `npm run dev` beendet deshalb zuerst alte Prozesse auf 5173 (`dev:stop`).  
   **Alternative für Dev:** zweiten API-Key nur mit API-Einschränkung (ohne HTTP-Referrer), Produktions-Key später mit Domain.
5. In `.env`: `VITE_GOOGLE_MAPS_API_KEY=...`

In Supabase unter **Authentication → URL Configuration** für lokale Entwicklung eintragen:

- Site URL: `http://localhost:5173`
- Redirect URLs: `http://localhost:5173/**`

```bash
npm install
npm run dev
```

Die App läuft unter http://localhost:5173

## Tests

```bash
npm test
```

Vitest deckt aktuell Kernlogik für Kalender, Spieltag-Modus, Abfahrtszeiten/Google-Maps-URLs, Parkplatz-Metadaten, Auswärtsstatistik, Vereinsauflösung und den OpenLigaDB-Import ab.

## Funktionen

| Feature | Route | Beschreibung |
|---------|-------|--------------|
| Login / Registrierung | `/login`, `/register` | E-Mail + Passwort (Supabase Auth) |
| Kalenderübersicht | `/` | Liste: kommende + vergangene Fahrten |
| Auswärtsstatistik | `/` | Persönliche Statistik, Gruppen-Kilometer, Ranking und längste Fahrt |
| Spieltag-Modus | `/spieltag` | Mobile Kurzansicht für nächste Fahrt, Ablauf und Schnelllinks |
| Fahrt anlegen | `/fahrten/neu` | Manuell oder per OpenLigaDB-Spielplanimport ohne zusätzlichen API-Key |
| Fahrt-Dashboard | `/fahrten/:id` | Spielinfo, Abfahrtszeit, Route, Mitfahrer, Mitbringliste, Parkplatz |
| Profil | `/profil` | Anzeigename, Profilbild, Abfahrt von Zuhause |
| PWA | `/` | Manifest, App-Icon und Service Worker für App-Shell/offline Fallback |

## Roadmap

- **Milestone 25:** Sortierbare Zwischenstopps und Reiseplan.
- **Milestone 26:** Strukturierte Stadioninfos.
- **Milestone 27:** Belastbarer PWA-Offline-Modus.
- **Milestone 28:** Manuell angelegte Fahrten vollständig absichern.
- **Milestone 29:** Aktivitätsverlauf pro Fahrt.

## Projektstruktur

- `supabase/migrations/` — SQL für die `fahrten`-Tabelle
- `src/hooks/useFahrten.ts` — Fahrten laden
- `src/lib/fahrtenApi.ts` — Fahrt speichern
- `src/lib/openligaFixtures.ts` — OpenLigaDB-Spielplan laden und importierbare Auswärtsspiele abbilden
- `src/pages/HomePage.tsx` — Kalenderübersicht
- `src/pages/SpieltagPage.tsx` — Spieltag-Modus für die nächste Fahrt
- `src/pages/FahrtAnlegenPage.tsx` — Formular
- `src/pages/FahrtDashboardPage.tsx` — Dashboard mit Zeitplanung
- `src/hooks/useRoutePlan.ts` — Google Directions

# Hertha Auswärtsfahrten Planer

Milestone 1–3: Auth, Fahrten verwalten, Dashboard mit Routenplanung, Mitfahrer & Mitbringliste.

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

Optional danach: `supabase/migrations/20250516130000_profile_avatar_home.sql`  
(Profilbild-Storage, Zuhause-Adresse)

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

Nach Änderungen an `.env` den Dev-Server **neu starten**.

### Google Maps API (Milestone 2)

1. [Google Cloud Console](https://console.cloud.google.com/) → neues Projekt oder bestehendes wählen.
2. APIs aktivieren: **Maps JavaScript API** und **Directions API**.
3. **Credentials → API key** erstellen.
4. Key unter „Application restrictions“ auf **HTTP referrers** setzen: `http://localhost:5173/*`
5. In `.env`: `VITE_GOOGLE_MAPS_API_KEY=...`

In Supabase unter **Authentication → URL Configuration** für lokale Entwicklung eintragen:

- Site URL: `http://localhost:5173`
- Redirect URLs: `http://localhost:5173/**`

```bash
npm install
npm run dev
```

Die App läuft unter http://localhost:5173

## Funktionen

| Feature | Route | Beschreibung |
|---------|-------|--------------|
| Login / Registrierung | `/login`, `/register` | E-Mail + Passwort (Supabase Auth) |
| Kalenderübersicht | `/` | Liste: kommende + vergangene Fahrten |
| Fahrt anlegen | `/fahrten/neu` | Gegner, Stadion, Datum, Anpfiff, Startpunkt, optional Notizen |
| Fahrt-Dashboard | `/fahrten/:id` | Spielinfo, Abfahrtszeit, Route, Mitfahrer, Mitbringliste |
| Profil | `/profil` | Anzeigename, Profilbild, Abfahrt von Zuhause |

## Projektstruktur

- `supabase/migrations/` — SQL für die `fahrten`-Tabelle
- `src/hooks/useFahrten.ts` — Fahrten laden
- `src/lib/fahrtenApi.ts` — Fahrt speichern
- `src/pages/HomePage.tsx` — Kalenderübersicht
- `src/pages/FahrtAnlegenPage.tsx` — Formular
- `src/pages/FahrtDashboardPage.tsx` — Dashboard mit Zeitplanung
- `src/hooks/useRoutePlan.ts` — Google Directions

# Hertha Auswärtsfahrten Planer

Milestone 1: Auth, Kalenderübersicht (Liste), Fahrt anlegen.

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

Nach Änderungen an `.env` den Dev-Server **neu starten**.

In Supabase unter **Authentication → URL Configuration** für lokale Entwicklung eintragen:

- Site URL: `http://localhost:5173`
- Redirect URLs: `http://localhost:5173/**`

```bash
npm install
npm run dev
```

Die App läuft unter http://localhost:5173

## Milestone 1 – Funktionen

| Feature | Route | Beschreibung |
|---------|-------|--------------|
| Login / Registrierung | `/login`, `/register` | E-Mail + Passwort (Supabase Auth) |
| Kalenderübersicht | `/` | Liste: kommende + vergangene Fahrten |
| Fahrt anlegen | `/fahrten/neu` | Gegner, Stadion, Datum, Anpfiff, Startpunkt, optional Notizen |

## Projektstruktur

- `supabase/migrations/` — SQL für die `fahrten`-Tabelle
- `src/hooks/useFahrten.ts` — Fahrten laden
- `src/lib/fahrtenApi.ts` — Fahrt speichern
- `src/pages/HomePage.tsx` — Kalenderübersicht
- `src/pages/FahrtAnlegenPage.tsx` — Formular

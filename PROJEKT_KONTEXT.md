# Hertha Auswärtsfahrten Planer — Projekt-Kontext

> **Ort:** `hertha-auswaertsfahrten/PROJEKT_KONTEXT.md` (im Repo, versioniert)
>
> **Neuer Cursor-Chat:** `@PROJEKT_KONTEXT.md` anhängen oder Inhalt als erstes einfügen.
>
> **Aktualisierung:** Nach größeren Features einfach fragen: *„Aktualisiere PROJEKT_KONTEXT“*

---

## Projektbeschreibung

Web-App für eine kleine Gruppe Hertha BSC Fans (3–6 Leute) aus Berlin: gemeinsame Auswärtsfahrten planen. Ersetzt Organisation über Discord — Kalender + Dashboard pro Fahrt.

**Kern-Features (Zielbild):**
- Kalenderübersicht aller Auswärtsfahrten
- Fahrt-Dashboard: Spielinfo, Zeitplanung, Route, Mitfahrer, Mitbringliste, Parkplatz
- Abfahrtszeit via Google Maps (Anpfiff − Fahrtzeit − Puffer)
- Persönliche Abfahrt von Zuhause zum Treffpunkt
- Login mit E-Mail + Passwort (Supabase)

---

## Tech Stack

| Bereich | Technologie |
|---|---|
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS |
| Backend / DB | Supabase (Postgres + RLS) |
| Auth | Supabase Auth |
| Routen | Google Maps JavaScript API + Directions API |
| Profilbilder | Supabase Storage (`avatars`) |
| Parkplatz | Google Places API |
| Mobile (geplant) | PWA |
| Hosting | noch nicht deployed |

---

## Wichtige Pfade

```
hertha-auswaertsfahrten/
├── PROJEKT_KONTEXT.md          ← diese Datei
├── src/
│   ├── pages/                  HomePage, FahrtDashboard, Profil, …
│   ├── components/             FahrtCard, MitfahrerSection, …
│   ├── hooks/                  useFahrten, useMitfahrer, useProfile, …
│   └── lib/                    socialApi, parkingApi, profilesApi, routeAddresses, …
├── supabase/migrations/        alle SQL-Migrationen (Reihenfolge beachten!)
├── public/wappen/              Vereinswappen 2. Bundesliga
└── README.md                   Setup-Anleitung
```

---

## Umgebungsvariablen (.env)

```
VITE_SUPABASE_URL=https://rjvffwjkdnbqevrkycem.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>
VITE_GOOGLE_MAPS_API_KEY=<Google Maps API Key>
```

**Supabase:** hertha-auswaertsfahrten · Region Zurich  
**GitHub:** https://github.com/LVRCHIII/hertha-auswaertsfahrten  
**Branch (Hauptentwicklung):** `cursor/milestone-1-auth-calendar-fahrten`

---

## Supabase-Migrationen (Reihenfolge)

| Datei | Inhalt |
|-------|--------|
| `20250515120000_create_fahrten.sql` | Tabelle `fahrten` |
| `20250516120000_milestone3_social.sql` | `profiles`, `mitfahrer`, `mitbringliste` |
| `20250516130000_profile_avatar_home.sql` | `avatar_url`, `home_address`, Storage `avatars` |
| `20250516140000_fix_social_profile_fkeys.sql` | FK `user_id` → `profiles` (für Profil-Joins) |
| `20250516150000_milestone4_parkplaetze.sql` | `parkplaetze` (Google + manuell, einer gewählt) |

---

## Milestones & Status

### ✅ Milestone 1 — Basis
- Auth (Registrierung + Login)
- Kalenderübersicht `/`
- Fahrt anlegen `/fahrten/neu`
- Hertha-Design `#003264`

### ✅ Milestone 2 — Fahrt-Dashboard
- Route `/fahrten/:id`
- Spielinfo, Abfahrtszeit (Treffpunkt → Stadion), Google Maps Route
- Puffer 1,5h / 2h wählbar
- Standard-Treffpunkt: Pendlerparkplatz Schwielowsee
- Fahrt löschen (nur Ersteller:in)

### ✅ Milestone 3 — Social & Profil
- **Mitfahrer:** anmelden/abmelden auf Fahrt-Seite
- **Mitbringliste:** Einträge mit Profilbild
- **Profil** `/profil`: Anzeigename, Profilbild, Adresse „Abfahrt von Zuhause“
- **Persönliche Abfahrt:** Zuhause → Treffpunkt (wenn Adresse gesetzt)
- **Übersicht:** Mitfahrer-Avatare unten rechts auf Fahrt-Karten
- Vereins-Autocomplete + Wappen (`src/data/vereine.ts`, Saison 25/26)

### ✅ Milestone 4 — Parkplatz
- **Google Places:** Parkplätze nahe Stadion suchen und zur Liste hinzufügen
- **Manuell:** Name + Adresse eintragen
- **Gewählt:** Ein Parkplatz pro Fahrt markierbar (Badge „Gewählt“, Link zu Google Maps)

### 🔲 Milestone 5 — Polish
- PWA, Design-Feinschliff, Tests

---

## Routen (App)

| Route | Beschreibung |
|-------|--------------|
| `/` | Kalenderübersicht (+ Mitfahrer-Avatare auf Karten) |
| `/fahrten/neu` | Fahrt anlegen |
| `/fahrten/:id` | Dashboard |
| `/profil` | Profil & Einstellungen |
| `/login`, `/register` | Auth |

---

## Design

- Primär: `#003264` · Sekundär: `#005BAC` · Akzent: Weiß
- Sprache: Deutsch · Mobile-first

---

## Bekannte Punkte

- `.env` fehlt → „Failed to fetch“ bei Auth
- Google Maps Key (Dev): Referrer `http://localhost:5173/*` + `http://127.0.0.1:5173/*` (Port fest; `npm run dev` räumt 5173 vorher auf). Kein Wildcard für alle Ports möglich.
- Parkplatz-Suche: **Places API (New)** aktivieren (nicht die Legacy-„Places API“)
- Nach Schema-Änderungen: Migrationen in Supabase SQL Editor ausführen

---

## Nicht im Scope (v1.0)

Chat, Push, Tickets, Kostenaufteilung, Einladungslinks, native Apps, Discord, automatischer Spielplan-Import

---

## Nächster Schritt

**Milestone 5:** PWA, Design-Feinschliff, Tests

**Beispiel-Prompt für neuen Chat:**
> Ich arbeite an der Hertha Auswärtsfahrten App. Kontext: @PROJEKT_KONTEXT.md — Milestone 1–4 sind fertig. Bitte Milestone 5 (Polish) umsetzen.

---

*Zuletzt aktualisiert: Mai 2026 (Milestone 4 Parkplätze)*

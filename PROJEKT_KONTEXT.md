# Hertha Auswärtsfahrten Planer — Projekt-Kontext

> **Ort:** `hertha-auswaertsfahrten/PROJEKT_KONTEXT.md` (im Repo, versioniert)
>
> **Neuer Cursor-Chat:** `@PROJEKT_KONTEXT.md` anhängen oder Inhalt als erstes einfügen.
>
> **Aktualisierung:** Nach größeren Features fragen: *„Aktualisiere PROJEKT_KONTEXT“*

---

## Projektbeschreibung

Web-App für eine kleine Gruppe Hertha BSC Fans (3–6 Leute) aus Berlin: gemeinsame Auswärtsfahrten planen. Ersetzt Organisation über Discord — Kalender + Dashboard pro Fahrt.

**Kern-Features (Zielbild):**
- Monatskalender + Listenübersicht aller Auswärtsfahrten
- Fahrt-Dashboard: Spielinfo, Zeitplanung, Route, Mitfahrer, Mitbringliste, Parkplatz
- Abfahrtszeit via Google Maps (Anpfiff − Fahrtzeit − Puffer)
- Persönliche Abfahrt von Zuhause zum Treffpunkt
- Gewählter Parkplatz als Routenziel (statt Stadion)
- Login mit E-Mail + Passwort (Supabase)

---

## Tech Stack

| Bereich | Technologie |
|---|---|
| Frontend | React 19 + Vite 6 + TypeScript |
| Styling | Tailwind CSS 4 |
| Routing | React Router 7 |
| Backend / DB | Supabase (Postgres + RLS) |
| Auth | Supabase Auth |
| Routen | Google Maps JavaScript API + **Directions API** |
| Parkplatz-Suche | **Places API (New)** — `Place.searchNearby()` (nicht Legacy `PlacesService`) |
| Profilbilder | Supabase Storage (`avatars`) |
| Mobile (geplant) | PWA |
| Hosting | noch nicht deployed |

---

## Repository & Branch

| | |
|---|---|
| **GitHub** | https://github.com/LVRCHIII/hertha-auswaertsfahrten |
| **Hauptentwicklung** | `cursor/milestone-1-auth-calendar-fahrten` |
| **Supabase-Projekt** | `hertha-auswaertsfahrten` · Ref `rjvffwjkdnbqevrkycem` · Region `eu-central-2` |

---

## Lokale Entwicklung

```bash
npm install
cp .env.example .env   # Keys eintragen
npm run dev            # Port 5173 (fest), beendet vorher alte Prozesse auf 5173
```

- **URL:** http://localhost:5173
- **Vite:** `strictPort: true`, Port 5173 — weicht nicht mehr auf 5174/5177 aus
- **`npm run dev:stop`:** beendet Prozesse auf Port 5173 (wird von `npm run dev` automatisch aufgerufen)

### `.env`

```
VITE_SUPABASE_URL=https://rjvffwjkdnbqevrkycem.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>
VITE_GOOGLE_MAPS_API_KEY=<Google Maps API Key>
```

Nach `.env`-Änderungen: Dev-Server neu starten.

### Google Cloud (API-Key)

**APIs aktivieren:**
- Maps JavaScript API
- Directions API
- **Places API (New)** — nicht die ältere „Places API“

**HTTP referrers (einmalig, Port ist fest):**
- `http://localhost:5173/*`
- `http://127.0.0.1:5173/*`

Kein Port-Wildcard möglich. Optional für Dev: zweiter Key nur mit API-Einschränkung (ohne Referrer).

**Typische Fehler:**
- `RefererNotAllowedMapError` → Referrer für aktuelle Origin ergänzen
- Route hängt bei „wird berechnet“ → oft derselbe Referrer-Fehler (Callback kommt nicht)
- Parkplatz 404 → Migration `parkplaetze` fehlt in Supabase

---

## Supabase-Migrationen (Reihenfolge)

Im SQL Editor ausführen (oder per Supabase MCP `apply_migration`):

| Datei | Inhalt |
|-------|--------|
| `20250515120000_create_fahrten.sql` | Tabelle `fahrten` |
| `20250516120000_milestone3_social.sql` | `profiles`, `mitfahrer`, `mitbringliste` |
| `20250516130000_profile_avatar_home.sql` | `avatar_url`, `home_address`, Storage `avatars` |
| `20250516140000_fix_social_profile_fkeys.sql` | FK `user_id` → `profiles` |
| `20250516150000_milestone4_parkplaetze.sql` | Tabelle `parkplaetze` |
| `20250516160000_parkplaetze_distance_cost.sql` | `distance_meters`, `cost_kind` |

### Tabelle `parkplaetze`

- Pro Fahrt mehrere Einträge; **max. einer** mit `is_selected = true` (Unique-Index)
- `source`: `google` | `manual`
- `place_id`, `lat`, `lng` (von Google)
- `distance_meters` (Luftlinie zum geocodierten Stadion)
- `cost_kind`: `free` | `paid` | `mixed` | `unknown` (aus Google `parkingOptions`)
- RLS: alle Authenticated lesen/bearbeiten; Insert nur `created_by = auth.uid()`

---

## App-Routen

| Route | Beschreibung |
|-------|--------------|
| `/` | Startseite mit Umschalter Kalender/Liste: Monatskalender und kommend/vergangen |
| `/fahrten/neu` | Fahrt anlegen (Gegner-Autocomplete, Wappen, Anpfiff) |
| `/fahrten/:id` | Fahrt-Dashboard |
| `/profil` | Anzeigename, Avatar, Abfahrt von Zuhause |
| `/login`, `/register` | Supabase Auth |

---

## Fahrt-Dashboard (`/fahrten/:id`) — Logik

### Abfahrt & Route (oben)

1. **Treffpunkt → Ziel**
   - Standard-Ziel: **Stadion** (`qualifyDestinationAddress`)
   - Wenn ein Parkplatz **gewählt** (`is_selected`): Ziel = Parkplatz (Koordinaten oder Adresse)
   - `getRouteEndpoints(fahrt, selectedParkplatz)` in `src/lib/routeAddresses.ts`
   - Hinweis in UI: „Routenziel: gewählter Parkplatz …“

2. **Puffer** 1,5 h oder 2 h vor Anpfiff → empfohlene Abfahrtszeit am Treffpunkt

3. **Google Directions** via `useRoutePlan` + `DirectionsService` (Legacy; Deprecation-Warnung in Konsole — noch OK)

4. **Zuhause → Treffpunkt** (`HomeDepartureBlock`), wenn `home_address` im Profil

### Parkplatz (unten)

- State: `useParkplaetze(fahrtId)` wird in **FahrtDashboardPage** gehalten (für Route + UI)
- **Suche:** `searchParkingNearStadium(stadion)` → `Place.searchNearby` mit `includedPrimaryTypes: ['parking']`
- **Liste:** Einträge sortiert (gewählter oben), **keine Doppelanzeige**
- Gewählter Eintrag: blau hervorgehoben, Badge „Routenziel“, Buttons „Abwählen“ / „Entfernen“
- **Meta:** Entfernung (Luftlinie) + Kosten-Badge (`ParkingMeta`)
- Manuell hinzugefügte Parkplätze: ohne Entfernung/Kosten, bis neu aus Google-Suche

### Social

- Mitfahrer, Mitbringliste (wie Milestone 3)

---

## Wichtige Dateien

```
src/
├── pages/
│   ├── HomePage.tsx              Startseite mit Kalender/Liste
│   ├── FahrtAnlegenPage.tsx      Formular + VereinAutocomplete
│   ├── FahrtDashboardPage.tsx    Route, Parkplatz-State, Social
│   ├── ProfilPage.tsx
│   ├── LoginPage.tsx / RegisterPage.tsx
├── components/
│   ├── CalendarView.tsx          Monatskalender mit Fahrten
│   ├── ParkplatzSection.tsx      Parkplatz-UI (Props von useParkplaetze)
│   ├── ParkingMeta.tsx           Entfernung + Kosten-Badges
│   ├── MitfahrerSection.tsx / MitbringlisteSection.tsx
│   ├── HomeDepartureBlock.tsx
│   ├── FahrtCard.tsx / MitfahrerAvatarStack.tsx
│   └── DashboardSection.tsx
├── hooks/
│   ├── useFahrten.ts / useFahrt.ts
│   ├── useRoutePlan.ts           Google Directions
│   ├── useParkplaetze.ts         CRUD Parkplätze
│   ├── useParkingSearch.ts       Places-Suche (lokal, kein DB)
│   ├── useMitfahrer.ts / useMitbringliste.ts / useProfile.ts
│   └── useMitfahrerOverview.ts   Avatare auf Übersicht
├── lib/
│   ├── routeAddresses.ts         getRouteEndpoints (+ Parkplatz-Ziel)
│   ├── parkingPlaces.ts          Places API (New) Nearby Search
│   ├── parkingApi.ts             Supabase parkplaetze
│   ├── parkingInfo.ts            Haversine, cost_kind aus parkingOptions
│   ├── googleMapsLoader.ts       routes + places + core Libraries
│   ├── googleMapsErrors.ts       Referrer-Hinweise
│   ├── calendar.ts               Monatsraster + Fahrten nach Tag
│   ├── departureCalc.ts          Abfahrtszeit, formatDistance, Maps-URLs
│   ├── socialApi.ts / profilesApi.ts / fahrtenApi.ts
│   └── defaultTreffpunkt.ts      Pendlerparkplatz Schwielowsee
├── types/
│   ├── fahrt.ts / parking.ts / social.ts / profile.ts
└── data/vereine.ts               2. Bundesliga 25/26 + Wappen
```

---

## Milestones & Status

### ✅ Milestone 1 — Basis
Auth, Kalender `/`, Fahrt anlegen, Hertha-Design `#003264` / `#005BAC`

### ✅ Milestone 2 — Fahrt-Dashboard
Spielinfo, Abfahrtszeit (Treffpunkt → Stadion), Google Maps, Puffer, Standard-Treffpunkt Schwielowsee, Fahrt löschen

### ✅ Milestone 3 — Social & Profil
Mitfahrer, Mitbringliste, Profil (Avatar, Zuhause-Adresse), persönliche Abfahrt Zuhause → Treffpunkt, Mitfahrer-Avatare auf Karten, Vereins-Autocomplete + Wappen

### ✅ Milestone 4 — Parkplatz (vollständig)
- Google Places (New): Parkplätze nahe Stadion, zur Liste hinzufügen
- Entfernung zum Stadion (Luftlinie) + Kosten-Hinweis (kostenlos/kostenpflichtig/unbekannt)
- Manuell: Name + Adresse
- **Gewählter Parkplatz = Routenziel** (Abfahrt & Route oben)
- UI: eine Liste, Auswahl farbig oben, ohne Duplikat-Kasten

### ✅ Milestone 5 — Kalenderansicht
- Startseite mit Umschalter **Kalender / Liste**
- Monatsansicht im Hertha-Design, Navigation vorheriger Monat / Heute / nächster Monat
- Spiele als anklickbare Kalendereinträge (`Anpfiff + Gegner`)
- Abgestimmte Abfahrtszeit erscheint im Kalendereintrag, wenn vorhanden

### 🔲 Milestone 6 — Polish
PWA, Design-Feinschliff, Tests, ggf. Migration Directions → Routes API (New)

---

## Design

- Primär: `#003264` · Sekundär: `#005BAC` · Akzent: Weiß
- Sprache: Deutsch · Mobile-first
- `AppShell` mit Header (Profil, + Fahrt, Abmelden)

---

## Bekannte Punkte / Fallstricke

| Problem | Lösung |
|---------|--------|
| Auth „Failed to fetch“ | `.env` mit Supabase-URL + Anon-Key |
| Maps `RefererNotAllowedMapError` | Referrer `http://localhost:5173/*` in Google Cloud |
| Port 5173 belegt | `npm run dev` stoppt alten Prozess; sonst anderen Prozess beenden |
| Parkplatz-Tabelle fehlt | Migration `20250516150000_…` |
| Spalten `distance_meters`/`cost_kind` fehlen | Migration `20250516160000_…` |
| Places-Suche schlägt fehl | **Places API (New)** aktivieren, nicht Legacy |
| Adblocker | `maps.googleapis.com` für localhost erlauben |
| Alte Parkplätze ohne Meta | Entfernen & neu aus Google-Suche hinzufügen |
| `DirectionsService` deprecated | Warnung in Konsole; funktioniert noch |

---

## Nicht im Scope (v1.0)

Chat, Push, Tickets, Kostenaufteilung, Einladungslinks, native Apps, Discord, automatischer Spielplan-Import

---

## Nächster Schritt

**Milestone 5:** PWA, Design-Feinschliff, Tests

**Beispiel-Prompt für neuen Chat:**
> Ich arbeite an der Hertha Auswärtsfahrten App. Kontext: @PROJEKT_KONTEXT.md — Milestone 1–4 sind fertig (inkl. Parkplatz mit Routen-Integration). Bitte Milestone 5 umsetzen.

---

*Zuletzt aktualisiert: Mai 2026 (Milestone 4 komplett: Parkplatz, Entfernung/Kosten, Routenziel, UI-Liste)*

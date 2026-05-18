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
npm test               # Vitest Unit-Tests
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
| `/spieltag` | Mobile-first Spieltag-Modus für die nächste Auswärtsfahrt |
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
│   ├── SpieltagPage.tsx          Mobile Kurzansicht für nächste Fahrt
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
│   ├── spieltag.ts               Nächste Fahrt, Tageslabel, Timeline
│   ├── departureCalc.ts          Abfahrtszeit, formatDistance, Maps-URLs
│   ├── socialApi.ts / profilesApi.ts / fahrtenApi.ts
│   └── defaultTreffpunkt.ts      Pendlerparkplatz Schwielowsee
├── types/
│   ├── fahrt.ts / parking.ts / social.ts / profile.ts
└── data/vereine.ts               2. Bundesliga 25/26 + Wappen
public/
├── manifest.webmanifest          PWA-Metadaten
├── sw.js                         Service Worker für App-Shell/offline Fallback
└── icons/hertha-app-icon.svg     App-/Favicon
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

### ✅ Milestone 6 — Polish-Basis
- PWA-Metadaten: Manifest, Theme-Farbe, App-Icon, Mobile-App-Tags
- Service Worker: App-Shell/offline Fallback nur für gleiche Origin; keine Supabase-/Google-API-Caches
- Test-Setup mit Vitest (`npm test`)
- Erste Unit-Tests für Kalenderlogik, Abfahrts-/Maps-URL-Helfer und Parkplatz-Metadaten

### ✅ Milestone 9 — Spieltag-Modus
- Neue Route `/spieltag` als mobile Kurzansicht für die nächste Auswärtsfahrt
- Hero mit Gegner, Datum, Tageslabel („Heute/Morgen/in X Tagen“) und nächstem Zeitpunkt
- Schnellaktionen: Route, Treffpunkt, gewählter Parkplatz, vollständiges Dashboard
- Kompakter Ablauf aus Zuhause-Abfahrt (wenn Profiladresse + Route), Treffpunkt-Abfahrt, Ankunft/Puffer, Anpfiff
- Kompakte Mitfahrer- und Mitbringliste-Vorschau
- Unit-Tests für Spieltag-Helfer (`pickNextSpieltagFahrt`, Tageslabel, Timeline)

### 🔲 Milestone 10 — Auswärtsstatistik
- Startseiten-Karte mit persönlicher und gruppenweiter Statistik
- Ranking: Platz, Name, Anzahl Auswärtsfahrten, Kilometer
- Statistik zählt nur Fahrten, bei denen der User in `mitfahrer` steht („Ich fahre mit“)
- Längste Fahrt pro User oder gruppenweit hervorheben
- Kilometer pro Fahrt dauerhaft speichern (nicht jedes Mal live über Google berechnen)
- Tests für Teilnahmefilter, Ranking-Sortierung und Kilometerformatierung

### 🔲 Milestone 11 — Spieltagsbericht mit Rich-Text & Bildern
- Neuer Erinnerungsbereich pro Fahrt im Dashboard
- Rich-Text-Editor mit Toolbar (z. B. Tiptap): Überschriften, Fett/Kursiv, Listen, Zitate, Links
- Bilder in den Fließtext hochladen und inline einfügen
- Bericht strukturiert speichern (`content_json`), gerenderten Output kontrolliert/sicher anzeigen
- Supabase Storage Bucket für Berichtbilder

### 🔲 Milestone 12 — Bewertungen pro Fahrt
- Teilnehmer bewerten Fahrt, Stadion, Mannschaft, Stimmung, Essen und Gesamt mit 1-5 Sternen
- Nur Mitfahrer dürfen eine Fahrt bewerten
- Eigene Bewertung bearbeiten, Durchschnitt je Kategorie anzeigen
- Highlights später nutzbar: beste Stimmung, bestes Stadion, beste Gesamtfahrt

### 🔲 Milestone 13 — Saisonarchiv & Erinnerungsseite
- Neue Archiv-/Saisonroute für abgeschlossene Auswärtsfahrten
- Erinnerungsseite pro Fahrt mit Bericht, Bildern, Bewertungen und Teilnehmern
- Gruppenstatistik: gesamte Auswärtskilometer, besuchte Stadien, aktivste Mitfahrer
- Top-Fahrten nach Bewertung und Saisonrückblick

### 🔲 Milestone 14 — Erinnerungen & Hinweise
- PWA-/Browser-Erinnerungen vor Fahrt und Abfahrt
- Hinweise bei Änderungen an Treffpunkt, Parkplatz oder Anpfiff
- Reminder für offene Mitbringliste

### 🔲 Milestone 15 — Gruppenverwaltung
- Feste Gruppe statt globaler Auth-User-Sicht
- Einladungslinks für neue Mitglieder
- Rollen/Berechtigungen für Löschen, finale Zeiten, Berichte und Verwaltung

---

## Geplantes Erinnerungsarchiv — Datenmodell-Leitplanken

### Auswärtsstatistik

- Teilnahmequelle: `mitfahrer` bleibt maßgeblich. Nur „Ich fahre mit“ zählt für persönliche Spiele/Kilometer.
- Distanzquelle: Kilometer pro Fahrt dauerhaft speichern, z. B. `route_distance_meters` auf `fahrten` oder als eigene Statistik-Basistabelle.
- Keine Live-Abhängigkeit von Google Maps für Rankings: Routenberechnung darf Werte vorschlagen, Statistik liest gespeicherte Werte.
- Startseite zeigt Ranking und persönliche Statistik; spätere Archivseite kann dieselben Aggregationen wiederverwenden.

### Spieltagsberichte

- Pro Fahrt ein Bericht in einer neuen Tabelle, z. B. `spieltagsberichte`.
- Inhalt primär als strukturiertes Editor-JSON speichern (`content_json`), nicht nur als unsicherer HTML-String.
- Optional zusätzlich `content_text` für Suche/Vorschau und `updated_at`/`author_id` für Historie.
- Rich-Text-Editor geplant mit Toolbar und Inline-Bildern; Tiptap passt gut zu React und strukturiertem JSON.

### Berichtbilder

- Supabase Storage Bucket, z. B. `bericht-images`.
- Bilder werden im Editor hochgeladen und als Nodes im Bericht referenziert.
- RLS/Storage-Regeln: Lesen für authenticated; Upload/Löschen zunächst für authenticated bzw. Autor, später rollenbasiert über Gruppenverwaltung.

### Bewertungen

- Neue Tabelle `fahrt_bewertungen` mit Unique-Key `(fahrt_id, user_id)`.
- Kategorien: `fahrt`, `stadion`, `mannschaft`, `stimmung`, `essen`, `gesamt` mit 1-5 Sternen.
- Nur Mitfahrer sollen bewerten dürfen; das sollte in API und idealerweise per RLS abgesichert werden.
- Durchschnittswerte werden im Dashboard angezeigt und später im Saisonarchiv für Highlights genutzt.

---

## Design

- Primär: `#003264` · Sekundär: `#005BAC` · Akzent: Weiß
- Sprache: Deutsch · Mobile-first
- `AppShell` mit Header (Spieltag, Profil, + Fahrt, Abmelden)

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

Chat, Tickets, Kostenaufteilung/Fahrzeugverwaltung, native Apps, Discord, automatischer Spielplan-Import

Kosten-/Auto-Features sind bewusst nicht im Milestone-Katalog, da die Gruppe mit einem festen Firmenwagen fährt und Spritkosten nicht relevant sind.

---

## Nächster Schritt

**Milestone 10:** Auswärtsstatistik umsetzen (Teilnahme aus `mitfahrer`, gespeicherte Kilometer pro Fahrt, Ranking auf der Startseite).

**Beispiel-Prompt für neuen Chat:**
> Ich arbeite an der Hertha Auswärtsfahrten App. Kontext: @PROJEKT_KONTEXT.md — Milestone 1–6 und 9 sind fertig. Der neue Katalog sieht Milestone 10 Auswärtsstatistik, 11 Spieltagsberichte, 12 Bewertungen und 13 Saisonarchiv vor. Bitte Milestone 10 umsetzen.

---

*Zuletzt aktualisiert: Mai 2026 (Katalog erweitert: Auswärtsstatistik & Erinnerungsarchiv)*

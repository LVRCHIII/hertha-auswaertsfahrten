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

### ✅ Milestone 11 — Spieltagsberichte
- Tiptap-Editor für Berichte nach einer Fahrt
- Tabelle `spieltagsberichte` (fahrt_id PK, author_id, content_json, content_text)
- Storage-Bucket `bericht-images` (öffentlich, max 5 MB, JPEG/PNG/WebP)
- Migration applied: `20260522140000_milestone11_spieltagsberichte.sql`

### ✅ Milestone 13 — Theme-System

- 5 Hertha-Themes basierend auf echten Trikots:
  - **Klassisch** — Hertha-Dunkelblau #003264 (Standard-Heimtrikot)
  - **Aufwärm Shirt** — Dunkles Teal #0d1c25 + Cyan #6dcfe4 + Lila CTA (Castore Trainingsshirt)
  - **Auswärts 20/21** — Fast-schwarzes Navy #050c18 + Elektrisch-Blau #4d72ff (Nike Splatter-Trikot)
  - **Auswärts 24/25** — Sehr dunkles Schwarz-Blau #0f1215 + Hellblau-Weiß (Streifen-Third-Kit)
  - **Schwarzer Beton** — Mattes Schwarz #0d0d0d + Hellgrau, mit Beton-Graffiti-Textur als Hintergrundbild
- CSS Custom Properties (`--color-shell-bg/fg/cta-bg/cta-fg`) in `src/index.css`
- Theme-Klassen auf `<html>`-Element, Flash-Prevention-Script in `index.html`
- Theme wird in `localStorage` gespeichert (`hertha-theme`)
- `ThemeContext` + `useTheme` Hook in `src/contexts/ThemeContext.tsx`
- Theme-Picker auf Profilseite (5 farbige Split-Swatches)
- **Textur-System:** `--shell-texture-url` + `--shell-texture-opacity` CSS-Variablen
- `TextureOverlay`-Komponente in `src/components/TextureOverlay.tsx` (global in App.tsx)
- `AppShell` und `AuthLayout` nutzen `bg-transparent`, Hintergrundfarbe kommt von `html { background-color: var(--color-shell-bg) }`

### ✅ Milestone 15 — Navigation & Bottom-Nav

- `src/components/BottomNav.tsx` — Mobile Bottom-Nav (Home, Spieltag, + Fahrt CTA, Profil)
- `AppShell`: Desktop-Nav-Links ausgeblendet auf Mobile (`hidden sm:flex`), nur Abmelden-Button bleibt
- `main` bekommt `pb-24 sm:pb-6` damit Inhalt nicht hinter Bottom-Nav verschwindet
- `Toaster` verschoben auf `bottom-20 sm:bottom-6`

### ✅ Milestone 16 — Theme-Konsistenz

- Neue CSS-Var `--color-card-accent` in `src/index.css` — pro Theme eigene Akzentfarbe für weiße Karten
- `DashboardSection`: `text-hertha-blue` → `text-card-accent`
- `AwayStatsCard`: alle `hertha-blue/mid` Referenzen → `card-accent`
- `FahrtCard`: Ring, Badge, Abfahrt-Farbe → `card-accent`; past-Karte → `shell-fg` vars
- `FahrtDashboardPage`: `bg-hertha-blue/10`, Puffer-Button, Maps-Link → `card-accent`
- `HomePage`: Tab-Switcher und Empty-State-Button → `shell-cta` vars

### ✅ Milestone 14 — Toast-Notifications

- `src/contexts/ToastContext.tsx` — `ToastProvider` + `useToast()` Hook
  - `toast.success(msg)` / `toast.error(msg)`, Auto-Dismiss nach 3,5s, klickbar zum Schließen
- `src/components/Toaster.tsx` — Fixed bottom-center, Pill-Design (grün/rot), PWA-freundlich
- In `App.tsx`: `<ToastProvider>` + `<Toaster />` um alle Routes
- Toasts eingebaut in: MitfahrerSection, MitbringlisteSection, SpieltagsberichtSection, ProfilPage, FutbologyCsvUpload
- Strategie: Lade-/Init-Fehler bleiben inline; Aktions-Feedback (an/abmelden, speichern etc.) kommt als Toast
- `useMitfahrer.toggle` gibt jetzt `{ error: string | null }` zurück
- `useMitbringliste.removeItem` gibt jetzt `boolean` zurück

### ✅ Milestone 12 — Futbology-Integration
- CSV-Import aus Futbology (besuchte Spiele pro User)
- Tabelle `futbology_spiele` (user_id, datum, stadion, heim_team, gast_team, ergebnis, liga)
- `BesuchteSpieleListe` + `BesuchteSpielCard` + `FutbologyCsvUpload` Komponenten
- Spiele-Tab auf HomePage, Upload auf ProfilPage
- Migration applied: `20260525120000_milestone12_futbology.sql`

### ✅ Milestone 17 — Karten & Layout-Polish

- **FahrtCard Hero-Variante** (`hero` prop): Erste kommende Fahrt auf der HomePage als großer Featured-Card
  - Prominentes MatchupWappen `size="md"`, Abfahrtszeit als großes Badge, Puls-Dot "Nächste Fahrt"-Label
  - Breiter `rounded-3xl` Stil mit `shadow-lg` statt normaler `rounded-2xl`-Karte
- **Skeleton-Loading** in `FahrtSection`: Animierte Platzhalter statt "Wird geladen…"-Text
  - Hero-Skeleton für erste Karte, kleine Skeletons für weitere (je `animate-pulse`)
- **FahrtSection** bekommt `heroFirst?: boolean` + `loading?: boolean` Props; `HomePage` übergibt beides für "Kommende Fahrten"
- **SpieltagPage QuickActions**: Icon-Emoji vor Label (🗺️ Route, 📍 Treffpunkt, 🅿️ Parkplatz, ⚙️ Dashboard)
  - QuickAction-Komponente bekommt `icon: string` prop, Layout mit `flex items-start gap-3`
- **FahrtDashboardPage Hero-Header**: Spielinfo-Bereich in eigenem `rounded-3xl bg-white` Hero-Block
  - Back-Link + Löschen-Button oben im Hero; Feldlabels als `uppercase tracking-wide text-slate-400`

### ✅ Milestone 18 — Auth-Animationen & Login-Polish

- **Framer Motion** installiert (`npm install framer-motion`)
- **AuthLayout**: animierter Card-Einblend (fade-in + slide-up, ease `[0.16,1,0.3,1]`), Header gestaffelt nachgezogen
- **Hintergrund-Blobs**: 3 animierte CSS-Blobs (`.auth-blob-1/2/3`) in `src/index.css`
  - `blob-drift-*` Keyframes, 14–22s Zyklen, `blur-3xl/2xl`, Theme-Farben (`shell-fg/10`, `shell-cta-bg/15`)
- **LoginPage**: gestaffelte Formfeld-Animationen (slide-in-left, 80ms Delay pro Feld), Error-Banner fade-in, Spinner-Button
- **RegisterPage**: gleiche Behandlung, 3 Felder gestaffelt

### ✅ Milestone 19 — Texturen für alle Themes

- **TextureOverlay** erweitert: neue CSS-Vars `--shell-texture-repeat` und `--shell-texture-size`
  - `repeat` + feste px-Größe für Seamless-Tiles; `no-repeat` + `cover` (Default) für Cover-Bilder
- **Aufwärm Shirt** → `splatter-hell.png` (Tile, 380px, repeat, 0.28 Opacity)
- **Auswärts 20/21** → `splatter-dunkel.png` (Tile, 380px, repeat, 0.35 Opacity)
- **Auswärts 24/25** → `streifen.png` (Tile, 220px, repeat, 0.20 Opacity)
- **Schwarzer Beton** → `schwarzer-beton.png` (Cover, 0.18 Opacity) — unverändert
- **Fahnenmeer-Theme entfernt** — Bild nicht hochauflösend genug; `Fahnenmeer.png` liegt in `public/textures/` für später
- Dateien umbenannt (Leerzeichen/`%`-Zeichen Vite-inkompatibel):
  - `seamless_tile 50% darker.png` → `splatter-dunkel.png`
  - `seamless_tile spritzer.png` → `splatter-hell.png`
  - `9432da6501fec22878f0f3c897dfb554.png` → `streifen.png`

### ✅ Milestone 20 — Spieltagsbewertungen

- Migration applied: `20260602120000_milestone20_bewertungen.sql`
- Neue Spalten auf `spieltagsberichte`: `ergebnis_heim`, `ergebnis_gast` (smallint), `zuschauer` (integer), `bewertung_spiel`, `bewertung_atmosphaere`, `bewertung_pommes` (smallint 1–5)
- `src/components/StarRating.tsx` — wiederverwendbare Sterne-Komponente, readonly-Modus, Emojis konfigurierbar
- `src/types/bericht.ts` — `BerichtMeta` Typ hinzugefügt
- `src/lib/berichtApi.ts` — `saveSpieltagsbericht` nimmt optionalen `meta: BerichtMeta`
- `src/hooks/useSpieltagsbericht.ts` — `save()` nimmt optionalen `meta`
- `SpieltagsberichtSection` überarbeitet: Spielinfo-Box (Ergebnis + Zuschauer), 3 Sterne-Rater (⭐🔥🍟), Freitext-Editor
- `FahrtDashboardPage`: `SpieltagsberichtSection` jetzt tatsächlich eingebunden (war vorher vergessen)

### ✅ Milestone 21 — Vereinsdatenbank & Spielplan-Import

- `src/data/vereine.ts` — Neues Feld `liga: Liga`, 5 Ligen, ~80 Vereine gesamt
  - Ligen: `1. Bundesliga`, `2. Bundesliga`, `3. Bundesliga`, `Regionalliga`, `Frauen-Bundesliga`
  - `ALLE_VEREINE` kombiniert, `filterVereine` sucht über alle Ligen incl. Liga-Name
  - Liga-Badge im `VereinAutocomplete`-Dropdown
- **56 Wappen-PNGs** in `public/wappen/` — einmalig geladen via api-football.com
  - Script: `scripts/fetch-wappen.mjs`, `npm run fetch-wappen`
  - api-football Team-ID Hertha: 159, API-Key in `.env` als `VITE_API_FOOTBALL_KEY`
- **Spielplan-Import:** `src/components/SpielplanImport.tsx` + `src/lib/apiFootballFixtures.ts`
  - Weißes Card oben auf `FahrtAnlegenPage`, "📅 Laden" → Preview mit Checkboxen → Bulk-Import
  - Nur Hertha-Auswärtsspiele (2. BL + DFB Pokal), bereits vorhandene Fahrten ausgegraut
  - **Einschränkung:** api-football Free Plan nur Saisons 2022–2024
  - **Geplant:** Wechsel auf OpenLiga DB (kostenlos, kein Key) wenn Spielplan 2026/27 erscheint

---

### ✅ Redesign — „Matchday Editorial" (2026-06-11)

Komplettes visuelles Redesign der App. Das Theme-System (5 Trikot-Themes) bleibt unverändert funktionsfähig.

**Design-Sprache:**
- **Typografie:** Archivo Variable Font (Google Fonts, `wdth`-Achse) zusätzlich zu Outfit
  - `.font-display` — condensed Uppercase für Headlines (wie Stadion-Anzeigetafeln)
  - `.font-display-wide` — weit gesperrte Caps für Labels/Eyebrows
  - `.font-score` — extra-condensed tabular-nums für Zahlen (Ergebnisse, Uhrzeiten, km)
- **Oberflächen** (in `src/index.css`):
  - `.glass-card` — dunkle Karten im Glas-Look, **opak** (color-mix mit shell-bg statt transparent, kein backdrop-blur → Lesbarkeit + Mobile-Performance; Texturen scheinen nur im Seitenhintergrund durch)
  - `.accent-line` — Akzent-Verlaufslinie für Kartenköpfe
  - `.noise-overlay` — feines SVG-Korn gegen digitale Flachheit
  - `.light-card` — weiße Karte mit theme-getöntem Schatten (aktuell kaum noch genutzt)
  - `--color-card-bg` / `--color-card-border` — Vars für Komponenten wie SaisonExport

**GSAP** (`gsap` npm-Package, `src/lib/gsapFx.ts`):
- `useCountUp(value, {suffix})` — Zahlen zählen beim Sichtbarwerden hoch (ScrollTrigger, once)
- `useStaggerReveal(deps)` — Kinder mit `[data-reveal]` staggern beim Mount herein
- Beide respektieren `prefers-reduced-motion`

**Umgebaute Flächen:**
- **HomePage:** AwayStatsCard dunkel mit Count-up-Kacheln, Stagger-Reveal, Glas-Tab-Switcher
- **Hero-FahrtCard:** „Matchday Board" — riesiger condensed Gegner-Name, Ghost-Schriftzug im Hintergrund, **Live-Countdown bis Anpfiff** (Tage:Std:Min, 30s-Intervall), Abfahrt-Badge in CTA-Farbe
- **SpieltagPage:** Glas-Matchday-Hero, QuickActions als Glas-Karten, Ablauf/Mitfahrer/Mitbringliste dunkel
- **FahrtDashboardPage:** Glas-Hero wie Spieltag, alle DashboardSections dunkel (Abfahrt, Route, Parkplatz, Abstimmung, Bericht)
- **CalendarView:** komplett dunkel (Glas-Grid, CTA-Farbe für Heute/Badges)
- **BesuchteSpieleListe/-Card:** Glas-Karten, Filter-Pills im Border-Stil
- **ProfilPage:** Glas-Seitenkopf + 4 getrennte Glas-Karten (Profil-Formular, App-Design, Futbology, Saisonexport), Inputs im Auth-Stil
- **Auth (Login/Register):** dunkle Glas-Karte, „AUSWÄRTS"-Ghost-Wordmark, dunkle Formularfelder
- **AppShell/BottomNav:** Header mit Accent-Hairline + Display-Wordmark; BottomNav als schwebende Glas-Leiste (inset, rounded, safe-area)
- **BerichtToolbar:** SVG-Icons statt Textlabels (H2/H3, B, I, U, Listen, Zitat, Link), 32px-Targets, aria-labels, Gruppen-Trenner
- **ProfileAvatar:** Initialen-Fallback jetzt solide `card-accent` mit weißem Text (war auf dunklem Grund unsichtbar)

**Bewusste Ausnahme:** BerichtEditor + BerichtViewer bleiben weiße „Schreibblätter" (lange Texte auf hellem Grund lesbarer); Toolbar entsprechend hell.

**Dev-Preview:** Route `/design-preview` (nur `import.meta.env.DEV`, nie im Prod-Build) — rendert Stats, Hero-Card, Kalender, Spiel-Karte und Editor mit Mock-Daten ohne Login. Praktisch für Design-Checks.

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
| `20260522140000_milestone11_spieltagsberichte.sql` | spieltagsberichte-Tabelle |
| `20260525120000_milestone12_futbology.sql` | futbology_spiele-Tabelle |
| `20260602120000_milestone20_bewertungen.sql` | Bewertungsspalten auf spieltagsberichte |

---

## Code-Konventionen

- **Sprache:** Deutsch durchgehend (UI, Variablennamen, Commits)
- **Komponenten:** Named exports, PascalCase
- **Hooks:** `use`-Prefix, eigene Datei in `src/hooks/`
- **API-Layer:** `src/lib/` für Supabase-Calls und Berechnungen
- **Styling:** Tailwind utility classes, Mobile-First
- **Farben:** `hertha-blue` = `#003264`, `hertha-mid` = `#005BAC` (in Tailwind config definiert)
- **RLS:** Alle Tabellen haben Row Level Security aktiviert
- **Animationen:** Framer Motion für UI-Transitions, CSS Keyframes für reine Hintergrund-Effekte

---

### ✅ Milestone 22-Vorstufe — Spieltagsbericht Polish

- **Ergebnis-Anzeige**: Wappen (Gegner links, Hertha rechts), custom Stepper +/− statt native number-Input, korrekte Auswärts-Reihenfolge
- **Tiptap-Editor**: `bericht-prose` CSS (Obsidian-ähnlich) — h2/h3, ul/ol, blockquote mit Akzentfarbe, Links, line-height 1.75
- **Bug behoben**: `BerichtViewer` prop hieß `content`, wurde aber als `contentJson` übergeben → Viewer zeigte nie Inhalt
- **Bild aus Editor entfernt** — separater Bildbereich stattdessen
- **`BerichtBilderGalerie`**: 3-spaltiges Grid, Multi-Upload, Hover-× zum Löschen, Lightbox, unabhängig vom Text-Speichern
- **Migration**: `20260602140000_bericht_bilder.sql` — `bericht_bilder`-Tabelle (id, fahrt_id, uploaded_by, path, url, position) mit RLS — **muss manuell im Supabase Dashboard angewendet werden**

---

## Offene Milestones (geplant)

### ✅ Abgeschlossen
Alle Milestones M1–M23 sind fertig und deployed. Siehe Milestone-Status oben.

---

### 🐛 Bugfix — bericht_bilder FK
- Migration `20260609120000_fix_bericht_bilder_fkey.sql` erstellt
- **Muss manuell im Supabase SQL Editor ausgeführt werden** bevor Bilder ohne vorherigen Bericht hochgeladen werden können
- FK von `spieltagsberichte(fahrt_id)` → `fahrten(id)` umbiegen

---

### M24 — Dateianhänge pro Fahrt
**Ziel:** Tickets, Parkplatz-Screenshots, PDFs und andere Dateien direkt an einer Fahrt speichern — kein Discord-Chaos mehr.
- Neue Tabelle `fahrt_anhaenge` (id, fahrt_id, uploaded_by, name, path, url, mime_type, size_bytes, created_at)
- Neuer Supabase Storage Bucket `fahrt-anhaenge` (max 10 MB, alle gängigen Typen)
- Neue Komponente `FahrtAnhaengeSection` auf `FahrtDashboardPage`
  - Upload per Drag & Drop oder Datei-Dialog
  - Liste aller Anhänge mit Dateiname, Größe, Datum, Löschen-Button
  - Direkter Download-Link / Öffnen im Browser
- RLS: Authenticated users können sehen, eigene löschen
- Migration: `20260609130000_milestone24_anhaenge.sql`

---

### M25 — Zwischenstopps / Reiseplan
**Ziel:** Raststätten, Fan-Treffs, Essensstopps auf der Route festhalten — alle wissen wo und wann gehalten wird.
- Neue Tabelle `fahrt_stopps` (id, fahrt_id, position, name, adresse, ankunft_offset_min, notiz)
- Neue Komponente `StoppsSection` auf `FahrtDashboardPage` (nach Abfahrtszeit)
  - Stopp hinzufügen: Name + optionale Adresse + geschätzte Zeit nach Abfahrt
  - Sortierbare Liste (position-Feld), Stopp löschen
  - Optional: Google Maps Link zur Adresse
- Migration: `20260609140000_milestone25_stopps.sql`

---

### M26 — Stadioninfos pro Fahrt
**Ziel:** Praktische Infos zum Auswärtsspiel zentral: Gästeblock-Eingang, Catering, ÖPNV, Hinweise.
- Neues Freitext-Feld `stadion_infos` (text, nullable) auf `fahrten`-Tabelle
- Festes Struktur-Template als Placeholder: "Gästeblock-Eingang: …\nCatering: …\nÖPNV: …\nHinweise: …"
- Edit-Möglichkeit auf `FahrtDashboardPage` (inline Edit, kein eigener Editor nötig)
- Migration: `20260609150000_milestone26_stadioninfos.sql`

---

### M27 — PWA Offline-Cache
**Ziel:** Abfahrtszeit, Adresse, Mitfahrerliste und Parkplatz auch ohne Internet abrufbar — im Stadion oder im Zug.
- Service Worker mit Workbox (bereits PWA-Grundlage vorhanden)
- Cache-Strategie:
  - Statische Assets: Cache First
  - Supabase-Queries für aktuelle Fahrt: Stale-While-Revalidate, 24h Cache
  - Bilder: Cache First mit Limit
- Offline-Fallback-Seite wenn komplett kein Cache vorhanden
- `vite-plugin-pwa` konfigurieren (bereits installiert prüfen)

---

### M28 — Bewertungen & Berichte auf manuell angelegten Spielen
**Ziel:** Spieltagsberichte und Bewertungen funktionieren auch für Spiele die manuell (nicht via Spielplan-Import) angelegt wurden.
- Bugfix/Feature: `SpieltagsberichtSection` prüft ob `spieltagsberichte`-Eintrag existiert und legt ihn automatisch an
- Sicherstellen dass `fahrt_id` immer verfügbar ist (auch bei manuellen Fahrten ohne Supabase-Spielreferenz)

---

### M29 — Aktivitätsverlauf pro Fahrt
**Ziel:** Wer hat wann zugesagt, abgesagt, den Treffpunkt geändert? Reduziert Rückfragen in der Gruppe.
- Neue Tabelle `fahrt_aktivitaeten` (id, fahrt_id, user_id, typ, details jsonb, created_at)
- Typen: `mitfahrer_an`, `mitfahrer_ab`, `parkplatz_gewaehlt`, `treffpunkt_geaendert`, `bericht_gespeichert`
- Trigger in den jeweiligen Hooks beim Schreiben (useMitfahrer, useParkplatz etc.)
- Kompakte Timeline-Komponente `AktivitaetsLog` auf `FahrtDashboardPage` (zusammenklappbar)

---

### Backlog (nice to have)

- **Fahnenmeer-Theme** — wenn hochauflösende Version verfügbar: `public/textures/Fahnenmeer.png` ersetzen und Theme eintragen
- **OpenLiga DB** — `src/lib/apiFootballFixtures.ts` durch `src/lib/openligaFixtures.ts` ersetzen wenn Spielplan 2026/27 erscheint
- **Push-Notifications** — wenn jemand zusagt oder der Treffpunkt geändert wird (Supabase Realtime + Web Push API)

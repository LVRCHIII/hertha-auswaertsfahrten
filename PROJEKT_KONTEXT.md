# Hertha Auswärtsfahrten Planer — Projekt-Kontext

> **Verifizierter Stand:** 14. Juli 2026
> Dieser Stand wurde gegen Quellcode, Migrationen, Tests und Git-Historie geprüft. Externe Zustände wie produktives Deployment oder bereits ausgeführte Supabase-Migrationen lassen sich aus dem Repository allein nicht sicher bestätigen.

---

## Projektbeschreibung

Mobile-first Web-App für eine kleine Gruppe Hertha-BSC-Fans aus Berlin. Sie bündelt Planung, Spieltag und Erinnerungen an gemeinsame Auswärtsfahrten und ersetzt die bisherige Organisation über Discord.

### Bereits umgesetzt

- E-Mail-/Passwort-Login und Registrierung über Supabase
- Fahrten als Liste und Monatskalender, inklusive hervorgehobener nächster Fahrt
- Mobile Spieltag-Ansicht mit Ablauf und Schnellaktionen
- Fahrt-Dashboard mit Anpfiff, Treffpunkt, Google-Route, Abfahrtsberechnung und Kartenansicht
- Abfahrtszeit-Abstimmung, persönliche Abfahrt von Zuhause und auswählbarer Parkplatz als Routenziel
- Mitfahrer, Mitbringliste, Profilbild und Anzeigename
- Auswärtsstatistik mit Teilnahme, Kilometern und Ranking
- Spieltagsberichte mit Tiptap, Ergebnis, Zuschauerzahl und drei Bewertungen
- Eigenständige Fahrt-Fotogalerie mit Multi-Upload, Kamera, Drag-and-drop und Spotlight-Lightbox
- Geschützte Rückblicke-Route mit allen Fotos als chronologischem Onepager, gruppiert nach Fahrt sowie durchsuch- und nach Datum filterbar
- Futbology-CSV-Import sowie manuell erfasste besuchte Spiele
- Saisonexport als DOCX
- Spielplan-Import über API-Football und Vereinsdatenbank mit fünf Ligen
- Fünf umschaltbare Hertha-Themes, PWA-Grundlage, Toasts, Mobile-Bottom-Navigation
- „Matchday Editorial“-Design mit Archivo/Outfit, Glasflächen, Framer Motion und GSAP

---

## Tech Stack

| Bereich | Technologie |
|---|---|
| Frontend | React 19, Vite 6, TypeScript 5.8 |
| Styling | Tailwind CSS 4, CSS Custom Properties |
| Routing | React Router 7 |
| Backend / DB | Supabase Postgres mit RLS |
| Auth | Supabase Auth |
| Storage | Supabase Storage für Avatare und Fahrtfotos |
| Karten / Route | Google Maps JavaScript API, Directions API |
| Parkplatz-Suche | Places API (New), `Place.searchNearby()` |
| Rich Text | Tiptap 3 |
| Dokumentexport | `docx` |
| Fotogalerie | Spotlight.js 0.7.8 als lazy geladene Lightbox |
| Animation | Framer Motion, GSAP + ScrollTrigger, CSS |
| Tests | Vitest |
| Mobile | Installierbare PWA-Grundlage mit eigenem Service Worker |
| Hosting | `vercel.json` vorhanden; tatsächlicher Deployment-Status nicht aus dem Repo verifizierbar |

---

## Repository und lokaler Start

| | |
|---|---|
| GitHub | `https://github.com/LVRCHIII/hertha-auswaertsfahrten` |
| Entwicklungsbranch | `cursor/milestone-1-auth-calendar-fahrten` |
| Supabase-Projekt | `hertha-auswaertsfahrten`, Ref `rjvffwjkdnbqevrkycem`, Region `eu-central-2` |

```bash
npm install
cp .env.example .env
npm run dev       # Port 5173, beendet vorher einen alten Prozess auf diesem Port
npm test          # Vitest
npm run build     # TypeScript + Produktions-Build
```

### Umgebungsvariablen

```dotenv
VITE_SUPABASE_URL=https://rjvffwjkdnbqevrkycem.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-oder-publishable-key>
VITE_GOOGLE_MAPS_API_KEY=<google-maps-api-key>
VITE_API_FOOTBALL_KEY=<optional-fuer-spielplan-import>
```

Für Google müssen Maps JavaScript API, Directions API und Places API (New) aktiviert sein. Lokale Referrer: `http://localhost:5173/*` und `http://127.0.0.1:5173/*`.

---

## App-Routen

| Route | Status | Inhalt |
|---|---|---|
| `/` | geschützt | Fahrten, besuchte Spiele, Kalender, Statistik |
| `/spieltag` | geschützt | Mobile Kurzansicht der nächsten Fahrt |
| `/rueckblicke` | geschützt | Chronologisches Fotoarchiv nach Fahrt mit Suche und Datumsfilter |
| `/fahrten/neu` | geschützt | Fahrt anlegen und Spielplan importieren |
| `/fahrten/:id` | geschützt | Vollständiges Fahrt-Dashboard |
| `/profil` | geschützt | Profil, Theme, Futbology-Import, Saisonexport |
| `/login` | öffentlich | Anmeldung |
| `/register` | öffentlich | Registrierung |
| `/design-preview` | nur Development | Designprüfung mit Mock-Daten ohne Login |

Alle unbekannten Routen werden aktuell auf `/` umgeleitet; eine eigene 404-Seite gibt es nicht.

---

## Supabase-Migrationen in Reihenfolge

| Datei | Inhalt |
|---|---|
| `20250515120000_create_fahrten.sql` | `fahrten` |
| `20250516120000_milestone3_social.sql` | `profiles`, `mitfahrer`, `mitbringliste` |
| `20250516130000_profile_avatar_home.sql` | Profilfelder und Avatar-Storage |
| `20250516140000_fix_social_profile_fkeys.sql` | Profil-Fremdschlüssel |
| `20250516150000_milestone4_parkplaetze.sql` | `parkplaetze` |
| `20250516160000_parkplaetze_distance_cost.sql` | Entfernung und Kostenart für Parkplätze |
| `20250517120000_treffpunkt_bestaetigt.sql` | Treffpunkt-Bestätigung |
| `20250517130000_abfahrt_abstimmungen.sql` | Abfahrt-Voting |
| `20260518104802_milestone10_auswaertsstatistik.sql` | gespeicherte Routendistanz |
| `20260522140000_milestone11_spieltagsberichte.sql` | Tiptap-Berichte und Bericht-Storage |
| `20260525120000_milestone12_futbology.sql` | importierte Spiele |
| `20260602120000_milestone20_bewertungen.sql` | Ergebnis, Zuschauer, Bewertungen |
| `20260602140000_bericht_bilder.sql` | separate Berichtbilder-Galerie |
| `20260602160000_futbology_manual.sql` | manuelle Spiele und `source` |
| `20260609120000_fix_bericht_bilder_fkey.sql` | Berichtbilder direkt an `fahrten` binden |

Die Migration `20260609120000_fix_bericht_bilder_fkey.sql` wurde am 14. Juli 2026 laut Nutzer im Remote-Supabase-Projekt erfolgreich ausgeführt. Der Status der übrigen Remote-Migrationen muss bei Bedarf weiterhin separat geprüft werden.

---

## Fahrt-Dashboard — zentrale Logik

1. `getRouteEndpoints()` ermittelt Treffpunkt und Ziel. Ein gewählter Parkplatz ersetzt das Stadion als Routenziel.
2. `useRoutePlan()` berechnet Strecke und Dauer über Google Directions.
3. Abfahrtszeit = Anpfiff − Routendauer − 90/120 Minuten Puffer.
4. Das Abstimmungsergebnis überschreibt die berechnete Empfehlung als effektive Abfahrt.
5. Bei hinterlegter Wohnadresse wird zusätzlich Zuhause → Treffpunkt berechnet.
6. Die Routendistanz wird für Statistiken auf `fahrten.route_distance_meters` gespeichert.
7. Im selben Dashboard liegen Mitfahrer, Mitbringliste, Parkplatz, Bericht, Bewertungen und Bildergalerie.

---

## Verifizierter Milestone-Stand

Die Nummerierung wurde im Lauf des Projekts mehrfach neu belegt. Der alte Projektkontext führte M11–M15 noch als Bericht, Bewertungen, Archiv, Erinnerungen und Gruppenverwaltung. Im aktuellen Code stehen dieselben Nummern teilweise für andere Features. Maßgeblich ist deshalb folgende aktuelle Zuordnung:

| Bereich | Status | Verifizierter Inhalt |
|---|---|---|
| M1–M10 | fertig im Code | Basis, Dashboard, Social, Parkplatz, Kalender, PWA-Grundlage, Spieltag, Statistik |
| M11 | fertig im Code | Spieltagsbericht mit Tiptap |
| M12 | fertig im Code | Futbology-Integration |
| M13 | fertig im Code | Theme-System mit fünf Themes |
| M14 | fertig im Code | Toast-Notifications |
| M15 | fertig im Code | Mobile Bottom-Navigation |
| M16 | fertig im Code | Theme-Konsistenz über CSS-Variablen |
| M17 | fertig im Code | Karten-, Skeleton- und Layout-Polish |
| M18 | fertig im Code | Auth-Animation und Login-Polish |
| M19 | fertig im Code | Theme-Texturen |
| M20 | fertig im Code | Ergebnis, Zuschauer und drei Spieltagsbewertungen |
| M21 | fertig im Code | Vereinsdatenbank und Spielplan-Import |
| M22 | fertig im Code | Bericht-Polish, Bildergalerie, Saison-DOCX |
| M23 | fertig im Code | Wappen in Spieleliste, manuelles Spiel |
| M24 | fertig im Code | Eigenständige Fahrt-Fotogalerie mit Spotlight-Lightbox |
| Foto-Rückblicke | fertig im Code | Eigene Archivroute, Fahrtgruppen, Suche, Datumsfilter und gemeinsame Lightbox |
| Redesign | fertig im Code | „Matchday Editorial“ mit Archivo, Glasflächen und GSAP |

Nicht gleichbedeutend mit „fertig deployed“: Repository-Code und Build sind vorhanden; Remote-Datenbank und Produktion müssen separat geprüft werden.

---

## Offene Roadmap

### M25 — Zwischenstopps / Reiseplan

Sortierbare Stopps mit Name, Adresse, Zeitversatz und Notiz. Noch nicht implementiert.

### M26 — Stadioninfos

Strukturiertes Freitextfeld für Gästeblock, Catering, ÖPNV und Hinweise. Noch nicht implementiert.

### M27 — belastbarer PWA-Offline-Modus

Workbox beziehungsweise `vite-plugin-pwa`, gezielte Cache-Strategien und Offline-Fallback. Die aktuelle PWA-Grundlage cached nur den App-Shell und bereits geladene Same-Origin-Ressourcen; Supabase-Daten der Fahrt sind nicht offline verfügbar.

### M28 — manuelle Fahrten vollständig absichern

Berichte und Bewertungen für jede manuell angelegte Fahrt zuverlässig automatisch anlegen. Der aktuelle API-Layer kann Berichte einfügen oder aktualisieren; der End-to-End-Fall bleibt laut Roadmap zu prüfen.

### M29 — Aktivitätsverlauf

Timeline für Zu-/Absagen sowie Änderungen an Parkplatz, Treffpunkt und Bericht. Noch nicht implementiert.

### Backlog

- Fahnenmeer-Theme bei ausreichend hochauflösendem Asset
- API-Football durch OpenLigaDB ersetzen; der Free-Plan deckt aktuelle Saisons nicht zuverlässig ab
- Push-Notifications via Supabase Realtime + Web Push
- Echte Gruppen, Einladungen und Rollen/Berechtigungen aus der älteren Roadmap
- Vollständiges Saisonarchiv mit Berichten, Bewertungen und Statistiken; die neue Rückblicke-Route deckt zunächst das gemeinsame Fotoarchiv ab
- Discord-Integration vielleicht später: zunächst ausgehende Webhook-Benachrichtigungen; keine vollständige Chat-Synchronisierung

---

## Design-System

- Standardfarben: Dunkelblau `#003264`, Mittelblau `#005BAC`, Weiß
- Fünf Theme-Varianten über CSS Custom Properties und `ThemeContext`
- Body-Schrift: Outfit; Display/Zahlen: Archivo Variable
- Dunkle opake Glas-Karten, Akzentlinie, dezentes Noise und optionale Theme-Texturen
- Framer Motion für Auth-/UI-Übergänge; GSAP für Count-up und Stagger-Reveals
- Login/Registrierung: kein großer Hintergrundschriftzug mehr; kleine, zurückhaltende Hertha-Embleme und ein Lichtfeld reagieren auf feine Mausbewegungen. Touch und `prefers-reduced-motion` bleiben ruhig.

---

## Wichtige Dateien

```text
src/App.tsx                          Routing und Provider
src/index.css                       Themes, Typografie, Oberflächen, Auth-Hintergrund
src/components/AppShell.tsx         Desktop-Shell und Header
src/components/BottomNav.tsx        Mobile Navigation
src/components/AuthLayout.tsx       Login-/Register-Rahmen und Pointer-Reaktion
src/pages/HomePage.tsx              Fahrten, Spiele, Kalender, Statistik
src/pages/SpieltagPage.tsx          Spieltag-Kurzansicht
src/pages/FahrtAnlegenPage.tsx      Fahrt und Spielplan-Import
src/pages/FahrtDashboardPage.tsx    zentrale Fahrtlogik
src/pages/RueckblickePage.tsx       chronologisches Fotoarchiv + Filter
src/pages/ProfilPage.tsx             Profil, Themes, Import und Export
src/components/SpieltagsberichtSection.tsx
src/components/FahrtFotoGalerie.tsx  eigenständige Fotogalerie + Spotlight
src/lib/fotoArchivApi.ts             Fahrten und Fotos für Rückblicke laden
src/lib/photoLightbox.ts             gemeinsam genutzte Spotlight-Kapselung
src/components/SaisonExport.tsx
src/components/SpielplanImport.tsx
src/hooks/                           Daten-/UI-Hooks
src/lib/                             Supabase-APIs und Fachlogik
src/data/vereine.ts                  Vereinsdatenbank
supabase/migrations/                 Datenbankschema und RLS
public/sw.js                         aktuelle PWA-Grundlage
```

---

## Bekannte Risiken und technische Schulden

- Die letzte lokale Verifikation ergab 15 bestandene Tests in 5 Dateien und einen erfolgreichen Produktions-Build.
- Der Haupt-JavaScript-Chunk liegt bei rund 1,61 MB minifiziert; Vite warnt vor fehlendem Code-Splitting.
- Tests decken hauptsächlich reine Fachlogik ab; Komponenten-, Auth-, Supabase- und End-to-End-Tests fehlen.
- `DirectionsService` ist veraltet und sollte mittelfristig migriert werden.
- `VITE_API_FOOTBALL_KEY` wird clientseitig ausgeliefert und der Free-Plan ist saisonal eingeschränkt.
- Spotlight.js ist sehr klein und gekapselt, wird upstream aber seit 2021 nicht mehr aktiv gepflegt; die Lightbox bleibt deshalb austauschbar.
- Die Fahrtfotos nutzen vorerst den öffentlichen Legacy-Bucket `bericht-images`. Falls Bilder nur für Fahrtteilnehmer sichtbar sein sollen, sollte er später durch einen privaten Bucket mit signierten URLs ersetzt werden.
- `npm audit` meldet eine hohe `ws`-Lücke im bestehenden Tiptap/`happy-dom`-Abhängigkeitsbaum; Spotlight selbst bringt keine weiteren Pakete mit.
- `README.md` und Teile von `CLAUDE.md` enthalten weiterhin ältere oder widersprüchliche Statusangaben; diese Datei ist der aktuell verifizierte Überblick.
- Keine eigene 404-Seite, keine Gruppenisolierung und keine Rollenverwaltung.
- Remote-Migrationen und produktiver Deployment-Status müssen außerhalb des Repositories geprüft werden.

---

## Sinnvolle nächste Schritte

1. Fahrtgalerie und Rückblicke mit echten Bildern auf Desktop, Mobile und in allen fünf Themes abnehmen.
2. Entscheiden, ob Fahrtfotos künftig nur für Fahrtteilnehmer sichtbar sein sollen; dafür wäre privater Storage nötig.
3. Danach M25 (Zwischenstopps) oder zuerst die technische Stabilisierung mit Code-Splitting und breiteren Tests angehen.

---

*Zuletzt gegen den Code geprüft und aktualisiert: 14. Juli 2026.*

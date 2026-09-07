-- Bisher wurde nur die einfache Strecke gespeichert; die Auswärtsstatistik
-- braucht Hin- und Rückfahrt. Einmaliger Backfill der bereits berechneten Fahrten.
-- Läuft parallel zum Code-Fix in FahrtDashboardPage.tsx (routeDistanceMetersRoundtrip).
update public.fahrten
set route_distance_meters = route_distance_meters * 2
where route_distance_meters is not null
  and typ = 'auswaerts';

import { useState } from 'react'
import type { FormEvent } from 'react'
import { DashboardSection } from './DashboardSection'
import { useParkingSearch } from '../hooks/useParkingSearch'
import type { useParkplaetze } from '../hooks/useParkplaetze'
import { ParkingMeta } from './ParkingMeta'
import { buildGoogleMapsPlaceUrl } from '../lib/departureCalc'
import type { Parkplatz, ParkingSuggestion } from '../types/parking'

type ParkplatzSectionProps = {
  stadion: string
  currentUserId: string | undefined
  parkplaetze: ReturnType<typeof useParkplaetze>
}

function ParkplatzRow({
  entry,
  busy,
  onChoose,
  onClearSelection,
  onRemove,
}: {
  entry: Parkplatz
  busy: boolean
  onChoose: (id: string) => void
  onClearSelection: () => void
  onRemove: (id: string) => void
}) {
  const mapsUrl = buildGoogleMapsPlaceUrl(entry.address, entry.place_id, entry.lat, entry.lng)

  return (
    <li
      className={`rounded-lg border px-3 py-2 transition ${
        entry.is_selected
          ? 'border-card-accent bg-card-accent/10 ring-2 ring-card-accent/25'
          : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-slate-900">{entry.name}</p>
            {entry.is_selected ? (
              <span className="rounded-full bg-card-accent px-2 py-0.5 text-xs font-semibold text-white">
                Routenziel
              </span>
            ) : null}
            {entry.source === 'google' ? (
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                Google
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">{entry.address}</p>
          <ParkingMeta distanceMeters={entry.distance_meters} costKind={entry.cost_kind} />
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-xs font-medium text-card-accent hover:underline"
          >
            In Google Maps öffnen
          </a>
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          {entry.is_selected ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onClearSelection()}
              className="rounded-lg border border-card-accent bg-white px-2.5 py-1 text-xs font-semibold text-card-accent transition hover:bg-card-accent/5 disabled:opacity-60"
            >
              Abwählen
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => void onChoose(entry.id)}
              className="rounded-lg bg-card-accent px-2.5 py-1 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              Wählen
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => void onRemove(entry.id)}
            className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-60"
          >
            Entfernen
          </button>
        </div>
      </div>
    </li>
  )
}

function SuggestionRow({
  suggestion,
  alreadyAdded,
  busy,
  onAdd,
}: {
  suggestion: ParkingSuggestion
  alreadyAdded: boolean
  busy: boolean
  onAdd: (suggestion: ParkingSuggestion) => void
}) {
  return (
    <li className="flex items-start justify-between gap-3 rounded-lg border border-dashed border-slate-200 bg-white px-3 py-2">
      <div className="min-w-0">
        <p className="font-medium text-slate-900">{suggestion.name}</p>
        <p className="text-xs text-slate-500">{suggestion.address}</p>
        <ParkingMeta distanceMeters={suggestion.distanceMeters} costKind={suggestion.costKind} />
      </div>
      <button
        type="button"
        disabled={busy || alreadyAdded}
        onClick={() => void onAdd(suggestion)}
        className="shrink-0 rounded-lg border border-card-accent px-2.5 py-1 text-xs font-semibold text-card-accent transition hover:bg-card-accent/10 disabled:opacity-50"
      >
        {alreadyAdded ? 'In Liste' : 'Hinzufügen'}
      </button>
    </li>
  )
}

export function ParkplatzSection({ stadion, currentUserId, parkplaetze }: ParkplatzSectionProps) {
  const {
    entries,
    loading,
    error,
    actionError,
    busy,
    addManual,
    addFromSuggestion,
    choose,
    clearSelection,
    remove,
  } = parkplaetze
  const { state: searchState, search, reset } = useParkingSearch(stadion)

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')

  const selected = entries.find((entry) => entry.is_selected)
  const sortedEntries = [...entries].sort((a, b) => {
    if (a.is_selected !== b.is_selected) return a.is_selected ? -1 : 1
    return a.created_at.localeCompare(b.created_at)
  })
  const placeIdsInList = new Set(entries.map((entry) => entry.place_id).filter(Boolean))

  async function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!currentUserId) return

    const added = await addManual(currentUserId, name, address)
    if (added) {
      setName('')
      setAddress('')
    }
  }

  async function handleAddSuggestion(suggestion: ParkingSuggestion) {
    if (!currentUserId) return
    await addFromSuggestion(currentUserId, suggestion)
  }

  return (
    <DashboardSection
      title="Parkplatz"
      badge={loading ? undefined : selected ? 'Gewählt' : entries.length > 0 ? `${entries.length}` : undefined}
      compact
    >
      {loading ? <p className="text-sm text-slate-500">Wird geladen …</p> : null}

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <>
          {entries.length > 0 && !selected ? (
            <p className="mb-3 text-sm text-slate-500">
              Einen Parkplatz wählen — er wird oben markiert und für die Route genutzt.
            </p>
          ) : null}

          {entries.length > 0 ? (
            <ul className="space-y-2">
              {sortedEntries.map((entry) => (
                <ParkplatzRow
                  key={entry.id}
                  entry={entry}
                  busy={busy}
                  onChoose={choose}
                  onClearSelection={() => void clearSelection()}
                  onRemove={remove}
                />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Noch kein Parkplatz hinterlegt.</p>
          )}

          {currentUserId ? (
            <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs font-medium text-slate-500">In der Nähe des Stadions</p>
                <button
                  type="button"
                  disabled={busy || searchState.status === 'loading'}
                  onClick={() => void search()}
                  className="mt-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-200 disabled:opacity-60"
                >
                  {searchState.status === 'loading'
                    ? 'Suche läuft …'
                    : 'Parkplätze in der Nähe suchen'}
                </button>
                <p className="mt-1 text-xs text-slate-400">
                  Benötigt „Places API (New)“ (nicht die ältere „Places API“).
                </p>
              </div>

              {searchState.status === 'error' ? (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900" role="alert">
                  {searchState.message}
                </p>
              ) : null}

              {searchState.status === 'ready' ? (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-slate-500">Vorschläge</p>
                    <button
                      type="button"
                      onClick={reset}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800"
                    >
                      Schließen
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {searchState.suggestions.map((suggestion) => (
                      <SuggestionRow
                        key={suggestion.placeId ?? `${suggestion.name}-${suggestion.address}`}
                        suggestion={suggestion}
                        alreadyAdded={
                          suggestion.placeId != null && placeIdsInList.has(suggestion.placeId)
                        }
                        busy={busy}
                        onAdd={handleAddSuggestion}
                      />
                    ))}
                  </ul>
                </div>
              ) : null}

              <form onSubmit={(event) => void handleManualSubmit(event)} className="space-y-2">
                <p className="text-xs font-medium text-slate-500">Manuell hinzufügen</p>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Name, z. B. P+R Stadion"
                  maxLength={120}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-card-accent focus:outline-none focus:ring-2 focus:ring-card-accent/30"
                />
                <input
                  type="text"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Adresse"
                  maxLength={200}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-card-accent focus:outline-none focus:ring-2 focus:ring-card-accent/30"
                />
                <button
                  type="submit"
                  disabled={busy || !name.trim() || !address.trim()}
                  className="rounded-lg bg-card-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {busy ? '…' : 'Parkplatz hinzufügen'}
                </button>
              </form>
            </div>
          ) : null}

          {actionError ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {actionError}
            </p>
          ) : null}
        </>
      ) : null}
    </DashboardSection>
  )
}

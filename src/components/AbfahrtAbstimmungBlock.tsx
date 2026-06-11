import { abfahrtSlotOptions, slotsMatch, summarizeAbfahrtSlots } from '../lib/abfahrtAbstimmung'
import { formatUhrzeit } from '../lib/fahrtFormat'
import type { AbfahrtAbstimmung, WinningAbfahrt } from '../types/abfahrt'

type AbfahrtAbstimmungBlockProps = {
  empfohleneAbfahrt: Date
  currentUserId: string | undefined
  votes: AbfahrtAbstimmung[]
  winning: WinningAbfahrt | null
  loading: boolean
  error: string | null
  actionError: string | null
  busy: boolean
  onVote: (slot: Date) => void
  hasMyVoteForSlot: (slot: Date) => boolean
}

export function AbfahrtAbstimmungBlock({
  empfohleneAbfahrt,
  currentUserId,
  votes,
  winning,
  loading,
  error,
  actionError,
  busy,
  onVote,
  hasMyVoteForSlot,
}: AbfahrtAbstimmungBlockProps) {
  const slots = abfahrtSlotOptions(empfohleneAbfahrt)
  const summaries = summarizeAbfahrtSlots(votes)

  function countForSlot(slot: Date): number {
    return summaries.find((entry) => slotsMatch(entry.abfahrtAt, slot))?.count ?? 0
  }

  return (
    <div className="mt-4 rounded-xl border border-shell-fg/15 bg-shell-fg/6 px-4 py-3">
      <p className="text-sm font-medium text-shell-fg/90">Abfahrtszeit abstimmen</p>
      <p className="mt-1 text-xs text-shell-fg/55">
        Berechnet: {formatUhrzeit(empfohleneAbfahrt)} Uhr — wähle eine Zeit in 15-Minuten-Schritten.
        Erneut tippen hebt deine Auswahl auf. Die Mehrheit erscheint in der Übersicht.
      </p>

      {loading ? <p className="mt-3 text-sm text-shell-fg/55">Stimmen werden geladen …</p> : null}

      {error ? (
        <p className="mt-3 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {slots.map((slot) => {
            const count = countForSlot(slot)
            const isMine = hasMyVoteForSlot(slot)
            const isWinning =
              winning !== null && slotsMatch(winning.time, slot) && count > 0

            return (
              <button
                key={slot.toISOString()}
                type="button"
                disabled={busy || !currentUserId}
                onClick={() => onVote(slot)}
                className={`flex min-w-[4.5rem] flex-col items-center rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                  isMine
                    ? 'bg-shell-cta-bg text-shell-cta-fg ring-2 ring-card-accent/40'
                    : isWinning
                      ? 'border-2 border-shell-cta-bg bg-shell-fg/8 text-shell-fg'
                      : 'border border-shell-fg/15 bg-shell-fg/8 text-shell-fg/90 hover:border-shell-cta-bg/50'
                }`}
              >
                <span>{formatUhrzeit(slot)}</span>
                <span
                  className={`text-xs font-medium ${
                    isMine ? 'text-shell-cta-fg/85' : 'text-shell-fg/55'
                  }`}
                >
                  {count === 1 ? '1 Stimme' : `${count} Stimmen`}
                </span>
              </button>
            )
          })}
        </div>
      ) : null}

      {!currentUserId ? (
        <p className="mt-2 text-xs text-shell-fg/55">Zum Abstimmen bitte anmelden.</p>
      ) : null}

      {actionError ? (
        <p className="mt-2 text-sm text-red-300" role="alert">
          {actionError}
        </p>
      ) : null}
    </div>
  )
}

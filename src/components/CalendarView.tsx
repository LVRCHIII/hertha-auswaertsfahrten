import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  WEEKDAY_LABELS,
  addMonths,
  buildCalendarMonth,
  fahrtenInMonth,
  groupFahrtenByDay,
  monthLabel,
  startOfMonth,
} from '../lib/calendar'
import { formatAnpfiff, formatSpielDatum, formatUhrzeit } from '../lib/fahrtFormat'
import { MatchupWappen } from './MatchupWappen'
import type { WinningAbfahrt } from '../types/abfahrt'
import type { Fahrt } from '../types/fahrt'

type CalendarViewProps = {
  fahrten: Fahrt[]
  abfahrtByFahrt?: Map<string, WinningAbfahrt>
}

export function CalendarView({ fahrten, abfahrtByFahrt }: CalendarViewProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()))

  const days = useMemo(() => buildCalendarMonth(visibleMonth), [visibleMonth])
  const fahrtenByDay = useMemo(() => groupFahrtenByDay(fahrten), [fahrten])
  const monthFahrten = useMemo(
    () => fahrtenInMonth(fahrten, visibleMonth),
    [fahrten, visibleMonth],
  )

  function goToToday() {
    setVisibleMonth(startOfMonth(new Date()))
  }

  return (
    <section className="glass-card rounded-3xl p-3 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display-wide text-[10px] text-shell-fg/40">Kalender</p>
          <h2 className="font-display mt-1 text-2xl capitalize text-shell-fg">
            {monthLabel(visibleMonth)}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
            className="rounded-lg border border-shell-fg/15 px-3 py-2 text-sm font-semibold text-shell-fg/70 transition hover:bg-shell-fg/10 active:scale-[0.95]"
            aria-label="Vorheriger Monat"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="rounded-lg bg-shell-cta-bg px-3 py-2 text-sm font-semibold text-shell-cta-fg transition hover:opacity-90 active:scale-[0.95]"
          >
            Heute
          </button>
          <button
            type="button"
            onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
            className="rounded-lg border border-shell-fg/15 px-3 py-2 text-sm font-semibold text-shell-fg/70 transition hover:bg-shell-fg/10 active:scale-[0.95]"
            aria-label="Nächster Monat"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-shell-fg/10 bg-shell-fg/10">
        {WEEKDAY_LABELS.map((weekday) => (
          <div
            key={weekday}
            className="font-display-wide bg-shell-bg/60 px-1 py-2 text-center text-[9px] text-shell-fg/40 sm:text-[10px]"
          >
            {weekday}
          </div>
        ))}

        {days.map((day) => {
          const dayFahrten = fahrtenByDay.get(day.key) ?? []

          return (
            <div
              key={day.key}
              className={`min-h-14 p-1 sm:min-h-20 sm:p-1.5 ${
                day.inCurrentMonth ? 'bg-shell-bg/40' : 'bg-shell-bg/70'
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <span
                  className={`font-score flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] sm:h-6 sm:min-w-6 sm:text-xs ${
                    day.isToday
                      ? 'bg-shell-cta-bg text-shell-cta-fg'
                      : day.inCurrentMonth
                        ? 'text-shell-fg/70'
                        : 'text-shell-fg/25'
                  }`}
                >
                  {day.dayOfMonth}
                </span>

                {dayFahrten.length > 0 ? (
                  <span className="font-score rounded-full bg-shell-cta-bg px-1.5 py-0.5 text-[10px] text-shell-cta-fg sm:text-xs">
                    {dayFahrten.length}
                  </span>
                ) : null}
              </div>

              {dayFahrten.length > 0 ? (
                <div className="mt-1.5 space-y-1">
                  {dayFahrten.slice(0, 2).map((fahrt) => (
                    <Link
                      key={fahrt.id}
                      to={`/fahrten/${fahrt.id}`}
                      className="flex justify-center rounded-lg bg-shell-fg/8 px-0.5 py-1 transition hover:bg-shell-fg/15"
                      aria-label={`${formatAnpfiff(fahrt.spiel_at)} ${fahrt.gegner}`}
                    >
                      <MatchupWappen gegner={fahrt.gegner} size="sm" istHeimspiel={fahrt.typ === 'heim'} />
                    </Link>
                  ))}
                  {dayFahrten.length > 2 ? (
                    <p className="font-score text-center text-[10px] text-shell-fg/60">
                      +{dayFahrten.length - 2}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="mt-5">
        <h3 className="font-display-wide text-[10px] text-shell-fg/40">
          Spiele im {monthLabel(visibleMonth)}
        </h3>
        {monthFahrten.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-shell-fg/15 px-4 py-6 text-center text-sm text-shell-fg/45">
            In diesem Monat sind keine Fahrten eingetragen.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {monthFahrten.map((fahrt) => {
              const abfahrt = abfahrtByFahrt?.get(fahrt.id)

              return (
                <li key={fahrt.id}>
                  <Link
                    to={`/fahrten/${fahrt.id}`}
                    className="block rounded-xl border border-shell-fg/10 bg-shell-fg/5 p-4 transition hover:-translate-y-px hover:bg-shell-fg/10 active:scale-[0.99]"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm text-shell-fg/50">
                          {formatSpielDatum(fahrt.spiel_at)} · {formatAnpfiff(fahrt.spiel_at)} Uhr
                        </p>
                        <p className="font-display mt-1 text-xl text-shell-fg">{fahrt.gegner}</p>
                        <p className="mt-0.5 text-sm text-shell-fg/45">{fahrt.stadion}</p>
                      </div>
                      {abfahrt ? (
                        <div className="rounded-lg bg-shell-cta-bg/15 px-3 py-2 text-sm font-semibold text-shell-fg">
                          Abfahrt <span className="font-score">{formatUhrzeit(abfahrt.time)}</span> Uhr
                        </div>
                      ) : null}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

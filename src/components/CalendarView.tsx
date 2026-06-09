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
    <section className="rounded-2xl bg-white p-3 text-slate-900 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Kalender
          </p>
          <h2 className="text-xl font-bold capitalize text-card-accent">
            {monthLabel(visibleMonth)}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            aria-label="Vorheriger Monat"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="rounded-lg bg-card-accent px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Heute
          </button>
          <button
            type="button"
            onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            aria-label="Nächster Monat"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
        {WEEKDAY_LABELS.map((weekday) => (
          <div
            key={weekday}
            className="bg-slate-50 px-1 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs"
          >
            {weekday}
          </div>
        ))}

        {days.map((day) => {
          const dayFahrten = fahrtenByDay.get(day.key) ?? []

          return (
            <div
              key={day.key}
              className={`min-h-14 bg-white p-1 sm:min-h-20 sm:p-1.5 ${
                day.inCurrentMonth ? '' : 'text-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold sm:h-6 sm:min-w-6 sm:text-xs ${
                    day.isToday
                      ? 'bg-card-accent text-white'
                      : day.inCurrentMonth
                        ? 'text-slate-600'
                        : 'text-slate-300'
                  }`}
                >
                  {day.dayOfMonth}
                </span>

                {dayFahrten.length > 0 ? (
                  <span className="rounded-full bg-card-accent px-1.5 py-0.5 text-[10px] font-bold text-white sm:text-xs">
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
                      className="flex justify-center rounded-lg bg-card-accent/5 px-0.5 py-1 transition hover:bg-card-accent/10"
                      aria-label={`${formatAnpfiff(fahrt.spiel_at)} ${fahrt.gegner}`}
                    >
                      <MatchupWappen gegner={fahrt.gegner} size="sm" />
                    </Link>
                  ))}
                  {dayFahrten.length > 2 ? (
                    <p className="text-center text-[10px] font-semibold text-card-accent">
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
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Spiele im {monthLabel(visibleMonth)}
        </h3>
        {monthFahrten.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
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
                    className="block rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-card-accent/50 hover:bg-white"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-500">
                          {formatSpielDatum(fahrt.spiel_at)} · {formatAnpfiff(fahrt.spiel_at)} Uhr
                        </p>
                        <p className="mt-1 text-lg font-bold text-card-accent">{fahrt.gegner}</p>
                        <p className="mt-0.5 text-sm text-slate-600">{fahrt.stadion}</p>
                      </div>
                      {abfahrt ? (
                        <div className="rounded-lg bg-card-accent/10 px-3 py-2 text-sm font-semibold text-card-accent">
                          Abfahrt {formatUhrzeit(abfahrt.time)} Uhr
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

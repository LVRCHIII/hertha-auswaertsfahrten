import { describe, expect, it } from 'vitest'
import type { FotoArchivFahrt } from './fotoArchivApi'
import { filterFotoArchivFahrten, localDateKey } from './fotoArchiv'

const fahrten: FotoArchivFahrt[] = [
  {
    id: 'schalke',
    gegner: 'FC Schalke 04',
    stadion: 'Veltins-Arena, Gelsenkirchen',
    spiel_at: '2026-08-15T18:30:00.000+02:00',
    typ: 'auswaerts',
    fotos: [],
  },
  {
    id: 'koeln',
    gegner: '1. FC Köln',
    stadion: 'RheinEnergieSTADION, Köln',
    spiel_at: '2025-11-02T13:30:00.000+01:00',
    typ: 'auswaerts',
    fotos: [],
  },
]

describe('Fotoarchiv-Filter', () => {
  it('findet Gegner und Stadion unabhängig von Großschreibung und Umlauten', () => {
    expect(filterFotoArchivFahrten(fahrten, { query: 'koln', from: '', to: '' })).toEqual([
      fahrten[1],
    ])
    expect(filterFotoArchivFahrten(fahrten, { query: 'VELTINS', from: '', to: '' })).toEqual([
      fahrten[0],
    ])
  })

  it('findet deutsche und ISO-Datumsangaben', () => {
    expect(filterFotoArchivFahrten(fahrten, { query: '15.08.2026', from: '', to: '' })).toEqual([
      fahrten[0],
    ])
    expect(filterFotoArchivFahrten(fahrten, { query: '2025-11', from: '', to: '' })).toEqual([
      fahrten[1],
    ])
  })

  it('filtert den Spieltag einschließlich der Datumsgrenzen', () => {
    expect(
      filterFotoArchivFahrten(fahrten, {
        query: '',
        from: '2025-11-02',
        to: '2025-11-02',
      }),
    ).toEqual([fahrten[1]])
  })

  it('kombiniert mehrere Suchbegriffe', () => {
    expect(filterFotoArchivFahrten(fahrten, { query: 'Schalke Gelsen', from: '', to: '' })).toEqual([
      fahrten[0],
    ])
  })
})

describe('localDateKey', () => {
  it('liefert ein sortierbares lokales Datum', () => {
    expect(localDateKey('2026-08-15T18:30:00.000+02:00')).toBe('2026-08-15')
  })
})

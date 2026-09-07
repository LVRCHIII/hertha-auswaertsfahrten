import { describe, expect, it } from 'vitest'
import { resolveGegnerStadion, resolveGegnerWappen } from './vereine'

describe('Vereinsauflösung', () => {
  it('bevorzugt einen normalisierten vollständigen Namen vor kurzen Teiltreffern', () => {
    expect(resolveGegnerStadion('1.FC Köln')).toBe('RheinEnergieSTADION, Köln')
    expect(resolveGegnerWappen('1.FC Köln')).toBe('/wappen/1-fc-koeln.png')
  })

  it('verwendet bei Namenszusätzen den längsten passenden Vereinsnamen', () => {
    expect(resolveGegnerStadion('Eintracht Braunschweig e.V.')).toBe(
      'Eintracht-Stadion, Braunschweig',
    )
    expect(resolveGegnerWappen('Eintracht Braunschweig e.V.')).toContain(
      '/wappen/braunschweig.png',
    )
  })
})

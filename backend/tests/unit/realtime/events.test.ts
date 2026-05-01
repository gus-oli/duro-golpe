import { describe, expect, it } from 'vitest'
import { mapApiFootballStatus } from '../../../src/realtime/events.js'

describe('mapApiFootballStatus', () => {
  it('maps supported live webhook codes to LIVE', () => {
    expect(mapApiFootballStatus('1H')).toBe('LIVE')
    expect(mapApiFootballStatus('HT')).toBe('LIVE')
    expect(mapApiFootballStatus('2H')).toBe('LIVE')
  })

  it('maps supported finished webhook codes to FINISHED', () => {
    expect(mapApiFootballStatus('FT')).toBe('FINISHED')
    expect(mapApiFootballStatus('AET')).toBe('FINISHED')
    expect(mapApiFootballStatus('PEN')).toBe('FINISHED')
  })

  it('ignores unsupported or missing codes', () => {
    expect(mapApiFootballStatus(undefined)).toBeNull()
    expect(mapApiFootballStatus('NS')).toBeNull()
    expect(mapApiFootballStatus('TBD')).toBeNull()
  })
})

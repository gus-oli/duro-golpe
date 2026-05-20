import { describe, expect, it } from 'vitest'
import { mapApiFootballStatus, mapFootballDataStatus } from '../../../src/realtime/events.js'

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

describe('mapFootballDataStatus', () => {
  it('maps scheduled provider states to SCHEDULED', () => {
    expect(mapFootballDataStatus('SCHEDULED')).toBe('SCHEDULED')
    expect(mapFootballDataStatus('TIMED')).toBe('SCHEDULED')
  })

  it('maps in-play provider states to LIVE', () => {
    expect(mapFootballDataStatus('IN_PLAY')).toBe('LIVE')
    expect(mapFootballDataStatus('PAUSED')).toBe('LIVE')
  })

  it('maps finished provider states to FINISHED', () => {
    expect(mapFootballDataStatus('FINISHED')).toBe('FINISHED')
  })

  it('ignores unsupported or missing statuses', () => {
    expect(mapFootballDataStatus(undefined)).toBeNull()
    expect(mapFootballDataStatus('POSTPONED')).toBeNull()
  })
})

import { describe, expect, it } from 'vitest'
import { validateSelectionCardinality } from '../../../src/outrights/outright-utils.js'

describe('validateSelectionCardinality', () => {
  it('accepts one selection for single-pick markets', () => {
    expect(validateSelectionCardinality(['BRA'], 1, 1)).toBe(true)
  })

  it('rejects multiple selections for single-pick markets', () => {
    expect(validateSelectionCardinality(['BRA', 'ARG'], 1, 1)).toBe(false)
  })

  it('requires exactly two unique selections for Finalistas', () => {
    expect(validateSelectionCardinality(['BRA', 'ARG'], 2, 2)).toBe(true)
    expect(validateSelectionCardinality(['BRA'], 2, 2)).toBe(false)
    expect(validateSelectionCardinality(['BRA', 'BRA'], 2, 2)).toBe(false)
    expect(validateSelectionCardinality(['BRA', 'ARG', 'FRA'], 2, 2)).toBe(false)
  })
})

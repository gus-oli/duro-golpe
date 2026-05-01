import { describe, it, expect } from 'vitest'
import { validateFinalistsPrediction } from '../../../src/outrights/outright-utils.js'

describe('validateFinalistsPrediction', () => {
  it('returns false when only one finalist is correct', () => {
    expect(validateFinalistsPrediction(['BRA', 'FRA'], ['BRA', 'ARG'])).toBe(false)
  })

  it('returns true when both finalists are correct (same order)', () => {
    expect(validateFinalistsPrediction(['BRA', 'FRA'], ['BRA', 'FRA'])).toBe(true)
  })

  it('returns true when both finalists are correct (different order)', () => {
    expect(validateFinalistsPrediction(['FRA', 'BRA'], ['BRA', 'FRA'])).toBe(true)
  })

  it('returns false when neither finalist is correct', () => {
    expect(validateFinalistsPrediction(['ARG', 'ENG'], ['BRA', 'FRA'])).toBe(false)
  })

  it('returns false when predicted array has wrong length (< 2)', () => {
    expect(validateFinalistsPrediction(['BRA'], ['BRA', 'FRA'])).toBe(false)
  })

  it('returns false when actual array has wrong length (< 2)', () => {
    expect(validateFinalistsPrediction(['BRA', 'FRA'], ['BRA'])).toBe(false)
  })
})

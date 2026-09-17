import { describe, it, expect } from 'vitest'
import { isExercise, isStepList } from '../../scripts/lib/catalog.mjs'
import exercises from '../../src/data/exercises.json'

describe('isExercise', () => {
  it('accepts what the sync actually writes', () => {
    expect(exercises.every(isExercise)).toBe(true)
  })

  it('rejects a payload that changed shape upstream', () => {
    const bent = [
      null,
      'Pushups',
      {},
      { id: 42, name: 'Pushups', instructions: ['Go down.'] },
      { id: '', name: 'Pushups', instructions: ['Go down.'] },
      { id: 'Pushups', instructions: ['Go down.'] },
      { id: 'Pushups', name: 'Pushups' },
      { id: 'Pushups', name: 'Pushups', instructions: 'Go down.' },
      { id: 'Pushups', name: 'Pushups', instructions: [{ step: 'Go down.' }] },
    ]
    expect(bent.filter(isExercise)).toEqual([])
  })

  it('accepts an entry with no steps, which the fallback fills in', () => {
    expect(isExercise({ id: 'a', name: 'A', instructions: [] })).toBe(true)
  })
})

describe('isStepList', () => {
  it('wants a non-empty list of non-blank strings', () => {
    expect(isStepList(['Go down.', 'Push up.'])).toBe(true)
    expect(isStepList([])).toBe(false)
    expect(isStepList(['   '])).toBe(false)
    expect(isStepList(['Go down.', 2])).toBe(false)
    expect(isStepList('Go down.')).toBe(false)
    expect(isStepList(undefined)).toBe(false)
  })
})

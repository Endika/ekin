import { describe, it, expect, beforeEach } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import {
  addSession,
  listSessions,
  deleteSession,
} from '../../src/data/sessions-repo'
import type { Session } from '../../src/domain/types'

const mk = (id: string, startedAt: number): Session => ({
  id,
  workoutId: 'w',
  workoutName: 'W',
  startedAt,
  endedAt: startedAt + 600,
  durationSeconds: 600,
  logs: [],
})

beforeEach(() => {
  // Fresh IDBFactory per test: a clean store with no leaked open
  // connections, so isolation is deterministic (no blocked deletes).
  globalThis.indexedDB = new IDBFactory()
})

describe('sessions-repo', () => {
  it('stores sessions and lists newest first', async () => {
    await addSession(mk('s1', 1000))
    await addSession(mk('s2', 3000))
    expect((await listSessions()).map((s) => s.id)).toEqual(['s2', 's1'])
  })

  it('deletes a session by id, leaving the rest', async () => {
    await addSession(mk('s1', 1000))
    await addSession(mk('s2', 3000))
    await deleteSession('s1')
    expect((await listSessions()).map((s) => s.id)).toEqual(['s2'])
  })

  it('deleting a missing id is a no-op', async () => {
    await addSession(mk('s1', 1000))
    await deleteSession('nope')
    expect((await listSessions()).map((s) => s.id)).toEqual(['s1'])
  })
})

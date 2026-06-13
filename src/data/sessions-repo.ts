import { openEkinDb } from './db'
import type { Session } from '../domain/types'

export async function addSession(s: Session): Promise<void> {
  const db = await openEkinDb()
  await db.put('sessions', s)
}

export async function listSessions(): Promise<Session[]> {
  const db = await openEkinDb()
  const all = (await db.getAll('sessions')) as Session[]
  return all.sort((a, b) => b.startedAt - a.startedAt)
}

export async function deleteSession(id: string): Promise<void> {
  const db = await openEkinDb()
  await db.delete('sessions', id)
}

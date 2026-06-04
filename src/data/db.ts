import { openDB, type IDBPDatabase } from 'idb'

export function openEkinDb(): Promise<IDBPDatabase> {
  return openDB('ekin', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('workouts'))
        db.createObjectStore('workouts', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('sessions')) {
        const s = db.createObjectStore('sessions', { keyPath: 'id' })
        s.createIndex('byStartedAt', 'startedAt')
      }
    },
  })
}

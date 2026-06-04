let sentinel: WakeLockSentinel | null = null

export async function requestWakeLock(): Promise<void> {
  try {
    if ('wakeLock' in navigator) {
      sentinel = await navigator.wakeLock.request('screen')
    }
  } catch {
    sentinel = null
  }
}

export async function releaseWakeLock(): Promise<void> {
  try {
    await sentinel?.release()
  } finally {
    sentinel = null
  }
}

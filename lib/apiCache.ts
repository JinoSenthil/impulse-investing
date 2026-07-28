const cache = new Map<string, { data: unknown; expiresAt: number }>()

export function clearApiCache(key?: string) {
  if (key) {
    cache.delete(key)
    return
  }
  cache.clear()
}

export async function withApiCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 5 * 60 * 1000
): Promise<T> {
  const entry = cache.get(key)
  if (entry && entry.expiresAt > Date.now()) {
    return entry.data as T
  }

  const data = await fetcher()
  cache.set(key, { data, expiresAt: Date.now() + ttlMs })
  return data
}

// utils/queryCache.js  （缓存单例不变）
export const queryCache = new Map()

export function getCache(key) {
  return queryCache.get(JSON.stringify(key)) ?? null
}

export function setCache(key, data, staleTime) {
  queryCache.set(JSON.stringify(key), {
    data,
    timestamp: Date.now(),
    staleTime
  })
}

export function invalidateCache(key) {
  queryCache.delete(JSON.stringify(key))
}

export function isStale(key) {
  const cached = queryCache.get(JSON.stringify(key))
  if (!cached) return true
  return Date.now() - cached.timestamp > cached.staleTime
}
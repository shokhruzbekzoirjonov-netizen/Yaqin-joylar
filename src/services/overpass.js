import { CATEGORIES, getCategory } from '../data/categories'
import { cacheGet, cacheSet, cacheKey, geoKey, withDistance } from '../utils/cache'

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]

export async function searchOverpass(center, radius, categoryIds, signal, onBatch) {
  const key = cacheKey('o', geoKey(center), radius, [...categoryIds].sort().join(','))
  const hit = cacheGet(key)
  if (hit) return onBatch(withDistance(hit, center).filter(p => p.distance <= radius))

  const [lat, lon] = center
  const dLat = radius / 111320, dLon = radius / (111320 * Math.cos((lat * Math.PI) / 180))
  const bbox = `${lat - dLat},${lon - dLon},${lat + dLat},${lon + dLon}` // bbox "around"dan ancha tez
  const parts = CATEGORIES.filter(c => categoryIds.includes(c.id))
    .flatMap(c => c.sel.map(s => `nw${s}(${bbox});`))
  const body = 'data=' + encodeURIComponent(`[out:json][timeout:10];(${parts.join('')});out center 60 qt;`)

  // Barcha mirrorlarga bir vaqtda so'rov: eng tezi yutadi, qolganlari bekor qilinadi
  const race = new AbortController()
  signal.addEventListener('abort', () => race.abort())
  let json
  try {
    json = await Promise.any(ENDPOINTS.map(async url => {
      const res = await fetch(url, { method: 'POST', body, signal: race.signal,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    }))
  } catch {
    throw new Error("Ma'lumotlarni yuklab bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.")
  } finally { race.abort() }

  const list = json.elements.map(el => {
    const la = el.lat ?? el.center?.lat, lo = el.lon ?? el.center?.lon
    if (la == null) return null
    const t = el.tags || {}, cat = getCategory(t)
    return { id: `${el.type}-${el.id}`, lat: la, lon: lo, category: cat,
      name: t.name || t['name:uz'] || t['name:ru'] || cat.label,
      address: [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' '),
      hours: t.opening_hours, hoursChecked: true, image: t.image, rating: t.stars }
  }).filter(Boolean)
  cacheSet(key, list)
  onBatch(withDistance(list, center).filter(p => p.distance <= radius))
}

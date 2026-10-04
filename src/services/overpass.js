import { CATEGORIES, getCategory } from '../data/categories'
import { distanceMeters } from '../utils/geo'

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

export async function searchOverpass(center, radius, categoryIds, signal) {
  const [lat, lon] = center
  const parts = CATEGORIES.filter(c => categoryIds.includes(c.id))
    .flatMap(c => c.sel.map(s => `nwr${s}(around:${radius},${lat},${lon});`))
  const body = 'data=' + encodeURIComponent(`[out:json][timeout:25];(${parts.join('')});out center 150;`)

  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, { method: 'POST', body, signal,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { elements } = await res.json()
      return elements.map(el => {
        const la = el.lat ?? el.center?.lat, lo = el.lon ?? el.center?.lon
        if (la == null) return null
        const t = el.tags || {}, cat = getCategory(t)
        return {
          id: `${el.type}-${el.id}`, lat: la, lon: lo, category: cat,
          name: t.name || t['name:uz'] || t['name:ru'] || cat.label,
          address: [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' '),
          hours: t.opening_hours, image: t.image, rating: t.stars,
          distance: distanceMeters(center, [la, lo]),
        }
      }).filter(Boolean).sort((a, b) => a.distance - b.distance)
    } catch (e) {
      if (e.name === 'AbortError') return []
    }
  }
  throw new Error("Ma'lumotlarni yuklab bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.")
}

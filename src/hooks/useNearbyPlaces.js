import { useEffect, useState, useCallback } from 'react'
import { GOOGLE_KEY, searchGoogle, fetchHours } from '../services/google'
import { searchOverpass } from '../services/overpass'

// Kalit bo'lsa Google Places, bo'lmasa Overpass (OSM)
export const PROVIDER = GOOGLE_KEY ? 'google' : 'osm'
const search = GOOGLE_KEY ? searchGoogle : searchOverpass
if (!GOOGLE_KEY) console.warn('VITE_GOOGLE_MAPS_API_KEY topilmadi: .env faylini tekshiring va dev serverni qayta ishga tushiring.')

export function useNearbyPlaces(center, radius, categoryIds) {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(false)          // birinchi natijagacha
  const [loadingMore, setLoadingMore] = useState(false)  // qolgan kategoriyalar
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)
  const refetch = useCallback(() => setTick(t => t + 1), [])
  const key = categoryIds.join(',')

  useEffect(() => {
    if (!center || !categoryIds.length) { setPlaces([]); return }
    const ctrl = new AbortController(), { signal } = ctrl
    const acc = new Map()
    setError(null); setLoading(true)

    // 300 ms debounce: tez-tez bosilganda ortiqcha so'rov ketmaydi
    const timer = setTimeout(() => {
      setLoadingMore(true)
      const onBatch = list => {
        if (signal.aborted) return
        list.forEach(p => acc.set(p.id, p))
        setPlaces([...acc.values()].sort((a, b) => a.distance - b.distance))
        setLoading(false) // skeleton darrov yo'qoladi, qolganlari keyin qo'shiladi
      }
      search(center, radius, categoryIds, signal, onBatch)
        .then(() => { if (!signal.aborted && !acc.size) setPlaces([]) })
        .catch(e => { if (!signal.aborted) setError(e.message) })
        .finally(() => { if (!signal.aborted) { setLoading(false); setLoadingMore(false) } })
    }, 300)

    return () => { clearTimeout(timer); ctrl.abort() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center?.[0], center?.[1], radius, key, tick])

  // Google: ish vaqtini joy tanlanganda olamiz
  const enrich = useCallback(async id => {
    if (PROVIDER !== 'google') return
    const target = places.find(p => p.id === id)
    if (!target || target.hoursChecked) return
    const hours = await fetchHours(id).catch(() => null)
    setPlaces(ps => ps.map(p => (p.id === id ? { ...p, hours, hoursChecked: true } : p)))
  }, [places])

  return { places, loading, loadingMore, error, refetch, enrich }
}

import { useEffect, useState, useCallback } from 'react'
import { GOOGLE_KEY, searchGoogle } from '../services/google'
import { searchOverpass } from '../services/overpass'

// Kalit bo'lsa Google Places, bo'lmasa Overpass (OSM) ishlatiladi
export const PROVIDER = GOOGLE_KEY ? 'google' : 'osm'
const search = GOOGLE_KEY ? searchGoogle : searchOverpass

export function useNearbyPlaces(center, radius, categoryIds) {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)
  const refetch = useCallback(() => setTick(t => t + 1), [])
  const key = categoryIds.join(',')

  useEffect(() => {
    if (!center || !categoryIds.length) { setPlaces([]); return }
    const ctrl = new AbortController()
    setLoading(true); setError(null)
    search(center, radius, categoryIds, ctrl.signal)
      .then(list => { if (!ctrl.signal.aborted) setPlaces(list) })
      .catch(e => { if (!ctrl.signal.aborted) setError(e.message) })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false) })
    return () => ctrl.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center?.[0], center?.[1], radius, key, tick])

  return { places, loading, error, refetch }
}

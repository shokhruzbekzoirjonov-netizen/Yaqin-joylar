import { useEffect, useMemo, useState } from 'react'
import { CATEGORIES, DEFAULT_CENTER, RADII } from './data/categories'
import { useGeolocation } from './hooks/useGeolocation'
import { useNearbyPlaces, PROVIDER } from './hooks/useNearbyPlaces'
import { useTheme } from './hooks/useTheme'
import FilterPanel from './components/FilterPanel'
import PlaceList from './components/PlaceList'
import MapView from './components/MapView'

export default function App() {
  const [dark, toggleTheme] = useTheme()
  const geo = useGeolocation()
  const [center, setCenter] = useState(DEFAULT_CENTER)
  const [radius, setRadius] = useState(RADII[1])
  const [selected, setSelected] = useState(['mosque', 'shop', 'toilet', 'food'])
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => { if (geo.position) setCenter(geo.position) }, [geo.position])

  const { places, loading, error, refetch } = useNearbyPlaces(center, radius, selected)
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? places.filter(p => p.name.toLowerCase().includes(q)) : places
  }, [places, query])

  const toggle = id => setSelected(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]))
  const setAll = () => setSelected(s => (s.length === CATEGORIES.length ? [] : CATEGORIES.map(c => c.id)))

  return (
    <div className="flex h-full flex-col bg-white text-slate-900 md:flex-row dark:bg-slate-950 dark:text-slate-100">
      <aside className="order-2 flex min-h-0 flex-1 flex-col md:order-1 md:w-96 md:flex-none md:border-r md:border-slate-200 md:dark:border-slate-800">
        <FilterPanel {...{ query, setQuery, selected, toggle, setAll, radius, setRadius, dark, toggleTheme }}
          onLocate={geo.locate} locating={geo.loading} />
        {geo.error && <p className="bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">{geo.error}</p>}
        <p className="px-3 py-1 text-[11px] text-slate-400">Ma'lumot manbai: {PROVIDER === 'google' ? 'Google Places' : 'OpenStreetMap (Google kaliti topilmadi)'}</p>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <PlaceList places={visible} {...{ loading, error, selectedId }} onRetry={refetch} onSelect={setSelectedId} />
        </div>
      </aside>
      <main className="order-1 h-[42vh] md:order-2 md:h-full md:flex-1">
        <MapView {...{ center, radius, dark, selectedId }} places={visible} onPick={setCenter} />
      </main>
    </div>
  )
}

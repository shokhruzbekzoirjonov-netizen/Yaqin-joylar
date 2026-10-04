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

  const { places, loading, loadingMore, error, refetch, enrich } = useNearbyPlaces(center, radius, selected)
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
        {PROVIDER !== 'google' && (
          <div className="bg-red-50 px-3 py-2 text-xs text-red-800 dark:bg-red-950 dark:text-red-200">
            Google kaliti o'qilmadi, shuning uchun sekin OpenStreetMap ishlatilyapti. Loyiha papkasida (package.json yonida)
            <code className="mx-1 rounded bg-black/10 px-1">.env</code> fayl yarating:
            <code className="mx-1 rounded bg-black/10 px-1">VITE_GOOGLE_MAPS_API_KEY=AIza...</code>
            keyin <code className="mx-1 rounded bg-black/10 px-1">npm run dev</code> ni to'xtatib qayta ishga tushiring.
          </div>
        )}
        <p className="px-3 py-1 text-[11px] text-slate-400">Ma'lumot manbai: {PROVIDER === 'google' ? 'Google Places' : 'OpenStreetMap (Google kaliti topilmadi)'}{loadingMore && ' · yuklanmoqda…'}</p>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <PlaceList places={visible} {...{ loading, error, selectedId }} onRetry={refetch} onSelect={id => { setSelectedId(id); enrich(id) }} />
        </div>
      </aside>
      <main className="order-1 h-[42vh] md:order-2 md:h-full md:flex-1">
        <MapView {...{ center, radius, dark, selectedId }} places={visible} onPick={setCenter} />
      </main>
    </div>
  )
}

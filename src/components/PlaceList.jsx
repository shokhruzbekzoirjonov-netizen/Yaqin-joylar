import { Clock, Navigation, AlertCircle, SearchX, Star, MapPin } from 'lucide-react'
import { formatDistance, directionsUrl } from '../utils/geo'

function Skeleton() {
  return Array.from({ length: 6 }).map((_, i) => (
    <div key={i} className="flex animate-pulse gap-3 p-3">
      <div className="h-16 w-16 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  ))
}

function Thumb({ place }) {
  const Icon = place.category.icon
  return place.image ? (
    <img src={place.image} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
  ) : (
    <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg text-white"
      style={{ background: place.category.color }}><Icon size={26} /></span>
  )
}

export default function PlaceList({ places, loading, error, onRetry, selectedId, onSelect }) {
  if (loading) return <Skeleton />
  if (error) return (
    <div className="flex flex-col items-center gap-2 p-6 text-center text-sm">
      <AlertCircle className="text-red-500" />
      <p>{error}</p>
      <button onClick={onRetry} className="rounded-lg bg-blue-600 px-3 py-1.5 text-white">Qayta urinish</button>
    </div>
  )
  if (!places.length) return (
    <div className="flex flex-col items-center gap-2 p-6 text-center text-sm text-slate-500">
      <SearchX />
      <p>Hech narsa topilmadi. Radiusni oshiring yoki boshqa kategoriya tanlang.</p>
    </div>
  )
  return (
    <ul className="divide-y divide-slate-200 dark:divide-slate-800">
      {places.map(p => (
        <li key={p.id} onClick={() => onSelect(p.id)}
          className={`flex cursor-pointer gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-900 ${selectedId === p.id ? 'bg-blue-50 dark:bg-slate-900' : ''}`}>
          <Thumb place={p} />
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="truncate font-medium">{p.name}</p>
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <Star size={12} className={p.rating ? 'fill-amber-400 text-amber-400' : ''} />
              {p.rating ? `${p.rating} (${p.ratingCount ?? 0})` : "Reyting yo'q"}
              <span className="px-1">·</span>{formatDistance(p.distance)}
            </p>
            {p.address && <p className="flex items-center gap-1 truncate text-xs text-slate-500"><MapPin size={12} className="shrink-0" />{p.address}</p>}
            <p className="flex items-center gap-1 truncate text-xs text-slate-500"><Clock size={12} className="shrink-0" />{p.hours || "Ish vaqti noma'lum"}</p>
          </div>
          <a href={directionsUrl(p)} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
            className="flex h-fit shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs text-white">
            <Navigation size={14} /> Yo'nalish
          </a>
        </li>
      ))}
    </ul>
  )
}

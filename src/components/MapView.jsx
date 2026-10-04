import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { renderToStaticMarkup } from 'react-dom/server'
import { formatDistance, directionsUrl, zoomForRadius } from '../utils/geo'

const OSM_TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const iconCache = {}
function pin(cat) {
  if (!iconCache[cat.id]) {
    const Icon = cat.icon
    iconCache[cat.id] = L.divIcon({
      className: '', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -16],
      html: `<div class="grid h-8 w-8 place-items-center rounded-full border-2 border-white shadow-md" style="background:${cat.color}">${renderToStaticMarkup(<Icon size={16} color="#fff" />)}</div>`,
    })
  }
  return iconCache[cat.id]
}
const meIcon = L.divIcon({ className: '', iconSize: [18, 18], iconAnchor: [9, 9],
  html: '<div class="h-[18px] w-[18px] rounded-full border-[3px] border-white bg-blue-600 shadow-lg"></div>' })

function Controller({ center, radius, focus }) {
  const map = useMap()
  useEffect(() => { map.flyTo(center, zoomForRadius(radius)) }, [center, radius, map])
  useEffect(() => { if (focus) map.flyTo([focus.lat, focus.lon], Math.max(map.getZoom(), 16)) }, [focus, map])
  return null
}
function ClickToSet({ onPick }) {
  useMapEvents({ click: e => onPick([e.latlng.lat, e.latlng.lng]) })
  return null
}

export default function MapView({ center, radius, places, selectedId, onPick, dark }) {
  const focus = useMemo(() => places.find(p => p.id === selectedId), [places, selectedId])
  return (
    <MapContainer center={center} zoom={zoomForRadius(radius)} scrollWheelZoom>
      <TileLayer url={OSM_TILES} maxZoom={19} className="osm-tiles"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
      <Controller center={center} radius={radius} focus={focus} />
      <ClickToSet onPick={onPick} />
      <Marker position={center} icon={meIcon} />
      <Circle center={center} radius={radius} pathOptions={{ color: '#2563eb', weight: 1, fillOpacity: 0.05 }} />
      {places.map(p => (
        <Marker key={p.id} position={[p.lat, p.lon]} icon={pin(p.category)}
          ref={r => { if (r && p.id === selectedId) r.openPopup() }}>
          <Popup>
            <div className="w-48 space-y-1 text-sm">
              {p.image && <img src={p.image} alt="" className="h-24 w-full rounded object-cover" loading="lazy" />}
              <p className="font-semibold">{p.name}</p>
              <p className="text-slate-600">{p.category.label} · {formatDistance(p.distance)}</p>
              {p.address && <p className="text-slate-600">{p.address}</p>}
              <p className="text-slate-600">{p.rating ? `★ ${p.rating} (${p.ratingCount ?? 0})` : "Reyting yo'q"}</p>
              <a href={directionsUrl(p)} target="_blank" rel="noreferrer"
                className="block rounded bg-blue-600 px-2 py-1 text-center text-white">Yo'nalish</a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

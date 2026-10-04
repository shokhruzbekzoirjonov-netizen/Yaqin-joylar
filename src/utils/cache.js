import { distanceMeters } from './geo'

const store = new Map()
const TTL = 30 * 60 * 1000 // 30 daqiqa
const LS = 'overpass-cache-v1'
try { Object.entries(JSON.parse(localStorage.getItem(LS) || '{}')).forEach(([k, e]) => store.set(k, e)) } catch { /* bo'sh */ }

const persist = () => {
  try {
    const o = {}
    store.forEach((e, k) => { if (k.startsWith('o|') && Date.now() - e.t < TTL) o[k] = e })
    localStorage.setItem(LS, JSON.stringify(o))
  } catch { /* joy yetmasa — e'tibor bermaymiz */ }
}
export const cacheKey = (...a) => a.join('|')
export const cacheGet = k => { const e = store.get(k); return e && Date.now() - e.t < TTL ? e.v : undefined }
export const cacheSet = (k, v) => { store.set(k, { v, t: Date.now() }); if (k.startsWith('o|')) persist() }
export const withDistance = (list, c) => list.map(p => ({ ...p, distance: distanceMeters(c, [p.lat, p.lon]) }))
export const geoKey = ([lat, lon]) => `${lat.toFixed(3)},${lon.toFixed(3)}`

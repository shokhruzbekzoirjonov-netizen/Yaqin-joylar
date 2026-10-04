import { distanceMeters } from './geo'

const store = new Map()
const TTL = 10 * 60 * 1000 // 10 daqiqa
export const cacheKey = (...a) => a.join('|')
export const cacheGet = k => { const e = store.get(k); return e && Date.now() - e.t < TTL ? e.v : undefined }
export const cacheSet = (k, v) => store.set(k, { v, t: Date.now() })
export const withDistance = (list, c) => list.map(p => ({ ...p, distance: distanceMeters(c, [p.lat, p.lon]) }))
export const geoKey = ([lat, lon]) => `${lat.toFixed(3)},${lon.toFixed(3)}` // ~110 m aniqlik

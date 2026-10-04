import { CATEGORIES } from '../data/categories'
import { cacheGet, cacheSet, cacheKey, geoKey, withDistance } from '../utils/cache'

export const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

let loader, lib
export function loadGoogle() {
  if (window.google?.maps?.importLibrary) return Promise.resolve()
  loader ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&v=weekly&loading=async&language=uz`
    s.async = true
    s.onload = resolve
    s.onerror = () => { loader = null; reject(new Error('Google Maps yuklanmadi. API kalitni tekshiring.')) }
    document.head.append(s)
  })
  return loader
}
const placesLib = () => (lib ??= loadGoogle().then(() => google.maps.importLibrary('places')))

// Sahifa ochilishi bilan oldindan yuklaymiz — birinchi qidiruv kutmaydi
if (GOOGLE_KEY) placesLib().catch(() => { lib = null })

// Ish vaqti (qimmat/sekin maydon) ro'yxatda so'ralmaydi — joy tanlanganda olinadi
const FIELDS = ['id', 'displayName', 'location', 'formattedAddress', 'rating', 'userRatingCount', 'photos']
const refs = new Map()

function toPlace(p, category) {
  refs.set(p.id, p)
  return {
    id: p.id, placeId: p.id, lat: p.location.lat(), lon: p.location.lng(), category,
    name: p.displayName || category.label, address: p.formattedAddress,
    rating: p.rating, ratingCount: p.userRatingCount,
    image: p.photos?.[0]?.getURI({ maxWidth: 200, maxHeight: 200 }),
  }
}

export async function fetchHours(id) {
  const p = refs.get(id)
  if (!p) return null
  await p.fetchFields({ fields: ['regularOpeningHours'] })
  const day = p.regularOpeningHours?.weekdayDescriptions?.[(new Date().getDay() + 6) % 7] // Dushanba = 0
  return day ? day.split(': ').slice(1).join(': ') : null
}

// Natijalar kategoriya tayyor bo'lishi bilan onBatch orqali birin-ketin uzatiladi
export async function searchGoogle(center, radius, categoryIds, signal, onBatch) {
  const { Place, SearchNearbyRankPreference } = await placesLib()
  const cats = CATEGORIES.filter(c => categoryIds.includes(c.id))
  let ok = 0

  await Promise.all(cats.map(async cat => {
    const key = cacheKey('g', geoKey(center), radius, cat.id)
    try {
      let list = cacheGet(key)
      if (!list) {
        const { places } = await Place.searchNearby({
          fields: FIELDS,
          locationRestriction: { center: { lat: center[0], lng: center[1] }, radius },
          includedTypes: cat.gtypes, maxResultCount: 20,
          rankPreference: SearchNearbyRankPreference.DISTANCE,
        })
        list = places.map(p => toPlace(p, cat))
        cacheSet(key, list)
      }
      ok++
      if (!signal.aborted) onBatch(withDistance(list, center))
    } catch { /* boshqa kategoriyalar davom etadi */ }
  }))

  if (!ok && !signal.aborted)
    throw new Error("Google Places so'rovi bajarilmadi. Kalit, billing va 'Places API (New)' yoqilganini tekshiring.")
}

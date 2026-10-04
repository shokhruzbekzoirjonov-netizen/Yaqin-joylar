import { CATEGORIES } from '../data/categories'
import { distanceMeters } from '../utils/geo'

export const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

let loader
export function loadGoogle() {
  if (window.google?.maps?.importLibrary) return Promise.resolve()
  loader ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&v=weekly&loading=async&language=uz`
    s.async = true
    s.onload = resolve
    s.onerror = () => { loader = null; reject(new Error("Google Maps yuklanmadi. API kalitni tekshiring.")) }
    document.head.append(s)
  })
  return loader
}

const FIELDS = ['id', 'displayName', 'location', 'formattedAddress', 'rating', 'userRatingCount',
  'photos', 'regularOpeningHours']

function toPlace(p, category, center) {
  const lat = p.location.lat(), lon = p.location.lng()
  const day = p.regularOpeningHours?.weekdayDescriptions?.[(new Date().getDay() + 6) % 7] // Dushanba = 0
  return {
    id: p.id, placeId: p.id, lat, lon, category,
    name: p.displayName || category.label,
    address: p.formattedAddress,
    rating: p.rating, ratingCount: p.userRatingCount,
    image: p.photos?.[0]?.getURI({ maxWidth: 240, maxHeight: 240 }),
    hours: day?.split(': ').slice(1).join(': '),
    distance: distanceMeters(center, [lat, lon]),
  }
}

export async function searchGoogle(center, radius, categoryIds, signal) {
  await loadGoogle()
  const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary('places')
  const cats = CATEGORIES.filter(c => categoryIds.includes(c.id))

  // Har kategoriya uchun alohida so'rov (har biri max 20 ta natija)
  const settled = await Promise.allSettled(cats.map(async cat => {
    const { places } = await Place.searchNearby({
      fields: FIELDS,
      locationRestriction: { center: { lat: center[0], lng: center[1] }, radius },
      includedTypes: cat.gtypes,
      maxResultCount: 20,
      rankPreference: SearchNearbyRankPreference.DISTANCE,
    })
    return places.map(p => toPlace(p, cat, center))
  }))

  if (signal.aborted) return []
  if (settled.every(r => r.status === 'rejected')) {
    throw new Error("Google Places so'rovi bajarilmadi. Kalit, billing va 'Places API (New)' yoqilganini tekshiring.")
  }
  const map = new Map()
  settled.filter(r => r.status === 'fulfilled').flatMap(r => r.value).forEach(p => map.set(p.id, p))
  return [...map.values()].sort((a, b) => a.distance - b.distance)
}

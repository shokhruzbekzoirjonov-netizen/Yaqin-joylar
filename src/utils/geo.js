export function distanceMeters([lat1, lon1], [lat2, lon2]) {
  const R = 6371000, rad = d => (d * Math.PI) / 180
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}
export const formatDistance = m => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`)
export const radiusLabel = m => (m < 1000 ? `${m} m` : `${m / 1000} km`)
export const directionsUrl = p =>
  `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}` +
  (p.placeId ? `&destination_place_id=${p.placeId}` : '')
export const zoomForRadius = r => (r <= 500 ? 16 : r <= 1000 ? 15 : r <= 3000 ? 13 : 12)

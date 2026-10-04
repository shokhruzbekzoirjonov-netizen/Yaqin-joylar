import { Landmark, Store, Toilet, ShoppingBasket, Utensils, School, GraduationCap, Baby,
  ParkingCircle, Hotel, Trees, Pill, Stethoscope, Fuel, MapPin } from 'lucide-react'

// sel — Overpass selektorlari, match — natijani kategoriyaga ajratish
export const CATEGORIES = [
  { id: "mosque", gtypes: ["mosque"], label: 'Masjid', icon: Landmark, color: '#16a34a',
    sel: ['["amenity"="place_of_worship"]["religion"="muslim"]'],
    match: t => t.amenity === 'place_of_worship' },
  { id: "shop", gtypes: ["supermarket", "convenience_store", "shopping_mall", "department_store", "clothing_store"], label: 'Magazin', icon: Store, color: '#2563eb',
    sel: ['["shop"~"supermarket|convenience|general|mall|clothes"]'],
    match: t => !!t.shop },
  { id: "market", gtypes: ["market"], label: 'Bozor', icon: ShoppingBasket, color: '#ea580c',
    sel: ['["amenity"="marketplace"]'], match: t => t.amenity === 'marketplace' },
  { id: "toilet", gtypes: ["public_bathroom"], label: 'Hojatxona', icon: Toilet, color: '#0891b2',
    sel: ['["amenity"="toilets"]'], match: t => t.amenity === 'toilets' },
  { id: "food", gtypes: ["restaurant", "cafe", "fast_food_restaurant"], label: 'Restoran / Kafe', icon: Utensils, color: '#dc2626',
    sel: ['["amenity"~"restaurant|cafe|fast_food"]'],
    match: t => /restaurant|cafe|fast_food/.test(t.amenity || '') },
  { id: "school", gtypes: ["school", "primary_school", "secondary_school"], label: 'Maktab', icon: School, color: '#7c3aed',
    sel: ['["amenity"="school"]'], match: t => t.amenity === 'school' },
  { id: "college", gtypes: ["university"], label: 'Kollej / OTM', icon: GraduationCap, color: '#9333ea',
    sel: ['["amenity"~"college|university"]'],
    match: t => /college|university/.test(t.amenity || '') },
  { id: "kindergarten", gtypes: ["preschool"], label: "Bog'cha", icon: Baby, color: '#db2777',
    sel: ['["amenity"="kindergarten"]'], match: t => t.amenity === 'kindergarten' },
  { id: "parking", gtypes: ["parking"], label: 'Avtoturargoh', icon: ParkingCircle, color: '#475569',
    sel: ['["amenity"="parking"]'], match: t => t.amenity === 'parking' },
  { id: "hotel", gtypes: ["hotel", "lodging", "guest_house"], label: 'Mehmonxona', icon: Hotel, color: '#b45309',
    sel: ['["tourism"~"hotel|hostel|guest_house"]'], match: t => !!t.tourism },
  { id: "park", gtypes: ["park"], label: 'Park', icon: Trees, color: '#15803d',
    sel: ['["leisure"="park"]'], match: t => t.leisure === 'park' },
  { id: "pharmacy", gtypes: ["pharmacy"], label: 'Dorixona', icon: Pill, color: '#059669',
    sel: ['["amenity"="pharmacy"]'], match: t => t.amenity === 'pharmacy' },
  { id: "health", gtypes: ["hospital", "doctor"], label: 'Shifoxona', icon: Stethoscope, color: '#e11d48',
    sel: ['["amenity"~"hospital|clinic"]'], match: t => /hospital|clinic/.test(t.amenity || '') },
  { id: "fuel", gtypes: ["gas_station"], label: "Yoqilg'i quyish", icon: Fuel, color: '#ca8a04',
    sel: ['["amenity"="fuel"]'], match: t => t.amenity === 'fuel' },
]

export const OTHER = { id: 'other', label: 'Boshqa', icon: MapPin, color: '#64748b' }
export const RADII = [500, 1000, 3000, 5000]
export const DEFAULT_CENTER = [41.2995, 69.2401] // GPS ishlamasa
export const getCategory = tags => CATEGORIES.find(c => c.match(tags)) || OTHER

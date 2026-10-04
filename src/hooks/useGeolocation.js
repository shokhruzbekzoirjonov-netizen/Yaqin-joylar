import { useCallback, useEffect, useState } from 'react'

export function useGeolocation() {
  const [position, setPosition] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const locate = useCallback(() => {
    if (!navigator.geolocation) return setError("Brauzer geolokatsiyani qo'llamaydi.")
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setPosition([coords.latitude, coords.longitude]); setError(null); setLoading(false) },
      () => { setError('Joylashuvga ruxsat berilmadi. Xaritadan joyni tanlang.'); setLoading(false) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  useEffect(() => { locate() }, [locate])
  return { position, error, loading, locate }
}

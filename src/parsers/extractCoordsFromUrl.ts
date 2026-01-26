/**
 * Extract coordinates from URL query parameter
 * Example: https://maps.google.com/?q=35.658,139.745 -> { lat: 35.658, lng: 139.745 }
 */
export function extractCoordsFromUrl(url: string): { lat: number; lng: number } | null {
  // Try ?q=lat,lng format
  const qMatch = url.match(/[?&]q=([-\d.]+),([-\d.]+)/)
  if (qMatch?.[1] && qMatch[2]) {
    const lat = Number.parseFloat(qMatch[1])
    const lng = Number.parseFloat(qMatch[2])
    // Validate that coordinates are not NaN
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return null
    }
    return { lat, lng }
  }

  // Try @lat,lng format (in path)
  const atMatch = url.match(/@([-\d.]+),([-\d.]+)/)
  if (atMatch?.[1] && atMatch[2]) {
    const lat = Number.parseFloat(atMatch[1])
    const lng = Number.parseFloat(atMatch[2])
    // Validate that coordinates are not NaN
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return null
    }
    return { lat, lng }
  }

  return null
}

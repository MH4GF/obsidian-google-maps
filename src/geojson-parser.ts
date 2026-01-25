import { extractIdFromUrl } from './extractIdFromUrl'
import { generateHashId } from './generateHashId'
import type { Place, TakeoutFeature, TakeoutGeoJSON } from './types'

/**
 * Parse Google Takeout GeoJSON (保存した場所.json) into Place array
 */
export function parseGeoJSON(jsonString: string): Place[] {
  let data: TakeoutGeoJSON
  try {
    data = JSON.parse(jsonString) as TakeoutGeoJSON
  } catch (error) {
    throw new Error(
      `Failed to parse GeoJSON: ${error instanceof Error ? error.message : 'Invalid JSON'}`,
    )
  }

  if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
    throw new Error('Invalid GeoJSON: expected FeatureCollection with features array')
  }

  return data.features
    .map((feature) => parseFeature(feature))
    .filter((place): place is Place => place !== null)
}

function parseFeature(feature: TakeoutFeature): Place | null {
  const { geometry, properties } = feature

  if (!properties?.location?.name) {
    return null
  }

  const name = properties.location.name
  const address = properties.location.address
  const url = properties.google_maps_url

  // Extract coordinates - GeoJSON uses [lng, lat] order
  let lng = geometry?.coordinates?.[0] ?? 0
  let lat = geometry?.coordinates?.[1] ?? 0

  // If coordinates are zero, try to extract from URL
  if (lat === 0 && lng === 0 && url) {
    const extracted = extractCoordsFromUrl(url)
    if (extracted) {
      lat = extracted.lat
      lng = extracted.lng
    }
  }

  // Generate stable ID from URL
  const id = extractIdFromUrl(url) ?? generateHashId(name, address)

  return {
    id,
    name,
    ...(url && { url }),
    lat,
    lng,
    ...(address && { address }),
  }
}

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

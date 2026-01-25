import { extractCoordsFromUrl } from './extractCoordsFromUrl'
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

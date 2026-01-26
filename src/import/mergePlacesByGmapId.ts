import type { Place } from '../types'

/**
 * Merges places by gmap_id, combining tags and preferring non-empty field values.
 * When the same place appears in multiple files (e.g., CSV and GeoJSON),
 * tags are merged and richer data (valid coordinates, address) is preserved.
 */
export function mergePlacesByGmapId(places: Place[]): Place[] {
  const placeMap = new Map<string, Place>()
  for (const place of places) {
    const existing = placeMap.get(place.id)
    if (existing) {
      existing.tags = [...new Set([...(existing.tags ?? []), ...(place.tags ?? [])])]
      // Prefer non-zero coordinates (CSV has lat/lng = 0, GeoJSON has valid coords)
      if (place.lat !== 0 && place.lng !== 0 && existing.lat === 0 && existing.lng === 0) {
        existing.lat = place.lat
        existing.lng = place.lng
      }
      // Prefer non-empty optional fields
      if (!existing.url && place.url) existing.url = place.url
      if (!existing.address && place.address) existing.address = place.address
      if (!existing.memo && place.memo) existing.memo = place.memo
      if (!existing.comment && place.comment) existing.comment = place.comment
    } else {
      placeMap.set(place.id, { ...place })
    }
  }
  return Array.from(placeMap.values())
}

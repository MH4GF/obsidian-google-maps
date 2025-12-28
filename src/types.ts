/**
 * Internal Place model - normalized from various input formats
 */
export type Place = {
  id: string
  name: string
  url?: string
  lat: number
  lng: number
  address?: string
}

/**
 * Google Takeout GeoJSON structure (保存した場所.json)
 */
export type TakeoutGeoJSON = {
  type: 'FeatureCollection'
  features: TakeoutFeature[]
}

export type TakeoutFeature = {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number] // [lng, lat] - GeoJSON standard
  }
  properties: {
    location: {
      name: string
      address?: string
    }
    // biome-ignore lint/style/useNamingConvention: Matches Google Takeout output format
    google_maps_url?: string
    date?: string
  }
}

/**
 * Google Takeout CSV structure (保存済み/*.csv)
 */
export type TakeoutCsvRow = {
  title: string
  memo: string
  url: string
  tags: string
  comment: string
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

/**
 * Google Takeout GeoJSON structure (保存した場所.json)
 */
export type TakeoutGeoJSON = {
  type: 'FeatureCollection'
  features: TakeoutFeature[]
}

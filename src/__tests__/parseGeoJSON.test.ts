import { describe, expect, test } from 'vitest'
import { parseGeoJSON } from '../parseGeoJSON'

describe('parseGeoJSON', () => {
  test('FeatureCollectionをPlace[]に変換できる', () => {
    const geojson = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [139.7454, 35.6586] },
          properties: {
            location: { name: '東京タワー', address: '港区芝公園4-2-8' },
            google_maps_url: 'https://maps.google.com/?cid=12345',
          },
        },
      ],
    })

    const places = parseGeoJSON(geojson)
    const place = places[0]

    expect(places).toHaveLength(1)
    expect(place?.name).toBe('東京タワー')
    expect(place?.address).toBe('港区芝公園4-2-8')
  })

  test('GeoJSON座標[lng, lat]をPlace座標[lat, lng]に変換できる', () => {
    const geojson = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [139.7454, 35.6586] },
          properties: {
            location: { name: 'テスト' },
          },
        },
      ],
    })

    const places = parseGeoJSON(geojson)
    const place = places[0]

    // GeoJSONは[lng, lat]順、Placeはlat/lngを分離
    expect(place?.lat).toBe(35.6586)
    expect(place?.lng).toBe(139.7454)
  })

  test('座標ゼロの場合URLから抽出できる', () => {
    const geojson = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {
            location: { name: 'テスト' },
            google_maps_url: 'https://maps.google.com/?q=35.6586,139.7454',
          },
        },
      ],
    })

    const places = parseGeoJSON(geojson)
    const place = places[0]

    expect(place?.lat).toBe(35.6586)
    expect(place?.lng).toBe(139.7454)
  })

  test('URLからcidを抽出してIDにできる', () => {
    const geojson = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [139.7454, 35.6586] },
          properties: {
            location: { name: 'テスト' },
            google_maps_url: 'https://maps.google.com/?cid=12345678',
          },
        },
      ],
    })

    const places = parseGeoJSON(geojson)
    const place = places[0]

    expect(place?.id).toBe('cid-12345678')
  })

  test('locationがない場合はスキップする', () => {
    const geojson = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [139.7454, 35.6586] },
          properties: {},
        },
      ],
    })

    const places = parseGeoJSON(geojson)

    expect(places).toHaveLength(0)
  })

  test('不正なJSON構文でエラーを投げる', () => {
    expect(() => parseGeoJSON('invalid json')).toThrow('Failed to parse GeoJSON')
  })

  test('不正なGeoJSON形式でエラーを投げる', () => {
    expect(() => parseGeoJSON('{"type": "Invalid"}')).toThrow('Invalid GeoJSON')
  })
})

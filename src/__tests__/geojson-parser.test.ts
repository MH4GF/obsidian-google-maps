import { describe, expect, test } from 'vitest'
import { extractCidFromUrl, extractCoordsFromUrl, parseGeoJSON } from '../geojson-parser'

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

describe('extractCidFromUrl', () => {
  test('cid=で始まるパラメータを抽出する', () => {
    expect(extractCidFromUrl('https://maps.google.com/?cid=12345')).toBe('12345')
  })

  test('cidがない場合はnullを返す', () => {
    expect(extractCidFromUrl('https://maps.google.com/')).toBeNull()
  })
})

describe('extractCoordsFromUrl', () => {
  test('?q=lat,lng形式から座標を抽出する', () => {
    const result = extractCoordsFromUrl('https://maps.google.com/?q=35.6586,139.7454')
    expect(result).toEqual({ lat: 35.6586, lng: 139.7454 })
  })

  test('@lat,lng形式から座標を抽出する', () => {
    const result = extractCoordsFromUrl('https://maps.google.com/@35.6586,139.7454,15z')
    expect(result).toEqual({ lat: 35.6586, lng: 139.7454 })
  })

  test('座標がない場合はnullを返す', () => {
    expect(extractCoordsFromUrl('https://maps.google.com/')).toBeNull()
  })

  // Issue #14: NaN検証追加
  test('不正な座標形式(NaN)の場合はnullを返す - ?q=形式', () => {
    expect(extractCoordsFromUrl('https://maps.google.com/?q=abc,def')).toBeNull()
  })

  test('不正な座標形式(NaN)の場合はnullを返す - @形式', () => {
    expect(extractCoordsFromUrl('https://maps.google.com/@abc,def,15z')).toBeNull()
  })

  test('部分的にNaN(lat有効, lng無効)の場合はnullを返す', () => {
    expect(extractCoordsFromUrl('https://maps.google.com/?q=35.6586,abc')).toBeNull()
    expect(extractCoordsFromUrl('https://maps.google.com/@35.6586,abc,15z')).toBeNull()
  })

  test('部分的にNaN(lat無効, lng有効)の場合はnullを返す', () => {
    expect(extractCoordsFromUrl('https://maps.google.com/?q=abc,139.7454')).toBeNull()
    expect(extractCoordsFromUrl('https://maps.google.com/@abc,139.7454,15z')).toBeNull()
  })
})

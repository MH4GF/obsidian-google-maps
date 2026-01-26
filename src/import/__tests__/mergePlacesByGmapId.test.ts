import { describe, expect, test } from 'vitest'
import type { Place } from '../../types'
import { mergePlacesByGmapId } from '../mergePlacesByGmapId'

describe('mergePlacesByGmapId', () => {
  test('重複のないPlaceはそのまま返す', () => {
    const places: Place[] = [
      {
        id: 'place1',
        name: 'Place 1',
        lat: 35.0,
        lng: 139.0,
        url: 'url1',
        tags: ['gmap/List1'],
      },
      {
        id: 'place2',
        name: 'Place 2',
        lat: 36.0,
        lng: 140.0,
        url: 'url2',
        tags: ['gmap/List2'],
      },
    ]

    const result = mergePlacesByGmapId(places)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual(places[0])
    expect(result[1]).toEqual(places[1])
  })

  test('同一gmap_idのPlaceはタグがマージされる', () => {
    const places: Place[] = [
      {
        id: 'place1',
        name: 'Place 1',
        lat: 35.0,
        lng: 139.0,
        url: 'url1',
        tags: ['gmap/List1'],
      },
      {
        id: 'place1',
        name: 'Place 1',
        lat: 35.0,
        lng: 139.0,
        url: 'url1',
        tags: ['gmap/List2'],
      },
    ]

    const result = mergePlacesByGmapId(places)

    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe('place1')
    expect(result[0]?.tags).toEqual(['gmap/List1', 'gmap/List2'])
  })

  test('タグは重複排除される', () => {
    const places: Place[] = [
      {
        id: 'place1',
        name: 'Place 1',
        lat: 35.0,
        lng: 139.0,
        url: 'url1',
        tags: ['gmap/List1', 'common'],
      },
      {
        id: 'place1',
        name: 'Place 1',
        lat: 35.0,
        lng: 139.0,
        url: 'url1',
        tags: ['gmap/List2', 'common'],
      },
    ]

    const result = mergePlacesByGmapId(places)

    expect(result).toHaveLength(1)
    expect(result[0]?.tags).toEqual(['gmap/List1', 'common', 'gmap/List2'])
  })

  test('3つ以上の重複も正しくマージされる', () => {
    const places: Place[] = [
      {
        id: 'place1',
        name: 'Place 1',
        lat: 35.0,
        lng: 139.0,
        url: 'url1',
        tags: ['gmap/List1'],
      },
      {
        id: 'place1',
        name: 'Place 1',
        lat: 35.0,
        lng: 139.0,
        url: 'url1',
        tags: ['gmap/List2'],
      },
      {
        id: 'place1',
        name: 'Place 1',
        lat: 35.0,
        lng: 139.0,
        url: 'url1',
        tags: ['gmap/List3'],
      },
    ]

    const result = mergePlacesByGmapId(places)

    expect(result).toHaveLength(1)
    expect(result[0]?.tags).toEqual(['gmap/List1', 'gmap/List2', 'gmap/List3'])
  })

  test('tagsがundefinedのPlaceも正しく処理される', () => {
    const places: Place[] = [
      {
        id: 'place1',
        name: 'Place 1',
        lat: 35.0,
        lng: 139.0,
        url: 'url1',
        tags: ['gmap/List1'],
      },
      { id: 'place1', name: 'Place 1', lat: 35.0, lng: 139.0, url: 'url1' },
    ]

    const result = mergePlacesByGmapId(places)

    expect(result).toHaveLength(1)
    expect(result[0]?.tags).toEqual(['gmap/List1'])
  })

  test('元のPlace配列は変更されない', () => {
    const places: Place[] = [
      {
        id: 'place1',
        name: 'Place 1',
        lat: 35.0,
        lng: 139.0,
        url: 'url1',
        tags: ['gmap/List1'],
      },
      {
        id: 'place1',
        name: 'Place 1',
        lat: 35.0,
        lng: 139.0,
        url: 'url1',
        tags: ['gmap/List2'],
      },
    ]
    const originalTags1 = [...(places[0]?.tags ?? [])]
    const originalTags2 = [...(places[1]?.tags ?? [])]

    mergePlacesByGmapId(places)

    expect(places[0]?.tags).toEqual(originalTags1)
    expect(places[1]?.tags).toEqual(originalTags2)
  })

  test('空配列を渡すと空配列が返る', () => {
    const result = mergePlacesByGmapId([])
    expect(result).toEqual([])
  })

  test('CSV(座標0)とGeoJSON(有効座標)の重複は有効座標を優先', () => {
    const places: Place[] = [
      // CSV由来: lat/lng = 0
      {
        id: 'place1',
        name: 'Place 1',
        lat: 0,
        lng: 0,
        tags: ['gmap/Favourites'],
      },
      // GeoJSON由来: 有効な座標とURL
      {
        id: 'place1',
        name: 'Place 1',
        lat: 35.6762,
        lng: 139.6503,
        url: 'https://maps.google.com/?cid=123',
        address: 'Tokyo, Japan',
        tags: [],
      },
    ]

    const result = mergePlacesByGmapId(places)

    expect(result).toHaveLength(1)
    expect(result[0]?.lat).toBe(35.6762)
    expect(result[0]?.lng).toBe(139.6503)
    expect(result[0]?.url).toBe('https://maps.google.com/?cid=123')
    expect(result[0]?.address).toBe('Tokyo, Japan')
    expect(result[0]?.tags).toEqual(['gmap/Favourites'])
  })

  test('非空のオプションフィールドは後から補完される', () => {
    const places: Place[] = [
      {
        id: 'place1',
        name: 'Place 1',
        lat: 35.0,
        lng: 139.0,
        memo: 'First memo',
      },
      {
        id: 'place1',
        name: 'Place 1',
        lat: 35.0,
        lng: 139.0,
        comment: 'Later comment',
        address: 'Address from second',
      },
    ]

    const result = mergePlacesByGmapId(places)

    expect(result).toHaveLength(1)
    expect(result[0]?.memo).toBe('First memo')
    expect(result[0]?.comment).toBe('Later comment')
    expect(result[0]?.address).toBe('Address from second')
  })
})

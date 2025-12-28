import { describe, expect, test } from 'vitest'
import { generateFileName, generateNoteContent } from '../note-generator'
import type { Place } from '../types'

/** Replace dynamic last_synced value with placeholder for snapshot testing */
function normalizeSyncedAt(content: string): string {
  return content.replace(/last_synced: "[^"]+"/g, 'last_synced: "[TIMESTAMP]"')
}

describe('generateNoteContent', () => {
  const basePlace: Place = {
    id: 'cid-12345678',
    name: '東京タワー',
    url: 'https://maps.google.com/?cid=12345678',
    lat: 35.6586,
    lng: 139.7454,
    address: '港区芝公園4-2-8',
  }

  test('完全なノートコンテンツを生成する', () => {
    const content = generateNoteContent(basePlace)
    const normalized = normalizeSyncedAt(content)

    expect(normalized).toMatchInlineSnapshot(`
      "---
      source: google-maps-takeout
      gmap_id: "cid-12345678"
      gmap_url: "https://maps.google.com/?cid=12345678"
      coordinates: [35.6586, 139.7454]
      address: "港区芝公園4-2-8"
      last_synced: "[TIMESTAMP]"
      ---

      # 東京タワー

      <!-- BEGIN:SYNC -->
      - Google Maps: https://maps.google.com/?cid=12345678
      - Address: 港区芝公園4-2-8
      - Coordinates: 35.6586, 139.7454
      <!-- END:SYNC -->

      ## Memo
      "
    `)
  })

  test('座標がゼロの場合coordinatesを含まない', () => {
    const placeWithoutCoords: Place = {
      ...basePlace,
      lat: 0,
      lng: 0,
    }

    const content = generateNoteContent(placeWithoutCoords)
    const normalized = normalizeSyncedAt(content)

    expect(normalized).toMatchInlineSnapshot(`
      "---
      source: google-maps-takeout
      gmap_id: "cid-12345678"
      gmap_url: "https://maps.google.com/?cid=12345678"
      address: "港区芝公園4-2-8"
      last_synced: "[TIMESTAMP]"
      ---

      # 東京タワー

      <!-- BEGIN:SYNC -->
      - Google Maps: https://maps.google.com/?cid=12345678
      - Address: 港区芝公園4-2-8
      <!-- END:SYNC -->

      ## Memo
      "
    `)
  })

  test('URLとaddressがない場合のノート生成', () => {
    const minimalPlace: Place = {
      id: 'hash-abc123',
      name: 'テスト場所',
      lat: 35.0,
      lng: 139.0,
    }

    const content = generateNoteContent(minimalPlace)
    const normalized = normalizeSyncedAt(content)

    expect(normalized).toMatchInlineSnapshot(`
      "---
      source: google-maps-takeout
      gmap_id: "hash-abc123"
      coordinates: [35, 139]
      last_synced: "[TIMESTAMP]"
      ---

      # テスト場所

      <!-- BEGIN:SYNC -->
      - Coordinates: 35, 139
      <!-- END:SYNC -->

      ## Memo
      "
    `)
  })
})

describe('escapeYamlString - YAML特殊文字のエスケープ', () => {
  const basePlaceWithAddress = (address: string): Place => ({
    id: 'test-id',
    name: 'Test Place',
    lat: 35.0,
    lng: 139.0,
    address,
  })

  describe('バックスラッシュのエスケープ', () => {
    test('バックスラッシュは二重にエスケープされる', () => {
      const place = basePlaceWithAddress('C:\\Users\\test')
      const content = generateNoteContent(place)
      const normalized = normalizeSyncedAt(content)

      expect(normalized).toContain('address: "C:\\\\Users\\\\test"')
    })
  })

  describe('ダブルクォートのエスケープ', () => {
    test('ダブルクォートはバックスラッシュでエスケープされる', () => {
      const place = basePlaceWithAddress('He said "Hello"')
      const content = generateNoteContent(place)
      const normalized = normalizeSyncedAt(content)

      expect(normalized).toContain('address: "He said \\"Hello\\""')
    })
  })

  describe('改行文字のエスケープ', () => {
    test('改行(LF)はエスケープシーケンスに変換される', () => {
      const place = basePlaceWithAddress('Line1\nLine2')
      const content = generateNoteContent(place)
      const normalized = normalizeSyncedAt(content)

      expect(normalized).toContain('address: "Line1\\nLine2"')
    })

    test('キャリッジリターン(CR)はエスケープシーケンスに変換される', () => {
      const place = basePlaceWithAddress('Line1\rLine2')
      const content = generateNoteContent(place)
      const normalized = normalizeSyncedAt(content)

      expect(normalized).toContain('address: "Line1\\rLine2"')
    })
  })

  describe('タブ文字のエスケープ', () => {
    test('タブ文字はエスケープシーケンスに変換される', () => {
      const place = basePlaceWithAddress('Col1\tCol2')
      const content = generateNoteContent(place)
      const normalized = normalizeSyncedAt(content)

      expect(normalized).toContain('address: "Col1\\tCol2"')
    })
  })

  describe('複合ケース', () => {
    test('複数の特殊文字が混在する場合、全てエスケープされる', () => {
      const place = basePlaceWithAddress('Path: C:\\test\nNote: "important"')
      const content = generateNoteContent(place)
      const normalized = normalizeSyncedAt(content)

      expect(normalized).toContain('address: "Path: C:\\\\test\\nNote: \\"important\\""')
    })
  })
})

describe('generateFileName', () => {
  test('ファイル名は{Place Name} - {shortId}.md形式', () => {
    const place: Place = {
      id: 'cid-12345678',
      name: '東京タワー',
      lat: 35.6586,
      lng: 139.7454,
    }

    expect(generateFileName(place)).toBe('東京タワー - 12345678.md')
  })

  test('特殊文字がサニタイズされる', () => {
    const place: Place = {
      id: 'cid-12345678',
      name: 'テスト/場所:名前',
      lat: 35.6586,
      lng: 139.7454,
    }

    expect(generateFileName(place)).toBe('テスト場所名前 - 12345678.md')
  })

  test('長い名前は100文字に切り詰められる', () => {
    const longName = 'あ'.repeat(150)
    const place: Place = {
      id: 'cid-12345678',
      name: longName,
      lat: 35.6586,
      lng: 139.7454,
    }

    const fileName = generateFileName(place)

    expect(fileName.startsWith('あ'.repeat(100))).toBe(true)
    expect(fileName.endsWith(' - 12345678.md')).toBe(true)
  })
})

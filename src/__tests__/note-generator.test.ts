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
  test('ファイル名は{Place Name}.md形式', () => {
    const place: Place = {
      id: 'cid-12345678',
      name: '東京タワー',
      lat: 35.6586,
      lng: 139.7454,
    }

    expect(generateFileName(place)).toBe('東京タワー.md')
  })

  test('特殊文字がサニタイズされる', () => {
    const place: Place = {
      id: 'cid-12345678',
      name: 'テスト/場所:名前',
      lat: 35.6586,
      lng: 139.7454,
    }

    expect(generateFileName(place)).toBe('テスト場所名前.md')
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

    expect(fileName).toBe(`${'あ'.repeat(100)}.md`)
  })

  test('同名の場所がある場合、数値サフィックスを追加', () => {
    const place: Place = {
      id: 'cid-12345678',
      name: 'スターバックス',
      lat: 35.6586,
      lng: 139.7454,
    }

    const existingFiles = ['スターバックス.md']
    expect(generateFileName(place, existingFiles)).toBe('スターバックス 1.md')
  })

  test('複数の同名場所がある場合、連番を振る', () => {
    const place: Place = {
      id: 'cid-12345678',
      name: 'スターバックス',
      lat: 35.6586,
      lng: 139.7454,
    }

    const existingFiles = ['スターバックス.md', 'スターバックス 1.md', 'スターバックス 2.md']
    expect(generateFileName(place, existingFiles)).toBe('スターバックス 3.md')
  })
})

describe('CSV由来のフィールド対応', () => {
  test('memo/tags/commentがfrontmatterに含まれる', () => {
    const place: Place = {
      id: 'pid-test',
      name: 'テスト場所',
      lat: 0,
      lng: 0,
      memo: 'これはメモです',
      tags: 'カフェ',
      comment: 'コメント内容',
    }

    const content = generateNoteContent(place)
    const normalized = normalizeSyncedAt(content)

    expect(normalized).toMatchInlineSnapshot(`
      "---
      source: google-maps-takeout
      gmap_id: "pid-test"
      tags: ["カフェ"]
      memo: "これはメモです"
      comment: "コメント内容"
      last_synced: "[TIMESTAMP]"
      ---
      "
    `)
  })

  test('memo/tags/commentが空の場合はfrontmatterに含まれない', () => {
    const place: Place = {
      id: 'pid-test',
      name: 'テスト場所',
      lat: 0,
      lng: 0,
    }

    const content = generateNoteContent(place)

    expect(content).not.toContain('memo:')
    expect(content).not.toContain('tags:')
    expect(content).not.toContain('comment:')
  })

  test('memo内の特殊文字がエスケープされる', () => {
    const place: Place = {
      id: 'pid-test',
      name: 'テスト場所',
      lat: 0,
      lng: 0,
      memo: 'Line1\nLine2',
    }

    const content = generateNoteContent(place)

    expect(content).toContain('memo: "Line1\\nLine2"')
  })
})

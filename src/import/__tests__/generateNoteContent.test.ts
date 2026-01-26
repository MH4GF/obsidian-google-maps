import { describe, expect, test } from 'vitest'
import type { Place } from '../../types'
import { buildFrontmatterString, extractBody, generateNoteContent } from '../generateNoteContent'

/** Replace dynamic last_imported_at value with placeholder for snapshot testing */
function normalizeImportedAt(content: string): string {
  return content.replace(/last_imported_at: "[^"]+"/g, 'last_imported_at: "[TIMESTAMP]"')
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
    const normalized = normalizeImportedAt(content)

    expect(normalized).toMatchInlineSnapshot(`
      "---
      source: google-maps-takeout
      gmap_id: "cid-12345678"
      gmap_url: "https://maps.google.com/?cid=12345678"
      coordinates: [35.6586, 139.7454]
      address: "港区芝公園4-2-8"
      last_imported_at: "[TIMESTAMP]"
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
    const normalized = normalizeImportedAt(content)

    expect(normalized).toMatchInlineSnapshot(`
      "---
      source: google-maps-takeout
      gmap_id: "cid-12345678"
      gmap_url: "https://maps.google.com/?cid=12345678"
      address: "港区芝公園4-2-8"
      last_imported_at: "[TIMESTAMP]"
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
    const normalized = normalizeImportedAt(content)

    expect(normalized).toMatchInlineSnapshot(`
      "---
      source: google-maps-takeout
      gmap_id: "hash-abc123"
      coordinates: [35, 139]
      last_imported_at: "[TIMESTAMP]"
      ---
      "
    `)
  })

  test('listがある場合frontmatterに含まれる', () => {
    const placeWithList: Place = {
      id: 'test-id',
      name: 'テスト場所',
      lat: 35.0,
      lng: 139.0,
      list: 'お気に入り',
    }

    const content = generateNoteContent(placeWithList)
    const normalized = normalizeImportedAt(content)

    expect(normalized).toMatchInlineSnapshot(`
      "---
      source: google-maps-takeout
      gmap_id: "test-id"
      list: "お気に入り"
      coordinates: [35, 139]
      last_imported_at: "[TIMESTAMP]"
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
      const normalized = normalizeImportedAt(content)

      expect(normalized).toContain('address: "C:\\\\Users\\\\test"')
    })
  })

  describe('ダブルクォートのエスケープ', () => {
    test('ダブルクォートはバックスラッシュでエスケープされる', () => {
      const place = basePlaceWithAddress('He said "Hello"')
      const content = generateNoteContent(place)
      const normalized = normalizeImportedAt(content)

      expect(normalized).toContain('address: "He said \\"Hello\\""')
    })
  })

  describe('改行文字のエスケープ', () => {
    test('改行(LF)はエスケープシーケンスに変換される', () => {
      const place = basePlaceWithAddress('Line1\nLine2')
      const content = generateNoteContent(place)
      const normalized = normalizeImportedAt(content)

      expect(normalized).toContain('address: "Line1\\nLine2"')
    })

    test('キャリッジリターン(CR)はエスケープシーケンスに変換される', () => {
      const place = basePlaceWithAddress('Line1\rLine2')
      const content = generateNoteContent(place)
      const normalized = normalizeImportedAt(content)

      expect(normalized).toContain('address: "Line1\\rLine2"')
    })
  })

  describe('タブ文字のエスケープ', () => {
    test('タブ文字はエスケープシーケンスに変換される', () => {
      const place = basePlaceWithAddress('Col1\tCol2')
      const content = generateNoteContent(place)
      const normalized = normalizeImportedAt(content)

      expect(normalized).toContain('address: "Col1\\tCol2"')
    })
  })

  describe('複合ケース', () => {
    test('複数の特殊文字が混在する場合、全てエスケープされる', () => {
      const place = basePlaceWithAddress('Path: C:\\test\nNote: "important"')
      const content = generateNoteContent(place)
      const normalized = normalizeImportedAt(content)

      expect(normalized).toContain('address: "Path: C:\\\\test\\nNote: \\"important\\""')
    })
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
    const normalized = normalizeImportedAt(content)

    expect(normalized).toMatchInlineSnapshot(`
      "---
      source: google-maps-takeout
      gmap_id: "pid-test"
      tags: ["カフェ"]
      memo: "これはメモです"
      comment: "コメント内容"
      last_imported_at: "[TIMESTAMP]"
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

describe('extractBody', () => {
  test('frontmatterありのノートからボディを抽出する', () => {
    const content = `---
source: google-maps-takeout
gmap_id: "test-id"
---

This is the body content.
More content here.`

    expect(extractBody(content)).toBe(`This is the body content.
More content here.`)
  })

  test('frontmatterのみの場合は空文字を返す', () => {
    const content = `---
source: google-maps-takeout
gmap_id: "test-id"
---
`

    expect(extractBody(content)).toBe('')
  })

  test('frontmatterがない場合はコンテンツ全体を返す', () => {
    const content = 'This is just plain content without frontmatter.'

    expect(extractBody(content)).toBe(content)
  })

  test('frontmatter後の先頭空白行を除去する', () => {
    const content = `---
gmap_id: "test-id"
---


Body after blank lines.`

    expect(extractBody(content)).toBe('Body after blank lines.')
  })

  test('frontmatter値に---が含まれる場合も正しく抽出する', () => {
    const content = `---
memo: "foo --- bar"
gmap_id: "test-id"
---

Body content here.`

    expect(extractBody(content)).toBe('Body content here.')
  })

  test('frontmatterのみでEOFの場合は空文字を返す', () => {
    const content = `---
gmap_id: "test-id"
---`

    expect(extractBody(content)).toBe('')
  })

  test('frontmatter終了マーカーがない不完全なコンテンツはそのまま返す', () => {
    // frontmatter開始はあるが、終了マーカー(\n---\nまたは\n---EOF)がない
    const content = `---
gmap_id: "test-id"
some content without closing frontmatter`

    expect(extractBody(content)).toBe(content)
  })
})

describe('buildFrontmatterString', () => {
  const basePlace: Place = {
    id: 'cid-12345678',
    name: '東京タワー',
    url: 'https://maps.google.com/?cid=12345678',
    lat: 35.6586,
    lng: 139.7454,
    address: '港区芝公園4-2-8',
  }

  test('frontmatter文字列を生成する', () => {
    const frontmatter = buildFrontmatterString(basePlace)
    const normalized = normalizeImportedAt(frontmatter)

    expect(normalized).toMatchInlineSnapshot(`
      "---
      source: google-maps-takeout
      gmap_id: "cid-12345678"
      gmap_url: "https://maps.google.com/?cid=12345678"
      coordinates: [35.6586, 139.7454]
      address: "港区芝公園4-2-8"
      last_imported_at: "[TIMESTAMP]"
      ---"
    `)
  })

  test('座標がゼロの場合coordinatesを含まない', () => {
    const place: Place = { ...basePlace, lat: 0, lng: 0 }
    const frontmatter = buildFrontmatterString(place)

    expect(frontmatter).not.toContain('coordinates:')
  })
})

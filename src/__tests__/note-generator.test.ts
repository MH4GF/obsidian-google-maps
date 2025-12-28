import { describe, expect, test } from 'vitest'
import { generateFileName, generateNoteContent } from '../note-generator'
import type { Place } from '../types'

describe('generateNoteContent', () => {
  const basePlace: Place = {
    id: 'cid-12345678',
    name: '東京タワー',
    url: 'https://maps.google.com/?cid=12345678',
    lat: 35.6586,
    lng: 139.7454,
    address: '港区芝公園4-2-8',
  }

  test('frontmatterにcoordinates: [lat, lng]を含む', () => {
    const content = generateNoteContent(basePlace)

    expect(content).toMatch(/coordinates:\s*\[35\.6586,\s*139\.7454\]/)
  })

  test('frontmatterにsource, gmap_id, gmap_url, address, last_syncedを含む', () => {
    const content = generateNoteContent(basePlace)

    expect(content).toContain('source: google-maps-takeout')
    expect(content).toContain('gmap_id: "cid-12345678"')
    expect(content).toContain('gmap_url: "https://maps.google.com/?cid=12345678"')
    expect(content).toContain('address: "港区芝公園4-2-8"')
    expect(content).toMatch(/last_synced: "\d{4}-\d{2}-\d{2}T/)
  })

  test('同期ブロック（BEGIN:SYNC/END:SYNC）を含む', () => {
    const content = generateNoteContent(basePlace)

    expect(content).toContain('<!-- BEGIN:SYNC -->')
    expect(content).toContain('<!-- END:SYNC -->')
  })

  test('同期ブロック内にURL、住所、座標を含む', () => {
    const content = generateNoteContent(basePlace)

    // 同期ブロック内の内容を確認
    expect(content).toContain('- Google Maps: https://maps.google.com/?cid=12345678')
    expect(content).toContain('- Address: 港区芝公園4-2-8')
    expect(content).toContain('- Coordinates: 35.6586, 139.7454')
  })

  test('見出しに場所名を含む', () => {
    const content = generateNoteContent(basePlace)

    expect(content).toContain('# 東京タワー')
  })

  test('Memoセクションを含む', () => {
    const content = generateNoteContent(basePlace)

    expect(content).toContain('## Memo')
  })

  test('座標がゼロの場合coordinatesを含まない', () => {
    const placeWithoutCoords: Place = {
      ...basePlace,
      lat: 0,
      lng: 0,
    }

    const content = generateNoteContent(placeWithoutCoords)

    expect(content).not.toMatch(/coordinates:/)
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

    const fileName = generateFileName(place)

    expect(fileName).toBe('東京タワー - 12345678.md')
  })

  test('特殊文字がサニタイズされる', () => {
    const place: Place = {
      id: 'cid-12345678',
      name: 'テスト/場所:名前',
      lat: 35.6586,
      lng: 139.7454,
    }

    const fileName = generateFileName(place)

    // / と : が削除される
    expect(fileName).toBe('テスト場所名前 - 12345678.md')
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

    // 100文字 + " - " + shortId + ".md"
    expect(fileName.startsWith('あ'.repeat(100))).toBe(true)
    expect(fileName).toContain(' - 12345678.md')
  })
})

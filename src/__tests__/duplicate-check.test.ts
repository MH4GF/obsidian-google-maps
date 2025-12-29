import { describe, expect, test } from 'vitest'
import { findNoteByGmapId, type NoteMetadata } from '../duplicate-check'

describe('findNoteByGmapId', () => {
  const sampleNotes: NoteMetadata[] = [
    { path: 'Google Maps/Places/東京タワー - 12345678.md', gmapId: 'cid-12345678' },
    { path: 'Google Maps/Places/スカイツリー - 87654321.md', gmapId: 'cid-87654321' },
    { path: 'Other/Unrelated.md', gmapId: 'cid-99999999' },
    { path: 'Google Maps/Places/NoId.md', gmapId: undefined },
  ]

  test('gmap_id が一致するファイルパスを返す', () => {
    const result = findNoteByGmapId(sampleNotes, 'cid-12345678', 'Google Maps/Places')
    expect(result).toBe('Google Maps/Places/東京タワー - 12345678.md')
  })

  test('gmap_id が見つからない場合は null を返す', () => {
    const result = findNoteByGmapId(sampleNotes, 'cid-00000000', 'Google Maps/Places')
    expect(result).toBeNull()
  })

  test('指定フォルダ外のファイルは検索対象外', () => {
    const result = findNoteByGmapId(sampleNotes, 'cid-99999999', 'Google Maps/Places')
    expect(result).toBeNull()
  })
})

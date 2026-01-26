import { describe, expect, test } from 'vitest'
import type { Place } from '../../types'
import { generateFileName } from '../generateFileName'

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

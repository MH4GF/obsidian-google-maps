import { describe, expect, test } from 'vitest'
import { sanitizeTag } from '../sanitizeTag'

describe('sanitizeTag', () => {
  test('空白はアンダースコアに変換', () => {
    expect(sanitizeTag('My List')).toBe('My_List')
    expect(sanitizeTag('お気に入り カフェ')).toBe('お気に入り_カフェ')
  })

  test('括弧はアンダースコアに変換', () => {
    expect(sanitizeTag('List (New)')).toBe('List_New')
    expect(sanitizeTag('List [2024]')).toBe('List_2024')
  })

  test('特殊文字はアンダースコアに変換', () => {
    expect(sanitizeTag("It's great!")).toBe('It_s_great')
  })

  test('連続空白は単一アンダースコア', () => {
    expect(sanitizeTag('My   List')).toBe('My_List')
  })

  test('前後空白は除去', () => {
    expect(sanitizeTag('  Favourites  ')).toBe('Favourites')
  })

  test('ハイフンは保持', () => {
    expect(sanitizeTag('2025_03_14-15')).toBe('2025_03_14-15')
  })

  test('スラッシュは保持', () => {
    expect(sanitizeTag('gmap/Favourites')).toBe('gmap/Favourites')
  })

  test('日本語は保持', () => {
    expect(sanitizeTag('カフェ')).toBe('カフェ')
  })

  test('日本語記号（中黒・チルダ）は保持', () => {
    expect(sanitizeTag('コーヒースタンド・カフェ')).toBe('コーヒースタンド・カフェ')
    expect(sanitizeTag('沖縄2023_10_01〜03')).toBe('沖縄2023_10_01〜03')
  })

  test('絵文字は保持', () => {
    expect(sanitizeTag('カフェ☕')).toBe('カフェ☕')
    expect(sanitizeTag('🍜ラーメン')).toBe('🍜ラーメン')
  })

  test('実データパターン: デフォルト リスト(1)', () => {
    expect(sanitizeTag('デフォルト リスト(1)')).toBe('デフォルト_リスト_1')
  })

  test('サニタイズ後空になる場合は空文字', () => {
    expect(sanitizeTag('()')).toBe('')
  })
})

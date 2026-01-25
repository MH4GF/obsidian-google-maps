import { describe, expect, test } from 'vitest'
import { generateHashId } from '../generateHashId'

describe('generateHashId', () => {
  test('名前からハッシュIDを生成する', () => {
    const id = generateHashId('テスト場所')
    expect(id).toMatch(/^hash-[a-f0-9]+$/)
  })

  test('同じ入力に対して同じIDを生成する', () => {
    const id1 = generateHashId('テスト場所', '東京都')
    const id2 = generateHashId('テスト場所', '東京都')
    expect(id1).toBe(id2)
  })

  test('異なる入力に対して異なるIDを生成する', () => {
    const id1 = generateHashId('場所A')
    const id2 = generateHashId('場所B')
    expect(id1).not.toBe(id2)
  })
})

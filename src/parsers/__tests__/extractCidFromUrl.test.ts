import { describe, expect, test } from 'vitest'
import { extractCidFromUrl } from '../extractCidFromUrl'

describe('extractCidFromUrl', () => {
  test('cid=で始まるパラメータを抽出する', () => {
    expect(extractCidFromUrl('https://maps.google.com/?cid=12345')).toBe('12345')
  })

  test('cidがない場合はnullを返す', () => {
    expect(extractCidFromUrl('https://maps.google.com/')).toBeNull()
  })
})

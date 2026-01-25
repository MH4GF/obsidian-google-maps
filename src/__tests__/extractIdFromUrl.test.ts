import { describe, expect, test } from 'vitest'
import { extractCidFromUrl, extractIdFromUrl } from '../extractIdFromUrl'

describe('extractCidFromUrl', () => {
  test('cid=で始まるパラメータを抽出する', () => {
    expect(extractCidFromUrl('https://maps.google.com/?cid=12345')).toBe('12345')
  })

  test('cidがない場合はnullを返す', () => {
    expect(extractCidFromUrl('https://maps.google.com/')).toBeNull()
  })
})

describe('extractIdFromUrl', () => {
  test('cidを含むURLからcid-形式のIDを抽出する', () => {
    expect(extractIdFromUrl('https://maps.google.com/?cid=12345678')).toBe('cid-12345678')
  })

  test('0x...:0x...パターンからpid-形式のIDを抽出する', () => {
    expect(
      extractIdFromUrl(
        'https://www.google.com/maps/place/...!1s0x6001085d20274adf:0x1f05268314935b6d',
      ),
    ).toBe('pid-0x6001085d20274adf:0x1f05268314935b6d')
  })

  test('IDが抽出できない場合はnullを返す', () => {
    expect(extractIdFromUrl('https://maps.google.com/')).toBeNull()
  })

  test('undefinedの場合はnullを返す', () => {
    expect(extractIdFromUrl(undefined)).toBeNull()
  })
})

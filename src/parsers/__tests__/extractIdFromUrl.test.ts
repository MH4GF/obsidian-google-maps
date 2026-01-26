import { describe, expect, test } from 'vitest'
import { extractIdFromUrl } from '../extractIdFromUrl'

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

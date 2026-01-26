import { describe, expect, test } from 'vitest'
import { extractCoordsFromUrl } from '../extractCoordsFromUrl'

describe('extractCoordsFromUrl', () => {
  test('?q=lat,lng形式から座標を抽出する', () => {
    const result = extractCoordsFromUrl('https://maps.google.com/?q=35.6586,139.7454')
    expect(result).toEqual({ lat: 35.6586, lng: 139.7454 })
  })

  test('@lat,lng形式から座標を抽出する', () => {
    const result = extractCoordsFromUrl('https://maps.google.com/@35.6586,139.7454,15z')
    expect(result).toEqual({ lat: 35.6586, lng: 139.7454 })
  })

  test('座標がない場合はnullを返す', () => {
    expect(extractCoordsFromUrl('https://maps.google.com/')).toBeNull()
  })

  // Issue #14: NaN検証追加
  test('不正な座標形式(NaN)の場合はnullを返す - ?q=形式', () => {
    expect(extractCoordsFromUrl('https://maps.google.com/?q=abc,def')).toBeNull()
  })

  test('不正な座標形式(NaN)の場合はnullを返す - @形式', () => {
    expect(extractCoordsFromUrl('https://maps.google.com/@abc,def,15z')).toBeNull()
  })

  test('部分的にNaN(lat有効, lng無効)の場合はnullを返す', () => {
    expect(extractCoordsFromUrl('https://maps.google.com/?q=35.6586,abc')).toBeNull()
    expect(extractCoordsFromUrl('https://maps.google.com/@35.6586,abc,15z')).toBeNull()
  })

  test('部分的にNaN(lat無効, lng有効)の場合はnullを返す', () => {
    expect(extractCoordsFromUrl('https://maps.google.com/?q=abc,139.7454')).toBeNull()
    expect(extractCoordsFromUrl('https://maps.google.com/@abc,139.7454,15z')).toBeNull()
  })

  test('正規表現にマッチするがparseFloatでNaNになる値の場合はnullを返す - ?q=形式', () => {
    // '.' や '-' は正規表現 [-\d.]+ にマッチするが parseFloat で NaN になる
    expect(extractCoordsFromUrl('https://maps.google.com/?q=.,139.7454')).toBeNull()
    expect(extractCoordsFromUrl('https://maps.google.com/?q=35.6586,.')).toBeNull()
  })

  test('正規表現にマッチするがparseFloatでNaNになる値の場合はnullを返す - @形式', () => {
    expect(extractCoordsFromUrl('https://maps.google.com/@.,139.7454,15z')).toBeNull()
    expect(extractCoordsFromUrl('https://maps.google.com/@35.6586,.,15z')).toBeNull()
  })
})

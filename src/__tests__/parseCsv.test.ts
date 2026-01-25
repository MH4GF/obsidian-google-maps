import { describe, expect, test } from 'vitest'
import { parseCsv } from '../parseCsv'

describe('parseCsv', () => {
  test('有効なCSVをPlace[]に変換する', () => {
    const csv = `タイトル,メモ,URL,タグ,コメント
ジャズ喫茶 LUSH LIFE,素敵な雰囲気,https://www.google.com/maps/place/...!1s0x6001085d20274adf:0x1f05268314935b6d,カフェ,お気に入り`

    const places = parseCsv(csv)

    expect(places).toHaveLength(1)
    expect(places[0]?.name).toBe('ジャズ喫茶 LUSH LIFE')
    expect(places[0]?.memo).toBe('素敵な雰囲気')
    expect(places[0]?.tags).toBe('カフェ')
    expect(places[0]?.comment).toBe('お気に入り')
  })

  test('ヘッダー行をスキップする', () => {
    const csv = `タイトル,メモ,URL,タグ,コメント
場所A,,https://example.com,,
場所B,,https://example.com,,`

    const places = parseCsv(csv)

    expect(places).toHaveLength(2)
    expect(places[0]?.name).toBe('場所A')
    expect(places[1]?.name).toBe('場所B')
  })

  test('タイトルなしの行をスキップする', () => {
    const csv = `タイトル,メモ,URL,タグ,コメント
場所A,,https://example.com,,
,,https://example.com,,
場所B,,https://example.com,,`

    const places = parseCsv(csv)

    expect(places).toHaveLength(2)
    expect(places[0]?.name).toBe('場所A')
    expect(places[1]?.name).toBe('場所B')
  })

  test('座標は0,0になる（CSVには座標がない）', () => {
    const csv = `タイトル,メモ,URL,タグ,コメント
場所A,,https://example.com,,`

    const places = parseCsv(csv)

    expect(places).toHaveLength(1)
    expect(places[0]?.lat).toBe(0)
    expect(places[0]?.lng).toBe(0)
  })

  test('URLからplace_idを抽出する（pid-0x...:0x...形式）', () => {
    const csv = `タイトル,メモ,URL,タグ,コメント
ジャズ喫茶,,https://www.google.com/maps/place/...!1s0x6001085d20274adf:0x1f05268314935b6d,,`

    const places = parseCsv(csv)

    expect(places).toHaveLength(1)
    expect(places[0]?.id).toBe('pid-0x6001085d20274adf:0x1f05268314935b6d')
  })

  test('URLからcidを抽出する', () => {
    const csv = `タイトル,メモ,URL,タグ,コメント
場所A,,https://maps.google.com/?cid=12345678,,`

    const places = parseCsv(csv)

    expect(places).toHaveLength(1)
    expect(places[0]?.id).toBe('cid-12345678')
  })

  test('URLなしの場合はハッシュIDを生成する', () => {
    const csv = `タイトル,メモ,URL,タグ,コメント
場所A,,,,`

    const places = parseCsv(csv)

    expect(places).toHaveLength(1)
    expect(places[0]?.id).toMatch(/^hash-/)
  })

  test('カンマを含むタイトルを正しく処理する（引用符）', () => {
    const csv = `タイトル,メモ,URL,タグ,コメント
"喫茶店, 渋谷",,https://example.com,,`

    const places = parseCsv(csv)

    expect(places).toHaveLength(1)
    expect(places[0]?.name).toBe('喫茶店, 渋谷')
  })

  test('ダブルクォート内のエスケープされたダブルクォートを処理する', () => {
    const csv = `タイトル,メモ,URL,タグ,コメント
"He said ""Hello""",,https://example.com,,`

    const places = parseCsv(csv)

    expect(places).toHaveLength(1)
    expect(places[0]?.name).toBe('He said "Hello"')
  })

  test('空のCSVは空配列を返す', () => {
    const csv = ''
    const places = parseCsv(csv)
    expect(places).toEqual([])
  })

  test('ヘッダーのみのCSVは空配列を返す', () => {
    const csv = 'タイトル,メモ,URL,タグ,コメント'
    const places = parseCsv(csv)
    expect(places).toEqual([])
  })

  test('メモ・タグ・コメントが空の場合はプロパティに含まない', () => {
    const csv = `タイトル,メモ,URL,タグ,コメント
場所A,,https://example.com,,`

    const places = parseCsv(csv)

    expect(places).toHaveLength(1)
    const place = places[0]
    expect(place).not.toHaveProperty('memo')
    expect(place).not.toHaveProperty('tags')
    expect(place).not.toHaveProperty('comment')
  })

  test('URLが空の場合はプロパティに含まない', () => {
    const csv = `タイトル,メモ,URL,タグ,コメント
場所A,,,,`

    const places = parseCsv(csv)

    expect(places).toHaveLength(1)
    const place = places[0]
    expect(place).not.toHaveProperty('url')
  })

  test('引用符内の改行を正しく処理する', () => {
    const csv = `タイトル,メモ,URL,タグ,コメント
場所A,"これは
複数行のメモです",https://example.com,,`

    const places = parseCsv(csv)

    expect(places).toHaveLength(1)
    expect(places[0]?.name).toBe('場所A')
    expect(places[0]?.memo).toBe('これは\n複数行のメモです')
  })

  test('複数フィールドに引用符内改行がある場合も正しく処理する', () => {
    const csv = `タイトル,メモ,URL,タグ,コメント
場所A,"メモ1行目
メモ2行目",https://example.com,,"コメント1行目
コメント2行目"`

    const places = parseCsv(csv)

    expect(places).toHaveLength(1)
    expect(places[0]?.name).toBe('場所A')
    expect(places[0]?.memo).toBe('メモ1行目\nメモ2行目')
    expect(places[0]?.comment).toBe('コメント1行目\nコメント2行目')
  })

  test('引用符内改行と通常行が混在する場合', () => {
    const csv = `タイトル,メモ,URL,タグ,コメント
場所A,"複数行
メモ",https://example.com,,
場所B,通常メモ,https://example.com,,`

    const places = parseCsv(csv)

    expect(places).toHaveLength(2)
    expect(places[0]?.name).toBe('場所A')
    expect(places[0]?.memo).toBe('複数行\nメモ')
    expect(places[1]?.name).toBe('場所B')
    expect(places[1]?.memo).toBe('通常メモ')
  })

  test('Windows改行(CRLF)を正しく処理する', () => {
    const csv =
      'タイトル,メモ,URL,タグ,コメント\r\n場所A,,https://example.com,,\r\n場所B,,https://example.com,,'

    const places = parseCsv(csv)

    expect(places).toHaveLength(2)
    expect(places[0]?.name).toBe('場所A')
    expect(places[1]?.name).toBe('場所B')
  })

  test('空行をスキップする', () => {
    const csv = `タイトル,メモ,URL,タグ,コメント
場所A,,https://example.com,,

場所B,,https://example.com,,`

    const places = parseCsv(csv)

    expect(places).toHaveLength(2)
    expect(places[0]?.name).toBe('場所A')
    expect(places[1]?.name).toBe('場所B')
  })

  test('フィールド数が5未満の行をスキップする', () => {
    const csv = `タイトル,メモ,URL,タグ,コメント
場所A,,https://example.com,,
不完全な行,のみ
場所B,,https://example.com,,`

    const places = parseCsv(csv)

    expect(places).toHaveLength(2)
    expect(places[0]?.name).toBe('場所A')
    expect(places[1]?.name).toBe('場所B')
  })

  test('CR改行のみ(旧Mac形式)を正しく処理する', () => {
    const csv =
      'タイトル,メモ,URL,タグ,コメント\r場所A,,https://example.com,,\r場所B,,https://example.com,,'

    const places = parseCsv(csv)

    expect(places).toHaveLength(2)
    expect(places[0]?.name).toBe('場所A')
    expect(places[1]?.name).toBe('場所B')
  })
})

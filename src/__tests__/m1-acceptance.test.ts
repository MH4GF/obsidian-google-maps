/**
 * M1 Acceptance Tests - Google Maps Sync Plugin
 *
 * M1完了条件:
 * - Google Takeout出力を読み込める
 * - 場所ごとに1ノートを生成
 * - frontmatterに coordinates を含む
 * - Map view でピン表示できる（座標形式が正しいこと）
 */

import { describe, test } from "vitest";

describe("M1: Google Takeout Parser", () => {
  describe("GeoJSON Parser", () => {
    test.todo("保存した場所.jsonを読み込める");
    test.todo("FeatureCollectionのfeaturesを抽出できる");
    test.todo("geometry.coordinatesから[lng, lat]を取得できる");
    test.todo("properties.location.nameから場所名を取得できる");
    test.todo("properties.location.addressから住所を取得できる");
    test.todo("properties.google_maps_urlからURLを取得できる");
    test.todo("properties.dateから保存日時を取得できる");
  });

  describe("GeoJSON 座標ゼロ対応", () => {
    test.todo("座標が[0, 0]の場合、google_maps_urlから座標を抽出する");
    test.todo("URLから?q=lat,lng形式で座標を抽出できる");
    test.todo("URLに座標がない場合はnullを返す");
  });

  describe("CSV Parser", () => {
    test.todo("保存済み/*.csvを読み込める");
    test.todo("タイトル列から場所名を取得できる");
    test.todo("URL列からGoogle Maps URLを取得できる");
    test.todo("メモ列からユーザーメモを取得できる");
    test.todo("ファイル名からリスト名を抽出できる");
  });

  describe("CSV place_id抽出", () => {
    test.todo("URLから0x...:0x...形式のplace_idを抽出できる");
  });
});

describe("M1: Place Model", () => {
  describe("Internal Model変換", () => {
    test.todo("GeoJSON FeatureをPlaceモデルに変換できる");
    test.todo("CSV行をPlaceモデルに変換できる");
    test.todo("座標がない場合はlat/lngがundefined");
  });

  describe("Sync Key生成", () => {
    test.todo("google_maps_urlからcidを抽出してsync keyにする");
    test.todo("cidがない場合はURLハッシュをsync keyにする");
  });
});

describe("M1: Note Generator", () => {
  describe("ノートファイル生成", () => {
    test.todo("PlaceからMarkdownファイルを生成できる");
    test.todo("ファイル名は{Place Name} - {shortId}.md形式");
    test.todo("ファイル名の特殊文字はサニタイズされる");
  });

  describe("Frontmatter生成", () => {
    test.todo("sourceプロパティを含む");
    test.todo("gmap_idプロパティを含む");
    test.todo("gmap_urlプロパティを含む");
    test.todo("coordinatesプロパティを[lat, lng]形式で含む");
    test.todo("addressプロパティを含む");
    test.todo("last_syncedプロパティを含む");
  });

  describe("座標形式（Map view互換）", () => {
    test.todo("coordinatesは数値の配列[lat, lng]");
    test.todo("座標がない場合はcoordinatesプロパティを含まない");
  });

  describe("同期ブロック生成", () => {
    test.todo("<!-- BEGIN:SYNC -->マーカーを含む");
    test.todo("<!-- END:SYNC -->マーカーを含む");
    test.todo("同期ブロック内にGoogle Maps URLを含む");
    test.todo("同期ブロック内に住所を含む");
  });
});

describe("M1: Import Command", () => {
  describe("コマンド実行", () => {
    test.todo("Sync Google Maps Savedコマンドが登録される");
    test.todo("コマンド実行でTakeoutフォルダを選択できる");
  });

  describe("一括インポート", () => {
    test.todo("GeoJSONとCSVの両方を読み込む");
    test.todo("重複を検出してスキップする");
    test.todo("処理結果のサマリを表示する");
  });
});

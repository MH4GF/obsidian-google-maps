/**
 * M1-1 Acceptance Tests - 最小動作版
 *
 * 完了条件:
 * - プラグインがObsidianにインストールできる
 * - 「Sync Google Maps Saved」コマンドが登録される
 * - コマンド実行でGoogle Maps/Places/にダミーノートが1つ生成される
 * - ノートのfrontmatterにcoordinates: [35.6762, 139.6503]が含まれる
 * - Obsidian BasesのMap viewでピンが表示される
 * - READMEにインストール方法が英語で記載されている
 */

import { describe, test } from "vitest";

describe("M1-1: 最小動作版", () => {
  describe("コマンド登録", () => {
    test.todo("Sync Google Maps Savedコマンドが登録される");
    test.todo("コマンドIDはsync-google-maps-saved");
  });

  describe("ダミーノート生成", () => {
    test.todo("コマンド実行でノートが生成される");
    test.todo("出力フォルダはGoogle Maps/Places/");
    test.todo("フォルダが存在しない場合は作成される");
    test.todo("ファイル名は東京駅 - dummy.md");
  });

  describe("Frontmatter", () => {
    test.todo("sourceプロパティを含む");
    test.todo("gmap_idプロパティを含む");
    test.todo("gmap_urlプロパティを含む");
    test.todo("coordinatesは[35.6762, 139.6503]");
    test.todo("addressプロパティを含む");
    test.todo("last_syncedプロパティを含む");
  });

  describe("Body", () => {
    test.todo("見出し# 東京駅を含む");
    test.todo("<!-- BEGIN:SYNC -->マーカーを含む");
    test.todo("<!-- END:SYNC -->マーカーを含む");
    test.todo("## Memoセクションを含む");
  });

  describe("Map view互換性", () => {
    test.todo("coordinatesは数値の配列[lat, lng]");
  });

  describe("README", () => {
    test.todo("インストール方法が英語で記載されている");
  });
});

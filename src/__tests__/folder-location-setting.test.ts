/**
 * Folder Location Setting Tests
 *
 * 完了条件:
 * - 設定画面でVault内のフォルダをドロップダウンで選択できる
 * - 選択したフォルダにノートが生成される
 * - フォルダが存在しない場合は自動作成される
 */

import { describe, test } from 'vitest'

describe('Folder Location Setting', () => {
  describe('設定UI', () => {
    test.todo('フォルダドロップダウンが設定画面に表示される')
    test.todo('Vault内のフォルダ一覧が候補として表示される')
    test.todo('選択したフォルダがsettingsに保存される')
    test.todo('入力文字でフォルダ候補がフィルタリングされる')
  })

  describe('FolderSuggest', () => {
    test.todo('AbstractInputSuggestを継承している')
    test.todo('getSuggestionsがフォルダ一覧を返す')
    test.todo('renderSuggestionがフォルダパスを表示する')
    test.todo('selectSuggestionが選択値をinputに設定する')
  })

  describe('ノート生成', () => {
    test.todo('設定されたフォルダにノートが生成される')
    test.todo('フォルダが存在しない場合は自動作成される')
    test.todo('デフォルト値はGoogle Maps/Places')
  })

  describe('エッジケース', () => {
    test.todo('ルートフォルダを選択できる')
    test.todo('ネストしたフォルダパスを正しく処理する')
  })
})

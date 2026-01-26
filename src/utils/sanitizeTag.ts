/**
 * Obsidianタグとして有効な文字列に変換する
 * - 空白 → アンダースコア
 * - ASCII特殊文字 → アンダースコア
 * - 日本語・絵文字・スラッシュ・ハイフン → 保持
 */
export function sanitizeTag(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[()[\]{}'"!@#$%^&*+=<>,.;:`~\\|?]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

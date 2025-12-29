import type { App } from 'obsidian'

export interface NoteMetadata {
  path: string
  gmapId: string | undefined
}

/**
 * 指定フォルダ内の全ノートからfrontmatterのgmap_idを読み込んでNoteMetadataの配列を返す
 */
export async function loadNoteMetadata(app: App, folderPrefix: string): Promise<NoteMetadata[]> {
  const markdownFiles = app.vault.getMarkdownFiles()
  const metadata: NoteMetadata[] = []

  for (const file of markdownFiles) {
    // 指定フォルダ内のファイルのみ処理
    if (!file.path.startsWith(folderPrefix)) {
      continue
    }

    // metadataCacheからfrontmatterを取得
    let gmapId: string | undefined
    const cache = app.metadataCache.getFileCache(file)

    if (cache?.frontmatter) {
      // frontmatterからgmap_idを取得（文字列のクォートを除去）
      const rawGmapId = cache.frontmatter['gmap_id'] as string | undefined
      if (typeof rawGmapId === 'string') {
        // YAMLの値からクォートを除去（"cid-123" -> cid-123）
        gmapId = rawGmapId.replace(/^["']|["']$/g, '')
      }
    }

    // frontmatterにない場合はファイルコンテンツから直接抽出を試みる
    if (!gmapId) {
      try {
        const fileContent = await app.vault.read(file)
        gmapId = extractGmapIdFromContent(fileContent)
      } catch {
        // ファイル読み込みエラーは無視
      }
    }

    metadata.push({
      path: file.path,
      gmapId,
    })
  }

  return metadata
}

/**
 * ファイルコンテンツからgmap_idを抽出
 */
function extractGmapIdFromContent(content: string): string | undefined {
  // frontmatterブロックを抽出
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatterMatch) {
    return undefined
  }

  const frontmatter = frontmatterMatch[1]
  if (!frontmatter) {
    return undefined
  }

  // gmap_id: "cid-123" または gmap_id: 'cid-123' または gmap_id: cid-123 を検索
  const gmapIdMatch = frontmatter.match(/^gmap_id:\s*(?:"([^"]+)"|'([^']+)'|(\S+))$/m)
  if (gmapIdMatch) {
    // クォートされた値またはクォートなしの値を取得
    return gmapIdMatch[1] || gmapIdMatch[2] || gmapIdMatch[3]
  }

  return undefined
}

/**
 * 指定フォルダ内で gmap_id が一致するノートのパスを検索
 * @returns 一致するノートのパス、見つからない場合は null
 */
export function findNoteByGmapId(
  notes: NoteMetadata[],
  gmapId: string,
  folderPrefix: string,
): string | null {
  for (const note of notes) {
    // 指定フォルダ内で、gmap_idが一致するノートを検索
    if (note.path.startsWith(folderPrefix) && note.gmapId === gmapId) {
      return note.path
    }
  }

  return null
}

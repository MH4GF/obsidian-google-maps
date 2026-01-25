import type { NoteMetadata } from './types'

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

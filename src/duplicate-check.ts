export interface NoteMetadata {
  path: string
  gmapId: string | undefined
}

/**
 * 指定フォルダ内で gmap_id が一致するノートのパスを検索
 * @returns 一致するノートのパス、見つからない場合は null
 */
export function findNoteByGmapId(
  _notes: NoteMetadata[],
  _gmapId: string,
  _folderPrefix: string,
): string | null {
  throw new Error('Not implemented')
}

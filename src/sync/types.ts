export interface NoteMetadata {
  path: string
  gmapId: string | undefined
}

export type NoteGeneratorOptions = {
  includeCoordinates?: boolean
}

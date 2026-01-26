export interface NoteMetadata {
  path: string
  gmapId: string | undefined
  tags?: string[]
}

export type NoteGeneratorOptions = {
  includeCoordinates?: boolean
  existingTags?: string[]
}

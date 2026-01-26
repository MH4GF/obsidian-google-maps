import { type App, Notice, TFile } from 'obsidian'
import { generateFileName } from '../import/generateFileName'
import {
  buildFrontmatterString,
  extractBody,
  generateNoteContent,
} from '../import/generateNoteContent'
import { loadNoteMetadata } from '../import/loadNoteMetadata'
import { mergePlacesByGmapId } from '../import/mergePlacesByGmapId'
import { logger } from '../logger'
import { parseCsv } from '../parsers/parseCsv'
import { parseGeoJSON } from '../parsers/parseGeoJSON'
import type { GoogleMapsImportSettings } from '../settings/types'
import type { Place } from '../types'
import { sanitizeTag } from '../utils/sanitizeTag'

/** Files to exclude from import (different format, not place data) */
const EXCLUDED_FILES: readonly string[] = ['クチコミ.json']

export async function importGoogleMapsSaved(
  app: App,
  settings: GoogleMapsImportSettings,
): Promise<void> {
  try {
    const files = await selectDataDirectory()
    if (files.length === 0) {
      return
    }

    const outputFolder = settings.outputFolder || 'Google Maps/Places'

    // Ensure output folder exists
    if (!(await app.vault.adapter.exists(outputFolder))) {
      await app.vault.createFolder(outputFolder)
    }

    // Load existing notes once before processing all files
    const existingNotes = await loadNoteMetadata(app, outputFolder)
    const existingFileNames = existingNotes.map((n) => n.path.split('/').pop() ?? '')

    // Aggregate places from all files
    const allParsedPlaces: Place[] = []
    let skipped = 0

    for (const file of files) {
      try {
        const content = await file.text()
        let parsedPlaces: Place[]

        if (file.name.endsWith('.csv')) {
          const listName = file.name.replace(/\.csv$/i, '')
          const gmapTag = `gmap/${sanitizeTag(listName)}`
          parsedPlaces = parseCsv(content).map((p) => ({
            ...p,
            tags: [gmapTag, ...(p.tags ?? [])],
          }))
        } else {
          parsedPlaces = parseGeoJSON(content)
        }

        allParsedPlaces.push(...parsedPlaces)
      } catch (e) {
        logger.error('Failed to parse file:', file.name, e)
        skipped++
      }
    }

    // Merge places by gmap_id, combining tags for duplicates
    const places = mergePlacesByGmapId(allParsedPlaces)

    if (places.length === 0) {
      new Notice('No places found in the selected files')
      return
    }

    let created = 0
    let updated = 0
    let errors = 0
    const createdFileNames: string[] = []

    for (const place of places) {
      const existingNote = existingNotes.find((n) => n.gmapId === place.id)
      if (existingNote) {
        const existingFile = app.vault.getAbstractFileByPath(existingNote.path)
        if (!(existingFile instanceof TFile)) {
          logger.error('Expected TFile:', existingNote.path)
          errors++
          continue
        }
        try {
          const existingContent = await app.vault.read(existingFile)
          const body = extractBody(existingContent)
          const newFrontmatter = buildFrontmatterString(place, {
            existingTags: existingNote.tags ?? [],
          })
          const newContent = body ? `${newFrontmatter}\n\n${body}` : `${newFrontmatter}\n`
          await app.vault.modify(existingFile, newContent)
          updated++
        } catch (e) {
          logger.error('Failed to update:', existingNote.path, e)
          errors++
        }
        continue
      }

      const allFileNames = [...existingFileNames, ...createdFileNames]
      const fileName = generateFileName(place, allFileNames)
      const filePath = `${outputFolder}/${fileName}`

      const noteContent = generateNoteContent(place)
      await app.vault.create(filePath, noteContent)
      createdFileNames.push(fileName)
      created++
    }

    const fileCount = files.length
    const parts = [`${fileCount} files`, `${created} created`, `${updated} updated`]
    if (skipped > 0) {
      parts.push(`${skipped} skipped`)
    }
    if (errors > 0) {
      parts.push(`${errors} errors`)
    }
    new Notice(`Import complete: ${parts.join(', ')}`)
  } catch (error) {
    logger.error(error)
    new Notice(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function selectDataDirectory(): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.webkitdirectory = true

    input.onchange = (): void => {
      const files = Array.from(input.files ?? []).filter(
        (f) =>
          (f.name.endsWith('.csv') || f.name.endsWith('.json')) && !EXCLUDED_FILES.includes(f.name),
      )
      resolve(files)
    }

    input.oncancel = (): void => {
      resolve([])
    }

    input.click()
  })
}

import { type App, Notice, TFile } from 'obsidian'
import { findNoteByGmapId } from '../import/findNoteByGmapId'
import { generateFileName } from '../import/generateFileName'
import {
  buildFrontmatterString,
  extractBody,
  generateNoteContent,
} from '../import/generateNoteContent'
import { loadNoteMetadata } from '../import/loadNoteMetadata'
import { logger } from '../logger'
import { parseCsv } from '../parsers/parseCsv'
import { parseGeoJSON } from '../parsers/parseGeoJSON'
import type { GoogleMapsImportSettings } from '../settings/types'
import type { Place } from '../types'

export async function importGoogleMapsSaved(
  app: App,
  settings: GoogleMapsImportSettings,
): Promise<void> {
  try {
    const file = await selectDataFile()
    if (!file) {
      return
    }

    const content = await file.text()
    let places: Place[]
    if (file.name.endsWith('.csv')) {
      const listName = file.name.replace(/\.csv$/i, '')
      places = parseCsv(content).map((p) => ({ ...p, list: listName }))
    } else {
      places = parseGeoJSON(content)
    }

    if (places.length === 0) {
      new Notice('No places found in the file')
      return
    }

    const outputFolder = settings.outputFolder || 'Google Maps/Places'

    // Ensure output folder exists
    if (!(await app.vault.adapter.exists(outputFolder))) {
      await app.vault.createFolder(outputFolder)
    }

    // Load existing notes metadata for duplicate checking
    const existingNotes = await loadNoteMetadata(app, outputFolder)

    let created = 0
    let updated = 0
    let errors = 0
    const createdFileNames: string[] = []

    for (const place of places) {
      // Check for duplicate by gmap_id
      const existingNotePath = findNoteByGmapId(existingNotes, place.id, outputFolder)
      if (existingNotePath) {
        const existingFile = app.vault.getAbstractFileByPath(existingNotePath)
        if (!(existingFile instanceof TFile)) {
          logger.error('Expected TFile:', existingNotePath)
          errors++
          continue
        }
        try {
          const existingContent = await app.vault.read(existingFile)
          const body = extractBody(existingContent)
          const newFrontmatter = buildFrontmatterString(place)
          const newContent = body ? `${newFrontmatter}\n\n${body}` : `${newFrontmatter}\n`
          await app.vault.modify(existingFile, newContent)
          updated++
        } catch (e) {
          logger.error('Failed to update:', existingNotePath, e)
          errors++
        }
        continue
      }

      // Combine existing files in folder with files created in this batch
      const existingFileNames = existingNotes.map((n) => n.path.split('/').pop() ?? '')
      const allFileNames = [...existingFileNames, ...createdFileNames]
      const fileName = generateFileName(place, allFileNames)
      const filePath = `${outputFolder}/${fileName}`

      const noteContent = generateNoteContent(place)
      await app.vault.create(filePath, noteContent)
      createdFileNames.push(fileName)
      created++
    }

    const parts = [`${created} created`, `${updated} updated`]
    if (errors > 0) {
      parts.push(`${errors} errors`)
    }
    new Notice(`Import complete: ${parts.join(', ')}`)
  } catch (error) {
    logger.error(error)
    new Notice(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function selectDataFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,.csv'

    input.onchange = (): void => {
      const file = input.files?.[0] ?? null
      resolve(file)
    }

    input.oncancel = (): void => {
      resolve(null)
    }

    input.click()
  })
}

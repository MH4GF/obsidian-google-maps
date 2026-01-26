import { type App, Notice, TFile } from 'obsidian'
import { parseCsv } from '../parsers/parseCsv'
import { parseGeoJSON } from '../parsers/parseGeoJSON'
import type { GoogleMapsSyncSettings } from '../settings/types'
import { findNoteByGmapId } from '../sync/findNoteByGmapId'
import { generateFileName } from '../sync/generateFileName'
import {
  buildFrontmatterString,
  extractBody,
  generateNoteContent,
} from '../sync/generateNoteContent'
import { loadNoteMetadata } from '../sync/loadNoteMetadata'
import type { Place } from '../types'

export async function syncGoogleMapsSaved(
  app: App,
  settings: GoogleMapsSyncSettings,
): Promise<void> {
  try {
    const file = await selectDataFile()
    if (!file) {
      return
    }

    const content = await file.text()
    let places: Place[]
    if (file.name.endsWith('.csv')) {
      console.log('[Google Maps Sync] Parsing CSV file:', file.name)
      const listName = file.name.replace(/\.csv$/i, '')
      places = parseCsv(content).map((p) => ({ ...p, list: listName }))
    } else {
      console.log('[Google Maps Sync] Parsing GeoJSON file:', file.name)
      places = parseGeoJSON(content)
    }
    console.log('[Google Maps Sync] Parsed places:', places.length)

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
          console.error('[Google Maps Sync] Expected TFile:', existingNotePath)
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
          console.error('[Google Maps Sync] Failed to update:', existingNotePath, e)
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
    new Notice(`Sync complete: ${parts.join(', ')}`)
  } catch (error) {
    console.error('Google Maps Sync error:', error)
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

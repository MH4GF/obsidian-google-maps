import { Notice, Plugin } from 'obsidian'
import { DEFAULT_SETTINGS } from './constants'
import { findNoteByGmapId } from './findNoteByGmapId'
import { GoogleMapsSyncSettingTab } from './GoogleMapsSyncSettingTab'
import { generateFileName } from './generateFileName'
import { generateNoteContent } from './generateNoteContent'
import { loadNoteMetadata } from './loadNoteMetadata'
import { parseCsv } from './parseCsv'
import { parseGeoJSON } from './parseGeoJSON'
import type { GoogleMapsSyncSettings, Place } from './types'

export default class GoogleMapsSyncPlugin extends Plugin {
  settings: GoogleMapsSyncSettings = DEFAULT_SETTINGS

  override async onload(): Promise<void> {
    await this.loadSettings()

    this.addCommand({
      id: 'sync-google-maps-saved',
      name: 'Sync Google Maps Saved',
      callback: () => this.syncGoogleMapsSaved(),
    })

    this.addSettingTab(new GoogleMapsSyncSettingTab(this.app, this))
  }

  async syncGoogleMapsSaved(): Promise<void> {
    try {
      const file = await this.selectDataFile()
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

      const outputFolder = this.settings.outputFolder || 'Google Maps/Places'

      // Ensure output folder exists
      if (!(await this.app.vault.adapter.exists(outputFolder))) {
        await this.app.vault.createFolder(outputFolder)
      }

      // Load existing notes metadata for duplicate checking
      const existingNotes = await loadNoteMetadata(this.app, outputFolder)

      let created = 0
      let skipped = 0
      const createdFileNames: string[] = []

      for (const place of places) {
        // Check for duplicate by gmap_id
        const existingNotePath = findNoteByGmapId(existingNotes, place.id, outputFolder)
        if (existingNotePath) {
          skipped++
          continue
        }

        // Combine existing files in folder with files created in this batch
        const existingFileNames = existingNotes.map((n) => n.path.split('/').pop() ?? '')
        const allFileNames = [...existingFileNames, ...createdFileNames]
        const fileName = generateFileName(place, allFileNames)
        const filePath = `${outputFolder}/${fileName}`

        const content = generateNoteContent(place)
        await this.app.vault.create(filePath, content)
        createdFileNames.push(fileName)
        created++
      }

      new Notice(`Sync complete: ${created} created, ${skipped} skipped`)
    } catch (error) {
      console.error('Google Maps Sync error:', error)
      new Notice(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private selectDataFile(): Promise<File | null> {
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

  async loadSettings(): Promise<void> {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      (await this.loadData()) as Partial<GoogleMapsSyncSettings>,
    )
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings)
  }
}

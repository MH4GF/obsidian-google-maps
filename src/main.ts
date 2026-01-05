import { Notice, Plugin } from 'obsidian'
import { findNoteByGmapId, loadNoteMetadata } from './duplicate-check'
import { parseGeoJSON } from './geojson-parser'
import { generateFileName, generateNoteContent } from './note-generator'
import { DEFAULT_SETTINGS, type GoogleMapsSyncSettings, GoogleMapsSyncSettingTab } from './settings'

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
      const file = await this.selectJSONFile()
      if (!file) {
        return
      }

      const jsonString = await file.text()
      const places = parseGeoJSON(jsonString)

      if (places.length === 0) {
        new Notice('No places found in the GeoJSON file')
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

  private selectJSONFile(): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'

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

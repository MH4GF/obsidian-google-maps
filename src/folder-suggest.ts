import { AbstractInputSuggest, type App, TFolder } from 'obsidian'

export class FolderSuggest extends AbstractInputSuggest<TFolder> {
  private inputEl: HTMLInputElement

  constructor(app: App, inputEl: HTMLInputElement) {
    super(app, inputEl)
    this.inputEl = inputEl
  }

  getSuggestions(inputStr: string): TFolder[] {
    const lowerInput = inputStr.toLowerCase()
    const folders: TFolder[] = []

    // Add root folder option (represented as "/" or empty)
    const rootFolder = this.app.vault.getRoot()
    if ('/'.includes(lowerInput) || lowerInput === '') {
      folders.push(rootFolder)
    }

    // Get all folders from vault
    const allFolders = this.app.vault
      .getAllLoadedFiles()
      .filter((file): file is TFolder => file instanceof TFolder && file !== rootFolder)

    // Filter by input
    for (const folder of allFolders) {
      if (folder.path.toLowerCase().includes(lowerInput)) {
        folders.push(folder)
      }
    }

    return folders
  }

  renderSuggestion(folder: TFolder, el: HTMLElement): void {
    if (folder.isRoot()) {
      el.setText('/ (root)')
    } else {
      el.setText(folder.path)
    }
  }

  override selectSuggestion(folder: TFolder): void {
    const value = folder.isRoot() ? '' : folder.path
    this.inputEl.value = value
    this.inputEl.trigger('input')
    this.close()
  }
}

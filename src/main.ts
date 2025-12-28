import { Notice, Plugin } from "obsidian";
import {
  DEFAULT_SETTINGS,
  GoogleMapsSyncSettings,
  GoogleMapsSyncSettingTab,
} from "./settings";

export default class GoogleMapsSyncPlugin extends Plugin {
  settings: GoogleMapsSyncSettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: "sync-google-maps-saved",
      name: "Sync Google Maps Saved",
      callback: () => this.syncGoogleMapsSaved(),
    });

    this.addSettingTab(new GoogleMapsSyncSettingTab(this.app, this));
  }

  async syncGoogleMapsSaved() {
    try {
      const outputFolder = "Google Maps/Places";

      // Ensure output folder exists
      if (!(await this.app.vault.adapter.exists(outputFolder))) {
        await this.app.vault.createFolder(outputFolder);
      }

      // Generate dummy note for Tokyo Station
      const fileName = `${outputFolder}/東京駅 - dummy.md`;
      const now = new Date().toISOString();

      const content = `---
source: google-maps-takeout
gmap_id: dummy-tokyo-station
gmap_url: https://maps.google.com/?cid=0
coordinates: [35.6762, 139.6503]
address: 東京都千代田区丸の内1丁目
last_synced: ${now}
---

# 東京駅

<!-- BEGIN:SYNC -->
- Google Maps: https://maps.google.com/?cid=0
- Address: 東京都千代田区丸の内1丁目
- Coordinates: 35.6762, 139.6503
<!-- END:SYNC -->

## Memo
`;

      // Check if file already exists
      if (await this.app.vault.adapter.exists(fileName)) {
        new Notice("Note already exists: 東京駅 - dummy.md");
        return;
      }

      await this.app.vault.create(fileName, content);
      new Notice("Created: 東京駅 - dummy.md");
    } catch (error) {
      console.error("Google Maps Sync error:", error);
      new Notice(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      (await this.loadData()) as Partial<GoogleMapsSyncSettings>
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

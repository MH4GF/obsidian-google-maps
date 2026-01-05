# Google Maps Sync

Sync your Google Maps saved places from Takeout export to your Obsidian vault.

## Features

- Import saved places from Google Takeout export
- Generate one note per place with coordinates for Obsidian Bases Map view
- Non-destructive sync: user edits outside sync blocks are preserved

## Installation

### From source (development)

1. Clone this repository into your vault's plugins folder:
   ```bash
   cd /path/to/your/vault/.obsidian/plugins
   git clone https://github.com/MH4GF/obsidian-google-maps.git
   cd obsidian-google-maps
   ```

2. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```

3. Enable the plugin:
   - Open Obsidian Settings
   - Go to Community plugins
   - Find "Google Maps Sync" and enable it

### From GitHub Releases

1. Download `obsidian-google-maps.zip` from the [latest release](https://github.com/MH4GF/obsidian-google-maps/releases/latest)
2. Extract and place the `obsidian-google-maps` folder into your vault's `.obsidian/plugins/` directory
3. Enable the plugin in Obsidian Settings > Community plugins

## Usage

### 1. Export your saved places from Google Takeout

1. Go to [Google Takeout](https://takeout.google.com/)
2. Deselect all, then select only **Google Maps (your places)**
3. Download and extract the archive
4. Locate `Saved Places.json` (or `保存した場所.json` in Japanese)

### 2. Run the sync command

1. Open Command Palette (Cmd/Ctrl + P)
2. Run **Sync Google Maps Saved**
3. Select the `Saved Places.json` file from the file picker
4. Notes will be created in your configured output folder

Re-running sync is safe: existing places are detected by ID and skipped.

## Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Output Folder | Where place notes are created | `Google Maps/Places` |

## Note Format

Each place note includes:

- **Frontmatter**: `coordinates`, `gmap_url`, `address`, etc.
- **Sync block**: Auto-updated content between `<!-- BEGIN:SYNC -->` and `<!-- END:SYNC -->`
- **Memo section**: Your personal notes (preserved during sync)

Example:

```markdown
---
gmap_id: "cid-12345678"
gmap_url: "https://maps.google.com/?cid=12345678"
coordinates: [35.6586, 139.7454]
address: "Shibakoen 4-2-8, Minato-ku"
last_synced: "2024-01-15T12:00:00.000Z"
---

# Tokyo Tower

<!-- BEGIN:SYNC -->
- Google Maps: https://maps.google.com/?cid=12345678
- Address: Shibakoen 4-2-8, Minato-ku
- Coordinates: 35.6586, 139.7454
<!-- END:SYNC -->

## Memo

Your notes here (preserved during re-sync)
```

## Map View

Notes work with [Obsidian Bases](https://help.obsidian.md/bases) (v1.9+). Create a Base with Map view to visualize your saved places on an interactive map. The `coordinates` property is automatically recognized.

## License

[0BSD](LICENSE)

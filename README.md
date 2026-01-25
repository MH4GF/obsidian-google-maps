# Google Maps Sync

Sync your Google Maps saved places from Takeout export to your Obsidian vault.

## Features

- Import saved places from Google Takeout export (GeoJSON and CSV)
- Generate one note per place with coordinates for [Obsidian Bases](https://help.obsidian.md/bases) Map view
- Non-destructive sync: existing places are detected by ID and skipped

## Installation

1. Download `obsidian-google-maps.zip` from the [latest release](https://github.com/MH4GF/obsidian-google-maps/releases/latest)
2. Extract and place the `obsidian-google-maps` folder into your vault's `.obsidian/plugins/` directory
3. Enable the plugin in **Settings → Community plugins**

## Usage

### 1. Export your saved places from Google Takeout

1. Go to [Google Takeout](https://takeout.google.com/)
2. Deselect all, then select only **Google Maps (your places)**
3. Download and extract the archive
4. Locate export files:
   - **GeoJSON**: `Saved Places.json` (includes coordinates)
   - **CSV**: Files in the lists folder, e.g., `Favourites.csv` (no coordinates)

### 2. Run the sync command

1. Open Command Palette (Cmd/Ctrl + P)
2. Run **Sync Google Maps Saved**
3. Select a `.json` or `.csv` file
4. Notes will be created in your configured output folder

## Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Output Folder | Where place notes are created | `Google Maps/Places` |

## Note Format

Each place note contains frontmatter only, leaving the body empty for your own content:

```markdown
---
source: google-maps-takeout
gmap_id: "cid-12345678"
gmap_url: "https://maps.google.com/?cid=12345678"
coordinates: [35.6586, 139.7454]
address: "Shibakoen 4-2-8, Minato-ku"
last_synced: "2024-01-15T12:00:00.000Z"
---
```

**Note**: CSV files do not include coordinates. Use GeoJSON for Map view.

## Development

For contributors and developers who want to build from source:

1. Clone this repository into your vault's plugins folder:
   ```bash
   cd /path/to/your/vault/.obsidian/plugins
   git clone https://github.com/MH4GF/obsidian-google-maps.git
   cd obsidian-google-maps
   ```

2. Install dependencies and build:
   ```bash
   bun install
   bun run build
   ```

3. Enable the plugin in **Settings → Community plugins**

See [AGENTS.md](AGENTS.md) for detailed development instructions.

## License

[0BSD](LICENSE)

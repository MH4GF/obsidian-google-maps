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

1. Open Command Palette (Cmd/Ctrl + P)
2. Run "Sync Google Maps Saved"
3. Notes will be created in `Google Maps/Places/` folder

## Note Format

Each place note includes:

- **Frontmatter**: `coordinates`, `gmap_url`, `address`, etc.
- **Sync block**: Auto-updated content between `<!-- BEGIN:SYNC -->` and `<!-- END:SYNC -->`
- **Memo section**: Your personal notes (preserved during sync)

## Map View

Notes are compatible with Obsidian Bases Map view. The `coordinates` property contains `[lat, lng]` for map display.

## License

[0BSD](LICENSE)

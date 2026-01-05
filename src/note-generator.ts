import type { Place } from './types'

export type NoteGeneratorOptions = {
  includeCoordinates?: boolean
}

/**
 * Generate Markdown note content from Place
 */
export function generateNoteContent(place: Place, options: NoteGeneratorOptions = {}): string {
  const { includeCoordinates = true } = options
  const now = new Date().toISOString()

  const frontmatter = buildFrontmatter(place, now, includeCoordinates)
  const body = buildBody(place)

  return `${frontmatter}\n${body}`
}

function buildFrontmatter(place: Place, syncedAt: string, includeCoordinates: boolean): string {
  const lines: string[] = ['---']

  lines.push('source: google-maps-takeout')
  lines.push(`gmap_id: "${place.id}"`)

  if (place.url) {
    lines.push(`gmap_url: "${place.url}"`)
  }

  // Only include coordinates if we have valid ones
  if (includeCoordinates && place.lat !== 0 && place.lng !== 0) {
    lines.push(`coordinates: [${place.lat}, ${place.lng}]`)
  }

  if (place.address) {
    lines.push(`address: "${escapeYamlString(place.address)}"`)
  }

  lines.push(`last_synced: "${syncedAt}"`)
  lines.push('---')

  return lines.join('\n')
}

function buildBody(place: Place): string {
  return `
# ${place.name}

## Memo
`
}

/**
 * Generate safe filename from place name
 * Adds numeric suffix if collision with existing files
 */
export function generateFileName(place: Place, existingFiles: string[] = []): string {
  const safeName = sanitizeFileName(place.name)
  const baseName = `${safeName}.md`

  if (!existingFiles.includes(baseName)) {
    return baseName
  }

  // Find smallest available suffix
  let suffix = 1
  while (existingFiles.includes(`${safeName} ${suffix}.md`)) {
    suffix++
  }
  return `${safeName} ${suffix}.md`
}

/**
 * Sanitize filename by removing/replacing invalid characters
 */
function sanitizeFileName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid chars
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .slice(0, 100) // Limit length
}

/**
 * Escape special characters in YAML string values
 * Order matters: backslash must be escaped first to avoid double-escaping
 */
function escapeYamlString(value: string): string {
  return value
    .replace(/\\/g, '\\\\') // Escape backslash first
    .replace(/\n/g, '\\n') // Escape newline (LF)
    .replace(/\r/g, '\\r') // Escape carriage return (CR)
    .replace(/\t/g, '\\t') // Escape tab
    .replace(/"/g, '\\"') // Escape double quote
}

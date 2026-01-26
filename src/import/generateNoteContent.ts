import type { Place } from '../types'
import type { NoteGeneratorOptions } from './types'

/**
 * Generate Markdown note content from Place
 */
export function generateNoteContent(place: Place, options: NoteGeneratorOptions = {}): string {
  const { includeCoordinates = true } = options
  const now = new Date().toISOString()

  const frontmatter = buildFrontmatter(place, now, includeCoordinates)

  return `${frontmatter}\n`
}

function buildFrontmatter(place: Place, importedAt: string, includeCoordinates: boolean): string {
  const lines: string[] = ['---']

  lines.push('source: google-maps-takeout')
  lines.push(`gmap_id: "${place.id}"`)

  if (place.list) {
    lines.push(`list: "${escapeYamlString(place.list)}"`)
  }

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

  if (place.tags) {
    lines.push(`tags: ["${escapeYamlString(place.tags)}"]`)
  }

  if (place.memo) {
    lines.push(`memo: "${escapeYamlString(place.memo)}"`)
  }

  if (place.comment) {
    lines.push(`comment: "${escapeYamlString(place.comment)}"`)
  }

  lines.push(`last_imported_at: "${importedAt}"`)
  lines.push('---')

  return lines.join('\n')
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

/**
 * Build frontmatter string for updating existing notes
 */
export function buildFrontmatterString(place: Place, options: NoteGeneratorOptions = {}): string {
  const { includeCoordinates = true } = options
  const now = new Date().toISOString()
  return buildFrontmatter(place, now, includeCoordinates)
}

/**
 * Extract body content from note (everything after frontmatter)
 */
export function extractBody(content: string): string {
  if (!content.startsWith('---')) {
    return content
  }
  const frontmatterEnd = content.indexOf('\n---\n', 3)
  if (frontmatterEnd === -1) {
    // Check for frontmatter ending at EOF (no trailing newline after ---)
    const eofEnd = content.indexOf('\n---', 3)
    if (eofEnd !== -1 && eofEnd + 4 === content.length) {
      return ''
    }
    return content
  }
  return content.slice(frontmatterEnd + 5).trimStart()
}

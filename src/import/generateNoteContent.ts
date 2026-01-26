import type { Place } from '../types'
import type { NoteGeneratorOptions } from './types'

export function generateNoteContent(place: Place, options: NoteGeneratorOptions = {}): string {
  return `${buildFrontmatterString(place, options)}\n`
}

function buildFrontmatter(
  place: Place,
  importedAt: string,
  includeCoordinates: boolean,
  existingTags: string[],
): string {
  const lines: string[] = ['---']

  lines.push('source: google-maps-takeout')
  lines.push(`gmap_id: "${place.id}"`)

  if (place.url) {
    lines.push(`gmap_url: "${place.url}"`)
  }

  if (includeCoordinates && place.lat !== 0 && place.lng !== 0) {
    lines.push(`coordinates: [${place.lat}, ${place.lng}]`)
  }

  if (place.address) {
    lines.push(`address: "${escapeYamlString(place.address)}"`)
  }

  const mergedTags = buildTagsArray(place.tags ?? [], existingTags)
  if (mergedTags.length > 0) {
    const tagsStr = mergedTags.map((t) => `"${escapeYamlString(t)}"`).join(', ')
    lines.push(`tags: [${tagsStr}]`)
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

export function buildTagsArray(placeTags: string[], existingTags: string[]): string[] {
  const gmapTags = new Set<string>()
  const userTags = new Set<string>()

  for (const tag of [...existingTags, ...placeTags].filter((t) => t !== '')) {
    if (tag.startsWith('gmap/')) {
      gmapTags.add(tag)
    } else {
      userTags.add(tag)
    }
  }

  return [...Array.from(gmapTags).sort(), ...Array.from(userTags).sort()]
}

function escapeYamlString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/"/g, '\\"')
}

export function buildFrontmatterString(place: Place, options: NoteGeneratorOptions = {}): string {
  const { includeCoordinates = true, existingTags = [] } = options
  const now = new Date().toISOString()
  return buildFrontmatter(place, now, includeCoordinates, existingTags)
}

export function extractBody(content: string): string {
  const match = content.match(/^---\n[\s\S]*?\n---\n?/)
  if (!match) {
    return content
  }
  return content.slice(match[0].length).trimStart()
}

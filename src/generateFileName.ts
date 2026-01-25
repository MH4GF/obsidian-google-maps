import type { Place } from './types'

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

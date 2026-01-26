/**
 * Generate hash-based ID as fallback
 */
export function generateHashId(name: string, address?: string): string {
  const input = `${name}|${address ?? ''}`
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return `hash-${Math.abs(hash).toString(16)}`
}

/**
 * Extract cid from Google Maps URL
 * Example: https://maps.google.com/?cid=12345 -> "12345"
 */
export function extractCidFromUrl(url: string): string | null {
  const match = url.match(/[?&]cid=(\d+)/)
  return match?.[1] ?? null
}

/**
 * Extract stable ID from Google Maps URL
 * Priority: cid > place_id pattern > hash
 */
export function extractIdFromUrl(url: string | undefined): string | null {
  if (!url) return null

  // Try cid first
  const cid = extractCidFromUrl(url)
  if (cid) return `cid-${cid}`

  // Try 0x...:0x... pattern (place_id in some URLs)
  const placeIdMatch = url.match(/(0x[a-f0-9]+:0x[a-f0-9]+)/i)
  if (placeIdMatch) return `pid-${placeIdMatch[1]}`

  return null
}

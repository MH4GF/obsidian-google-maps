/**
 * Extract cid from Google Maps URL
 * Example: https://maps.google.com/?cid=12345 -> "12345"
 */
export function extractCidFromUrl(url: string): string | null {
  const match = url.match(/[?&]cid=(\d+)/)
  return match?.[1] ?? null
}

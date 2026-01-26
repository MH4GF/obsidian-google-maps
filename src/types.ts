/**
 * Internal Place model - normalized from various input formats
 */
export type Place = {
  id: string
  name: string
  url?: string
  lat: number
  lng: number
  address?: string
  memo?: string
  tags?: string[]
  comment?: string
}

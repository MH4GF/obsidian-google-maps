import type { Place } from '../types'
import { extractIdFromUrl } from './extractIdFromUrl'
import { generateHashId } from './generateHashId'
import type { TakeoutCsvRow } from './types'

/**
 * Parse Google Takeout CSV (保存済み/*.csv) into Place array
 * CSV format: タイトル,メモ,URL,タグ,コメント
 */
export function parseCsv(csvString: string): Place[] {
  const rows = splitCsvRows(csvString)

  if (rows.length <= 1) {
    return []
  }

  // Skip header row (first line)
  const dataRows = rows.slice(1)

  return dataRows
    .map((row) => parseCsvLine(row))
    .filter((row): row is TakeoutCsvRow => row !== null && row.title !== '')
    .map((row) => rowToPlace(row))
}

/**
 * Split CSV string into rows, handling newlines inside quoted fields
 */
function splitCsvRows(csvString: string): string[] {
  const rows: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < csvString.length; i++) {
    const char = csvString[i]

    if (char === '"') {
      // Check for escaped quote ""
      if (inQuotes && i + 1 < csvString.length && csvString[i + 1] === '"') {
        current += '""'
        i++
        continue
      }
      inQuotes = !inQuotes
      current += char
    } else if (char === '\n' && !inQuotes) {
      rows.push(current)
      current = ''
    } else if (char === '\r' && !inQuotes) {
      // Handle \r\n (Windows line endings)
      if (i + 1 < csvString.length && csvString[i + 1] === '\n') {
        i++
      }
      rows.push(current)
      current = ''
    } else {
      current += char
    }
  }

  // Push last row if not empty
  if (current !== '') {
    rows.push(current)
  }

  return rows
}

/**
 * Parse a single CSV line handling quoted fields
 */
function parseCsvLine(line: string): TakeoutCsvRow | null {
  const trimmed = line.trim()
  if (trimmed === '') {
    return null
  }

  const fields = parseFields(trimmed)
  if (fields.length < 5) {
    return null
  }

  return {
    title: fields[0] ?? '',
    memo: fields[1] ?? '',
    url: fields[2] ?? '',
    tags: fields[3] ?? '',
    comment: fields[4] ?? '',
  }
}

/**
 * Parse CSV fields handling quoted values
 * - Fields containing commas are wrapped in double quotes
 * - Double quotes inside quoted fields are escaped as ""
 */
function parseFields(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]

    if (inQuotes) {
      if (char === '"') {
        // Check for escaped quote ""
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i += 2
          continue
        }
        // End of quoted field
        inQuotes = false
        i++
        continue
      }
      current += char
      i++
    } else {
      if (char === '"') {
        inQuotes = true
        i++
        continue
      }
      if (char === ',') {
        fields.push(current)
        current = ''
        i++
        continue
      }
      current += char
      i++
    }
  }

  // Push last field
  fields.push(current)

  return fields
}

/**
 * Convert CSV row to Place
 * CSV has no coordinates, so lat/lng are 0
 */
function rowToPlace(row: TakeoutCsvRow): Place {
  const id = extractIdFromUrl(row.url) ?? generateHashId(row.title, '')

  return {
    id,
    name: row.title,
    ...(row.url && { url: row.url }),
    lat: 0,
    lng: 0,
    ...(row.memo && { memo: row.memo }),
    ...(row.tags && { tags: row.tags }),
    ...(row.comment && { comment: row.comment }),
  }
}

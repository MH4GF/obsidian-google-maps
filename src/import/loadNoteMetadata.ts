import type { App } from 'obsidian'
import type { NoteMetadata } from './types'

export async function loadNoteMetadata(app: App, folderPrefix: string): Promise<NoteMetadata[]> {
  const markdownFiles = app.vault.getMarkdownFiles()
  const metadata: NoteMetadata[] = []

  for (const file of markdownFiles) {
    if (!file.path.startsWith(folderPrefix)) {
      continue
    }

    let gmapId: string | undefined
    let tags: string[] | undefined
    const cache = app.metadataCache.getFileCache(file)

    if (cache?.frontmatter) {
      gmapId = extractGmapIdFromFrontmatter(cache.frontmatter['gmap_id'])
      tags = extractTagsFromFrontmatter(cache.frontmatter['tags'])
    }

    if (!gmapId || !tags) {
      try {
        const fileContent = await app.vault.read(file)
        if (!gmapId) {
          gmapId = extractGmapIdFromContent(fileContent)
        }
        if (!tags) {
          tags = extractTagsFromContent(fileContent)
        }
      } catch {
        // File read errors are silently ignored
      }
    }

    metadata.push({
      path: file.path,
      gmapId,
      ...(tags && { tags }),
    })
  }

  return metadata
}

function extractGmapIdFromFrontmatter(rawGmapId: unknown): string | undefined {
  if (typeof rawGmapId !== 'string') {
    return undefined
  }
  return rawGmapId.replace(/^["']|["']$/g, '')
}

function extractTagsFromFrontmatter(rawTags: unknown): string[] | undefined {
  if (Array.isArray(rawTags)) {
    return rawTags.filter((t): t is string => typeof t === 'string')
  }
  if (typeof rawTags === 'string' && rawTags !== '') {
    return [rawTags]
  }
  return undefined
}

function extractGmapIdFromContent(content: string): string | undefined {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatterMatch?.[1]) {
    return undefined
  }

  const gmapIdMatch = frontmatterMatch[1].match(/^gmap_id:\s*(?:"([^"]+)"|'([^']+)'|(\S+))$/m)
  return gmapIdMatch?.[1] ?? gmapIdMatch?.[2] ?? gmapIdMatch?.[3]
}

function extractTagsFromContent(content: string): string[] | undefined {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatterMatch?.[1]) {
    return undefined
  }

  // tags: ["tag1", "tag2"] 形式
  const arrayMatch = frontmatterMatch[1].match(/^tags:\s*\[(.*)\]$/m)
  if (arrayMatch?.[1]) {
    const tags = arrayMatch[1].match(/"([^"]+)"|'([^']+)'/g)
    return tags?.map((t) => t.slice(1, -1)) ?? []
  }

  // tags: tag1 形式（単一文字列）
  const stringMatch = frontmatterMatch[1].match(/^tags:\s*(\S+)$/m)
  if (stringMatch?.[1] && !stringMatch[1].startsWith('[')) {
    return [stringMatch[1]]
  }

  return undefined
}

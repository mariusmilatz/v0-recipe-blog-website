import { list, put } from "@vercel/blob"

/**
 * Notion "files" properties return AWS S3 pre-signed URLs that expire after
 * roughly one hour. If we serve those URLs directly, images break for visitors
 * once the signature expires (or once the page HTML is cached).
 *
 * To fix this we mirror each Notion image into permanent Vercel Blob storage,
 * using a deterministic pathname so we only upload each image once.
 */

const BLOB_PREFIX = "notion-recipes"

// Extract a file extension from a Notion signed URL (ignoring query params).
function getExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname
    const match = pathname.match(/\.([a-zA-Z0-9]+)$/)
    return match ? match[1].toLowerCase() : "jpg"
  } catch {
    return "jpg"
  }
}

/**
 * Mirror a single Notion image to Blob storage and return the stable URL.
 * Falls back to the original URL if anything goes wrong.
 */
async function cacheImage(signedUrl: string, key: string): Promise<string> {
  if (!signedUrl || !process.env.BLOB_READ_WRITE_TOKEN) {
    return signedUrl
  }

  // Already a permanent Blob URL — nothing to do.
  if (signedUrl.includes(".public.blob.vercel-storage.com")) {
    return signedUrl
  }

  const ext = getExtension(signedUrl)
  const pathname = `${BLOB_PREFIX}/${key}.${ext}`

  try {
    // Return the existing blob if we've already cached this image.
    const existing = await list({ prefix: pathname, limit: 1 })
    if (existing.blobs.length > 0 && existing.blobs[0].pathname === pathname) {
      return existing.blobs[0].url
    }

    // Download the image from Notion's signed URL and store it permanently.
    const response = await fetch(signedUrl)
    if (!response.ok) {
      return signedUrl
    }

    const blob = await put(pathname, await response.arrayBuffer(), {
      access: "public",
      contentType: response.headers.get("content-type") || undefined,
      addRandomSuffix: false,
      allowOverwrite: true,
    })

    return blob.url
  } catch (error) {
    console.error("[v0] Error caching Notion image to Blob:", error)
    return signedUrl
  }
}

/**
 * Mirror an array of Notion images to Blob storage, preserving order.
 * `pageId` is used to build deterministic, unique keys per recipe.
 */
export async function cacheNotionImages(images: string[], pageId: string): Promise<string[]> {
  if (!Array.isArray(images) || images.length === 0) {
    return []
  }

  const safeId = pageId.replace(/[^a-zA-Z0-9]/g, "")

  return Promise.all(images.map((url, index) => cacheImage(url, `${safeId}-${index}`)))
}

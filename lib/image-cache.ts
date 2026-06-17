import { head, put } from "@vercel/blob"

// Notion serves uploaded files via AWS S3 signed URLs that expire after ~1 hour.
// To make images durable, we download each Notion image once and store a permanent
// copy in Vercel Blob, then serve that copy instead.
//
// The stable part of a Notion file URL is its path (everything before the `?`
// signature query string), e.g.:
//   https://prod-files-secure.s3.us-west-2.amazonaws.com/<workspace>/<block-id>/<file>?X-Amz-...
// We derive a deterministic Blob key from that path so the same Notion file always
// maps to the same Blob object — letting us dedupe and avoid re-uploading.

const BLOB_PREFIX = "notion-images"

// Only re-host URLs that actually expire (Notion's S3 / file uploads).
// External URLs (already-public links) and our own Blob URLs are left untouched.
function isExpiringNotionUrl(url: string): boolean {
  if (!url) return false
  return (
    url.includes("amazonaws.com") ||
    url.includes("notion-static.com") ||
    url.includes("secure.notion-static.com") ||
    url.includes("prod-files-secure")
  )
}

// Build a stable Blob key from the Notion URL's path (ignoring the signature query).
function blobKeyForNotionUrl(url: string): string {
  const parsed = new URL(url)
  // pathname looks like /<workspace>/<block-id>/<filename>
  // Strip leading slash and use it directly; it's unique and stable per file.
  const cleanPath = parsed.pathname.replace(/^\/+/, "")
  return `${BLOB_PREFIX}/${cleanPath}`
}

// Re-host a single Notion image URL to Blob and return the permanent public URL.
// Falls back to the original URL if anything goes wrong (so pages never break).
export async function cacheNotionImage(url: string): Promise<string> {
  try {
    if (!url || !isExpiringNotionUrl(url)) {
      return url
    }

    const key = blobKeyForNotionUrl(url)

    // If we've already cached this file, reuse it.
    try {
      const existing = await head(key)
      if (existing?.url) {
        return existing.url
      }
    } catch {
      // head() throws when the blob doesn't exist yet — that's expected, continue to upload.
    }

    // Download the image from Notion's (still-valid) signed URL.
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`[v0] Failed to download Notion image (${response.status}): ${key}`)
      return url
    }

    const contentType = response.headers.get("content-type") || "image/jpeg"
    const arrayBuffer = await response.arrayBuffer()

    const blob = await put(key, Buffer.from(arrayBuffer), {
      access: "public",
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    })

    return blob.url
  } catch (error) {
    console.error("[v0] Error caching Notion image, falling back to original URL:", error)
    return url
  }
}

// Re-host an array of Notion image URLs in parallel.
export async function cacheNotionImages(urls: string[]): Promise<string[]> {
  if (!Array.isArray(urls) || urls.length === 0) return []
  return Promise.all(urls.map((u) => cacheNotionImage(u)))
}

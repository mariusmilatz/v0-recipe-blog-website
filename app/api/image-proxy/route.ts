import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const pageId = searchParams.get("pageId")
  const index = parseInt(searchParams.get("index") || "0", 10)

  if (!pageId) {
    return new NextResponse("Missing pageId", { status: 400 })
  }

  const notionKey = process.env.NOTION_KEY
  if (!notionKey) {
    return new NextResponse("Server configuration error", { status: 500 })
  }

  try {
    // Fetch the Notion page to get a fresh, non-expired image URL
    const pageResponse = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      headers: {
        Authorization: `Bearer ${notionKey}`,
        "Notion-Version": "2022-06-28",
      },
      cache: "no-store",
    })

    if (!pageResponse.ok) {
      return new NextResponse("Failed to fetch Notion page", { status: 502 })
    }

    const page = await pageResponse.json()
    const titleImageProp = page.properties?.["Title Image"]
    const files: any[] = titleImageProp?.files || []

    const fileAtIndex = files[index]
    if (!fileAtIndex) {
      return new NextResponse("Image not found at index", { status: 404 })
    }

    const imageUrl: string | undefined = fileAtIndex.file?.url || fileAtIndex.external?.url
    if (!imageUrl) {
      return new NextResponse("Image URL missing", { status: 404 })
    }

    // Fetch the actual image bytes
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      return new NextResponse("Failed to fetch image", { status: 502 })
    }

    const contentType = imageResponse.headers.get("content-type") || "image/jpeg"
    const imageBuffer = await imageResponse.arrayBuffer()

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        // Cache for 30 min — safely under Notion's ~1 hr signed URL expiry.
        // Vercel CDN (s-maxage) caches the bytes so subsequent requests are served
        // without hitting Notion at all.
        "Cache-Control": "public, max-age=1800, s-maxage=1800, stale-while-revalidate=300",
      },
    })
  } catch (error) {
    console.error("Image proxy error:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}

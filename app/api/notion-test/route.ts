import { NextResponse } from "next/server"
import { Client } from "@notionhq/client"

export async function GET() {
  try {
    // Format database ID with hyphens if needed
    function formatDatabaseId(id: string): string {
      // If the ID already has hyphens, return it as is
      if (id.includes("-")) return id

      // Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`
    }

    // Initialize Notion client
    const notion = new Client({
      auth: process.env.NOTION_KEY,
    })

    // Get the database ID from environment variables
    const rawDatabaseId = process.env.NOTION_PAGE_ID || ""
    const databaseId = formatDatabaseId(rawDatabaseId)

    // Get database info
    const database = await notion.databases.retrieve({
      database_id: databaseId,
    })

    // Query for a sample recipe
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 1,
    })

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Notion API",
      databaseTitle: database.title?.[0]?.plain_text || "Untitled Database",
      databaseProperties: Object.keys(database.properties),
      sampleRecipe:
        response.results.length > 0
          ? {
              id: response.results[0].id,
              properties: response.results[0].properties,
            }
          : null,
      notionKey: process.env.NOTION_KEY
        ? `Set (first few chars: ${process.env.NOTION_KEY.substring(0, 5)}...)`
        : "Not set",
      notionPageId: rawDatabaseId,
      formattedPageId: databaseId,
    })
  } catch (error) {
    console.error("Error connecting to Notion API:", error)

    function formatDatabaseId(id: string): string {
      if (id.includes("-")) return id
      return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`
    }

    return NextResponse.json(
      {
        error: "Failed to connect to Notion API",
        message: error.message,
        notionKey: process.env.NOTION_KEY
          ? `Set (first few chars: ${process.env.NOTION_KEY.substring(0, 5)}...)`
          : "Not set",
        notionPageId: process.env.NOTION_PAGE_ID,
        formattedPageId: formatDatabaseId(process.env.NOTION_PAGE_ID || ""),
      },
      { status: 500 },
    )
  }
}

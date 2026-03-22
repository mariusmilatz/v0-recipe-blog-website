import { NextResponse } from "next/server"
import { Client } from "@notionhq/client"
import { getAboutPageContent } from "@/lib/notion-about"

export async function GET() {
  const notion = new Client({
    auth: process.env.NOTION_KEY,
  })

  const databaseId = process.env.NOTION_ABOUT_DATABASE_ID

  if (!databaseId) {
    return NextResponse.json({
      success: false,
      message: "NOTION_ABOUT_DATABASE_ID is not defined",
    })
  }

  try {
    // Get database information
    const database = await notion.databases.retrieve({
      database_id: databaseId,
    })

    // Get all properties in the database
    const properties = Object.keys(database.properties)

    // Check for required properties (case-insensitive)
    const requiredProperties = [
      "About Us Description",
      "Story Title",
      "Story Text",
      "Story Image",
      "Mission Title",
      "Mission Text",
      "Mission Image",
    ]

    // Check which properties exist (case-insensitive)
    const existingProperties = requiredProperties.map((required) => {
      const found = properties.find((prop) => prop.toLowerCase() === required.toLowerCase())
      return {
        required,
        found: found || null,
        exists: !!found,
      }
    })

    const missingProperties = existingProperties.filter((prop) => !prop.exists).map((prop) => prop.required)

    // Get property types
    const propertyTypes: Record<string, string> = {}
    for (const [key, value] of Object.entries(database.properties)) {
      propertyTypes[key] = value.type
    }

    // Check for Published or Publish property
    const publishPropertyName = properties.find(
      (prop) => prop.toLowerCase() === "published" || prop.toLowerCase() === "publish",
    )

    // Query for all entries
    const allResponse = await notion.databases.query({
      database_id: databaseId,
    })

    // Query for published entries if the property exists
    let publishedResponse = { results: [] }
    let publishedQueryError = null

    if (publishPropertyName) {
      try {
        publishedResponse = await notion.databases.query({
          database_id: databaseId,
          filter: {
            property: publishPropertyName,
            checkbox: {
              equals: true,
            },
          },
        })
      } catch (error: any) {
        publishedQueryError = error.message
      }
    }

    // Get a sample entry if available
    let sampleEntry = null
    if (allResponse.results.length > 0) {
      const page = allResponse.results[0]
      sampleEntry = {
        id: page.id,
        properties: (page as any).properties,
      }
    }

    // Check if the Published property exists and is a checkbox
    const publishPropertyExists = !!publishPropertyName
    const publishPropertyType = publishPropertyExists ? propertyTypes[publishPropertyName!] : "missing"
    const isPublishPropertyCorrect = publishPropertyType === "checkbox"

    // Determine status message for published entries
    let publishedStatus = ""
    if (!publishPropertyExists) {
      publishedStatus =
        "⚠️ Your database doesn't have a 'Published' or 'Publish' checkbox property. All entries will be shown."
    } else if (!isPublishPropertyCorrect) {
      publishedStatus = `❌ Your '${publishPropertyName}' property is not a checkbox (it's a ${publishPropertyType}). Change it to a checkbox.`
    } else if (publishedResponse.results.length === 0) {
      publishedStatus = `⚠️ You have no published about page entries. Check the '${publishPropertyName}' checkbox for at least one entry.`
    } else {
      publishedStatus = `✅ You have ${publishedResponse.results.length} published about page entries`
    }

    // Fetch content using the new function
    const content = await getAboutPageContent()

    return NextResponse.json({
      success: true,
      message: "Notion about database connection successful",
      databaseName: database.title[0]?.plain_text || "Unnamed Database",
      databaseId,
      totalEntries: allResponse.results.length,
      publishedEntries: publishedResponse.results.length,
      publishPropertyExists,
      publishPropertyName,
      publishPropertyType,
      isPublishPropertyCorrect,
      publishedQueryError,
      properties,
      propertyTypes,
      requiredProperties,
      existingProperties,
      missingProperties,
      sampleEntry,
      publishedStatus,
      content,
    })
  } catch (error: any) {
    console.error("Error in notion-about-debug route:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Failed to connect to Notion: ${error.message}`,
        error: error.toString(),
      },
      { status: 500 },
    )
  }
}

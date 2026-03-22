import { NextResponse } from "next/server"
import { Client } from "@notionhq/client"

export async function GET() {
  try {
    // Initialize Notion client
    const notion = new Client({
      auth: process.env.NOTION_KEY,
    })

    const databaseId = process.env.NOTION_TIPS_DATABASE_ID

    if (!databaseId) {
      return NextResponse.json({
        status: "error",
        message: "NOTION_TIPS_DATABASE_ID environment variable is not set",
      })
    }

    // Check if we can connect to the database
    let databaseInfo
    try {
      databaseInfo = await notion.databases.retrieve({
        database_id: databaseId,
      })
    } catch (error: any) {
      return NextResponse.json({
        status: "error",
        message: `Failed to connect to Notion database: ${error.message}`,
        error: error.body || error.message,
      })
    }

    // Get database properties
    const properties = databaseInfo.properties
    const propertyNames = Object.keys(properties)
    const propertyTypes: Record<string, string> = {}

    for (const name in properties) {
      propertyTypes[name] = properties[name].type
    }

    // Check for required properties
    const requiredProperties = [
      "Title",
      "Short Description",
      "Tags",
      "Publish Date",
      "Author",
      "Author Job",
      "Author discription",
      "Title Image",
      "Paragraph 1",
      "Image 1",
      "Publish",
    ]

    const missingProperties = requiredProperties.filter((prop) => !propertyNames.includes(prop))

    // Query the database for all tips
    let tips
    try {
      tips = await notion.databases.query({
        database_id: databaseId,
        page_size: 100,
      })
    } catch (error: any) {
      return NextResponse.json({
        status: "error",
        message: `Failed to query Notion database: ${error.message}`,
        error: error.body || error.message,
      })
    }

    // Check for published tips
    let publishedTips = []
    let publishedPropertyExists = false
    let publishedPropertyType = "missing"
    let isPublishedPropertyCorrect = false
    let publishedQueryError = null

    if (propertyNames.includes("Publish")) {
      publishedPropertyExists = true
      publishedPropertyType = propertyTypes["Publish"]
      isPublishedPropertyCorrect = propertyTypes["Publish"] === "checkbox"

      if (isPublishedPropertyCorrect) {
        try {
          const publishedQuery = await notion.databases.query({
            database_id: databaseId,
            filter: {
              property: "Publish",
              checkbox: {
                equals: true,
              },
            },
          })
          publishedTips = publishedQuery.results
        } catch (error: any) {
          publishedQueryError = error.message
        }
      }
    }

    // Get a sample tip for debugging
    let sampleTip = null
    if (tips.results.length > 0) {
      const tipId = tips.results[0].id
      try {
        const tipProperties = await notion.pages.properties.retrieve({
          page_id: tipId,
          property_id: Object.keys((tips.results[0] as any).properties)[0],
        })
        sampleTip = {
          id: tipId,
          properties: {},
        }

        // Get all properties for the sample tip
        for (const propName of propertyNames) {
          const propId = (tips.results[0] as any).properties[propName].id
          try {
            const propValue = await notion.pages.properties.retrieve({
              page_id: tipId,
              property_id: propId,
            })

            // Simplify the property value for display
            let simplifiedValue
            switch (propertyTypes[propName]) {
              case "title":
                simplifiedValue = propValue.results?.[0]?.title?.plain_text || ""
                break
              case "rich_text":
                simplifiedValue = propValue.results?.map((item: any) => item.plain_text).join("") || ""
                break
              case "date":
                simplifiedValue = (propValue as any).date?.start || ""
                break
              case "checkbox":
                simplifiedValue = (propValue as any).checkbox
                break
              case "multi_select":
                simplifiedValue = (propValue as any).multi_select?.map((item: any) => item.name) || []
                break
              case "files":
                simplifiedValue = "[files type]"
                break
              default:
                simplifiedValue = JSON.stringify(propValue).substring(0, 100) + "..."
            }
            ;(sampleTip.properties as any)[propName] = simplifiedValue
          } catch (error) {
            ;(sampleTip.properties as any)[propName] = `Error: ${(error as any).message}`
          }
        }
      } catch (error) {
        sampleTip = { error: (error as any).message }
      }
    }

    // Determine published status message
    let publishedStatus = "✅ You have published tips"
    if (publishedTips.length === 0) {
      if (!publishedPropertyExists) {
        publishedStatus =
          "❌ Your database is missing the 'Publish' checkbox property. Add this property to your database."
      } else if (!isPublishedPropertyCorrect) {
        publishedStatus = `❌ The 'Publish' property is not a checkbox (it's a ${publishedPropertyType}). Change it to a checkbox.`
      } else if (publishedQueryError) {
        publishedStatus = `❌ Error querying published tips: ${publishedQueryError}`
      } else if (tips.results.length === 0) {
        publishedStatus = "❌ Your database has no tips. Add some tips to your database."
      } else {
        publishedStatus =
          "❌ You have tips, but none are marked as published. Check the 'Publish' checkbox for tips you want to display."
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Notion tips database connection successful",
      databaseName: databaseInfo.title?.[0]?.plain_text || "Unnamed Database",
      databaseId,
      totalTipPosts: tips.results.length,
      publishedTipPosts: publishedTips.length,
      publishedPropertyExists,
      publishedPropertyType,
      isPublishedPropertyCorrect,
      publishedQueryError,
      hasUnpublishedPosts: tips.results.length > publishedTips.length,
      properties: propertyNames,
      propertyTypes,
      requiredProperties,
      missingProperties,
      sampleTip,
      publishedStatus,
    })
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: `An unexpected error occurred: ${(error as any).message}`,
    })
  }
}

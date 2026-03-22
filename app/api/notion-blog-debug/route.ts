import { NextResponse } from "next/server"
import { Client } from "@notionhq/client"

export async function GET() {
  try {
    // Check if environment variables are set
    const notionKey = process.env.NOTION_KEY
    const notionBlogDatabaseId = process.env.NOTION_BLOG_DATABASE_ID

    if (!notionKey) {
      return NextResponse.json(
        {
          error: "Missing NOTION_KEY environment variable",
          status: "error",
          envVars: {
            NOTION_KEY: notionKey ? "Set (hidden)" : "Not set",
            NOTION_BLOG_DATABASE_ID: notionBlogDatabaseId || "Not set",
          },
        },
        { status: 400 },
      )
    }

    if (!notionBlogDatabaseId) {
      return NextResponse.json(
        {
          error: "Missing NOTION_BLOG_DATABASE_ID environment variable",
          status: "error",
          envVars: {
            NOTION_KEY: notionKey ? "Set (hidden)" : "Not set",
            NOTION_BLOG_DATABASE_ID: notionBlogDatabaseId || "Not set",
          },
        },
        { status: 400 },
      )
    }

    // Format database ID with hyphens if needed
    function formatDatabaseId(id: string): string {
      // If the ID already has hyphens, return it as is
      if (id.includes("-")) return id

      // Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      try {
        return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`
      } catch (error) {
        return id // Return original ID if formatting fails
      }
    }

    const databaseId = formatDatabaseId(notionBlogDatabaseId)

    // Initialize Notion client
    const notion = new Client({
      auth: notionKey,
    })

    // Test connection by retrieving database
    try {
      const database = await notion.databases.retrieve({
        database_id: databaseId,
      })

      // Test querying for all blog posts
      const allPostsResponse = await notion.databases.query({
        database_id: databaseId,
      })

      // Test querying for published blog posts using "Publish" property
      let publishedPostsResponse = null
      let publishedPostsCount = 0
      let publishedPostsError = null

      try {
        publishedPostsResponse = await notion.databases.query({
          database_id: databaseId,
          filter: {
            property: "Publish",
            checkbox: {
              equals: true,
            },
          },
        })
        publishedPostsCount = publishedPostsResponse.results.length
      } catch (error: any) {
        publishedPostsError = error.message
      }

      // Get a list of all properties in the database
      const properties = database.properties ? Object.keys(database.properties) : []

      // Get property types
      const propertyTypes: Record<string, string> = {}
      if (database.properties) {
        Object.entries(database.properties).forEach(([key, value]) => {
          propertyTypes[key] = (value as any).type || "unknown"
        })
      }

      // Get sample post data if available
      let samplePost = null
      if (allPostsResponse.results.length > 0) {
        const firstPost = allPostsResponse.results[0]
        const postProperties = (firstPost as any).properties || {}

        // Create a simplified version of the post properties
        const simplifiedProperties: Record<string, any> = {}
        Object.entries(postProperties).forEach(([key, value]) => {
          const type = (value as any).type
          if (type === "title") {
            simplifiedProperties[key] = (value as any).title?.map((t: any) => t.plain_text).join("") || ""
          } else if (type === "rich_text") {
            simplifiedProperties[key] = (value as any).rich_text?.map((t: any) => t.plain_text).join("") || ""
          } else if (type === "checkbox") {
            simplifiedProperties[key] = (value as any).checkbox
          } else if (type === "select") {
            simplifiedProperties[key] = (value as any).select?.name || null
          } else if (type === "multi_select") {
            simplifiedProperties[key] = (value as any).multi_select?.map((s: any) => s.name) || []
          } else if (type === "date") {
            simplifiedProperties[key] = (value as any).date?.start || null
          } else {
            simplifiedProperties[key] = `[${type} type]`
          }
        })

        samplePost = {
          id: firstPost.id,
          properties: simplifiedProperties,
        }
      }

      // Check for your actual property names
      const requiredProperties = [
        "Title",
        "Short Description",
        "Tags",
        "Publish Date", // Your actual property name
        "Author",
        "Author Job", // Your actual property name
        "Author discription", // Your actual property name with typo
        "Title Image", // Your actual property name
        "Paragraph 1",
        "Image 1",
        "Publish", // Your actual property name
      ]

      const missingProperties = requiredProperties.filter((prop) => !properties.includes(prop))

      // Check if there are any posts but none are published
      const hasUnpublishedPosts = allPostsResponse.results.length > 0 && publishedPostsCount === 0

      return NextResponse.json({
        status: "success",
        message: "Notion blog database connection successful",
        databaseName: database.title?.[0]?.plain_text || "Unnamed Database",
        databaseId: databaseId,
        totalBlogPosts: allPostsResponse.results.length,
        publishedBlogPosts: publishedPostsCount,
        publishedPropertyExists: properties.includes("Publish"),
        publishedPropertyType: propertyTypes["Publish"] || "missing",
        isPublishedPropertyCorrect: propertyTypes["Publish"] === "checkbox",
        publishedQueryError: publishedPostsError,
        hasUnpublishedPosts,
        properties: properties,
        propertyTypes: propertyTypes,
        requiredProperties: requiredProperties,
        missingProperties: missingProperties,
        samplePost: samplePost,
        publishedStatus: !properties.includes("Publish")
          ? "❌ Your database is missing the 'Publish' checkbox property. Add this property to your database."
          : propertyTypes["Publish"] !== "checkbox"
            ? "❌ The 'Publish' property is not a checkbox. Change it to a checkbox type."
            : hasUnpublishedPosts
              ? "⚠️ You have blog posts, but none are marked as Published. Check the 'Publish' checkbox in Notion."
              : publishedPostsCount > 0
                ? "✅ You have published blog posts that will be displayed on the website."
                : "❌ No blog posts found in the database.",
      })
    } catch (error: any) {
      return NextResponse.json(
        {
          error: `Failed to connect to Notion blog database: ${error.message}`,
          status: "error",
          databaseId: databaseId,
          envVars: {
            NOTION_KEY: notionKey ? "Set (hidden)" : "Not set",
            NOTION_BLOG_DATABASE_ID: notionBlogDatabaseId || "Not set",
          },
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: `Unexpected error: ${error.message}`,
        status: "error",
      },
      { status: 500 },
    )
  }
}

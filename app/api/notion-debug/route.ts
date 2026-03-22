import { NextResponse } from "next/server"
import { Client } from "@notionhq/client"

export async function GET() {
  try {
    // Check if environment variables are set
    const notionKey = process.env.NOTION_KEY
    const notionPageId = process.env.NOTION_PAGE_ID

    if (!notionKey) {
      return NextResponse.json(
        {
          error: "Missing NOTION_KEY environment variable",
          status: "error",
          envVars: {
            NOTION_KEY: notionKey ? "Set (hidden)" : "Not set",
            NOTION_PAGE_ID: notionPageId || "Not set",
          },
        },
        { status: 400 },
      )
    }

    if (!notionPageId) {
      return NextResponse.json(
        {
          error: "Missing NOTION_PAGE_ID environment variable",
          status: "error",
          envVars: {
            NOTION_KEY: notionKey ? "Set (hidden)" : "Not set",
            NOTION_PAGE_ID: notionPageId || "Not set",
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

    const databaseId = formatDatabaseId(notionPageId)

    // Initialize Notion client
    const notion = new Client({
      auth: notionKey,
    })

    // Test connection by retrieving database
    try {
      const database = await notion.databases.retrieve({
        database_id: databaseId,
      })

      // Test querying for published recipes
      const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
          property: "Published",
          checkbox: {
            equals: true,
          },
        },
      })

      // Get a list of all properties in the database
      const properties = database.properties ? Object.keys(database.properties) : []

      // Check for required properties
      const requiredProperties = [
        "Recipe Name",
        "Description",
        "Published",
        "Title Image",
        "Prep Time",
        "Cook Time",
        "Serves",
        "Course",
        "Cuisine",
        "Ingredients",
        "Instructions", // Added Instructions to required properties
        "Tips & Notes",
      ]

      const missingProperties = requiredProperties.filter((prop) => !properties.includes(prop))

      // Check if we have any recipes
      const hasRecipes = response.results.length > 0

      // If we have recipes, check the first one for the Instructions field
      let instructionsExample = null
      if (hasRecipes && response.results[0]) {
        const firstRecipe = response.results[0]
        const props = firstRecipe.properties as any

        if (props.Instructions) {
          const instructionsType = props.Instructions.type

          if (instructionsType === "rich_text" && props.Instructions.rich_text) {
            instructionsExample = props.Instructions.rich_text.map((t: any) => t.plain_text).join("")
            // Truncate if too long
            if (instructionsExample && instructionsExample.length > 100) {
              instructionsExample = instructionsExample.substring(0, 100) + "..."
            }
          }
        }
      }

      return NextResponse.json({
        status: "success",
        message: "Notion connection successful",
        databaseName: database.title?.[0]?.plain_text || "Unnamed Database",
        databaseId: databaseId,
        publishedRecipes: response.results.length,
        properties: properties,
        requiredProperties: requiredProperties,
        missingProperties: missingProperties,
        hasInstructionsField: properties.includes("Instructions"),
        instructionsExample: instructionsExample,
      })
    } catch (error: any) {
      return NextResponse.json(
        {
          error: `Failed to connect to Notion: ${error.message}`,
          status: "error",
          databaseId: databaseId,
          envVars: {
            NOTION_KEY: notionKey ? "Set (hidden)" : "Not set",
            NOTION_PAGE_ID: notionPageId || "Not set",
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

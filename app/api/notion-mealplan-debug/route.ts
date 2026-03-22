import { NextResponse } from "next/server"
import { Client } from "@notionhq/client"

export async function GET() {
  try {
    // Initialize Notion client
    const notion = new Client({
      auth: process.env.NOTION_KEY,
    })

    const databaseId = process.env.NOTION_MEALPLAN_DATABASE_ID

    if (!databaseId) {
      return NextResponse.json({
        status: "error",
        message: "NOTION_MEALPLAN_DATABASE_ID environment variable is not set",
      })
    }

    // Get database information
    const database = await notion.databases.retrieve({
      database_id: databaseId,
    })

    // Get all properties from the database
    const properties = Object.keys(database.properties)

    // Get property types
    const propertyTypes = {}
    for (const [key, value] of Object.entries(database.properties)) {
      propertyTypes[key] = value.type
    }

    // Check for required properties
    const requiredProperties = [
      "Meal Plan Title",
      "Monday Breakfast",
      "Monday Lunch",
      "Monday Dinner",
      "Tuesday Breakfast",
      "Tuesday Lunch",
      "Tuesday Dinner",
      "Wednesday Breakfast",
      "Wednesday Lunch",
      "Wednesday Dinner",
      "Thursday Breakfast",
      "Thursday Lunch",
      "Thursday Dinner",
      "Friday Breakfast",
      "Friday Lunch",
      "Friday Dinner",
      "Saturday Breakfast",
      "Saturday Lunch",
      "Saturday Dinner",
      "Sunday Breakfast",
      "Sunday Lunch",
      "Sunday Dinner",
      "Publish",
    ]

    const missingProperties = requiredProperties.filter((prop) => !properties.includes(prop))

    // Check if Publish property exists and is a checkbox
    const publishPropertyExists = properties.includes("Publish")
    const publishPropertyType = publishPropertyExists ? propertyTypes["Publish"] : "missing"
    const isPublishPropertyCorrect = publishPropertyExists && publishPropertyType === "checkbox"

    // Query for all meal plans
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: "Meal Plan Title",
          direction: "ascending",
        },
      ],
    })

    // Query for published meal plans
    let publishedResponse = null
    let publishedQueryError = null

    try {
      if (publishPropertyExists) {
        publishedResponse = await notion.databases.query({
          database_id: databaseId,
          filter: {
            property: "Publish",
            checkbox: {
              equals: true,
            },
          },
        })
      }
    } catch (error) {
      publishedQueryError = error.message
    }

    // Get a sample meal plan
    const sampleMealPlan = response.results.length > 0 ? response.results[0] : null

    // Extract properties from the sample meal plan
    let sampleMealPlanData = null
    if (sampleMealPlan) {
      const properties = sampleMealPlan.properties
      sampleMealPlanData = {
        id: sampleMealPlan.id,
        properties: {},
      }

      for (const [key, value] of Object.entries(properties)) {
        if (value.type === "title") {
          sampleMealPlanData.properties[key] = value.title.map((t) => t.plain_text).join("")
        } else if (value.type === "rich_text") {
          sampleMealPlanData.properties[key] = value.rich_text.map((t) => t.plain_text).join("")
        } else if (value.type === "checkbox") {
          sampleMealPlanData.properties[key] = value.checkbox
        } else {
          sampleMealPlanData.properties[key] = `[${value.type} type]`
        }
      }
    }

    // Determine published status message
    let publishedStatus = "✅ You have published meal plans"
    if (!publishPropertyExists) {
      publishedStatus =
        "❌ Your database is missing the 'Publish' checkbox property. Add this property to your database."
    } else if (publishPropertyType !== "checkbox") {
      publishedStatus = `❌ Your 'Publish' property is a ${publishPropertyType}, not a checkbox. Change it to a checkbox.`
    } else if (publishedResponse && publishedResponse.results.length === 0) {
      publishedStatus =
        "❌ You have meal plans, but none are published. Check the 'Publish' checkbox for meal plans you want to display."
    }

    return NextResponse.json({
      status: "success",
      message: "Notion meal plan database connection successful",
      databaseName: database.title[0]?.plain_text || "Unnamed Database",
      databaseId,
      totalMealPlans: response.results.length,
      publishedMealPlans: publishedResponse ? publishedResponse.results.length : 0,
      publishPropertyExists,
      publishPropertyType,
      isPublishPropertyCorrect,
      publishedQueryError,
      hasUnpublishedMealPlans: response.results.length > (publishedResponse?.results.length || 0),
      properties,
      propertyTypes,
      requiredProperties,
      missingProperties,
      sampleMealPlan: sampleMealPlanData,
      publishedStatus,
    })
  } catch (error) {
    console.error("Error in notion-mealplan-debug:", error)
    return NextResponse.json({
      status: "error",
      message: `Failed to connect to Notion: ${error.message}`,
      error: error.stack,
    })
  }
}

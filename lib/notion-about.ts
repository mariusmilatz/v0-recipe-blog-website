import { Client } from "@notionhq/client"
import { cache } from "react"
import { cacheNotionImage } from "./image-cache"

const notion = new Client({
  auth: process.env.NOTION_KEY,
})

const databaseId = process.env.NOTION_ABOUT_DATABASE_ID

export type AboutPageContent = {
  aboutUsDescription: string
  storyTitle: string
  storyText: string
  storyImage: string
  missionTitle: string
  missionText: string
  missionImage: string
}

export const getAboutPageContent = cache(async (): Promise<AboutPageContent | null> => {
  if (!databaseId) {
    console.error("NOTION_ABOUT_DATABASE_ID is not defined")
    return null
  }

  try {
    // First, get the database to check available properties
    const database = await notion.databases.retrieve({
      database_id: databaseId,
    })

    console.log("About database properties:", Object.keys(database.properties))

    // Get all properties in the database
    const properties = Object.keys(database.properties)

    // Check if Published or Publish property exists
    const hasPublishedProperty = properties.some(
      (prop) => prop.toLowerCase() === "published" || prop.toLowerCase() === "publish",
    )

    // Find the actual property name with correct case
    const publishPropertyName = hasPublishedProperty
      ? properties.find((prop) => prop.toLowerCase() === "published" || prop.toLowerCase() === "publish")
      : null

    // Query the database to get all entries (or published entries if the property exists)
    const queryOptions: any = {
      database_id: databaseId,
      sorts: [
        {
          timestamp: "created_time",
          direction: "descending",
        },
      ],
    }

    // Only filter by published if the property exists
    if (publishPropertyName) {
      queryOptions.filter = {
        property: publishPropertyName,
        checkbox: {
          equals: true,
        },
      }
    }

    const response = await notion.databases.query(queryOptions)

    // If no entries are found, return null
    if (response.results.length === 0) {
      console.error("No about page entries found")
      return null
    }

    // Get the first (most recent) entry
    const page = response.results[0]

    console.log("About page ID:", page.id)

    // Extract the content from the properties
    const aboutUsDescription = await getPropertyText(page.id, "About Us Description")
    const storyTitle = await getPropertyText(page.id, "Story Title")
    const storyText = await getPropertyText(page.id, "Story Text")
    const storyImage = await getPropertyImage(page.id, "Story Image")
    const missionTitle = await getPropertyText(page.id, "Mission Title")
    const missionText = await getPropertyText(page.id, "Mission Text")
    const missionImage = await getPropertyImage(page.id, "Mission Image")

    const content = {
      aboutUsDescription,
      storyTitle,
      storyText,
      missionTitle,
      missionText,
      storyImage,
      missionImage,
    }

    console.log("About page content fetched successfully")

    return content
  } catch (error) {
    console.error("Error fetching about page content from Notion:", error)
    return null
  }
})

// Helper function to get text from a property
async function getPropertyText(pageId: string, propertyName: string): Promise<string> {
  try {
    const response = await notion.pages.retrieve({ page_id: pageId })
    const properties = response.properties as any

    // Find the property with case-insensitive matching
    const actualPropertyName = Object.keys(properties).find((prop) => prop.toLowerCase() === propertyName.toLowerCase())

    if (!actualPropertyName || !properties[actualPropertyName]) {
      console.warn(`Property "${propertyName}" not found in page ${pageId}`)
      console.log("Available properties:", Object.keys(properties))
      return ""
    }

    const property = properties[actualPropertyName]

    console.log(`Property "${propertyName}" type:`, property.type)

    if (property.type === "rich_text") {
      return property.rich_text.map((text: any) => text.plain_text).join("")
    }

    if (property.type === "title") {
      return property.title.map((text: any) => text.plain_text).join("")
    }

    return ""
  } catch (error) {
    console.error(`Error getting ${propertyName}:`, error)
    return ""
  }
}

// Helper function to get image URL from a property
async function getPropertyImage(pageId: string, propertyName: string): Promise<string> {
  try {
    const response = await notion.pages.retrieve({ page_id: pageId })
    const properties = response.properties as any

    // Find the property with case-insensitive matching
    const actualPropertyName = Object.keys(properties).find((prop) => prop.toLowerCase() === propertyName.toLowerCase())

    if (!actualPropertyName || !properties[actualPropertyName]) {
      console.warn(`Property "${propertyName}" not found in page ${pageId}`)
      console.log("Available properties:", Object.keys(properties))
      return ""
    }

    const property = properties[actualPropertyName]

    console.log(`Property "${propertyName}" type:`, property.type)

    if (property.type !== "files" || property.files.length === 0) {
      return ""
    }

    const file = property.files[0]

    if (file.type === "external") {
      return await cacheNotionImage(file.external.url)
    } else if (file.type === "file") {
      return await cacheNotionImage(file.file.url)
    }

    return ""
  } catch (error) {
    console.error(`Error getting ${propertyName}:`, error)
    return ""
  }
}

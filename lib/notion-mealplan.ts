import { Client } from "@notionhq/client"
import { cache } from "react"

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_KEY,
})

// Helper function to extract plain text from rich text
function extractPlainText(richText) {
  if (!richText || richText.length === 0) return ""
  return richText.map((text) => text.plain_text).join("")
}

// Helper function to extract meal title and time
function extractMealInfo(text) {
  if (!text) return { title: "No meal", time: "" }

  // Try to extract time in parentheses or on a new line
  const match = text.match(/(.*?)(?:\n|$)(\d+)\s*min/i)
  if (match) {
    return {
      title: match[1].trim(),
      time: `${match[2]} min`,
    }
  }

  return {
    title: text,
    time: "",
  }
}

// Helper function to extract image URL from files property
function extractImageUrl(filesProperty) {
  if (!filesProperty || !filesProperty.files || filesProperty.files.length === 0) {
    return null
  }

  const file = filesProperty.files[0]

  // Handle both external files and uploaded files
  if (file.type === "external") {
    return file.external.url
  } else if (file.type === "file") {
    return file.file.url
  }

  return null
}

// Helper function to extract amount and percentage from a single nutritional value
function extractNutritionalValue(text) {
  if (!text) return { amount: "", percentage: "" }

  // Try to extract amount and percentage
  // Pattern: amount (possibly with units) followed by percentage
  // Example: "75g 150%" or "2100 -"
  const parts = text.trim().split(/\s+/)

  if (parts.length >= 2) {
    // Last part is the percentage, everything before is the amount
    const percentage = parts.pop()
    const amount = parts.join(" ")
    return { amount, percentage }
  }

  // If only one part, assume it's the amount
  return { amount: text, percentage: "" }
}

// Helper function to extract nutritional information
function extractNutritionalInfo(properties) {
  const nutritionalInfo = {
    calories: { amount: "", percentage: "" },
    protein: { amount: "", percentage: "" },
    carbohydrates: { amount: "", percentage: "" },
    fat: { amount: "", percentage: "" },
    fiber: { amount: "", percentage: "" },
  }

  // Extract Calories
  if (properties["Calories"]) {
    const caloriesText = extractPlainText(properties["Calories"].rich_text)
    const { amount, percentage } = extractNutritionalValue(caloriesText)
    nutritionalInfo.calories = { amount, percentage }
  }

  // Extract Protein
  if (properties["Protein"]) {
    const proteinText = extractPlainText(properties["Protein"].rich_text)
    const { amount, percentage } = extractNutritionalValue(proteinText)
    nutritionalInfo.protein = { amount, percentage }
  }

  // Extract Carbohydrates
  if (properties["Carbohydrates"]) {
    const carbsText = extractPlainText(properties["Carbohydrates"].rich_text)
    const { amount, percentage } = extractNutritionalValue(carbsText)
    nutritionalInfo.carbohydrates = { amount, percentage }
  }

  // Extract Fat
  if (properties["Fat"]) {
    const fatText = extractPlainText(properties["Fat"].rich_text)
    const { amount, percentage } = extractNutritionalValue(fatText)
    nutritionalInfo.fat = { amount, percentage }
  }

  // Extract Fiber
  if (properties["Fiber"]) {
    const fiberText = extractPlainText(properties["Fiber"].rich_text)
    const { amount, percentage } = extractNutritionalValue(fiberText)
    nutritionalInfo.fiber = { amount, percentage }
  }

  return nutritionalInfo
}

// Function to fetch all meal plans
export const fetchAllMealPlansFromNotion = cache(async () => {
  try {
    const databaseId = process.env.NOTION_MEALPLAN_DATABASE_ID

    if (!databaseId) {
      throw new Error("NOTION_MEALPLAN_DATABASE_ID environment variable is not set")
    }

    // Query the database for published meal plans
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Publish",
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: "Meal Plan Title",
          direction: "ascending",
        },
      ],
    })

    // Process the results
    const mealPlans = response.results.map((page) => {
      const properties = page.properties

      // Extract title
      const title = properties["Meal Plan Title"]?.title?.[0]?.plain_text || "Untitled Meal Plan"

      // Extract preview image
      const previewImage = extractImageUrl(properties["Image Preview"])

      // Extract serves (number of people)
      let serves = 4 // Default to 4 if not specified
      if (properties["Serves"] && properties["Serves"].number) {
        serves = properties["Serves"].number
      }

      // Generate a slug from the title
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, "-")

      return {
        id: page.id,
        title,
        slug,
        previewImage,
        serves,
      }
    })

    return mealPlans
  } catch (error) {
    console.error("Error fetching meal plans from Notion:", error)
    return []
  }
})

// Function to fetch a meal plan by ID
export const fetchMealPlanByIdFromNotion = cache(async (id) => {
  try {
    // Retrieve the page
    const page = await notion.pages.retrieve({
      page_id: id,
    })

    const properties = page.properties

    // Extract title
    const title = properties["Meal Plan Title"]?.title?.[0]?.plain_text || "Untitled Meal Plan"

    // Extract preview image
    const previewImage = extractImageUrl(properties["Image Preview"])

    // Extract serves (number of people)
    let serves = 4 // Default to 4 if not specified
    if (properties["Serves"] && properties["Serves"].number) {
      serves = properties["Serves"].number
    }

    // Extract meal images
    const mealImages =
      properties["Meal Images"]?.files
        ?.map((file) => {
          if (file.type === "external") {
            return file.external.url
          } else if (file.type === "file") {
            return file.file.url
          }
          return null
        })
        .filter((url) => url) || []

    // Generate a slug from the title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "-")

    // Extract meals for each day
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    const mealTypes = ["Breakfast", "Lunch", "Dinner"]

    const meals = {}

    days.forEach((day) => {
      meals[day.toLowerCase()] = {}

      mealTypes.forEach((mealType) => {
        const propertyName = `${day} ${mealType}`
        const mealText = extractPlainText(properties[propertyName]?.rich_text)
        meals[day.toLowerCase()][mealType.toLowerCase()] = extractMealInfo(mealText)
      })
    })

    // Extract shopping list
    const shoppingList = {
      produce: extractPlainText(properties["Produce (Fresh)"]?.rich_text) || "",
      refrigerated: extractPlainText(properties["Refrigerated"]?.rich_text) || "",
      pantry: extractPlainText(properties["Pantry (Dry)"]?.rich_text) || "",
      spices: extractPlainText(properties["Spices"]?.rich_text) || "",
    }

    // Extract meal prep tips
    const mealPrepTips = extractPlainText(properties["Meal Prep Tips"]?.rich_text) || ""

    // Extract nutritional information
    const nutritionalInfo = extractNutritionalInfo(properties)

    return {
      id: page.id,
      title,
      slug,
      previewImage,
      mealImages,
      meals,
      shoppingList,
      mealPrepTips,
      nutritionalInfo,
      serves,
    }
  } catch (error) {
    console.error(`Error fetching meal plan ${id} from Notion:`, error)
    return null
  }
})

// Function to fetch a meal plan by slug
export const fetchMealPlanBySlugFromNotion = cache(async (slug) => {
  try {
    const allMealPlans = await fetchAllMealPlansFromNotion()

    // Find the meal plan with the matching slug
    const mealPlan = allMealPlans.find((plan) => plan.slug === slug)

    if (!mealPlan) {
      return null
    }

    // Fetch the full meal plan by ID
    return await fetchMealPlanByIdFromNotion(mealPlan.id)
  } catch (error) {
    console.error(`Error fetching meal plan with slug ${slug} from Notion:`, error)
    return null
  }
})

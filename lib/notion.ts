import { cacheNotionImages } from "./image-cache"

// Format database ID with hyphens if needed
function formatDatabaseId(id: string): string {
  if (!id) return ""
  if (id.includes("-")) return id

  try {
    return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`
  } catch (error) {
    console.error("Error formatting database ID:", error)
    return id
  }
}

// Helper function to extract property values safely
function getPropertyValue(property: any) {
  if (!property) return null

  try {
    switch (property.type) {
      case "title":
        return property.title?.map((t: any) => t.plain_text).join("") || ""
      case "rich_text":
        return property.rich_text?.map((t: any) => t.plain_text).join("") || ""
      case "select":
        return property.select?.name || null
      case "multi_select":
        return property.multi_select?.map((s: any) => s.name) || []
      case "number":
        return property.number ?? 0
      case "checkbox":
        return property.checkbox ?? false
      case "date":
        return property.date?.start || null
      case "files":
        return property.files?.map((f: any) => f.file?.url || f.external?.url).filter(Boolean) || []
      case "url":
        return property.url || null
      default:
        return null
    }
  } catch (error) {
    console.error(`Error extracting property value for type ${property?.type}:`, error)
    return null
  }
}

// Function to parse ingredients with subtitles
function parseIngredientsWithSubtitles(ingredientsText: string): { subtitle: string | null; items: string[] }[] {
  if (!ingredientsText) return []

  try {
    const lines = ingredientsText.split("\n").filter((line) => line.trim() !== "")
    const sections: { subtitle: string | null; items: string[] }[] = []

    let currentSubtitle: string | null = null
    let currentItems: string[] = []

    for (const line of lines) {
      if (line.startsWith("**") && line.endsWith("**")) {
        if (currentItems.length > 0) {
          sections.push({ subtitle: currentSubtitle, items: [...currentItems] })
          currentItems = []
        }
        currentSubtitle = line.slice(2, -2)
      } else {
        currentItems.push(line)
      }
    }

    if (currentItems.length > 0) {
      sections.push({ subtitle: currentSubtitle, items: currentItems })
    }

    return sections
  } catch (error) {
    console.error("Error parsing ingredients with subtitles:", error)
    return []
  }
}

// Function to parse numbered instructions with subtitles
interface InstructionItem {
  type: "step" | "subtitle"
  content: string
}

function parseNumberedInstructions(instructionsText: string): InstructionItem[] {
  if (!instructionsText) return []

  try {
    const lines = instructionsText.split("\n").filter((line) => line.trim() !== "")
    const instructions: InstructionItem[] = []

    for (const line of lines) {
      if (line.startsWith("**") && line.endsWith("**")) {
        instructions.push({
          type: "subtitle",
          content: line.slice(2, -2),
        })
      } else {
        const match = line.match(/^\s*\d+\.\s+(.+)$/)
        if (match) {
          instructions.push({
            type: "step",
            content: match[1],
          })
        } else {
          instructions.push({
            type: "step",
            content: line,
          })
        }
      }
    }

    return instructions
  } catch (error) {
    console.error("Error parsing numbered instructions:", error)
    return []
  }
}

async function notionQuery(databaseId: string, body: any) {
  const notionKey = process.env.NOTION_KEY

  if (!notionKey) {
    throw new Error("Missing NOTION_KEY")
  }

  const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${notionKey}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Notion API error: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}

async function notionRetrievePage(pageId: string) {
  const notionKey = process.env.NOTION_KEY

  if (!notionKey) {
    throw new Error("Missing NOTION_KEY")
  }

  const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${notionKey}`,
      "Notion-Version": "2022-06-28",
    },
  })

  if (!response.ok) {
    throw new Error(`Notion API error: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}

// Function to fetch all recipes from the Notion database
export async function fetchRecipesFromNotion() {
  const notionKey = process.env.NOTION_KEY
  const pageId = process.env.NOTION_PAGE_ID

  if (!notionKey || !pageId) {
    console.error("Missing Notion API key or recipe database ID")
    return []
  }

  try {
    const databaseId = formatDatabaseId(pageId)

    if (!databaseId) {
      console.error("Invalid recipe database ID")
      return []
    }

    const response = await notionQuery(databaseId, {
      filter: {
        property: "Published",
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: "Recipe Name",
          direction: "ascending",
        },
      ],
    })

    if (!response.results || !Array.isArray(response.results)) {
      console.error("Invalid response from Notion API:", response)
      return []
    }

    const recipes = await Promise.all(
      response.results.map(async (page: any) => {
        try {
          const properties = page.properties || {}

          const title = getPropertyValue(properties["Recipe Name"]) || "Untitled Recipe"
          const description = getPropertyValue(properties.Description) || ""
          const rawImages = getPropertyValue(properties["Title Image"]) || []
          const images = await cacheNotionImages(rawImages)
          const prepTime = getPropertyValue(properties["Prep Time"]) || ""
          const cookTime = getPropertyValue(properties["Cook Time"]) || ""
          const serves = getPropertyValue(properties.Serves) || 4

          const courses = getPropertyValue(properties.Course) || []
          const courseArray = Array.isArray(courses) ? courses : [courses].filter(Boolean)

          const cuisine = getPropertyValue(properties.Cuisine) || ""
          const isFavorite = getPropertyValue(properties.favourites) || false

          const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")

          const primaryCategory = courseArray.length > 0 ? courseArray[0] : "Main"

          const formattedPrepTime = prepTime ? (prepTime.includes("min") ? prepTime : `${prepTime} min`) : ""
          const formattedCookTime = cookTime ? (cookTime.includes("min") ? cookTime : `${cookTime} min`) : ""

          return {
            id: page.id,
            title,
            description,
            slug,
            image: images.length > 0 ? images[0] : "/placeholder.svg?height=300&width=500",
            images,
            prepTime: formattedPrepTime,
            cookTime: formattedCookTime,
            serves,
            courses: courseArray,
            category: primaryCategory,
            cuisine,
            isFavorite,
            createdAt: page.created_time,
            updatedAt: page.last_edited_time,
          }
        } catch (error) {
          console.error("Error processing recipe from Notion:", error)
          return null
        }
      }),
    )

    return recipes.filter(Boolean)
  } catch (error) {
    console.error("Error fetching recipes from Notion:", error)
    return []
  }
}

// Function to fetch featured recipes (published AND marked as favorite)
export async function fetchFeaturedRecipesFromNotion() {
  const notionKey = process.env.NOTION_KEY
  const pageId = process.env.NOTION_PAGE_ID

  if (!notionKey || !pageId) {
    console.error("Missing Notion API key or recipe database ID")
    return []
  }

  try {
    const databaseId = formatDatabaseId(pageId)

    if (!databaseId) {
      console.error("Invalid recipe database ID")
      return []
    }

    const response = await notionQuery(databaseId, {
      filter: {
        and: [
          {
            property: "Published",
            checkbox: {
              equals: true,
            },
          },
          {
            property: "favourites",
            checkbox: {
              equals: true,
            },
          },
        ],
      },
      sorts: [
        {
          timestamp: "created_time",
          direction: "descending",
        },
      ],
      page_size: 3,
    })

    if (!response.results || !Array.isArray(response.results)) {
      console.error("Invalid response from Notion API:", response)
      return []
    }

    const recipes = await Promise.all(
      response.results.map(async (page: any) => {
        try {
          const properties = page.properties || {}

          const title = getPropertyValue(properties["Recipe Name"]) || "Untitled Recipe"
          const description = getPropertyValue(properties.Description) || ""
          const rawImages = getPropertyValue(properties["Title Image"]) || []
          const images = await cacheNotionImages(rawImages)
          const prepTime = getPropertyValue(properties["Prep Time"]) || ""
          const cookTime = getPropertyValue(properties["Cook Time"]) || ""
          const serves = getPropertyValue(properties.Serves) || 4

          const courses = getPropertyValue(properties.Course) || []
          const courseArray = Array.isArray(courses) ? courses : [courses].filter(Boolean)

          const cuisine = getPropertyValue(properties.Cuisine) || ""

          const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")

          const primaryCategory = courseArray.length > 0 ? courseArray[0] : "Main"

          const formattedPrepTime = prepTime ? (prepTime.includes("min") ? prepTime : `${prepTime} min`) : ""
          const formattedCookTime = cookTime ? (cookTime.includes("min") ? cookTime : `${cookTime} min`) : ""

          return {
            id: page.id,
            title,
            description,
            slug,
            image: images.length > 0 ? images[0] : "/placeholder.svg?height=300&width=500",
            images,
            prepTime: formattedPrepTime,
            cookTime: formattedCookTime,
            serves,
            courses: courseArray,
            category: primaryCategory,
            cuisine,
            isFavorite: true,
            createdAt: page.created_time,
            updatedAt: page.last_edited_time,
          }
        } catch (error) {
          console.error("Error processing featured recipe from Notion:", error)
          return null
        }
      }),
    )

    return recipes.filter(Boolean)
  } catch (error) {
    console.error("Error fetching featured recipes from Notion:", error)
    return []
  }
}

// Function to fetch a single recipe by its ID
export async function fetchRecipeByIdFromNotion(pageId: string) {
  if (!pageId) {
    console.error("No page ID provided")
    return null
  }

  try {
    const page = await notionRetrievePage(pageId)
    const properties = (page.properties as any) || {}

    const title = getPropertyValue(properties["Recipe Name"]) || "Untitled Recipe"
    const description = getPropertyValue(properties.Description) || ""
    const rawImages = getPropertyValue(properties["Title Image"]) || []
    const images = await cacheNotionImages(rawImages)
    const prepTime = getPropertyValue(properties["Prep Time"]) || ""
    const cookTime = getPropertyValue(properties["Cook Time"]) || ""
    const serves = getPropertyValue(properties.Serves) || 4

    const courses = getPropertyValue(properties.Course) || []
    const courseArray = Array.isArray(courses) ? courses : [courses].filter(Boolean)

    const cuisine = getPropertyValue(properties.Cuisine) || ""
    const isFavorite = getPropertyValue(properties.favourites) || false

    const formattedPrepTime = prepTime ? (prepTime.includes("min") ? prepTime : `${prepTime} min`) : ""
    const formattedCookTime = cookTime ? (cookTime.includes("min") ? cookTime : `${cookTime} min`) : ""

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const primaryCategory = courseArray.length > 0 ? courseArray[0] : "Main"

    const ingredientsText = getPropertyValue(properties.Ingredients) || ""
    const ingredientSections = parseIngredientsWithSubtitles(ingredientsText)

    const instructionsText = getPropertyValue(properties.Instructions) || ""
    const instructions = parseNumberedInstructions(instructionsText)

    const tipsText = getPropertyValue(properties["Tips & Notes"]) || ""
    const tips = tipsText.split("\n").filter((tip) => tip.trim() !== "")

    return {
      id: pageId,
      title,
      description,
      slug,
      image: images.length > 0 ? images[0] : "/placeholder.svg?height=500&width=1000",
      images,
      prepTime: formattedPrepTime,
      cookTime: formattedCookTime,
      serves,
      courses: courseArray,
      category: primaryCategory,
      cuisine,
      isFavorite,
      ingredientSections,
      instructions,
      tips,
      createdAt: page.created_time,
      updatedAt: page.last_edited_time,
    }
  } catch (error) {
    console.error("Error fetching recipe by ID from Notion:", error)
    return null
  }
}

// Function to fetch a single recipe by its slug
export async function fetchRecipeBySlugFromNotion(slug: string) {
  if (!slug) {
    console.error("No slug provided")
    return null
  }

  try {
    const recipes = await fetchRecipesFromNotion()

    if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
      console.log("No recipes found or invalid response")
      return null
    }

    const recipe = recipes.find((r) => r.slug === slug)

    if (!recipe) {
      return null
    }

    return await fetchRecipeByIdFromNotion(recipe.id)
  } catch (error) {
    console.error("Error fetching recipe by slug from Notion:", error)
    return null
  }
}

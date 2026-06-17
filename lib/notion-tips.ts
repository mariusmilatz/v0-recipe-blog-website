import { Client } from "@notionhq/client"
import { NotionToMarkdown } from "notion-to-md"
import { cacheNotionImage } from "./image-cache"

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_KEY,
})

// Initialize NotionToMarkdown
const n2m = new NotionToMarkdown({ notionClient: notion })

export interface Tip {
  id: string
  title: string
  description: string
  slug: string
  publishDate: string
  author: string
  authorJob: string
  authorDescription: string
  authorProfilePhoto?: string
  titleImage?: string
  tags: string[]
  content: {
    paragraphs: string[]
    images: string[]
  }
}

export async function getAllTipsFromNotion(): Promise<Tip[]> {
  try {
    const databaseId = process.env.NOTION_TIPS_DATABASE_ID

    if (!databaseId) {
      throw new Error("NOTION_TIPS_DATABASE_ID environment variable is not set")
    }

    // Query the database
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
          property: "Publish Date",
          direction: "descending",
        },
      ],
    })

    // Process the results
    const tips = await Promise.all(
      response.results.map(async (page: any) => {
        const properties = page.properties

        // Extract title
        const title = properties.Title.title[0]?.plain_text || "Untitled"

        // Create slug from title
        const slug = title
          .toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "-")

        // Extract short description
        const description = properties["Short Description"].rich_text[0]?.plain_text || ""

        // Extract tags
        const tags = properties.Tags.multi_select.map((tag: any) => tag.name)

        // Extract publish date
        const publishDate = properties["Publish Date"].date?.start || ""

        // Extract author info
        const author = properties.Author.rich_text[0]?.plain_text || "Anonymous"
        const authorJob = properties["Author Job"]?.rich_text[0]?.plain_text || ""
        const authorDescription = properties["Author discription"]?.rich_text[0]?.plain_text || ""

        // Extract title image
        let titleImage = ""
        if (properties["Title Image"]?.files?.length > 0) {
          const file = properties["Title Image"].files[0]
          titleImage = await cacheNotionImage(file.file?.url || file.external?.url || "")
        }

        // Extract author profile photo
        let authorProfilePhoto = ""
        if (properties["Author Profile Photo"]?.files?.length > 0) {
          const file = properties["Author Profile Photo"].files[0]
          authorProfilePhoto = await cacheNotionImage(file.file?.url || file.external?.url || "")
        }

        return {
          id: page.id,
          title,
          description,
          slug,
          publishDate,
          author,
          authorJob,
          authorDescription,
          authorProfilePhoto,
          titleImage,
          tags,
          content: {
            paragraphs: [],
            images: [],
          },
        }
      }),
    )

    return tips
  } catch (error) {
    console.error("Error fetching tips from Notion:", error)
    return []
  }
}

export async function getTipBySlugFromNotion(slug: string): Promise<Tip | null> {
  try {
    const tips = await getAllTipsFromNotion()
    const tip = tips.find((tip) => tip.slug === slug)

    if (!tip) {
      return null
    }

    // Fetch the page content
    const pageContent = await notion.pages.retrieve({
      page_id: tip.id,
    })

    // Extract content from properties
    const properties = (pageContent as any).properties
    const paragraphs = []
    const images = []

    // Extract paragraphs and images
    for (let i = 1; i <= 5; i++) {
      // Extract paragraph
      const paragraphProp = properties[`Paragraph ${i}`]
      if (paragraphProp && paragraphProp.rich_text.length > 0) {
        const paragraphText = paragraphProp.rich_text.map((text: any) => text.plain_text).join("")
        paragraphs.push(paragraphText)
      }

      // Extract image
      const imageProp = properties[`Image ${i}`]
      if (imageProp && imageProp.files.length > 0) {
        const file = imageProp.files[0]
        const imageUrl = await cacheNotionImage(file.file?.url || file.external?.url || "")
        if (imageUrl) {
          images.push(imageUrl)
        }
      }
    }

    return {
      ...tip,
      content: {
        paragraphs,
        images,
      },
    }
  } catch (error) {
    console.error("Error fetching tip by slug from Notion:", error)
    return null
  }
}

export async function getTipByIdFromNotion(id: string): Promise<Tip | null> {
  try {
    // Fetch the page
    const page = await notion.pages.retrieve({
      page_id: id,
    })

    const properties = (page as any).properties

    // Extract title
    const title = properties.Title.title[0]?.plain_text || "Untitled"

    // Create slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")

    // Extract short description
    const description = properties["Short Description"].rich_text[0]?.plain_text || ""

    // Extract tags
    const tags = properties.Tags.multi_select.map((tag: any) => tag.name)

    // Extract publish date
    const publishDate = properties["Publish Date"].date?.start || ""

    // Extract author info
    const author = properties.Author.rich_text[0]?.plain_text || "Anonymous"
    const authorJob = properties["Author Job"]?.rich_text[0]?.plain_text || ""
    const authorDescription = properties["Author discription"]?.rich_text[0]?.plain_text || ""

    // Extract title image
    let titleImage = ""
    if (properties["Title Image"]?.files?.length > 0) {
      const file = properties["Title Image"].files[0]
      titleImage = await cacheNotionImage(file.file?.url || file.external?.url || "")
    }

    // Extract author profile photo
    let authorProfilePhoto = ""
    if (properties["Author Profile Photo"]?.files?.length > 0) {
      const file = properties["Author Profile Photo"].files[0]
      authorProfilePhoto = await cacheNotionImage(file.file?.url || file.external?.url || "")
    }

    // Extract paragraphs and images
    const paragraphs = []
    const images = []

    for (let i = 1; i <= 5; i++) {
      // Extract paragraph
      const paragraphProp = properties[`Paragraph ${i}`]
      if (paragraphProp && paragraphProp.rich_text.length > 0) {
        const paragraphText = paragraphProp.rich_text.map((text: any) => text.plain_text).join("")
        paragraphs.push(paragraphText)
      }

      // Extract image
      const imageProp = properties[`Image ${i}`]
      if (imageProp && imageProp.files.length > 0) {
        const file = imageProp.files[0]
        const imageUrl = await cacheNotionImage(file.file?.url || file.external?.url || "")
        if (imageUrl) {
          images.push(imageUrl)
        }
      }
    }

    return {
      id: page.id,
      title,
      description,
      slug,
      publishDate,
      author,
      authorJob,
      authorDescription,
      authorProfilePhoto,
      titleImage,
      tags,
      content: {
        paragraphs,
        images,
      },
    }
  } catch (error) {
    console.error("Error fetching tip by ID from Notion:", error)
    return null
  }
}

// Helper function to format text with basic markdown
export function formatText(text: string): string {
  if (!text) return ""

  // Convert bold text (surrounded by **) to HTML
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

  // Convert italic text (surrounded by *) to HTML
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>")

  // Convert links [text](url) to HTML
  text = text.replace(/\[([^\]]+)\]$$([^)]+)$$/g, '<a href="$2" class="text-green-600 hover:underline">$1</a>')

  return text
}

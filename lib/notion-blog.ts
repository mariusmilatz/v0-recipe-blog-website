import { Client } from "@notionhq/client"

// Initialize Notion client
let notion: Client
try {
  notion = new Client({
    auth: process.env.NOTION_KEY,
  })
} catch (error) {
  console.error("Failed to initialize Notion client:", error)
  // Create a dummy client to prevent crashes
  notion = {} as Client
}

// Format database ID with hyphens if needed
function formatDatabaseId(id: string): string {
  if (!id) return ""

  // If the ID already has hyphens, return it as is
  if (id.includes("-")) return id

  // Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  try {
    return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`
  } catch (error) {
    console.error("Error formatting database ID:", error)
    return id // Return original ID if formatting fails
  }
}

// Get the blog database ID from environment variables
const blogDatabaseId = formatDatabaseId(process.env.NOTION_BLOG_DATABASE_ID || "")

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
      case "date":
        return property.date?.start || null
      case "files":
        return property.files?.map((f: any) => f.file?.url || f.external?.url).filter(Boolean) || []
      case "url":
        return property.url || null
      case "checkbox":
        return property.checkbox || false
      default:
        return null
    }
  } catch (error) {
    console.error(`Error extracting property value for type ${property?.type}:`, error)
    return null
  }
}

// Function to fetch all blog posts from the Notion database
export async function fetchBlogPostsFromNotion() {
  if (!process.env.NOTION_KEY || !process.env.NOTION_BLOG_DATABASE_ID) {
    console.error("Missing Notion API key or blog database ID")
    return []
  }

  try {
    if (!notion.databases?.query) {
      console.error("Notion client not properly initialized")
      return []
    }

    if (!blogDatabaseId) {
      console.error("Invalid blog database ID")
      return []
    }

    // Query the database, filtering for published posts only
    // Using "Publish" instead of "Published" based on your actual database structure
    const response = await notion.databases.query({
      database_id: blogDatabaseId,
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

    if (!response.results || !Array.isArray(response.results)) {
      console.error("Invalid response from Notion API:", response)
      return []
    }

    return response.results
      .map((page: any) => {
        try {
          const properties = page.properties || {}

          // Extract properties with fallbacks for missing data
          // Using your actual property names from the debug output
          const title = getPropertyValue(properties["Title"]) || "Untitled Blog Post"
          const shortDescription = getPropertyValue(properties["Short Description"]) || ""
          const tags = getPropertyValue(properties["Tags"]) || []
          const publishDate = getPropertyValue(properties["Publish Date"]) || ""
          const author = getPropertyValue(properties["Author"]) || "Anonymous"
          const authorTitle = getPropertyValue(properties["Author Job"]) || ""
          const authorDescription = getPropertyValue(properties["Author discription"]) || ""
          const titleImages = getPropertyValue(properties["Title Image"]) || []
          const authorProfilePhotos = getPropertyValue(properties["Author Profile Photo"]) || []
          const isPublished = getPropertyValue(properties["Publish"]) || false

          // Skip unpublished posts
          if (!isPublished) {
            return null
          }

          // Generate a slug from the title
          const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")

          return {
            id: page.id,
            title,
            shortDescription,
            slug,
            tags,
            publishDate,
            author,
            authorTitle,
            authorDescription,
            authorProfilePhoto: authorProfilePhotos.length > 0 ? authorProfilePhotos[0] : null,
            titleImage: titleImages.length > 0 ? titleImages[0] : "/placeholder.svg?height=500&width=1000",
            isPublished,
            createdAt: page.created_time,
            updatedAt: page.last_edited_time,
          }
        } catch (error) {
          console.error("Error processing blog post from Notion:", error)
          return null
        }
      })
      .filter(Boolean) // Remove any null entries
  } catch (error) {
    console.error("Error fetching blog posts from Notion:", error)
    return []
  }
}

// Function to fetch a single blog post by its ID
export async function fetchBlogPostByIdFromNotion(pageId: string) {
  if (!pageId) {
    console.error("No page ID provided")
    return null
  }

  try {
    if (!notion.pages?.retrieve) {
      console.error("Notion client not properly initialized")
      return null
    }

    // Get the page
    const page = await notion.pages.retrieve({ page_id: pageId })
    const properties = (page.properties as any) || {}

    // Extract properties with fallbacks using your actual property names
    const title = getPropertyValue(properties["Title"]) || "Untitled Blog Post"
    const shortDescription = getPropertyValue(properties["Short Description"]) || ""
    const tags = getPropertyValue(properties["Tags"]) || []
    const publishDate = getPropertyValue(properties["Publish Date"]) || ""
    const author = getPropertyValue(properties["Author"]) || "Anonymous"
    const authorTitle = getPropertyValue(properties["Author Job"]) || ""
    const authorDescription = getPropertyValue(properties["Author discription"]) || ""
    const titleImages = getPropertyValue(properties["Title Image"]) || []
    const authorProfilePhotos = getPropertyValue(properties["Author Profile Photo"]) || []
    const isPublished = getPropertyValue(properties["Publish"]) || false

    // Skip unpublished posts
    if (!isPublished) {
      return null
    }

    // Generate a slug from the title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Extract paragraphs and images
    const content = []

    // Process paragraphs and images (up to 5 of each)
    for (let i = 1; i <= 5; i++) {
      const paragraphKey = `Paragraph ${i}`
      const imageKey = `Image ${i}`

      const paragraph = getPropertyValue(properties[paragraphKey])
      const images = getPropertyValue(properties[imageKey])

      if (paragraph) {
        content.push({
          type: "paragraph",
          text: paragraph,
        })
      }

      if (images && images.length > 0) {
        content.push({
          type: "image",
          url: images[0],
          caption: `Image ${i}`,
        })
      }
    }

    return {
      id: pageId,
      title,
      shortDescription,
      slug,
      tags,
      publishDate,
      author,
      authorTitle,
      authorDescription,
      authorProfilePhoto: authorProfilePhotos.length > 0 ? authorProfilePhotos[0] : null,
      titleImage: titleImages.length > 0 ? titleImages[0] : "/placeholder.svg?height=500&width=1000",
      content,
      isPublished,
      createdAt: page.created_time,
      updatedAt: page.last_edited_time,
    }
  } catch (error) {
    console.error("Error fetching blog post by ID from Notion:", error)
    return null
  }
}

// Function to fetch a single blog post by its slug
export async function fetchBlogPostBySlugFromNotion(slug: string) {
  if (!slug) {
    console.error("No slug provided")
    return null
  }

  try {
    // First, get all blog posts (this will only return published posts)
    const posts = await fetchBlogPostsFromNotion()

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      console.log("No blog posts found or invalid response")
      return null
    }

    // Find the post with the matching slug
    const post = posts.find((p) => p.slug === slug)

    if (!post) {
      return null
    }

    // Fetch the full post details using the ID
    return await fetchBlogPostByIdFromNotion(post.id)
  } catch (error) {
    console.error("Error fetching blog post by slug from Notion:", error)
    return null
  }
}

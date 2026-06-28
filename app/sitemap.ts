import type { MetadataRoute } from "next"
import { fetchRecipesFromNotion } from "@/lib/notion"

export const revalidate = 3600 // regenerate hourly

const BASE = "https://www.vegansideproject.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const recipes = await fetchRecipesFromNotion()

  const recipeUrls: MetadataRoute.Sitemap = recipes.map((recipe: any) => ({
    url: `${BASE}/recipes/${recipe.slug}`,
    lastModified: new Date(recipe.updatedAt ?? recipe.createdAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  const staticUrls: MetadataRoute.Sitemap = [
    { url: BASE,                      lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/recipes`,         lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/about`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/tips`,            lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/blog`,            lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/contact`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/donate`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/submit-recipe`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ]

  return [...staticUrls, ...recipeUrls]
}

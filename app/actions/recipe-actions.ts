"use server"

import { fetchRecipesFromNotion, fetchRecipeBySlugFromNotion, fetchRecipeByIdFromNotion } from "@/lib/notion"

// Fetch all recipes (lightweight — no ingredients/instructions)
export async function fetchAllRecipes() {
  try {
    const recipes = await fetchRecipesFromNotion()
    return recipes
  } catch (error) {
    console.error("Error in fetchAllRecipes:", error)
    return []
  }
}

// Fetch a single recipe by slug (full data including ingredients/instructions)
export async function fetchRecipeBySlug(slug: string) {
  try {
    const recipe = await fetchRecipeBySlugFromNotion(slug)
    return recipe
  } catch (error) {
    console.error(`Error in fetchRecipeBySlug for slug ${slug}:`, error)
    return null
  }
}

// Fetch full recipe data for a list of Notion page IDs (used for meal plan printing)
export async function fetchRecipesByIds(ids: string[]) {
  try {
    const results = await Promise.all(ids.map((id) => fetchRecipeByIdFromNotion(id)))
    return results.filter(Boolean)
  } catch (error) {
    console.error("Error in fetchRecipesByIds:", error)
    return []
  }
}

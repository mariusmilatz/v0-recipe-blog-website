"use server"

import { fetchRecipesFromNotion, fetchRecipeBySlugFromNotion } from "@/lib/notion"

// Fetch all recipes
export async function fetchAllRecipes() {
  try {
    const recipes = await fetchRecipesFromNotion()
    return recipes
  } catch (error) {
    console.error("Error in fetchAllRecipes:", error)
    return []
  }
}

// Fetch a single recipe by slug
export async function fetchRecipeBySlug(slug: string) {
  try {
    const recipe = await fetchRecipeBySlugFromNotion(slug)
    return recipe
  } catch (error) {
    console.error(`Error in fetchRecipeBySlug for slug ${slug}:`, error)
    return null
  }
}

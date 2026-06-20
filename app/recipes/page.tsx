// app/recipes/page.tsx  →  deploy as: app/recipes/page.tsx
import { fetchAllRecipes } from "../actions/recipe-actions"
import RecipesClient from "./RecipesClient"

// Rebuild the page at most once per minute in the background.
// Visitors always get an instant response from Vercel's edge cache.
export const revalidate = 60

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const [recipes, { tab }] = await Promise.all([fetchAllRecipes(), searchParams])
  return <RecipesClient recipes={recipes} initialTab={tab || "all"} />
}


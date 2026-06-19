// app/recipes/page.tsx  →  deploy as: app/recipes/page.tsx
import { fetchAllRecipes } from "../actions/recipe-actions"
import RecipesClient from "./RecipesClient"

export const dynamic = "force-dynamic"

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const [recipes, { tab }] = await Promise.all([fetchAllRecipes(), searchParams])
  return <RecipesClient recipes={recipes} initialTab={tab || "all"} />
}


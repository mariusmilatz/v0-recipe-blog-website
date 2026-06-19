import { fetchAllRecipes } from "../actions/recipe-actions"
import RecipesClient from "./RecipesClient"

export const dynamic = "force-dynamic"

export default async function RecipesPage() {
  const recipes = await fetchAllRecipes()
  return <RecipesClient recipes={recipes} />
}

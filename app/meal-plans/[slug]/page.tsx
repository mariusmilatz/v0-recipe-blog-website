import { notFound } from "next/navigation"
import MealPlanClient from "@/components/meal-plan/meal-plan-client"
import { fetchMealPlanBySlugFromNotion } from "@/lib/notion-mealplan"
import { fetchAllRecipes, fetchRecipesByIds } from "@/app/actions/recipe-actions"

export const dynamic = "force-dynamic"

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// Smart matching: handles prefixes like "Reheat:", "Leftover:", etc.
function matchMealToRecipe(mealTitle: string, lightRecipes: any[]): any | null {
  if (!mealTitle) return null

  // 1. Exact slug match
  const slug = titleToSlug(mealTitle)
  let match = lightRecipes.find((r) => r.slug === slug)
  if (match) return match

  // 2. Strip common meal-plan prefixes and retry
  const stripped = mealTitle
    .replace(/^(reheat|leftover|leftover of|use leftover|batch cook|make)\s*[:\-]\s*/i, "")
    .trim()

  if (stripped !== mealTitle) {
    const strippedSlug = titleToSlug(stripped)
    match = lightRecipes.find((r) => r.slug === strippedSlug)
    if (match) return match

    // 3. Partial match on stripped title
    const strippedLower = stripped.toLowerCase()
    match = lightRecipes.find(
      (r) =>
        r.title.toLowerCase().includes(strippedLower) ||
        strippedLower.includes(r.title.toLowerCase())
    )
    if (match) return match
  }

  // 4. Partial match on original meal title
  const mealLower = mealTitle.toLowerCase()
  match = lightRecipes.find(
    (r) =>
      mealLower.includes(r.title.toLowerCase()) ||
      r.title.toLowerCase().includes(mealLower)
  )
  return match || null
}

export default async function MealPlanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const [mealPlan, lightRecipes] = await Promise.all([
    fetchMealPlanBySlugFromNotion(slug),
    fetchAllRecipes(),
  ])

  if (!mealPlan) notFound()

  // Find which recipe IDs are needed for the meals in this plan
  const neededIds = new Set<string>()
  for (const meals of Object.values(mealPlan.meals)) {
    for (const meal of Object.values(meals as any)) {
      const title = (meal as any)?.title
      if (title && title.toLowerCase() !== "no meal" && title.trim() !== "") {
        const matched = matchMealToRecipe(title, lightRecipes)
        if (matched?.id) neededIds.add(matched.id)
      }
    }
  }

  // Fetch full recipe data (ingredients, instructions, tips) for only the needed recipes
  const fullRecipes = neededIds.size > 0 ? await fetchRecipesByIds([...neededIds]) : []

  return <MealPlanClient mealPlan={mealPlan} recipes={fullRecipes} />
}

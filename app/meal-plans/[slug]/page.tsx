import { notFound } from "next/navigation"
import MealPlanClient from "@/components/meal-plan/meal-plan-client"
import { fetchMealPlanBySlugFromNotion } from "@/lib/notion-mealplan"
import { fetchAllRecipes } from "@/app/actions/recipe-actions"

export const dynamic = "force-dynamic"

export default async function MealPlanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [mealPlan, recipes] = await Promise.all([
    fetchMealPlanBySlugFromNotion(slug),
    fetchAllRecipes(),
  ])

  if (!mealPlan) {
    notFound()
  }

  return <MealPlanClient mealPlan={mealPlan} recipes={recipes} />
}

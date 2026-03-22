import { notFound } from "next/navigation"
import MealPlanClient from "@/components/meal-plan/meal-plan-client"
import { fetchMealPlanBySlugFromNotion } from "@/lib/notion-mealplan"

export default async function MealPlanPage({ params }) {
  const mealPlan = await fetchMealPlanBySlugFromNotion(params.slug)

  if (!mealPlan) {
    notFound()
  }

  return <MealPlanClient mealPlan={mealPlan} />
}

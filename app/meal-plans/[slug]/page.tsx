import { notFound } from "next/navigation"
import MealPlanClient from "@/components/meal-plan/meal-plan-client"
import { fetchMealPlanBySlugFromNotion } from "@/lib/notion-mealplan"

export const dynamic = "force-dynamic"

export default async function MealPlanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mealPlan = await fetchMealPlanBySlugFromNotion(slug)

  if (!mealPlan) {
    notFound()
  }

  return <MealPlanClient mealPlan={mealPlan} />
}

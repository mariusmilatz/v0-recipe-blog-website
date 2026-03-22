import { redirect } from "next/navigation"
import { fetchAllMealPlansFromNotion } from "@/lib/notion-mealplan"

export default async function BeginnerFriendlyMealPlanPage() {
  const mealPlans = await fetchAllMealPlansFromNotion()

  // If there are meal plans, redirect to the first one
  if (mealPlans.length > 0) {
    redirect(`/meal-plans/${mealPlans[0].slug}`)
  }

  // If no meal plans, redirect to the main meal plans page
  redirect("/meal-plans")
}

// → app/meal-plans/builder/page.tsx
// Server component: fetches all recipes from Notion, passes to the interactive builder

import { fetchRecipesFromNotion } from "@/lib/notion"
import MealPlanBuilder from "@/components/meal-plan/MealPlanBuilder"

export const metadata = {
  title: "Build Your Meal Plan",
  description: "Plan your week with a personalised vegan meal plan. Choose recipes, set your cook days, and export a shopping list.",
}

export default async function MealPlanBuilderPage() {
  const rawRecipes = await fetchRecipesFromNotion()

  // Map to the lightweight snippet shape MealPlanBuilder expects
  const recipes = rawRecipes.map((r: any) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    image: r.image,
    courses: r.courses ?? [],
    category: r.category ?? "",
    cookTime: r.cookTime ?? "",
    prepTime: r.prepTime ?? "",
    dietary: r.dietary ?? [],
    description: r.description ?? "",
  }))

  return <MealPlanBuilder recipes={recipes} />
}

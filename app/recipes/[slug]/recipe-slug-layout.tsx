import type React from "react"
import type { Metadata } from "next"
import { fetchRecipeBySlugFromNotion } from "@/lib/notion"
import { calculateTotalTime } from "@/lib/time-utils"

type Props = {
  params: { slug: string }
  children: React.ReactNode
}

// Helper: convert "45 min" → "PT45M" for schema.org
function toIsoDuration(timeStr: string): string | undefined {
  if (!timeStr) return undefined
  const match = timeStr.match(/(\d+)/)
  return match ? `PT${match[1]}M` : undefined
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const recipe = await fetchRecipeBySlugFromNotion(params.slug)

  if (!recipe) {
    return {
      title: "Recipe Not Found",
      description: "This recipe could not be found.",
    }
  }

  const title = recipe.title
  const description =
    recipe.description ||
    `A delicious vegan ${recipe.courses?.[0] || "recipe"} from Vegan Side Project. Easy to make and loved by vegans and non-vegans alike.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://www.vegansideproject.com/recipes/${recipe.slug}`,
      siteName: "Vegan Side Project",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://www.vegansideproject.com/recipes/${recipe.slug}`,
    },
  }
}

function buildStructuredData(recipe: any) {
  const ingredients =
    recipe.ingredientSections?.flatMap((section: any) => section.items) ?? []

  const steps =
    recipe.instructions
      ?.filter((i: any) => i.type === "step")
      .map((i: any, index: number) => ({
        "@type": "HowToStep",
        position: index + 1,
        text: i.content,
      })) ?? []

  const keywords = [
    "vegan",
    recipe.title,
    ...(recipe.courses ?? []),
    recipe.cuisine,
    ...(recipe.dietary ?? []),
  ]
    .filter(Boolean)
    .join(", ")

  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description ?? "",
    url: `https://www.vegansideproject.com/recipes/${recipe.slug}`,
    author: {
      "@type": "Organization",
      name: "Vegan Side Project",
      url: "https://www.vegansideproject.com",
    },
    datePublished: recipe.createdAt,
    dateModified: recipe.updatedAt,
    prepTime: toIsoDuration(recipe.prepTime),
    cookTime: toIsoDuration(recipe.cookTime),
    totalTime: toIsoDuration(calculateTotalTime(recipe.prepTime, recipe.cookTime)),
    recipeYield: recipe.serves ? `${recipe.serves} servings` : undefined,
    recipeCategory: recipe.courses?.[0] ?? recipe.category ?? "Main Course",
    recipeCuisine: recipe.cuisine ?? undefined,
    keywords,
    suitableForDiet: "https://schema.org/VeganDiet",
    recipeIngredient: ingredients,
    recipeInstructions: steps,
  }
}

export default async function RecipeSlugLayout({ children, params }: Props) {
  const recipe = await fetchRecipeBySlugFromNotion(params.slug)

  return (
    <>
      {recipe && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildStructuredData(recipe)),
          }}
        />
      )}
      {children}
    </>
  )
}

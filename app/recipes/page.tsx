import Link from "next/link"
import { ChevronDown, Clock } from "lucide-react"
import { fetchAllRecipes } from "../actions/recipe-actions"
import { calculateTotalTime } from "@/lib/time-utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

// Helper function to map category names for consistent filtering
function getCategoryForTab(category: string) {
  const categoryMap: Record<string, string> = {
    "Main Course": "mains",
    "Main Dish": "mains",
    Main: "mains",
    "Side Dish": "sides",
    Side: "sides",
    Dessert: "desserts",
    Snack: "snacks",
    Breakfast: "breakfast",
    "Breakfast Dish": "breakfast",
    "Morning Meal": "breakfast",
    Appetizer: "snacks",
    Soup: "sides",
    Salad: "sides",
    "Side dish": "sides",
  }
  return categoryMap[category] || category.toLowerCase()
}

// Helper function to check if a recipe belongs to a specific tab category
function recipeMatchesTab(recipe: any, tabCategory: string) {
  if (recipe.courses && Array.isArray(recipe.courses)) {
    return recipe.courses.some((course: string) => getCategoryForTab(course) === tabCategory)
  }
  return getCategoryForTab(recipe.category) === tabCategory
}

export default async function RecipesPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const searchQuery = searchParams?.q || ""
  const activeTab = searchParams?.tab || "all"
  const activeCuisine = searchParams?.cuisine || ""

  // Fetch recipes from Notion
  const recipes = await fetchAllRecipes()

  // Collect unique non-empty cuisines for the filter row
  const allCuisines = Array.from(
    new Set(
      recipes
        .map((r: any) => r.cuisine)
        .filter((c: string) => c && c.trim() !== "")
    )
  ).sort() as string[]

  // Filter by search query
  let filteredRecipes = searchQuery
    ? recipes.filter(
        (recipe: any) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : recipes

  // Filter by cuisine
  if (activeCuisine) {
    filteredRecipes = filteredRecipes.filter(
      (recipe: any) => recipe.cuisine?.toLowerCase() === activeCuisine.toLowerCase()
    )
  }

  // Build search param helpers for cuisine links
  function cuisineHref(cuisine: string) {
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (activeTab !== "all") params.set("tab", activeTab)
    if (cuisine) params.set("cuisine", cuisine)
    const qs = params.toString()
    return qs ? `?${qs}` : "/recipes"
  }

  function clearCuisineHref() {
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (activeTab !== "all") params.set("tab", activeTab)
    const qs = params.toString()
    return qs ? `?${qs}` : "/recipes"
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recipes</h1>
          <p className="text-muted-foreground">Browse our collection of delicious vegan recipes.</p>
        </div>
        <div className="flex items-center gap-2">
          <form>
            {/* Preserve existing filters when searching */}
            {activeCuisine && <input type="hidden" name="cuisine" value={activeCuisine} />}
            {activeTab !== "all" && <input type="hidden" name="tab" value={activeTab} />}
            <Input name="q" placeholder="Search recipes..." className="w-[200px]" defaultValue={searchQuery} />
          </form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Filter <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Newest First</DropdownMenuItem>
              <DropdownMenuItem>Oldest First</DropdownMenuItem>
              <DropdownMenuItem>Most Popular</DropdownMenuItem>
              <DropdownMenuItem>Quick &amp; Easy</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cuisine filter chips — only shown when cuisines exist in the database */}
      {allCuisines.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          <Link href={clearCuisineHref()}>
            <Badge
              variant={activeCuisine === "" ? "default" : "outline"}
              className="cursor-pointer text-sm px-3 py-1"
            >
              All cuisines
            </Badge>
          </Link>
          {allCuisines.map((cuisine) => (
            <Link key={cuisine} href={cuisineHref(cuisine)}>
              <Badge
                variant={activeCuisine.toLowerCase() === cuisine.toLowerCase() ? "default" : "outline"}
                className="cursor-pointer text-sm px-3 py-1"
              >
                {cuisine}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      <Tabs defaultValue={activeTab} className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="mains">Mains</TabsTrigger>
          <TabsTrigger value="sides">Sides</TabsTrigger>
          <TabsTrigger value="desserts">Desserts</TabsTrigger>
          <TabsTrigger value="snacks">Snacks</TabsTrigger>
          <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
        </TabsList>

        {(["all", "mains", "sides", "desserts", "snacks", "breakfast"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(tab === "all" ? filteredRecipes : filteredRecipes.filter((r: any) => recipeMatchesTab(r, tab))).map(
                (recipe: any) => (
                  <RecipeCard
                    key={recipe.id}
                    title={recipe.title}
                    description={recipe.description}
                    image={recipe.image}
                    time={calculateTotalTime(recipe.prepTime, recipe.cookTime)}
                    categories={recipe.courses || [recipe.category]}
                    slug={recipe.slug}
                  />
                )
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function RecipeCard({
  title,
  description,
  image,
  time,
  categories,
  slug,
}: {
  title: string
  description: string
  image: string
  time: string
  categories: string[]
  slug: string
}) {
  const categoryList = Array.isArray(categories) ? categories : [categories].filter(Boolean)

  return (
    <Card className="overflow-hidden flex flex-col h-[450px]">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={image || "/placeholder.svg?height=300&width=500"}
          alt={title}
          className="object-cover w-full h-full transition-all hover:scale-105"
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-end pb-4">
        <div className="grid grid-cols-1 gap-2 text-sm text-gray-500">
          <div className="flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            <span>{time || "N/A"}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {categoryList.map((cat, index) => (
              <Badge key={index} variant="plain" className="text-xs">
                {index > 0 ? `, ${cat}` : cat || "N/A"}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild variant="outline" className="w-full border border-gray-300">
          <Link href={`/recipes/${slug}`}>View Recipe</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

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

// Helper function to map category names for consistent filtering
function getCategoryForTab(category) {
  const categoryMap = {
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
function recipeMatchesTab(recipe, tabCategory) {
  // If the recipe has courses array, check if any course matches the tab
  if (recipe.courses && Array.isArray(recipe.courses)) {
    return recipe.courses.some((course) => getCategoryForTab(course) === tabCategory)
  }

  // Fallback to the single category field
  return getCategoryForTab(recipe.category) === tabCategory
}

export default async function RecipesPage({ searchParams }) {
  // Get search query from URL if present
  const searchQuery = searchParams?.q || ""

  // Get tab from URL if present, default to "all"
  const activeTab = searchParams?.tab || "all"

  // Fetch recipes from Notion
  const recipes = await fetchAllRecipes()

  // Filter recipes based on search query if present
  const filteredRecipes = searchQuery
    ? recipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : recipes

  return (
    <div className="container py-10">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recipes</h1>
          <p className="text-muted-foreground">Browse our collection of delicious vegan recipes.</p>
        </div>
        <div className="flex items-center gap-2">
          <form>
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
              <DropdownMenuItem>Quick & Easy</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue={activeTab} className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="mains">Mains</TabsTrigger>
          <TabsTrigger value="sides">Sides</TabsTrigger>
          <TabsTrigger value="desserts">Desserts</TabsTrigger>
          <TabsTrigger value="snacks">Snacks</TabsTrigger>
          <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                title={recipe.title}
                description={recipe.description}
                image={recipe.image}
                time={calculateTotalTime(recipe.prepTime, recipe.cookTime)}
                categories={recipe.courses || [recipe.category]}
                slug={recipe.slug}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="mains" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes
              .filter((recipe) => recipeMatchesTab(recipe, "mains"))
              .map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  title={recipe.title}
                  description={recipe.description}
                  image={recipe.image}
                  time={calculateTotalTime(recipe.prepTime, recipe.cookTime)}
                  categories={recipe.courses || [recipe.category]}
                  slug={recipe.slug}
                />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="sides" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes
              .filter((recipe) => recipeMatchesTab(recipe, "sides"))
              .map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  title={recipe.title}
                  description={recipe.description}
                  image={recipe.image}
                  time={calculateTotalTime(recipe.prepTime, recipe.cookTime)}
                  categories={recipe.courses || [recipe.category]}
                  slug={recipe.slug}
                />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="desserts" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes
              .filter((recipe) => recipeMatchesTab(recipe, "desserts"))
              .map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  title={recipe.title}
                  description={recipe.description}
                  image={recipe.image}
                  time={calculateTotalTime(recipe.prepTime, recipe.cookTime)}
                  categories={recipe.courses || [recipe.category]}
                  slug={recipe.slug}
                />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="snacks" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes
              .filter((recipe) => recipeMatchesTab(recipe, "snacks"))
              .map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  title={recipe.title}
                  description={recipe.description}
                  image={recipe.image}
                  time={calculateTotalTime(recipe.prepTime, recipe.cookTime)}
                  categories={recipe.courses || [recipe.category]}
                  slug={recipe.slug}
                />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="breakfast" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes
              .filter((recipe) => recipeMatchesTab(recipe, "breakfast"))
              .map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  title={recipe.title}
                  description={recipe.description}
                  image={recipe.image}
                  time={calculateTotalTime(recipe.prepTime, recipe.cookTime)}
                  categories={recipe.courses || [recipe.category]}
                  slug={recipe.slug}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function RecipeCard({ title, description, image, time, categories, slug }) {
  // Ensure categories is always an array
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

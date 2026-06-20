"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import Link from "next/link"
import { Clock, Search, X } from "lucide-react"
import { calculateTotalTime } from "@/lib/time-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

const CATEGORY_MAP: Record<string, string> = {
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

function getCategoryForTab(category: string) {
  return CATEGORY_MAP[category] || category.toLowerCase()
}

function recipeMatchesTab(recipe: any, tabCategory: string) {
  if (recipe.courses && Array.isArray(recipe.courses)) {
    return recipe.courses.some((course: string) => getCategoryForTab(course) === tabCategory)
  }
  return getCategoryForTab(recipe.category) === tabCategory
}

// Default suggestions shown when the search bar is focused but empty
const DEFAULT_SUGGESTIONS = ["Breakfast", "Italian", "Main Dish", "Dessert"]

export default function RecipesClient({
  recipes,
  initialTab = "all",
}: {
  recipes: any[]
  initialTab?: string
}) {
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState(initialTab)
  const [showDropdown, setShowDropdown] = useState(false)

  // Sync tab when navigating from footer links while already on /recipes
  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])
  const containerRef = useRef<HTMLDivElement>(null)

  // Build a flat list of all suggestion tokens (courses + cuisines + recipe titles)
  const allSuggestions = useMemo(() => {
    const courses = [...new Set(recipes.flatMap((r: any) => r.courses || []).filter(Boolean))] as string[]
    const cuisines = [...new Set(recipes.map((r: any) => r.cuisine).filter(Boolean))] as string[]
    const titles = recipes.map((r: any) => r.title)
    return [...courses, ...cuisines, ...titles]
  }, [recipes])

  // Dropdown suggestions — default 4 when empty, or filtered matches when typing
  const suggestions = useMemo(() => {
    if (!query.trim()) return DEFAULT_SUGGESTIONS
    const q = query.toLowerCase()
    const startsWith = allSuggestions.filter(s => s.toLowerCase().startsWith(q))
    const contains = allSuggestions.filter(s => !s.toLowerCase().startsWith(q) && s.toLowerCase().includes(q))
    return [...startsWith, ...contains].slice(0, 4)
  }, [query, allSuggestions])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Filter recipes: matches title, description, cuisine, or any course tag
  const filteredRecipes = useMemo(() => {
    if (!query.trim()) return recipes
    const q = query.toLowerCase()
    return recipes.filter((r: any) =>
      r.title?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.cuisine?.toLowerCase().includes(q) ||
      r.courses?.some((c: string) => c.toLowerCase().includes(q))
    )
  }, [recipes, query])

  function selectSuggestion(value: string) {
    setQuery(value)
    setShowDropdown(false)
  }

  function clearSearch() {
    setQuery("")
    setShowDropdown(false)
  }

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recipes</h1>
          <p className="text-muted-foreground">Browse our collection of delicious vegan recipes.</p>
        </div>

        {/* Search with dropdown */}
        <div ref={containerRef} className="relative">
          <div className="flex items-center border rounded-md bg-background shadow-sm">
            <Search className="ml-3 h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={query}
              placeholder="Search recipes, cuisines, tags..."
              className="w-[260px] py-2 px-3 text-sm bg-transparent outline-none"
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => {
                setQuery(e.target.value)
                setShowDropdown(true)
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setShowDropdown(false)
                if (e.key === "Enter") setShowDropdown(false)
              }}
            />
            {query && (
              <button
                className="mr-2 text-muted-foreground hover:text-foreground"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Dropdown suggestions */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 overflow-hidden">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted flex items-center gap-2 transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault() // prevent input blur before the click registers
                    selectSuggestion(suggestion)
                  }}
                >
                  <Search className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs + recipe grid */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="mains">Mains</TabsTrigger>
          <TabsTrigger value="sides">Sides</TabsTrigger>
          <TabsTrigger value="desserts">Desserts</TabsTrigger>
          <TabsTrigger value="snacks">Snacks</TabsTrigger>
          <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
        </TabsList>

        {(["all", "mains", "sides", "desserts", "snacks", "breakfast"] as const).map((tab) => {
          const visible =
            tab === "all"
              ? filteredRecipes
              : filteredRecipes.filter((r: any) => recipeMatchesTab(r, tab))

          return (
            <TabsContent key={tab} value={tab} className="mt-0">
              {visible.length === 0 ? (
                <p className="text-muted-foreground text-sm mt-4">No recipes found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visible.map((recipe: any) => (
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
              )}
            </TabsContent>
          )
        })}
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
  const [loaded, setLoaded] = useState(false)

  // Use a plain div instead of <Card> so we have full control over the top edge —
  // no hidden padding or ShadCN defaults that create a gap above the image.
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col h-[450px]">
      {/* Image goes right to the top — overflow-hidden on the outer div clips to the rounded corners */}
      <div className="h-[260px] w-full flex-shrink-0 bg-muted">
        <img
          src={image || "/placeholder.svg?height=300&width=500"}
          alt={title}
          onLoad={() => setLoaded(true)}
          className={`object-cover w-full h-full transition-all duration-500 hover:scale-105 ${
            loaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
          }`}
        />
      </div>

      {/* Text area */}
      <div className="flex flex-col flex-grow px-4 pt-3 pb-4">
        <p className="font-semibold text-base leading-snug">{title}</p>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-snug">{description}</p>

        {/* Push time + tags + button to the bottom */}
        <div className="flex-grow" />

        <div className="flex items-center justify-between text-xs text-black mb-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {time || "N/A"}
          </span>
          <span className="text-right">{categoryList.join(", ")}</span>
        </div>

        <Button asChild variant="outline" className="w-full border border-gray-300">
          <Link href={`/recipes/${slug}`}>View Recipe</Link>
        </Button>
      </div>
    </div>
  )
}

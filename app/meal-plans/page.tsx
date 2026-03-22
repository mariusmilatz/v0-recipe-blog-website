import Link from "next/link"
import { Calendar, Clock, ChevronRight, Construction } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchAllMealPlansFromNotion } from "@/lib/notion-mealplan"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function MealPlansPage() {
  // Fetch meal plans from Notion
  const notionMealPlans = await fetchAllMealPlansFromNotion()

  // Check if we have any meal plans from Notion
  const hasMealPlans = notionMealPlans && notionMealPlans.length > 0

  // Mock meal plan data for fallback
  const mockMealPlans = [
    {
      id: "beginner-friendly",
      title: "Beginner-Friendly Week",
      description: "Simple, approachable recipes perfect for those new to vegan cooking",
      image: "/placeholder.svg?key=5yt4s",
      available: true,
      featured: true,
      slug: "beginner-friendly",
    },
    {
      id: "protein-packed",
      title: "Protein-Packed Week",
      description: "High-protein vegan meals to keep you energized and satisfied",
      image: "/placeholder.svg?key=myudc",
      available: false,
      comingSoon: true,
      slug: "protein-packed",
    },
    {
      id: "quick-and-easy",
      title: "Quick & Easy Week",
      description: "Meals ready in 30 minutes or less for busy weeknights",
      image: "/placeholder.svg?key=xpc4b",
      available: false,
      comingSoon: true,
      slug: "quick-and-easy",
    },
    {
      id: "global-flavors",
      title: "Global Flavors Week",
      description: "Explore international cuisines with these plant-based recipes",
      image: "/placeholder.svg?key=uru7l",
      available: false,
      comingSoon: true,
      slug: "global-flavors",
    },
  ]

  // Use Notion meal plans if available, otherwise use mock data
  const mealPlans = hasMealPlans
    ? notionMealPlans.map((plan) => ({
        id: plan.id,
        title: plan.title,
        description: "A curated meal plan with breakfast, lunch, and dinner for each day of the week.",
        image: plan.previewImage || `/placeholder.svg?height=300&width=500&query=${encodeURIComponent(plan.title)}`,
        available: true,
        featured: true,
        slug: plan.slug,
      }))
    : mockMealPlans

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Weekly Meal Plans</h1>
        <p className="mt-4 text-muted-foreground">
          Take the guesswork out of "what's for dinner" with our curated weekly meal plans.
        </p>
      </div>

      {!hasMealPlans && (
        <Alert className="mb-8 max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No meal plans found in Notion</AlertTitle>
          <AlertDescription>
            No published meal plans were found in your Notion database. Make sure you have meal plans in your database
            and that they are marked as published.
            <div className="mt-2">
              <Link href="/api/notion-mealplan-debug" className="text-[#6a994e] hover:underline">
                Check the debug endpoint
              </Link>{" "}
              for more information.
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* How Our Meal Plans Work section - moved above the meal plan cards */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="bg-[#f8f5f2] p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">How Our Meal Plans Work</h2>
          <p className="mb-4">
            Our weekly meal plans are designed to make vegan cooking easier and more enjoyable, especially for those
            cooking for mixed dietary preferences. Each plan includes:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>7 days of breakfast, lunch, and dinner recipes</li>
            <li>A complete shopping list organized</li>
            <li>Meal prep tips to save time during the week</li>
            <li>Average daily nutritional information for the week</li>
            <li>Suggestions for modifications and substitutions</li>
          </ul>
          <p>
            We've carefully balanced the meals to ensure variety, nutrition, and satisfaction for both vegans and
            non-vegans sharing meals together.
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
        {mealPlans.map((plan) => (
          <Card key={plan.id} className={`overflow-hidden ${!plan.available ? "relative" : ""}`}>
            {!plan.available && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                <Construction className="h-10 w-10 mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">In Development</h3>
                <p className="text-muted-foreground mb-4">
                  We're currently working on this meal plan. Check back soon!
                </p>
              </div>
            )}
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={plan.image || "/placeholder.svg"}
                alt={plan.title}
                className="object-cover w-full h-full transition-all hover:scale-105"
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{plan.title}</CardTitle>
                {plan.featured && <Badge className="bg-[#6a994e]">Featured</Badge>}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  <span>7 days</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>21 meals</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {plan.available ? (
                <Button asChild className="w-full">
                  <Link href={`/meal-plans/${plan.slug}`}>
                    View Meal Plan <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button disabled className="w-full opacity-50">
                  Coming Soon
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

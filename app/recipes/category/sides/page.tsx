import Link from "next/link"
import { ChevronDown, ArrowLeft, Clock, Utensils } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

// Mock recipe data for side dishes
const sideDishes = [
  {
    title: "Roasted Vegetable Salad",
    description: "A colorful and nutritious side dish with seasonal vegetables",
    image: "/placeholder.svg?height=300&width=500",
    time: "25 mins",
    category: "Side",
    slug: "roasted-vegetable-salad",
  },
  {
    title: "Garlic Mashed Potatoes",
    description: "Creamy, garlicky mashed potatoes without the dairy",
    image: "/placeholder.svg?height=300&width=500",
    time: "20 mins",
    category: "Side",
    slug: "garlic-mashed-potatoes",
  },
  {
    title: "Maple Glazed Carrots",
    description: "Sweet and savory carrots with a maple glaze",
    image: "/placeholder.svg?height=300&width=500",
    time: "15 mins",
    category: "Side",
    slug: "maple-glazed-carrots",
  },
  {
    title: "Quinoa Tabbouleh",
    description: "A protein-rich twist on the classic Middle Eastern salad",
    image: "/placeholder.svg?height=300&width=500",
    time: "15 mins",
    category: "Side",
    slug: "quinoa-tabbouleh",
  },
  {
    title: "Sesame Green Beans",
    description: "Crisp green beans with toasted sesame seeds",
    image: "/placeholder.svg?height=300&width=500",
    time: "10 mins",
    category: "Side",
    slug: "sesame-green-beans",
  },
  {
    title: "Stuffed Mushrooms",
    description: "Savory mushroom caps filled with herbed breadcrumbs",
    image: "/placeholder.svg?height=300&width=500",
    time: "25 mins",
    category: "Side",
    slug: "stuffed-mushrooms",
  },
]

export default function SideDishesPage() {
  return (
    <div className="container py-10">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/recipes">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Recipes
        </Link>
      </Button>

      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Side Dishes</h1>
          <p className="text-muted-foreground">Delicious vegan sides to complement any meal.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search side dishes..." className="w-[200px]" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Filter <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Newest First</DropdownMenuItem>
              <DropdownMenuItem>Cooking Time</DropdownMenuItem>
              <DropdownMenuItem>Most Popular</DropdownMenuItem>
              <DropdownMenuItem>Quick & Easy</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {sideDishes.map((recipe, index) => (
          <RecipeCard
            key={index}
            title={recipe.title}
            description={recipe.description}
            image={recipe.image}
            time={recipe.time}
            category={recipe.category}
            slug={recipe.slug}
          />
        ))}
      </div>
    </div>
  )
}

function RecipeCard({ title, description, image, time, category, slug }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className="object-cover w-full h-full transition-all hover:scale-105"
        />
      </div>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            <span>Total Time: {time}</span>
          </div>
          <div className="flex items-center">
            <Utensils className="mr-1 h-3 w-3" />
            <span>{category}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" className="w-full">
          <Link href={`/recipes/${slug}`}>View Recipe</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

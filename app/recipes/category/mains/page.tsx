import Link from "next/link"
import { ChevronDown, ArrowLeft, Clock, Utensils } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

// Mock recipe data for main dishes
const mainDishes = [
  {
    title: "Creamy Mushroom Risotto",
    description: "A rich and satisfying dish that's perfect for dinner",
    image: "/placeholder.svg?height=300&width=500",
    time: "30 mins",
    category: "Main",
    slug: "creamy-mushroom-risotto",
  },
  {
    title: "Lentil Bolognese",
    description: "A hearty and protein-rich alternative to traditional bolognese",
    image: "/placeholder.svg?height=300&width=500",
    time: "40 mins",
    category: "Main",
    slug: "lentil-bolognese",
  },
  {
    title: "Crispy Tofu Stir Fry",
    description: "A quick and flavorful weeknight dinner option",
    image: "/placeholder.svg?height=300&width=500",
    time: "25 mins",
    category: "Main",
    slug: "crispy-tofu-stir-fry",
  },
  {
    title: "Vegan Mac and Cheese",
    description: "Creamy, comforting and completely dairy-free",
    image: "/placeholder.svg?height=300&width=500",
    time: "35 mins",
    category: "Main",
    slug: "vegan-mac-and-cheese",
  },
  {
    title: "Chickpea Curry",
    description: "A flavorful and protein-packed curry that's easy to make",
    image: "/placeholder.svg?height=300&width=500",
    time: "30 mins",
    category: "Main",
    slug: "chickpea-curry",
  },
  {
    title: "Stuffed Bell Peppers",
    description: "Colorful peppers filled with a savory quinoa and vegetable mixture",
    image: "/placeholder.svg?height=300&width=500",
    time: "45 mins",
    category: "Main",
    slug: "stuffed-bell-peppers",
  },
]

export default function MainDishesPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Main Dishes</h1>
          <p className="text-muted-foreground">Hearty and satisfying vegan main courses for any occasion.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search main dishes..." className="w-[200px]" />
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
        {mainDishes.map((recipe, index) => (
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

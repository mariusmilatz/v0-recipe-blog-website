import Link from "next/link"
import { ChevronDown, ArrowLeft, Clock, Utensils } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

// Mock recipe data for desserts
const desserts = [
  {
    title: "Chocolate Avocado Mousse",
    description: "A decadent dessert that's surprisingly healthy",
    image: "/placeholder.svg?height=300&width=500",
    time: "15 mins",
    category: "Dessert",
    slug: "chocolate-avocado-mousse",
  },
  {
    title: "Berry Coconut Parfait",
    description: "Layers of coconut cream, fresh berries, and granola",
    image: "/placeholder.svg?height=300&width=500",
    time: "10 mins",
    category: "Dessert",
    slug: "berry-coconut-parfait",
  },
  {
    title: "Banana Nice Cream",
    description: "Creamy frozen dessert made with just bananas and mix-ins",
    image: "/placeholder.svg?height=300&width=500",
    time: "5 mins",
    category: "Dessert",
    slug: "banana-nice-cream",
  },
  {
    title: "Vegan Apple Crisp",
    description: "Warm spiced apples with a crunchy oat topping",
    image: "/placeholder.svg?height=300&width=500",
    time: "45 mins",
    category: "Dessert",
    slug: "vegan-apple-crisp",
  },
  {
    title: "Peanut Butter Cookies",
    description: "Soft and chewy cookies with just 4 ingredients",
    image: "/placeholder.svg?height=300&width=500",
    time: "20 mins",
    category: "Dessert",
    slug: "peanut-butter-cookies",
  },
  {
    title: "Coconut Chia Pudding",
    description: "A make-ahead dessert that's nutritious and delicious",
    image: "/placeholder.svg?height=300&width=500",
    time: "5 mins + setting time",
    category: "Dessert",
    slug: "coconut-chia-pudding",
  },
]

export default function DessertsPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Desserts</h1>
          <p className="text-muted-foreground">Sweet treats that happen to be vegan.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search desserts..." className="w-[200px]" />
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
        {desserts.map((recipe, index) => (
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

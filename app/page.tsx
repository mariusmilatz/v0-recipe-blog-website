import Link from "next/link"
import { ChevronRight, Clock, Utensils } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchFeaturedRecipesFromNotion } from "@/lib/notion"
import { calculateTotalTime } from "@/lib/time-utils"

// Add a cache control directive to prevent caching
export const revalidate = 0

export default async function Home() {
  // Fetch featured recipes (those marked as favorites)
  const featuredRecipes = await fetchFeaturedRecipesFromNotion()

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-[#f8f5f2]">
            <div className="container">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Vegan Food That Actually Tastes Amazing
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Curated by a vegan and non-vegan couple who spent years finding recipes that truly work for everyone.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild>
                  <Link href="/recipes">
                    Browse Recipes <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/tips">Tips & Tricks</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Featured Recipes</h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  These are the recipes that impressed us the most - dishes that made us forget they were vegan.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              {featuredRecipes.length > 0 ? (
                featuredRecipes.map((recipe) => {
                  const totalTime = calculateTotalTime(recipe.prepTime, recipe.cookTime)

                  return (
                    <Card key={recipe.id} className="overflow-hidden flex flex-col h-[420px]">
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={recipe.image || "/placeholder.svg"}
                          alt={recipe.title}
                          className="object-cover w-full h-full transition-all hover:scale-105"
                        />
                      </div>
                      <CardHeader className="pb-0">
                        <CardTitle>{recipe.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{recipe.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-1 pb-0 flex-grow flex flex-col justify-between">
                        <div className="grid grid-cols-1 gap-2 text-sm text-gray-500 mt-2 mb-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Clock className="mr-1 h-4 w-4" />
                              <span>{totalTime}</span>
                            </div>
                            <div className="flex items-center">
                              <Utensils className="mr-1 h-4 w-4" />
                              {recipe.courses && recipe.courses.length > 0 ? (
                                <span className="flex gap-1">
                                  {recipe.courses.map((course, index) => (
                                    <Badge key={index} variant="plain" className="text-xs">
                                      {index > 0 ? `, ${course}` : course}
                                    </Badge>
                                  ))}
                                </span>
                              ) : (
                                <Badge variant="plain" className="text-xs">
                                  {recipe.category || "Main"}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0 pb-4">
                        <Button asChild variant="outline" className="w-full border border-gray-300">
                          <Link href={`/recipes/${recipe.slug}`}>View Recipe</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })
              ) : (
                // Fallback cards if no featured recipes are found
                <>
                  <Card className="overflow-hidden flex flex-col h-[420px]">
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src="/placeholder-yl2r5.png"
                        alt="Creamy Mushroom Risotto"
                        className="object-cover w-full h-full transition-all hover:scale-105"
                      />
                    </div>
                    <CardHeader className="pb-0">
                      <CardTitle>Creamy Mushroom Risotto</CardTitle>
                      <CardDescription className="line-clamp-2">
                        A rich and satisfying dish that's perfect for dinner
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-1 pb-0 flex-grow flex flex-col justify-between">
                      <div className="grid grid-cols-1 gap-2 text-sm text-gray-500 mt-2 mb-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            <span>45 mins</span>
                          </div>
                          <div className="flex items-center">
                            <Utensils className="mr-1 h-4 w-4" />
                            <Badge variant="plain" className="text-xs">
                              Main
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 pb-4">
                      <Button asChild variant="outline" className="w-full border border-gray-300">
                        <Link href="/recipes/creamy-mushroom-risotto">View Recipe</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                  <Card className="overflow-hidden flex flex-col h-[420px]">
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src="/placeholder-0r6mv.png"
                        alt="Spicy Buffalo Cauliflower Wings"
                        className="object-cover w-full h-full transition-all hover:scale-105"
                      />
                    </div>
                    <CardHeader className="pb-0">
                      <CardTitle>Spicy Buffalo Cauliflower Wings</CardTitle>
                      <CardDescription className="line-clamp-2">Crispy, spicy and perfect for game day</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-1 pb-0 flex-grow flex flex-col justify-between">
                      <div className="grid grid-cols-1 gap-2 text-sm text-gray-500 mt-2 mb-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            <span>1h 15m</span>
                          </div>
                          <div className="flex items-center">
                            <Utensils className="mr-1 h-4 w-4" />
                            <Badge variant="plain" className="text-xs">
                              Appetizer
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 pb-4">
                      <Button asChild variant="outline" className="w-full border border-gray-300">
                        <Link href="/recipes/buffalo-cauliflower-wings">View Recipe</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                  <Card className="overflow-hidden flex flex-col h-[420px]">
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src="/placeholder-dp4k9.png"
                        alt="Chocolate Avocado Mousse"
                        className="object-cover w-full h-full transition-all hover:scale-105"
                      />
                    </div>
                    <CardHeader className="pb-0">
                      <CardTitle>Chocolate Avocado Mousse</CardTitle>
                      <CardDescription className="line-clamp-2">
                        A decadent dessert that's surprisingly healthy
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-1 pb-0 flex-grow flex flex-col justify-between">
                      <div className="grid grid-cols-1 gap-2 text-sm text-gray-500 mt-2 mb-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            <span>20 mins</span>
                          </div>
                          <div className="flex items-center">
                            <Utensils className="mr-1 h-4 w-4" />
                            <Badge variant="plain" className="text-xs">
                              Dessert
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 pb-4">
                      <Button asChild variant="outline" className="w-full border border-gray-300">
                        <Link href="/recipes/chocolate-avocado-mousse">View Recipe</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </>
              )}
            </div>
            <div className="flex justify-center mt-8">
              <Button asChild variant="outline">
                <Link href="/recipes">View All Recipes</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-[#f8f5f2]">
            <div className="container">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-[#e9b949] px-3 py-1 text-sm">Why This Site Exists</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Our Journey to Better Vegan Food
                </h2>
                <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  When we started cooking together years ago, we found most vegan recipes disappointing - bland and
                  uninspiring. As a mixed vegan/non-vegan couple, we needed food we'd both enjoy. After countless
                  experiments and discoveries, we've collected recipes that truly work. We created this site to share
                  what we've learned and prove that vegan food can be exciting, flavorful, and satisfying for everyone.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild>
                    <Link href="/about">Our Story</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/blog">Read the Blog</Link>
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <img
                  src="/friends-sharing-meal.jpeg"
                  alt="Friends sharing a vegan meal together"
                  className="rounded-lg object-cover aspect-video overflow-hidden w-full max-w-[600px] h-auto"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

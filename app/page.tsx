import Link from "next/link"
import { ChevronRight, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { fetchFeaturedRecipesFromNotion } from "@/lib/notion"
import { calculateTotalTime } from "@/lib/time-utils"

export const revalidate = 0

export default async function Home() {
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
                  const categoryList = Array.isArray(recipe.courses) && recipe.courses.length > 0
                    ? recipe.courses
                    : [recipe.category || "Main"]

                  return (
                    <div
                      key={recipe.id}
                      className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col h-[450px]"
                    >
                      {/* Image flush to top */}
                      <div className="h-[260px] w-full flex-shrink-0 bg-muted">
                        <img
                          src={recipe.image || "/placeholder.svg"}
                          alt={recipe.title}
                          className="object-cover w-full h-full transition-all hover:scale-105"
                        />
                      </div>

                      {/* Text area */}
                      <div className="flex flex-col flex-grow px-4 pt-3 pb-4">
                        <p className="font-semibold text-base leading-snug">{recipe.title}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-snug">
                          {recipe.description}
                        </p>

                        <div className="flex-grow" />

                        <div className="flex items-center justify-between text-xs text-black mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {totalTime || "N/A"}
                          </span>
                          <span className="text-right">{categoryList.join(", ")}</span>
                        </div>

                        <Button asChild variant="outline" className="w-full border border-gray-300">
                          <Link href={`/recipes/${recipe.slug}`}>View Recipe</Link>
                        </Button>
                      </div>
                    </div>
                  )
                })
              ) : (
                // Fallback cards if no featured recipes are found
                <>
                  {[
                    { title: "Creamy Mushroom Risotto", slug: "creamy-mushroom-risotto", img: "/placeholder-yl2r5.png", time: "45 mins", cat: "Main" },
                    { title: "Spicy Buffalo Cauliflower Wings", slug: "buffalo-cauliflower-wings", img: "/placeholder-0r6mv.png", time: "1h 15m", cat: "Appetizer" },
                    { title: "Chocolate Avocado Mousse", slug: "chocolate-avocado-mousse", img: "/placeholder-dp4k9.png", time: "20 mins", cat: "Dessert" },
                  ].map(({ title, slug, img, time, cat }) => (
                    <div
                      key={slug}
                      className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col h-[450px]"
                    >
                      <div className="h-[260px] w-full flex-shrink-0 bg-muted">
                        <img src={img} alt={title} className="object-cover w-full h-full transition-all hover:scale-105" />
                      </div>
                      <div className="flex flex-col flex-grow px-4 pt-3 pb-4">
                        <p className="font-semibold text-base leading-snug">{title}</p>
                        <div className="flex-grow" />
                        <div className="flex items-center justify-between text-xs text-black mb-3">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{time}</span>
                          <span>{cat}</span>
                        </div>
                        <Button asChild variant="outline" className="w-full border border-gray-300">
                          <Link href={`/recipes/${slug}`}>View Recipe</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
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

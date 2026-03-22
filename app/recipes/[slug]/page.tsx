"use client"

import type React from "react"
import { use } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Clock,
  Utensils,
  Users,
  ChevronLeft,
  ChevronRight,
  Globe,
  Star,
  AlertCircle,
  LinkIcon,
  Send,
} from "lucide-react"
import { fetchRecipeBySlug, fetchAllRecipes } from "@/app/actions/recipe-actions"
import { useAuth } from "@/context/auth-context"
import { calculateTotalTime } from "@/lib/time-utils"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ServingsAdjuster } from "@/components/recipe/servings-adjuster"
import { PrintRecipe } from "@/components/recipe/print-recipe"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { LikeButton } from "@/components/recipe/like-button"
import { addReview, getRecipeReviews, setupSyncListeners, type RecipeReview } from "@/lib/recipe-storage"
import { Badge } from "@/components/ui/badge"

// Helper function to extract minutes from time string
// function extractMinutes(timeString: string): number {
//   if (!timeString) return 0
//   const match = timeString.match(/(\d+)/)
//   return match ? Number.parseInt(match[1], 10) : 0
// }

// Helper function to calculate total time
// function calculateTotalTime(prepTime: string, cookTime: string): string {
//   const prepMinutes = extractMinutes(prepTime)
//   const cookMinutes = extractMinutes(cookTime)
//   const totalMinutes = prepMinutes + cookMinutes

//   if (totalMinutes > 0) {
//     return `${totalMinutes} min`
//   } else if (cookTime) {
//     return cookTime
//   } else if (prepTime) {
//     return prepTime
//   } else {
//     return "Time N/A"
//   }
// }

export default function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [recipe, setRecipe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [recommendedRecipes, setRecommendedRecipes] = useState<any[]>([])
  const [reviews, setReviews] = useState<RecipeReview[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalTime, setTotalTime] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewName, setReviewName] = useState("")
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")

  const [adjustedServings, setAdjustedServings] = useState<number | null>(null)
  const [adjustedIngredients, setAdjustedIngredients] = useState<string[][]>([])

  // Function to adjust ingredient quantities based on servings
  const adjustIngredientQuantities = (originalServings: number, newServings: number) => {
    if (!recipe.ingredientSections || recipe.ingredientSections.length === 0) return []

    return recipe.ingredientSections.map((section) => {
      return section.items.map((item) => {
        // Regular expression to match numbers (including decimals and fractions)
        const regex = /(\d+\/\d+|\d+\.\d+|\d+)/g

        return item.replace(regex, (match) => {
          // Handle fractions like 1/2
          if (match.includes("/")) {
            const [numerator, denominator] = match.split("/")
            const decimal = Number.parseInt(numerator) / Number.parseInt(denominator)
            const adjustedDecimal = decimal * (newServings / originalServings)

            // Convert back to a simplified fraction or decimal if it's too complex
            if (adjustedDecimal % 1 === 0) {
              return Math.round(adjustedDecimal).toString()
            } else if (Math.abs(adjustedDecimal - 0.25) < 0.01) {
              return "1/4"
            } else if (Math.abs(adjustedDecimal - 0.5) < 0.01) {
              return "1/2"
            } else if (Math.abs(adjustedDecimal - 0.75) < 0.01) {
              return "3/4"
            } else if (Math.abs(adjustedDecimal - 0.33) < 0.01) {
              return "1/3"
            } else if (Math.abs(adjustedDecimal - 0.67) < 0.01) {
              return "2/3"
            } else {
              return adjustedDecimal.toFixed(2)
            }
          }

          // Handle decimal numbers
          const number = Number.parseFloat(match)
          const adjusted = ((number * newServings) / originalServings).toFixed(2)
          // Remove trailing zeros and decimal point if it's a whole number
          return adjusted.replace(/\.00$/, "").replace(/\.(\d)0$/, ".$1")
        })
      })
    })
  }

  // Share recipe function
  const shareRecipe = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: recipe.description || `Check out this ${recipe.title} recipe on Vegan Side Project!`,
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied!",
        description: "Recipe link copied to clipboard.",
      })
    }
  }

  // Load reviews and set up sync
  useEffect(() => {
    if (!recipe) return

    // Load reviews from localStorage
    const loadedReviews = getRecipeReviews(resolvedParams.slug)
    setReviews(loadedReviews)

    // Calculate average rating
    if (loadedReviews.length > 0) {
      const totalRating = loadedReviews.reduce((sum, review) => sum + review.rating, 0)
      setAverageRating(totalRating / loadedReviews.length)
    }

    // Set up sync listeners
    const cleanup = setupSyncListeners((syncedReviews) => {
      // Filter reviews for this recipe
      const recipeReviews = syncedReviews.filter((r) => r.recipeId === resolvedParams.slug)
      setReviews(recipeReviews)

      // Update average rating
      if (recipeReviews.length > 0) {
        const totalRating = recipeReviews.reduce((sum, review) => sum + review.rating, 0)
        setAverageRating(totalRating / recipeReviews.length)
      }
    })

    return cleanup
  }, [recipe, resolvedParams.slug])

  // Handle review submission
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingReview(true)

    try {
      // Add review to localStorage
      const newReview = addReview({
        recipeId: resolvedParams.slug,
        author: {
          name: reviewName,
          initials: reviewName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase(),
        },
        rating: reviewRating,
        comment: reviewComment,
      })

      // Update local state
      setReviews([newReview, ...reviews])

      // Recalculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0) + reviewRating
      setAverageRating(totalRating / (reviews.length + 1))

      // Reset form
      setReviewName("")
      setReviewRating(5)
      setReviewComment("")

      // Show success message
      toast({
        title: "Review submitted!",
        description: "Thank you for sharing your experience with this recipe.",
      })
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Error submitting review",
        description: "There was a problem submitting your review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  // Update adjusted ingredients when servings change
  useEffect(() => {
    if (adjustedServings && recipe && recipe.serves) {
      const originalServings = Number.parseInt(recipe.serves) || 2
      setAdjustedIngredients(adjustIngredientQuantities(originalServings, adjustedServings))
    }
  }, [adjustedServings, recipe])

  useEffect(() => {
    async function loadRecipe() {
      try {
        setLoading(true)
        const recipeData = await fetchRecipeBySlug(resolvedParams.slug)

        if (!recipeData) {
          setError("Recipe not found")
          router.push("/recipes")
          return
        }

        setRecipe(recipeData)

        // Calculate total time
        setTotalTime(calculateTotalTime(recipeData.prepTime, recipeData.cookTime))

        // Load recommended recipes
        try {
          const allRecipes = await fetchAllRecipes()
          if (allRecipes && Array.isArray(allRecipes) && allRecipes.length > 0) {
            const otherRecipes = allRecipes.filter((r) => r.slug !== resolvedParams.slug)
            const recommended = otherRecipes.sort(() => 0.5 - Math.random()).slice(0, 3)
            setRecommendedRecipes(recommended)
          }
        } catch (recError) {
          console.error("Error loading recommended recipes:", recError)
          // Continue with empty recommendations
        }
      } catch (err) {
        setError("Failed to load recipe")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadRecipe()
  }, [resolvedParams.slug, router])

  // Image slideshow navigation
  const nextImage = () => {
    if (!recipe || !recipe.images || recipe.images.length <= 1) return
    setCurrentImageIndex((prev) => (prev + 1) % recipe.images.length)
  }

  const prevImage = () => {
    if (!recipe || !recipe.images || recipe.images.length <= 1) return
    setCurrentImageIndex((prev) => (prev === 0 ? recipe.images.length - 1 : prev - 1))
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6a994e]"></div>
        </div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Error</h2>
          <p className="text-muted-foreground">{error || "Failed to load recipe"}</p>
          <Button asChild className="mt-4">
            <Link href="/recipes">Back to Recipes</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Ensure courses is always an array
  const courses = recipe.courses || [recipe.category]

  return (
    <div className="container py-10">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/recipes">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Recipes
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{recipe.title}</h1>
              <p className="text-muted-foreground mt-2">{recipe.description}</p>
            </div>

            {/* Image Slideshow */}
            <div className="aspect-video overflow-hidden rounded-lg relative">
              <img
                src={
                  recipe.images && recipe.images.length > 0
                    ? recipe.images[currentImageIndex]
                    : "/placeholder.svg?height=500&width=1000"
                }
                alt={recipe.title}
                className="object-cover w-full h-full"
              />

              {recipe.images && recipe.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>

                  {/* Image indicators */}
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                    {recipe.images.map((_, index) => (
                      <button
                        key={index}
                        className={`h-2 w-2 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              {totalTime && (
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-[#6a994e]" />
                  <span>Total: {totalTime}</span>
                </div>
              )}
              {recipe.prepTime && (
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-[#6a994e]" />
                  <span>Prep: {recipe.prepTime}</span>
                </div>
              )}
              {recipe.cookTime && (
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-[#6a994e]" />
                  <span>Cook: {recipe.cookTime}</span>
                </div>
              )}
              {recipe.serves && (
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-[#6a994e]" />
                  <span>Serves: {recipe.serves}</span>
                </div>
              )}
              <div className="flex items-center">
                <Utensils className="mr-2 h-4 w-4 text-[#6a994e]" />
                <div className="flex flex-wrap gap-1">
                  {courses.map((course, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {course}
                    </Badge>
                  ))}
                </div>
              </div>
              {recipe.cuisine && (
                <div className="flex items-center">
                  <Globe className="mr-2 h-4 w-4 text-[#6a994e]" />
                  <span>Cuisine: {recipe.cuisine}</span>
                </div>
              )}
              <div className="flex items-center">
                <Star className="mr-2 h-4 w-4 text-[#e9b949]" />
                <span>
                  {reviews.length > 0
                    ? `${averageRating.toFixed(1)} (${reviews.length} ${reviews.length === 1 ? "review" : "reviews"})`
                    : "Be the first to review"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center mt-4 border-t border-b py-4">
              {recipe.serves && (
                <ServingsAdjuster
                  initialServings={Number.parseInt(recipe.serves) || 2}
                  onServingsChange={setAdjustedServings}
                />
              )}
              <div className="flex gap-2">
                <LikeButton recipeId={resolvedParams.slug} />
                <PrintRecipe
                  recipe={recipe}
                  adjustedServings={adjustedServings}
                  adjustedIngredients={adjustedIngredients}
                />
              </div>
            </div>

            <Tabs defaultValue="instructions">
              <TabsList>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
                {recipe.tips && recipe.tips.length > 0 && <TabsTrigger value="tips">Tips & Notes</TabsTrigger>}
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="instructions" className="mt-6">
                <div className="space-y-8">
                  {recipe.ingredientSections && recipe.ingredientSections.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Ingredients</h3>

                      {recipe.ingredientSections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="mb-4">
                          {section.subtitle && (
                            <h4 className="font-medium text-[#6a994e] mt-4 mb-2">{section.subtitle}</h4>
                          )}
                          <ul className="list-disc pl-5 space-y-2">
                            {(adjustedServings && adjustedIngredients[sectionIndex]
                              ? adjustedIngredients[sectionIndex]
                              : section.items
                            ).map((ingredient, index) => (
                              <li key={index}>{ingredient}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-medium mb-4">Instructions</h3>
                    {recipe.instructions && recipe.instructions.length > 0 ? (
                      <div className="space-y-4">
                        {recipe.instructions.map((instruction, index) => {
                          if (instruction.type === "subtitle") {
                            return (
                              <h4 key={index} className="font-medium text-[#6a994e] mt-6 mb-2">
                                {instruction.content}
                              </h4>
                            )
                          } else {
                            return (
                              <div key={index} className="flex">
                                <span className="font-medium mr-3">
                                  {index +
                                    1 -
                                    recipe.instructions.filter((item, i) => i < index && item.type === "subtitle")
                                      .length}
                                  .
                                </span>
                                <p>{instruction.content}</p>
                              </div>
                            )
                          }
                        })}
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No instructions available</AlertTitle>
                        <AlertDescription>
                          This recipe doesn't have any instructions yet. Please check back later.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </TabsContent>
              {recipe.tips && recipe.tips.length > 0 && (
                <TabsContent value="tips" className="mt-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Tips & Notes</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {recipe.tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
              )}
              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Reviews {reviews.length > 0 ? `(${reviews.length})` : ""}</h3>

                    {reviews.length > 0 ? (
                      <>
                        {reviews.map((review) => (
                          <div key={review.id} className="border rounded-lg p-4">
                            <div className="flex items-start gap-4">
                              <div className="rounded-full bg-muted h-10 w-10 flex items-center justify-center">
                                <span className="text-sm font-medium">{review.author.initials}</span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <span className="font-medium">{review.author.name}</span>
                                  <span className="text-muted-foreground text-sm ml-2">{review.date}</span>
                                </div>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${star <= review.rating ? "text-[#e9b949]" : "text-muted"}`}
                                      fill={star <= review.rating ? "#e9b949" : "none"}
                                    />
                                  ))}
                                </div>
                                <p className="text-sm">{review.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-8 border rounded-lg">
                        <Star className="h-8 w-8 text-[#e9b949] mx-auto mb-2" />
                        <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Leave a Review</h3>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input id="name" value={reviewName} onChange={(e) => setReviewName(e.target.value)} required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rating">Rating</Label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-6 w-6 ${star <= reviewRating ? "text-[#e9b949]" : "text-muted"}`}
                                fill={star <= reviewRating ? "#e9b949" : "none"}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="comment">Your Review</Label>
                        <Textarea
                          id="comment"
                          rows={4}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your experience with this recipe..."
                          required
                        />
                      </div>

                      <Button type="submit" disabled={isSubmittingReview}>
                        {isSubmittingReview ? (
                          <>
                            Submitting... <Send className="ml-2 h-4 w-4 animate-pulse" />
                          </>
                        ) : (
                          <>
                            Submit Review <Send className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-medium">Share This Recipe</h3>
            <p className="text-sm text-muted-foreground">Share this delicious recipe with friends and family.</p>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </Button>
              <Button variant="outline" size="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
                  <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                </svg>
              </Button>
              <Button variant="outline" size="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </Button>
              <Button variant="outline" size="icon" onClick={shareRecipe}>
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {recommendedRecipes.length > 0 && (
            <div className="border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-medium">Try Something New</h3>
              <div className="space-y-4">
                {recommendedRecipes.map((recipe, index) => (
                  <Link href={`/recipes/${recipe.slug}`} className="flex items-center gap-3 group" key={index}>
                    <div className="w-16 h-16 rounded overflow-hidden">
                      <img
                        src={recipe.image || "/placeholder.svg?height=100&width=100"}
                        alt={recipe.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium group-hover:text-[#6a994e] transition-colors">{recipe.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {recipe.courses && recipe.courses.length > 0 ? recipe.courses[0] : recipe.category} •{" "}
                        {calculateTotalTime(recipe.prepTime, recipe.cookTime)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

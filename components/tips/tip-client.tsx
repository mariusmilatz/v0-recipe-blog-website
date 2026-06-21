"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, Share2, Bookmark, ArrowLeft, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/context/auth-context"
import { SignInDialog } from "@/components/auth/sign-in-dialog"
import { toast } from "@/hooks/use-toast"
import CommentSection from "@/components/CommentSection"

interface TipClientProps {
  tip: {
    id: string
    title: string
    description: string
    slug: string
    publishDate: string
    author: string
    authorJob: string
    authorDescription: string
    authorProfilePhoto?: string
    titleImage?: string
    tags: string[]
    content: {
      paragraphs: string[]
      images: string[]
    }
  }
}

export function TipClient({ tip }: TipClientProps) {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  const handleLike = () => {
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
    setIsLiked(!isLiked)
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: `${tip.title} | Vegan Side Project`, text: tip.description, url })
      } else {
        await navigator.clipboard.writeText(url)
        toast({ title: "Link copied to clipboard", description: "You can now share this tip with others!" })
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast({ title: "Couldn't share", description: "There was an error sharing this tip.", variant: "destructive" })
      }
    }
  }

  const formattedDate = new Date(tip.publishDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formatText = (text: string): string => {
    if (!text) return ""
    let formatted = text.replace(
      /\*\*([^*]+)\*\*/g,
      '<h3 class="text-xl font-semibold text-green-700 mt-6 mb-3">$1</h3>',
    )
    formatted = formatted.replace(/\*([^*]+)\*/g, "<em>$1</em>")
    formatted = formatted.replace(
      /\[([^\]]+)\]$$([^)]+)$$/g,
      '<a href="$2" class="text-green-600 hover:underline">$1</a>',
    )
    return formatted
  }

  return (
    <div className="container py-10">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/tips">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tips & Tricks
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <article className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{tip.title}</h1>
              <p className="text-xl text-muted-foreground">{tip.description}</p>

              <div className="flex items-center space-x-4">
                <div className="rounded-full overflow-hidden h-10 w-10">
                  <img
                    src={tip.authorProfilePhoto || "/placeholder.svg?height=100&width=100"}
                    alt={tip.author}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium">{tip.author}</div>
                  <div className="text-sm text-muted-foreground">{tip.authorJob}</div>
                </div>
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
            </div>

            {tip.titleImage && (
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={tip.titleImage || "/placeholder.svg?height=500&width=1000"}
                  alt={tip.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {tip.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <div className="prose prose-green max-w-none">
              {tip.content.paragraphs.map((paragraph, index) => {
                const hasImage = index < tip.content.images.length && tip.content.images[index]
                return (
                  <div key={index}>
                    <div dangerouslySetInnerHTML={{ __html: formatText(paragraph) }} />
                    {hasImage && (
                      <div className="aspect-video rounded-lg overflow-hidden my-6">
                        <img
                          src={tip.content.images[index] || "/placeholder.svg?height=400&width=800"}
                          alt={`Image for ${tip.title}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                {user ? (
                  <Button variant="outline" size="sm">
                    <Bookmark className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" disabled className="opacity-50">
                          <Bookmark className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Sign in to save this article</p>
                        <div className="mt-2 flex justify-center">
                          <SignInDialog />
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent" onClick={handleLike}>
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-[#6a994e] text-[#6a994e]" : ""}`} />
                </Button>
                {likeCount > 0 && <span>{likeCount}</span>}
              </div>
            </div>

            <Separator />

            {/* Real Supabase comment section */}
            <CommentSection
              notionRecipeId={tip.id}
              recipeSlug={tip.slug}
              recipeTitle={tip.title}
            />
          </article>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About the Author</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full overflow-hidden h-24 w-24 mb-4">
                  <img
                    src={tip.authorProfilePhoto || "/placeholder.svg?height=100&width=100"}
                    alt={tip.author}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="font-medium text-lg">{tip.author}</h3>
                <p className="text-sm text-muted-foreground">{tip.authorJob}</p>
                <p className="text-sm mt-2">{tip.authorDescription}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link
                  href="/tips/dairy-substitutes"
                  className="block p-3 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <h4 className="font-medium">Dairy Substitutes</h4>
                  <p className="text-sm text-muted-foreground">
                    Creamy without the cream: plant-based alternatives to dairy products.
                  </p>
                </Link>
                <Link
                  href="/tips/umami-boosters"
                  className="block p-3 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <h4 className="font-medium">Umami Boosters</h4>
                  <p className="text-sm text-muted-foreground">Adding depth and savory flavors to vegan dishes.</p>
                </Link>
                <Link
                  href="/tips/egg-replacements"
                  className="block p-3 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <h4 className="font-medium">Egg Replacements</h4>
                  <p className="text-sm text-muted-foreground">Perfect substitutes for eggs in baking and cooking.</p>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Recipes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link href="/recipes/creamy-mushroom-risotto" className="flex items-center gap-3 group">
                  <div className="w-16 h-16 rounded overflow-hidden">
                    <img
                      src="/placeholder.svg?height=100&width=100"
                      alt="Creamy Mushroom Risotto"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium group-hover:text-[#6a994e] transition-colors">
                      Creamy Mushroom Risotto
                    </h4>
                    <p className="text-xs text-muted-foreground">The recipe that started it all</p>
                  </div>
                </Link>
                <Link href="/recipes/buffalo-cauliflower-wings" className="flex items-center gap-3 group">
                  <div className="w-16 h-16 rounded overflow-hidden">
                    <img
                      src="/placeholder.svg?height=100&width=100"
                      alt="Buffalo Cauliflower Wings"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium group-hover:text-[#6a994e] transition-colors">
                      Buffalo Cauliflower Wings
                    </h4>
                    <p className="text-xs text-muted-foreground">Perfect for game day</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

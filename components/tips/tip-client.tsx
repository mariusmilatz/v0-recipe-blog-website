"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, MessageSquare, Share2, Bookmark, ArrowLeft, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/context/auth-context"
import { SignInDialog } from "@/components/auth/sign-in-dialog"
import { toast } from "@/hooks/use-toast"

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
  const [commentCount, setCommentCount] = useState(0)

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1)
    } else {
      setLikeCount(likeCount + 1)
    }
    setIsLiked(!isLiked)
  }

  const handleShare = async () => {
    const url = window.location.href
    const title = `${tip.title} | Vegan Side Project`
    const text = tip.description

    try {
      if (navigator.share) {
        // Use Web Share API if available
        await navigator.share({
          title,
          text,
          url,
        })
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url)
        toast({
          title: "Link copied to clipboard",
          description: "You can now share this tip with others!",
        })
      }
    } catch (error) {
      // Only show error if it's not an AbortError (user canceling)
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error sharing:", error)
        toast({
          title: "Couldn't share",
          description: "There was an error sharing this tip.",
          variant: "destructive",
        })
      }
    }
  }

  // Format date
  const formattedDate = new Date(tip.publishDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Get author initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Format text with basic markdown
  const formatText = (text: string): string => {
    if (!text) return ""

    // Convert bold text (surrounded by **) to HTML
    let formattedText = text.replace(
      /\*\*([^*]+)\*\*/g,
      '<h3 class="text-xl font-semibold text-green-700 mt-6 mb-3">$1</h3>',
    )

    // Convert italic text (surrounded by *) to HTML
    formattedText = formattedText.replace(/\*([^*]+)\*/g, "<em>$1</em>")

    // Convert links [text](url) to HTML
    formattedText = formattedText.replace(
      /\[([^\]]+)\]$$([^)]+)$$/g,
      '<a href="$2" class="text-green-600 hover:underline">$1</a>',
    )

    return formattedText
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
                // If there's a corresponding image, show paragraph then image
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
                <MessageSquare className="h-4 w-4 ml-2" />
                {commentCount > 0 && <span>{commentCount}</span>}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Comments {commentCount > 0 && `(${commentCount})`}</h3>

              {user ? (
                <div className="space-y-4">
                  <textarea
                    className="w-full min-h-[100px] p-3 border rounded-md"
                    placeholder="Share your thoughts or ask a question..."
                  />
                  <Button>Post Comment</Button>
                </div>
              ) : (
                <div className="text-center p-4 border rounded-md">
                  <p className="text-muted-foreground mb-4">Sign in to join the conversation</p>
                  <SignInDialog />
                </div>
              )}

              {commentCount > 0 ? (
                <div className="space-y-4 mt-6">
                  <div className="border rounded-md p-4">
                    <div className="flex items-start space-x-4">
                      <div className="rounded-full bg-muted h-10 w-10 flex items-center justify-center">
                        <span className="text-sm font-medium">JD</span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">Jane Doe</div>
                          <div className="text-xs text-muted-foreground">2 days ago</div>
                        </div>
                        <p className="text-sm">
                          Thank you for this comprehensive guide! I've been struggling to find protein sources my
                          non-vegan husband enjoys. The tip about freezing tofu was a game-changer for us.
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <button className="hover:text-foreground">Reply</button>
                          <button className="hover:text-foreground">Like</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex items-start space-x-4">
                      <div className="rounded-full bg-muted h-10 w-10 flex items-center justify-center">
                        <span className="text-sm font-medium">MS</span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">Mike Smith</div>
                          <div className="text-xs text-muted-foreground">1 week ago</div>
                        </div>
                        <p className="text-sm">
                          I'd add pea protein to this list! It's become my go-to for smoothies and baking. Great article
                          otherwise, very helpful for someone like me who's new to cooking vegan meals.
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <button className="hover:text-foreground">Reply</button>
                          <button className="hover:text-foreground">Like</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 border rounded-md text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
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
              <CardDescription>You might also find these helpful</CardDescription>
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
              <CardDescription>Reader favorites you might enjoy</CardDescription>
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

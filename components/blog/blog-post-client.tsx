"use client"

import Link from "next/link"
import { ArrowLeft, Calendar, Share2, Bookmark, Heart, MessageSquare, Tag } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SignInDialog } from "@/components/auth/sign-in-dialog"
import { toast } from "@/hooks/use-toast"
import CommentSection from "@/components/CommentSection"

interface BlogPostClientProps {
  post: {
    id: string
    title: string
    slug: string
    shortDescription: string
    author: string
    authorTitle: string
    authorDescription: string
    authorProfilePhoto: string | null
    publishDate: string
    tags: string[]
    titleImage: string
    content: Array<{
      type: string
      text?: string
      url?: string
      caption?: string
    }>
  }
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const { user } = useAuth()
  const [likeCount, setLikeCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1)
      setIsLiked(false)
    } else {
      setLikeCount(likeCount + 1)
      setIsLiked(true)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    const title = `${post.title} | Vegan Side Project`
    const text = post.shortDescription

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url })
      } else {
        await navigator.clipboard.writeText(url)
        toast({
          title: "Link copied to clipboard",
          description: "You can now share this blog post with others!",
        })
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error sharing:", error)
        toast({
          title: "Couldn't share",
          description: "There was an error sharing this blog post.",
          variant: "destructive",
        })
      }
    }
  }

  const authorPhotoUrl =
    post.authorProfilePhoto || `/placeholder-100x100.png?height=100&width=100&text=${post.author.charAt(0)}`

  const relatedPosts = [
    {
      title: "5 Things I Wish I Knew Before Cooking Vegan",
      slug: "things-i-wish-i-knew",
      description: "Avoid these common mistakes when starting out.",
    },
    {
      title: "Cooking Together: Strengthening Relationships Through Food",
      slug: "cooking-together",
      description: "How cooking vegan brought us closer.",
    },
    {
      title: "The Unexpected Benefits of Eating More Plant-Based Meals",
      slug: "unexpected-benefits",
      description: "It's not just about accommodating my partner.",
    },
  ]

  return (
    <div className="container py-10">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/blog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <article className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
              <p className="text-xl text-muted-foreground">{post.shortDescription}</p>

              <div className="flex items-center space-x-4">
                <div className="rounded-full overflow-hidden h-10 w-10">
                  <img
                    src={authorPhotoUrl || "/placeholder.svg"}
                    alt={post.author}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium">{post.author}</div>
                  <div className="text-sm text-muted-foreground">{post.authorTitle}</div>
                </div>
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                <span>{post.publishDate}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f8f5f2] text-[#6a994e]"
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            <div className="aspect-video rounded-lg overflow-hidden">
              <img
                src={post.titleImage || "/placeholder.svg?height=500&width=1000"}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="prose prose-green max-w-none">
              {post.content.map((section, index) => {
                if (section.type === "paragraph" && section.text) {
                  return <div key={index} dangerouslySetInnerHTML={{ __html: formatText(section.text) }} />
                } else if (section.type === "image" && section.url) {
                  return (
                    <figure key={index} className="my-8">
                      <img
                        src={section.url || "/placeholder.svg?height=400&width=800"}
                        alt={section.caption || `Image ${index + 1}`}
                        className="rounded-lg w-full"
                      />
                      {section.caption && (
                        <figcaption className="text-center text-sm text-muted-foreground mt-2">
                          {section.caption}
                        </figcaption>
                      )}
                    </figure>
                  )
                }
                return null
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

            <CommentSection
              notionRecipeId={post.id}
              recipeSlug={post.slug}
              recipeTitle={post.title}
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
                    src={authorPhotoUrl || "/placeholder.svg"}
                    alt={post.author}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="font-medium text-lg">{post.author}</h3>
                <p className="text-sm text-muted-foreground">{post.authorTitle}</p>
                <p className="text-sm mt-2">{post.authorDescription}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Posts</CardTitle>
              <CardDescription>Continue reading about vegan cooking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {relatedPosts.map((relatedPost, index) => (
                  <Link
                    key={index}
                    href={`/blog/${relatedPost.slug}`}
                    className="block p-3 border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <h4 className="font-medium">{relatedPost.title}</h4>
                    <p className="text-sm text-muted-foreground">{relatedPost.description}</p>
                  </Link>
                ))}
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

function formatText(text: string): string {
  const paragraphs = text.split("\n").filter((p) => p.trim() !== "")
  const processedParagraphs = paragraphs.map((paragraph) => {
    const subtitleMatch = paragraph.match(/^\s*\*\*(.*?)\*\*\s*$/)
    if (subtitleMatch) {
      return `<h3 class="text-xl font-semibold mt-6 mb-3 text-[#6a994e]">${subtitleMatch[1]}</h3>`
    }
    let processedParagraph = paragraph
    processedParagraph = processedParagraph.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    processedParagraph = processedParagraph.replace(/\*(.*?)\*/g, "<em>$1</em>")
    processedParagraph = processedParagraph.replace(
      /\[([^\]]+)\]$$([^)]+)$$/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#6a994e] hover:underline">$1</a>',
    )
    return `<p class="mb-4">${processedParagraph}</p>`
  })
  return processedParagraphs.join("\n")
}

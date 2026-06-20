import Link from "next/link"
import { Calendar, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { fetchBlogPostsFromNotion } from "@/lib/notion-blog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const dynamic = "force-dynamic"

export default async function BlogPage() {
  const blogPosts = await fetchBlogPostsFromNotion()

  const sampleBlogPosts =
    blogPosts.length > 0
      ? []
      : [
          {
            id: "sample-1",
            title: "My Journey to Vegan Cooking",
            shortDescription: "How I went from reluctant cook to enthusiastic vegan chef",
            slug: "my-journey-to-vegan-cooking",
            publishDate: "May 8, 2023",
            author: "Alex Johnson",
            titleImage: "/placeholder.svg?key=d59x0",
          },
          {
            id: "sample-2",
            title: "5 Things I Wish I Knew Before Cooking Vegan",
            shortDescription: "Avoid these common mistakes when starting out",
            slug: "things-i-wish-i-knew",
            publishDate: "April 15, 2023",
            author: "Alex Johnson",
            titleImage: "/vibrant-vegan-meal.png",
          },
        ]

  const allPosts = [...blogPosts, ...sampleBlogPosts]

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Blog</h1>
        <p className="mt-4 text-muted-foreground">
          Stories, reflections, and experiences from a non-vegan cooking for a vegan partner.
        </p>
      </div>

      {blogPosts.length === 0 && (
        <div className="max-w-3xl mx-auto mb-8">
          <Alert>
            <AlertTitle>No published blog posts found in Notion</AlertTitle>
            <AlertDescription>
              There are no published blog posts in your Notion database yet. Make sure you have blog posts in your
              Notion database and that they are marked as Published.
              <div className="mt-4">
                <Link href="/api/notion-blog-debug" className="text-primary hover:underline">
                  Check the blog database debug page
                </Link>
              </div>
            </AlertDescription>
          </Alert>

          {sampleBlogPosts.length > 0 && (
            <div className="mt-4 text-center">
              <p className="text-muted-foreground">Showing sample blog posts for demonstration purposes.</p>
            </div>
          )}
        </div>
      )}

      {allPosts.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {allPosts.map((post, index) => (
            <div
              key={post.id}
              className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col"
            >
              {/* Image flush to top */}
              <div className="h-[240px] w-full flex-shrink-0 bg-muted">
                <img
                  src={post.titleImage || "/placeholder.svg?height=300&width=600"}
                  alt={post.title}
                  fetchPriority={index < 2 ? "high" : "auto"}
                  className="object-cover w-full h-full transition-all hover:scale-105"
                />
              </div>

              {/* Text area */}
              <div className="flex flex-col flex-grow px-4 pt-3 pb-4">
                <p className="font-semibold text-base leading-snug">{post.title}</p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-snug">
                  {post.shortDescription}
                </p>

                <div className="mt-4 flex items-center justify-between text-xs text-black mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.publishDate || "No date"}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {post.author}
                  </span>
                </div>

                <Button asChild variant="outline" className="w-full border border-gray-300">
                  <Link href={`/blog/${post.slug}`}>Read More</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

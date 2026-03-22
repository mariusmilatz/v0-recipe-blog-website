import Link from "next/link"
import { Calendar, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchBlogPostsFromNotion } from "@/lib/notion-blog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const revalidate = 3600 // Revalidate every hour

export default async function BlogPage() {
  const blogPosts = await fetchBlogPostsFromNotion()

  // Sample blog posts for testing - will only show if no posts from Notion
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

      {allPosts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2">
          {allPosts.map((post) => (
            <Card key={post.id} className="flex flex-col">
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={post.titleImage || "/placeholder.svg?height=300&width=600"}
                  alt={post.title}
                  className="object-cover w-full h-full transition-all hover:scale-105"
                />
              </div>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>{post.shortDescription}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center mr-4">
                    <Calendar className="mr-1 h-4 w-4" />
                    <span>{post.publishDate || "No date"}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="mr-1 h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/blog/${post.slug}`}>Read More</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  )
}

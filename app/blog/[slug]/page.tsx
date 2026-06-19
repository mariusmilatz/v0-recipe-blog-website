import { notFound } from "next/navigation"
import { fetchBlogPostBySlugFromNotion } from "@/lib/notion-blog"
import BlogPostClient from "@/components/blog/blog-post-client"

export const dynamic = "force-dynamic"

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await fetchBlogPostBySlugFromNotion(slug)

  if (!post) {
    notFound()
  }

  return <BlogPostClient post={post} />
}

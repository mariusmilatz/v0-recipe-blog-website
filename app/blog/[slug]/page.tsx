import { notFound } from "next/navigation"
import { fetchBlogPostBySlugFromNotion } from "@/lib/notion-blog"
import BlogPostClient from "@/components/blog/blog-post-client"

export const revalidate = 3600 // Revalidate every hour

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await fetchBlogPostBySlugFromNotion(params.slug)

  if (!post) {
    notFound()
  }

  return <BlogPostClient post={post} />
}

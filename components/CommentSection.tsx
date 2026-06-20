"use client"

// components/CommentSection.tsx
// Drop this into any recipe's [slug] page.

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Trash2 } from "lucide-react"

type Props = {
  notionRecipeId: string
  recipeSlug: string
  recipeTitle: string
}

type Comment = {
  id: string
  user_id: string
  body: string
  created_at: string
  profiles: { name: string } | null
}

export default function CommentSection({ notionRecipeId, recipeSlug, recipeTitle }: Props) {
  const { user } = useAuth()
  const supabase = createClient()
  const [comments, setComments] = useState<Comment[]>([])
  const [body, setBody] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadComments()
  }, [notionRecipeId])

  async function loadComments() {
    const { data } = await supabase
      .from("comments")
      .select("id, user_id, body, created_at, profiles(name)")
      .eq("notion_recipe_id", notionRecipeId)
      .order("created_at", { ascending: true })
    setComments((data as Comment[]) || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !body.trim()) return
    setSubmitting(true)
    await supabase.from("comments").insert({
      user_id: user.id,
      notion_recipe_id: notionRecipeId,
      recipe_slug: recipeSlug,
      recipe_title: recipeTitle,
      body: body.trim(),
    })
    setBody("")
    await loadComments()
    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    await supabase.from("comments").delete().eq("id", id)
    setComments(prev => prev.filter(c => c.id !== id))
  }

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="text-xl font-bold mb-6">Comments ({comments.length})</h2>

      {/* Comment list */}
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground mb-6">No comments yet — be the first!</p>
      ) : (
        <div className="space-y-4 mb-8">
          {comments.map(c => (
            <div key={c.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{c.profiles?.name || "User"}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p className="text-sm">{c.body}</p>
                </div>
                {user?.id === c.user_id && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-muted-foreground hover:text-red-500 transition-colors shrink-0 mt-0.5"
                    title="Delete comment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Share your thoughts on this recipe…"
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={3}
            required
          />
          <Button
            type="submit"
            className="bg-[#6a994e] hover:bg-[#5a8540]"
            disabled={submitting || !body.trim()}
          >
            {submitting ? "Posting…" : "Post comment"}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="text-[#6a994e] hover:underline font-medium">Sign in</Link> to leave a comment.
        </p>
      )}
    </section>
  )
}

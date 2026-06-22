"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Trash2 } from "lucide-react"

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function authHeaders(token: string) {
  return {
    apikey: SUPA_KEY,
    Authorization: "Bearer " + token,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  }
}
function anonHeaders() {
  return { apikey: SUPA_KEY, "Content-Type": "application/json" }
}
function getToken(sessionToken: string | undefined): string | null {
  if (sessionToken) return sessionToken
  if (typeof window !== "undefined") return localStorage.getItem("_sb_access_token")
  return null
}

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
  const { user, session } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [body, setBody] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadComments()
  }, [notionRecipeId])

  async function loadComments() {
    const url =
      SUPA_URL +
      "/rest/v1/comments?select=id,user_id,body,created_at,profiles(name)&notion_recipe_id=eq." +
      encodeURIComponent(notionRecipeId) +
      "&order=created_at.asc"
    const res = await fetch(url, { headers: anonHeaders() })
    if (res.ok) setComments(await res.json())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const token = getToken(session?.access_token)
    if (!user || !token) { setError("Please log in first"); return }
    if (!body.trim()) return
    setSubmitting(true)
    const res = await fetch(SUPA_URL + "/rest/v1/comments", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        user_id: user.id,
        notion_recipe_id: notionRecipeId,
        recipe_slug: recipeSlug,
        recipe_title: recipeTitle,
        body: body.trim(),
      }),
    })
    if (res.ok) {
      setBody("")
      await loadComments()
    } else {
      const text = await res.text()
      setError("Failed to post (" + res.status + "): " + text)
    }
    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    const token = getToken(session?.access_token)
    if (!token) return
    await fetch(SUPA_URL + "/rest/v1/comments?id=eq." + id, {
      method: "DELETE",
      headers: authHeaders(token),
    })
    setComments(prev => prev.filter(c => c.id !== id))
  }

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="text-xl font-bold mb-6">Comments ({comments.length})</h2>

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

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Share your thoughts…"
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={3}
            required
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
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

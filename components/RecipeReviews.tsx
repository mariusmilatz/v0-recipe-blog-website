"use client"

// components/RecipeReviews.tsx
// Supabase-backed star ratings + review comments for recipe pages.
// Replaces the old localStorage review system.

import { useEffect, useState } from "react"
import Link from "next/link"
import { Star } from "lucide-react"
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

type Rating = {
  id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  profiles: { name: string } | null
}

export default function RecipeReviews({ notionRecipeId, recipeSlug, recipeTitle }: Props) {
  const { user } = useAuth()
  const supabase = createClient()

  const [ratings, setRatings] = useState<Rating[]>([])
  const [myRating, setMyRating] = useState<Rating | null>(null)
  const [hoverStar, setHoverStar] = useState(0)
  const [selectedStar, setSelectedStar] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(false)

  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0

  useEffect(() => {
    loadRatings()
  }, [notionRecipeId])

  useEffect(() => {
    if (user && ratings.length > 0) {
      const mine = ratings.find((r) => r.user_id === user.id) || null
      setMyRating(mine)
      if (mine && !editing) {
        setSelectedStar(mine.rating)
        setComment(mine.comment || "")
      }
    }
  }, [user, ratings])

  async function loadRatings() {
    const { data } = await supabase
      .from("ratings")
      .select("id, user_id, rating, comment, created_at, profiles(name)")
      .eq("notion_recipe_id", notionRecipeId)
      .order("created_at", { ascending: false })
    setRatings((data as Rating[]) || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || selectedStar === 0) return
    setSubmitting(true)

    if (myRating) {
      // Update existing
      await supabase
        .from("ratings")
        .update({ rating: selectedStar, comment: comment.trim() || null, updated_at: new Date().toISOString() })
        .eq("id", myRating.id)
    } else {
      // Insert new
      await supabase.from("ratings").insert({
        user_id: user.id,
        notion_recipe_id: notionRecipeId,
        recipe_slug: recipeSlug,
        recipe_title: recipeTitle,
        rating: selectedStar,
        comment: comment.trim() || null,
      })
    }

    setEditing(false)
    await loadRatings()
    setSubmitting(false)
  }

  async function handleDelete() {
    if (!myRating) return
    await supabase.from("ratings").delete().eq("id", myRating.id)
    setMyRating(null)
    setSelectedStar(0)
    setComment("")
    await loadRatings()
  }

  const displayStar = hoverStar || selectedStar

  return (
    <section className="mt-10 space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold">Reviews</h2>
        {ratings.length > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="h-4 w-4"
                  fill={s <= Math.round(averageRating) ? "#e9b949" : "none"}
                  stroke={s <= Math.round(averageRating) ? "#e9b949" : "currentColor"}
                />
              ))}
            </div>
            <span>{averageRating.toFixed(1)} · {ratings.length} {ratings.length === 1 ? "review" : "reviews"}</span>
          </div>
        )}
      </div>

      {/* Review list */}
      {ratings.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet — be the first!</p>
      ) : (
        <div className="space-y-4">
          {ratings.map((r) => (
            <div key={r.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-sm">{r.profiles?.name || "User"}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className="h-3.5 w-3.5"
                          fill={s <= r.rating ? "#e9b949" : "none"}
                          stroke={s <= r.rating ? "#e9b949" : "currentColor"}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  {r.comment && <p className="text-sm">{r.comment}</p>}
                </div>
                {user?.id === r.user_id && (
                  <button
                    onClick={handleDelete}
                    className="text-muted-foreground hover:text-red-500 transition-colors shrink-0 mt-0.5"
                    title="Delete review"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating form */}
      {user ? (
        myRating && !editing ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground flex items-center justify-between gap-4">
            <span>You rated this recipe {myRating.rating}/5 stars.</span>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Edit review
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-6">
            <h3 className="font-semibold">{myRating ? "Update your review" : "Leave a review"}</h3>

            {/* Star picker */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseEnter={() => setHoverStar(s)}
                  onMouseLeave={() => setHoverStar(0)}
                  onClick={() => setSelectedStar(s)}
                  className="focus:outline-none"
                  aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
                >
                  <Star
                    className="h-7 w-7 transition-colors"
                    fill={s <= displayStar ? "#e9b949" : "none"}
                    stroke={s <= displayStar ? "#e9b949" : "currentColor"}
                  />
                </button>
              ))}
            </div>

            <Textarea
              placeholder="Share your experience (optional)…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />

            <div className="flex gap-2">
              <Button
                type="submit"
                className="bg-[#6a994e] hover:bg-[#5a8540]"
                disabled={submitting || selectedStar === 0}
              >
                {submitting ? "Saving…" : myRating ? "Update review" : "Submit review"}
              </Button>
              {editing && (
                <Button type="button" variant="outline" onClick={() => { setEditing(false); setSelectedStar(myRating?.rating || 0); setComment(myRating?.comment || "") }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        )
      ) : (
        <p className="text-sm text-muted-foreground border-t pt-6">
          <Link href="/login" className="text-[#6a994e] hover:underline font-medium">Sign in</Link> to leave a review.
        </p>
      )}
    </section>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function RecipeRatingSummary({ notionRecipeId }: { notionRecipeId: string }) {
  const [avg, setAvg] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!notionRecipeId) return
    fetch(
      SUPA_URL + "/rest/v1/ratings?select=rating&notion_recipe_id=eq." + encodeURIComponent(notionRecipeId),
      { headers: { apikey: SUPA_KEY } }
    )
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCount(data.length)
          setAvg(data.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / data.length)
        }
      })
      .catch(() => {})
  }, [notionRecipeId])

  if (count === 0) return <span className="text-sm text-muted-foreground">No reviews yet</span>

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map(s => (
          <Star
            key={s}
            className="h-4 w-4"
            fill={s <= Math.round(avg) ? "#e9b949" : "none"}
            stroke={s <= Math.round(avg) ? "#e9b949" : "currentColor"}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {avg.toFixed(1)} · {count} {count === 1 ? "review" : "reviews"}
      </span>
    </div>
  )
}

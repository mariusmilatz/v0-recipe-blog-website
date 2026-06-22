"use client"

// components/SaveRecipeButton.tsx
// Uses direct fetch with the JWT from AuthContext — bypasses @supabase/ssr entirely.

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function headers(token: string) {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  }
}

type Props = {
  notionRecipeId: string
  recipeTitle: string
  recipeSlug: string
  recipeImage?: string
}

export default function SaveRecipeButton({ notionRecipeId, recipeTitle, recipeSlug, recipeImage }: Props) {
  const { user, session } = useAuth()
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  // Check if this recipe is already saved
  useEffect(() => {
    if (!user || !session?.access_token) return
    fetch(
      `${SUPABASE_URL}/rest/v1/saved_recipes?select=id&user_id=eq.${user.id}&notion_recipe_id=eq.${encodeURIComponent(notionRecipeId)}`,
      { headers: headers(session.access_token) }
    )
      .then(r => r.json())
      .then(data => setSaved(Array.isArray(data) && data.length > 0))
      .catch(console.error)
  }, [user, session?.access_token, notionRecipeId])

  async function toggle() {
    if (!user || !session?.access_token) {
      router.push("/login")
      return
    }
    setLoading(true)

    if (saved) {
      await fetch(
        `${SUPABASE_URL}/rest/v1/saved_recipes?user_id=eq.${user.id}&notion_recipe_id=eq.${encodeURIComponent(notionRecipeId)}`,
        { method: "DELETE", headers: headers(session.access_token) }
      )
      setSaved(false)
    } else {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/saved_recipes`, {
        method: "POST",
        headers: headers(session.access_token),
        body: JSON.stringify({
          user_id: user.id,
          notion_recipe_id: notionRecipeId,
          recipe_title: recipeTitle,
          recipe_slug: recipeSlug,
          recipe_image: recipeImage || null,
        }),
      })
      if (res.ok || res.status === 201) setSaved(true)
    }

    setLoading(false)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 ${saved ? "border-[#6a994e] text-[#6a994e]" : ""}`}
      title={saved ? "Remove from saved" : "Save recipe"}
    >
      <Bookmark className={`h-4 w-4 ${saved ? "fill-[#6a994e]" : ""}`} />
      {saved ? "Saved" : "Save recipe"}
    </Button>
  )
}
  }, [user, notionRecipeId])

  async function toggle() {
    if (!user) {
      router.push("/login")
      return
    }
    setLoading(true)
    if (saved) {
      await supabase
        .from("saved_recipes")
        .delete()
        .eq("user_id", user.id)
        .eq("notion_recipe_id", notionRecipeId)
      setSaved(false)
    } else {
      await supabase.from("saved_recipes").insert({
        user_id: user.id,
        notion_recipe_id: notionRecipeId,
        recipe_title: recipeTitle,
        recipe_slug: recipeSlug,
        recipe_image: recipeImage || null,
      })
      setSaved(true)
    }
    setLoading(false)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 ${saved ? "border-[#6a994e] text-[#6a994e]" : ""}`}
      title={saved ? "Remove from saved" : "Save recipe"}
    >
      <Bookmark className={`h-4 w-4 ${saved ? "fill-[#6a994e]" : ""}`} />
      {saved ? "Saved" : "Save recipe"}
    </Button>
  )
}

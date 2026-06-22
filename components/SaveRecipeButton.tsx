"use client"

// components/SaveRecipeButton.tsx
// Drop this into any recipe page. Pass the recipe details as props.
// It shows a bookmark button — filled if saved, empty if not.

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"

type Props = {
  notionRecipeId: string
  recipeTitle: string
  recipeSlug: string
  recipeImage?: string
}

export default function SaveRecipeButton({ notionRecipeId, recipeTitle, recipeSlug, recipeImage }: Props) {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from("saved_recipes")
      .select("id")
      .eq("user_id", user.id)
      .eq("notion_recipe_id", notionRecipeId)
      .maybeSingle()
      .then(({ data }) => setSaved(!!data))
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

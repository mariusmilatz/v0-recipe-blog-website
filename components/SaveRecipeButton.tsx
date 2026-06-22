"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function getToken(sessionToken: string | undefined): string | null {
  if (sessionToken) return sessionToken
  if (typeof window !== "undefined") {
    return localStorage.getItem("_sb_access_token")
  }
  return null
}

function buildHeaders(token: string) {
  return {
    apikey: SUPABASE_KEY,
    Authorization: "Bearer " + token,
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

export default function SaveRecipeButton({
  notionRecipeId,
  recipeTitle,
  recipeSlug,
  recipeImage,
}: Props) {
  const { user, session } = useAuth()
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState("")

  // Persist token to localStorage whenever session changes
  useEffect(() => {
    if (session?.access_token && typeof window !== "undefined") {
      localStorage.setItem("_sb_access_token", session.access_token)
    }
  }, [session])

  // Check saved state on load
  useEffect(() => {
    const token = getToken(session?.access_token)
    if (!user || !token) return
    const url =
      SUPABASE_URL +
      "/rest/v1/saved_recipes?select=id&user_id=eq." +
      user.id +
      "&notion_recipe_id=eq." +
      encodeURIComponent(notionRecipeId)
    fetch(url, { headers: buildHeaders(token) })
      .then(function(r) { return r.json() })
      .then(function(data) { setSaved(Array.isArray(data) && data.length > 0) })
      .catch(function(e) { console.error("SaveRecipeButton check error:", e) })
  }, [user, session, notionRecipeId])

  async function toggle() {
    const token = getToken(session?.access_token)

    if (!user || !token) {
      router.push("/login")
      return
    }

    setLoading(true)
    setStatusMsg("")

    try {
      if (saved) {
        const res = await fetch(
          SUPABASE_URL +
            "/rest/v1/saved_recipes?user_id=eq." +
            user.id +
            "&notion_recipe_id=eq." +
            encodeURIComponent(notionRecipeId),
          { method: "DELETE", headers: buildHeaders(token) }
        )
        if (res.ok) {
          setSaved(false)
        } else {
          const body = await res.text()
          console.error("Delete failed:", res.status, body)
          setStatusMsg("Could not remove — try again")
        }
      } else {
        const res = await fetch(SUPABASE_URL + "/rest/v1/saved_recipes", {
          method: "POST",
          headers: buildHeaders(token),
          body: JSON.stringify({
            user_id: user.id,
            notion_recipe_id: notionRecipeId,
            recipe_title: recipeTitle,
            recipe_slug: recipeSlug,
            recipe_image: recipeImage || null,
          }),
        })
        if (res.ok) {
          setSaved(true)
        } else {
          const body = await res.text()
          console.error("Save failed:", res.status, body)
          setStatusMsg("Save failed (" + res.status + ") — try again")
        }
      }
    } catch (err) {
      console.error("SaveRecipeButton error:", err)
      setStatusMsg("Network error — try again")
    }

    setLoading(false)
  }

  const isLoggedIn = !!user

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={toggle}
        disabled={loading}
        className={
          "flex items-center gap-2" +
          (saved ? " border-[#6a994e] text-[#6a994e]" : "")
        }
        title={
          !isLoggedIn
            ? "Log in to save this recipe"
            : saved
            ? "Remove from saved"
            : "Save recipe"
        }
      >
        <Bookmark className={"h-4 w-4" + (saved ? " fill-[#6a994e]" : "")} />
        {loading
          ? "Saving..."
          : !isLoggedIn
          ? "Log in to save"
          : saved
          ? "Saved"
          : "Save recipe"}
      </Button>
      {statusMsg && (
        <p className="text-xs text-red-500">{statusMsg}</p>
      )}
    </div>
  )
}

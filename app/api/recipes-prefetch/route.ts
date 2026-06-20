// app/api/recipes-prefetch/route.ts
// Lightweight endpoint that returns the first 9 recipe image URLs.
// Used by PrefetchRecipes to warm the browser cache before the user navigates.

import { NextResponse } from "next/server"
import { fetchRecipesFromNotion } from "@/lib/notion"

// Cache this for 60s so repeated calls don't hit Notion every time
export const revalidate = 60

export async function GET() {
  try {
    const recipes = await fetchRecipesFromNotion()
    const imageUrls = recipes
      .slice(0, 9)
      .map((r: any) => r.image)
      .filter(Boolean)
    return NextResponse.json(imageUrls)
  } catch {
    return NextResponse.json([])
  }
}

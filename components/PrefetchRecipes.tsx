"use client"

// components/PrefetchRecipes.tsx
// Invisible component — renders nothing but quietly preloads recipe images
// after the current page has finished loading. Drop into app/layout.tsx.

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PrefetchRecipes() {
  const router = useRouter()

  useEffect(() => {
    // Prefetch the /recipes page bundle (HTML + JS) immediately.
    // Next.js caches this so navigation feels instant.
    router.prefetch("/recipes")

    // Wait 1.5s for the current page to fully settle, then start
    // warming the image cache for the first 9 recipe images.
    const timer = setTimeout(() => {
      fetch("/api/recipes-prefetch")
        .then((r) => r.json())
        .then((urls: string[]) => {
          urls.forEach((url) => {
            // Creating an Image object triggers a real browser fetch.
            // The response is cached — so when /recipes loads these
            // same URLs, they're served from cache instantly.
            const img = new Image()
            img.src = url
          })
        })
        .catch(() => {
          // Silently ignore — prefetch is best-effort, never blocks the user
        })
    }, 1500)

    return () => clearTimeout(timer)
  }, [router])

  return null
}

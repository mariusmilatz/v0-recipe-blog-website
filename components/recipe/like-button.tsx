"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleRecipeLike, isRecipeLiked, getRecipeLikeCount, setupSyncListeners } from "@/lib/recipe-storage"
import { toast } from "@/hooks/use-toast"

interface LikeButtonProps {
  recipeId: string
  className?: string
}

export function LikeButton({ recipeId, className = "" }: LikeButtonProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Initialize state from localStorage
    setLiked(isRecipeLiked(recipeId))
    setLikeCount(getRecipeLikeCount(recipeId))

    // Set up sync listeners
    const cleanup = setupSyncListeners(
      undefined, // We don't need review sync for this component
      (syncedRecipeId) => {
        // Only update if this is for our recipe
        if (syncedRecipeId === recipeId) {
          setLiked(isRecipeLiked(recipeId))
          setLikeCount(getRecipeLikeCount(recipeId))
        }
      },
    )

    return cleanup
  }, [recipeId])

  const handleLike = () => {
    const newLikedState = toggleRecipeLike(recipeId)
    setLiked(newLikedState)
    setLikeCount(getRecipeLikeCount(recipeId))

    if (newLikedState) {
      toast({
        title: "Recipe liked!",
        description: "Thanks for liking this recipe!",
      })
    }
  }

  if (!isClient) {
    return null // Prevent hydration mismatch
  }

  return (
    <Button variant="outline" size="sm" className={className} onClick={handleLike}>
      <Heart className={`mr-2 h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
      {liked ? "Liked" : "Like"} {likeCount > 0 && `(${likeCount})`}
    </Button>
  )
}

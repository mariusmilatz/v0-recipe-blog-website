// lib/recipe-storage.ts

// Types for our stored data
export interface RecipeReview {
  id: string
  recipeId: string
  author: {
    name: string
    initials: string
  }
  rating: number
  comment: string
  date: string
}

export interface RecipeLike {
  recipeId: string
  timestamp: number
  userId: string // Add a unique identifier for each user
}

// Keys for localStorage
const REVIEWS_STORAGE_KEY = "vegan-side-project-reviews"
const LIKES_STORAGE_KEY = "vegan-side-project-likes"
const USER_ID_KEY = "vegan-side-project-user-id"

// Custom event names for synchronization
const REVIEW_SYNC_EVENT = "vegan-side-project-review-sync"
const LIKE_SYNC_EVENT = "vegan-side-project-like-sync"

// Helper to safely parse JSON from localStorage
function safelyParseJSON(key: string, defaultValue: any) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (e) {
    console.error("Error parsing stored data:", e)
    return defaultValue
  }
}

// Helper to safely stringify and save JSON to localStorage
function safelySaveJSON(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (e) {
    console.error("Error saving data:", e)
    return false
  }
}

// Get or create a unique user ID
function getUserId(): string {
  if (typeof window === "undefined") return ""

  let userId = localStorage.getItem(USER_ID_KEY)

  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem(USER_ID_KEY, userId)
  }

  return userId
}

// Get all reviews
export function getAllReviews(): RecipeReview[] {
  if (typeof window === "undefined") return []
  return safelyParseJSON(REVIEWS_STORAGE_KEY, [])
}

// Get reviews for a specific recipe
export function getRecipeReviews(recipeId: string): RecipeReview[] {
  const allReviews = getAllReviews()
  return allReviews.filter((review) => review.recipeId === recipeId)
}

// Add a new review
export function addReview(review: Omit<RecipeReview, "id" | "date">): RecipeReview {
  if (typeof window === "undefined") return {} as RecipeReview

  const allReviews = getAllReviews()

  const newReview: RecipeReview = {
    ...review,
    id: Date.now().toString(),
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  }

  allReviews.push(newReview)
  safelySaveJSON(REVIEWS_STORAGE_KEY, allReviews)

  // Broadcast the change to other tabs/windows
  broadcastReviewChange(newReview, "add")

  return newReview
}

// Get all likes
export function getAllLikes(): RecipeLike[] {
  if (typeof window === "undefined") return []
  return safelyParseJSON(LIKES_STORAGE_KEY, [])
}

// Check if a recipe is liked by the current user
export function isRecipeLiked(recipeId: string): boolean {
  const allLikes = getAllLikes()
  const userId = getUserId()
  return allLikes.some((like) => like.recipeId === recipeId && like.userId === userId)
}

// Get like count for a recipe (from all users)
export function getRecipeLikeCount(recipeId: string): number {
  const allLikes = getAllLikes()

  // Count unique users who liked this recipe
  const uniqueUserIds = new Set()

  allLikes.forEach((like) => {
    if (like.recipeId === recipeId) {
      uniqueUserIds.add(like.userId)
    }
  })

  return uniqueUserIds.size
}

// Toggle like for a recipe
export function toggleRecipeLike(recipeId: string): boolean {
  if (typeof window === "undefined") return false

  const allLikes = getAllLikes()
  const userId = getUserId()
  const isLiked = isRecipeLiked(recipeId)

  let newLikes
  if (isLiked) {
    // Unlike
    newLikes = allLikes.filter((like) => !(like.recipeId === recipeId && like.userId === userId))
  } else {
    // Like
    newLikes = [...allLikes, { recipeId, timestamp: Date.now(), userId }]
  }

  safelySaveJSON(LIKES_STORAGE_KEY, newLikes)

  // Broadcast the change to other tabs/windows
  broadcastLikeChange(recipeId, !isLiked, userId)

  return !isLiked
}

// Get total counts
export function getRecipeStats(recipeId: string) {
  return {
    reviewCount: getRecipeReviews(recipeId).length,
    likeCount: getRecipeLikeCount(recipeId),
    isLiked: isRecipeLiked(recipeId),
    averageRating: calculateAverageRating(recipeId),
  }
}

// Calculate average rating
function calculateAverageRating(recipeId: string): number {
  const reviews = getRecipeReviews(recipeId)
  if (reviews.length === 0) return 0

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
  return totalRating / reviews.length
}

// Broadcast review change to other tabs/windows
function broadcastReviewChange(review: RecipeReview, action: "add" | "update" | "delete") {
  if (typeof window === "undefined" || !window.BroadcastChannel) return

  try {
    const channel = new BroadcastChannel(REVIEW_SYNC_EVENT)
    channel.postMessage({ review, action })
    channel.close()
  } catch (e) {
    console.error("Error broadcasting review change:", e)
  }
}

// Broadcast like change to other tabs/windows
function broadcastLikeChange(recipeId: string, isLiked: boolean, userId: string) {
  if (typeof window === "undefined" || !window.BroadcastChannel) return

  try {
    const channel = new BroadcastChannel(LIKE_SYNC_EVENT)
    channel.postMessage({ recipeId, isLiked, userId })
    channel.close()
  } catch (e) {
    console.error("Error broadcasting like change:", e)
  }
}

// Setup synchronization listeners
export function setupSyncListeners(
  onReviewSync?: (reviews: RecipeReview[]) => void,
  onLikeSync?: (recipeId: string, isLiked: boolean, userId: string) => void,
) {
  if (typeof window === "undefined" || !window.BroadcastChannel) return () => {}

  let reviewChannel: BroadcastChannel | null = null
  let likeChannel: BroadcastChannel | null = null

  try {
    // Listen for review changes
    reviewChannel = new BroadcastChannel(REVIEW_SYNC_EVENT)
    reviewChannel.onmessage = (event) => {
      const { review, action } = event.data

      // Update local storage
      const allReviews = getAllReviews()

      if (action === "add") {
        allReviews.push(review)
      } else if (action === "update") {
        const index = allReviews.findIndex((r) => r.id === review.id)
        if (index !== -1) {
          allReviews[index] = review
        }
      } else if (action === "delete") {
        const index = allReviews.findIndex((r) => r.id === review.id)
        if (index !== -1) {
          allReviews.splice(index, 1)
        }
      }

      safelySaveJSON(REVIEWS_STORAGE_KEY, allReviews)

      // Notify callback if provided
      if (onReviewSync) {
        onReviewSync(getRecipeReviews(review.recipeId))
      }
    }

    // Listen for like changes
    likeChannel = new BroadcastChannel(LIKE_SYNC_EVENT)
    likeChannel.onmessage = (event) => {
      const { recipeId, isLiked, userId } = event.data

      // Update local storage
      const allLikes = getAllLikes()
      const currentUserId = getUserId()

      // Only update if it's from another user (we already updated our own)
      if (userId !== currentUserId) {
        if (isLiked) {
          // Add like if not already liked by this user
          if (!allLikes.some((like) => like.recipeId === recipeId && like.userId === userId)) {
            allLikes.push({ recipeId, timestamp: Date.now(), userId })
            safelySaveJSON(LIKES_STORAGE_KEY, allLikes)
          }
        } else {
          // Remove like for this user
          const newLikes = allLikes.filter((like) => !(like.recipeId === recipeId && like.userId === userId))
          safelySaveJSON(LIKES_STORAGE_KEY, newLikes)
        }
      }

      // Notify callback if provided
      if (onLikeSync) {
        onLikeSync(recipeId, isLiked, userId)
      }
    }
  } catch (e) {
    console.error("Error setting up sync listeners:", e)
  }

  // Return cleanup function
  return () => {
    if (reviewChannel) reviewChannel.close()
    if (likeChannel) likeChannel.close()
  }
}

// For storage across browser sessions
export function exportData() {
  return {
    reviews: getAllReviews(),
    likes: getAllLikes(),
  }
}

export function importData(data: { reviews: RecipeReview[]; likes: RecipeLike[] }) {
  if (typeof window === "undefined") return false

  try {
    safelySaveJSON(REVIEWS_STORAGE_KEY, data.reviews || [])
    safelySaveJSON(LIKES_STORAGE_KEY, data.likes || [])
    return true
  } catch (e) {
    console.error("Error importing data:", e)
    return false
  }
}

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Lock, AlertCircle } from "lucide-react"
import { useAuth } from "@/context/auth-context"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SignInDialog } from "@/components/auth/sign-in-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Tip {
  id: string
  title: string
  description: string
  slug: string
  image?: string
  tags: string[]
}

export default function TipsPage() {
  const { user } = useAuth()
  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTips() {
      try {
        const response = await fetch("/api/tips")
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }
        const data = await response.json()
        setTips(data.tips)
      } catch (err) {
        console.error("Failed to fetch tips:", err)
        setError("Failed to load tips. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchTips()
  }, [])

  const useSampleTips = !loading && tips.length === 0 && !error

  const sampleTips = [
    { id: "1", title: "Vegan Protein Sources", description: "Beyond tofu: delicious protein options", slug: "vegan-protein-sources", tags: ["Nutrition", "Basics"] },
    { id: "2", title: "Dairy Substitutes", description: "Creamy without the cream", slug: "dairy-substitutes", tags: ["Ingredients", "Basics"] },
    { id: "3", title: "Umami Boosters", description: "Adding depth and savory flavors", slug: "umami-boosters", tags: ["Flavor", "Techniques"] },
    { id: "4", title: "Egg Replacements", description: "For baking and beyond", slug: "egg-replacements", tags: ["Baking", "Ingredients"] },
    { id: "5", title: "Meal Prep Ideas", description: "Save time and reduce stress", slug: "meal-prep-ideas", tags: ["Planning", "Time-saving"] },
    { id: "6", title: "Pantry Essentials", description: "Stock up for success", slug: "pantry-essentials", tags: ["Shopping", "Basics"] },
  ]

  const displayTips = useSampleTips ? sampleTips : tips
  const freeTips = displayTips.slice(0, 3)
  const premiumTips = displayTips.slice(3)

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Tips & Tricks</h1>
        <p className="mt-4 text-muted-foreground">
          Helpful advice for non-vegans cooking vegan meals that actually taste good.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : useSampleTips ? (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Notion Tips Found</AlertTitle>
          <AlertDescription>
            No tips were found in your Notion database. Showing sample tips instead.
            <Link href="/api/notion-tips-debug" className="text-green-600 hover:underline ml-1" target="_blank">
              Check the debug endpoint
            </Link>{" "}
            to troubleshoot.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Free tips visible to everyone */}
        {freeTips.map((tip) => (
          <Card key={tip.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{tip.title}</CardTitle>
              <CardDescription>{tip.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {tip.image ? (
                <div className="mb-4 aspect-video relative overflow-hidden rounded-md">
                  <Image src={tip.image || "/placeholder.svg"} alt={tip.title} fill className="object-cover" />
                </div>
              ) : null}
              <p>
                Discover practical advice and techniques to enhance your vegan cooking skills and create delicious
                plant-based meals.
              </p>
              {tip.tags && tip.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {tip.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/tips/${tip.slug}`}>
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}

        {/* Premium tips - blurred for non-signed in users */}
        {premiumTips.map((tip) => (
          <Card key={tip.id} className={`flex flex-col${user ? "" : " relative"}`}>
            {!user && (
              <div className="absolute inset-0 backdrop-blur-sm bg-background/50 z-10 flex flex-col items-center justify-center p-6 text-center">
                <Lock className="h-8 w-8 mb-2 text-muted-foreground" />
                <h3 className="font-medium mb-2">Premium Content</h3>
                <p className="text-sm text-muted-foreground mb-4">Sign in to access all our tips and tricks</p>
                <SignInDialog />
              </div>
            )}
            <CardHeader className={!user ? "blur-sm" : ""}>
              <CardTitle>{tip.title}</CardTitle>
              <CardDescription>{tip.description}</CardDescription>
            </CardHeader>
            <CardContent className={`flex-1${!user ? " blur-sm" : ""}`}>
              {tip.image ? (
                <div className="mb-4 aspect-video relative overflow-hidden rounded-md">
                  <Image src={tip.image || "/placeholder.svg"} alt={tip.title} fill className="object-cover" />
                </div>
              ) : null}
              <p>
                Discover practical advice and techniques to enhance your vegan cooking skills and create delicious
                plant-based meals.
              </p>
              {tip.tags && tip.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {tip.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className={!user ? "blur-sm" : ""}>
              <Button asChild variant="outline" className="w-full" disabled={!user}>
                <Link href={user ? `/tips/${tip.slug}` : "#"}>
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

"use client"

// app/submit-recipe/page.tsx
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

export default function SubmitRecipePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    title: "",
    description: "",
    prepTime: "",
    cookTime: "",
    servings: "",
    ingredients: "",
    instructions: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [loading, user, router])

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    setError("")

    const { error } = await supabase.from("recipe_submissions").insert({
      user_id: user.id,
      title: form.title.trim(),
      description: form.description.trim(),
      prep_time: form.prepTime.trim(),
      cook_time: form.cookTime.trim(),
      servings: form.servings.trim(),
      ingredients: form.ingredients.trim(),
      instructions: form.instructions.trim(),
    })

    if (error) {
      setError("Something went wrong. Please try again.")
      setSubmitting(false)
      return
    }

    setDone(true)
  }

  if (loading || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-2">Recipe submitted!</h1>
          <p className="text-muted-foreground mb-6">
            Thanks for sharing! We&apos;ll review your recipe and publish it if it&apos;s a good fit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-[#6a994e] hover:bg-[#5a8540]">
              <Link href="/profile">View my submissions</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/recipes">Browse recipes</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Submit a Recipe</h1>
        <p className="text-muted-foreground mt-2">
          Share your favourite vegan recipe with the community. We&apos;ll review it and publish it if it&apos;s a good fit.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-1">
          <Label htmlFor="title">Recipe name *</Label>
          <Input id="title" value={form.title} onChange={set("title")} placeholder="e.g. Creamy Mushroom Risotto" required />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <Label htmlFor="description">Short description *</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={set("description")}
            placeholder="A brief description of the dish (1–2 sentences)"
            rows={2}
            required
          />
        </div>

        {/* Times + servings */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor="prepTime">Prep time</Label>
            <Input id="prepTime" value={form.prepTime} onChange={set("prepTime")} placeholder="e.g. 15 mins" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cookTime">Cook time</Label>
            <Input id="cookTime" value={form.cookTime} onChange={set("cookTime")} placeholder="e.g. 30 mins" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="servings">Servings</Label>
            <Input id="servings" value={form.servings} onChange={set("servings")} placeholder="e.g. 4" />
          </div>
        </div>

        {/* Ingredients */}
        <div className="space-y-1">
          <Label htmlFor="ingredients">Ingredients *</Label>
          <p className="text-xs text-muted-foreground">One ingredient per line. Use bold text in Notion for section headers like "Sauce:"</p>
          <Textarea
            id="ingredients"
            value={form.ingredients}
            onChange={set("ingredients")}
            placeholder={"1 cup arborio rice\n2 tbsp olive oil\n500ml vegetable stock"}
            rows={8}
            required
          />
        </div>

        {/* Instructions */}
        <div className="space-y-1">
          <Label htmlFor="instructions">Instructions *</Label>
          <p className="text-xs text-muted-foreground">Number each step (e.g. 1. Heat the oil…)</p>
          <Textarea
            id="instructions"
            value={form.instructions}
            onChange={set("instructions")}
            placeholder={"1. Heat olive oil in a large pan over medium heat.\n2. Add onion and cook for 5 minutes until soft."}
            rows={10}
            required
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" className="bg-[#6a994e] hover:bg-[#5a8540]" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit recipe"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

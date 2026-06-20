"use client"

// app/profile/page.tsx
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Clock, BookmarkCheck, MessageSquare, ChefHat, LogOut, Loader2 } from "lucide-react"

type SavedRecipe = {
  id: string
  recipe_title: string
  recipe_slug: string
  recipe_image: string | null
  saved_at: string
}

type Comment = {
  id: string
  recipe_title: string
  recipe_slug: string
  body: string
  created_at: string
}

type Submission = {
  id: string
  title: string
  status: "pending" | "published" | "rejected"
  submitted_at: string
}

const statusColour: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
}

export default function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState("")
  const [savingName, setSavingName] = useState(false)
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [loading, user, router])

  // Prefill name from profile
  useEffect(() => {
    if (profile) setName(profile.name)
  }, [profile])

  // Load user data
  useEffect(() => {
    if (!user || dataLoaded) return
    async function loadData() {
      const [savedRes, commentsRes, submissionsRes] = await Promise.all([
        supabase
          .from("saved_recipes")
          .select("*")
          .eq("user_id", user!.id)
          .order("saved_at", { ascending: false }),
        supabase
          .from("comments")
          .select("*")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("recipe_submissions")
          .select("id, title, status, submitted_at")
          .eq("user_id", user!.id)
          .order("submitted_at", { ascending: false }),
      ])
      setSavedRecipes(savedRes.data || [])
      setComments(commentsRes.data || [])
      setSubmissions(submissionsRes.data || [])
      setDataLoaded(true)
    }
    loadData()
  }, [user, dataLoaded])

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSavingName(true)
    await supabase.from("profiles").update({ name, updated_at: new Date().toISOString() }).eq("id", user.id)
    setSavingName(false)
  }

  async function handleUnsave(id: string) {
    await supabase.from("saved_recipes").delete().eq("id", id)
    setSavedRecipes(prev => prev.filter(r => r.id !== id))
  }

  async function handleDeleteComment(id: string) {
    await supabase.from("comments").delete().eq("id", id)
    setComments(prev => prev.filter(c => c.id !== id))
  }

  if (loading || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container py-10 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-1">{profile?.email || user.email}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => { await signOut(); router.push("/") }}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>

      <Tabs defaultValue="saved">
        <TabsList className="mb-6">
          <TabsTrigger value="saved" className="flex items-center gap-1.5">
            <BookmarkCheck className="h-4 w-4" /> Saved
            {savedRecipes.length > 0 && (
              <span className="ml-1 text-xs bg-[#6a994e] text-white rounded-full px-1.5">{savedRecipes.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4" /> Comments
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-1.5">
            <ChefHat className="h-4 w-4" /> Submissions
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* SAVED RECIPES */}
        <TabsContent value="saved">
          {savedRecipes.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <BookmarkCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No saved recipes yet.</p>
              <Link href="/recipes" className="text-[#6a994e] hover:underline text-sm mt-2 inline-block">
                Browse recipes →
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {savedRecipes.map(r => (
                <div key={r.id} className="rounded-lg border bg-card overflow-hidden flex flex-col">
                  {r.recipe_image && (
                    <div className="h-[160px] bg-muted">
                      <img src={r.recipe_image} alt={r.recipe_title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4 flex flex-col flex-grow">
                    <p className="font-semibold leading-snug">{r.recipe_title}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Saved {new Date(r.saved_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link href={`/recipes/${r.recipe_slug}`}>View recipe</Link>
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleUnsave(r.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* COMMENTS */}
        <TabsContent value="comments">
          {comments.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>You haven&apos;t commented on any recipes yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map(c => (
                <div key={c.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link href={`/recipes/${c.recipe_slug}`} className="font-semibold text-sm hover:underline text-[#6a994e]">
                        {c.recipe_title}
                      </Link>
                      <p className="text-sm mt-1">{c.body}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 shrink-0" onClick={() => handleDeleteComment(c.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* SUBMISSIONS */}
        <TabsContent value="submissions">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">Recipes you&apos;ve submitted for review</p>
            <Button asChild size="sm" className="bg-[#6a994e] hover:bg-[#5a8540]">
              <Link href="/submit-recipe">Submit a recipe</Link>
            </Button>
          </div>
          {submissions.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ChefHat className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No submissions yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map(s => (
                <div key={s.id} className="rounded-lg border p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-sm">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Submitted {new Date(s.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColour[s.status]}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* SETTINGS */}
        <TabsContent value="settings">
          <div className="max-w-sm">
            <h2 className="font-semibold mb-4">Account settings</h2>
            <form onSubmit={handleUpdateName} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Display name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input value={profile?.email || user.email || ""} disabled className="opacity-60" />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <Button type="submit" className="bg-[#6a994e] hover:bg-[#5a8540]" disabled={savingName}>
                {savingName ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

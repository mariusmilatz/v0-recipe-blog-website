"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, Bookmark, MessageSquare, ChefHat, Settings, CalendarDays, Trash2, ExternalLink } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface SavedRecipe {
  id: string
  notion_recipe_id: string
  recipe_title: string
  recipe_slug: string
  recipe_image: string | null
  saved_at: string
}

interface SavedPlan {
  id: string
  name: string
  week_start_day: string
  created_at: string
  slots: Record<string, Record<string, { recipe: { title: string; image: string } } | null>>
}

interface Comment {
  id: string
  recipe_title: string
  recipe_slug: string
  body: string
  created_at: string
}

interface Submission {
  id: string
  title: string
  status: "pending" | "published" | "rejected"
  submitted_at: string
}

type Tab = "saved" | "plans" | "comments" | "submissions" | "settings"

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [tab, setTab] = useState<Tab>("saved")
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([])
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push("/login"); return }
    loadAll()
  }, [user])

  async function loadAll() {
    setLoading(true)
    const [recipes, plans, cmts, subs] = await Promise.all([
      supabase.from("saved_recipes").select("*").eq("user_id", user!.id).order("saved_at", { ascending: false }),
      supabase.from("meal_plans").select("id, name, week_start_day, created_at, slots").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("comments").select("id, recipe_title, recipe_slug, body, created_at").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("recipe_submissions").select("id, title, status, submitted_at").eq("user_id", user!.id).order("submitted_at", { ascending: false }),
    ])
    if (recipes.data) setSavedRecipes(recipes.data)
    if (plans.data) setSavedPlans(plans.data as SavedPlan[])
    if (cmts.data) setComments(cmts.data)
    if (subs.data) setSubmissions(subs.data)
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push("/")
  }

  async function deletePlan(id: string) {
    await supabase.from("meal_plans").delete().eq("id", id)
    setSavedPlans(p => p.filter(pl => pl.id !== id))
  }

  async function unsaveRecipe(id: string) {
    await supabase.from("saved_recipes").delete().eq("id", id)
    setSavedRecipes(r => r.filter(re => re.id !== id))
  }

  function recipeCount(plan: SavedPlan): number {
    return Object.values(plan.slots).reduce((acc, day) =>
      acc + Object.values(day).filter(Boolean).length, 0)
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "saved",       label: "Saved",       icon: <Bookmark className="h-4 w-4" />,      count: savedRecipes.length },
    { id: "plans",       label: "Meal Plans",  icon: <CalendarDays className="h-4 w-4" />,   count: savedPlans.length },
    { id: "comments",    label: "Comments",    icon: <MessageSquare className="h-4 w-4" />,  count: comments.length },
    { id: "submissions", label: "Submissions", icon: <ChefHat className="h-4 w-4" />,        count: submissions.length },
    { id: "settings",    label: "Settings",    icon: <Settings className="h-4 w-4" /> },
  ]

  if (!user) return null

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
        </div>
        <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id
                ? "border-[#6a994e] text-[#6a994e]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="ml-1 text-xs bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading…</div>
      ) : (
        <>
          {/* ── Saved Recipes ── */}
          {tab === "saved" && (
            <div>
              {savedRecipes.length === 0 ? (
                <EmptyState icon={<Bookmark className="h-8 w-8" />} text="No saved recipes yet" sub="Bookmark recipes while browsing to add them here." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedRecipes.map(r => (
                    <div key={r.id} className="flex gap-3 p-3 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors group">
                      {r.recipe_image && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={r.recipe_image} alt={r.recipe_title} fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link href={`/recipes/${r.recipe_slug}`} className="font-medium text-sm text-[#1a1a1a] hover:text-[#6a994e] line-clamp-2 leading-snug">
                          {r.recipe_title}
                        </Link>
                        <p className="text-xs text-gray-400 mt-1">Saved {formatDate(r.saved_at)}</p>
                      </div>
                      <button onClick={() => unsaveRecipe(r.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all flex-shrink-0 self-start mt-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Saved Meal Plans ── */}
          {tab === "plans" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">Your saved meal plans — load any of them in the builder.</p>
                <Link href="/meal-plans/builder">
                  <Button size="sm" className="bg-[#6a994e] hover:bg-[#5a8540] text-white gap-1.5">
                    <CalendarDays className="h-4 w-4" /> New plan
                  </Button>
                </Link>
              </div>
              {savedPlans.length === 0 ? (
                <EmptyState icon={<CalendarDays className="h-8 w-8" />} text="No saved plans yet" sub={<>Head to the <Link href="/meal-plans/builder" className="text-[#6a994e] hover:underline">meal plan builder</Link> to create one.</>} />
              ) : (
                <div className="flex flex-col gap-3">
                  {savedPlans.map(plan => (
                    <div key={plan.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[#1a1a1a] truncate">{plan.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {recipeCount(plan)} recipe{recipeCount(plan) !== 1 ? "s" : ""} · starts {plan.week_start_day.charAt(0).toUpperCase() + plan.week_start_day.slice(1)} · saved {formatDate(plan.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/meal-plans/builder?load=${plan.id}`}>
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
                            <ExternalLink className="h-3.5 w-3.5" /> Open
                          </Button>
                        </Link>
                        <button onClick={() => deletePlan(plan.id)} className="text-gray-300 hover:text-red-400 transition-colors p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Comments ── */}
          {tab === "comments" && (
            <div>
              {comments.length === 0 ? (
                <EmptyState icon={<MessageSquare className="h-8 w-8" />} text="No comments yet" sub="Your comments on recipes will appear here." />
              ) : (
                <div className="flex flex-col gap-4">
                  {comments.map(c => (
                    <div key={c.id} className="p-4 border border-gray-100 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <Link href={`/recipes/${c.recipe_slug}`} className="text-sm font-medium text-[#6a994e] hover:underline">{c.recipe_title}</Link>
                        <span className="text-xs text-gray-400">{formatDate(c.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{c.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Submissions ── */}
          {tab === "submissions" && (
            <div>
              {submissions.length === 0 ? (
                <EmptyState icon={<ChefHat className="h-8 w-8" />} text="No submissions yet" sub="Submit your own recipes to share with the community." />
              ) : (
                <div className="flex flex-col gap-3">
                  {submissions.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-[#1a1a1a]">{s.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Submitted {formatDate(s.submitted_at)}</p>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Settings ── */}
          {tab === "settings" && (
            <div className="max-w-sm">
              <h2 className="text-base font-semibold mb-4">Account</h2>
              <div className="p-4 border border-gray-100 rounded-xl space-y-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Email</label>
                  <p className="text-sm text-gray-800 mt-0.5">{user.email}</p>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <Button variant="outline" size="sm" onClick={signOut} className="gap-2 text-red-500 border-red-200 hover:bg-red-50">
                    <LogOut className="h-4 w-4" /> Sign out
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyState({ icon, text, sub }: { icon: React.ReactNode; text: string; sub: React.ReactNode }) {
  return (
    <div className="text-center py-16 flex flex-col items-center gap-3">
      <div className="text-gray-200">{icon}</div>
      <p className="text-sm font-medium text-gray-500">{text}</p>
      <p className="text-sm text-gray-400">{sub}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: "pending" | "published" | "rejected" }) {
  const styles = {
    pending:   "bg-yellow-50 text-yellow-700 border-yellow-200",
    published: "bg-green-50 text-green-700 border-green-200",
    rejected:  "bg-red-50 text-red-700 border-red-200",
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

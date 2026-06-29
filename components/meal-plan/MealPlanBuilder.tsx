"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import {
  ChevronDown, ChevronUp, Search, X, Plus, Calendar,
  Printer, ShoppingCart, Save, Bookmark, BookmarkCheck,
  RefreshCw, Clock, Check, ArrowLeft, Loader2, Leaf,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { fetchRecipeBySlug } from "@/app/actions/recipe-actions"
import { useAuth } from "@/context/auth-context"
import { toast } from "@/hooks/use-toast"

// ─── Types ───────────────────────────────────────────────────────────────────

type MealType = "breakfast" | "lunch" | "dinner" | "dessert"
type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"

interface RecipeSnippet {
  id: string
  title: string
  slug: string
  image: string
  courses: string[]
  category: string
  cookTime: string
  prepTime: string
  dietary: string[]
  description: string
}

interface RecipeFull extends RecipeSnippet {
  ingredientSections: { subtitle: string | null; items: string[] }[]
  instructions: { type: "step" | "subtitle"; content: string }[]
  serves: string
}

interface SlotEntry {
  recipe: RecipeFull
  isReheat: boolean
}

type WeekSlots = Record<DayOfWeek, Record<MealType, SlotEntry | null>>
type CookPrefs = Record<MealType, number>

// ─── Constants ───────────────────────────────────────────────────────────────

const ALL_DAYS: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "dessert"]
const MEAL_LABELS: Record<MealType, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", dessert: "Dessert" }
const DAY_SHORT: Record<DayOfWeek, string> = { monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun" }
const DAY_FULL: Record<DayOfWeek, string> = { monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday" }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function orderedDays(start: DayOfWeek): DayOfWeek[] {
  const i = ALL_DAYS.indexOf(start)
  return [...ALL_DAYS.slice(i), ...ALL_DAYS.slice(0, i)]
}

function emptySlots(): WeekSlots {
  return Object.fromEntries(
    ALL_DAYS.map(d => [d, Object.fromEntries(MEAL_TYPES.map(m => [m, null]))])
  ) as WeekSlots
}

function extractMins(t: string): number {
  const m = (t || "").match(/(\d+)/)
  return m ? parseInt(m[1]) : 0
}

function autoMealType(r: RecipeSnippet): MealType {
  const cats = [...(r.courses || []), r.category || ""].map(c => c.toLowerCase())
  if (cats.some(c => /breakfast|morning/.test(c))) return "breakfast"
  if (cats.some(c => /dessert|sweet/.test(c))) return "dessert"
  if (cats.some(c => /\blunch\b/.test(c))) return "lunch"
  return extractMins(r.cookTime) >= 45 ? "dinner" : "lunch"
}

function firstEmptyDay(slots: WeekSlots, days: DayOfWeek[], meal: MealType, count: number): DayOfWeek | null {
  return days.slice(0, count).find(d => !slots[d][meal]) ?? null
}

// ─── Shopping list: ingredient parser & aggregator ───────────────────────────────────────────────

const UNIT_MAP: Record<string, string> = {
  g: "g", gram: "g", grams: "g",
  kg: "kg", kilogram: "kg", kilograms: "kg",
  ml: "ml", milliliter: "ml", milliliters: "ml", millilitre: "ml", millilitres: "ml",
  l: "l", liter: "l", liters: "l", litre: "l", litres: "l",
  tbsp: "tbsp", tablespoon: "tbsp", tablespoons: "tbsp",
  tsp: "tsp", teaspoon: "tsp", teaspoons: "tsp",
  cup: "cup", cups: "cup",
  clove: "clove", cloves: "clove",
  head: "head", heads: "head",
  can: "can", cans: "can", tin: "can", tins: "can",
  bunch: "bunch", bunches: "bunch",
  stalk: "stalk", stalks: "stalk",
  sprig: "sprig", sprigs: "sprig",
  handful: "handful", handfuls: "handful",
  pinch: "pinch", pinches: "pinch",
  sheet: "sheet", sheets: "sheet",
}

const WATER_RE = /^(water|boiling water|hot water|cold water|warm water|ice water|salted water)\s*$/i

function isTitleLine(s: string): boolean {
  if (/:\s*$/.test(s)) return true
  if (/^(batter|topping|toppings|sauce|pesto|dressing|marinade|garnish|base|filling|crust|glaze|crumble|pastry)\s*$/i.test(s)) return true
  if (/^(serve with|to serve|to garnish|for the)\b/i.test(s)) return true
  return false
}

function parseFraction(s: string): number {
  const uni: Record<string, number> = { "\u00bd": 0.5, "\u00bc": 0.25, "\u00be": 0.75, "\u2153": 1/3, "\u2154": 2/3, "\u215b": 0.125 }
  if (uni[s] !== undefined) return uni[s]
  if (s.includes("/")) { const [n, d] = s.split("/"); return parseFloat(n) / parseFloat(d) }
  return parseFloat(s)
}

function parseQuantityToken(token: string): number {
  const rangeMatch = token.match(/^([\u00bd\u00bc\u00be\u2153\u2154\u215b\d./]+)[\u2013\-]([\u00bd\u00bc\u00be\u2153\u2154\u215b\d./]+)$/)
  if (rangeMatch) return Math.max(parseFraction(rangeMatch[1]), parseFraction(rangeMatch[2]))
  return parseFraction(token)
}

function formatQty(n: number): string {
  if (Number.isInteger(n)) return String(n)
  const fracs: [number, string][] = [[0.5,"\u00bd"],[0.25,"\u00bc"],[0.75,"\u00be"],[1/3,"\u2153"],[2/3,"\u2154"],[0.125,"\u215b"]]
  const exact = fracs.find(([v]) => Math.abs(n - v) < 0.05)
  if (exact) return exact[1]
  const whole = Math.floor(n)
  if (whole > 0) {
    const fracPart = fracs.find(([v]) => Math.abs((n - whole) - v) < 0.05)
    if (fracPart) return `${whole}${fracPart[1]}`
  }
  return n.toFixed(1).replace(/\.0$/, "")
}

function categorize(name: string): string {
  const s = name.toLowerCase()
  // Specific compounds first — prevent partial matches in later checks
  if (/\bgarlic powder\b/.test(s)) return "Spices & Seasonings"
  if (/\bchilli flakes?\b|\bchili flakes?\b|\bred pepper flakes?\b|\bchilli powder\b|\bchili powder\b|\bdried chilli\b|\bdried chili\b/.test(s)) return "Spices & Seasonings"
  if (/\bgarlic\b/.test(s)) return "Produce"
  if (/\b(lemon|lime|orange)\s+juice\b/.test(s)) return "Sauces & Condiments"
  if (/\b(chickpea|gram|rice|tapioca|spelt|oat|coconut|almond|cornstarch|cornflour)\s+flour\b|\bcornstarch\b|\bcornflour\b/.test(s)) return "Grains & Pasta"
  if (/\bpomegranate seeds?\b|\bseeds?\b/.test(s)) return "Nuts & Seeds"
  if (/\bcoconut\s+yogh/.test(s)) return "Plant-Based Dairy"
  if (/\b(soy sauce|tamari|miso|vinegar|balsamic|tahini|peanut butter|almond butter|cashew butter|maple syrup|agave|agave syrup|sugar|brown sugar|caster sugar|icing sugar|coconut sugar|muscovado|golden syrup|mustard|dijon mustard|ketchup|sriracha|hot sauce|chilli sauce|chilli crisp|chili crisp|nutritional yeast|hoisin|tomato paste|tomato pur[\u00e9e]e|sun-dried tomatoes?|tamarind|mirin|coconut aminos|liquid smoke|yeast extract|marmite|pomegranate molasses|date syrup|liquid aminos|bragg|black mustard seeds?|mustard seeds?)\b/.test(s)) return "Sauces & Condiments"
  if (/\b(salt|kala namak|black salt|flaky salt|sea salt|pepper|black pepper|white pepper|cumin seeds?|cumin|paprika|smoked paprika|turmeric|cardamom|cinnamon|ground cinnamon|oregano|thyme|rosemary|bay leaves?|bay leaf|curry powder|garam masala|cayenne|allspice|nutmeg|whole cloves?|ground cloves?|star anise|coriander seeds?|fennel seeds?|fenugreek|asafoetida|sumac|harissa|ras el hanout|five spice|mixed spice|mixed herbs?|vanilla|saffron|onion powder|celery salt|nigella seeds?|nigella|seasoning|spice blend|ground cumin|ground coriander|ground turmeric|ground cardamom|ground ginger|lemongrass)\b/.test(s)) return "Spices & Seasonings"
  if (/\b(almond milk|oat milk|soy milk|rice milk|cashew milk|hemp milk|plant.based milk|plant milk|vegan milk|oat yogh|soy yogh|vegan yogh|dairy.free yogh|vegan butter|vegan cheese|plant.based cream|oat cream|soy cream|cashew cream|vegan cream|cream cheese)\b/.test(s) || /^(milk|yogurt|yoghurt|soy yogurt|plant.based milk)$/.test(s)) return "Plant-Based Dairy"
  if (/\b(tofu|tempeh|seitan|tvp)\b/.test(s)) return "Plant-Based Protein"
  if (/\boil\b/.test(s) && !/marinated|packed in oil|in oil|with oil/.test(s)) return "Oils"
  if (/\b(pasta|rice|noodles?|flour|oats?|rolled oats?|quinoa|couscous|sourdough|bread|breadcrumbs?|crackers?|tortilla|flatbread|pita|naan|wrap|barley|polenta|cornmeal|semolina|bulgur|farro|millet|spelt|buckwheat|tapioca|baking powder|baking soda|bicarbonate)\b/.test(s)) return "Grains & Pasta"
  if (/\b(coconut milk|coconut cream|passata|chopped tomatoes?|diced tomatoes?|plum tomatoes?|kidney beans?|chickpeas?|butter beans?|cannellini beans?|black beans?|borlotti beans?|lentils?|split peas?|baked beans?|vegetable stock|stock cube|vegetable broth|broth|canned chickpea|canned tomato)\b/.test(s)) return "Tins & Jars"
  if (/\b(cashews?|almonds?|walnuts?|pecans?|pine nuts?|pumpkin seeds?|sunflower seeds?|sesame|chia seeds?|flaxseeds?|flax seeds?|hemp seeds?|poppy seeds?|linseed|brazil nuts?|hazelnuts?|pistachios?|macadamia|desiccated coconut|coconut flakes?|shredded coconut|mixed nuts?|mixed seeds?)\b/.test(s)) return "Nuts & Seeds"
  if (/\b(onion|shallot|leek|spring onion|scallion|chive|tomatoes?|cherry tomatoes?|pepper|capsicum|carrot|potato|sweet potato|yam|spinach|kale|chard|broccoli|cauliflower|zucchini|courgettes?|aubergine|eggplant|mushroom|pumpkin|squash|butternut|lettuce|cabbage|celery|ginger|avocado|coriander|cilantro|parsley|basil|mint|dill|sage|tarragon|rosemary|thyme|lemon|lime|orange|banana|apple|mango|berries|blueberries?|raspberries?|raspberry|strawberr|cherry|peach|plum|apricot|fig|beetroot|beet|fennel|asparagus|artichoke|corn|sweetcorn|peas?|frozen peas?|mangetout|sugar snap|edamame|bean sprout|bok choy|pak choi|cucumber|radish|turnip|swede|parsnip|watercress|rocket|arugula|okra|plantain|pineapple|pomegranate|chilli|chili|green onions?)\b/.test(s)) return "Produce"
  return "Other"
}

interface ParsedIngredient { qty: number | null; unit: string | null; name: string; category: string }

function normName(s: string): string {
  return s.trim()
    .replace(/^(?:(?:large|medium|small|big|some|a few|fresh|chopped|frozen|sliced|diced|minced|grated|roasted|toasted|cooked)\s+)+/gi, "")
    .replace(/^-?\d*\s*[-\u2013]?\s*(?:inch|cm|mm)\s+/i, "")
    .replace(/^(?:knob\s+of\s+|piece\s+of\s+|thumb[-\s]*sized?\s+(?:piece\s+(?:of\s+)?)?)/i, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

function parseIngredient(raw: string): ParsedIngredient | null {
  let s = raw.replace(/^[-\u2013\u2014\u2022*]\s*/, "").trim()
  if (!s || s.length < 2) return null
  if (isTitleLine(s)) return null

  // Strip em/en-dash notes: "1 tsp X \u2014 this is key" \u2192 "1 tsp X"
  s = s.replace(/\s*[\u2014\u2013]\s*.+$/, "").trim()

  // Remove closed AND unclosed parentheticals
  s = s.replace(/\s*\([^)]*\)|\s*\([^)]*$/g, "").trim()

  // Strip trailing comma
  s = s.replace(/,\s*$/, "").trim()

  if (!s || isTitleLine(s)) return null

  // Strip Notion count prefix "N \u00d7 ..."
  s = s.replace(/^\d+\s*[\u00d7x]\s*/, "").trim()

  // Normalize vague quantity phrases
  s = s.replace(/^a\s+pinch\s+(?:of\s+)?/i, "1 pinch ")
  s = s.replace(/^pinch\s+(?:of\s+)?/i, "1 pinch ")
  s = s.replace(/^a?\s*handful\s+(?:of\s+)?/i, "1 handful ")
  s = s.replace(/^a?\s*drizzle\s+(?:of\s+)?/i, "1 drizzle ")
  s = s.replace(/^a?\s*couple\s+(?:of\s+)?/i, "2 ")
  s = s.replace(/^juice\s+(?:of\s+)?/i, "")

  // Strip size descriptors: "1-inch knob ginger", "thumb-sized piece ginger"
  s = s.replace(/^\d+\s*[-\u2013]\s*(?:inch|cm|mm)\s+(?:(?:piece|knob)\s+(?:of\s+)?)?/i, "")
  s = s.replace(/^thumb[-\s]*sized?\s+(?:piece\s+(?:of\s+)?)?/i, "")
  s = s.replace(/^(?:knob|piece)\s+of\s+/i, "")

  // Strip trailing descriptors after comma
  s = s.replace(/,\s*(?:roughly|finely|thinly|coarsely|freshly|lightly|generously|gently)?\s*(?:chopped|diced|sliced|minced|grated|crushed|mashed|roasted|toasted|soaked|drained|rinsed|peeled|deseeded|halved|quartered|juiced|zested|melted|softened|crumbled|trimmed|shredded|cubed|defrosted|thawed|marinated|pickled|blanched|cooked|roughly broken|cut into\b.*).*$/i, "").trim()

  // Strip trailing context phrases (comma or whitespace before them)
  s = s.replace(/[,\s]+(?:to taste|optional|as needed|if needed|or to taste|or as needed|of your choice|your choice|adjust to taste|include the liquid|do not strain|or more|or less|for frying|for baking|for serving|for garnish|to serve|defrosted|thawed|cooked per package|per package)\s*$/i, "").trim()

  // Second trailing comma strip
  s = s.replace(/,\s*$/, "").trim()

  if (!s || WATER_RE.test(s)) return null

  const unitKeys = Object.keys(UNIT_MAP).sort((a, b) => b.length - a.length).join("|")
  const QTY = "[\u00bd\u00bc\u00be\u2153\u2154\u215b\\d]+(?:[\u2013\\-][\u00bd\u00bc\u00be\u2153\u2154\u215b\\d]+)?(?:[./]\\d+)?"

  // Pattern A: qty + unit + name
  const mA = s.match(new RegExp(`^(${QTY})\\s*(${unitKeys})\\b\\s+(.+)`, "i"))
  if (mA) {
    const name = normName(mA[3])
    const unit = UNIT_MAP[mA[2].toLowerCase()]
    if (!name || /^\d+$/.test(name) || WATER_RE.test(name) || isTitleLine(name)) return null
    return { qty: parseQuantityToken(mA[1]), unit, name, category: categorize(name) }
  }

  // Pattern B: qty only
  const mB = s.match(new RegExp(`^(${QTY})\\s+(.+)`))
  if (mB) {
    const rest = mB[2].trim()
    const mR = rest.match(new RegExp(`^(${QTY})\\s*(${unitKeys})\\b\\s+(.+)`, "i"))
    if (mR) {
      const name = normName(mR[3])
      const unit = UNIT_MAP[mR[2].toLowerCase()]
      if (!name || /^\d+$/.test(name) || WATER_RE.test(name) || isTitleLine(name)) return null
      return { qty: parseQuantityToken(mR[1]), unit, name, category: categorize(name) }
    }
    const name = normName(rest)
    if (!name || /^\d+$/.test(name) || WATER_RE.test(name) || isTitleLine(name)) return null
    return { qty: parseQuantityToken(mB[1]), unit: null, name, category: categorize(name) }
  }

  // Pattern C: unit word at start, no number
  const mC = s.match(new RegExp(`^(${unitKeys})\\s+(?:of\\s+)?(.+)`, "i"))
  if (mC) {
    const unit = UNIT_MAP[mC[1].toLowerCase()]
    const name = normName(mC[2])
    if (!name || /^\d+$/.test(name) || WATER_RE.test(name) || isTitleLine(name)) return null
    return { qty: null, unit, name, category: categorize(name) }
  }

  const name = normName(s)
  if (!name || /^\d+$/.test(name) || WATER_RE.test(name) || isTitleLine(name)) return null
  return { qty: null, unit: null, name, category: categorize(name) }
}

interface AggregatedItem { display: string; category: string }

function aggregateIngredients(rawItems: string[]): AggregatedItem[] {
  const parsed = rawItems.map(parseIngredient).filter(Boolean) as ParsedIngredient[]
  const map = new Map<string, { qty: number | null; unit: string | null; name: string; category: string }>()
  for (const p of parsed) {
    const key = `${p.name}||${p.unit ?? "none"}`
    const ex = map.get(key)
    if (ex) {
      if (ex.qty !== null && p.qty !== null) ex.qty += p.qty
    } else {
      map.set(key, { qty: p.qty, unit: p.unit, name: p.name, category: p.category })
    }
  }
  return Array.from(map.values()).map(g => {
    let display: string
    if (g.qty === null) {
      display = g.name
    } else if (g.unit) {
      const noSpace = ["g", "kg", "ml", "l"].includes(g.unit)
      display = `${formatQty(g.qty)}${noSpace ? "" : " "}${g.unit} ${g.name}`
    } else {
      display = `${formatQty(g.qty)} ${g.name}`
    }
    display = display.charAt(0).toUpperCase() + display.slice(1)
    return { display, category: g.category }
  }).sort((a, b) => a.display.localeCompare(b.display))
}

function printWindow(html: string, title: string) {
  const w = window.open("", "_blank")
  if (!w) { alert("Please allow pop-ups to print."); return }
  w.document.write(`<!DOCTYPE html><html><head><title>${title} | Vegan Side Project</title>
<style>
  body { font-family: -apple-system, sans-serif; padding: 24px; color: #222; max-width: 900px; margin: 0 auto }
  h1 { color: #6a994e; margin-bottom: 4px; font-size: 24px }
  h2 { color: #6a994e; margin-top: 32px; font-size: 18px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px }
  h3 { font-size: 14px; margin-top: 16px; margin-bottom: 4px }
  table { border-collapse: collapse; width: 100%; margin-top: 16px }
  th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; vertical-align: top; font-size: 13px }
  th { background: #f8f5f2; font-weight: 600 }
  ul, ol { margin: 4px 0; padding-left: 20px }
  li { font-size: 13px; margin-bottom: 3px }
  .reheat { font-size: 10px; background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 10px; margin-left: 6px }
  .empty { color: #9ca3af }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0 }
  .print-btn { background: #6a994e; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; margin-bottom: 20px }
  @media print { .print-btn { display: none } }
</style></head><body>
<button class="print-btn" onclick="window.print()">🖨 Print</button>
${html}
</body></html>`)
  w.document.close()
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MealPlanBuilder({ recipes }: { recipes: RecipeSnippet[] }) {
  const { user } = useAuth()
  const supabase = createClient()

  // Core state
  const [weekStart, setWeekStart] = useState<DayOfWeek>("monday")
  const [cookPrefs, setCookPrefs] = useState<CookPrefs>({ breakfast: 7, lunch: 7, dinner: 7, dessert: 7 })
  const [slots, setSlots] = useState<WeekSlots>(emptySlots)
  const [planName, setPlanName] = useState("My Meal Plan")
  const [savingPlan, setSavingPlan] = useState(false)
  const [savedPlans, setSavedPlans] = useState<{ id: string; name: string }[]>([])

  // Library state
  const [libOpen, setLibOpen] = useState(false)
  const [libFilter, setLibFilter] = useState<"all" | MealType>("all")
  const [libSearch, setLibSearch] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set())

  // Interaction state
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null)
  const [dragSrc, setDragSrc] = useState<{ day: DayOfWeek; meal: MealType } | null>(null)
  const [dragOver, setDragOver] = useState<{ day: DayOfWeek; meal: MealType } | null>(null)

  // Derived
  const days = useMemo(() => orderedDays(weekStart), [weekStart])

  const slotCounts = useMemo(() => {
    const c: CookPrefs = { breakfast: 0, lunch: 0, dinner: 0, dessert: 0 }
    for (const d of ALL_DAYS) for (const m of MEAL_TYPES) if (slots[d][m]) c[m]++
    return c
  }, [slots])

  const hasAnyRecipe = MEAL_TYPES.some(m => slotCounts[m] > 0)

  const hasEmptySlots = useMemo(
    () => ALL_DAYS.some(d => MEAL_TYPES.some(m => !slots[d][m])),
    [slots]
  )

  // ── Load user data ──
  useEffect(() => {
    if (!user) return
    supabase
      .from("meal_plan_bookmarks")
      .select("notion_recipe_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setBookmarked(new Set(data.map((r: any) => r.notion_recipe_id)))
      })
    supabase
      .from("meal_plans")
      .select("id, name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setSavedPlans(data) })
  }, [user])

  // ── Library filtering ──
  const filteredRecipes = useMemo(() => {
    let list = [...recipes]
    if (libSearch.trim()) {
      const q = libSearch.toLowerCase()
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.courses?.some((c: string) => c.toLowerCase().includes(q))
      )
    }
    if (libFilter !== "all") {
      list = list.filter(r => autoMealType(r) === libFilter)
    }
    list.sort((a, b) => {
      const diff = (bookmarked.has(b.id) ? 1 : 0) - (bookmarked.has(a.id) ? 1 : 0)
      return diff !== 0 ? diff : a.title.localeCompare(b.title)
    })
    return list
  }, [recipes, libSearch, libFilter, bookmarked])

  const suggestions = useMemo(() => {
    if (!libSearch.trim()) return []
    const q = libSearch.toLowerCase()
    return recipes
      .map(r => r.title)
      .filter(t => t.toLowerCase().includes(q))
      .slice(0, 5)
  }, [libSearch, recipes])

  // ── Add to plan ──
  async function addToSlot(recipe: RecipeSnippet) {
    setLoadingSlug(recipe.slug)
    try {
      const full = await fetchRecipeBySlug(recipe.slug) as RecipeFull
      if (!full) { setLoadingSlug(null); return }

      const meal = autoMealType(recipe)
      let targetDay = firstEmptyDay(slots, days, meal, cookPrefs[meal])

      if (!targetDay) {
        // Try any meal type
        for (const m of MEAL_TYPES) {
          targetDay = firstEmptyDay(slots, days, m, cookPrefs[m])
          if (targetDay) break
        }
      }

      if (!targetDay) {
        toast({ title: "All slots are filled", description: "Remove a recipe to make space." })
        return
      }

      const targetMeal = slots[targetDay][meal] === null ? meal
        : (MEAL_TYPES.find(m => !slots[targetDay!][m]) ?? meal)

      setSlots(prev => ({
        ...prev,
        [targetDay!]: { ...prev[targetDay!], [targetMeal]: { recipe: full, isReheat: false } },
      }))
    } finally {
      setLoadingSlug(null)
    }
  }

  function removeFromSlot(day: DayOfWeek, meal: MealType) {
    setSlots(prev => ({ ...prev, [day]: { ...prev[day], [meal]: null } }))
  }

  function addReheat(srcDay: DayOfWeek, srcMeal: MealType) {
    const src = slots[srcDay][srcMeal]
    if (!src) return
    for (const m of MEAL_TYPES) {
      for (const d of days) {
        if (!slots[d][m]) {
          setSlots(prev => ({ ...prev, [d]: { ...prev[d], [m]: { recipe: src.recipe, isReheat: true } } }))
          return
        }
      }
    }
    toast({ title: "No empty slots left" })
  }

  // ── Drag & Drop ──
  function handleDragStart(day: DayOfWeek, meal: MealType) { setDragSrc({ day, meal }) }

  function handleDragOver(e: React.DragEvent, day: DayOfWeek, meal: MealType) {
    e.preventDefault()
    setDragOver({ day, meal })
  }

  function handleDrop(day: DayOfWeek, meal: MealType) {
    if (!dragSrc || (dragSrc.day === day && dragSrc.meal === meal)) {
      setDragSrc(null); setDragOver(null); return
    }
    setSlots(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as WeekSlots
      const a = next[dragSrc.day][dragSrc.meal]
      const b = next[day][meal]
      next[dragSrc.day][dragSrc.meal] = b
      next[day][meal] = a
      return next
    })
    setDragSrc(null); setDragOver(null)
  }

  function handleDragEnd() { setDragSrc(null); setDragOver(null) }

  // ── Bookmark ──
  async function toggleBookmark(recipe: RecipeSnippet) {
    if (!user) { toast({ title: "Sign in to bookmark recipes" }); return }
    const has = bookmarked.has(recipe.id)
    if (has) {
      await supabase.from("meal_plan_bookmarks").delete().eq("user_id", user.id).eq("notion_recipe_id", recipe.id)
      setBookmarked(prev => { const n = new Set(prev); n.delete(recipe.id); return n })
    } else {
      await supabase.from("meal_plan_bookmarks").upsert({
        user_id: user.id, notion_recipe_id: recipe.id, recipe_title: recipe.title,
        recipe_slug: recipe.slug, recipe_image: recipe.image,
        recipe_category: autoMealType(recipe), recipe_cook_time: recipe.cookTime,
      })
      setBookmarked(prev => new Set([...prev, recipe.id]))
    }
  }

  // ── Save / Load plan ──
  async function savePlan() {
    if (!user) { toast({ title: "Sign in to save plans" }); return }
    setSavingPlan(true)
    try {
      const { data, error } = await supabase
        .from("meal_plans")
        .insert({ user_id: user.id, name: planName, week_start_day: weekStart, cook_preferences: cookPrefs, slots })
        .select("id, name")
        .single()
      if (error) throw error
      setSavedPlans(prev => [data, ...prev])
      toast({ title: "Plan saved!", description: `"${planName}" saved to your profile.` })
    } catch {
      toast({ title: "Error saving plan", variant: "destructive" })
    } finally {
      setSavingPlan(false)
    }
  }

  async function loadPlan(planId: string) {
    const { data } = await supabase.from("meal_plans").select("*").eq("id", planId).single()
    if (!data) return
    setSlots(data.slots)
    setWeekStart(data.week_start_day)
    setCookPrefs(data.cook_preferences)
    setPlanName(data.name)
    toast({ title: `Loaded "${data.name}"` })
  }

  // ── Export helpers ──
  function uniqueRecipes(): RecipeFull[] {
    const seen = new Set<string>()
    const list: RecipeFull[] = []
    for (const m of MEAL_TYPES) {
      for (const d of days) {
        const e = slots[d][m]
        if (e && !e.isReheat && !seen.has(e.recipe.slug)) {
          seen.add(e.recipe.slug)
          list.push(e.recipe)
        }
      }
    }
    return list
  }

  function buildShoppingList() {
    const allRaw: string[] = []
    for (const r of uniqueRecipes()) {
      for (const section of r.ingredientSections || []) allRaw.push(...section.items)
    }
    const items = aggregateIngredients(allRaw)
    const grouped: Record<string, AggregatedItem[]> = {}
    for (const item of items) {
      if (!grouped[item.category]) grouped[item.category] = []
      grouped[item.category].push(item)
    }
    return { flat: items, grouped }
  }

  // ── Print functions ──
  function doPrintCalendar() {
    const headers = days.map(d => `<th>${DAY_FULL[d]}</th>`).join("")
    const rows = MEAL_TYPES.map(meal => {
      const cells = days.map(d => {
        const e = slots[d][meal]
        if (!e) return `<td class="empty">—</td>`
        return `<td>${e.recipe.title}${e.isReheat ? '<span class="reheat">Reheat</span>' : ""}</td>`
      }).join("")
      return `<tr><th>${MEAL_LABELS[meal]}</th>${cells}</tr>`
    }).join("")
    printWindow(
      `<h1>${planName}</h1><table><thead><tr><th>Meal</th>${headers}</tr></thead><tbody>${rows}</tbody></table>`,
      planName
    )
  }

  function doPrintRecipes() {
    const html = uniqueRecipes().map(r => {
      const ings = (r.ingredientSections || []).map(s =>
        (s.subtitle ? `<strong>${s.subtitle}</strong>` : "") +
        `<ul>${s.items.map(i => `<li>${i}</li>`).join("")}</ul>`
      ).join("")
      const steps = (r.instructions || [])
        .filter(i => i.type === "step")
        .map((i, idx) => `<li>${i.content}</li>`)
        .join("")
      return `<h2>${r.title}</h2>
        ${r.description ? `<p>${r.description}</p>` : ""}
        ${r.prepTime ? `<p style="font-size:13px;color:#666">Prep: ${r.prepTime} · Cook: ${r.cookTime} · Serves: ${r.serves}</p>` : ""}
        <h3>Ingredients</h3>${ings}
        <h3>Instructions</h3><ol>${steps}</ol><hr/>`
    }).join("")
    printWindow(`<h1>${planName} — All Recipes</h1>${html}`, `${planName} Recipes`)
  }

  function doPrintShopping(grouped: boolean) {
    const { flat, grouped: groupedData } = buildShoppingList()
    let html = `<h1>${planName} — Shopping List</h1><p style="color:#666;font-size:13px;margin-bottom:8px">${flat.length} items across ${uniqueRecipes().length} recipes</p>`
    if (grouped) {
      html += Object.keys(groupedData).sort().map(cat =>
        `<h2>${cat}</h2><ul>${groupedData[cat].map(i => `<li>${i.display}</li>`).join("")}</ul>`
      ).join("")
    } else {
      html += `<ul>${flat.map(i => `<li>${i.display}</li>`).join("")}</ul>`
    }
    printWindow(html, `${planName} Shopping List`)
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="container py-10 max-w-7xl">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <Button variant="ghost" asChild size="sm">
          <Link href="/meal-plans"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight flex-1">Build Your Meal Plan</h1>
        {user ? (
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              value={planName}
              onChange={e => setPlanName(e.target.value)}
              className="w-44 h-9 text-sm"
              placeholder="Plan name"
            />
            <Button size="sm" onClick={savePlan} disabled={savingPlan || !hasAnyRecipe} className="bg-[#6a994e] hover:bg-[#5a8540]">
              {savingPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" />Save</>}
            </Button>
            {savedPlans.length > 0 && (
              <select
                className="h-9 text-sm border rounded-md px-2 bg-background"
                onChange={e => e.target.value && loadPlan(e.target.value)}
                defaultValue=""
              >
                <option value="">Load saved plan…</option>
                {savedPlans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="text-[#6a994e] hover:underline">Sign in</Link> to save plans
          </p>
        )}
      </div>

      {/* ── Section 1: Cook Preferences ── */}
      <div className="bg-[#f8f5f2] rounded-lg p-6 mb-6">
        <h2 className="font-semibold text-base mb-4">Cook Preferences</h2>
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <label className="text-sm font-medium block mb-1">Week starts on</label>
            <select
              value={weekStart}
              onChange={e => setWeekStart(e.target.value as DayOfWeek)}
              className="h-9 text-sm border rounded-md px-3 bg-background"
            >
              {ALL_DAYS.map(d => <option key={d} value={d}>{DAY_FULL[d]}</option>)}
            </select>
          </div>
          {MEAL_TYPES.map(meal => (
            <div key={meal}>
              <label className="text-sm font-medium block mb-1">{MEAL_LABELS[meal]} days / week</label>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8 text-base"
                  onClick={() => setCookPrefs(p => ({ ...p, [meal]: Math.max(0, p[meal] - 1) }))}>−</Button>
                <span className="w-8 text-center font-semibold tabular-nums">{cookPrefs[meal]}</span>
                <Button variant="outline" size="icon" className="h-8 w-8 text-base"
                  onClick={() => setCookPrefs(p => ({ ...p, [meal]: Math.min(7, p[meal] + 1) }))}>+</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Recipe Library ── */}
      <div className="border rounded-lg mb-6">
        <button
          className="w-full flex items-center justify-between px-6 py-4 font-semibold text-left hover:bg-muted/40 transition-colors rounded-lg"
          onClick={() => setLibOpen(o => !o)}
        >
          <span className="flex items-center gap-2">
            Recipe Library
            <span className="text-muted-foreground font-normal text-sm">({recipes.length} recipes{bookmarked.size > 0 ? `, ${bookmarked.size} bookmarked` : ""})</span>
          </span>
          {libOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
        </button>

        {libOpen && (
          <div className="px-6 pb-6 border-t">
            {/* Search + filter row */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={libSearch}
                  onChange={e => { setLibSearch(e.target.value); setShowSuggestions(true) }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Search recipes..."
                  className="w-full h-9 pl-9 pr-8 text-sm border rounded-md bg-background outline-none focus:ring-2 focus:ring-[#6a994e]/30"
                />
                {libSearch && (
                  <button className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setLibSearch("")}>
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 overflow-hidden">
                    {suggestions.map((s, i) => (
                      <button key={i} className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2"
                        onMouseDown={() => { setLibSearch(s); setShowSuggestions(false) }}>
                        <Search className="h-3 w-3 text-muted-foreground shrink-0" />{s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1 flex-wrap">
                {(["all", ...MEAL_TYPES] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setLibFilter(f)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${libFilter === f ? "bg-[#6a994e] text-white border-[#6a994e]" : "bg-background border-gray-200 hover:bg-muted"}`}
                  >
                    {f === "all" ? "All" : MEAL_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipe cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-72 overflow-y-auto pr-1">
              {filteredRecipes.map(recipe => (
                <div key={recipe.id} className="border rounded-lg overflow-hidden bg-card flex flex-col">
                  <div className="relative">
                    <img src={recipe.image || "/placeholder.svg"} alt={recipe.title} className="w-full h-20 object-cover" />
                    <button
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-white/80 hover:bg-white shadow-sm"
                      onClick={() => toggleBookmark(recipe)}
                      title={bookmarked.has(recipe.id) ? "Remove bookmark" : "Bookmark"}
                    >
                      {bookmarked.has(recipe.id)
                        ? <BookmarkCheck className="h-3.5 w-3.5 text-[#6a994e]" />
                        : <Bookmark className="h-3.5 w-3.5 text-gray-400" />}
                    </button>
                  </div>
                  <div className="p-2 flex flex-col flex-1">
                    <p className="text-xs font-medium leading-tight line-clamp-2 mb-1 flex-1">{recipe.title}</p>
                    {recipe.cookTime && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mb-1.5">
                        <Clock className="h-2.5 w-2.5" />{recipe.cookTime}
                      </p>
                    )}
                    <button
                      disabled={loadingSlug === recipe.slug}
                      onClick={() => addToSlot(recipe)}
                      className="w-full h-6 text-xs font-medium rounded bg-[#6a994e] hover:bg-[#5a8540] text-white disabled:opacity-50 flex items-center justify-center gap-1 transition-colors"
                    >
                      {loadingSlug === recipe.slug
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <><Plus className="h-3 w-3" />Add</>}
                    </button>
                  </div>
                </div>
              ))}
              {filteredRecipes.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground text-sm">No recipes found.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Progress counters ── */}
      <div className="flex flex-wrap gap-4 mb-4">
        {MEAL_TYPES.map(meal => {
          const filled = slotCounts[meal]
          const target = cookPrefs[meal]
          const done = filled >= target
          return (
            <div key={meal} className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border ${done ? "bg-green-50 border-green-200 text-green-700" : "bg-background border-gray-200 text-muted-foreground"}`}>
              <span className="font-medium">{MEAL_LABELS[meal]}</span>
              <span className="tabular-nums">{filled}/{target}</span>
              {done && <Check className="h-3.5 w-3.5" />}
            </div>
          )
        })}
      </div>

      {/* ── Section 3: Week Grid ── */}
      <div className="overflow-x-auto rounded-lg border">
        <div style={{ minWidth: 720 }}>
          {/* Day headers */}
          <div className="grid grid-cols-8 bg-[#f8f5f2]">
            <div className="p-3 text-xs font-semibold text-muted-foreground border-r border-b" />
            {days.map(d => (
              <div key={d} className="p-3 text-xs font-semibold text-center border-r border-b last:border-r-0">{DAY_FULL[d]}</div>
            ))}
          </div>

          {/* Meal rows */}
          {MEAL_TYPES.map((meal, mealIdx) => (
            <div key={meal} className={`grid grid-cols-8 ${mealIdx < MEAL_TYPES.length - 1 ? "border-b" : ""}`}>
              {/* Row label */}
              <div className="flex items-center justify-center p-3 text-xs font-semibold text-muted-foreground border-r bg-[#f8f5f2]/60">
                {MEAL_LABELS[meal]}
              </div>

              {/* Day slots */}
              {days.map((day, dayIdx) => {
                const entry = slots[day][meal]
                const isActive = dayIdx < cookPrefs[meal]
                const isDragOver = dragOver?.day === day && dragOver?.meal === meal
                const isDragSrc = dragSrc?.day === day && dragSrc?.meal === meal

                return (
                  <div
                    key={day}
                    className={`min-h-[110px] border-r last:border-r-0 p-1.5 transition-colors
                      ${!isActive ? "bg-gray-50/80" : ""}
                      ${isDragOver ? "bg-[#6a994e]/10 border-[#6a994e]" : ""}
                      ${isDragSrc ? "opacity-40" : ""}`}
                    onDragOver={e => isActive && handleDragOver(e, day, meal)}
                    onDrop={() => isActive && handleDrop(day, meal)}
                  >
                    {entry ? (
                      <div
                        draggable
                        onDragStart={() => handleDragStart(day, meal)}
                        onDragEnd={handleDragEnd}
                        className="rounded bg-white border shadow-sm h-full cursor-grab active:cursor-grabbing overflow-hidden"
                      >
                        <div className="relative">
                          <img
                            src={entry.recipe.image || "/placeholder.svg"}
                            alt={entry.recipe.title}
                            className="w-full h-14 object-cover"
                          />
                          {entry.isReheat && (
                            <span className="absolute top-0.5 left-0.5 bg-amber-500 text-white text-[9px] px-1 py-0.5 rounded font-semibold">
                              Reheat
                            </span>
                          )}
                          <button
                            className="absolute top-0.5 right-0.5 bg-black/40 hover:bg-black/60 text-white rounded-full p-0.5"
                            onClick={() => removeFromSlot(day, meal)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="p-1.5">
                          <p className="text-[10px] font-medium leading-tight line-clamp-2">{entry.recipe.title}</p>
                          {hasEmptySlots && !entry.isReheat && (
                            <button
                              className="mt-1 text-[9px] text-[#6a994e] hover:underline flex items-center gap-0.5"
                              onClick={() => addReheat(day, meal)}
                            >
                              <RefreshCw className="h-2.5 w-2.5" /> Reheat
                            </button>
                          )}
                        </div>
                      </div>
                    ) : isActive ? (
                      <div className="h-full flex items-center justify-center text-[10px] text-gray-300 border-2 border-dashed border-gray-200 rounded min-h-[90px]">
                        Empty
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center min-h-[90px]">
                        <span className="text-[10px] text-gray-200">—</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 4: Export ── */}
      {hasAnyRecipe && (
        <div className="mt-8 p-6 bg-[#f8f5f2] rounded-lg">
          <h2 className="font-semibold text-base mb-4">Export Your Plan</h2>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="outline" onClick={doPrintCalendar}>
              <Calendar className="h-4 w-4 mr-2" />Print Calendar
            </Button>
            <Button variant="outline" onClick={doPrintRecipes}>
              <Printer className="h-4 w-4 mr-2" />Print Recipes
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => doPrintShopping(true)}>
                <ShoppingCart className="h-4 w-4 mr-2" />Shopping List (grouped)
              </Button>
              <Button variant="outline" onClick={() => doPrintShopping(false)}>
                <ShoppingCart className="h-4 w-4 mr-2" />Shopping List (flat)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

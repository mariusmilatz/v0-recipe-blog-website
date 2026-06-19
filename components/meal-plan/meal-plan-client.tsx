"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Printer, ShoppingBag, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ServingsAdjuster } from "./servings-adjuster"

// Convert a meal title to a recipe slug (same logic used in the recipe pages)
function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// Only link if the meal has a real title (not "No meal" or empty)
function isRealMeal(title: string): boolean {
  return !!title && title.toLowerCase() !== "no meal" && title.trim() !== ""
}

export default function MealPlanClient({ mealPlan }) {
  const [activeDay, setActiveDay] = useState("monday")
  const [activeImage, setActiveImage] = useState(0)
  const defaultServings = mealPlan.serves || mealPlan.servings || 4
  const [servings, setServings] = useState(defaultServings)
  const [adjustedShoppingList, setAdjustedShoppingList] = useState({
    produce: mealPlan.shoppingList?.produce || "",
    refrigerated: mealPlan.shoppingList?.refrigerated || "",
    pantry: mealPlan.shoppingList?.pantry || "",
    spices: mealPlan.shoppingList?.spices || "",
  })

  useEffect(() => {
    const originalServings = mealPlan.serves || mealPlan.servings || 4
    const ratio = servings / originalServings

    const adjustQuantities = (list) => {
      if (!list) return ""

      return list
        .split(",")
        .map((item) => {
          const match = item.trim().match(/^(\d+(?:\.\d+)?(?:\s*\/\s*\d+)?)\s*(.+)$/)
          if (match) {
            const [_, quantity, rest] = match
            if (quantity.includes("/")) {
              const [numerator, denominator] = quantity.split("/").map((n) => Number.parseFloat(n.trim()))
              const decimal = numerator / denominator
              const adjusted = decimal * ratio

              let formattedQuantity
              if (adjusted === Math.floor(adjusted)) {
                formattedQuantity = adjusted.toString()
              } else if (adjusted < 1) {
                const gcd = (a, b) => (b ? gcd(b, a % b) : a)
                const precision = 100
                const numerator = Math.round(adjusted * precision)
                const denominator = precision
                const divisor = gcd(numerator, denominator)
                formattedQuantity = `${numerator / divisor}/${denominator / divisor}`
              } else {
                const whole = Math.floor(adjusted)
                const fraction = adjusted - whole
                if (fraction === 0) {
                  formattedQuantity = whole.toString()
                } else {
                  const gcd = (a, b) => (b ? gcd(b, a % b) : a)
                  const precision = 100
                  const numerator = Math.round(fraction * precision)
                  const denominator = precision
                  const divisor = gcd(numerator, denominator)
                  formattedQuantity = `${whole} ${numerator / divisor}/${denominator / divisor}`
                }
              }

              return `${formattedQuantity} ${rest}`
            } else {
              const adjusted = Number.parseFloat(quantity) * ratio
              return `${adjusted % 1 === 0 ? adjusted : adjusted.toFixed(1)} ${rest}`
            }
          }
          return item
        })
        .join(", ")
    }

    setAdjustedShoppingList({
      produce: adjustQuantities(mealPlan.shoppingList?.produce),
      refrigerated: adjustQuantities(mealPlan.shoppingList?.refrigerated),
      pantry: adjustQuantities(mealPlan.shoppingList?.pantry),
      spices: adjustQuantities(mealPlan.shoppingList?.spices),
    })
  }, [servings, mealPlan])

  const formatShoppingList = (listText) => {
    if (!listText) return []
    return listText
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item)
  }

  const formatMealPrepTips = (tipsText) => {
    if (!tipsText) return []
    return tipsText
      .split(/•|\n/)
      .map((tip) => tip.trim())
      .filter((tip) => tip)
  }

  const produceItems = formatShoppingList(adjustedShoppingList.produce)
  const refrigeratedItems = formatShoppingList(adjustedShoppingList.refrigerated)
  const pantryItems = formatShoppingList(adjustedShoppingList.pantry)
  const spicesItems = formatShoppingList(adjustedShoppingList.spices)
  const mealPrepTips = formatMealPrepTips(mealPlan.mealPrepTips)

  const hasMealImages = mealPlan.mealImages && mealPlan.mealImages.length > 0

  const goToPreviousImage = () => {
    if (!hasMealImages) return
    setActiveImage((prev) => (prev === 0 ? mealPlan.mealImages.length - 1 : prev - 1))
  }

  const goToNextImage = () => {
    if (!hasMealImages) return
    setActiveImage((prev) => (prev === mealPlan.mealImages.length - 1 ? 0 : prev + 1))
  }

  const handlePrintMealPlan = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${mealPlan.title} - Meal Plan</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: system-ui, sans-serif; line-height: 1.5; padding: 2rem; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 1.5rem; margin-bottom: 1rem; }
          h2 { font-size: 1.25rem; margin-top: 2rem; margin-bottom: 0.5rem; }
          h3 { font-size: 1rem; margin-top: 1rem; margin-bottom: 0.5rem; }
          .day { margin-bottom: 2rem; border: 1px solid #ddd; padding: 1rem; border-radius: 0.5rem; }
          .meal { margin-bottom: 1rem; }
          .meal-title { font-weight: bold; }
          .meal-time { color: #666; font-size: 0.875rem; }
          .footer { margin-top: 2rem; text-align: center; font-size: 0.75rem; color: #666; }
          @media print { body { padding: 0; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 1rem;">
          <button onclick="window.print()">Print</button>
          <button onclick="window.close()">Close</button>
        </div>
        <h1>${mealPlan.title}</h1>
        <p>A 7-day meal plan for ${servings} ${servings === 1 ? "person" : "people"}</p>
        ${Object.entries(mealPlan.meals)
          .map(
            ([day, meals]) => `
          <div class="day">
            <h2 style="text-transform: capitalize;">${day}</h2>
            ${Object.entries(meals)
              .map(
                ([mealType, meal]) => `
              <div class="meal">
                <h3 style="text-transform: capitalize;">${mealType}</h3>
                <div class="meal-title">${meal.title}</div>
                ${meal.time ? `<div class="meal-time">${meal.time}</div>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        `,
          )
          .join("")}
        <div class="footer"><p>Vegan Side Project - ${new Date().toLocaleDateString()}</p></div>
        <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };</script>
      </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(content)
    printWindow.document.close()
  }

  const handlePrintGroceryList = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${mealPlan.title} - Grocery List</title>
        <meta charset="utf-8" />
        <style>
          body { font-family: system-ui, sans-serif; line-height: 1.5; padding: 2rem; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 1.5rem; margin-bottom: 1rem; }
          h2 { font-size: 1.25rem; margin-top: 2rem; margin-bottom: 0.5rem; }
          ul { padding-left: 1.5rem; }
          li { margin-bottom: 0.25rem; }
          .section { margin-bottom: 1.5rem; }
          .footer { margin-top: 2rem; text-align: center; font-size: 0.75rem; color: #666; }
          @media print { body { padding: 0; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 1rem;">
          <button onclick="window.print()">Print</button>
          <button onclick="window.close()">Close</button>
        </div>
        <h1>${mealPlan.title} - Grocery List</h1>
        <p>Shopping list for ${servings} ${servings === 1 ? "person" : "people"}</p>
        ${produceItems.length > 0 ? `<div class="section"><h2>Produce</h2><ul>${produceItems.map((item) => `<li>${item}</li>`).join("")}</ul></div>` : ""}
        ${pantryItems.length > 0 ? `<div class="section"><h2>Pantry</h2><ul>${pantryItems.map((item) => `<li>${item}</li>`).join("")}</ul></div>` : ""}
        ${refrigeratedItems.length > 0 ? `<div class="section"><h2>Refrigerated</h2><ul>${refrigeratedItems.map((item) => `<li>${item}</li>`).join("")}</ul></div>` : ""}
        ${spicesItems.length > 0 ? `<div class="section"><h2>Spices & Seasonings</h2><ul>${spicesItems.map((item) => `<li>${item}</li>`).join("")}</ul></div>` : ""}
        <div class="footer"><p>Vegan Side Project - ${new Date().toLocaleDateString()}</p></div>
        <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };</script>
      </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(content)
    printWindow.document.close()
  }

  return (
    <div className="container py-10">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/meal-plans">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Meal Plans
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{mealPlan.title}</h1>
              <p className="text-muted-foreground mt-2">
                A complete 7-day meal plan with breakfast, lunch, and dinner for each day.
              </p>
            </div>

            {hasMealImages ? (
              <div className="space-y-4">
                <div className="relative aspect-video overflow-hidden rounded-lg group">
                  <img
                    src={mealPlan.mealImages[activeImage] || "/placeholder.svg"}
                    alt={`Meal image ${activeImage + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {mealPlan.mealImages.length > 1 && (
                    <>
                      <button
                        onClick={goToPreviousImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={goToNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                        {activeImage + 1} / {mealPlan.mealImages.length}
                      </div>
                    </>
                  )}
                </div>
                {mealPlan.mealImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {mealPlan.mealImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImage(index)}
                        className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden ${
                          activeImage === index ? "ring-2 ring-[#6a994e]" : "opacity-70"
                        }`}
                      >
                        <img src={image || "/placeholder.svg"} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video overflow-hidden rounded-lg bg-[#f8f5f2] flex items-center justify-center">
                <Calendar className="h-20 w-20 text-[#6a994e]" />
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-[#6a994e]" />
                <span>7 days</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-[#6a994e]" />
                <span>21 meals</span>
              </div>
            </div>

            <ServingsAdjuster defaultServings={defaultServings} onChange={setServings} />

            <Tabs defaultValue="meal-plan">
              <TabsList>
                <TabsTrigger value="meal-plan">Meal Plan</TabsTrigger>
                <TabsTrigger value="grocery-list">Grocery List</TabsTrigger>
                <TabsTrigger value="prep-tips">Prep Tips</TabsTrigger>
              </TabsList>

              <TabsContent value="meal-plan" className="mt-6">
                <div className="space-y-6">
                  {Object.entries(mealPlan.meals).map(([day, meals]) => (
                    <Card key={day}>
                      <CardHeader>
                        <CardTitle className="capitalize">{day}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.entries(meals).map(([mealType, meal]) => (
                            <div key={mealType}>
                              <h3 className="font-medium text-sm text-muted-foreground mb-2 capitalize">{mealType}</h3>
                              <div className="flex justify-between items-center">
                                {isRealMeal(meal.title) ? (
                                  <Link
                                    href={`/recipes/${titleToSlug(meal.title)}`}
                                    className="font-medium text-[#6a994e] hover:underline flex items-center gap-1 group"
                                  >
                                    {meal.title}
                                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </Link>
                                ) : (
                                  <span className="font-medium text-muted-foreground">{meal.title}</span>
                                )}
                                <span className="text-sm text-muted-foreground">{meal.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="grocery-list" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Grocery List</CardTitle>
                    <CardDescription>Everything you need for this week's meals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {produceItems.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Produce</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            {produceItems.map((item, index) => <li key={index}>{item}</li>)}
                          </ul>
                        </div>
                      )}
                      {pantryItems.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Pantry</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            {pantryItems.map((item, index) => <li key={index}>{item}</li>)}
                          </ul>
                        </div>
                      )}
                      {refrigeratedItems.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Refrigerated</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            {refrigeratedItems.map((item, index) => <li key={index}>{item}</li>)}
                          </ul>
                        </div>
                      )}
                      {spicesItems.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Spices & Seasonings</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            {spicesItems.map((item, index) => <li key={index}>{item}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prep-tips" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Meal Prep Tips</CardTitle>
                    <CardDescription>Save time with these preparation strategies</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                      {mealPrepTips.length > 0 ? (
                        mealPrepTips.map((tip, index) => <li key={index}>{tip}</li>)
                      ) : (
                        <>
                          <li>Prep vegetables for multiple meals at once to save time during the week.</li>
                          <li>Cook grains like rice and quinoa in larger batches to use throughout the week.</li>
                          <li>Make sauces and dressings ahead of time and store in the refrigerator for up to 5 days.</li>
                          <li>Wash and dry salad greens, then store with a paper towel in an airtight container to keep fresh.</li>
                          <li>Consider batch cooking some components on Sunday to make weeknight meals come together more quickly.</li>
                        </>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Print</CardTitle>
              <CardDescription>Save this meal plan for offline use</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={handlePrintMealPlan}>
                <Printer className="mr-2 h-4 w-4" />
                Print Meal Plan
              </Button>
              <Button variant="outline" className="w-full" onClick={handlePrintGroceryList}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Print Grocery List
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nutritional Information</CardTitle>
              <CardDescription>Average daily values</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nutrient</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">% Daily Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Calories</TableCell>
                    <TableCell className="text-right">{mealPlan.nutritionalInfo?.calories.amount || "2100"}</TableCell>
                    <TableCell className="text-right">{mealPlan.nutritionalInfo?.calories.percentage || "-"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Protein</TableCell>
                    <TableCell className="text-right">{mealPlan.nutritionalInfo?.protein.amount || "75g"}</TableCell>
                    <TableCell className="text-right">{mealPlan.nutritionalInfo?.protein.percentage || "150%"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Carbohydrates</TableCell>
                    <TableCell className="text-right">{mealPlan.nutritionalInfo?.carbohydrates.amount || "280g"}</TableCell>
                    <TableCell className="text-right">{mealPlan.nutritionalInfo?.carbohydrates.percentage || "93%"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Fat</TableCell>
                    <TableCell className="text-right">{mealPlan.nutritionalInfo?.fat.amount || "70g"}</TableCell>
                    <TableCell className="text-right">{mealPlan.nutritionalInfo?.fat.percentage || "108%"}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Fiber</TableCell>
                    <TableCell className="text-right">{mealPlan.nutritionalInfo?.fiber.amount || "35g"}</TableCell>
                    <TableCell className="text-right">{mealPlan.nutritionalInfo?.fiber.percentage || "140%"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <p className="text-xs text-muted-foreground mt-4">
                Values are approximate and based on a 2,000 calorie diet. Individual needs may vary.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customization Tips</CardTitle>
              <CardDescription>Adapt this plan to your needs</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li><span className="font-medium">For higher protein:</span> Add tofu, tempeh, or legumes to meals, or include protein smoothies as snacks.</li>
                <li><span className="font-medium">For gluten-free:</span> Substitute pasta with gluten-free alternatives and use gluten-free bread and tortillas.</li>
                <li><span className="font-medium">For lower budget:</span> Focus on the pantry staples and seasonal produce; frozen vegetables can be substituted for fresh.</li>
                <li><span className="font-medium">For non-vegans:</span> These meals work well as sides with animal protein if cooking for mixed dietary preferences.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

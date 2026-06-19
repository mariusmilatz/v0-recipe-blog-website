"use client"

import { useState } from "react"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PrintRecipeProps {
  recipe: any
  adjustedServings?: number | null
  adjustedIngredients?: string[][]
}

// Strip the leading "- " that Notion stores on ingredient lines
function cleanIngredient(item: string): string {
  return item.replace(/^\s*-\s*/, "").trim()
}

// Build the instructions HTML, handling { type: "step" | "subtitle", content } objects
function buildInstructionsHtml(instructions: any[]): string {
  if (!instructions || instructions.length === 0) return ""

  let html = ""
  let inList = false
  let stepNumber = 0

  for (const item of instructions) {
    // Support both plain strings (legacy) and {type, content} objects
    if (typeof item === "string") {
      if (!inList) { html += "<ol>"; inList = true }
      stepNumber++
      html += `<li>${item}</li>`
    } else if (item?.type === "subtitle") {
      if (inList) { html += "</ol>"; inList = false; stepNumber = 0 }
      html += `<h3>${item.content}</h3>`
    } else {
      if (!inList) { html += "<ol>"; inList = true }
      stepNumber++
      html += `<li>${item.content || ""}</li>`
    }
  }

  if (inList) html += "</ol>"
  return html
}

export function PrintRecipe({ recipe, adjustedServings, adjustedIngredients }: PrintRecipeProps) {
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = () => {
    if (isPrinting) return
    setIsPrinting(true)

    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Please allow popups for this website to print recipes.")
      setIsPrinting(false)
      return
    }

    const currentDate = new Date().toLocaleDateString()
    const servingSize = adjustedServings || (recipe.serves ? Number.parseInt(recipe.serves) : 2)

    const ingredientsHtml =
      recipe.ingredientSections && recipe.ingredientSections.length > 0
        ? `<h2>Ingredients</h2>
           ${recipe.ingredientSections
             .map((section: any, sectionIndex: number) => {
               const items: string[] =
                 adjustedServings && adjustedIngredients && adjustedIngredients[sectionIndex]
                   ? adjustedIngredients[sectionIndex]
                   : section.items

               return `
                 ${section.subtitle ? `<h3>${section.subtitle}</h3>` : ""}
                 <ul>
                   ${items.map((item) => `<li>${cleanIngredient(item)}</li>`).join("")}
                 </ul>`
             })
             .join("")}`
        : ""

    const instructionsHtml =
      recipe.instructions && recipe.instructions.length > 0
        ? `<h2>Instructions</h2>${buildInstructionsHtml(recipe.instructions)}`
        : ""

    const tipsHtml =
      recipe.tips && recipe.tips.length > 0
        ? `<h2>Tips & Notes</h2><ul>${recipe.tips.map((tip: string) => `<li>${tip}</li>`).join("")}</ul>`
        : ""

    const printContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${recipe.title} | Vegan Side Project</title>
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: Georgia, serif;
            line-height: 1.6;
            color: #222;
            max-width: 720px;
            margin: 0 auto;
            padding: 2rem;
            font-size: 15px;
          }
          h1 { font-size: 1.6rem; margin-bottom: 0.5rem; color: #1a1a1a; }
          h2 {
            font-family: system-ui, sans-serif;
            font-size: 1rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #6a994e;
            margin: 1.75rem 0 0.6rem;
            border-bottom: 2px solid #6a994e;
            padding-bottom: 0.3rem;
          }
          h3 {
            font-family: system-ui, sans-serif;
            font-size: 0.85rem;
            font-weight: 700;
            color: #444;
            margin: 1rem 0 0.3rem;
          }
          p { margin-bottom: 0.75rem; color: #444; font-style: italic; }
          .meta {
            display: flex;
            flex-wrap: wrap;
            gap: 1.25rem;
            margin: 0.75rem 0 1.5rem;
            font-size: 0.85rem;
            font-family: system-ui, sans-serif;
            color: #666;
          }
          ul { padding-left: 1.4rem; margin-bottom: 0.5rem; }
          ol { padding-left: 1.4rem; margin-bottom: 0.5rem; }
          li { margin-bottom: 0.4rem; font-size: 0.92rem; }
          ol li { margin-bottom: 0.6rem; }
          .footer {
            margin-top: 2.5rem;
            font-size: 0.75rem;
            text-align: center;
            color: #aaa;
            font-family: system-ui, sans-serif;
            border-top: 1px solid #eee;
            padding-top: 1rem;
          }
          @media print { body { padding: 0.5rem; } }
        </style>
      </head>
      <body>
        <h1>${recipe.title}</h1>
        ${recipe.description ? `<p>${recipe.description}</p>` : ""}
        <div class="meta">
          ${recipe.prepTime ? `<span>Prep: ${recipe.prepTime}</span>` : ""}
          ${recipe.cookTime ? `<span>Cook: ${recipe.cookTime}</span>` : ""}
          <span>Serves: ${servingSize}</span>
          ${recipe.cuisine ? `<span>Cuisine: ${recipe.cuisine}</span>` : ""}
        </div>
        ${ingredientsHtml}
        ${instructionsHtml}
        ${tipsHtml}
        <div class="footer">Vegan Side Project · Printed on ${currentDate}</div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(printContent)
    printWindow.document.close()

    setTimeout(() => setIsPrinting(false), 1000)
  }

  return (
    <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handlePrint} disabled={isPrinting}>
      <Printer className="h-4 w-4" />
      {isPrinting ? "Preparing..." : "Print Recipe"}
    </Button>
  )
}

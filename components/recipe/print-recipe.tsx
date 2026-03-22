"use client"

import { useState } from "react"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PrintRecipeProps {
  recipe: any
  adjustedServings?: number | null
  adjustedIngredients?: string[][]
}

export function PrintRecipe({ recipe, adjustedServings, adjustedIngredients }: PrintRecipeProps) {
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = () => {
    if (isPrinting) return
    setIsPrinting(true)

    // Create a new window for printing
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Please allow popups for this website to print recipes.")
      setIsPrinting(false)
      return
    }

    // Get the current date
    const currentDate = new Date().toLocaleDateString()

    // Determine the serving size to display
    const servingSize = adjustedServings || (recipe.serves ? Number.parseInt(recipe.serves) : 2)

    // Generate the HTML content for printing
    const printContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${recipe.title} | Vegan Side Project</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            font-size: 24px;
            margin-bottom: 10px;
          }
          h2 {
            font-size: 20px;
            margin-top: 20px;
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          h3 {
            font-size: 18px;
            margin-top: 15px;
            margin-bottom: 10px;
            color: #6a994e;
          }
          p {
            margin-bottom: 10px;
          }
          .recipe-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin: 15px 0;
            font-size: 14px;
          }
          .recipe-meta div {
            display: flex;
            align-items: center;
          }
          ul, ol {
            padding-left: 25px;
            margin-bottom: 20px;
          }
          li {
            margin-bottom: 8px;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            text-align: center;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <h1>${recipe.title}</h1>
        <p>${recipe.description || ""}</p>
        
        <div class="recipe-meta">
          ${recipe.prepTime ? `<div>Prep: ${recipe.prepTime}</div>` : ""}
          ${recipe.cookTime ? `<div>Cook: ${recipe.cookTime}</div>` : ""}
          <div>Serves: ${servingSize}</div>
          ${recipe.course ? `<div>Course: ${recipe.course}</div>` : ""}
          ${recipe.cuisine ? `<div>Cuisine: ${recipe.cuisine}</div>` : ""}
        </div>
        
        ${
          recipe.ingredientSections && recipe.ingredientSections.length > 0
            ? `
          <h2>Ingredients</h2>
          ${recipe.ingredientSections
            .map(
              (section, sectionIndex) => `
            ${section.subtitle ? `<h3>${section.subtitle}</h3>` : ""}
            <ul>
              ${(adjustedServings && adjustedIngredients && adjustedIngredients[sectionIndex]
                ? adjustedIngredients[sectionIndex]
                : section.items
              )
                .map((ingredient) => `<li>${ingredient}</li>`)
                .join("")}
            </ul>
          `,
            )
            .join("")}
        `
            : ""
        }
        
        ${
          recipe.instructions && recipe.instructions.length > 0
            ? `
          <h2>Instructions</h2>
          <ol>
            ${recipe.instructions.map((instruction) => `<li>${instruction}</li>`).join("")}
          </ol>
        `
            : ""
        }
        
        ${
          recipe.tips && recipe.tips.length > 0
            ? `
          <h2>Tips & Notes</h2>
          <ul>
            ${recipe.tips.map((tip) => `<li>${tip}</li>`).join("")}
          </ul>
        `
            : ""
        }
        
        <div class="footer">
          <p>Recipe from Vegan Side Project | Printed on ${currentDate}</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `

    // Write the content to the new window
    printWindow.document.open()
    printWindow.document.write(printContent)
    printWindow.document.close()

    // Reset the printing state after a delay
    setTimeout(() => {
      setIsPrinting(false)
    }, 1000)
  }

  return (
    <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handlePrint} disabled={isPrinting}>
      <Printer className="h-4 w-4" />
      {isPrinting ? "Preparing..." : "Print Recipe"}
    </Button>
  )
}

import Link from "next/link"
import { Leaf } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-[#6a994e]" />
              <span className="text-lg font-semibold">Vegan Side Project</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Delicious plant-based recipes that will satisfy both you and your vegan partner.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/recipes?tab=all" className="text-muted-foreground hover:text-foreground">
                  All Recipes
                </Link>
              </li>
              <li>
                <Link href="/recipes?tab=mains" className="text-muted-foreground hover:text-foreground">
                  Main Dishes
                </Link>
              </li>
              <li>
                <Link href="/recipes?tab=sides" className="text-muted-foreground hover:text-foreground">
                  Side Dishes
                </Link>
              </li>
              <li>
                <Link href="/recipes?tab=desserts" className="text-muted-foreground hover:text-foreground">
                  Desserts
                </Link>
              </li>
              <li>
                <Link href="/meal-plans" className="text-muted-foreground hover:text-foreground">
                  Meal Plans
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tips" className="text-muted-foreground hover:text-foreground">
                  Tips & Tricks
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/submit-recipe" className="text-muted-foreground hover:text-foreground">
                  Submit a Recipe
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/imprint" className="text-muted-foreground hover:text-foreground">
                  Imprint
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Vegan Side Project. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

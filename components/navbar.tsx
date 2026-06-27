"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, Leaf, User, LogOut, ChefHat } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DonateButton } from "@/components/donate-button"
import { useAuth } from "@/context/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * Breakpoints based on actual content width:
 *
 * Logo+name ≈ 192px  |  Contact ≈ 80px  |  Support Us ≈ 100px  |  Profile ≈ 90px  |  Hamburger ≈ 40px
 * All right items together ≈ 330px + gaps.  Minimum before touching logo ≈ 570px.
 *
 * ≥ xl   (1280px) — full desktop: logo+name | nav links | Contact · Support Us · Profile
 * sm–xl  (640px–1279px) — logo+name · Contact · Support Us · Profile · ≡  (nav links in menu)
 * 440px–639px — logo icon · Contact · Profile · ≡  (nav + Support Us in menu)
 * < 440px — logo icon · Profile · ≡  (nav + Support Us + Contact in menu)
 */

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo — name visible at sm+ (hides same point Support Us goes to menu) */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Leaf className="h-6 w-6 text-[#6a994e]" />
          <span className="hidden sm:inline-block text-lg font-semibold whitespace-nowrap">
            Vegan Side Project
          </span>
        </Link>

        {/* Nav links — xl+ only */}
        <nav className="hidden xl:flex gap-6 mx-6">
          <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">Home</Link>
          <Link href="/recipes" className="text-sm font-medium hover:underline underline-offset-4">Recipes</Link>
          <Link href="/tips" className="text-sm font-medium hover:underline underline-offset-4">Tips & Tricks</Link>
          <Link href="/blog" className="text-sm font-medium hover:underline underline-offset-4">Blog</Link>
          <Link href="/meal-plans" className="text-sm font-medium hover:underline underline-offset-4">Meal Plans</Link>
          <Link href="/submit-recipe" className="text-sm font-medium hover:underline underline-offset-4">Submit Recipe</Link>
        </nav>

        {/* Right-side actions */}
        <div className="flex items-center gap-2">

          {/* Contact — visible at min-[440px]+ */}
          <Link href="/contact" passHref>
            <Button size="sm" variant="outline" className="hidden min-[440px]:flex">Contact</Button>
          </Link>

          {/* Support Us — visible at sm+ (goes to menu below 640px) */}
          <Button asChild size="sm" variant="outline" className="hidden sm:flex">
            <Link href="/donate">Support Us</Link>
          </Button>

          {/* Profile / Auth — always visible */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden min-[440px]:inline">{profile?.name?.split(" ")[0] || "Account"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/submit-recipe" className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4" /> Submit Recipe
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-red-500 focus:text-red-500"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="flex bg-[#6a994e] hover:bg-[#5a8540]">
              <Link href="/login">Sign in</Link>
            </Button>
          )}

          {/* Hamburger — visible below xl (nav links always in menu at these sizes) */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="xl:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 sm:w-72">
              <div className="flex flex-col gap-4 mt-8 px-2">

                {/* Nav links — always in menu (menu only appears below xl) */}
                <Link href="/" className="text-base font-medium" onClick={() => setIsOpen(false)}>Home</Link>
                <Link href="/recipes" className="text-base font-medium" onClick={() => setIsOpen(false)}>Recipes</Link>
                <Link href="/tips" className="text-base font-medium" onClick={() => setIsOpen(false)}>Tips & Tricks</Link>
                <Link href="/blog" className="text-base font-medium" onClick={() => setIsOpen(false)}>Blog</Link>
                <Link href="/meal-plans" className="text-base font-medium" onClick={() => setIsOpen(false)}>Meal Plans</Link>
                <Link href="/submit-recipe" className="text-base font-medium" onClick={() => setIsOpen(false)}>Submit Recipe</Link>

                {/*
                  Support Us: in menu below sm (640px). Hidden in menu at sm+ since it's in header.
                  Contact: in menu below 440px. Hidden in menu at 440px+ since it's in header.
                  Support Us is listed first — it joins the menu first as screen shrinks.
                */}
                <div className="sm:hidden flex flex-col gap-4 border-t pt-4">
                  <Link href="/donate" className="text-base font-medium" onClick={() => setIsOpen(false)}>
                    Support Us
                  </Link>
                  <Link href="/contact" className="text-base font-medium min-[440px]:hidden" onClick={() => setIsOpen(false)}>
                    Contact
                  </Link>
                </div>
                {/* Contact only (when Support Us is still in header but Contact has left) — 440–639px range */}
                <div className="hidden sm:block min-[440px]:hidden border-t pt-4">
                  <Link href="/contact" className="text-base font-medium" onClick={() => setIsOpen(false)}>
                    Contact
                  </Link>
                </div>

              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  )
}

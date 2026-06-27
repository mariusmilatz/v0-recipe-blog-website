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
 * Responsive breakpoint behaviour:
 *
 * ≥ xl  (1280px+)  — full desktop: logo+name | nav links | Contact, Support Us, Profile
 * lg–xl (1024–1279) — nav links go into menu; Contact, Support Us, Profile stay in header
 * md–lg  (768–1023) — Support Us joins menu; logo name hides; Contact, Profile stay in header
 * sm–md  (640–767)  — Contact joins menu; Profile stays in header
 * < sm   (<640px)   — Profile joins menu; only logo icon + hamburger in header
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
      <div className="container flex h-16 items-center justify-between">

        {/* Logo — name hides below lg (same point Support Us leaves header) */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Leaf className="h-6 w-6 text-[#6a994e]" />
          <span className="hidden lg:inline-block text-lg font-semibold whitespace-nowrap">
            Vegan Side Project
          </span>
        </Link>

        {/* Nav links — visible at xl+ only */}
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

          {/* Contact — visible md+ */}
          <Link href="/contact" passHref>
            <Button size="sm" variant="outline" className="hidden md:flex">Contact</Button>
          </Link>

          {/* Support Us — visible lg+ */}
          <div className="hidden lg:flex">
            <DonateButton size="sm" />
          </div>

          {/* Profile / Auth — visible sm+ */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="hidden sm:flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {profile?.name?.split(" ")[0] || "Account"}
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
            <Button asChild size="sm" className="hidden sm:flex bg-[#6a994e] hover:bg-[#5a8540]">
              <Link href="/login">Sign in</Link>
            </Button>
          )}

          {/* Hamburger — visible below xl */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="xl:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 sm:w-72">
              <div className="flex flex-col gap-4 mt-8 px-2">

                {/* Nav links — always in the menu (menu only appears below xl) */}
                <Link href="/" className="text-base font-medium" onClick={() => setIsOpen(false)}>Home</Link>
                <Link href="/recipes" className="text-base font-medium" onClick={() => setIsOpen(false)}>Recipes</Link>
                <Link href="/tips" className="text-base font-medium" onClick={() => setIsOpen(false)}>Tips & Tricks</Link>
                <Link href="/blog" className="text-base font-medium" onClick={() => setIsOpen(false)}>Blog</Link>
                <Link href="/meal-plans" className="text-base font-medium" onClick={() => setIsOpen(false)}>Meal Plans</Link>
                <Link href="/submit-recipe" className="text-base font-medium" onClick={() => setIsOpen(false)}>Submit Recipe</Link>

                {/*
                  Support Us + Contact overflow section.
                  The outer div is lg:hidden — entire block hides at lg+
                  (at lg+ both Support Us and Contact are in the header).
                  Inside, Contact also has md:hidden so it only shows below md.
                */}
                <div className="lg:hidden flex flex-col gap-4 border-t pt-4">
                  <Link href="/donate" className="text-base font-medium" onClick={() => setIsOpen(false)}>
                    Support Us
                  </Link>
                  <Link href="/contact" className="text-base font-medium md:hidden" onClick={() => setIsOpen(false)}>
                    Contact
                  </Link>
                </div>

                {/* Profile / Auth — only in menu below sm */}
                <div className="sm:hidden border-t pt-4">
                  {user ? (
                    <>
                      <Link href="/profile" className="text-base font-medium block mb-4" onClick={() => setIsOpen(false)}>
                        My Profile
                      </Link>
                      <button
                        onClick={() => { handleSignOut(); setIsOpen(false) }}
                        className="text-base font-medium text-red-500"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <Link href="/login" className="text-base font-medium text-[#6a994e]" onClick={() => setIsOpen(false)}>
                      Sign in
                    </Link>
                  )}
                </div>

              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  )
}

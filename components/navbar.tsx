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
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-[#6a994e]" />
            <span className="text-lg font-semibold hidden sm:inline-block">Vegan Side Project</span>
          </Link>
        </div>
        <nav className="hidden md:flex gap-6">
          <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">
            Home
          </Link>
          <Link href="/recipes" className="text-sm font-medium hover:underline underline-offset-4">
            Recipes
          </Link>
          <Link href="/tips" className="text-sm font-medium hover:underline underline-offset-4">
            Tips & Tricks
          </Link>
          <Link href="/blog" className="text-sm font-medium hover:underline underline-offset-4">
            Blog
          </Link>
          <Link href="/meal-plans" className="text-sm font-medium hover:underline underline-offset-4">
            Meal Plans
          </Link>
          <Link href="/submit-recipe" className="text-sm font-medium hover:underline underline-offset-4">
            Submit Recipe
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/contact" passHref>
            <Button size="sm" variant="outline" className="hidden sm:flex">
              Contact
            </Button>
          </Link>
          <DonateButton size="sm" />

          {/* Auth buttons */}
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
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-red-500 focus:text-red-500">
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="hidden sm:flex bg-[#6a994e] hover:bg-[#5a8540]">
              <Link href="/login">Sign in</Link>
            </Button>
          )}

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                  Home
                </Link>
                <Link href="/recipes" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                  Recipes
                </Link>
                <Link href="/tips" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                  Tips & Tricks
                </Link>
                <Link href="/blog" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                  Blog
                </Link>
                <Link href="/meal-plans" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                  Meal Plans
                </Link>
                <Link href="/submit-recipe" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                  Submit Recipe
                </Link>
                <Link href="/contact" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                  Contact
                </Link>
                <Link href="/donate" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                  Support Us
                </Link>
                <div className="border-t pt-4">
                  {user ? (
                    <>
                      <Link href="/profile" className="text-lg font-medium block mb-4" onClick={() => setIsOpen(false)}>
                        My Profile
                      </Link>
                      <button
                        onClick={() => { handleSignOut(); setIsOpen(false) }}
                        className="text-lg font-medium text-red-500"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <Link href="/login" className="text-lg font-medium text-[#6a994e]" onClick={() => setIsOpen(false)}>
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

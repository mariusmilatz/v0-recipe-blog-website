"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, Leaf } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DonateButton } from "@/components/donate-button"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

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
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

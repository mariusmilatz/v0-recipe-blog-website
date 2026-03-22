"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DonateButtonProps {
  variant?: "default" | "outline" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function DonateButton({ variant = "outline", size = "default" }: DonateButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={variant} size={size} asChild className="h-9">
            <Link href="/donate">Support Us</Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Support our ad-free website</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ServingsAdjusterProps {
  defaultServings: number
  minServings?: number
  maxServings?: number
  onChange: (servings: number) => void
}

export function ServingsAdjuster({
  defaultServings = 4,
  minServings = 1,
  maxServings = 12,
  onChange,
}: ServingsAdjusterProps) {
  const [servings, setServings] = useState(defaultServings)

  // Update servings when defaultServings changes
  useEffect(() => {
    setServings(defaultServings)
  }, [defaultServings])

  const handleDecrease = () => {
    if (servings > minServings) {
      const newServings = servings - 1
      setServings(newServings)
      onChange(newServings)
    }
  }

  const handleIncrease = () => {
    if (servings < maxServings) {
      const newServings = servings + 1
      setServings(newServings)
      onChange(newServings)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value >= minServings && value <= maxServings) {
      setServings(value)
      onChange(value)
    }
  }

  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor="servings">Servings</Label>
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrease}
          disabled={servings <= minServings}
          className="h-8 w-8"
        >
          <Minus className="h-3 w-3" />
          <span className="sr-only">Decrease servings</span>
        </Button>
        <Input
          id="servings"
          type="number"
          min={minServings}
          max={maxServings}
          value={servings}
          onChange={handleInputChange}
          className="h-8 w-16 text-center"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrease}
          disabled={servings >= maxServings}
          className="h-8 w-8"
        >
          <Plus className="h-3 w-3" />
          <span className="sr-only">Increase servings</span>
        </Button>
        <span className="text-sm text-muted-foreground ml-2">people</span>
      </div>
    </div>
  )
}

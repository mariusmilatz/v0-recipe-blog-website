"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ServingsAdjusterProps {
  initialServings: number
  onServingsChange: (newServings: number) => void
}

export function ServingsAdjuster({ initialServings, onServingsChange }: ServingsAdjusterProps) {
  const [servings, setServings] = useState(initialServings || 2)

  // Update parent component when servings change
  useEffect(() => {
    onServingsChange(servings)
  }, [servings, onServingsChange])

  const decreaseServings = () => {
    if (servings > 1) {
      setServings(servings - 1)
    }
  }

  const increaseServings = () => {
    setServings(servings + 1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setServings(value)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Servings:</span>
      <div className="flex items-center">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-r-none"
          onClick={decreaseServings}
          disabled={servings <= 1}
        >
          <Minus className="h-3 w-3" />
          <span className="sr-only">Decrease</span>
        </Button>
        <Input
          type="number"
          value={servings}
          onChange={handleInputChange}
          min="1"
          className="h-8 w-16 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-l-none"
          onClick={increaseServings}
        >
          <Plus className="h-3 w-3" />
          <span className="sr-only">Increase</span>
        </Button>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FileText, Plus, Minus, Upload, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { sendRecipeSubmissionEmail } from "@/app/actions/email-actions"

export default function SubmitRecipePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [serves, setServes] = useState("")
  const [prepTime, setPrepTime] = useState("")
  const [cookTime, setCookTime] = useState("")
  const [course, setCourse] = useState("")
  const [cuisine, setCuisine] = useState("")

  // Ingredients sections
  const [ingredientSections, setIngredientSections] = useState([{ subtitle: "", items: [""] }])

  // Instructions
  const [instructions, setInstructions] = useState([""])

  // Tips
  const [tips, setTips] = useState([""])

  // Images
  const [images, setImages] = useState([null])

  // Submitter info
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [notes, setNotes] = useState("")

  // Add ingredient section
  const addIngredientSection = () => {
    setIngredientSections([...ingredientSections, { subtitle: "", items: [""] }])
  }

  // Remove ingredient section
  const removeIngredientSection = (index) => {
    if (ingredientSections.length > 1) {
      const newSections = [...ingredientSections]
      newSections.splice(index, 1)
      setIngredientSections(newSections)
    }
  }

  // Update ingredient section subtitle
  const updateSectionSubtitle = (index, subtitle) => {
    const newSections = [...ingredientSections]
    newSections[index].subtitle = subtitle
    setIngredientSections(newSections)
  }

  // Add ingredient item
  const addIngredientItem = (sectionIndex) => {
    const newSections = [...ingredientSections]
    newSections[sectionIndex].items.push("")
    setIngredientSections(newSections)
  }

  // Remove ingredient item
  const removeIngredientItem = (sectionIndex, itemIndex) => {
    if (ingredientSections[sectionIndex].items.length > 1) {
      const newSections = [...ingredientSections]
      newSections[sectionIndex].items.splice(itemIndex, 1)
      setIngredientSections(newSections)
    }
  }

  // Update ingredient item
  const updateIngredientItem = (sectionIndex, itemIndex, value) => {
    const newSections = [...ingredientSections]
    newSections[sectionIndex].items[itemIndex] = value
    setIngredientSections(newSections)
  }

  // Add instruction
  const addInstruction = () => {
    setInstructions([...instructions, ""])
  }

  // Remove instruction
  const removeInstruction = (index) => {
    if (instructions.length > 1) {
      const newInstructions = [...instructions]
      newInstructions.splice(index, 1)
      setInstructions(newInstructions)
    }
  }

  // Update instruction
  const updateInstruction = (index, value) => {
    const newInstructions = [...instructions]
    newInstructions[index] = value
    setInstructions(newInstructions)
  }

  // Add tip
  const addTip = () => {
    setTips([...tips, ""])
  }

  // Remove tip
  const removeTip = (index) => {
    if (tips.length > 1) {
      const newTips = [...tips]
      newTips.splice(index, 1)
      setTips(newTips)
    } else {
      setTips([""])
    }
  }

  // Update tip
  const updateTip = (index, value) => {
    const newTips = [...tips]
    newTips[index] = value
    setTips(newTips)
  }

  // Handle image change
  const handleImageChange = (index, e) => {
    if (e.target.files && e.target.files[0]) {
      const newImages = [...images]
      newImages[index] = e.target.files[0]
      setImages(newImages)
    }
  }

  // Add image
  const addImage = () => {
    setImages([...images, null])
  }

  // Remove image
  const removeImage = (index) => {
    if (images.length > 1) {
      const newImages = [...images]
      newImages.splice(index, 1)
      setImages(newImages)
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create a FormData object to send to the server action
      const formData = new FormData()

      // Add basic recipe information
      formData.append("title", title)
      formData.append("description", description)
      formData.append("serves", serves)
      formData.append("prepTime", prepTime)
      formData.append("cookTime", cookTime)
      formData.append("course", course)
      formData.append("cuisine", cuisine)

      // Add ingredient sections
      formData.append("sectionCount", ingredientSections.length.toString())
      ingredientSections.forEach((section, sectionIndex) => {
        formData.append(`section-${sectionIndex}`, section.subtitle)
        formData.append(`itemCount-${sectionIndex}`, section.items.length.toString())
        section.items.forEach((item, itemIndex) => {
          formData.append(`ingredient-${sectionIndex}-${itemIndex}`, item)
        })
      })

      // Add instructions
      formData.append("instructionCount", instructions.length.toString())
      instructions.forEach((instruction, index) => {
        formData.append(`instruction-${index}`, instruction)
      })

      // Add tips
      formData.append("tipCount", tips.length.toString())
      tips.forEach((tip, index) => {
        formData.append(`tip-${index}`, tip)
      })

      // Add submitter information
      formData.append("name", name)
      formData.append("email", email)
      formData.append("notes", notes)

      // Send the form data to the server action
      const result = await sendRecipeSubmissionEmail(formData)

      if (result.success) {
        toast({
          title: "Recipe submitted!",
          description: "Thank you for sharing your recipe. Our team will review it shortly.",
        })

        // Redirect to recipes page after successful submission
        router.push("/recipes")
      } else {
        toast({
          title: "Submission failed",
          description: result.message || "There was an error submitting your recipe. Please try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error submitting recipe:", error)
      toast({
        title: "Submission failed",
        description: "There was an error submitting your recipe. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <FileText className="h-16 w-16 mx-auto text-[#6a994e] mb-4" />
          <h1 className="text-3xl font-bold mb-4">Submit Your Recipe</h1>
          <p className="text-muted-foreground">
            Share your favorite vegan recipes with our community. Fill out the form below with all the details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell us about your recipe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Recipe Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Creamy Mushroom Risotto"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe your recipe..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serves">Serves</Label>
                  <Input
                    id="serves"
                    name="serves"
                    value={serves}
                    onChange={(e) => setServes(e.target.value)}
                    placeholder="e.g., 4"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prepTime">Preparation Time</Label>
                  <Input
                    id="prepTime"
                    name="prepTime"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    placeholder="e.g., 15 min"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cookTime">Cooking Time</Label>
                  <Input
                    id="cookTime"
                    name="cookTime"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    placeholder="e.g., 30 min"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Select value={course} onValueChange={setCourse}>
                    <SelectTrigger id="course" name="course">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="appetizer">Appetizer</SelectItem>
                      <SelectItem value="side">Side</SelectItem>
                      <SelectItem value="dessert">Dessert</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cuisine">Cuisine</Label>
                  <Input
                    id="cuisine"
                    name="cuisine"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    placeholder="e.g., Italian"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>List all ingredients needed for your recipe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {ingredientSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-4 pb-4 border-b last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <Label htmlFor={`section-${sectionIndex}`}>Section Title (optional)</Label>
                      <Input
                        id={`section-${sectionIndex}`}
                        name={`section-${sectionIndex}`}
                        value={section.subtitle}
                        onChange={(e) => updateSectionSubtitle(sectionIndex, e.target.value)}
                        placeholder="e.g., For the sauce"
                      />
                    </div>

                    {ingredientSections.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="ml-2 mt-8"
                        onClick={() => removeIngredientSection(sectionIndex)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-2">
                        <Input
                          name={`ingredient-${sectionIndex}-${itemIndex}`}
                          value={item}
                          onChange={(e) => updateIngredientItem(sectionIndex, itemIndex, e.target.value)}
                          placeholder="e.g., 2 cups arborio rice"
                          required
                        />

                        {section.items.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeIngredientItem(sectionIndex, itemIndex)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}

                    <Button type="button" variant="outline" size="sm" onClick={() => addIngredientItem(sectionIndex)}>
                      <Plus className="h-4 w-4 mr-2" /> Add Ingredient
                    </Button>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addIngredientSection}>
                <Plus className="h-4 w-4 mr-2" /> Add Ingredient Section
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
              <CardDescription>Step-by-step directions for preparing your recipe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="rounded-full bg-muted h-6 w-6 flex items-center justify-center shrink-0 mt-2">
                    <span className="text-xs font-medium">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <Textarea
                      name={`instruction-${index}`}
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      placeholder={`Step ${index + 1}: e.g., Heat olive oil in a large pan...`}
                      required
                    />
                  </div>

                  {instructions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="mt-2"
                      onClick={() => removeInstruction(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addInstruction}>
                <Plus className="h-4 w-4 mr-2" /> Add Step
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips & Notes (Optional)</CardTitle>
              <CardDescription>Share any helpful tips or variations for your recipe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tips.map((tip, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    name={`tip-${index}`}
                    value={tip}
                    onChange={(e) => updateTip(index, e.target.value)}
                    placeholder="e.g., For a spicier version, add red pepper flakes"
                  />

                  <Button type="button" variant="outline" size="icon" onClick={() => removeTip(index)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addTip}>
                <Plus className="h-4 w-4 mr-2" /> Add Tip
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images (Optional)</CardTitle>
              <CardDescription>Upload photos of your recipe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {images.map((image, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`image-${index}`} className="cursor-pointer">
                      <div className="border-2 border-dashed rounded-md p-4 text-center hover:bg-muted/50 transition-colors">
                        {image ? (
                          <div className="text-sm text-muted-foreground">
                            {image.name} ({Math.round(image.size / 1024)} KB)
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-4">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">Click to upload image</p>
                            <p className="text-xs text-muted-foreground">JPG, PNG or GIF up to 5MB</p>
                          </div>
                        )}
                      </div>
                      <input
                        id={`image-${index}`}
                        name={`image-${index}`}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => handleImageChange(index, e)}
                      />
                    </Label>
                  </div>

                  {images.length > 1 && (
                    <Button type="button" variant="outline" size="icon" onClick={() => removeImage(index)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addImage}>
                <Plus className="h-4 w-4 mr-2" /> Add Another Image
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>Tell us a bit about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Your Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information you'd like to share about this recipe..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/recipes">Cancel</Link>
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  Submitting... <Send className="ml-2 h-4 w-4 animate-pulse" />
                </>
              ) : (
                <>
                  Submit Recipe <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

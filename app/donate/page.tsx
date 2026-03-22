"use client"
import Link from "next/link"
import { useState } from "react"
import { Coffee, Utensils, Salad, Leaf, Share2, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function DonatePage() {
  const { toast } = useToast()
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Stripe payment links
  const stripeLinks = {
    smallSupport: "https://buy.stripe.com/test_cNi5kxfZM0lag5ScfV7N600",
    recipeSupporter: "https://buy.stripe.com/test_14AcMZ5l81pe6vigwb7N601",
    sustainingMember: "https://buy.stripe.com/test_28E7sF9Bo0la4naeo37N602",
    custom10: "https://buy.stripe.com/test_9B64gt6pc2tif1O4Nt7N603",
    custom15: "https://buy.stripe.com/test_eVq00d9BoaZO9HucfV7N604",
    custom20: "https://buy.stripe.com/test_6oUeV75l8d7Wg5S93J7N605",
    custom30: "https://buy.stripe.com/test_8x2dR37tg8RGg5S93J7N606",
    custom40: "https://buy.stripe.com/test_14AdR3eVIgk8dXKcfV7N607",
    custom50: "https://buy.stripe.com/test_8x2dR328W4Bq1aY2Fl7N608",
  }

  const handleShare = async () => {
    const url = window.location.origin
    const title = "Vegan Side Project"
    const text = "Check out Vegan Side Project - delicious vegan recipes for everyone!"

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        })
        toast({
          title: "Shared successfully!",
          description: "Thank you for sharing Vegan Side Project.",
        })
      } catch (error) {
        console.error("Error sharing:", error)
        // Fallback to copy if share was cancelled or failed
        copyToClipboard(url)
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      copyToClipboard(url)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true)
        toast({
          title: "Copied to clipboard!",
          description: "The link has been copied to your clipboard.",
        })
        setTimeout(() => setCopied(false), 2000)
      },
      (err) => {
        console.error("Could not copy text: ", err)
        toast({
          title: "Failed to copy",
          description: "Please try again or copy the URL manually.",
          variant: "destructive",
        })
      },
    )
  }

  const handleCustomDonation = () => {
    if (!selectedAmount) return

    let donationLink = ""
    switch (selectedAmount) {
      case "10":
        donationLink = stripeLinks.custom10
        break
      case "15":
        donationLink = stripeLinks.custom15
        break
      case "20":
        donationLink = stripeLinks.custom20
        break
      case "30":
        donationLink = stripeLinks.custom30
        break
      case "40":
        donationLink = stripeLinks.custom40
        break
      case "50":
        donationLink = stripeLinks.custom50
        break
      default:
        // Default to €10 if somehow an invalid option is selected
        donationLink = stripeLinks.custom10
    }

    window.location.href = donationLink
  }

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Support Our Mission</h1>
        <p className="mt-4 text-muted-foreground">
          Help us keep Vegan Side Project ad-free and accessible to everyone.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-[#f8f5f2] p-8 rounded-lg mb-10">
          <h2 className="text-2xl font-bold mb-4">Why We Need Your Support</h2>
          <p className="mb-4">
            Vegan Side Project was created with a simple mission: to help non-vegans cook delicious plant-based meals
            that everyone can enjoy. We believe that good food brings people together, regardless of dietary
            preferences.
          </p>
          <p className="mb-4">
            Unlike many recipe websites, we've chosen to keep Vegan Side Project completely free of advertisements,
            sponsored content, and paywalls. We want our recipes and resources to be accessible to everyone without
            distractions or barriers.
          </p>
          <p>
            Your donations, no matter how small, help us cover the costs of hosting, development, recipe testing, and
            creating new content. With your support, we can continue to improve the site and help more people discover
            the joy of cooking plant-based meals.
          </p>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center">Ways to Support Us</h2>

        <div className="grid gap-6 md:grid-cols-3 mb-10">
          <Card className="flex flex-col">
            <CardHeader className="text-center">
              <Coffee className="h-8 w-8 mx-auto mb-2 text-[#6a994e]" />
              <CardTitle>Small Support</CardTitle>
              <CardDescription>One-time support</CardDescription>
            </CardHeader>
            <CardContent className="text-center flex-1">
              <p className="text-3xl font-bold mb-2">€2,50</p>
              <p className="text-sm text-muted-foreground">
                A small contribution that helps cover our monthly hosting costs.
              </p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button asChild className="w-full">
                <a href={stripeLinks.smallSupport} target="_blank" rel="noopener noreferrer">
                  Donate €2,50
                </a>
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-[#6a994e] shadow-md flex flex-col">
            <CardHeader className="text-center">
              <Utensils className="h-8 w-8 mx-auto mb-2 text-[#6a994e]" />
              <CardTitle>Recipe Supporter</CardTitle>
              <CardDescription>Most popular</CardDescription>
            </CardHeader>
            <CardContent className="text-center flex-1">
              <p className="text-3xl font-bold mb-2">€5</p>
              <p className="text-sm text-muted-foreground">
                Helps us develop and test new recipes to share with the community.
              </p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button asChild className="w-full bg-[#6a994e] hover:bg-[#5a8a3e]">
                <a href={stripeLinks.recipeSupporter} target="_blank" rel="noopener noreferrer">
                  Donate €5
                </a>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="text-center">
              <Salad className="h-8 w-8 mx-auto mb-2 text-[#6a994e]" />
              <CardTitle>Sustaining Member</CardTitle>
              <CardDescription>Monthly support</CardDescription>
            </CardHeader>
            <CardContent className="text-center flex-1">
              <p className="text-3xl font-bold mb-2">€2,50/mo</p>
              <p className="text-sm text-muted-foreground">
                Ongoing support that helps us plan and create new content consistently.
              </p>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button asChild className="w-full">
                <a href={stripeLinks.sustainingMember} target="_blank" rel="noopener noreferrer">
                  Become a Member
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="bg-white border rounded-lg p-8 mb-10">
          <h2 className="text-2xl font-bold mb-4">Custom Donation</h2>
          <p className="mb-6">Want to contribute a different amount? You can choose any amount that works for you.</p>
          <div className="flex flex-wrap gap-4 mb-6">
            <Button
              variant={selectedAmount === "10" ? "default" : "outline"}
              onClick={() => setSelectedAmount("10")}
              className={selectedAmount === "10" ? "bg-[#6a994e] hover:bg-[#5a8a3e]" : ""}
            >
              €10
            </Button>
            <Button
              variant={selectedAmount === "15" ? "default" : "outline"}
              onClick={() => setSelectedAmount("15")}
              className={selectedAmount === "15" ? "bg-[#6a994e] hover:bg-[#5a8a3e]" : ""}
            >
              €15
            </Button>
            <Button
              variant={selectedAmount === "20" ? "default" : "outline"}
              onClick={() => setSelectedAmount("20")}
              className={selectedAmount === "20" ? "bg-[#6a994e] hover:bg-[#5a8a3e]" : ""}
            >
              €20
            </Button>
            <Button
              variant={selectedAmount === "30" ? "default" : "outline"}
              onClick={() => setSelectedAmount("30")}
              className={selectedAmount === "30" ? "bg-[#6a994e] hover:bg-[#5a8a3e]" : ""}
            >
              €30
            </Button>
            <Button
              variant={selectedAmount === "40" ? "default" : "outline"}
              onClick={() => setSelectedAmount("40")}
              className={selectedAmount === "40" ? "bg-[#6a994e] hover:bg-[#5a8a3e]" : ""}
            >
              €40
            </Button>
            <Button
              variant={selectedAmount === "50" ? "default" : "outline"}
              onClick={() => setSelectedAmount("50")}
              className={selectedAmount === "50" ? "bg-[#6a994e] hover:bg-[#5a8a3e]" : ""}
            >
              €50
            </Button>
          </div>
          <Button asChild className="w-full" disabled={!selectedAmount}>
            <a
              href={
                selectedAmount === "10"
                  ? stripeLinks.custom10
                  : selectedAmount === "15"
                    ? stripeLinks.custom15
                    : selectedAmount === "20"
                      ? stripeLinks.custom20
                      : selectedAmount === "30"
                        ? stripeLinks.custom30
                        : selectedAmount === "40"
                          ? stripeLinks.custom40
                          : selectedAmount === "50"
                            ? stripeLinks.custom50
                            : "#"
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              Continue to Donation
            </a>
          </Button>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-4">Other Ways to Support</h2>
          <p className="mb-6">Can't contribute financially? There are other valuable ways you can help:</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={handleShare} className="md:w-auto">
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" /> Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </>
              )}
            </Button>
            <Button variant="outline" asChild className="md:w-auto">
              <Link href="/submit-recipe">Submit a Recipe</Link>
            </Button>
            <Button variant="outline" asChild className="md:w-auto">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>

        <div className="bg-[#f8f5f2] p-8 rounded-lg text-center">
          <Leaf className="h-8 w-8 mx-auto mb-4 text-[#6a994e]" />
          <h2 className="text-2xl font-bold mb-4">Thank You for Your Support</h2>
          <p className="mb-6">
            Every contribution helps us continue our mission of making vegan cooking accessible, enjoyable, and
            delicious for everyone. We're grateful for your support!
          </p>
          <Button asChild>
            <Link href="/">Return to Homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

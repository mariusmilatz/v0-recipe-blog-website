"use client"

import { Button } from "@/components/ui/button"
import { Facebook, Instagram } from "lucide-react"

export function JoinCommunitySection() {
  return (
    <section className="bg-[#f8f5f2] p-8 rounded-lg">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
        <p className="text-muted-foreground mb-6">
          We're building a community of people who are passionate about delicious vegan cooking. Whether you're vegan,
          cooking for a vegan, or simply curious about incorporating more plant-based meals into your diet, you're
          welcome here.
        </p>
        <div className="flex flex-row gap-4 justify-center">
          <Button variant="outline" size="icon" asChild>
            <a
              href="https://instagram.com/vegansideproject"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <a
              href="https://x.com/vegansideproject"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on X (Twitter)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
              </svg>
            </a>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <a
              href="https://facebook.com/vegansideproject"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}

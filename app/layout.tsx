import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/context/auth-context"
import PrefetchRecipes from "@/components/PrefetchRecipes"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Vegan Side Project",
  description: "Delicious plant-based recipes that will satisfy both you and your vegan partner.",
  metadataBase: new URL("https://www.vegansideproject.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.vegansideproject.com",
    siteName: "Vegan Side Project",
    title: "Vegan Side Project",
    description: "Delicious plant-based recipes that will satisfy both you and your vegan partner.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vegan Side Project",
    description: "Delicious plant-based recipes that will satisfy both you and your vegan partner.",
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://www.vegansideproject.com" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
            <PrefetchRecipes />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

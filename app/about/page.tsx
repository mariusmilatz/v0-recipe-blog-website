import { getAboutPageContent } from "@/lib/notion-about"
import { JoinCommunity } from "@/components/about/join-community"

// Disable caching for this page
export const revalidate = 0

export default async function AboutPage() {
  // Fetch content from Notion
  const content = await getAboutPageContent()

  // Default content to use if Notion content is not available
  const defaultContent = {
    aboutUsDescription:
      "A recipe collection started by a couple — one vegan, one not — on a mission to find plant-based food they'd both genuinely love.",
    storyTitle: "Our Story",
    storyText:
      "A few years ago, my wife started eating more and more vegan food. I was still eating meat at the time, so when we cooked together we'd lean vegan or vegetarian to keep things simple — and look for recipes we'd both genuinely enjoy.\n\nWe had this running joke: every time we found a recipe we loved, we'd say it would go on the menu of our imaginary little lunch place. The list kept growing.\n\nOver time we got better at cooking without meat, eggs, and dairy. The trick wasn't substitution — it was learning what made a dish actually satisfying. We started saving everything: PDFs, notes, bookmarks. But we had so many that we'd forget what we had, lose the ones we loved, or just couldn't find them when we needed them.\n\nSo I built this website. Mainly to put all our recipes in one place. About six months ago I went vegan too — but the site still makes just as much sense for anyone in a mixed household, for meat-eaters who want to try something new, or for when vegan friends come over and you want to cook something everyone will actually enjoy.",
    storyImage: "/placeholder.svg?height=400&width=600",
    missionTitle: "Our Mission",
    missionText:
      "This site is built around one idea: good food, easy to find, with no distractions.\n\nNo ads. No sponsored posts. No paywalls. Just recipes that have been cooked, tested, and genuinely loved — by both a vegan and a former meat-eater.\n\nWe keep adding new recipes as we find them, and we'd love to hear from you if you have one worth sharing. If you've made something plant-based that stopped a meat-eater in their tracks, there's a submit page for exactly that.\n\nThe goal is simple: a calm, well-organised place where you can find something great to cook tonight.",
    missionImage: "/placeholder.svg?height=400&width=600",
  }

  console.log("About page content from Notion:", content ? "Received" : "Not received")

  // Use content from Notion if available, otherwise use default content
  const { aboutUsDescription, storyTitle, storyText, storyImage, missionTitle, missionText, missionImage } =
    content || defaultContent

  // Format text with paragraphs
  const formatText = (text: string) => {
    return text.split("\n\n").map((paragraph, index) => (
      <p key={index} className="text-muted-foreground mb-4">
        {paragraph}
      </p>
    ))
  }

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">About Us</h1>
        <p className="mt-4 text-muted-foreground">{aboutUsDescription}</p>
      </div>

      <div className="grid gap-12">
        <section className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">{storyTitle}</h2>
            {formatText(storyText)}
          </div>
          <div className="rounded-lg overflow-hidden h-[400px]">
            <img
              src={storyImage || "/placeholder.svg?height=400&width=600&query=couple cooking together"}
              alt="Our story"
              className="w-full h-full object-cover"
              width={600}
              height={400}
            />
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1 rounded-lg overflow-hidden h-[400px]">
            <img
              src={missionImage || "/placeholder.svg?height=400&width=600&query=delicious vegan food spread"}
              alt="Our mission"
              className="w-full h-full object-cover"
              width={600}
              height={400}
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-2xl font-bold mb-4">{missionTitle}</h2>
            {formatText(missionText)}
          </div>
        </section>

        <JoinCommunity />
      </div>
    </div>
  )
}

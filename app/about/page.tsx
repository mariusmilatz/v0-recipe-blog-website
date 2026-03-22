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
      "The story of a vegan and non-vegan couple on a mission to create delicious plant-based recipes that everyone will love.",
    storyTitle: "Our Story",
    storyText:
      "Our journey began a few years ago when we found ourselves in a common but challenging situation: one of us was vegan, while the other remained a dedicated omnivore. Suddenly, our shared meals became a source of stress rather than joy.\n\nThe early attempts at vegan cooking were... less than successful. Bland tofu, mushy vegetables, and dishes that felt like they were missing something became the norm. We were disappointed by most vegan recipes we tried - they just didn't deliver on flavor or satisfaction.\n\nBut we were determined to find a solution. We began experimenting with recipes, techniques, and ingredients that could create truly delicious vegan meals that wouldn't leave either of us feeling like we were compromising. To our surprise, we discovered a whole new world of flavors and textures that we had never explored before.",
    storyImage: "/placeholder.svg?height=400&width=600",
    missionTitle: "Our Mission",
    missionText:
      "What started as a personal challenge evolved into a passion project. We began sharing our recipes and tips with friends who were in similar situations, and the response was overwhelming. It turned out that many people were navigating the same challenges: finding vegan food that actually tastes amazing.\n\nToday, Vegan Side Project is dedicated to sharing the best vegan recipes we've discovered and perfected over the years. We believe that vegan food doesn't have to be about restriction or substitution—it can be a creative, flavorful, and satisfying culinary adventure.\n\nOur recipes are tested and approved by both vegans and non-vegans, ensuring that they meet our high standards for taste, texture, and satisfaction. We focus on accessible ingredients, clear instructions, and practical tips that make vegan cooking approachable for everyone, regardless of their culinary experience.",
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

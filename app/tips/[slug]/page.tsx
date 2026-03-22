import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTipBySlugFromNotion } from "@/lib/notion-tips"
import { TipClient } from "@/components/tips/tip-client"

interface TipPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: TipPageProps): Promise<Metadata> {
  const tip = await getTipBySlugFromNotion(params.slug)

  if (!tip) {
    return {
      title: "Tip Not Found",
      description: "The requested tip could not be found.",
    }
  }

  return {
    title: `${tip.title} | Vegan Side Project`,
    description: tip.description,
  }
}

export default async function TipPage({ params }: TipPageProps) {
  const tip = await getTipBySlugFromNotion(params.slug)

  if (!tip) {
    notFound()
  }

  return <TipClient tip={tip} />
}

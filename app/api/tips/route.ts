import { NextResponse } from "next/server"
import { getAllTipsFromNotion } from "@/lib/notion-tips"

export async function GET() {
  try {
    const tips = await getAllTipsFromNotion()
    return NextResponse.json({ tips })
  } catch (error) {
    console.error("Error fetching tips:", error)
    return NextResponse.json({ error: "Failed to fetch tips" }, { status: 500 })
  }
}

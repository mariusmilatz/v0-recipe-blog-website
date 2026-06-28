import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/profile", "/login", "/submit-recipe"],
      },
    ],
    sitemap: "https://www.vegansideproject.com/sitemap.xml",
  }
}

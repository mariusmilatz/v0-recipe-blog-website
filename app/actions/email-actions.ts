"use server"

import nodemailer from "nodemailer"

export async function sendRecipeSubmissionEmail(formData: FormData) {
  try {
    // Extract form data
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const serves = formData.get("serves") as string
    const prepTime = formData.get("prepTime") as string
    const cookTime = formData.get("cookTime") as string
    const course = formData.get("course") as string
    const cuisine = formData.get("cuisine") as string
    const notes = formData.get("notes") as string

    // Get all ingredient sections
    const ingredientSections: { subtitle: string; items: string[] }[] = []
    const sectionCount = Number.parseInt(formData.get("sectionCount") as string, 10)

    for (let i = 0; i < sectionCount; i++) {
      const subtitle = formData.get(`section-${i}`) as string
      const itemCount = Number.parseInt(formData.get(`itemCount-${i}`) as string, 10)
      const items: string[] = []

      for (let j = 0; j < itemCount; j++) {
        const item = formData.get(`ingredient-${i}-${j}`) as string
        items.push(item)
      }

      ingredientSections.push({ subtitle, items })
    }

    // Get all instructions
    const instructions: string[] = []
    const instructionCount = Number.parseInt(formData.get("instructionCount") as string, 10)

    for (let i = 0; i < instructionCount; i++) {
      const instruction = formData.get(`instruction-${i}`) as string
      instructions.push(instruction)
    }

    // Get all tips
    const tips: string[] = []
    const tipCount = Number.parseInt(formData.get("tipCount") as string, 10)

    for (let i = 0; i < tipCount; i++) {
      const tip = formData.get(`tip-${i}`) as string
      if (tip) tips.push(tip)
    }

    // Construct email body
    const emailBody = `
      <h1>New Recipe Submission</h1>
      
      <h2>${title}</h2>
      <p><strong>Submitted By:</strong> ${name} (${email})</p>
      
      <h3>Description</h3>
      <p>${description}</p>
      
      <h3>Details</h3>
      <ul>
        <li><strong>Serves:</strong> ${serves}</li>
        <li><strong>Prep Time:</strong> ${prepTime}</li>
        <li><strong>Cook Time:</strong> ${cookTime}</li>
        <li><strong>Course:</strong> ${course}</li>
        <li><strong>Cuisine:</strong> ${cuisine}</li>
      </ul>
      
      <h3>Ingredients</h3>
      ${ingredientSections
        .map(
          (section) => `
        ${section.subtitle ? `<h4>${section.subtitle}</h4>` : ""}
        <ul>
          ${section.items.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      `,
        )
        .join("")}
      
      <h3>Instructions</h3>
      <ol>
        ${instructions.map((instruction) => `<li>${instruction}</li>`).join("")}
      </ol>
      
      ${
        tips.length > 0
          ? `<h3>Tips & Notes</h3>
      <ul>
        ${tips.map((tip) => `<li>${tip}</li>`).join("")}
      </ul>`
          : ""
      }
      
      <h3>Additional Notes</h3>
      <p>${notes || "None provided"}</p>
    `

    // Plain text version for email clients that don't support HTML
    const plainTextBody = `
      New Recipe Submission
      
      Recipe Title: ${title}
      Submitted By: ${name} (${email})
      
      Description: ${description}
      
      Details:
      - Serves: ${serves}
      - Prep Time: ${prepTime}
      - Cook Time: ${cookTime}
      - Course: ${course}
      - Cuisine: ${cuisine}
      
      Ingredients:
      ${ingredientSections
        .map(
          (section) => `
        ${section.subtitle ? `${section.subtitle}:` : ""}
        ${section.items.map((item) => `- ${item}`).join("\n")}
      `,
        )
        .join("\n")}
      
      Instructions:
      ${instructions.map((instruction, index) => `${index + 1}. ${instruction}`).join("\n")}
      
      ${
        tips.length > 0
          ? `Tips & Notes:
      ${tips.map((tip) => `- ${tip}`).join("\n")}`
          : ""
      }
      
      Additional Notes:
      ${notes || "None provided"}
    `

    // Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Send email
    await transporter.sendMail({
      from: `"Vegan Side Project" <${process.env.SMTP_USER}>`,
      to: "hello@vegansideproject.com",
      subject: `New Recipe Submission: ${title}`,
      text: plainTextBody,
      html: emailBody,
    })

    return { success: true, message: "Recipe submitted successfully!" }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, message: "Failed to submit recipe. Please try again." }
  }
}

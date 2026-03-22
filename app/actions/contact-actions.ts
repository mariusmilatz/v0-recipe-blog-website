"use server"

import nodemailer from "nodemailer"

export async function sendContactEmail(formData: FormData) {
  try {
    // Extract form data
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const subject = formData.get("subject") as string
    const message = formData.get("message") as string

    // Construct email body
    const emailBody = `
      <h1>New Contact Form Submission</h1>
      
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      
      <h3>Message</h3>
      <p>${message}</p>
    `

    // Plain text version for email clients that don't support HTML
    const plainTextBody = `
      New Contact Form Submission
      
      From: ${name} (${email})
      Subject: ${subject}
      
      Message:
      ${message}
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
      subject: `Contact Form: ${subject}`,
      text: plainTextBody,
      html: emailBody,
    })

    return { success: true, message: "Your message has been sent! We'll get back to you soon." }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, message: "Failed to send message. Please try again." }
  }
}

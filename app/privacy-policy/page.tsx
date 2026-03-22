import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-10">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Privacy Policy</h1>

        <div className="prose max-w-none">
          <p className="text-muted-foreground mb-6">Last updated: May 10, 2023</p>

          <h2 className="text-xl font-bold mt-8 mb-4">1. Introduction</h2>
          <p>
            Welcome to Vegan For Two. We respect your privacy and are committed to protecting your personal data. This
            privacy policy will inform you about how we look after your personal data when you visit our website and
            tell you about your privacy rights and how the law protects you.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">2. The Data We Collect About You</h2>
          <p>
            Personal data, or personal information, means any information about an individual from which that person can
            be identified. We may collect, use, store and transfer different kinds of personal data about you which we
            have grouped together as follows:
          </p>
          <ul className="list-disc pl-6 my-4 space-y-2">
            <li>
              <strong>Identity Data</strong> includes first name, last name, username or similar identifier.
            </li>
            <li>
              <strong>Contact Data</strong> includes email address.
            </li>
            <li>
              <strong>Technical Data</strong> includes internet protocol (IP) address, browser type and version, time
              zone setting and location, browser plug-in types and versions, operating system and platform, and other
              technology on the devices you use to access this website.
            </li>
            <li>
              <strong>Usage Data</strong> includes information about how you use our website, products and services.
            </li>
            <li>
              <strong>Profile Data</strong> includes your username and password, your interests, preferences, feedback
              and survey responses.
            </li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-4">3. How We Use Your Personal Data</h2>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data
            in the following circumstances:
          </p>
          <ul className="list-disc pl-6 my-4 space-y-2">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>
              Where it is necessary for our legitimate interests (or those of a third party) and your interests and
              fundamental rights do not override those interests.
            </li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-4">4. Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally
            lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your
            personal data to those employees, agents, contractors and other third parties who have a business need to
            know. They will only process your personal data on our instructions and they are subject to a duty of
            confidentiality.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">5. Data Retention</h2>
          <p>
            We will only retain your personal data for as long as reasonably necessary to fulfill the purposes we
            collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting or
            reporting requirements. We may retain your personal data for a longer period in the event of a complaint or
            if we reasonably believe there is a prospect of litigation in respect to our relationship with you.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">6. Your Legal Rights</h2>
          <p>
            Under certain circumstances, you have rights under data protection laws in relation to your personal data,
            including the right to:
          </p>
          <ul className="list-disc pl-6 my-4 space-y-2">
            <li>Request access to your personal data.</li>
            <li>Request correction of your personal data.</li>
            <li>Request erasure of your personal data.</li>
            <li>Object to processing of your personal data.</li>
            <li>Request restriction of processing your personal data.</li>
            <li>Request transfer of your personal data.</li>
            <li>Right to withdraw consent.</li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-4">7. Cookies</h2>
          <p>
            Cookies are small text files that are placed on your computer by websites that you visit. They are widely
            used in order to make websites work, or work more efficiently, as well as to provide information to the
            owners of the site. Most web browsers allow some control of most cookies through the browser settings.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">8. Changes to This Privacy Policy</h2>
          <p>
            We may update our privacy policy from time to time. We will notify you of any changes by posting the new
            privacy policy on this page and updating the "last updated" date at the top of this privacy policy.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">9. Contact Us</h2>
          <p>If you have any questions about this privacy policy or our privacy practices, please contact us at:</p>
          <p className="mt-2">
            <strong>Email:</strong> privacy@veganfortwo.com
          </p>
          <p>
            <strong>Postal address:</strong> Vegan For Two, 123 Plant Street, Green City, 12345, Country
          </p>
        </div>
      </div>
    </div>
  )
}

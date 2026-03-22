import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ImprintPage() {
  return (
    <div className="container py-10">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Imprint</h1>

        <div className="prose max-w-none">
          <h2 className="text-xl font-bold mt-8 mb-4">Information According to § 5 TMG</h2>
          <p>
            <strong>Vegan For Two</strong>
            <br />
            123 Plant Street
            <br />
            Green City, 12345
            <br />
            Country
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">Contact</h2>
          <p>
            <strong>Phone:</strong> +1 234 567 890
            <br />
            <strong>Email:</strong> contact@veganfortwo.com
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">Responsible for Content</h2>
          <p>
            <strong>Alex Johnson</strong>
            <br />
            123 Plant Street
            <br />
            Green City, 12345
            <br />
            Country
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">EU Dispute Resolution</h2>
          <p>
            The European Commission provides a platform for online dispute resolution (OS):
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6a994e] hover:underline"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
          <p>
            We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration
            board.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">Liability for Content</h2>
          <p>
            As a service provider, we are responsible for our own content on these pages according to § 7 paragraph 1
            TMG and general laws. According to §§ 8 to 10 TMG, we are not obliged to monitor transmitted or stored
            foreign information or to investigate circumstances that indicate illegal activity.
          </p>
          <p>
            Obligations to remove or block the use of information under general law remain unaffected. However,
            liability in this regard is only possible from the point in time at which a concrete infringement of the law
            becomes known. If we become aware of any such infringements, we will remove the relevant content
            immediately.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">Liability for Links</h2>
          <p>
            Our offer contains links to external websites of third parties, on whose contents we have no influence.
            Therefore, we cannot assume any liability for these external contents. The respective provider or operator
            of the pages is always responsible for the content of the linked pages. The linked pages were checked for
            possible legal violations at the time of linking. Illegal contents were not recognizable at the time of
            linking.
          </p>
          <p>
            However, a permanent control of the contents of the linked pages is not reasonable without concrete evidence
            of a violation of law. If we become aware of any infringements, we will remove such links immediately.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">Copyright</h2>
          <p>
            The content and works created by the site operators on these pages are subject to copyright law.
            Duplication, processing, distribution, or any form of commercialization of such material beyond the scope of
            the copyright law shall require the prior written consent of its respective author or creator. Downloads and
            copies of this site are only permitted for private, non-commercial use.
          </p>
          <p>
            Insofar as the content on this site was not created by the operator, the copyrights of third parties are
            respected. In particular, third-party content is marked as such. Should you nevertheless become aware of a
            copyright infringement, please inform us accordingly. If we become aware of any infringements, we will
            remove such content immediately.
          </p>
        </div>
      </div>
    </div>
  )
}

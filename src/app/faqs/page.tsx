import type { Metadata } from "next";
import { PublicPage, PageHeading } from "@/components/public/PublicPage";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description: "Answers about Arewa for Asiwaju and participation in the movement.",
  alternates: { canonical: "/faqs" },
};

const questions = [
  [
    "What is Arewa for Asiwaju?",
    "The Arewa for Asiwaju Student Wing is the student wing of a political mobilisation and advocacy movement. Its framework focuses on grassroots organisation, policy communication, and community participation across Northern Nigeria.",
  ],
  [
    "Where does the movement operate?",
    "The supplied strategic framework describes a network across the 19 northern states and the Federal Capital Territory, organised through state, LGA, ward, and community structures.",
  ],
  [
    "How can I express interest in participating?",
    "Use the registration page to review the current registration status and share interest when registration is available.",
  ],
  [
    "How can I verify a membership card?",
    "Use the public card verification page and enter or scan the card's verification code. The page is designed to disclose only a validity result.",
  ],
  [
    "Where can I find events and official updates?",
    "Approved public announcements and events are listed on the News and Events pages. If none are shown, no approved item is currently available.",
  ],
];

export default function FAQsPage() {
  return (
    <PublicPage>
      <PageHeading
        eyebrow="Help"
        title="Frequently asked questions"
        intro="Basic information about the movement, participation, and public services."
      />
      <div className="divide-y divide-line border-y border-line">
        {questions.map(([question, answer]) => (
          <details key={question} className="group py-5">
            <summary className="cursor-pointer list-none pr-8 text-lg font-bold text-ink marker:hidden focus-visible:rounded-sm">
              {question}
              <span
                aria-hidden="true"
                className="float-right text-brand-forest group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{answer}</p>
          </details>
        ))}
      </div>
    </PublicPage>
  );
}

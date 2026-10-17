"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronDown } from "lucide-react";

interface FaqItem {
  id: string;
  category: "cards" | "numbers" | "privacy" | "general";
  question: string;
  answer: string;
  actionText?: string;
  actionHref?: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-verify-card",
    category: "cards",
    question: "How do I verify the authenticity of an A4A membership card?",
    answer:
      "Every genuine A4A digital or physical ID card features an official verification QR code and secure validation token. Anyone can scan the QR code using a mobile camera or visit the verification portal to confirm the member's validity status without exposing private personal information.",
    actionText: "Verify a card now",
    actionHref: "/verify-card",
  },
  {
    id: "faq-id-card-download",
    category: "cards",
    question: "How do I download or retrieve my digital ID card?",
    answer:
      "Once your registration is complete, sign in with your registered email address or membership number and the 8-character password you created. Your high-resolution two-sided PDF card will be available immediately for viewing, saving to your phone, or printing.",
    actionText: "Sign in to retrieve card",
    actionHref: "/login",
  },
  {
    id: "faq-membership-number",
    category: "numbers",
    question: "What is my membership number and where do I find it?",
    answer:
      "Your membership number is a standardized alphanumeric identifier (such as A4A-2026-KN-000142) assigned upon registration. It identifies your state chapter and unique member record. It is displayed on your digital card and in your account portal.",
  },
  {
    id: "faq-data-privacy",
    category: "privacy",
    question: "How is my personal data handled and protected?",
    answer:
      "We strictly comply with the Nigeria Data Protection Act (NDPR/NDPA). We only collect details essential for student coordination and card generation. Your photo and sensitive credentials are encrypted using HMAC security tokens, and we never sell or share member data with third-party advertisers.",
    actionText: "Read our privacy notice",
    actionHref: "/privacy",
  },
  {
    id: "faq-card-photo-privacy",
    category: "privacy",
    question: "Does the movement store the photo I use for my movement banner?",
    answer:
      "No. When you use the A4A Banner Generator, your photo is processed 100% locally on your phone or computer using client-side canvas technology. Your image is never uploaded to any external server or saved in a remote database.",
    actionText: "Make your banner",
    actionHref: "/banner-generator",
  },
  {
    id: "faq-eligibility",
    category: "general",
    question: "Who is eligible to join the Arewa for Asiwaju Student Wing?",
    answer:
      "Membership is open to all university, polytechnic, monotechnic, and college of education students, as well as youth apprentices and recent graduates across the 19 northern states and the Federal Capital Territory.",
    actionText: "Register your membership",
    actionHref: "/register",
  },
  {
    id: "faq-card-cost",
    category: "cards",
    question: "Is there any fee to register or generate a membership card?",
    answer:
      "No. Membership registration and digital ID card generation are completely free for all students. Beware of anyone asking for payment or processing fees on behalf of the movement.",
  },
  {
    id: "faq-update-profile",
    category: "numbers",
    question: "Can I update my campus or LGA details if I relocate?",
    answer:
      "Yes. Once signed into the member self-service portal, you can submit an update for your institution, state of residence, or local government council. Changes are recorded in your verified membership record.",
    actionText: "Access Member Portal",
    actionHref: "/portal",
  },
];

export function FaqAccordion() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="space-y-8">
      {/* Search Input & Category Filters */}
      <div className="space-y-4">
        <div className="relative max-w-xl">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions about cards, numbers, privacy..."
            className="field-control pl-10 text-sm"
            aria-label="Search frequently asked questions"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter questions by topic">
          {[
            { id: "all", label: "All questions" },
            { id: "cards", label: "ID cards & verification" },
            { id: "numbers", label: "Membership numbers" },
            { id: "privacy", label: "Data privacy" },
            { id: "general", label: "General movement" },
          ].map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-xs px-3 py-1.5 text-xs font-bold transition-colors ${
                  isSelected
                    ? "bg-brand-forest text-white"
                    : "border border-line bg-surface text-ink hover:border-brand-forest"
                }`}
                aria-pressed={isSelected}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion List */}
      {filteredFaqs.length === 0 ? (
        <div className="rounded-md border border-line bg-surface p-8 text-center">
          <p className="font-bold text-ink">No questions matched &ldquo;{searchQuery}&rdquo;</p>
          <p className="mt-1 text-sm text-muted">
            Try adjusting your search terms or reach out directly to student support.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
            }}
            className="button-secondary mt-4 text-xs"
          >
            Clear search filters
          </button>
        </div>
      ) : (
        <div className="divide-y divide-line rounded-md border border-line bg-surface">
          {filteredFaqs.map((faq) => (
            <details key={faq.id} className="group p-5 sm:p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-ink transition-colors group-hover:text-brand-forest focus-visible:outline-2 focus-visible:outline-offset-2">
                <span className="text-base sm:text-lg">{faq.question}</span>
                <ChevronDown
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-brand-forest transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <div className="mt-3.5 space-y-3 text-sm leading-relaxed text-muted sm:text-base">
                <p>{faq.answer}</p>
                {faq.actionText && faq.actionHref && (
                  <div className="pt-1">
                    <Link
                      href={faq.actionHref}
                      className="inline-flex items-center font-bold text-brand-forest underline-offset-4 hover:underline"
                    >
                      {faq.actionText}
                    </Link>
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Seed script for initial news placeholders.
 * These are marked placeholders intended to be replaced by real editorial CMS entries.
 */

// PLACEHOLDER: 4 structured placeholder articles for development and preview
export const placeholderAnnouncements = [
  // PLACEHOLDER
  {
    title: "NELFUND Student Loan Access: Guidance for Northern Undergraduates",
    slug: "nelfund-student-loan-guidance-northern-undergraduates",
    category: "education",
    excerpt:
      "A step-by-step breakdown of the Nigeria Education Loan Fund application requirements for students across universities, polytechnics, and colleges in the North.",
    content:
      "With over 450,000 students already benefiting from NELFUND loan disbursements across 218 tertiary institutions, student delegates from the Arewa for Asiwaju Student Wing are conducting campus helpdesks to ensure eligible candidates submit verified applications without delays.\n\nStudents are encouraged to confirm their JAMB registration number, National Identification Number (NIN), and Bank Verification Number (BVN) before submitting details via the official portal.",
    cover_image: "/brand/arewa-for-asiwaju-a4a.jpg",
    published_at: "2026-03-10T10:00:00.000Z",
  },
  // PLACEHOLDER
  {
    title: "Renewed Hope Agrarian Support: Youth in Northern Agriculture Forum",
    slug: "renewed-hope-agrarian-support-youth-northern-agriculture-forum",
    category: "agriculture",
    excerpt:
      "Campus coordinators host a symposium examining modern irrigation, dry-season farming grants, and tractor mechanisation initiatives.",
    content:
      "Young farmers and agricultural science scholars gathered in Kano to examine regional implementation of federal food security interventions.\n\nDelegates highlighted opportunities in dry-season wheat production, automated grain silos, and micro-credit financing geared towards cooperative youth ventures.",
    cover_image: null,
    published_at: "2026-03-04T14:30:00.000Z",
  },
  // PLACEHOLDER
  {
    title: "North-West Zonal Student Summit Announced for Kaduna",
    slug: "north-west-zonal-student-summit-announced-kaduna",
    category: "movement",
    excerpt:
      "Student union leaders and campus coordinators from seven North-West states meet to align on 2027 civic participation drives.",
    content:
      "The zonal coordination council has scheduled a delegates forum bringing together representatives from tertiary institutions in Kaduna, Kano, Katsina, Jigawa, Kebbi, Sokoto, and Zamfara.\n\nDiscussions will centre on campus peace initiatives, digital skill acquisitions, and voter education.",
    cover_image: null,
    published_at: "2026-02-25T09:00:00.000Z",
  },
  // PLACEHOLDER
  {
    title: "National Digital Economy Training: Student Wing Enrolment Opens",
    slug: "national-digital-economy-training-student-wing-enrolment",
    category: "technology",
    excerpt:
      "Free certification programs in software development, AI foundations, and digital marketing made available for student wing members.",
    content:
      "Through partnerships with regional innovation hubs, A4A members can access subsidised tech certification tracks designed to boost undergraduate employability and remote freelancing skills across the 19 northern states.",
    cover_image: null,
    published_at: "2026-02-18T16:00:00.000Z",
  },
];

console.log(
  `Configured ${placeholderAnnouncements.length} placeholder announcements ready for CMS upload.`,
);

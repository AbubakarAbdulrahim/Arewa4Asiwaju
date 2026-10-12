import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-[#17241c] text-white">
      <div className="site-container grid gap-9 py-10 sm:grid-cols-[1.4fr_1fr] sm:py-12">
        <div>
          <Link
            href="/"
            className="inline-block text-base font-extrabold tracking-tight text-white no-underline sm:text-lg"
          >
            AREWA FOR ASIWAJU <span className="text-[#f08b65]">STUDENT WING</span>
          </Link>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75">
            The student wing of a political mobilisation and advocacy movement connecting policy
            priorities with communities across Northern Nigeria.
          </p>
        </div>
        <nav
          aria-label="Footer navigation"
          className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:justify-self-end"
        >
          <Link
            className="text-white/85 underline-offset-4 hover:text-white hover:underline"
            href="/about"
          >
            About Student Wing
          </Link>
          <Link
            className="text-white/85 underline-offset-4 hover:text-white hover:underline"
            href="/mission"
          >
            Our mission
          </Link>
          <Link
            className="text-white/85 underline-offset-4 hover:text-white hover:underline"
            href="/leadership"
          >
            Leadership
          </Link>
          <Link
            className="text-white/85 underline-offset-4 hover:text-white hover:underline"
            href="/news"
          >
            News
          </Link>
          <Link
            className="text-white/85 underline-offset-4 hover:text-white hover:underline"
            href="/events"
          >
            Events
          </Link>
          <Link
            className="text-white/85 underline-offset-4 hover:text-white hover:underline"
            href="/banner-generator"
          >
            Create your banner
          </Link>
          <Link
            className="text-white/85 underline-offset-4 hover:text-white hover:underline"
            href="/faqs"
          >
            FAQs
          </Link>
          <Link
            className="text-white/85 underline-offset-4 hover:text-white hover:underline"
            href="/contact"
          >
            Contact
          </Link>
          <Link
            className="text-white/85 underline-offset-4 hover:text-white hover:underline"
            href="/privacy"
          >
            Privacy
          </Link>
          <Link
            className="text-white/85 underline-offset-4 hover:text-white hover:underline"
            href="/terms"
          >
            Terms
          </Link>
          <Link
            className="text-white/85 underline-offset-4 hover:text-white hover:underline"
            href="/register"
          >
            Join the movement
          </Link>
          <Link
            className="text-white/85 underline-offset-4 hover:text-white hover:underline"
            href="/verify-card"
          >
            Card verification
          </Link>
          <Link
            className="text-white/85 underline-offset-4 hover:text-white hover:underline"
            href="/retrieve-id"
          >
            Retrieve membership ID
          </Link>
        </nav>
      </div>
      <div className="border-t border-white/15">
        <div className="site-container flex flex-col gap-2 py-4 text-xs text-white/65 sm:flex-row sm:items-center sm:justify-between">
          <p>© Arewa for Asiwaju.</p>
          <Link
            href="/ha"
            className="text-white/75 underline-offset-4 hover:text-white hover:underline"
          >
            Hausa version
          </Link>
        </div>
      </div>
    </footer>
  );
}

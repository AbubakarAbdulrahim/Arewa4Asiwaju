import { MessageCircle } from "lucide-react";

const whatsappUrl = "https://whatsapp.com/channel/0029VbE1V4DLSmbcjpYAbH0G";

export function WhatsAppFab() {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Follow Arewa for Asiwaju Student Wing on WhatsApp"
      title="Follow Arewa for Asiwaju on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-forest text-white shadow-lg transition-colors hover:bg-brand-forest-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-forest sm:bottom-7 sm:right-7"
    >
      <MessageCircle
        aria-hidden="true"
        className="h-6 w-6 text-white"
        stroke="white"
        strokeWidth={2.2}
      />
    </a>
  );
}

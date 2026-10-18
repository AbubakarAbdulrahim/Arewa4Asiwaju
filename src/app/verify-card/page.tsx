import { Footer } from "@/components/layout/Footer";
import { VerifyCardContent } from "@/components/public/VerifyCardForm";

export default function VerifyCardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <VerifyCardContent />
      <Footer />
    </div>
  );
}

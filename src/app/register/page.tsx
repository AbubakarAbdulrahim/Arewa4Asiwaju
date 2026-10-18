import { Footer } from "@/components/layout/Footer";
import { RegistrationForm } from "@/components/public/RegistrationForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <RegistrationForm />
      <Footer />
    </div>
  );
}

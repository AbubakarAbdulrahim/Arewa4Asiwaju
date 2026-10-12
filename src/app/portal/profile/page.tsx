import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/portal/PortalActions";

export const instant = false;

export default async function MemberProfilePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("first_name,middle_name,last_name,full_name,email,state_of_residence,lga_of_residence")
    .eq("id", user.id)
    .single();
  return (
    <section>
      <h2 className="text-xl font-bold">Profile details</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Keep your name and current residence accurate. Email and membership status are managed
        through verified account workflows and cannot be changed here.
      </p>
      {error || !profile ? (
        <p className="mt-5 border border-red-300 bg-red-50 p-4 text-sm text-red-900" role="alert">
          Your profile could not be loaded. Refresh the page or contact support.
        </p>
      ) : (
        <div className="mt-6 max-w-2xl">
          <ProfileForm
            profile={{
              firstName: profile.first_name,
              middleName: profile.middle_name ?? "",
              lastName: profile.last_name,
              email: profile.email,
              state: profile.state_of_residence,
              lga: profile.lga_of_residence,
            }}
          />
        </div>
      )}
    </section>
  );
}

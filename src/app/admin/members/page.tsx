import type { Metadata } from "next";
import { MembersWorkspace } from "@/components/admin/MembersWorkspace";
import { getAdminSession, canAdminister } from "@/lib/admin/server";

export const metadata: Metadata = { title: "Member management" };
export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const allowedStatuses = ["pending_verification", "active", "suspended", "flagged", "revoked"];
  const initialStatus = allowedStatuses.includes(params.status ?? "") ? (params.status ?? "") : "";
  const { roles } = await getAdminSession();
  const canChangeStatus = canAdminister(roles, ["super_admin", "membership_officer"]);
  return (
    <div>
      <p className="eyebrow">People</p>
      <h2 className="section-title mt-2">Members</h2>
      <p className="mt-2 max-w-3xl text-sm text-muted">
        Find a member by name or membership number. Results are limited to 25 per page and only
        include the areas assigned to your account.
      </p>
      <div className="mt-5">
        <MembersWorkspace
          canChangeStatus={canChangeStatus}
          canExport={canChangeStatus}
          initialStatus={initialStatus}
        />
      </div>
    </div>
  );
}

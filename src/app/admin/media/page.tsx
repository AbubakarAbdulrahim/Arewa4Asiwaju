import { AdminActionForm, AdminDataTable } from "@/components/admin/AdminActionForm";
import { getAdminSession } from "@/lib/admin/server";

export default async function MediaAdminPage() {
  const { supabase } = await getAdminSession();
  const { data, error } = await supabase.rpc("admin_list_media");
  const rows = !error && Array.isArray(data) ? (data as unknown as Record<string, unknown>[]) : [];
  return (
    <div>
      <p className="eyebrow">Publishing</p>
      <h2 className="section-title mt-2">Media library</h2>
      <p className="mt-2 text-sm text-muted">
        Manage approved HTTPS media references and accessible descriptions. File upload remains
        unavailable until the storage buckets and policies are configured.
      </p>
      {error && (
        <p role="status" className="notice mt-4">
          Media management is pending the Phase 7 database migration.
        </p>
      )}
      <div className="mt-5">
        <AdminDataTable
          columns={["id", "title", "asset_type", "asset_url", "alt_text", "is_published"]}
          rows={rows}
        />
      </div>
      <div className="mt-6">
        <AdminActionForm
          title="Create or update a media record"
          action="media.save"
          fields={[
            { name: "id", label: "Media record UUID when updating" },
            { name: "title", label: "Title", required: true },
            {
              name: "assetType",
              label: "Asset type",
              type: "select",
              required: true,
              options: ["image", "video", "document"],
            },
            { name: "assetUrl", label: "Approved HTTPS asset URL", type: "url", required: true },
            { name: "isPublished", label: "Publish", type: "checkbox" },
            { name: "altText", label: "Accessible alt text", type: "textarea", required: true },
            { name: "description", label: "Description", type: "textarea" },
          ]}
        />
      </div>
    </div>
  );
}

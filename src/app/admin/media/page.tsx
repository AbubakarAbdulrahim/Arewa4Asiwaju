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
        Add a media title, accessible description, and a publicly viewable file link. Direct file
        uploads are not available yet.
      </p>
      {error && (
        <p role="status" className="notice mt-4">
          Media information is not available right now. Refresh this page or contact the system
          administrator.
        </p>
      )}
      <div className="mt-5">
        <AdminDataTable columns={["title", "asset_type", "alt_text", "is_published"]} rows={rows} />
      </div>
      <div className="mt-6">
        <AdminActionForm
          title="Create or update a media record"
          action="media.save"
          records={rows}
          fields={[
            {
              name: "id",
              label: "Media item to update (leave blank to add)",
              type: "select",
              options: rows.map((row) => ({ value: String(row.id), label: String(row.title) })),
            },
            { name: "title", label: "Title", required: true },
            {
              name: "assetType",
              label: "Asset type",
              type: "select",
              required: true,
              options: ["image", "video", "document"],
            },
            {
              name: "assetUrl",
              label: "Public file link",
              type: "url",
              required: true,
              helpText: "Paste a secure, publicly viewable link to the image, video, or document.",
            },
            { name: "isPublished", label: "Publish", type: "checkbox" },
            { name: "altText", label: "Accessible alt text", type: "textarea", required: true },
            { name: "description", label: "Description", type: "textarea" },
          ]}
        />
      </div>
    </div>
  );
}

import { AdminActionForm, AdminDataTable } from "@/components/admin/AdminActionForm";
import { getAdminSession } from "@/lib/admin/server";

export default async function ContentAdminPage() {
  const { supabase } = await getAdminSession();
  const { data, error } = await supabase.rpc("admin_list_content", { p_page: 1, p_page_size: 50 });
  const result = Array.isArray(data)
    ? (data[0] as { items?: Record<string, unknown>[] } | undefined)
    : undefined;
  const rows = !error && Array.isArray(result?.items) ? result.items : [];
  return (
    <div>
      <p className="eyebrow">Publishing</p>
      <h2 className="section-title mt-2">News and announcements</h2>
      <p className="mt-2 text-sm text-muted">
        Write news or notices, review the preview details, then publish to the public News page.
      </p>
      {error && (
        <p role="status" className="notice mt-4">
          News and notice information is not available right now. Refresh this page or contact the
          system administrator.
        </p>
      )}
      <div className="mt-5">
        <AdminDataTable
          columns={["title", "category", "is_published", "published_at"]}
          rows={rows}
        />
      </div>
      <div className="mt-6">
        <AdminActionForm
          title="Create or update a news item"
          action="content.save"
          records={rows}
          fields={[
            {
              name: "id",
              label: "News item to update (leave blank to create)",
              type: "select",
              options: rows.map((row) => ({
                value: String(row.id),
                label: `${String(row.title)} · ${row.is_published ? "Published" : "Draft"}`,
              })),
            },
            { name: "title", label: "Title", required: true },
            {
              name: "slug",
              label: "Page link (lowercase words separated by hyphens)",
              required: true,
              placeholder: "e.g. student-wing-update",
            },
            {
              name: "category",
              label: "Category",
              type: "select",
              required: true,
              options: ["announcement", "press_release", "campaign", "editorial"],
            },
            { name: "authorName", label: "Byline", required: true },
            {
              name: "coverImage",
              label: "Cover image URL",
              type: "url",
              helpText:
                "Use a public HTTPS image URL from the configured Supabase Storage project.",
            },
            { name: "isPublished", label: "Publish now", type: "checkbox" },
            { name: "excerpt", label: "Short summary", type: "textarea", required: true },
            { name: "content", label: "Article content", type: "textarea", required: true },
          ]}
        />
      </div>
    </div>
  );
}

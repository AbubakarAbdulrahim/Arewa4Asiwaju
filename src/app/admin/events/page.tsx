import { AdminActionForm, AdminDataTable } from "@/components/admin/AdminActionForm";
import { EventAttendancePanel } from "@/components/admin/EventAttendancePanel";
import { getAdminSession } from "@/lib/admin/server";

export default async function EventsAdminPage() {
  const { supabase } = await getAdminSession();
  const [{ data, error }, { data: unitsData }] = await Promise.all([
    supabase.rpc("admin_list_events", { p_page: 1, p_page_size: 50 }),
    supabase.rpc("admin_list_units"),
  ]);
  const result = Array.isArray(data)
    ? (data[0] as { items?: Record<string, unknown>[] } | undefined)
    : undefined;
  const rows = !error && Array.isArray(result?.items) ? result.items : [];
  const units = Array.isArray(unitsData) ? (unitsData as Record<string, unknown>[]) : [];
  return (
    <div>
      <p className="eyebrow">Activities</p>
      <h2 className="section-title mt-2">Events</h2>
      <p className="mt-2 text-sm text-muted">
        Add an activity, set its date and location, and choose whether it should appear publicly.
        You can also record attendance below.
      </p>
      {error && (
        <p role="status" className="notice mt-4">
          Event information is not available right now. Refresh this page or contact the system
          administrator.
        </p>
      )}
      <div className="mt-5">
        <AdminDataTable
          columns={["title", "category", "start_date", "is_published", "state_code"]}
          rows={rows}
        />
      </div>
      <div className="mt-6">
        <AdminActionForm
          title="Create or update an event"
          action="event.save"
          records={rows}
          fields={[
            {
              name: "id",
              label: "Event to update (leave blank to create)",
              type: "select",
              options: rows.map((row) => ({
                value: String(row.id),
                label: `${String(row.title)} · ${String(row.start_date).slice(0, 10)}`,
              })),
            },
            { name: "title", label: "Title", required: true },
            {
              name: "slug",
              label: "Page link (lowercase words separated by hyphens)",
              required: true,
              placeholder: "e.g. kano-student-townhall",
            },
            {
              name: "category",
              label: "Category",
              type: "select",
              required: true,
              options: ["rally", "symposium", "training", "outreach", "meeting"],
            },
            { name: "venue", label: "Venue or meeting details", required: true },
            {
              name: "bannerUrl",
              label: "Event photo or flyer URL",
              type: "url",
              helpText:
                "Use a public HTTPS image URL from the configured Supabase Storage project.",
            },
            { name: "stateCode", label: "State code", required: true },
            { name: "lgaName", label: "LGA" },
            {
              name: "orgUnitId",
              label: "Local group (optional)",
              type: "select",
              options: units.map((unit) => ({
                value: String(unit.id),
                label: `${String(unit.name)} · ${String(unit.type).replaceAll("_", " ")}`,
              })),
            },
            { name: "startDate", label: "Start", type: "datetime-local", required: true },
            { name: "endDate", label: "End", type: "datetime-local", required: true },
            { name: "capacity", label: "Registration capacity", type: "number" },
            { name: "virtualLink", label: "Online event URL", type: "url" },
            { name: "isVirtual", label: "Online event", type: "checkbox" },
            { name: "isPublished", label: "Publish event", type: "checkbox" },
            { name: "description", label: "Description", type: "textarea", required: true },
          ]}
        />
      </div>
      <EventAttendancePanel
        events={rows.map((row) => ({
          id: String(row.id),
          title: String(row.title),
          startDate: String(row.start_date),
        }))}
      />
    </div>
  );
}

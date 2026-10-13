import { AdminActionForm, AdminDataTable } from "@/components/admin/AdminActionForm";
import { EventAttendancePanel } from "@/components/admin/EventAttendancePanel";
import { getAdminSession } from "@/lib/admin/server";

export default async function EventsAdminPage() {
  const { supabase } = await getAdminSession();
  const { data, error } = await supabase.rpc("admin_list_events", { p_page: 1, p_page_size: 50 });
  const result = Array.isArray(data)
    ? (data[0] as { items?: Record<string, unknown>[] } | undefined)
    : undefined;
  const rows = !error && Array.isArray(result?.items) ? result.items : [];
  return (
    <div>
      <p className="eyebrow">Activities</p>
      <h2 className="section-title mt-2">Events</h2>
      <p className="mt-2 text-sm text-muted">
        Create and update events, publication status, capacity, and organisational scope. Attendance
        reporting requires the event-attendance query from the database phase.
      </p>
      {error && (
        <p role="status" className="notice mt-4">
          Event management data is pending the Phase 7 migration.
        </p>
      )}
      <div className="mt-5">
        <AdminDataTable
          columns={[
            "id",
            "title",
            "state_code",
            "start_date",
            "end_date",
            "capacity",
            "is_published",
            "org_unit_id",
          ]}
          rows={rows}
        />
      </div>
      <div className="mt-6">
        <AdminActionForm
          title="Create an event"
          action="event.save"
          fields={[
            { name: "id", label: "Event UUID when updating" },
            { name: "title", label: "Title", required: true },
            { name: "slug", label: "URL slug", required: true },
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
              helpText: "Use a public HTTPS image URL from the configured Supabase Storage project.",
            },
            { name: "stateCode", label: "State code", required: true },
            { name: "lgaName", label: "LGA" },
            { name: "orgUnitId", label: "Organisational unit UUID" },
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
      <EventAttendancePanel />
    </div>
  );
}

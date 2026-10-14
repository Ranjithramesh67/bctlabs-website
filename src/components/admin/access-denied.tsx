import { AdminSection } from "@/components/admin/ui";

/** Rendered when the current user lacks the permission the route requires. */
export function AccessDenied() {
  return (
    <AdminSection title="403">
      <div className="card">
        <div className="card-body text-center">
          <p className="mb-0">
            Sorry, you are not authorized to access this page.
          </p>
        </div>
      </div>
    </AdminSection>
  );
}

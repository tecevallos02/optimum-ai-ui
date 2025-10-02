// path: src/app/app/calendar/page.tsx
import type { Appointment } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";

export default async function CalendarPage() {
  // fetcher returns Appointment[] | null → default to []
  const appointments = (await fetcher<Appointment[]>("/api/appointments")) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Calendar</h1>
      <p>Calendar view placeholder. List of appointments:</p>

      {appointments.length === 0 ? (
        <div className="mt-4 text-sm text-muted">No appointments yet.</div>
      ) : (
        <ul className="mt-4 space-y-2">
          {appointments.map((appt) => (
            <li key={appt.id} className="bg-white p-4 rounded shadow-card">
              <strong>{new Date(appt.start).toLocaleString()}</strong> –{" "}
              <span>{appt.attendee.name}</span>{" "}
              <span className="uppercase text-sm opacity-70">({appt.status})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

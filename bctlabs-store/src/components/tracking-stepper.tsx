import { clsx } from "clsx";

import { shipmentStatusLabel } from "@/lib/format";

type TimelineEvent = {
  status: string;
  occurredAt: Date | string;
  rawStatus?: string | null;
};

type Milestone = {
  key: string;
  label: string;
  timeStatuses: string[];
};

const MILESTONES: Milestone[] = [
  { key: "placed", label: "Order placed", timeStatuses: [] },
  { key: "created", label: "Shipment created", timeStatuses: ["CREATED", "PICKUP_SCHEDULED"] },
  { key: "picked-up", label: "Picked up", timeStatuses: ["PICKED_UP"] },
  { key: "in-transit", label: "In transit", timeStatuses: ["IN_TRANSIT"] },
  { key: "out-for-delivery", label: "Out for delivery", timeStatuses: ["OUT_FOR_DELIVERY"] },
  { key: "delivered", label: "Delivered", timeStatuses: ["DELIVERED"] },
];

const NORMAL_STEPS: Record<string, number> = {
  CREATED: 1,
  PICKUP_SCHEDULED: 1,
  PICKED_UP: 2,
  IN_TRANSIT: 3,
  OUT_FOR_DELIVERY: 4,
  DELIVERED: 5,
};

const TERMINAL_STATES: Record<string, { label: string; tone: "red" | "amber"; step: number }> = {
  RTO_IN_TRANSIT: { label: "Returning to origin", tone: "amber", step: 3 },
  RTO_DELIVERED: { label: "Returned to origin", tone: "red", step: 4 },
  CANCELLED: { label: "Shipment cancelled", tone: "red", step: 1 },
  EXCEPTION: { label: "Delivery exception", tone: "amber", step: 1 },
};

function stepForStatus(value: string): number {
  const upper = value.toUpperCase();
  if (TERMINAL_STATES[upper]) return TERMINAL_STATES[upper].step;
  return NORMAL_STEPS[upper] ?? 0;
}

function latestEventTime(timeline: TimelineEvent[], statuses: string[]): string | null {
  if (!statuses.length) return null;
  // Statuses are ordered by preference: e.g. CREATED before PICKUP_SCHEDULED.
  for (const wanted of statuses) {
    let latest: Date | null = null;
    for (const event of timeline) {
      if (event.status.toUpperCase() !== wanted) continue;
      const occurredAt =
        event.occurredAt instanceof Date ? event.occurredAt : new Date(event.occurredAt);
      if (Number.isNaN(occurredAt.getTime())) continue;
      if (!latest || occurredAt.getTime() > latest.getTime()) latest = occurredAt;
    }
    if (latest) return latest.toLocaleString("en-IN");
  }

  return null;
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="m5 12 4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Server-safe vertical progress tracker for a single shipment.
 * Fixed milestones keep customer-facing wording stable across couriers.
 */
export function TrackingStepper({ status, timeline }: { status: string; timeline: TimelineEvent[] }) {
  const normalized = status.toUpperCase();
  const terminal = TERMINAL_STATES[normalized] ?? null;

  let reached = terminal ? terminal.step : Math.max(1, stepForStatus(normalized));
  for (const event of timeline) {
    reached = Math.max(reached, stepForStatus(event.status));
  }

  // Terminal states replace the remaining milestones with one explicit outcome.
  const normalMilestones = terminal ? MILESTONES.slice(0, Math.min(reached + 1, 5)) : MILESTONES;
  const items: Milestone[] = terminal
    ? [...normalMilestones, { key: "terminal", label: terminal.label, timeStatuses: [normalized] }]
    : normalMilestones;
  const currentIndex = terminal ? items.length - 1 : reached;
  const statusText = terminal ? terminal.label : shipmentStatusLabel(status);

  return (
    <ol aria-label="Shipment progress" className="mt-5">
      {items.map((milestone, index) => {
        const isLast = index === items.length - 1;
        const isTerminalStep = Boolean(terminal) && isLast;
        const isCurrent = index === currentIndex;
        const completed = !isTerminalStep && index <= reached;
        const lineActive = !isLast && index < reached;
        const occurredAt = latestEventTime(timeline, milestone.timeStatuses);
        const stateWord = isCurrent ? "Current step" : completed ? "Completed" : "Pending";

        return (
          <li
            key={milestone.key}
            aria-current={isCurrent ? "step" : undefined}
            className="flex gap-4"
          >
            <div className="flex flex-col items-center" aria-hidden="true">
              <span
                className={clsx(
                  "flex h-8 w-8 flex-none items-center justify-center rounded-full border-2",
                  isTerminalStep && terminal?.tone === "red" && "border-rose-600 bg-rose-600 text-white",
                  isTerminalStep && terminal?.tone === "amber" && "border-amber-500 bg-amber-500 text-white",
                  !isTerminalStep && completed && "border-brand-600 bg-brand-600 text-white",
                  !isTerminalStep && !completed && "border-slate-300 bg-white",
                )}
              >
                {isTerminalStep ? (
                  <span className="text-sm font-bold">!</span>
                ) : completed ? (
                  <CheckIcon />
                ) : null}
              </span>
              {!isLast ? (
                <span
                  className={clsx(
                    "my-1 w-0.5 flex-1 rounded-full",
                    lineActive ? "bg-brand-600" : "bg-slate-200",
                  )}
                />
              ) : null}
            </div>

            <div className={clsx("min-w-0", !isLast && "pb-8")}>
              <p
                className={clsx(
                  "pt-1 text-sm",
                  isTerminalStep
                    ? terminal?.tone === "red"
                      ? "font-semibold text-rose-700"
                      : "font-semibold text-amber-700"
                    : isCurrent
                      ? "font-semibold text-slate-900"
                      : completed
                        ? "font-medium text-slate-800"
                        : "text-slate-400",
                )}
              >
                {milestone.label}
              </p>
              <span className="sr-only">{stateWord}. </span>
              {occurredAt ? (
                <p className="mt-0.5 text-xs text-slate-500">{occurredAt}</p>
              ) : !completed && !isCurrent ? (
                <p className="mt-0.5 text-xs text-slate-400">Pending</p>
              ) : null}
              {isCurrent ? (
                <p
                  className={clsx(
                    "mt-0.5 text-xs font-semibold",
                    isTerminalStep
                      ? terminal?.tone === "red"
                        ? "text-rose-700"
                        : "text-amber-700"
                      : "text-brand-700",
                  )}
                >
                  Current: {statusText}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

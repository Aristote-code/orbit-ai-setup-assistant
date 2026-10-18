export type Status = "pending" | "accepted" | "edited" | "dismissed";
export type Suggestion = {
  id: string;
  kind: "name" | "template" | "task";
  title: string;
  reason: string;
  status: Status;
  date: string;
};
export type Project = {
  id: string;
  name: string;
  description: string;
  template: string;
  tasks: { id: string; title: string; date: string; done: boolean }[];
  created: string;
};
export type Draft = {
  generatedPrompt?: string;
  prompt: string;
  step: "describe" | "review" | "confirm" | "blank";
  suggestions: Suggestion[];
  blankName: string;
};
export const emptyDraft: Draft = {
  prompt: "",
  step: "describe",
  suggestions: [],
  blankName: "",
};
export function propose(prompt: string): Suggestion[] {
  const p = prompt.toLowerCase();
  const review = /review|supplier|audit|evaluation/.test(p),
    launch = /launch|release|product/.test(p),
    event = /event|workshop|conference/.test(p);
  const title = review
    ? p.includes("supplier")
      ? "Regional Supplier Review"
      : "Project Review"
    : launch
      ? "Product Launch"
      : event
        ? "Team Event"
        : "New Project";
  const quarter = prompt.match(/\bq[1-4]\b/i)?.[0].toUpperCase();
  const name =
    review || launch || event
      ? `${quarter ? quarter + " " : ""}${title}`
      : prompt
          .replace(/[.!?].*$/, "")
          .trim()
          .slice(0, 75);
  const tasks = review
    ? [
        "Define evaluation criteria",
        "Collect supplier scorecards",
        "Review regional performance",
        "Identify supplier risks",
        "Prepare recommendations",
      ]
    : launch
      ? [
          "Define launch goals and success metrics",
          "Confirm the scope and launch checklist",
          "Prepare messaging and launch assets",
          "Coordinate the release across teams",
          "Review launch performance",
        ]
      : event
        ? [
            "Define the agenda and objectives",
            "Confirm venue and logistics",
            "Invite participants",
            "Prepare materials and run the event",
            "Collect feedback and share next steps",
          ]
        : [
            "Define goals and success criteria",
            "Confirm scope and stakeholders",
            "Break down the work and assign owners",
            "Review progress and resolve blockers",
            "Deliver the project and capture learnings",
          ];
  return [
    {
      id: "name",
      kind: "name",
      title: name,
      reason: "A concise working title based on your description.",
      status: "pending",
      date: "",
    },
    {
      id: "template",
      kind: "template",
      title: review
        ? "Supplier Performance Review"
        : launch
          ? "Product Launch Plan"
          : event
            ? "Event Planning"
            : "General Project",
      reason:
        "Suggested starting structure. Change or remove it to suit your team.",
      status: "pending",
      date: "",
    },
    ...tasks.map((title, i) => ({
      id: "task-" + i,
      kind: "task" as const,
      title,
      reason:
        "A suggested milestone to help organize the work. Confirm scope and timing with your team.",
      status: "pending" as const,
      date: "",
    })),
  ];
}
export function toProject(draft: Draft): Project {
  const included = draft.suggestions.filter(
    (s) => s.status === "accepted" || s.status === "edited",
  );
  return {
    id: crypto.randomUUID(),
    name:
      included.find((s) => s.kind === "name")?.title ||
      draft.blankName.trim() ||
      "Untitled project",
    description: draft.prompt,
    template: included.find((s) => s.kind === "template")?.title || "",
    tasks: included
      .filter((s) => s.kind === "task")
      .map((s) => ({ id: s.id, title: s.title, date: s.date, done: false })),
    created: new Date().toISOString(),
  };
}
export const dateLabel = (value: string) =>
  value
    ? new Date(value + "T12:00:00").toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "No due date";

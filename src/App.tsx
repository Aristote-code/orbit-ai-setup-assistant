import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Ticket01Icon,
  PlusSignIcon,
  ArrowRight01Icon,
  ArrowLeft02Icon,
  AiScanIcon,
  Tick02Icon,
  Cancel01Icon,
  PencilEdit01Icon,
  Calendar01Icon,
  File01Icon,
  Search01Icon,
  InformationCircleIcon,
  Download01Icon,
} from "@hugeicons/core-free-icons";
import { Icon as HugeIcon } from "./components/Icon";
import * as Button from "./components/ui/fancy-button";
import * as Checkbox from "./components/ui/checkbox";
import * as Input from "./components/ui/input";
import * as Textarea from "./components/ui/textarea";
import {
  emptyDraft,
  propose,
  toProject,
  dateLabel,
  type Draft,
  type Suggestion,
  type Project,
  type Status,
} from "./model";

type IconName =
  | "grid"
  | "plus"
  | "arrow"
  | "back"
  | "spark"
  | "check"
  | "close"
  | "edit"
  | "clock"
  | "folder"
  | "search"
  | "chevron"
  | "file"
  | "help"
  | "download";
const iconMap = {
  grid: Ticket01Icon,
  plus: PlusSignIcon,
  arrow: ArrowRight01Icon,
  back: ArrowLeft02Icon,
  spark: AiScanIcon,
  check: Tick02Icon,
  close: Cancel01Icon,
  edit: PencilEdit01Icon,
  clock: Calendar01Icon,
  folder: File01Icon,
  search: Search01Icon,
  chevron: ArrowRight01Icon,
  file: File01Icon,
  help: InformationCircleIcon,
  download: Download01Icon,
};
function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return <HugeIcon icon={iconMap[name]} size={size} />;
}
function Action({
  children,
  icon,
  variant = "basic",
  ...props
}: React.ComponentProps<typeof Button.Root> & { icon?: IconName }) {
  return (
    <Button.Root variant={variant} {...props}>
      {icon && <Button.Icon as={Icon} name={icon} />}
      <span>{children}</span>
    </Button.Root>
  );
}
function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="field">
      <label htmlFor={props.id || label}>{label}</label>
      <Input.Root>
        <Input.Wrapper>
          <Input.Input {...props} id={props.id || label} />
        </Input.Wrapper>
      </Input.Root>
    </div>
  );
}
function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function Modal({
  children,
  title,
  onClose,
}: {
  children: ReactNode;
  title: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label={title}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function App() {
  const [projects, setProjects] = useState<Project[]>(() =>
    load("orbit-projects-v1", []),
  );
  const [draft, setDraft] = useState<Draft>(() =>
    load("orbit-draft-v1", emptyDraft),
  );
  const [view, setView] = useState<"setup" | "projects" | "project">("setup");
  const [activeId, setActiveId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<Suggestion | null>(null);
  const [help, setHelp] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const setupPanel = useRef<HTMLElement>(null);
  useEffect(() => {
    setupPanel.current?.scrollTo({ top: 0 });
  }, [draft.step, view]);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    try {
      localStorage.setItem("orbit-draft-v1", JSON.stringify(draft));
      localStorage.setItem("orbit-projects-v1", JSON.stringify(projects));
      setError("");
    } catch {
      setError(
        "Your browser could not save this workspace. Export your project to keep a copy.",
      );
    }
  }, [draft, projects]);
  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(""), 5000);
      return () => clearTimeout(t);
    }
  }, [notice]);
  const patch = (v: Partial<Draft>) => setDraft((d) => ({ ...d, ...v }));
  const update = (id: string, status: Status) =>
    patch({
      suggestions: draft.suggestions.map((s) =>
        s.id === id ? { ...s, status } : s,
      ),
    });
  const pending = draft.suggestions.filter(
    (s) => s.status === "pending",
  ).length;
  const included = draft.suggestions.filter(
    (s) => s.status === "accepted" || s.status === "edited",
  );
  const nameIncluded = included.some((s) => s.kind === "name");
  const active = projects.find((p) => p.id === activeId);
  function generate(force = false) {
    if (draft.prompt.trim().length < 12) {
      setError(
        "Add a little more detail (at least 12 characters) so there’s something to work with.",
      );
      return;
    }
    if (draft.suggestions.length && !force) {
      if (draft.generatedPrompt === draft.prompt) {
        patch({ step: "review" });
        return;
      }
      setRegenerateOpen(true);
      return;
    }
    setError("");
    setLoading(true);
    timer.current = setTimeout(() => {
      patch({
        suggestions: propose(draft.prompt),
        generatedPrompt: draft.prompt,
        step: "review",
      });
      setLoading(false);
    }, 1100);
  }
  function create() {
    if (draft.step === "blank" && !draft.blankName.trim()) return;
    setLoading(true);
    timer.current = setTimeout(() => {
      const p = toProject(draft);
      setProjects((ps) => [p, ...ps]);
      setActiveId(p.id);
      setDraft({ ...emptyDraft });
      setLoading(false);
      setSuccess(true);
      setView("project");
    }, 650);
  }
  function exportProject(p: Project) {
    const file = new Blob([JSON.stringify(p, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = p.name.replace(/[^a-z0-9]/gi, "-") + ".json";
    a.click();
    URL.revokeObjectURL(url);
    setNotice("Project exported as JSON.");
  }
  function newProject() {
    setSuccess(false);
    setView("setup");
  }
  const step =
    draft.step === "describe" || draft.step === "blank"
      ? 0
      : draft.step === "review"
        ? 1
        : 2;
  return (
    <div className="app-shell">
      <aside className="rail">
        <button
          className="brand"
          aria-label="Orbit projects"
          onClick={() => setView("projects")}
        >
          <img src="/reference/icons/zemo-logo.svg" alt="" />
        </button>
        <nav aria-label="Primary navigation">
          <button
            aria-label="Projects"
            title="Projects"
            className={view !== "setup" ? "active" : ""}
            onClick={() => setView("projects")}
          >
            <img src="/reference/icons/home.svg" alt="" />
          </button>
          <button
            aria-label="Project setup"
            title="Project setup"
            className={view === "setup" ? "active" : ""}
            onClick={newProject}
          >
            <img src="/reference/icons/ticket.svg" alt="" />
          </button>
          <button
            aria-label="About this prototype"
            title="About this prototype"
            onClick={() => setHelp(true)}
          >
            <img src="/reference/icons/chat.svg" alt="" />
          </button>
        </nav>
        <button
          className="profile"
          aria-label="Prototype information"
          onClick={() => setHelp(true)}
        >
          <img src="/reference/icons/user.svg" alt="" />
        </button>
      </aside>
      <div className="main-shell">
        <header className="review-header">
          <div className="claim-nav">
            <div className="claim-controls">
              <button
                aria-label="Back to projects"
                onClick={() => setView("projects")}
              >
                <Icon name="back" size={14} />
              </button>
            </div>
            <span>
              Orbit /{" "}
              {view === "setup"
                ? "Project setup"
                : view === "project"
                  ? "Project workspace"
                  : "Projects"}
            </span>
          </div>
          <div className="claim-person">
            <span className="claim-avatar project-avatar">
              <Icon name="folder" size={20} />
            </span>
            <div>
              <strong>
                {view === "project"
                  ? active?.name
                  : view === "setup"
                    ? "Create a project"
                    : "Projects"}
              </strong>
              <small>
                <Icon name="file" size={11} />
                {view === "setup"
                  ? "New project draft"
                  : view === "project"
                    ? active?.template || "Blank project"
                    : "Project workspace"}{" "}
                · Saved on this device
              </small>
            </div>
          </div>
          <div className="requested">
            <span>
              {view === "setup" ? "Not created yet" : "Projects created"}
            </span>
            <strong>{view === "setup" ? "Draft" : projects.length}</strong>
          </div>
        </header>
        <main>
          {view === "setup" ? (
            <>
              <div className="setup-layout">
                <section className="setup-panel" ref={setupPanel}>
                  <div className="workspace-tabs">
                    <button className="active">
                      {draft.step === "describe"
                        ? "Project description"
                        : draft.step === "blank"
                          ? "Blank project"
                          : draft.step === "review"
                            ? "Review suggestions"
                            : "Final review"}
                    </button>
                    <button onClick={() => setHelp(true)}>How it works</button>
                  </div>
                  <div className="stepper" aria-label="Setup progress">
                    {["Describe", "Review suggestions", "Create project"].map(
                      (s, i) => (
                        <div
                          key={s}
                          className={
                            i === step
                              ? "step current"
                              : i < step
                                ? "step complete"
                                : "step"
                          }
                        >
                          <span>
                            {i < step ? <Icon name="check" size={13} /> : i + 1}
                          </span>
                          {s}
                          {i < 2 && <i />}
                        </div>
                      ),
                    )}
                  </div>
                  {loading ? (
                    <div
                      className="loading-state"
                      role="status"
                      aria-live="polite"
                    >
                      <span className="loading-orbit">
                        <Icon name="spark" size={30} />
                      </span>
                      <h2>
                        {draft.step === "confirm" || draft.step === "blank"
                          ? "Creating your project…"
                          : "Putting the pieces together…"}
                      </h2>
                      <p>
                        {draft.step === "confirm" || draft.step === "blank"
                          ? "Saving your approved plan on this device."
                          : "Organizing a starting structure for you to review."}
                      </p>
                      <div className="loading-bar" />
                      {draft.step === "describe" && (
                        <Action
                          onClick={() => {
                            clearTimeout(timer.current);
                            setLoading(false);
                          }}
                        >
                          Cancel
                        </Action>
                      )}
                    </div>
                  ) : draft.step === "describe" ? (
                    <div className="describe-body">
                      <div className="section-icon">
                        <Icon name="spark" size={23} />
                      </div>
                      <h2>Describe your project</h2>
                      <p className="section-subtitle">
                        Start with the goal. Add context like your team, scope,
                        or timeline.
                      </p>
                      <label className="prompt-label" htmlFor="brief">
                        Project description<span>Required</span>
                      </label>
                      <div className="prompt-container">
                        <Textarea.Root
                          id="brief"
                          value={draft.prompt}
                          onChange={(e) => patch({ prompt: e.target.value })}
                          placeholder="e.g. Launch the Q1 supplier review across three regions. We need to evaluate performance, identify risks, and agree on next steps."
                          maxLength={1500}
                        />
                        <div className="prompt-bottom">
                          <span>
                            <Icon name="file" size={14} />A few sentences are
                            enough
                          </span>
                          <span>{draft.prompt.length}/1500</span>
                        </div>
                      </div>
                      <div className="examples-label">
                        NEED A STARTING POINT?
                      </div>
                      <div className="example-grid">
                        {[
                          [
                            "Regional review",
                            "Launch the Q1 supplier review across three regions. Evaluate performance, identify risks, and prepare recommendations.",
                          ],
                          [
                            "Product launch",
                            "Launch our new product. Coordinate messaging, prepare launch assets, and measure the release.",
                          ],
                          [
                            "Team workshop",
                            "Organize a team workshop to align on our goals, share ideas, and agree on next steps.",
                          ],
                        ].map(([title, text]) => (
                          <button
                            key={title}
                            onClick={() => patch({ prompt: text })}
                          >
                            <Icon
                              name={
                                title === "Regional review"
                                  ? "folder"
                                  : title === "Product launch"
                                    ? "spark"
                                    : "grid"
                              }
                            />
                            <span>{title}</span>
                            <Icon name="plus" size={14} />
                          </button>
                        ))}
                      </div>
                      <div className="reassurance">
                        <Icon name="check" size={16} />
                        <p>
                          You’re in control. Review, edit, or remove every
                          suggestion before creating your project.
                        </p>
                      </div>
                      <div className="panel-actions">
                        <button
                          className="text-button"
                          onClick={() => {
                            patch({ step: "blank" });
                            setError("");
                          }}
                        >
                          Start with a blank project
                        </button>
                        <Action
                          variant="primary"
                          icon="spark"
                          onClick={() => generate()}
                          disabled={!draft.prompt.trim()}
                        >
                          {draft.suggestions.length
                            ? draft.generatedPrompt === draft.prompt
                              ? "Review current plan"
                              : "Update suggestions"
                            : "Generate suggestions"}
                        </Action>
                      </div>
                    </div>
                  ) : draft.step === "blank" ? (
                    <div className="describe-body">
                      <div className="section-icon">
                        <Icon name="folder" size={23} />
                      </div>
                      <h2>Create a blank project</h2>
                      <p className="section-subtitle">
                        Give your project a name. Add tasks when you’re ready.
                      </p>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          create();
                        }}
                      >
                        <Field
                          label="Project name"
                          placeholder="e.g. Q1 supplier review"
                          value={draft.blankName}
                          onChange={(e) => patch({ blankName: e.target.value })}
                          maxLength={100}
                          required
                          autoFocus
                        />
                        <div className="panel-actions">
                          <Action
                            type="button"
                            onClick={() => patch({ step: "describe" })}
                          >
                            Back
                          </Action>
                          <Action
                            type="submit"
                            variant="primary"
                            disabled={!draft.blankName.trim()}
                            icon="plus"
                          >
                            Create blank project
                          </Action>
                        </div>
                      </form>
                    </div>
                  ) : draft.step === "review" ? (
                    <div className="review-body">
                      <div className="review-heading">
                        <div>
                          <h2>Review your project plan</h2>
                          <p className="section-subtitle">
                            Accept, edit, or remove each item. Only accepted and
                            edited items will be included.
                          </p>
                        </div>
                        <span className="status-pill">
                          {draft.suggestions.length - pending} of{" "}
                          {draft.suggestions.length} reviewed
                        </span>
                      </div>
                      <div className="progress-track">
                        <div
                          style={{
                            width: `${((draft.suggestions.length - pending) / draft.suggestions.length) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="review-toolbar">
                        <span>
                          <Icon name="spark" size={15} />
                          Demo-generated suggestions
                        </span>
                        <Action
                          size="xsmall"
                          onClick={() =>
                            patch({
                              suggestions: draft.suggestions.map((s) =>
                                s.status === "pending"
                                  ? { ...s, status: "accepted" }
                                  : s,
                              ),
                            })
                          }
                          disabled={!pending}
                          icon="check"
                        >
                          Accept remaining
                        </Action>
                      </div>
                      <div className="suggestions">
                        {draft.suggestions.map((s, i) => (
                          <article
                            className={`suggestion ${s.status}`}
                            key={s.id}
                          >
                            <div className="suggestion-icon">
                              <Icon
                                name={
                                  s.kind === "name"
                                    ? "folder"
                                    : s.kind === "template"
                                      ? "grid"
                                      : "check"
                                }
                              />
                            </div>
                            <div className="suggestion-content">
                              <div className="suggestion-label">
                                {s.kind === "task"
                                  ? `TASK ${i - 1}`
                                  : s.kind === "name"
                                    ? "PROJECT NAME"
                                    : "TEMPLATE"}
                                <span className={`state-label ${s.status}`}>
                                  {s.status === "pending"
                                    ? "Needs review"
                                    : s.status === "dismissed"
                                      ? "Removed"
                                      : s.status === "edited"
                                        ? "Edited by you"
                                        : "Accepted"}
                                </span>
                              </div>
                              <h3>{s.title}</h3>
                              {s.status !== "dismissed" && (
                                <p>
                                  {s.kind === "task"
                                    ? dateLabel(s.date)
                                    : s.reason}
                                </p>
                              )}
                            </div>
                            <div className="suggestion-actions">
                              {s.status === "dismissed" ? (
                                <button
                                  className="text-button"
                                  onClick={() => update(s.id, "pending")}
                                >
                                  Restore
                                </button>
                              ) : (
                                <>
                                  {s.status === "pending" ? (
                                    <button
                                      className="icon-button accept"
                                      aria-label={`Accept ${s.title}`}
                                      title="Accept suggestion"
                                      onClick={() => update(s.id, "accepted")}
                                    >
                                      <Icon name="check" />
                                    </button>
                                  ) : (
                                    <button
                                      className="text-button undo"
                                      onClick={() => update(s.id, "pending")}
                                    >
                                      Undo
                                    </button>
                                  )}
                                  <button
                                    className="icon-button"
                                    aria-label={`Edit ${s.title}`}
                                    title="Edit suggestion"
                                    onClick={() => setEditing({ ...s })}
                                  >
                                    <Icon name="edit" size={16} />
                                  </button>
                                  <button
                                    className="icon-button"
                                    aria-label={`Remove ${s.title}`}
                                    title="Remove suggestion"
                                    onClick={() => update(s.id, "dismissed")}
                                  >
                                    <Icon name="close" size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                      {!nameIncluded && !pending && (
                        <p className="inline-hint">
                          Keep a project name to continue. Restore or edit the
                          name suggestion above.
                        </p>
                      )}
                      <div className="panel-actions">
                        <Action
                          icon="back"
                          onClick={() => patch({ step: "describe" })}
                        >
                          Edit description
                        </Action>
                        {pending > 0 && (
                          <span className="review-required" role="status">
                            Review {pending} remaining{" "}
                            {pending === 1 ? "item" : "items"} to continue
                          </span>
                        )}
                        <Action
                          variant="primary"
                          onClick={() => patch({ step: "confirm" })}
                          disabled={pending > 0 || !nameIncluded}
                        >
                          Review project
                          <Icon name="arrow" size={15} />
                        </Action>
                      </div>
                    </div>
                  ) : (
                    <div className="describe-body confirm-body">
                      <div className="section-icon">
                        <Icon name="check" size={23} />
                      </div>
                      <h2>Review the final project</h2>
                      <p className="section-subtitle">
                        This is exactly what will be created. Your changes are
                        included.
                      </p>
                      <div className="final-summary">
                        <span className="eyebrow">YOUR PROJECT</span>
                        <h2>
                          {included.find((s) => s.kind === "name")?.title}
                        </h2>
                        <p>
                          {included.find((s) => s.kind === "template")?.title ||
                            "No template · custom structure"}
                        </p>
                        <hr />
                        <div className="summary-line">
                          <b>
                            {included.filter((s) => s.kind === "task").length}{" "}
                            tasks
                          </b>
                          <span>
                            {
                              draft.suggestions.filter(
                                (s) => s.status === "dismissed",
                              ).length
                            }{" "}
                            suggestions removed
                          </span>
                        </div>
                        {included
                          .filter((s) => s.kind === "task")
                          .map((s) => (
                            <div className="final-task" key={s.id}>
                              <span className="empty-check" />
                              <span>{s.title}</span>
                              <small>{dateLabel(s.date)}</small>
                            </div>
                          ))}
                      </div>
                      <div className="reassurance">
                        <Icon name="check" size={16} />
                        <p>
                          You can keep editing your tasks after creating the
                          project.
                        </p>
                      </div>
                      <div className="panel-actions">
                        <Action
                          onClick={() => patch({ step: "review" })}
                          icon="back"
                        >
                          Back to suggestions
                        </Action>
                        <Action variant="primary" onClick={create} icon="plus">
                          Create project
                        </Action>
                      </div>
                    </div>
                  )}
                  {error && (
                    <p className="error" role="alert">
                      {error}
                    </p>
                  )}
                </section>
                <aside className="context-panel">
                  <div className="reference-progress">
                    {[
                      "Describe project",
                      "Review suggestions",
                      "Create project",
                    ].map((label, i) => (
                      <div
                        key={label}
                        aria-current={i === step ? "step" : undefined}
                        className={`reference-step ${i < step ? "done" : i === step ? "current" : "upcoming"}`}
                      >
                        <i>
                          <img
                            src={`/reference/progress/${i < step ? "review-evidence" : i === step ? "resolve-findings" : "make-decision"}.svg`}
                            alt=""
                          />
                        </i>
                        <span>{label}</span>
                      </div>
                    ))}
                    <img
                      className="connector left"
                      src="/reference/progress/connector-left.svg"
                      alt=""
                    />
                    <img
                      className="connector right"
                      src="/reference/progress/connector-right.svg"
                      alt=""
                    />
                  </div>
                  <article className="finding-card live-preview">
                    <header>
                      <strong>
                        {step === 1
                          ? "Included in your project"
                          : step === 2
                            ? "Your original brief"
                            : "What happens next"}
                      </strong>
                      <span>
                        {step === 1 ? `${included.length} kept` : "You decide"}
                      </span>
                    </header>
                    <div className="preview-content">
                      {step === 0 ? (
                        <>
                          <p>
                            We’ll propose a project name, a template, and a
                            small set of tasks.
                          </p>
                          <ol>
                            <li>Describe the outcome you need.</li>
                            <li>Accept, edit, or remove suggestions.</li>
                            <li>Check the final plan and create it.</li>
                          </ol>
                          <p>No project is created until you confirm.</p>
                        </>
                      ) : step === 1 ? (
                        <>
                          <h3>
                            {included.find((s) => s.kind === "name")?.title ||
                              "Project name awaiting review"}
                          </h3>
                          <p>
                            {included.find((s) => s.kind === "template")
                              ?.title || "No template selected"}
                          </p>
                          <div className="preview-task-list">
                            {included
                              .filter((s) => s.kind === "task")
                              .map((s) => (
                                <div key={s.id}>
                                  <Icon name="check" size={13} />
                                  <span>
                                    {s.title}
                                    <small>{dateLabel(s.date)}</small>
                                  </span>
                                </div>
                              ))}
                          </div>
                          {!included.some((s) => s.kind === "task") && (
                            <p>Accepted tasks will appear here.</p>
                          )}
                          <div className="preview-pending">
                            {pending
                              ? `${pending} suggestion${pending === 1 ? "" : "s"} still need your review.`
                              : "Every suggestion has been reviewed."}
                          </div>
                        </>
                      ) : (
                        <>
                          <p>
                            {draft.prompt ||
                              "A blank project, with no suggested tasks."}
                          </p>
                          <p className="preview-pending">
                            Only the items shown in the final plan will be
                            created.
                          </p>
                        </>
                      )}
                    </div>
                  </article>
                  <div className="prototype-note">
                    Suggestions use local demo rules. No external AI service is
                    connected. Your draft stays in this browser.
                  </div>
                  <button
                    className="context-help text-button"
                    onClick={() => setHelp(true)}
                  >
                    About this prototype
                  </button>
                </aside>
              </div>
            </>
          ) : view === "projects" ? (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">YOUR WORK, MOVING FORWARD</span>
                  <h1>Projects</h1>
                  <p>A little structure for everything you’re building.</p>
                </div>
                <Action variant="primary" icon="plus" onClick={newProject}>
                  New project
                </Action>
              </div>
              <section className="projects-section">
                <div className="projects-toolbar">
                  <h2>
                    All projects{" "}
                    <span className="count">{projects.length}</span>
                  </h2>
                  <Input.Root className="project-search">
                    <Input.Wrapper>
                      <Icon name="search" size={16} />
                      <Input.Input
                        aria-label="Search projects"
                        placeholder="Search projects…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </Input.Wrapper>
                  </Input.Root>
                </div>
                {projects.length ? (
                  <div className="project-table" aria-label="Projects">
                    <div className="project-table-head">
                      <span>Project</span>
                      <span>Template</span>
                      <span>Created</span>
                      <span>Progress</span>
                      <span>Status</span>
                    </div>
                    {projects
                      .filter((p) =>
                        p.name.toLowerCase().includes(search.toLowerCase()),
                      )
                      .map((p) => (
                        <button
                          className="project-table-row"
                          key={p.id}
                          onClick={() => {
                            setActiveId(p.id);
                            setSuccess(false);
                            setView("project");
                          }}
                        >
                          <span className="project-identity">
                            <i>
                              <Icon name="folder" size={14} />
                            </i>
                            <b>{p.name}</b>
                          </span>
                          <span>{p.template || "Blank project"}</span>
                          <span>
                            {new Date(p.created).toLocaleDateString(undefined, {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                          <span>
                            {p.tasks.filter((t) => t.done).length} /{" "}
                            {p.tasks.length} tasks
                          </span>
                          <span>
                            <em className="project-status">
                              {p.tasks.length && p.tasks.every((t) => t.done)
                                ? "Completed"
                                : "In progress"}
                            </em>
                          </span>
                        </button>
                      ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <span className="section-icon">
                      <Icon name="folder" size={28} />
                    </span>
                    <h2>Make room for your next idea.</h2>
                    <p>
                      Your projects will appear here. Start with a brief or a
                      blank canvas.
                    </p>
                    <Action variant="primary" icon="plus" onClick={newProject}>
                      Create your first project
                    </Action>
                  </div>
                )}
                {projects.length > 0 &&
                  !projects.some((p) =>
                    p.name.toLowerCase().includes(search.toLowerCase()),
                  ) && (
                    <p className="empty-state">No projects match “{search}”.</p>
                  )}
              </section>
            </>
          ) : active ? (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">
                    {success ? "READY WHEN YOU ARE" : "PROJECT WORKSPACE"}
                  </span>
                  <h1>{active.name}</h1>
                  <p>{active.template || "Your blank canvas"}</p>
                </div>
                <Action icon="download" onClick={() => exportProject(active)}>
                  Export project
                </Action>
              </div>
              {success && (
                <div className="success-banner" role="status">
                  <span className="success-icon">
                    <Icon name="check" />
                  </span>
                  <div>
                    <strong>Your project is ready.</strong>
                    <p>Your approved plan is saved. Now make it happen.</p>
                  </div>
                  <button
                    className="icon-button"
                    onClick={() => setSuccess(false)}
                    aria-label="Dismiss success message"
                  >
                    <Icon name="close" />
                  </button>
                </div>
              )}
              <div className="project-detail-layout">
                <section className="projects-section">
                  <div className="projects-toolbar">
                    <h2>
                      Project tasks{" "}
                      <span className="count">{active.tasks.length}</span>
                    </h2>
                    <Action
                      size="small"
                      icon="plus"
                      onClick={() =>
                        setEditing({
                          id: crypto.randomUUID(),
                          kind: "task",
                          title: "",
                          reason: "",
                          date: "",
                          status: "edited",
                        })
                      }
                    >
                      Add task
                    </Action>
                  </div>
                  {active.tasks.length ? (
                    active.tasks.map((t) => (
                      <div
                        className={`project-task ${t.done ? "done" : ""}`}
                        key={t.id}
                      >
                        <Checkbox.Root
                          checked={t.done}
                          aria-label={`Mark ${t.title} ${t.done ? "incomplete" : "complete"}`}
                          onCheckedChange={() =>
                            setProjects((ps) =>
                              ps.map((p) =>
                                p.id === active.id
                                  ? {
                                      ...p,
                                      tasks: p.tasks.map((x) =>
                                        x.id === t.id
                                          ? { ...x, done: !x.done }
                                          : x,
                                      ),
                                    }
                                  : p,
                              ),
                            )
                          }
                        />
                        <span>{t.title}</span>
                        <small>
                          <Icon name="clock" size={14} />
                          {dateLabel(t.date)}
                        </small>
                        <button
                          className="icon-button"
                          aria-label={`Edit ${t.title}`}
                          onClick={() =>
                            setEditing({
                              ...t,
                              kind: "task",
                              status: "edited",
                              reason: "",
                            })
                          }
                        >
                          <Icon name="edit" size={16} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <Icon name="file" size={28} />
                      <h3>A fresh start.</h3>
                      <p>Add your first task to start shaping this project.</p>
                    </div>
                  )}
                </section>
                <aside className="project-info">
                  <h3>Project overview</h3>
                  <span className="eyebrow">ORIGINAL BRIEF</span>
                  <p>{active.description || "Created from a blank project."}</p>
                  <hr />
                  <div className="summary-line">
                    <span>Created</span>
                    <b>{new Date(active.created).toLocaleDateString()}</b>
                  </div>
                  <div className="summary-line">
                    <span>Progress</span>
                    <b>
                      {active.tasks.filter((t) => t.done).length}/
                      {active.tasks.length} complete
                    </b>
                  </div>
                  <p className="info-footnote">
                    Saved locally in this browser. Export a copy to keep or
                    share your plan.
                  </p>
                </aside>
              </div>
            </>
          ) : null}
        </main>
        <footer className="main-footer">
          <span>orbit · A little structure goes a long way.</span>
          <button onClick={() => setHelp(true)}>
            AI proposes. Humans decide.
            <Icon name="help" size={13} />
          </button>
        </footer>
      </div>
      {editing && (
        <Modal
          title={editing.title ? "Edit suggestion" : "Add a task"}
          onClose={() => setEditing(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const submitted = {
                ...editing,
                date: String(
                  new FormData(e.currentTarget).get("dueDate") || "",
                ),
              };
              if (!submitted.title.trim()) return;
              if (view === "project" && active) {
                setProjects((ps) =>
                  ps.map((p) =>
                    p.id === active.id
                      ? {
                          ...p,
                          tasks: p.tasks.some((t) => t.id === submitted.id)
                            ? p.tasks.map((t) =>
                                t.id === submitted.id
                                  ? {
                                      ...t,
                                      title: submitted.title.trim(),
                                      date: submitted.date,
                                    }
                                  : t,
                              )
                            : [
                                ...p.tasks,
                                {
                                  id: submitted.id,
                                  title: submitted.title.trim(),
                                  date: submitted.date,
                                  done: false,
                                },
                              ],
                        }
                      : p,
                  ),
                );
              } else {
                patch({
                  suggestions: draft.suggestions.map((s) =>
                    s.id === submitted.id
                      ? {
                          ...submitted,
                          title: submitted.title.trim(),
                          status: "edited",
                        }
                      : s,
                  ),
                });
              }
              setEditing(null);
              setNotice("Changes saved.");
            }}
          >
            <p className="modal-description">
              Make this work for your project. Saving a suggestion also marks it
              as reviewed.
            </p>
            <Field
              label={
                editing.kind === "task"
                  ? "Task name"
                  : editing.kind === "name"
                    ? "Project name"
                    : "Template name"
              }
              value={editing.title}
              onChange={(e) =>
                setEditing({ ...editing, title: e.target.value })
              }
              required
              maxLength={160}
              autoFocus
            />
            {editing.kind === "task" && (
              <>
                <Field
                  label="Due date (optional)"
                  type="date"
                  name="dueDate"
                  defaultValue={editing.date}
                />
                <p className="inline-hint">
                  Leave empty if timing hasn’t been agreed yet.
                </p>
              </>
            )}
            <div className="modal-actions">
              <Action type="button" onClick={() => setEditing(null)}>
                Cancel
              </Action>
              <Action
                type="submit"
                variant="primary"
                disabled={!editing.title.trim()}
              >
                Save changes
              </Action>
            </div>
          </form>
        </Modal>
      )}
      {regenerateOpen && (
        <Modal
          title="Update the suggested plan?"
          onClose={() => setRegenerateOpen(false)}
        >
          <div className="about-content">
            <p>
              Generating a new plan will replace the current suggestions,
              including your edits and review decisions. You can also keep
              reviewing the current plan.
            </p>
            <div className="modal-actions">
              <Action
                onClick={() => {
                  setRegenerateOpen(false);
                  patch({
                    step: "review",
                    generatedPrompt: draft.generatedPrompt ?? draft.prompt,
                  });
                }}
              >
                Keep current plan
              </Action>
              <Action
                variant="primary"
                onClick={() => {
                  setRegenerateOpen(false);
                  generate(true);
                }}
              >
                Generate a new plan
              </Action>
            </div>
          </div>
        </Modal>
      )}
      {help && (
        <Modal title="About this prototype" onClose={() => setHelp(false)}>
          <div className="about-content">
            <p>
              Orbit helps you turn a project brief into a plan you can review
              and edit.
            </p>
            <h3>What works</h3>
            <p>
              Describe a project, review every suggestion, edit names and dates,
              remove or restore items, create a blank project, complete tasks,
              and export your plan.
            </p>
            <h3>Demo generation</h3>
            <p>
              Suggestions come from local rules for reviews, launches, events,
              and general projects. No external AI service is connected. Always
              check the proposed scope.
            </p>
            <h3>Your data</h3>
            <p>
              Drafts and projects are stored in this browser’s local storage.
              They aren’t synced to an account. Export your project before
              clearing browser data.
            </p>
            <Action variant="primary" onClick={() => setHelp(false)}>
              Got it
            </Action>
          </div>
        </Modal>
      )}
      {notice && (
        <div className="toast" role="status">
          <Icon name="check" size={16} />
          {notice}
        </div>
      )}
    </div>
  );
}

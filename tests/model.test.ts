import assert from "node:assert/strict";
import { test } from "node:test";
import { propose, toProject, emptyDraft, type Draft } from "../src/model.ts";

test("blank projects exclude a previously reviewed plan", () => {
  const suggestions = propose("Launch the Q1 supplier review").map((s) => ({
    ...s,
    status: "accepted" as const,
  }));
  const p = toProject({
    ...emptyDraft,
    step: "blank",
    prompt: "Previous brief",
    blankName: "  Fresh plan  ",
    suggestions,
  });
  assert.equal(p.name, "Fresh plan");
  assert.equal(p.description, "");
  assert.equal(p.template, "");
  assert.deepEqual(p.tasks, []);
});
test("reviewed projects include accepted and edited suggestions only", () => {
  const suggestions = propose("Launch a product");
  suggestions[0].status = "accepted";
  suggestions[1].status = "dismissed";
  suggestions[2] = {
    ...suggestions[2],
    status: "edited",
    title: "Revised launch goals",
    date: "2027-02-12",
  };
  suggestions[3].status = "dismissed";
  const p = toProject({
    ...emptyDraft,
    step: "confirm",
    prompt: "Launch a product",
    suggestions,
  } satisfies Draft);
  assert.equal(p.name, "Product Launch");
  assert.equal(p.template, "");
  assert.equal(p.tasks.length, 1);
  assert.equal(p.tasks[0].title, "Revised launch goals");
  assert.equal(p.tasks[0].date, "2027-02-12");
});
test("generated suggestions start pending and do not invent dates", () => {
  const s = propose("Q1 supplier review across three regions");
  assert.equal(s.length, 7);
  assert.ok(s.every((x) => x.status === "pending" && x.date === ""));
  assert.equal(s[0].title, "Q1 Regional Supplier Review");
});

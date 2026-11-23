import { createHash } from "node:crypto";
import { parse, stringify } from "yaml";
import { z } from "zod";

export const digest = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const name = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/);
const timestamp = z.iso.datetime();
const milestone = z.enum([
  "prepared",
  "draft_saved",
  "scheduled",
  "public",
  "followers_notified",
]);
const status = z.enum([
  "reserved",
  "unknown",
  "paused",
  "hold",
  "pending",
  "blocked",
  "awaiting_publish",
  "awaiting_author",
  "awaiting_upload",
]);
const step = z.enum(["save_draft", "publish", "notify_followers"]);
const itemSchema = z.strictObject({
  id: name,
  content: name.optional(),
  target: z.string().min(1),
  account: z.string().min(1).optional(),
  steps: z.array(step).min(1).optional(),
  tag: z.string().min(1).optional(),
  commit: z
    .string()
    .regex(/^[a-f0-9]{40}$/)
    .optional(),
  mode: z
    .enum(["prefill_if_permitted", "human_entry", "human_upload"])
    .optional(),
  after: name.optional(),
  status: z.enum(["hold", "paused"]).optional(),
  reason: z.string().optional(),
  assets: z
    .array(
      z.strictObject({ path: z.string().min(1), sha256: z.string().min(1) }),
    )
    .optional(),
});
const planSchema = z.strictObject({
  schema: z.literal(1),
  campaign: name,
  goal: z.string().optional(),
  window_utc: z.tuple([timestamp, timestamp]).optional(),
  items: z.array(itemSchema).min(1),
  metrics: z.record(z.string(), z.unknown()).optional(),
});
const approvalSchema = z.object({
  items: z.array(name).min(1),
  hashes: z.array(digest).min(1),
  digest,
  expires_at: timestamp.optional(),
});
export const releaseIntent = z.strictObject({
  repo: z.string().regex(/^[\w-]+\/[\w.-]+$/),
  account: z.string().min(1),
  tag: z.string().min(1),
  commit: z
    .string()
    .regex(/^[a-f0-9]{40}$/)
    .optional(),
  title: z.string().min(1),
  body: z.string(),
});

export type ReleaseIntent = z.infer<typeof releaseIntent>;

export const blueskyHandle = z
  .string()
  .max(253)
  .regex(
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/,
  );

// Historical receipts remain readable, and an unresolved dispatch stays held.
const retiredIntent = z.strictObject({
  provider: z.string().min(1),
  account: z.string().min(1),
  text: z.string().min(1),
  integration_id: z.string().min(1),
  actor_id: z.string().min(1),
  instance: digest,
});

export const blueskyDid = z.string().regex(/^did:(?:plc:[a-z2-7]+|web:[a-zA-Z0-9.-]+)$/);
export const httpsOrigin = z.url({ protocol: /^https$/ }).refine((value) => value === new URL(value).origin);
const blueskyIntent = z.strictObject({
  account: blueskyHandle,
  did: blueskyDid,
  pds: httpsOrigin,
  rkey: z.string().regex(/^kirzner-[a-f0-9]{64}$/),
  text: z.string().min(1),
});

export type BlueskyIntent = z.infer<typeof blueskyIntent>;

const recordSchema = z.looseObject({
  item: name,
  version: digest.optional(),
  step: step.optional(),
  request_key: digest.optional(),
  remote_key: z.string().optional(),
  intent: z.union([releaseIntent, blueskyIntent, retiredIntent]).optional(),
  attempted_at: timestamp.optional(),
  milestone,
  status: status.optional(),
  cid: z.string().min(1).optional(),
  native_id: z.string().optional(),
  url: z.url().optional(),
  observed_at: timestamp.optional(),
  source: z.string().optional(),
  reason: z.string().optional(),
});
const executionSchema = z.strictObject({
  approval: approvalSchema.optional(),
  record: recordSchema.optional(),
  records: z.array(recordSchema).optional(),
  observations: z.array(z.record(z.string(), z.unknown())).optional(),
});

export type PlanItem = z.infer<typeof itemSchema>;
export type Approval = z.infer<typeof approvalSchema>;
export type ActionRecord = z.infer<typeof recordSchema>;
export type ExecutionEntry = z.infer<typeof executionSchema>;

export function sha256(value: unknown): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}

function yaml(text: string): unknown {
  return parse(text, { maxAliasCount: 0 });
}

export function parseCampaign(text: string) {
  const front = text.match(/^---[ \t]*\r?\n([\s\S]*?)^---[ \t]*(?:\r?\n|$)/m);
  if (front?.index !== 0)
    throw new Error("Start the campaign with YAML front matter");
  const plan = planSchema.parse(yaml(front[1]));
  if (
    plan.window_utc &&
    Date.parse(plan.window_utc[0]) >= Date.parse(plan.window_utc[1])
  ) {
    throw new Error("The campaign window must end after it starts");
  }

  const sections = new Map<string, { start: number; end: number }>();
  const records: ActionRecord[] = [];
  let approval: Approval | undefined;
  let section: string | undefined;
  let position = front[0].length;
  let fence: { marker: string; start: number; execution: boolean } | undefined;
  for (const line of text.slice(position).match(/[^\n]*\n|[^\n]+$/g) ?? []) {
    const start = position;
    position += line.length;
    const bare = line.replace(/\r?\n$/, "");
    const boundary = bare.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (
        boundary &&
        boundary[1].startsWith(fence.marker) &&
        !boundary[2].trim()
      ) {
        if (fence.execution) {
          const entry = executionSchema.parse(
            yaml(text.slice(fence.start, start)),
          );
          if (entry.approval) approval = entry.approval;
          if (entry.records) records.push(...entry.records);
          if (entry.record) records.push(entry.record);
        }
        fence = undefined;
      }
      continue;
    }
    if (boundary && (boundary[1][0] === "~" || !boundary[2].includes("`"))) {
      fence = {
        marker: boundary[1],
        start: position,
        execution: section === "Execution" && boundary[2].trim() === "yaml",
      };
      continue;
    }
    const heading = bare.match(
      /^ {0,3}(#{1,2})(?!#)[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$/,
    );
    if (!heading) continue;
    if (section) sections.get(section)!.end = start;
    section = undefined;
    if (heading[1] === "##") {
      section = heading[2];
      if (sections.has(section))
        throw new Error(`Duplicate section: ${section}`);
      sections.set(section, { start: position, end: text.length });
    }
  }
  if (fence) throw new Error("Unclosed Markdown fence");

  const items = new Map(plan.items.map((item) => [item.id, item]));
  if (items.size !== plan.items.length)
    throw new Error("Campaign item IDs must be unique");
  const payloads = new Map<string, string>();
  for (const item of plan.items) {
    if (item.after && (!items.has(item.after) || item.after === item.id)) {
      throw new Error(`Invalid dependency for ${item.id}`);
    }
    if (
      item.steps &&
      (!item.content ||
        item.mode ||
        new Set(item.steps).size !== item.steps.length)
    ) {
      throw new Error(`Invalid executable plan for ${item.id}`);
    }
    if (item.content) {
      const range = sections.get(item.content);
      if (!range || item.content === "Execution")
        throw new Error(`Missing payload: ${item.content}`);
      payloads.set(
        item.content,
        text
          .slice(range.start, range.end)
          .replaceAll("\r\n", "\n")
          .replace(/^(?:[ \t]*\n)+|\n(?:[ \t]*\n)*[ \t]*$/g, ""),
      );
    }
  }
  return {
    text,
    plan,
    payloads,
    records,
    approval,
    execution: sections.get("Execution"),
  };
}

export type Campaign = ReturnType<typeof parseCampaign>;

export function appendExecution(
  campaign: Campaign,
  entry: ExecutionEntry,
): string {
  const newline = campaign.text.includes("\r\n") ? "\r\n" : "\n";
  const end = campaign.execution?.end ?? campaign.text.length;
  const prefix = campaign.text.slice(0, end);
  const separator = prefix.endsWith(newline + newline)
    ? ""
    : prefix.endsWith(newline)
      ? newline
      : newline + newline;
  const heading = campaign.execution ? "" : "## Execution\n\n";
  const block = `${heading}\`\`\`yaml\n${stringify(executionSchema.parse(entry))}\`\`\`\n`;
  const suffix = campaign.text.slice(end);
  return (
    prefix +
    separator +
    block.replaceAll("\n", newline) +
    (suffix ? newline : "") +
    suffix
  );
}

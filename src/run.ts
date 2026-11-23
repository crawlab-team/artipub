import {
  approved,
  approvalBatch,
  inWindow,
  type ReleaseAction,
  type SocialAction,
} from "./approval.ts";
import type { ActionRecord, PostizIntent, ReleaseIntent } from "./campaign.ts";
import { GitHubReleases, type Lookup } from "./github.ts";
import { Postiz, postizReadReason, type PostizLookup } from "./postiz.ts";
import { withCampaign, type CampaignStore } from "./workspace.ts";

type Result = {
  item: string;
  status:
    | "public"
    | "scheduled"
    | "draft_saved"
    | "unknown"
    | "blocked"
    | "paused"
    | "unapproved"
    | "hold";
  reason?: string;
  url?: string;
  postiz_id?: string;
};

function latestRecords(records: ActionRecord[]) {
  const latest = new Map<string, ActionRecord>();
  for (const record of records) {
    if (record.request_key) latest.set(record.request_key, record);
  }
  return [...latest.values()];
}

function unsettled(record: ActionRecord): boolean {
  return (
    record.status === "reserved" ||
    record.status === "unknown" ||
    record.status === "pending"
  );
}

function reservation(action: ReleaseAction): ActionRecord {
  const { repo, account, tag, commit, title, body } = action;
  return {
    item: action.item,
    step: "publish",
    version: action.version,
    request_key: action.requestKey,
    remote_key: action.remoteKey,
    intent: { repo, account, tag, commit, title, body },
    attempted_at: new Date().toISOString(),
    milestone: "prepared",
    status: "reserved",
  };
}

async function recordPublic(
  store: CampaignStore,
  record: ActionRecord,
  release: Extract<Lookup, { kind: "found" }>,
): Promise<Result> {
  const { intent: _intent, ...evidence } = record;
  await store.append({
    record: {
      ...evidence,
      milestone: "public",
      status: undefined,
      native_id: release.id,
      url: release.url,
      observed_at: new Date().toISOString(),
      source: "github_public_api",
      reason: undefined,
    },
  });
  return { item: record.item, status: "public", url: release.url };
}

async function lookup(
  github: GitHubReleases,
  intent: ReleaseIntent,
): Promise<Lookup> {
  try {
    return await github.lookup(intent);
  } catch {
    return {
      kind: "blocked",
      reason: "GitHub release lookup could not be verified",
    };
  }
}

async function reconcile(
  store: CampaignStore,
  github: GitHubReleases,
  record: ActionRecord,
): Promise<Result> {
  const remote =
    record.intent &&
    "repo" in record.intent &&
    (await lookup(github, record.intent));
  if (remote?.kind === "found") return recordPublic(store, record, remote);
  const reason =
    remote?.kind === "blocked"
      ? remote.reason
      : "A prior write may still take effect. Check the release by tag before further action.";
  if (record.status !== "unknown" || record.reason !== reason) {
    await store.append({ record: { ...record, status: "unknown", reason } });
  }
  return { item: record.item, status: "unknown", reason };
}

async function blockedAfterReservation(
  store: CampaignStore,
  record: ActionRecord,
  status: "paused" | "blocked",
  reason: string,
): Promise<Result> {
  const { intent: _intent, ...evidence } = record;
  await store.append({ record: { ...evidence, status, reason } });
  return { item: record.item, status, reason };
}

async function executeRelease(
  store: CampaignStore,
  github: GitHubReleases,
  action: ReleaseAction,
  previouslyPublic: boolean,
): Promise<Result> {
  const record = reservation(action);
  let existing = await lookup(github, action);
  if (existing.kind === "found")
    return recordPublic(
      store,
      { ...record, attempted_at: undefined },
      existing,
    );
  if (existing.kind === "blocked")
    return { item: action.item, status: "blocked", reason: existing.reason };
  if (previouslyPublic)
    return {
      item: action.item,
      status: "hold",
      reason:
        "This release was public and is now missing. Review it in GitHub.",
    };
  let hold: string | undefined;
  try {
    hold = await github.preflight(action);
  } catch {
    hold = "GitHub account or tag could not be verified";
  }
  if (hold) return { item: action.item, status: "blocked", reason: hold };

  // Recheck immediately before reservation because the account and tag reads can take time.
  existing = await lookup(github, action);
  if (existing.kind === "found")
    return recordPublic(
      store,
      { ...record, attempted_at: undefined },
      existing,
    );
  if (existing.kind === "blocked")
    return { item: action.item, status: "blocked", reason: existing.reason };
  const holdAfterLookup = await reserveForDispatch(store, record);
  if (holdAfterLookup) return holdAfterLookup;

  const dispatch = await github
    .create(action)
    .catch(() => ({ kind: "unknown" as const }));
  if (dispatch.kind === "rejected")
    return blockedAfterReservation(store, record, "blocked", dispatch.reason);
  return reconcile(store, github, record);
}

async function reserveForDispatch(
  store: CampaignStore,
  record: ActionRecord,
): Promise<Result | undefined> {
  if (await store.paused()) return { item: record.item, status: "paused" };
  if (!inWindow(store.campaign))
    return {
      item: record.item,
      status: "hold",
      reason: "Outside the approved campaign window",
    };
  record.attempted_at = new Date().toISOString();
  await store.append({ record });
  await store.assertUnchanged();
  if (await store.paused())
    return blockedAfterReservation(
      store,
      record,
      "paused",
      "Pause set before dispatch",
    );
  if (!inWindow(store.campaign))
    return blockedAfterReservation(
      store,
      record,
      "blocked",
      "Campaign window ended before dispatch",
    );
}

async function recordSocialLookup(
  store: CampaignStore,
  record: ActionRecord,
  lookup: PostizLookup,
): Promise<Result> {
  const { post, publicPost, reason: readReason } = lookup;
  const postId = post?.id ?? record.postiz_id;
  if (
    publicPost &&
    (!post || post.state === "PUBLISHED" || post.state === "ERROR")
  ) {
    const { intent: _intent, ...evidence } = record;
    await store.append({
      record: {
        ...evidence,
        milestone: "public",
        status: undefined,
        postiz_id: postId,
        native_id: publicPost.id,
        url: publicPost.url,
        source: publicPost.source,
        observed_at: new Date().toISOString(),
        reason: undefined,
      },
    });
    return {
      item: record.item,
      status: "public",
      url: publicPost.url,
      postiz_id: postId,
    };
  }
  const milestone =
    post?.state === "DRAFT"
      ? "draft_saved"
      : postId && record.milestone === "prepared"
        ? "scheduled"
        : record.milestone;
  let reason = readReason;
  if (publicPost)
    reason =
      "A matching public post and a queued or draft Postiz job both exist. Review them in Postiz.";
  if (post?.state === "ERROR")
    reason =
      "Postiz reports an error. Check the job and public feed before taking further action.";
  if (!postId && !reason)
    reason =
      "A prior Postiz request may still take effect. Rerun to reconcile by lookup.";
  const status = reason ? "unknown" : "pending";
  if (
    record.status !== status ||
    record.reason !== reason ||
    record.postiz_id !== postId ||
    record.milestone !== milestone
  ) {
    await store.append({
      record: {
        ...record,
        milestone,
        status,
        postiz_id: postId,
        source: postId ? "postiz_public_api" : undefined,
        observed_at: post ? new Date().toISOString() : record.observed_at,
        reason,
      },
    });
  }
  return {
    item: record.item,
    status:
      status === "pending" &&
      (milestone === "scheduled" || milestone === "draft_saved")
        ? milestone
        : "unknown",
    reason,
    postiz_id: postId,
  };
}

async function reconcileSocial(
  store: CampaignStore,
  postiz: Postiz,
  record: ActionRecord,
  intent: PostizIntent,
): Promise<Result> {
  const existing = await postiz
    .lookup(intent, record.postiz_id, record.attempted_at)
    .catch((error: unknown) => ({ reason: postizReadReason(error) }));
  return recordSocialLookup(store, record, existing);
}

async function executeSocial(
  store: CampaignStore,
  postiz: Postiz,
  action: SocialAction,
  previouslyPublic: boolean,
): Promise<Result> {
  let existing: PostizLookup;
  let intent: PostizIntent;
  try {
    intent = await postiz.preflight(
      action.provider,
      action.account,
      action.text,
    );
    existing = await postiz.lookup(intent);
  } catch (error) {
    return {
      item: action.item,
      status: "blocked",
      reason: postizReadReason(error),
    };
  }
  const record: ActionRecord = {
    item: action.item,
    version: action.version,
    step: "publish",
    request_key: action.requestKey,
    remote_key: action.remoteKey,
    milestone: "prepared",
    status: "reserved",
    intent,
    postiz_integration_id: intent.integration_id,
  };
  if (existing.post || existing.publicPost)
    return recordSocialLookup(store, record, existing);
  if (existing.reason)
    return { item: action.item, status: "blocked", reason: existing.reason };
  if (previouslyPublic)
    return {
      item: action.item,
      status: "hold",
      reason:
        "This post was public and is now missing. Review the public feed.",
    };
  const hold = await reserveForDispatch(store, record);
  if (hold) return hold;

  const dispatch = await postiz
    .create(intent)
    .catch(() => ({ kind: "unknown" as const }));
  if (dispatch.kind === "rejected")
    return blockedAfterReservation(store, record, "blocked", dispatch.reason);
  if (dispatch.kind === "accepted") {
    const accepted: ActionRecord = {
      ...record,
      milestone: "scheduled",
      status: "pending",
      postiz_id: dispatch.id,
      source: "postiz_public_api",
      observed_at: new Date().toISOString(),
    };
    await store.append({ record: accepted });
    return reconcileSocial(store, postiz, accepted, intent);
  }
  return reconcileSocial(store, postiz, record, intent);
}

export async function runCampaign(
  workspace: string,
  name: string,
  github: GitHubReleases,
  postiz: Postiz,
): Promise<Result[]> {
  return withCampaign(workspace, name, async (store) => {
    const batch = approvalBatch(store.campaign);
    const results: Result[] = [];
    const reconciled = new Set<string>();
    // Reconcile old attempts even after a pause, expiry, or an edit to the original payload.
    for (const record of latestRecords(store.campaign.records).filter(
      unsettled,
    )) {
      const result =
        record.intent && "provider" in record.intent
          ? await reconcileSocial(store, postiz, record, record.intent)
          : await reconcile(store, github, record);
      results.push(result);
      reconciled.add(record.request_key!);
    }
    for (const action of batch.actions) {
      if (reconciled.has(action.requestKey)) continue;
      const records = latestRecords(store.campaign.records);
      const prior = records.find(
        (record) => record.request_key === action.requestKey,
      );
      const pending = records.some(
        (record) =>
          unsettled(record) &&
          (record.item === action.item ||
            record.remote_key === action.remoteKey),
      );
      const dependency = batch.actions.find(
        ({ item }) => item === action.after,
      );
      let result: Result;
      if (pending) {
        result = {
          item: action.item,
          status: "hold",
          reason: "Reconcile the prior write before using the amended plan",
        };
      } else if (prior?.milestone === "public") {
        result = {
          item: action.item,
          status: "public",
          url: prior.url,
          postiz_id: prior.postiz_id,
        };
      } else if (await store.paused()) {
        result = { item: action.item, status: "paused" };
      } else if (!approved(store.campaign, batch, action)) {
        result = {
          item: action.item,
          status: "unapproved",
          reason: "Review and approve the current batch",
        };
      } else if (!inWindow(store.campaign)) {
        result = {
          item: action.item,
          status: "hold",
          reason: "Outside the approved campaign window",
        };
      } else if (
        action.after &&
        (!dependency ||
          !records.some(
            (record) =>
              record.version === dependency.version &&
              record.milestone === "public",
          ))
      ) {
        result = {
          item: action.item,
          status: "hold",
          reason: `Waiting for ${action.after} to become public`,
        };
      } else {
        const previouslyPublic = records.some(
          (record) =>
            record.remote_key === action.remoteKey &&
            record.milestone === "public",
        );
        result =
          action.kind === "github"
            ? await executeRelease(store, github, action, previouslyPublic)
            : await executeSocial(store, postiz, action, previouslyPublic);
      }
      results.push(result);
    }
    for (const item of store.campaign.plan.items) {
      if (item.status)
        results.push({
          item: item.id,
          status: item.status,
          reason: item.reason,
        });
    }
    return results;
  });
}

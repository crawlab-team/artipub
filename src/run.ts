import {
  approved,
  approvalBatch,
  inWindow,
  type ReleaseAction,
  type BlueskyAction,
} from "./approval.ts";
import {
  Bluesky,
  BlueskyPostRejected,
  blueskyReadReason,
  blueskyWriteReason,
  type BlueskyLookup,
} from "./bluesky.ts";
import type { ActionRecord, BlueskyIntent, ReleaseIntent } from "./campaign.ts";
import { GitHubReleases, type Lookup } from "./github.ts";
import { withCampaign, type CampaignStore } from "./workspace.ts";

type Result = {
  item: string;
  status:
    | "public"
    | "pending"
    | "unknown"
    | "blocked"
    | "paused"
    | "unapproved"
    | "waiting"
    | "hold";
  reason?: string;
  url?: string;
  native_id?: string;
  cid?: string;
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
  const intent = record.intent;
  const remote =
    intent && "repo" in intent ? await lookup(github, intent) : undefined;
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

async function lookupBluesky(
  bluesky: Bluesky,
  intent: BlueskyIntent,
  cid?: string,
): Promise<BlueskyLookup> {
  try {
    return await bluesky.lookup(intent, cid);
  } catch (error) {
    return {
      kind: "blocked",
      reason: blueskyReadReason(error, "record lookup"),
    };
  }
}

async function recordBlueskyLookup(
  store: CampaignStore,
  record: ActionRecord,
  lookup: BlueskyLookup,
): Promise<Result> {
  if (lookup.kind === "public") {
    const { intent: _intent, ...evidence } = record;
    await store.append({
      record: {
        ...evidence,
        milestone: "public",
        status: undefined,
        native_id: lookup.uri,
        cid: lookup.cid,
        url: lookup.url,
        observed_at: new Date().toISOString(),
        source: "bluesky_public_appview",
        reason: undefined,
      },
    });
    return {
      item: record.item,
      status: "public",
      url: lookup.url,
      native_id: lookup.uri,
      cid: lookup.cid,
    };
  }
  const reason =
    lookup.kind === "pending"
      ? (lookup.reason ??
        "Bluesky AppView has not indexed the repository record yet. Rerun to reconcile.")
      : lookup.kind === "blocked"
        ? lookup.reason
        : "A prior Bluesky write may still take effect. Rerun to reconcile by record key.";
  const status =
    lookup.kind === "pending" && !lookup.reason ? "pending" : "unknown";
  const native_id = lookup.kind === "pending" ? lookup.uri : record.native_id;
  const cid = lookup.kind === "pending" ? lookup.cid : record.cid;
  if (
    record.status !== status ||
    record.reason !== reason ||
    record.cid !== cid ||
    record.native_id !== native_id
  ) {
    await store.append({
      record: { ...record, status, reason, native_id, cid },
    });
  }
  return { item: record.item, status, reason, native_id, cid };
}

async function executeBluesky(
  store: CampaignStore,
  bluesky: Bluesky,
  action: BlueskyAction,
  previouslyPublic: boolean,
): Promise<Result> {
  let intent: BlueskyIntent;
  try {
    intent = await bluesky.resolve(
      action.account,
      action.text,
      action.requestKey,
    );
  } catch (error) {
    return {
      item: action.item,
      status: "blocked",
      reason: blueskyReadReason(error, "account lookup"),
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
  };
  const existing = await lookupBluesky(bluesky, intent);
  if (existing.kind === "blocked")
    return { item: action.item, status: "blocked", reason: existing.reason };
  if (existing.kind !== "missing")
    return recordBlueskyLookup(store, record, existing);
  if (previouslyPublic)
    return {
      item: action.item,
      status: "hold",
      reason:
        "The campaign already recorded this text as public. Review the public feed before taking further action.",
    };
  let token: string;
  try {
    token = await bluesky.session(intent);
  } catch (error) {
    return {
      item: action.item,
      status: "blocked",
      reason: blueskyWriteReason(error, "session"),
    };
  }
  const beforeWrite = await lookupBluesky(bluesky, intent);
  if (beforeWrite.kind === "blocked")
    return { item: action.item, status: "blocked", reason: beforeWrite.reason };
  if (beforeWrite.kind !== "missing")
    return recordBlueskyLookup(store, record, beforeWrite);
  const hold = await reserveForDispatch(store, record);
  if (hold) return hold;

  let receipt: Awaited<ReturnType<Bluesky["create"]>>;
  try {
    receipt = await bluesky.create(intent, token);
  } catch (error) {
    const diagnostic = blueskyWriteReason(error, "createRecord");
    if (error instanceof BlueskyPostRejected)
      return blockedAfterReservation(store, record, "blocked", diagnostic);
    const reason = `${diagnostic}. Rerun to reconcile by record key.`;
    await store.append({ record: { ...record, status: "unknown", reason } });
    return { item: action.item, status: "unknown", reason };
  }
  const accepted = { ...record, native_id: receipt.uri, cid: receipt.cid };
  return recordBlueskyLookup(
    store,
    accepted,
    await lookupBluesky(bluesky, intent, receipt.cid),
  );
}

export async function runCampaign(
  workspace: string,
  name: string,
  github: GitHubReleases,
  bluesky: Bluesky,
): Promise<Result[]> {
  return withCampaign(workspace, name, async (store) => {
    const batch = approvalBatch(store.campaign);
    const results: Result[] = [];
    const reconciled = new Set<string>();
    // Reconcile old attempts even after a pause, expiry, or an edit to the original payload.
    for (const record of latestRecords(store.campaign.records).filter(
      unsettled,
    )) {
      const intent = record.intent;
      const result: Result =
        intent && "rkey" in intent
          ? await recordBlueskyLookup(
              store,
              record,
              await lookupBluesky(bluesky, intent, record.cid),
            )
          : intent && "provider" in intent
            ? {
                item: record.item,
                status: "unknown",
                reason:
                  "A retired adapter left an unresolved write. Verify it before publishing an amended plan.",
              }
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
            record.remote_key === action.remoteKey ||
            (action.kind === "bluesky" &&
              record.intent &&
              "provider" in record.intent &&
              record.intent.provider === "bluesky" &&
              record.intent.account === action.account)),
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
      } else if (
        prior?.milestone === "public" &&
        prior.version === action.version
      ) {
        result = {
          item: action.item,
          status: "public",
          url: prior.url,
          ...(prior.cid ? { native_id: prior.native_id, cid: prior.cid } : {}),
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
      } else if (action.at && Date.now() < Date.parse(action.at)) {
        result = {
          item: action.item,
          status: "waiting",
          reason: `waiting until ${action.at}`,
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
            record.milestone === "public" &&
            (record.remote_key === action.remoteKey ||
              (action.kind === "bluesky" &&
                record.remote_key === `postiz/${action.remoteKey}`)),
        );
        result =
          action.kind === "github"
            ? await executeRelease(store, github, action, previouslyPublic)
            : await executeBluesky(store, bluesky, action, previouslyPublic);
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

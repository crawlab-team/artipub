import {
  blueskyHandle,
  sha256,
  type Approval,
  type Campaign,
} from "./campaign.ts";
import { withCampaign } from "./workspace.ts";

export function releaseActions(campaign: Campaign) {
  const actions = [];
  const remoteKeys = new Set<string>();
  for (const item of campaign.plan.items) {
    if (!item.target.startsWith("github/") || !item.steps || item.status)
      continue;
    const match = item.target.match(/^github\/([\w-]+)\/([\w.-]+)$/);
    if (
      !match ||
      [".", ".."].includes(match[2]) ||
      item.steps.join() !== "publish" ||
      item.assets?.length ||
      !item.account ||
      !/^[a-z\d]+(?:-+[a-z\d]+)*(?:\[bot\])?$/i.test(item.account) ||
      !item.tag ||
      !validTag(item.tag)
    ) {
      throw new Error(`Invalid GitHub Release action: ${item.id}`);
    }
    const payload = campaign.payloads.get(item.content!)!;
    const [titleLine, ...lines] = payload.split("\n");
    const title = titleLine.match(/^Title:[ \t]+(.+?)\s*$/)?.[1];
    const body = lines.join("\n").replace(/^(?:[ \t]*\n)+/, "");
    if (!title || !body.trim())
      throw new Error(`Set a Title and Markdown body for ${item.id}`);

    const repo = `${match[1]}/${match[2]}`.toLowerCase();
    const account = item.account.toLowerCase();
    const remoteKey = `github/${repo}@${item.tag}`;
    if (remoteKeys.has(remoteKey))
      throw new Error(`Duplicate GitHub Release target: ${remoteKey}`);
    remoteKeys.add(remoteKey);
    const version = sha256([
      item.id,
      repo,
      account,
      "publish",
      item.tag,
      item.commit ?? null,
      title,
      body,
      item.after ?? null,
    ]);
    const requestKey = sha256([version, "publish"]);
    actions.push({
      kind: "github" as const,
      item: item.id,
      after: item.after,
      repo,
      account,
      tag: item.tag,
      commit: item.commit,
      title,
      body,
      version,
      remoteKey,
      requestKey,
    });
  }
  return actions;
}

// Git ref rules relevant to refs/tags/<tag> and the GitHub path parameter.
function validTag(tag: string): boolean {
  return (
    !/[\s~^:?*\[\\\u0000-\u001f\u007f]/.test(tag) &&
    !tag.includes("..") &&
    !tag.includes("@{") &&
    !tag.endsWith(".") &&
    tag
      .split("/")
      .every((part) => part && !part.startsWith(".") && !part.endsWith(".lock"))
  );
}

export type ReleaseAction = ReturnType<typeof releaseActions>[number];

function postizActions(campaign: Campaign) {
  const actions = [];
  const requestKeys = new Set<string>();
  const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  for (const item of campaign.plan.items) {
    if (!item.target.startsWith("postiz/") || !item.steps || item.status)
      continue;
    const account = item.target.match(/^postiz\/bluesky\/([^/]+)$/)?.[1].toLowerCase();
    const text = campaign.payloads.get(item.content!)!;
    if (
      !account ||
      !blueskyHandle.safeParse(account).success ||
      item.account?.toLowerCase().replace(/^@/, "") !== account ||
      item.steps.join() !== "publish" ||
      item.tag ||
      item.commit ||
      item.assets?.length ||
      !text.trim() ||
      /<\/?[a-z][\s\S]*>|[\u0000-\u0008\u000b-\u001f\u007f]/i.test(text) ||
      Buffer.byteLength(text) > 3000 ||
      [...graphemes.segment(text)].length > 300
    ) {
      throw new Error(`Invalid Postiz Bluesky action: ${item.id}. Use one plain-text post of up to 300 graphemes and 3000 bytes.`);
    }
    const remoteKey = `postiz/bluesky/${account}`;
    const requestKey = sha256([remoteKey, "publish", text]);
    if (requestKeys.has(requestKey))
      throw new Error(`Duplicate Bluesky post for ${account}`);
    requestKeys.add(requestKey);
    const version = sha256([item.id, requestKey, item.after ?? null]);
    actions.push({
      kind: "postiz" as const,
      item: item.id,
      after: item.after,
      account,
      text,
      version,
      remoteKey,
      requestKey,
    });
  }
  return actions;
}

export type PostizAction = ReturnType<typeof postizActions>[number];
export type PublishAction = ReleaseAction | PostizAction;

export function approvalBatch(campaign: Campaign) {
  const byItem = new Map<string, PublishAction>(
    [...releaseActions(campaign), ...postizActions(campaign)].map((action) => [action.item, action]),
  );
  const actions = campaign.plan.items.flatMap(({ id }) => {
    const action = byItem.get(id);
    return action ? [action] : [];
  });
  const items = actions.map(({ item }) => item);
  const hashes = actions.map(({ version }) => version);
  const window = campaign.plan.window_utc;
  const digest = sha256([
    campaign.plan.campaign,
    window ?? null,
    actions.map(({ item, version, after }) => [item, version, after ?? null]),
  ]);
  return { actions, items, hashes, digest, expires_at: window?.[1] };
}

export async function approveCampaign(
  workspace: string,
  name: string,
  reviewedDigest: string,
) {
  return withCampaign(workspace, name, async (store) => {
    const { items, hashes, digest, expires_at } = approvalBatch(store.campaign);
    if (!items.length)
      throw new Error("No runnable publish actions to approve");
    if (digest !== reviewedDigest)
      throw new Error("Campaign changed during review. Review it again.");
    if (expires_at && Date.now() >= Date.parse(expires_at))
      throw new Error("Campaign window has expired");
    const approval: Approval = {
      items,
      hashes,
      digest,
      expires_at,
    };
    await store.append({ approval });
    return approval;
  });
}

export function approved(
  campaign: Campaign,
  batch: ReturnType<typeof approvalBatch>,
  action: PublishAction,
): boolean {
  const approval = campaign.approval;
  return (
    !!approval &&
    approval.expires_at === batch.expires_at &&
    approval.hashes.includes(action.version)
  );
}

export function inWindow(campaign: Campaign): boolean {
  const window = campaign.plan.window_utc;
  const now = Date.now();
  return (
    !window || (now >= Date.parse(window[0]) && now < Date.parse(window[1]))
  );
}

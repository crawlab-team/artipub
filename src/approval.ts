import { sha256, type Approval, type Campaign } from "./campaign.ts";
import { postizProvider } from "./postiz.ts";
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

function socialActions(campaign: Campaign) {
  const actions = [];
  const remoteKeys = new Set<string>();
  for (const item of campaign.plan.items) {
    if (!item.target.startsWith("postiz/") || !item.steps || item.status)
      continue;
    const match = /^postiz\/([a-z][a-z0-9-]*)\/([^/]+)$/.exec(item.target);
    const spec = match && postizProvider(match[1]);
    if (!match || !spec)
      throw new Error(`Unsupported Postiz target for ${item.id}`);
    const provider = match[1];
    const account = spec.handle(match[2]);
    const text = campaign.payloads.get(item.content!)!;
    if (
      !account ||
      (item.account !== undefined && spec.handle(item.account) !== account) ||
      item.steps.join() !== "publish" ||
      item.tag ||
      item.commit ||
      item.assets?.length ||
      !spec.validText(text)
    ) {
      throw new Error(`Invalid ${provider} text post: ${item.id}`);
    }
    const target = `postiz/${provider}/${account}`;
    const remoteKey = `${target}@${sha256(text)}`;
    if (remoteKeys.has(remoteKey))
      throw new Error(`Duplicate Postiz text for ${target}`);
    remoteKeys.add(remoteKey);
    const version = sha256([
      item.id,
      target,
      "publish",
      text,
      item.after ?? null,
    ]);
    actions.push({
      kind: "postiz" as const,
      item: item.id,
      after: item.after,
      target,
      provider,
      account,
      text,
      version,
      remoteKey,
      requestKey: sha256([version, "publish"]),
    });
  }
  return actions;
}

export type SocialAction = ReturnType<typeof socialActions>[number];
export type Action = ReleaseAction | SocialAction;

export function approvalBatch(campaign: Campaign) {
  const byItem = new Map<string, Action>(
    [...releaseActions(campaign), ...socialActions(campaign)].map((action) => [
      action.item,
      action,
    ]),
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
      throw new Error("No runnable campaign actions to approve");
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
  action: Action,
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

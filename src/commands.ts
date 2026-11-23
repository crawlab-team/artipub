import { approvalBatch } from "./approval.ts";
import { GitHubReleases } from "./github.ts";
import { PostizBluesky } from "./postiz.ts";
import { runCampaign } from "./run.ts";
import { readCampaign } from "./workspace.ts";

export async function review(workspace: string, campaign: string) {
  const log = await readCampaign(workspace, campaign);
  const { actions, digest } = approvalBatch(log);
  return {
    campaign: log.plan.campaign,
    window_utc: log.plan.window_utc,
    digest,
    actions: actions.map(
      ({ kind, requestKey: _requestKey, remoteKey, ...action }) =>
        kind === "postiz" ? { ...action, target: remoteKey } : action,
    ),
  };
}

export async function status(workspace: string, campaign: string) {
  const log = await readCampaign(workspace, campaign);
  return {
    campaign: log.plan.campaign,
    items: log.plan.items,
    approval: log.approval,
    records: log.records,
  };
}

export function run(workspace: string, campaign: string) {
  return runCampaign(
    workspace,
    campaign,
    new GitHubReleases(process.env.GITHUB_TOKEN),
    new PostizBluesky(process.env.POSTIZ_URL, process.env.POSTIZ_API_KEY),
  );
}

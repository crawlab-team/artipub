import { approvalBatch, verificationKey } from "./approval.ts";
import { GitHubReleases } from "./github.ts";
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
      ({ item, after, repo, account, tag, commit, title, body, version }) => ({
        item,
        after,
        repo,
        account,
        tag,
        commit,
        title,
        body,
        version,
      }),
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
  const key = process.env.KIRZNER_APPROVAL_PUBLIC_KEY
    ? verificationKey()
    : undefined;
  return runCampaign(
    workspace,
    campaign,
    new GitHubReleases(process.env.GITHUB_TOKEN),
    key,
  );
}

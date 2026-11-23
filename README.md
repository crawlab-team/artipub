<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/brand/kirzner-lockup-dark.png">
  <img src="docs/brand/kirzner-lockup-light.png" alt="Kirzner" width="240">
</picture>

Kirzner, formerly ArtiPub, is a local CLI, MCP server, and agent skill for preparing and running a release campaign. Each campaign is one Markdown file. A maintainer approves the exact batch, then an agent can run it. This version supports public GitHub Releases for existing tags and direct text posts to Bluesky.

## Install

With Node.js 22.20 or newer, run `npm ci && npm pack && npm install -g ./kirzner-0.1.0.tgz` from this checkout. The package includes the portable skill at `skills/kirzner/SKILL.md`.

## Write a campaign

Save a file such as `campaign.md` in your workspace. Replace the example repository and account with your own. The account is the GitHub login that will publish the release. Add `commit` to an item to pin the tag to a specific commit SHA, and optionally add `window_utc: [start, end]` to the plan using UTC timestamps.

```markdown
---
schema: 1
campaign: demo-launch
items:
  - id: release
    content: release-v1
    target: github/example/demo
    account: example
    steps: [publish]
    tag: v1.0.0
---

## release-v1

Title: Demo v1.0.0

Install the demo and follow the quickstart to make your first export.

## Next move

Collect first-use feedback in the repository discussions.
```

For a Bluesky post, add an item like this and place its exact plain text in a `## bluesky-v1` section. You can add `after: release` to wait for the release to become public.

```yaml
- id: bluesky
  content: bluesky-v1
  target: bluesky/example.bsky.social
  steps: [publish]
```

Kirzner adds `## Execution` with fenced YAML approval and action records. Adjacent prose stays intact. The GitHub adapter moves directly from `prepared` to `public` after public read-back and records the GitHub ID and URL. Follower notification has no separate action for GitHub Releases.

## Connect Bluesky

In Bluesky, open **Settings → Privacy and security → App passwords** and create an app password for Kirzner. Set `BLUESKY_HANDLE` to the full handle in the campaign target and `BLUESKY_APP_PASSWORD` to the generated app password in the executor environment. Keep the password out of campaign files and use an app password exclusively.

Kirzner writes directly through the account's AT Protocol personal data server. HTTP and HTTPS links in the approved text become clickable. A matching repository record can be `pending` while the public Bluesky AppView indexes it. Run again to reconcile. `public` requires matching repository and AppView records and saves the `at://` URI, content ID (CID), and `bsky.app` URL.

## Approve and run

From an operator terminal in the campaign workspace, review and approve the batch:

```sh
kirzner approve campaign.md
```

The approval records each action's content hash in the campaign's `Execution` log. `kirzner run campaign.md` executes only actions whose current hash is approved; editing an action's payload, target, account, tag, or commit changes its hash and requires approval again. Editing notes and recording results leaves approval intact. For GitHub Releases, set `GITHUB_TOKEN` for the approved account, scoped to the target repo with Contents write access.

```sh
kirzner run campaign.md
kirzner status campaign.md
```

For an agent, configure the stdio command `kirzner mcp /path/to/workspace` with the executor environment. It exposes `plan`, `status`, and `run`. Batch approval remains an operator CLI command. Keep the workspace under operator or Kirzner control; an agent with write access to the campaign can change its recorded approvals.

## Pause and recover

Create `.kirzner.pause` in the workspace to pause all campaigns there, or `campaign.md.pause` to pause one. Remove the file to resume. Pauses stop new remote writes and still allow read-back. An in-flight request may complete.

Use one local POSIX workspace as the executor. Stop the runner before editing campaign files or restoring them from Git. If a crash leaves `.kirzner.lock` behind, confirm every runner for that workspace has stopped, then remove the empty lock directory with `rmdir .kirzner.lock` and rerun. Kirzner reconciles interrupted writes by GitHub tag or by looking up the deterministic Bluesky record key. A missing or conflicting result after an unclear write holds the action because the original request may still take effect. Use `status` to find the recorded intent and check the platform.

## Roadmap

X and LinkedIn will each need their own developer app. Other future platforms include V2EX, 小红书, and 视频号.

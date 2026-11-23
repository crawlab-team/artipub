<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/brand/kirzner-lockup-dark.png">
  <img src="docs/brand/kirzner-lockup-light.png" alt="Kirzner" width="240">
</picture>

Kirzner, formerly ArtiPub, is a local CLI, MCP server, and agent skill for preparing and running a release campaign. Each campaign is one Markdown file. A maintainer approves the exact batch, then an agent can run it. This version supports public GitHub Releases for existing tags.

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

Kirzner adds `## Execution` with fenced YAML approval and action records. Adjacent prose stays intact. The GitHub adapter moves directly from `prepared` to `public` after public read-back and records the GitHub ID and URL. Follower notification has no separate action for GitHub Releases.

## Approve and run

Generate an Ed25519 key pair once, outside the campaign workspace. For example, with OpenSSL:

```sh
umask 077
openssl genpkey -algorithm Ed25519 -out "$HOME/kirzner-approval.pem"
openssl pkey -in "$HOME/kirzner-approval.pem" -pubout -out "$HOME/kirzner-approval.pub"
```

From an operator terminal in the campaign workspace, review and sign the batch:

```sh
KIRZNER_APPROVAL_PRIVATE_KEY="$(cat "$HOME/kirzner-approval.pem")" kirzner approve campaign.md
```

Give the executor the public key and `GITHUB_TOKEN` for the approved account, scoped to the target repo with Contents write access. From that workspace:

```sh
export KIRZNER_APPROVAL_PUBLIC_KEY="$(cat "$HOME/kirzner-approval.pub")"
kirzner run campaign.md
kirzner status campaign.md
```

For an agent, configure the stdio command `kirzner mcp /path/to/workspace` with the same executor environment. It exposes `plan`, `status`, and `run`. Batch approval remains an operator CLI command. Editing the outbound payload, target, account, tag, or window requires a new approval. Editing notes and recording results leaves approval intact.

Keys and tokens come from the environment and stay out of the log. Full credential isolation from the agent, using a separate OS identity or executor, is a follow-up. An agent with the operator's shell and file permissions could bypass the workflow, so use a trusted local environment.

## Pause and recover

Create `.kirzner.pause` in the workspace to pause all campaigns there, or `campaign.md.pause` to pause one. Remove the file to resume. Pauses stop new remote writes and still allow read-back. An in-flight request may complete.

Use one local POSIX workspace as the executor. Stop the runner before editing campaign files or restoring them from Git. If a crash leaves `.kirzner.lock` behind, confirm every runner for that workspace has stopped, then remove the empty lock directory with `rmdir .kirzner.lock` and rerun. Kirzner looks up any interrupted write by tag before proceeding. An absent or conflicting result after an unclear write leaves that action on hold because the original request may still take effect. Use `status` to find its recorded intent and check the release in GitHub.

## Roadmap

Bluesky via Postiz, V2EX, 小红书, and 视频号.

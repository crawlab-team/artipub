import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, type TestContext } from "node:test";
import { approvalBatch, approveCampaign } from "../src/approval.ts";
import { GitHubReleases } from "../src/github.ts";
import { Postiz } from "../src/postiz.ts";
import { runCampaign } from "../src/run.ts";
import { readCampaign } from "../src/workspace.ts";

const handle = "launch.example.com";
const did = "did:plc:syntheticexample";
const text = "Kirzner launch\nSee https://example.com/launch?a=1&b=2";
const uri = `at://${did}/app.bsky.feed.post/example`;
const postizUrl = "https://postiz.example.com";
const name = "launch.md";

async function fixture(t: TestContext) {
  const root = await mkdtemp(join(tmpdir(), "kirzner-postiz-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  let creates = 0;
  const state = {
    outcome: "accepted",
    remote: undefined as "QUEUE" | "DRAFT" | "PUBLISHED" | undefined,
    publicText: undefined as string | undefined,
  };
  const http: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    const headers = new Headers(init?.headers);
    if (url.origin === postizUrl) {
      assert.equal(headers.get("Authorization"), "synthetic-key");
      if (url.pathname === "/api/public/v1/integrations") {
        return Response.json([
          {
            id: "other",
            identifier: "mastodon",
            profile: handle,
            disabled: false,
          },
          {
            id: "channel",
            identifier: "bluesky",
            profile: `@${handle}`,
            disabled: false,
          },
        ]);
      }
      assert.equal(url.pathname, "/api/public/v1/posts");
      if (init?.method === "POST") {
        creates++;
        const body = JSON.parse(String(init.body));
        assert.equal(body.type, "now");
        assert.equal(body.shortLink, false);
        assert.deepEqual(body.posts, [
          {
            integration: { id: "channel" },
            value: [{ content: text, image: [] }],
            settings: { __type: "bluesky" },
          },
        ]);
        if (state.outcome === "lost")
          throw new Error("Synthetic transport failure");
        state.remote = "QUEUE";
        return Response.json([{ postId: "job", integration: "channel" }], {
          status: 201,
        });
      }
      assert.ok(url.searchParams.get("startDate"));
      assert.ok(url.searchParams.get("endDate"));
      return Response.json({
        posts: state.remote
          ? [
              {
                id: "job",
                content: text,
                state: state.remote,
                integration: { id: "channel", providerIdentifier: "bluesky" },
                releaseId: state.remote === "PUBLISHED" ? uri : null,
              },
            ]
          : [],
      });
    }
    assert.equal(url.origin, "https://public.api.bsky.app");
    assert.equal(headers.has("Authorization"), false);
    if (url.pathname.endsWith("/app.bsky.actor.getProfile")) {
      assert.equal(url.searchParams.get("actor"), handle);
      return Response.json({ did, handle });
    }
    const publicPosts = state.publicText
      ? [
          {
            uri,
            author: { did },
            record: {
              $type: "app.bsky.feed.post",
              text: state.publicText,
              createdAt: new Date().toISOString(),
            },
          },
        ]
      : [];
    if (url.pathname.endsWith("/app.bsky.feed.getPosts")) {
      assert.equal(url.searchParams.get("uris"), uri);
      return Response.json({ posts: publicPosts });
    }
    assert.ok(url.pathname.endsWith("/app.bsky.feed.getAuthorFeed"));
    assert.equal(url.searchParams.get("actor"), did);
    return Response.json({ feed: publicPosts.map((post) => ({ post })) });
  };
  const github = new GitHubReleases(undefined, http);
  const postiz = new Postiz(postizUrl, "synthetic-key", http);
  await writeFile(
    join(root, name),
    `---
schema: 1
campaign: launch
items:
  - id: social
    content: bluesky
    target: postiz/bluesky/${handle}
    steps: [publish]
---

## bluesky

${text}
`,
  );
  const batch = approvalBatch(await readCampaign(root, name));
  return {
    root,
    state,
    approve: () => approveCampaign(root, name, batch.digest),
    run: () => runCampaign(root, name, github, postiz),
    log: () => readCampaign(root, name),
    creates: () => creates,
  };
}

test("synthetic Postiz receipt stays scheduled until the exact post is public", async (t) => {
  const f = await fixture(t);
  assert.equal((await f.run())[0].status, "unapproved");
  assert.equal(f.creates(), 0);
  await f.approve();
  assert.equal((await f.run())[0].status, "scheduled");
  assert.deepEqual(
    (await f.log()).records.map(({ milestone }) => milestone),
    ["prepared", "scheduled"],
  );

  await writeFile(join(f.root, `${name}.pause`), "");
  f.state.remote = "PUBLISHED";
  f.state.publicText = "Different copy";
  assert.equal((await f.run())[0].status, "scheduled");
  f.state.publicText = text;
  assert.deepEqual((await f.run())[0], {
    item: "social",
    status: "public",
    url: `https://bsky.app/profile/${did}/post/example`,
    postiz_id: "job",
  });
  const last = (await f.log()).records.at(-1);
  assert.equal(last?.native_id, uri);
  assert.equal(last?.postiz_integration_id, "channel");
  assert.equal(last?.source, "bluesky_public_appview");
  assert.equal(f.creates(), 1);
});

test("synthetic lost response stays unknown and recovers by author feed without another create", async (t) => {
  const f = await fixture(t);
  f.state.outcome = "lost";
  await f.approve();
  assert.equal((await f.run())[0].status, "unknown");
  assert.equal((await f.run())[0].status, "unknown");
  f.state.publicText = text;
  assert.equal((await f.run())[0].status, "public");
  assert.equal(f.creates(), 1);
});

test("synthetic existing Postiz draft prevents creating a duplicate", async (t) => {
  const f = await fixture(t);
  f.state.remote = "DRAFT";
  await f.approve();
  assert.equal((await f.run())[0].status, "draft_saved");
  assert.equal((await f.log()).records.at(-1)?.postiz_id, "job");
  assert.equal(f.creates(), 0);
});

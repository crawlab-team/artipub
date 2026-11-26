import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, type TestContext } from "node:test";
import { approvalBatch, approveCampaign } from "../src/approval.ts";
import { Bluesky, blueskyReadReason } from "../src/bluesky.ts";
import { GitHubReleases } from "../src/github.ts";
import { runCampaign } from "../src/run.ts";
import { readCampaign } from "../src/workspace.ts";

const handle = "launch.example.com";
const did = "did:plc:syntheticexample";
const link = "https://example.com/launch?a=1&b=2";
const prefix = "Kirzner launch 🚀\nSee (";
const text = `${prefix}${link}).`;
const collection = "app.bsky.feed.post";
const cid = "synthetic-cid";
const name = "launch.md";
const expectedPost = {
  $type: collection,
  text,
  createdAt: "2026-01-01T00:00:00.000Z",
  facets: [
    {
      index: {
        byteStart: Buffer.byteLength(prefix),
        byteEnd: Buffer.byteLength(prefix + link),
      },
      features: [{ $type: "app.bsky.richtext.facet#link", uri: link }],
    },
  ],
};

async function fixture(t: TestContext, defaultPds = false, at?: string) {
  const root = await mkdtemp(join(tmpdir(), "kirzner-bluesky-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(
    join(root, name),
    `---
schema: 1
campaign: launch
items:
  - id: social
    content: bluesky
    target: bluesky/${handle}
    steps: [publish]
${at ? `    at: ${at}\n` : ""}---

## bluesky

${text}
`,
  );
  const batch = approvalBatch(await readCampaign(root, name));
  const rkey = `kirzner-${batch.actions[0].requestKey.slice(7)}`;
  const uri = `at://${did}/${collection}/${rkey}`;
  const pds = defaultPds ? "https://bsky.social" : "https://pds.example.com";
  const events: string[] = [];
  const state = {
    outcome: "accepted",
    record: undefined as typeof expectedPost | undefined,
    appView: "missing",
  };
  const http: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    const headers = new Headers(init?.headers);
    const method = url.pathname.split("/").at(-1)!;
    events.push(method);
    if (method !== "com.atproto.repo.createRecord")
      assert.equal(headers.has("Authorization"), false);
    switch (method) {
      case did:
        assert.equal(url.origin, "https://plc.directory");
        return Response.json({
          id: did,
          alsoKnownAs: [`at://${handle}`],
          service: defaultPds
            ? []
            : [
                {
                  id: "#atproto_pds",
                  type: "AtprotoPersonalDataServer",
                  serviceEndpoint: pds,
                },
              ],
        });
      case "app.bsky.actor.getProfile":
        assert.equal(url.origin, "https://public.api.bsky.app");
        assert.equal(url.searchParams.get("actor"), handle);
        return Response.json({ did, handle });
      case "com.atproto.server.createSession":
        assert.equal(url.origin, pds);
        assert.equal(init?.method, "POST");
        assert.equal(init.redirect, "error");
        assert.deepEqual(JSON.parse(String(init.body)), {
          identifier: handle,
          password: "synthetic-password",
        });
        return Response.json({ handle, did, accessJwt: "synthetic-token" });
      case "com.atproto.repo.getRecord":
        assert.equal(url.origin, pds);
        assert.deepEqual(Object.fromEntries(url.searchParams), {
          repo: did,
          collection,
          rkey,
        });
        return state.record
          ? Response.json({ uri, cid, value: state.record })
          : Response.json({ error: "RecordNotFound" }, { status: 400 });
      case "com.atproto.repo.createRecord": {
        assert.equal(url.origin, pds);
        assert.equal(init?.method, "POST");
        assert.equal(headers.get("Authorization"), "Bearer synthetic-token");
        const body = JSON.parse(String(init.body));
        assert.equal(
          new Date(body.record.createdAt).toISOString(),
          body.record.createdAt,
        );
        assert.deepEqual(body, {
          repo: did,
          collection,
          rkey,
          record: { ...expectedPost, createdAt: body.record.createdAt },
        });
        assert.equal(
          (await readCampaign(root, name)).records.at(-1)?.status,
          "reserved",
        );
        assert.equal(events.at(-2), "com.atproto.repo.getRecord");
        if (state.outcome === "lost")
          throw new Error("Synthetic transport failure");
        state.record = body.record;
        return Response.json({ uri, cid });
      }
      case "app.bsky.feed.getPosts":
        assert.equal(url.origin, "https://public.api.bsky.app");
        assert.equal(url.searchParams.get("uris"), uri);
        return Response.json({
          posts:
            state.appView === "missing"
              ? []
              : [
                  {
                    uri,
                    cid,
                    author: { did },
                    record: {
                      ...state.record,
                      ...(state.appView === "conflict"
                        ? { text: "Different copy" }
                        : {}),
                    },
                  },
                ],
        });
      default:
        assert.fail(`Unexpected request ${url}`);
    }
  };
  const github = new GitHubReleases(undefined, http);
  const bluesky = new Bluesky(handle, "synthetic-password", http);
  return {
    root,
    state,
    events,
    uri,
    url: `https://bsky.app/profile/${did}/post/${rkey}`,
    approve: () => approveCampaign(root, name, batch.digest),
    run: () => runCampaign(root, name, github, bluesky),
    log: () => readCampaign(root, name),
    creates: () =>
      events.filter((event) => event === "com.atproto.repo.createRecord")
        .length,
  };
}

test("synthetic direct publish waits for matching public read-back, including while paused", async (t) => {
  const f = await fixture(t);
  assert.equal((await f.run())[0].status, "unapproved");
  assert.deepEqual(f.events, []);
  await f.approve();
  assert.equal((await f.run())[0].status, "pending");
  await writeFile(join(f.root, `${name}.pause`), "");
  f.state.appView = "conflict";
  assert.equal((await f.run())[0].status, "unknown");
  f.state.appView = "public";
  assert.deepEqual((await f.run())[0], {
    item: "social",
    status: "public",
    url: f.url,
    native_id: f.uri,
    cid,
  });
  const last = (await f.log()).records.at(-1);
  assert.equal(last?.native_id, f.uri);
  assert.equal(last?.cid, cid);
  assert.equal(last?.source, "bluesky_public_appview");
  assert.equal(last?.intent, undefined);
  assert.equal(f.creates(), 1);
});

test("synthetic lost write response reconciles by record key without another create", async (t) => {
  const f = await fixture(t, true);
  f.state.outcome = "lost";
  await f.approve();
  assert.equal((await f.run())[0].status, "unknown");
  assert.equal((await f.run())[0].status, "unknown");
  f.state.record = expectedPost;
  f.state.appView = "public";
  assert.equal((await f.run())[0].status, "public");
  assert.equal(f.creates(), 1);
  assert.equal(
    f.events.filter((event) => event === "com.atproto.server.createSession")
      .length,
    1,
  );
});

test("synthetic scheduled post waits without writing and changing at requires approval", async (t) => {
  const future = "2099-01-01T00:00:00.000Z";
  const f = await fixture(t, false, future);
  await f.approve();
  assert.deepEqual(await f.run(), [
    {
      item: "social",
      status: "waiting",
      reason: `waiting until ${future}`,
    },
  ]);
  assert.deepEqual(f.events, []);
  assert.deepEqual((await f.log()).records, []);

  const campaign = await f.log();
  const earlier = "2000-01-01T00:00:00.000Z";
  await writeFile(
    join(f.root, name),
    campaign.text.replace(`    at: ${future}`, `    at: ${earlier}`),
  );
  assert.equal((await f.run())[0].status, "unapproved");
  assert.deepEqual(f.events, []);

  const changed = approvalBatch(await f.log());
  await approveCampaign(f.root, name, changed.digest);
  f.state.appView = "public";
  assert.equal((await f.run())[0].status, "public");
  assert.equal(f.creates(), 1);
});

test("read failures retain operation and safe error class without exposing messages", () => {
  assert.equal(
    blueskyReadReason(
      new TypeError("secret-bearing transport detail"),
      "public lookup",
    ),
    "Bluesky public lookup failed (TypeError)",
  );
  assert.equal(
    blueskyReadReason(new Error("private detail"), "record lookup"),
    "Bluesky record lookup failed (Error)",
  );
  assert.equal(
    blueskyReadReason(
      { name: "TokenLeak", message: "private detail" },
      "session creation",
    ),
    "Bluesky session creation failed (Error)",
  );
});

test("synthetic pre-existing key blocks conflicting content and adopts matching content without writing", async (t) => {
  const f = await fixture(t);
  f.state.record = { ...expectedPost, text: "Different copy" };
  f.state.appView = "public";
  await f.approve();
  assert.equal((await f.run())[0].status, "blocked");
  f.state.record = expectedPost;
  assert.equal((await f.run())[0].status, "public");
  assert.equal(f.creates(), 0);
  assert.ok(!f.events.includes("com.atproto.server.createSession"));
});

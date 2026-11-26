import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, type TestContext } from "node:test";
import { approvalBatch, approveCampaign } from "../src/approval.ts";
import {
  Bluesky,
  blueskyReadReason,
  blueskyRecordKey,
  parseBlueskyCardHtml,
} from "../src/bluesky.ts";
import { sha256 } from "../src/campaign.ts";
import { GitHubReleases } from "../src/github.ts";
import { runCampaign } from "../src/run.ts";
import { readCampaign, withCampaign } from "../src/workspace.ts";

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

test("Open Graph metadata uses title fallbacks and preserves relative images", () => {
  assert.deepEqual(
    parseBlueskyCardHtml(
      '<html><head><title>Fallback &amp; title</title><meta name="description" content="Summary"><meta property="og:image" content="/card.png"></head></html>',
    ),
    { title: "Fallback & title", description: "Summary", image: "/card.png" },
  );
  assert.deepEqual(
    parseBlueskyCardHtml(
      '<meta property="og:title" content="Open Graph"><meta property="og:description" content="OG summary"><meta property="og:image" content="https://images.example/card.png">',
    ),
    { title: "Open Graph", description: "OG summary", image: "https://images.example/card.png" },
  );
});

async function createWithCard(cardFetch: typeof fetch, text = `See ${link}`) {
  const intent = {
    account: handle,
    did,
    pds: "https://pds.example.com",
    rkey: "234567abcdefghj",
    text,
  };
  let record: Record<string, unknown> | undefined;
  let writtenRkey: string | undefined;
  let uploads = 0;
  const http: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith("/com.atproto.repo.uploadBlob")) {
      uploads++;
      assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer synthetic-token");
      return Response.json({ blob: { $type: "blob", ref: { $link: "synthetic-blob" }, mimeType: "image/png", size: 3 } });
    }
    assert.equal(url.pathname.endsWith("/com.atproto.repo.createRecord"), true);
    const body = JSON.parse(String(init?.body));
    writtenRkey = body.rkey;
    record = body.record;
    return Response.json({ uri: `at://${did}/${collection}/${intent.rkey}`, cid });
  };
  const bluesky = new Bluesky(handle, "synthetic-password", http, { cardFetch });
  const receipt = await bluesky.create(intent, "synthetic-token");
  assert.equal(receipt.uri, `at://${did}/${collection}/${intent.rkey}`);
  return {
    record: record! as {
      text: string;
      facets: Array<{ features: Array<{ uri: string }> }>;
      embed?: unknown;
    },
    uploads,
    intent,
    writtenRkey,
  };
}

test("external card attaches a thumbnail blob and preserves approved post fields", async () => {
  let cardRequests = 0;
  const result = await createWithCard(async (_input, init) => {
    assert.equal(new Headers(init?.headers).has("Authorization"), false);
    assert.equal(new Headers(init?.headers).get("User-Agent"), "kirzner-card-fetch");
    cardRequests++;
    return cardRequests === 1
      ? new Response('<meta property="og:title" content="Launch"><meta property="og:description" content="Details"><meta property="og:image" content="/thumb.png">', { headers: { "content-type": "text/html" } })
      : new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "image/png" } });
  });
  assert.deepEqual(result.record.embed, {
    $type: "app.bsky.embed.external",
    external: { uri: link, title: "Launch", description: "Details", thumb: { $type: "blob", ref: { $link: "synthetic-blob" }, mimeType: "image/png", size: 3 } },
  });
  assert.equal(result.record.text, result.intent.text);
  assert.equal(result.record.facets[0].features[0].uri, link);
  assert.equal(result.writtenRkey, result.intent.rkey);
  assert.equal(result.uploads, 1);
});

test("oversized thumbnail keeps the external card without uploading", async () => {
  let requests = 0;
  const result = await createWithCard(async () => {
    requests++;
    return requests === 1
      ? new Response('<meta property="og:title" content="Launch"><meta property="og:image" content="/thumb.png">', { headers: { "content-type": "text/html" } })
      : new Response(new Uint8Array(1_000_001), { headers: { "content-type": "image/png" } });
  });
  assert.deepEqual(result.record.embed, { $type: "app.bsky.embed.external", external: { uri: link, title: "Launch", description: "" } });
  assert.equal(result.uploads, 0);
});

test("page fetch failure and non-HTML responses fall back without an embed", async () => {
  for (const cardFetch of [
    async () => { throw new DOMException("timeout", "TimeoutError"); },
    async () => new Response("not html", { headers: { "content-type": "text/plain" } }),
  ] satisfies (typeof fetch)[]) {
    const result = await createWithCard(cardFetch);
    assert.equal(result.record.embed, undefined);
    assert.equal(result.record.text, result.intent.text);
    assert.equal(result.record.facets[0].features[0].uri, result.intent.text.slice(4));
    assert.equal(result.writtenRkey, result.intent.rkey);
  }
});

test("non-HTTPS and private literal links are skipped", async () => {
  let called = false;
  const cardFetch: typeof fetch = async () => { called = true; throw new Error("must not fetch"); };
  const privateResult = await createWithCard(cardFetch, "See https://127.0.0.1/private");
  const insecureResult = await createWithCard(cardFetch, "See http://example.com/private");
  assert.equal(privateResult.record.embed, undefined);
  assert.equal(insecureResult.record.embed, undefined);
  assert.equal(called, false);
});

test("request digests yield deterministic, distinct TIDs", () => {
  const tid = /^[234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{12}$/;
  const requests = Array.from({ length: 128 }, (_, index) => sha256(index));
  const keys = requests.map(blueskyRecordKey);
  for (const key of keys) assert.match(key, tid);
  assert.deepEqual(requests.map(blueskyRecordKey), keys);
  assert.equal(new Set(keys).size, requests.length);
  assert.equal(
    blueskyRecordKey(`sha256:9000000000000001${"f".repeat(48)}`),
    "3222222222223",
  );
  assert.doesNotMatch(`kirzner-${requests[0].slice(7)}`, tid);
});

async function fixture(
  t: TestContext,
  options: { defaultPds?: boolean; at?: string; legacy?: boolean; cardFetch?: typeof fetch } = {},
) {
  const { defaultPds, at, legacy, cardFetch } = options;
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
  const action = batch.actions[0];
  const rkey = legacy
    ? `kirzner-${action.requestKey.slice(7)}`
    : blueskyRecordKey(action.requestKey);
  const uri = `at://${did}/${collection}/${rkey}`;
  const pds = defaultPds ? "https://bsky.social" : "https://pds.example.com";
  if (legacy)
    await withCampaign(root, name, (store) =>
      store.append({
        record: {
          item: action.item,
          step: "publish",
          version: action.version,
          request_key: action.requestKey,
          remote_key: action.remoteKey,
          intent: { account: handle, did, pds, rkey, text },
          milestone: "prepared",
          status: "reserved",
        },
      }),
    );
  const events: string[] = [];
  const state = {
    outcome: "accepted",
    record: undefined as typeof expectedPost | undefined,
    appView: "missing",
    sessionResponse: undefined as Response | undefined,
    writeResponse: undefined as (() => Response) | undefined,
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
        return (
          state.sessionResponse ??
          Response.json({ handle, did, accessJwt: "synthetic-token" })
        );
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
        if (state.writeResponse) return state.writeResponse();
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
  const bluesky = new Bluesky(handle, "synthetic-password", http, {
    cardFetch: cardFetch ?? (async () => new Response("not a card", { headers: { "content-type": "text/plain" } })),
  });
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
  const f = await fixture(t, { defaultPds: true });
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

test("synthetic legacy reservation reconciles using its saved key", async (t) => {
  const f = await fixture(t, { legacy: true });
  f.state.record = expectedPost;
  f.state.appView = "public";
  const [result] = await f.run();
  assert.equal(result.status, "public");
  assert.equal(result.native_id, f.uri);
  assert.equal(f.creates(), 0);
});

const jwtLike = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0In0.signature";
const appPasswordLike = "abcd-efgh-ijkl-mnop";
const responseOnly = "synthetic-private-body-field";

function assertNoWriteSecrets(output: string) {
  for (const secret of [
    "synthetic-password",
    "synthetic-token",
    jwtLike,
    appPasswordLike,
    responseOnly,
    "Authorization",
    "Bearer",
  ]) {
    assert.ok(!output.includes(secret));
  }
}

test("synthetic InvalidRequest blocks the rejected attempt and allows a fresh run", async (t) => {
  const f = await fixture(t);
  f.state.writeResponse = () =>
    Response.json(
      { error: "InvalidRequest", message: `Check ${appPasswordLike}` },
      { status: 400 },
    );
  await f.approve();
  const [result] = await f.run();
  assert.equal(result.status, "blocked");
  const reason = result.reason ?? "";
  assert.match(reason, /Bluesky createRecord returned HTTP 400/);
  assert.match(reason, /InvalidRequest/);
  assertNoWriteSecrets(reason);
  const record = (await f.log()).records.at(-1);
  assert.equal(record?.status, "blocked");
  assert.equal(record?.reason, reason);
  assert.equal(f.creates(), 1);

  f.state.writeResponse = undefined;
  f.state.appView = "public";
  assert.equal((await f.run())[0].status, "public");
  assert.equal(f.creates(), 2);
});

const writeFailures = [
  {
    name: "server error",
    respond: () =>
      Response.json({ error: "InternalServerError" }, { status: 500 }),
    details: ["HTTP 500", "InternalServerError"],
  },
  {
    name: "invalid JSON on HTTP 400",
    respond: () => new Response("invalid JSON", { status: 400 }),
    details: ["HTTP 400", "SyntaxError", "timeout=false"],
  },
  {
    name: "non-OK XRPC response",
    respond: () =>
      Response.json(
        {
          error: "RateLimitExceeded",
          message: `Try again later ${"x".repeat(250)}`,
          private: responseOnly,
        },
        { status: 429 },
      ),
    details: [
      "HTTP 429",
      "WriteError",
      'XRPC error="RateLimitExceeded"',
      `XRPC message="${`Try again later ${"x".repeat(250)}`.slice(0, 200)}"`,
      "timeout=false",
    ],
  },
  {
    name: "secret-bearing XRPC response",
    respond: () =>
      Response.json(
        { error: jwtLike, message: `Authorization: Bearer ${responseOnly}` },
        { status: 401 },
      ),
    details: ["HTTP 401", "timeout=false"],
  },
  {
    name: "invalid JSON",
    respond: () => new Response(`invalid JSON ${jwtLike}`),
    details: ["HTTP 200", "SyntaxError", "timeout=false"],
  },
  {
    name: "URI mismatch",
    respond: () =>
      Response.json({
        uri: `at://did:plc:${responseOnly}/${collection}/different-key`,
        cid,
      }),
    details: ["HTTP 200", "receipt URI mismatch", "received key=different-key"],
  },
  {
    name: "URI mismatch with a credential-like record key",
    respond: () =>
      Response.json({
        uri: `at://${did}/${collection}/${appPasswordLike}`,
        cid,
      }),
    details: ["receipt URI mismatch", "received key=unavailable"],
  },
  {
    name: "timeout",
    respond: () => {
      throw new DOMException(jwtLike, "TimeoutError");
    },
    details: ["DOMException", "TimeoutError", "timeout=true"],
  },
  {
    name: "abort",
    respond: () => {
      throw new DOMException(appPasswordLike, "AbortError");
    },
    details: ["DOMException", "AbortError", "timeout=false"],
  },
  {
    name: "fetch TypeError with a cause code",
    respond: () => {
      throw new TypeError("Authorization: Bearer synthetic-token", {
        cause: Object.assign(new Error(jwtLike), { code: "ETIMEDOUT" }),
      });
    },
    details: [
      "TypeError",
      "cause=ETIMEDOUT",
      "cause name=Error",
      "timeout=true",
    ],
  },
];

for (const { name, respond, details } of writeFailures) {
  test(`synthetic createRecord failure logs ${name} safely`, async (t) => {
    const f = await fixture(t);
    f.state.writeResponse = respond;
    await f.approve();
    const [result] = await f.run();
    assert.equal(result.status, "unknown");
    const reason = result.reason ?? "";
    assert.match(reason, /Bluesky createRecord/);
    assert.match(reason, /Rerun to reconcile by record key/);
    for (const detail of details) assert.ok(reason.includes(detail), reason);
    if (name.startsWith("URI mismatch"))
      assert.ok(reason.includes(`expected key=${f.uri.split("/").at(-1)}`));
    const record = (await f.log()).records.at(-1);
    assert.equal(record?.status, "unknown");
    assert.equal(record?.reason, reason);
    assertNoWriteSecrets(reason);
    assert.equal((await f.run())[0].status, "unknown");
    assert.equal(f.creates(), 1);
  });
}

test("synthetic session failure identifies the step and blocks dispatch", async (t) => {
  const f = await fixture(t);
  f.state.sessionResponse = Response.json(
    { error: "AuthenticationRequired", message: "Check synthetic-password" },
    { status: 401 },
  );
  await f.approve();
  const [result] = await f.run();
  assert.equal(result.status, "blocked");
  const reason = result.reason ?? "";
  assert.match(reason, /Bluesky session returned HTTP 401/);
  assert.match(reason, /AuthenticationRequired/);
  assertNoWriteSecrets(reason);
  assert.deepEqual((await f.log()).records, []);
  assert.equal(f.creates(), 0);
});

test("synthetic scheduled post waits without writing and changing at requires approval", async (t) => {
  const future = "2099-01-01T00:00:00.000Z";
  const f = await fixture(t, { at: future });
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

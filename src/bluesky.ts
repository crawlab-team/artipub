import { z } from "zod";
import {
  blueskyDid,
  blueskyHandle,
  httpsOrigin,
  type BlueskyIntent,
} from "./campaign.ts";

const collection = "app.bsky.feed.post";
const publicApi = "https://public.api.bsky.app";
const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
const id = z.string().min(1);
const linkFacet = z.strictObject({
  index: z.strictObject({
    byteStart: z.number().int(),
    byteEnd: z.number().int(),
  }),
  features: z.tuple([
    z.strictObject({
      $type: z.literal("app.bsky.richtext.facet#link"),
      uri: id,
    }),
  ]),
});
const postRecord = z.strictObject({
  $type: z.literal(collection),
  text: z.string(),
  createdAt: z.iso.datetime({ offset: true }),
  facets: z.array(linkFacet).optional(),
});
const recordRef = z.object({ uri: id, cid: id });
const repoRecord = recordRef.extend({ value: postRecord });
const publicPosts = z.object({
  posts: z.array(
    recordRef.extend({
      author: z.object({ did: blueskyDid }),
      record: z.unknown(),
    }),
  ),
});
const didDocument = z.object({
  id: blueskyDid,
  alsoKnownAs: z.array(z.string()),
  service: z
    .array(z.object({ id, type: id, serviceEndpoint: z.unknown() }))
    .optional(),
});

export function blueskyAccount(value: string) {
  return blueskyHandle.safeParse(value.replace(/^@/, "").toLowerCase()).data;
}

export function validBlueskyText(text: string) {
  return (
    !!text.trim() &&
    !text.includes("\0") &&
    Buffer.byteLength(text) <= 3000 &&
    [...segmenter.segment(text)].length <= 300
  );
}

function facets(text: string): z.infer<typeof linkFacet>[] {
  const links: z.infer<typeof linkFacet>[] = [];
  for (const match of text.matchAll(
    /(?:^|[\s(\[{<"'])(https?:\/\/[^\s<>"']+)/gi,
  )) {
    let link = match[1].replace(/[.,!?;:]+$/, "");
    for (const [open, close] of [
      ["(", ")"],
      ["[", "]"],
      ["{", "}"],
    ]) {
      if (
        link.endsWith(close) &&
        link.split(close).length > link.split(open).length
      )
        link = link.slice(0, -1);
    }
    const url = URL.parse(link);
    if (!url?.hostname) continue;
    const start = match.index + match[0].length - match[1].length;
    const byteStart = Buffer.byteLength(text.slice(0, start));
    links.push({
      index: { byteStart, byteEnd: byteStart + Buffer.byteLength(link) },
      features: [{ $type: "app.bsky.richtext.facet#link", uri: url.href }],
    });
  }
  return links;
}

function matches(record: z.infer<typeof postRecord>, text: string) {
  return (
    record.text === text &&
    JSON.stringify(record.facets ?? []) === JSON.stringify(facets(text))
  );
}

function atUri(intent: BlueskyIntent) {
  return `at://${intent.did}/${collection}/${intent.rkey}`;
}

class ReadError extends Error {}

const safeErrorClasses = new Set([
  "AggregateError",
  "DOMException",
  "Error",
  "EvalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError",
]);

export function blueskyReadReason(error: unknown, operation = "lookup") {
  if (error instanceof ReadError) return error.message;
  const name = error instanceof Error ? error.constructor.name : "Error";
  const errorClass = safeErrorClasses.has(name) ? name : "Error";
  return `Bluesky ${operation} failed (${errorClass})`;
}

export type BlueskyLookup =
  | { kind: "missing" }
  | { kind: "blocked"; reason: string }
  | ({ uri: string; cid: string; url: string } & (
      { kind: "pending"; reason?: string } | { kind: "public" }
    ));

export class Bluesky {
  private readonly handle: string | undefined;
  private readonly password: string | undefined;
  private readonly http: typeof fetch;

  constructor(handle?: string, password?: string, http: typeof fetch = fetch) {
    this.handle = handle && blueskyAccount(handle);
    this.password = password;
    this.http = http;
  }

  private request(url: string, init?: RequestInit) {
    return this.http(url, {
      ...init,
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
    });
  }

  private async read(response: Response, operation: string): Promise<unknown> {
    if (!response.ok)
      throw new ReadError(`${operation} returned HTTP ${response.status}`);
    return response.json();
  }

  private query(host: string, method: string, params: Record<string, string>) {
    return this.request(
      `${host}/xrpc/${method}?${new URLSearchParams(params)}`,
    );
  }

  private post(host: string, method: string, data: unknown, token?: string) {
    return this.request(`${host}/xrpc/${method}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
  }

  async resolve(
    account: string,
    text: string,
    requestKey: string,
  ): Promise<BlueskyIntent> {
    const profile = z.object({ did: blueskyDid, handle: blueskyHandle }).parse(
      await this.read(
        await this.query(publicApi, "app.bsky.actor.getProfile", {
          actor: account,
        }),
        "Bluesky profile lookup",
      ),
    );
    if (profile.handle !== account)
      throw new ReadError("Bluesky resolved a different handle");
    const { did } = profile;
    const documentUrl = did.startsWith("did:plc:")
      ? `https://plc.directory/${did}`
      : `${httpsOrigin.parse(`https://${did.slice("did:web:".length)}`)}/.well-known/did.json`;
    const document = didDocument.parse(
      await this.read(await this.request(documentUrl), "Bluesky DID lookup"),
    );
    if (
      document.id !== did ||
      !document.alsoKnownAs.includes(`at://${account}`)
    )
      throw new ReadError("Bluesky DID document does not confirm the handle");
    const service = document.service?.find(
      ({ id }) => id === "#atproto_pds" || id === `${did}#atproto_pds`,
    );
    if (service && service.type !== "AtprotoPersonalDataServer")
      throw new ReadError("Bluesky DID document advertises an invalid PDS");
    const pds = service
      ? httpsOrigin.parse(
          z.string().parse(service.serviceEndpoint).replace(/\/$/, ""),
        )
      : "https://bsky.social";
    return {
      account,
      did,
      pds,
      rkey: `kirzner-${requestKey.slice("sha256:".length)}`,
      text,
    };
  }

  async session(intent: BlueskyIntent): Promise<string> {
    if (this.handle !== intent.account || !this.password)
      throw new ReadError(
        "Set BLUESKY_HANDLE and BLUESKY_APP_PASSWORD for the approved handle",
      );
    const session = z
      .object({ did: blueskyDid, handle: blueskyHandle, accessJwt: id })
      .parse(
        await this.read(
          await this.post(intent.pds, "com.atproto.server.createSession", {
            identifier: this.handle,
            password: this.password,
          }),
          "Bluesky session creation",
        ),
      );
    if (session.did !== intent.did || session.handle !== intent.account)
      throw new ReadError("The Bluesky session belongs to a different account");
    return session.accessJwt;
  }

  async lookup(
    intent: BlueskyIntent,
    expectedCid?: string,
  ): Promise<BlueskyLookup> {
    const uri = atUri(intent);
    const response = await this.query(
      intent.pds,
      "com.atproto.repo.getRecord",
      {
        repo: intent.did,
        collection,
        rkey: intent.rkey,
      },
    );
    if (
      response.status === 400 &&
      z
        .object({ error: z.literal("RecordNotFound") })
        .safeParse(await response.json()).success
    )
      return { kind: "missing" };
    const record = repoRecord.safeParse(
      await this.read(response, "Bluesky record lookup"),
    );
    if (
      !record.success ||
      record.data.uri !== uri ||
      !matches(record.data.value, intent.text) ||
      (expectedCid && expectedCid !== record.data.cid)
    )
      return {
        kind: "blocked",
        reason:
          "Bluesky record differs from the approved post or saved receipt",
      };
    const { cid } = record.data;
    const pending = {
      kind: "pending" as const,
      uri,
      cid,
      url: `https://bsky.app/profile/${intent.did}/post/${intent.rkey}`,
    };
    let view: z.infer<typeof publicPosts>;
    try {
      view = publicPosts.parse(
        await this.read(
          await this.query(publicApi, "app.bsky.feed.getPosts", { uris: uri }),
          "Bluesky public lookup",
        ),
      );
    } catch (error) {
      return { ...pending, reason: blueskyReadReason(error, "public lookup") };
    }
    const found = view.posts.find((post) => post.uri === uri);
    if (!found) return pending;
    const value = postRecord.safeParse(found.record);
    if (
      found.author.did !== intent.did ||
      found.cid !== cid ||
      !value.success ||
      !matches(value.data, intent.text)
    )
      return {
        ...pending,
        reason:
          "Public Bluesky post differs from the approved repository record",
      };
    return { ...pending, kind: "public" };
  }

  async create(intent: BlueskyIntent, token: string) {
    const links = facets(intent.text);
    const response = await this.post(
      intent.pds,
      "com.atproto.repo.createRecord",
      {
        repo: intent.did,
        collection,
        rkey: intent.rkey,
        record: {
          $type: collection,
          text: intent.text,
          createdAt: new Date().toISOString(),
          ...(links.length ? { facets: links } : {}),
        },
      },
      token,
    );
    if (!response.ok) return;
    const receipt = recordRef.safeParse(await response.json());
    if (receipt.success && receipt.data.uri === atUri(intent))
      return receipt.data;
  }
}

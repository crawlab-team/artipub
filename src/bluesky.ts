import { z } from "zod";
import { isIP } from "node:net";
import {
  blueskyDid,
  blueskyHandle,
  httpsOrigin,
  type BlueskyIntent,
} from "./campaign.ts";

const collection = "app.bsky.feed.post";
const publicApi = "https://public.api.bsky.app";
const requestTimeoutMs = 15_000;
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
  embed: z
    .strictObject({
      $type: z.literal("app.bsky.embed.external"),
      external: z.strictObject({
        uri: id,
        title: z.string(),
        description: z.string(),
        thumb: z.unknown().optional(),
      }),
    })
    .optional(),
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

export function blueskyRecordKey(requestKey: string): string {
  const alphabet = "234567abcdefghijklmnopqrstuvwxyz";
  const offset = "sha256:".length;
  // The first eight digest bytes hold the big-endian TID value.
  let value = BigInt(`0x${requestKey.slice(offset, offset + 16)}`);
  value &= 0x7fff_ffff_ffff_ffffn;
  let rkey = "";
  for (let digit = 0; digit < 13; digit++) {
    rkey = alphabet[Number(value & 31n)] + rkey;
    value >>= 5n;
  }
  return rkey;
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

function safeErrorClass(error: unknown) {
  const name = error instanceof Error ? error.constructor.name : "Error";
  return safeErrorClasses.has(name) ? name : "Error";
}

export function blueskyReadReason(error: unknown, operation = "lookup") {
  if (error instanceof ReadError) return error.message;
  return `Bluesky ${operation} failed (${safeErrorClass(error)})`;
}

type WriteStep = "session" | "createRecord";

class WriteError extends Error {}

export class BlueskyPostRejected extends WriteError {}

const safeCauseCodes = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ENOTFOUND",
  "EAI_AGAIN",
  "EPIPE",
  "ETIMEDOUT",
  "UND_ERR_ABORTED",
  "UND_ERR_BODY_TIMEOUT",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_SOCKET",
]);
const abortNames = new Set(["AbortError", "TimeoutError"]);
const cardTimeoutMs = 10_000;
const maxHtmlBytes = 512 * 1024;
const maxImageBytes = 5 * 1024 * 1024;
const maxThumbBytes = 1_000_000;
const cardUserAgent = "kirzner-card-fetch";

type ExternalCard = {
  $type: "app.bsky.embed.external";
  external: { uri: string; title: string; description: string; thumb?: unknown };
};

function safeCardUrl(value: string): URL | undefined {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return;
    const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (host === "localhost" || host.endsWith(".localhost")) return;
    const ip = isIP(host);
    if (ip === 4) {
      const [a, b] = host.split(".").map(Number);
      if (a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) return;
    }
    if (ip === 6 && (host === "::" || host === "::1" || /^(?:fe[89ab]|f[cd])/i.test(host))) return;
    return url;
  } catch { return; }
}

function decodeHtml(value: string) {
  return value.replace(/&(?:amp|lt|gt|quot|apos|#39);|&#(?:x[\da-f]+|\d+);/gi, (entity) => {
    const named: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'", "&#39;": "'" };
    if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
    const hex = /^&#x([\da-f]+);$/i.exec(entity), decimal = /^&#(\d+);$/.exec(entity);
    const code = hex ? Number.parseInt(hex[1], 16) : decimal ? Number(decimal[1]) : NaN;
    return Number.isFinite(code) ? String.fromCodePoint(code) : entity;
  });
}

function htmlMetadata(html: string) {
  const meta = new Map<string, string>();
  for (const match of html.matchAll(/<meta\b([^>]+)>/gi)) {
    const attrs = new Map<string, string>();
    for (const attr of match[1].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) attrs.set(attr[1].toLowerCase(), decodeHtml(attr[2] ?? attr[3] ?? attr[4]));
    const key = (attrs.get("property") ?? attrs.get("name") ?? "").toLowerCase(), content = attrs.get("content");
    if (key && content && !meta.has(key)) meta.set(key, content);
  }
  const title = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1].replace(/<[^>]*>/g, "").trim();
  return { title: (meta.get("og:title") || (title ? decodeHtml(title) : "")).slice(0, 300), description: (meta.get("og:description") || meta.get("description") || "").slice(0, 1000), image: meta.get("og:image") };
}

async function boundedBody(response: Response, limit: number): Promise<Uint8Array> {
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > limit) throw new Error("body too large");
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader(), chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) { await reader.cancel(); throw new Error("body too large"); }
    chunks.push(value);
  }
  const body = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return body;
}

async function fetchCardPage(fetcher: typeof fetch, initial: string) {
  let url = safeCardUrl(initial);
  if (!url) throw new Error("unsafe URL");
  for (let redirects = 0; redirects <= 3; redirects++) {
    const response = await fetcher(url, { headers: { "User-Agent": cardUserAgent }, redirect: "manual", signal: AbortSignal.timeout(cardTimeoutMs) });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location || redirects === 3) throw new Error("redirect limit");
      const next = safeCardUrl(new URL(location, url).href);
      if (!next) throw new Error("unsafe redirect");
      url = next; continue;
    }
    if (!response.ok || !/^text\/html(?:\s*;|$)/i.test(response.headers.get("content-type") ?? "")) throw new Error("not html");
    return { page: url, metadata: htmlMetadata(new TextDecoder().decode(await boundedBody(response, maxHtmlBytes))) };
  }
  throw new Error("redirect limit");
}

async function externalCard(fetcher: typeof fetch, pageUrl: string, upload: (bytes: Uint8Array, mime: string) => Promise<unknown>): Promise<ExternalCard | undefined> {
  try {
    const { page, metadata } = await fetchCardPage(fetcher, pageUrl);
    if (!metadata.title && !metadata.description) return;
    const card: ExternalCard = { $type: "app.bsky.embed.external", external: { uri: page.href, title: metadata.title, description: metadata.description } };
    if (metadata.image) {
      const imageUrl = safeCardUrl(new URL(metadata.image, page).href);
      if (imageUrl) {
        const response = await fetcher(imageUrl, { headers: { "User-Agent": cardUserAgent }, redirect: "manual", signal: AbortSignal.timeout(cardTimeoutMs) });
        const mime = (response.headers.get("content-type") ?? "").split(";")[0].toLowerCase();
        if (response.ok && ["image/jpeg", "image/png", "image/webp"].includes(mime)) {
          const bytes = await boundedBody(response, maxImageBytes);
          if (bytes.byteLength <= maxThumbBytes) card.external.thumb = await upload(bytes, mime);
        }
      }
    }
    return card;
  } catch { return; }
}

export function parseBlueskyCardHtml(html: string) { return htmlMetadata(html); }

export function blueskyWriteReason(error: unknown, step: WriteStep) {
  if (error instanceof WriteError) return error.message;
  return `Bluesky ${step} failed (${writeErrorDetails(error)})`;
}

function writeErrorDetails(error: unknown, signal?: AbortSignal) {
  const cause: unknown = error instanceof Error ? error.cause : undefined;
  const causeCode =
    cause && typeof cause === "object" && "code" in cause
      ? cause.code
      : undefined;
  const causeName =
    cause && typeof cause === "object" && "name" in cause
      ? cause.name
      : undefined;
  const name = error instanceof Error ? error.name : undefined;
  const timeout =
    signal?.aborted === true ||
    name === "TimeoutError" ||
    causeName === "TimeoutError" ||
    causeCode === "ETIMEDOUT" ||
    causeCode === "UND_ERR_BODY_TIMEOUT" ||
    causeCode === "UND_ERR_CONNECT_TIMEOUT" ||
    causeCode === "UND_ERR_HEADERS_TIMEOUT";
  const details = [safeErrorClass(error), `timeout=${timeout}`];
  if (name && abortNames.has(name)) details.push(name);
  if (typeof causeCode === "string" && safeCauseCodes.has(causeCode))
    details.push(`cause=${causeCode}`);
  if (
    typeof causeName === "string" &&
    (abortNames.has(causeName) || safeErrorClasses.has(causeName))
  )
    details.push(`cause name=${causeName}`);
  return details.join(", ");
}

function safeDiagnostic(value: unknown, secrets: readonly string[]) {
  if (typeof value !== "string") return;
  if (
    secrets.some((secret) => secret && value.includes(secret)) ||
    /\b(?:authorization|bearer|accessjwt|refreshjwt)\b|\bpassword\s*[=:]/i.test(
      value,
    ) ||
    /eyJ[\w-]*\.[\w-]*\.[\w-]*/.test(value) ||
    /(?<![a-z0-9_-])[a-z0-9_-]{8,}\.[a-z0-9_-]{8,}\.[a-z0-9_-]*/i.test(value) ||
    /[a-z0-9]{4}(?:-[a-z0-9]{4}){3}/i.test(value)
  )
    return;
  return value.trim().slice(0, 200);
}

function receivedRecordKey(uri: string, secrets: readonly string[]) {
  const key =
    /^at:\/\/[a-z0-9.:%-]+\/[a-z0-9.-]+\/([a-z0-9._~:-]{1,512})$/i.exec(
      uri,
    )?.[1];
  return safeDiagnostic(key, secrets) || "unavailable";
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
  private readonly cardFetch: typeof fetch;

  constructor(
    handle?: string,
    password?: string,
    http: typeof fetch = fetch,
    options: { cardFetch?: typeof fetch } = {},
  ) {
    this.handle = handle && blueskyAccount(handle);
    this.password = password;
    this.http = http;
    this.cardFetch = options.cardFetch ?? fetch;
  }

  private request(url: string, init?: RequestInit) {
    return this.http(url, {
      ...init,
      redirect: "error",
      signal: init?.signal ?? AbortSignal.timeout(requestTimeoutMs),
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

  private async write(
    host: string,
    method: string,
    step: WriteStep,
    data: unknown,
    token?: string,
  ) {
    const signal = AbortSignal.timeout(requestTimeoutMs);
    const secrets = [this.password ?? "", token ?? ""];
    let status: number | undefined;
    try {
      const response = await this.request(`${host}/xrpc/${method}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
        signal,
      });
      status = response.status;
      const body: unknown = await response.json();
      if (response.ok) return { body, status, secrets };

      const xrpc = z
        .object({
          error: z.string().optional(),
          message: z.string().optional(),
        })
        .safeParse(body).data;
      const name = safeDiagnostic(xrpc?.error, secrets);
      const message = safeDiagnostic(xrpc?.message, secrets);
      const details = ["WriteError", "timeout=false"];
      if (name) details.push(`XRPC error=${JSON.stringify(name)}`);
      if (message) details.push(`XRPC message=${JSON.stringify(message)}`);
      const ErrorClass =
        step === "createRecord" &&
        status === 400 &&
        xrpc?.error === "InvalidRequest"
          ? BlueskyPostRejected
          : WriteError;
      throw new ErrorClass(
        `Bluesky ${step} returned HTTP ${status} (${details.join(", ")})`,
      );
    } catch (error) {
      if (error instanceof WriteError) throw error;
      const outcome =
        status === undefined ? "failed" : `returned HTTP ${status}`;
      throw new WriteError(
        `Bluesky ${step} ${outcome} (${writeErrorDetails(error, signal)})`,
      );
    }
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
      rkey: blueskyRecordKey(requestKey),
      text,
    };
  }

  async session(intent: BlueskyIntent): Promise<string> {
    if (this.handle !== intent.account || !this.password)
      throw new WriteError(
        "Bluesky session failed (Set BLUESKY_HANDLE and BLUESKY_APP_PASSWORD for the approved handle, timeout=false)",
      );
    const { body, status } = await this.write(
      intent.pds,
      "com.atproto.server.createSession",
      "session",
      { identifier: this.handle, password: this.password },
    );
    const session = z
      .object({ did: blueskyDid, handle: blueskyHandle, accessJwt: id })
      .safeParse(body);
    if (!session.success)
      throw new WriteError(
        `Bluesky session returned HTTP ${status} (WriteError, invalid session response, timeout=false)`,
      );
    if (
      session.data.did !== intent.did ||
      session.data.handle !== intent.account
    )
      throw new WriteError(
        `Bluesky session returned HTTP ${status} (WriteError, session belongs to a different account, timeout=false)`,
      );
    return session.data.accessJwt;
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

  private async uploadCardThumb(intent: BlueskyIntent, token: string, bytes: Uint8Array, mime: string) {
    const response = await this.request(`${intent.pds}/xrpc/com.atproto.repo.uploadBlob`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": mime },
      body: Buffer.from(bytes),
      signal: AbortSignal.timeout(cardTimeoutMs),
    });
    if (!response.ok) throw new Error("thumbnail upload failed");
    return z.object({ blob: z.unknown() }).parse(await response.json()).blob;
  }

  async create(intent: BlueskyIntent, token: string) {
    const links = facets(intent.text);
    let embed: ExternalCard | undefined;
    const firstHttpsLink = links.find(({ features }) => safeCardUrl(features[0].uri));
    if (firstHttpsLink) {
      try {
        embed = await externalCard(
          this.cardFetch,
          firstHttpsLink.features[0].uri,
          (bytes, mime) => this.uploadCardThumb(intent, token, bytes, mime),
        );
      } catch {
        embed = undefined;
      }
    }
    const { body, status, secrets } = await this.write(
      intent.pds,
      "com.atproto.repo.createRecord",
      "createRecord",
      {
        repo: intent.did,
        collection,
        rkey: intent.rkey,
        record: {
          $type: collection,
          text: intent.text,
          createdAt: new Date().toISOString(),
          ...(links.length ? { facets: links } : {}),
          ...(embed ? { embed } : {}),
        },
      },
      token,
    );
    const receipt = recordRef.safeParse(body);
    if (!receipt.success)
      throw new WriteError(
        `Bluesky createRecord returned HTTP ${status} (WriteError, invalid receipt, timeout=false)`,
      );
    if (receipt.data.uri !== atUri(intent))
      throw new WriteError(
        `Bluesky createRecord returned HTTP ${status} (WriteError, receipt URI mismatch, expected key=${intent.rkey}, received key=${receivedRecordKey(receipt.data.uri, secrets)}, timeout=false)`,
      );
    return receipt.data;
  }
}

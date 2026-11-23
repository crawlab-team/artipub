import { z } from "zod";
import { blueskyHandle, sha256, type PostizIntent } from "./campaign.ts";

const id = z.string().min(1);
const integrations = z.array(
  z.object({
    id,
    identifier: id,
    profile: z.string().nullish(),
    disabled: z.boolean(),
  }),
);
const posts = z.object({
  posts: z.array(
    z.object({
      id,
      content: z.string(),
      state: z.enum(["QUEUE", "PUBLISHED", "ERROR", "DRAFT"]),
      integration: z.object({ id, providerIdentifier: id }),
      releaseId: z.string().nullish(),
      releaseURL: z.string().nullish(),
    }),
  ),
});
const receipt = z.tuple([z.object({ postId: id, integration: id })]);

type PostizPost = z.infer<typeof posts>["posts"][number];
type PublicPost = { id: string; url: string; source: string };

type SocialProvider = {
  handle(value: string): string | undefined;
  validText(text: string): boolean;
  resolve(http: typeof fetch, account: string): Promise<string>;
  find(
    http: typeof fetch,
    intent: PostizIntent,
    post?: PostizPost,
    attemptedAt?: string,
  ): Promise<PublicPost | undefined>;
};

class ReadError extends Error {}

const requestOptions = {
  redirect: "error" as const,
  signal: () => AbortSignal.timeout(15_000),
};

function request(http: typeof fetch, url: string, init?: RequestInit) {
  return http(url, {
    ...init,
    redirect: requestOptions.redirect,
    signal: requestOptions.signal(),
  });
}

async function read(response: Response, operation: string): Promise<unknown> {
  if (!response.ok)
    throw new ReadError(`${operation} returned HTTP ${response.status}`);
  return response.json();
}

const did = z.string().regex(/^did:[a-z0-9]+:[a-zA-Z0-9._:%-]+$/);
const blueskyPost = z.object({
  uri: id,
  author: z.object({ did }),
  record: z.unknown(),
});
const blueskyRecord = z.object({
  $type: z.literal("app.bsky.feed.post"),
  text: z.string(),
  createdAt: z.iso.datetime({ offset: true }),
  reply: z.unknown().optional(),
});
const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
const day = 86_400_000;
const lookupWindow = 30 * day;

async function appView(
  http: typeof fetch,
  method: string,
  params: Record<string, string>,
) {
  const url = `https://public.api.bsky.app/xrpc/${method}?${new URLSearchParams(params)}`;
  return read(await request(http, url), "Bluesky public lookup");
}

function blueskyKey(uri: string, actor: string) {
  const prefix = `at://${actor}/app.bsky.feed.post/`;
  const key = uri.slice(prefix.length);
  return uri.startsWith(prefix) &&
    /^[a-zA-Z0-9_~.:-]{1,512}$/.test(key) &&
    key !== "." &&
    key !== ".."
    ? key
    : undefined;
}

function blueskyReceiptUri(post: PostizPost | undefined, intent: PostizIntent) {
  if (post?.releaseId && blueskyKey(post.releaseId, intent.actor_id))
    return post.releaseId;
  const match = post?.releaseURL?.match(
    /^https:\/\/bsky\.app\/profile\/([^/]+)\/post\/([a-zA-Z0-9_~.:-]{1,512})$/,
  );
  if (match && [intent.actor_id, intent.account].includes(match[1]))
    return `at://${intent.actor_id}/app.bsky.feed.post/${match[2]}`;
}

const providers: ReadonlyMap<string, SocialProvider> = new Map([
  [
    "bluesky",
    {
      handle(value: string) {
        return blueskyHandle.safeParse(value.replace(/^@/, "").toLowerCase())
          .data;
      },
      validText(text: string) {
        // Postiz interprets HTML and post references. Keep the approved copy literal.
        return (
          !!text.trim() &&
          !/[<>\u0000]|\(post:[\w-]+\)/.test(text) &&
          Buffer.byteLength(text, "utf8") <= 3000 &&
          [...segmenter.segment(text)].length <= 300
        );
      },
      async resolve(http: typeof fetch, account: string) {
        const profile = z.object({ did, handle: id }).parse(
          await appView(http, "app.bsky.actor.getProfile", {
            actor: account,
          }),
        );
        if (profile.handle.toLowerCase() !== account)
          throw new ReadError("Bluesky resolved a different handle");
        return profile.did;
      },
      async find(
        http: typeof fetch,
        intent: PostizIntent,
        post?: PostizPost,
        attemptedAt?: string,
      ) {
        const uri = blueskyReceiptUri(post, intent);
        const view = uri
          ? z
              .object({ posts: z.array(blueskyPost) })
              .parse(
                await appView(http, "app.bsky.feed.getPosts", { uris: uri }),
              )
              .posts.filter((entry) => entry.uri === uri)
          : z
              .object({ feed: z.array(z.object({ post: blueskyPost })) })
              .parse(
                await appView(http, "app.bsky.feed.getAuthorFeed", {
                  actor: intent.actor_id,
                  filter: "posts_no_replies",
                  limit: "100",
                }),
              )
              .feed.map(({ post }) => post);
        const earliest = attemptedAt
          ? Date.parse(attemptedAt) - 2 * 60_000
          : Date.now() - lookupWindow;
        const matches = new Map<string, PublicPost>();
        for (const entry of view) {
          const key = blueskyKey(entry.uri, intent.actor_id);
          const parsed = blueskyRecord.safeParse(entry.record);
          if (
            key &&
            entry.author.did === intent.actor_id &&
            parsed.success &&
            parsed.data.reply === undefined &&
            parsed.data.text === intent.text &&
            (uri || Date.parse(parsed.data.createdAt) >= earliest)
          ) {
            matches.set(entry.uri, {
              id: entry.uri,
              url: `https://bsky.app/profile/${intent.actor_id}/post/${key}`,
              source: "bluesky_public_appview",
            });
          }
        }
        if (matches.size > 1)
          throw new ReadError(
            "Multiple public Bluesky posts match the approved text",
          );
        return matches.values().next().value;
      },
    },
  ],
]);

export function postizProvider(provider: string): SocialProvider | undefined {
  return providers.get(provider);
}

export type PostizLookup = {
  post?: PostizPost;
  publicPost?: PublicPost;
  reason?: string;
};
export type PostizDispatch =
  | { kind: "accepted"; id: string }
  | { kind: "rejected"; reason: string }
  | { kind: "unknown" };

export function postizReadReason(error: unknown): string {
  return error instanceof ReadError
    ? error.message
    : "Postiz or public provider lookup could not be verified";
}

export class Postiz {
  private readonly base: string | undefined;
  private readonly key: string | undefined;
  private readonly http: typeof fetch;

  constructor(url?: string, key?: string, http: typeof fetch = fetch) {
    if (url) {
      try {
        const parsed = new URL(url);
        if (
          ["http:", "https:"].includes(parsed.protocol) &&
          !parsed.username &&
          !parsed.password &&
          !parsed.search &&
          !parsed.hash
        ) {
          this.base =
            parsed.href.replace(/\/+$/, "").replace(/\/api\/public\/v1$/, "") +
            "/api/public/v1";
        }
      } catch {
        // Report only a fixed configuration message at use, without logging the URL.
      }
    }
    this.key = key;
    this.http = http;
  }

  private request(path: string, body?: object) {
    if (!this.base || !this.key)
      throw new ReadError(
        "Set POSTIZ_URL to the self-hosted instance and POSTIZ_API_KEY for its workspace",
      );
    return request(this.http, `${this.base}${path}`, {
      method: body ? "POST" : "GET",
      headers: {
        Accept: "application/json",
        Authorization: this.key,
        ...(body && { "Content-Type": "application/json" }),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async preflight(
    provider: string,
    account: string,
    text: string,
  ): Promise<PostizIntent> {
    const spec = postizProvider(provider);
    if (!spec) throw new ReadError("Unsupported Postiz provider");
    const list = integrations.parse(
      await read(
        await this.request("/integrations"),
        "Postiz integration lookup",
      ),
    );
    const matching = list.filter(
      (entry) =>
        entry.identifier === provider &&
        entry.profile &&
        spec.handle(entry.profile) === account,
    );
    if (matching.length !== 1 || matching[0].disabled)
      throw new ReadError(
        "Connect one enabled Postiz integration for the approved provider and handle",
      );
    return {
      provider,
      account,
      text,
      integration_id: matching[0].id,
      actor_id: await spec.resolve(this.http, account),
      instance: sha256(this.base),
    };
  }

  async lookup(
    intent: PostizIntent,
    postId?: string,
    attemptedAt?: string,
  ): Promise<PostizLookup> {
    if (intent.instance !== sha256(this.base ?? null))
      throw new ReadError(
        "Set POSTIZ_URL to the instance used for the original attempt",
      );
    const spec = postizProvider(intent.provider);
    if (!spec) throw new ReadError("Unsupported Postiz provider");
    const now = Date.now();
    const range = new URLSearchParams({
      startDate: new Date(
        attemptedAt ? Date.parse(attemptedAt) - day : now - lookupWindow,
      ).toISOString(),
      endDate: new Date(
        attemptedAt
          ? Date.parse(attemptedAt) + lookupWindow
          : now + lookupWindow,
      ).toISOString(),
    });
    const list = posts.parse(
      await read(await this.request(`/posts?${range}`), "Postiz post lookup"),
    );
    const matching = new Map<string, PostizPost>();
    for (const row of list.posts) {
      const same =
        row.integration.id === intent.integration_id &&
        row.integration.providerIdentifier === intent.provider &&
        row.content === intent.text;
      if (row.id === postId && !same)
        throw new ReadError(
          "The saved Postiz job differs from the approved post",
        );
      if (same) matching.set(row.id, row);
    }
    if (matching.size > 1 || (postId && matching.size && !matching.has(postId)))
      throw new ReadError(
        "Multiple or conflicting Postiz jobs match the approved text",
      );
    const post = matching.values().next().value;
    try {
      return {
        post,
        publicPost: await spec.find(this.http, intent, post, attemptedAt),
      };
    } catch (error) {
      return { post, reason: postizReadReason(error) };
    }
  }

  async create(intent: PostizIntent): Promise<PostizDispatch> {
    const response = await this.request("/posts", {
      type: "now",
      date: new Date().toISOString(),
      shortLink: false,
      tags: [],
      posts: [
        {
          integration: { id: intent.integration_id },
          value: [{ content: intent.text, image: [] }],
          settings: { __type: intent.provider },
        },
      ],
    });
    if (!response.ok) {
      if ([400, 401, 403, 404, 413, 429].includes(response.status))
        return {
          kind: "rejected",
          reason: `Postiz rejected creation (HTTP ${response.status})`,
        };
      return { kind: "unknown" };
    }
    const [created] = receipt.parse(await response.json());
    return created.integration === intent.integration_id
      ? { kind: "accepted", id: created.postId }
      : { kind: "unknown" };
  }
}

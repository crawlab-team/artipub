import { z } from "zod";
import type { ReleaseIntent } from "./campaign.ts";

const releaseResponse = z.object({
  id: z.number().int().positive(),
  tag_name: z.string(),
  name: z.string().nullable(),
  body: z.string().nullable(),
  draft: z.boolean(),
  prerelease: z.boolean(),
  published_at: z.iso.datetime().nullable(),
  author: z.object({ login: z.string() }),
  html_url: z.url(),
});

export type Lookup =
  | { kind: "found"; id: string; url: string }
  | { kind: "absent" }
  | { kind: "blocked"; reason: string };

export type Dispatch =
  { kind: "accepted" | "unknown" } | { kind: "rejected"; reason: string };

export class GitHubReleases {
  private readonly token: string | undefined;
  private readonly http: typeof fetch;

  constructor(token?: string, http: typeof fetch = fetch) {
    this.token = token;
    this.http = http;
  }

  private request(
    path: string,
    token?: string,
    body?: object,
  ): Promise<Response> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body) headers["Content-Type"] = "application/json";
    return this.http(`https://api.github.com${path}`, {
      method: body ? "POST" : "GET",
      headers,
      body: body ? JSON.stringify(body) : undefined,
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
    });
  }

  async lookup(intent: ReleaseIntent): Promise<Lookup> {
    // The unauthenticated by-tag route proves a published release is publicly visible.
    const response = await this.request(
      `/repos/${intent.repo}/releases/tags/${encodeURIComponent(intent.tag)}`,
    );
    if (response.status === 404) return { kind: "absent" };
    if (!response.ok)
      return {
        kind: "blocked",
        reason: `GitHub release lookup returned HTTP ${response.status}`,
      };
    const release = releaseResponse.parse(await response.json());
    const url = new URL(release.html_url);
    const path = decodeURIComponent(url.pathname);
    const prefix = `/${intent.repo}/releases/tag/`;
    if (
      release.tag_name !== intent.tag ||
      release.name !== intent.title ||
      release.body !== intent.body ||
      release.draft ||
      release.prerelease ||
      !release.published_at ||
      release.author.login.toLowerCase() !== intent.account ||
      url.origin !== "https://github.com" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      path.slice(0, prefix.length).toLowerCase() !== prefix ||
      path.slice(prefix.length) !== intent.tag
    ) {
      return {
        kind: "blocked",
        reason: "The release at this tag differs from the planned release",
      };
    }
    if (intent.commit && (await this.tagCommit(intent)) !== intent.commit) {
      return {
        kind: "blocked",
        reason: "The tag does not point to the expected commit",
      };
    }
    return { kind: "found", id: String(release.id), url: release.html_url };
  }

  private async tagCommit(intent: ReleaseIntent): Promise<string | undefined> {
    const ref = encodeURIComponent(`tags/${intent.tag}`);
    const response = await this.request(`/repos/${intent.repo}/commits/${ref}`);
    if (!response.ok) return undefined;
    return z
      .object({ sha: z.string().regex(/^[a-f0-9]{40}$/) })
      .parse(await response.json()).sha;
  }

  async preflight(intent: ReleaseIntent): Promise<string | undefined> {
    if (!this.token) return "Set GITHUB_TOKEN for the approved GitHub account";
    const actor = await this.request("/user", this.token);
    if (!actor.ok) return `GitHub account lookup returned HTTP ${actor.status}`;
    const { login } = z.object({ login: z.string() }).parse(await actor.json());
    if (login.toLowerCase() !== intent.account)
      return "GITHUB_TOKEN belongs to a different GitHub account";
    // Public resolution confirms both repository visibility and that GitHub can resolve the existing tag to a commit.
    const commit = await this.tagCommit(intent);
    if (!commit)
      return "The tag must already resolve to a commit in the public repository";
    if (intent.commit && commit !== intent.commit)
      return "The tag does not point to the expected commit";
    // Only the authenticated list includes drafts. A hidden draft for this tag requires operator review.
    for (let page = 1; ; page++) {
      const response = await this.request(
        `/repos/${intent.repo}/releases?per_page=100&page=${page}`,
        this.token,
      );
      if (!response.ok)
        return `GitHub release list returned HTTP ${response.status}`;
      const releases = z
        .array(z.object({ tag_name: z.string(), draft: z.boolean() }))
        .parse(await response.json());
      if (
        releases.some(
          (release) => release.draft && release.tag_name === intent.tag,
        )
      ) {
        return "A draft release already exists for this tag. Review it in GitHub.";
      }
      if (!response.headers.get("link")?.includes('rel="next"')) break;
    }
  }

  async create(intent: ReleaseIntent): Promise<Dispatch> {
    if (!this.token) throw new Error("GITHUB_TOKEN is required");
    const response = await this.request(
      `/repos/${intent.repo}/releases`,
      this.token,
      {
        tag_name: intent.tag,
        name: intent.title,
        body: intent.body,
        draft: false,
        prerelease: false,
      },
    );
    if (response.status === 201) return { kind: "accepted" };
    if ([400, 401, 403, 404, 429].includes(response.status)) {
      return {
        kind: "rejected",
        reason: `GitHub rejected release creation (HTTP ${response.status})`,
      };
    }
    // A 422 may mean another release for the tag exists. Resolve it through the same lookup as transport failures.
    return { kind: "unknown" };
  }
}

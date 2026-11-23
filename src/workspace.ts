import { randomUUID } from "node:crypto";
import {
  lstat,
  mkdir,
  open,
  readFile,
  realpath,
  rename,
  rm,
  rmdir,
} from "node:fs/promises";
import { join } from "node:path";
import {
  appendExecution,
  parseCampaign,
  type ExecutionEntry,
} from "./campaign.ts";

export function campaignName(name: string): string {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*\.md$/.test(name)) {
    throw new Error(
      "Use a Markdown filename in the workspace, such as campaign.md",
    );
  }
  return name;
}

async function exists(path: string): Promise<boolean> {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

export async function readCampaign(root: string, name: string) {
  const path = join(root, campaignName(name));
  if (!(await lstat(path)).isFile())
    throw new Error("The campaign must be a regular file");
  return parseCampaign(await readFile(path, "utf8"));
}

export async function withCampaign<T>(
  workspace: string,
  name: string,
  operate: (store: CampaignStore) => Promise<T>,
): Promise<T> {
  const root = await realpath(workspace);
  const lock = join(root, ".kirzner.lock");
  try {
    await mkdir(lock, { mode: 0o700 });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new Error("Workspace is locked. See crash recovery in the README.");
    }
    throw error;
  }
  try {
    return await operate(
      new CampaignStore(root, name, await readCampaign(root, name)),
    );
  } finally {
    await rmdir(lock);
  }
}

export class CampaignStore {
  private readonly root: string;
  private readonly name: string;
  campaign: Awaited<ReturnType<typeof readCampaign>>;

  constructor(
    root: string,
    name: string,
    campaign: Awaited<ReturnType<typeof readCampaign>>,
  ) {
    this.root = root;
    this.name = name;
    this.campaign = campaign;
  }

  async paused(): Promise<boolean> {
    return (
      (await exists(join(this.root, ".kirzner.pause"))) ||
      (await exists(join(this.root, `${this.name}.pause`)))
    );
  }

  async assertUnchanged(): Promise<void> {
    if (
      (await readCampaign(this.root, this.name)).text !== this.campaign.text
    ) {
      throw new Error(
        "Campaign changed during execution. Stop editing before running again.",
      );
    }
  }

  async append(entry: ExecutionEntry): Promise<void> {
    const next = parseCampaign(appendExecution(this.campaign, entry));
    const path = join(this.root, this.name);
    const temp = join(this.root, `.kirzner-${randomUUID()}.tmp`);
    const file = await open(temp, "wx", (await lstat(path)).mode & 0o777);
    try {
      try {
        await file.writeFile(next.text, "utf8");
        await file.sync();
      } finally {
        await file.close();
      }
      await this.assertUnchanged();
      await rename(temp, path);
      // Flush the replacement so an intent survives a power loss after dispatch.
      const directory = await open(this.root, "r");
      try {
        await directory.sync();
      } finally {
        await directory.close();
      }
      this.campaign = next;
    } finally {
      await rm(temp, { force: true });
    }
  }
}

#!/usr/bin/env node
import { createInterface } from "node:readline/promises";
import { approveCampaign, signingKey } from "./approval.ts";
import { review, run, status } from "./commands.ts";

const usage = `Usage: kirzner <plan|status|approve|run> <campaign.md>
       kirzner mcp [workspace]`;

function print(value: unknown) {
  console.log(JSON.stringify(value, null, 2));
}

async function main([command, argument, ...extra]: string[]) {
  if (extra.length) throw new Error(usage);
  if (!command || command === "--help" || command === "-h") {
    console.log(usage);
    return;
  }
  const root = process.cwd();
  if (command === "mcp") {
    const { serve } = await import("./mcp.ts");
    await serve(argument ?? root);
    return;
  }
  if (!argument) throw new Error(usage);
  switch (command) {
    case "plan":
      print(await review(root, argument));
      return;
    case "status":
      print(await status(root, argument));
      return;
    case "approve": {
      if (!process.stdin.isTTY || !process.stdout.isTTY)
        throw new Error("Approve from an interactive operator terminal");
      const batch = await review(root, argument);
      if (!batch.actions.length)
        throw new Error("No runnable GitHub Release actions to approve");
      const key = signingKey();
      print(batch);
      const prompt = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      try {
        const answer = await prompt.question("Approve this batch? [y/N] ");
        if (answer.trim().toLowerCase() !== "y")
          throw new Error("Approval cancelled");
        print(await approveCampaign(root, argument, batch.digest, key));
      } finally {
        prompt.close();
      }
      return;
    }
    case "run": {
      const results = await run(root, argument);
      print(results);
      if (results.some(({ status }) => status !== "public"))
        process.exitCode = 1;
      return;
    }
    default:
      throw new Error(usage);
  }
}

try {
  await main(process.argv.slice(2));
} catch (error) {
  console.error(error instanceof Error ? error.message : "Kirzner failed");
  process.exitCode = 1;
}

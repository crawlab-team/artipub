import { realpath } from "node:fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { review, run, status } from "./commands.ts";

export async function serve(workspace: string) {
  const root = await realpath(workspace);
  const server = new McpServer({ name: "kirzner", version: "0.1.0" });
  const inputSchema = {
    campaign: z
      .string()
      .describe("Markdown filename in the configured workspace"),
  };
  const readOnly = { readOnlyHint: true };
  const text = (value: unknown) => ({
    content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
  });
  server.registerTool(
    "plan",
    {
      description: "Preview the exact campaign batch for operator review",
      inputSchema,
      annotations: readOnly,
    },
    async ({ campaign }) => text(await review(root, campaign)),
  );
  server.registerTool(
    "status",
    {
      description: "Read campaign approvals and execution records",
      inputSchema,
      annotations: readOnly,
    },
    async ({ campaign }) => text(await status(root, campaign)),
  );
  server.registerTool(
    "run",
    {
      description:
        "Reconcile prior attempts and run the operator-approved publish batch",
      inputSchema,
    },
    async ({ campaign }) => text(await run(root, campaign)),
  );
  await server.connect(new StdioServerTransport());
}

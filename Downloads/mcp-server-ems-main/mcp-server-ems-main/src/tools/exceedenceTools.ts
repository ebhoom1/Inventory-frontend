// src/tools/exceedenceTools.ts
//
// Read-only exceedence tools. Each tool calls exactly ONE fixed EMS API path,
// using the per-request OAuth token for the calling ChatGPT user.

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { callEMSApi } from "../services/emsApiClient.js";
import {
  buildShortMessageForExceedence,
  normalizeError,
} from "../utils/formatToolResponse.js";
import { EMSAuthError, authChallengeResult } from "../utils/oauthChallenge.js";

// days: integer, 1..31, default 10. Enforced by zod before any API call.
const daysSchema = z
  .number()
  .int()
  .min(1)
  .max(31)
  .default(10)
  .describe("Number of days to include (1-31). Defaults to 10.");

/**
 * @param server    MCP server (created fresh per request in stateless mode).
 * @param userToken Raw EMS token for this request's user, or null if absent.
 */
export function registerExceedenceTools(
  server: McpServer,
  userToken: string | null
): void {
  // Tool 1: get_today_exceedence  (scope: ems.read.exceedence)
  server.registerTool(
    "get_today_exceedence",
    {
      title: "Today's Exceedence",
      description:
        "Check whether the logged-in EMS client has any parameter exceedence today.",
      inputSchema: {},
      annotations: { readOnlyHint: true, openWorldHint: true },
      _meta: { "openai/scopes": ["ems.read.exceedence"] },
    },
    async () => {
      if (!userToken) return authChallengeResult();
      try {
        const data = await callEMSApi("/api/ai/exceedence/today", userToken);
        return {
          content: [
            { type: "text", text: buildShortMessageForExceedence(data) },
          ],
          structuredContent: data,
        };
      } catch (error) {
        if (error instanceof EMSAuthError) return authChallengeResult();
        return {
          isError: true,
          content: [{ type: "text", text: normalizeError(error) }],
        };
      }
    }
  );

  // Tool 2: get_last_days_exceedence  (scope: ems.read.exceedence)
  server.registerTool(
    "get_last_days_exceedence",
    {
      title: "Last N Days Exceedence",
      description:
        "Get exceedence report for the logged-in EMS client for the last N days.",
      inputSchema: { days: daysSchema },
      annotations: { readOnlyHint: true, openWorldHint: true },
      _meta: { "openai/scopes": ["ems.read.exceedence"] },
    },
    async ({ days }) => {
      if (!userToken) return authChallengeResult();
      try {
        const d = days ?? 10;
        const data = await callEMSApi(
          `/api/ai/exceedence/last-days?days=${d}`,
          userToken
        );
        return {
          content: [
            {
              type: "text",
              text: `Exceedence report generated for last ${d} days.`,
            },
          ],
          structuredContent: data,
        };
      } catch (error) {
        if (error instanceof EMSAuthError) return authChallengeResult();
        return {
          isError: true,
          content: [{ type: "text", text: normalizeError(error) }],
        };
      }
    }
  );
}

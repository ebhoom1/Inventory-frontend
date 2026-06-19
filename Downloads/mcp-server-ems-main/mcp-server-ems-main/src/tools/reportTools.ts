// src/tools/reportTools.ts
//
// Read-only report tools: daily-average report and data-gap report.
// Both use the per-request OAuth token.

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { callEMSApi } from "../services/emsApiClient.js";
import {
  buildShortMessageForGap,
  normalizeError,
} from "../utils/formatToolResponse.js";
import { EMSAuthError, authChallengeResult } from "../utils/oauthChallenge.js";

const daysSchema = z
  .number()
  .int()
  .min(1)
  .max(31)
  .default(10)
  .describe("Number of days to include (1-31). Defaults to 10.");

export function registerReportTools(
  server: McpServer,
  userToken: string | null
): void {
  // Tool 4: get_daily_average_report  (scope: ems.read.reports)
  server.registerTool(
    "get_daily_average_report",
    {
      title: "Daily Average Report",
      description:
        "Get daily average EMS report for the logged-in client for the last N days.",
      inputSchema: { days: daysSchema },
      annotations: { readOnlyHint: true, openWorldHint: true },
      _meta: { "openai/scopes": ["ems.read.reports"] },
    },
    async ({ days }) => {
      if (!userToken) return authChallengeResult();
      try {
        const d = days ?? 10;
        const data = await callEMSApi(
          `/api/ai/reports/daily-average?days=${d}`,
          userToken
        );
        return {
          content: [
            {
              type: "text",
              text: `Daily average report generated for last ${d} days.`,
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

  // Tool 5: get_gap_report  (scope: ems.read.gap)
  server.registerTool(
    "get_gap_report",
    {
      title: "Data Gap Report",
      description:
        "Get missing data / gap report for the logged-in EMS client for the last N days.",
      inputSchema: { days: daysSchema },
      annotations: { readOnlyHint: true, openWorldHint: true },
      _meta: { "openai/scopes": ["ems.read.gap"] },
    },
    async ({ days }) => {
      if (!userToken) return authChallengeResult();
      try {
        const d = days ?? 10;
        const data = await callEMSApi(
          `/api/ai/reports/gap?days=${d}`,
          userToken
        );
        return {
          content: [{ type: "text", text: buildShortMessageForGap(data) }],
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

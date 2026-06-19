// // src/tools/liveStatusTools.ts
// //
// // Read-only live status tool. Uses the per-request OAuth token.

// import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// import { callEMSApi } from "../services/emsApiClient.js";
// import { normalizeError } from "../utils/formatToolResponse.js";
// import { EMSAuthError, authChallengeResult } from "../utils/oauthChallenge.js";

// export function registerLiveStatusTools(
//   server: McpServer,
//   userToken: string | null
// ): void {
//   // Tool 3: get_live_status  (scope: ems.read.live)
//   server.registerTool(
//     "get_live_status",
//     {
//       title: "Live EMS Status",
//       description:
//         "Get latest live EMS readings for the logged-in EMS client.",
//       inputSchema: {},
//       annotations: { readOnlyHint: true, openWorldHint: true },
//       _meta: { "openai/scopes": ["ems.read.live"] },
//     },
//     async () => {
//       if (!userToken) return authChallengeResult();
//       try {
//         const data = await callEMSApi("/api/ai/live-status", userToken);
//         return {
//           content: [
//             { type: "text", text: "Live EMS status fetched successfully." },
//           ],
//           structuredContent: data,
//         };
//       } catch (error) {
//         if (error instanceof EMSAuthError) return authChallengeResult();
//         return {
//           isError: true,
//           content: [{ type: "text", text: normalizeError(error) }],
//         };
//       }
//     }
//   );
// }


// src/tools/liveStatusTools.ts
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { callEMSApi } from "../services/emsApiClient.js";
import { normalizeError } from "../utils/formatToolResponse.js";
import { EMSAuthError, authChallengeResult } from "../utils/oauthChallenge.js";

export function registerLiveStatusTools(
  server: McpServer,
  userToken: string | null
): void {
  server.registerTool(
    "get_live_status",
    {
      title: "Live EMS Status",
      description: "Get latest live EMS readings (pH, BOD, COD, Flow, etc.) for the logged-in EMS client.",
      inputSchema: {},
      annotations: { readOnlyHint: true, openWorldHint: true },
      _meta: { "openai/scopes": ["ems.read.live"] },
    },
    async () => {
      if (!userToken) return authChallengeResult();
      try {
        const data = await callEMSApi("/api/ai/live-status", userToken);
        
        // FIX: Provide the full data string to the text field so the AI can read it
        return {
          content: [
            { 
              type: "text", 
              text: `Live status data retrieved successfully:\n${JSON.stringify(data, null, 2)}` 
            }
          ]
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
// src/index.ts
//
// EBHOOM EMS MCP server (read-only).
//
// Exposes EMS AI tools to ChatGPT / MCP clients over Streamable HTTP at /mcp,
// plus /health and OAuth protected-resource metadata. This server holds NO
// database/S3 connection — it only calls the secured /api/ai/* endpoints on the
// existing EMS backend.
//
// Auth model (Step 3, OAuth): ChatGPT sends `Authorization: Bearer <token>` on
// each /mcp request. We strip "Bearer ", and forward the RAW token to the EMS
// backend (whose authenticate middleware expects the raw JWT). Each request
// builds a fresh, stateless MCP server whose tools close over that token.

import express, { type Request, type Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { config } from "./config.js";
import { registerExceedenceTools } from "./tools/exceedenceTools.js";
import { registerLiveStatusTools } from "./tools/liveStatusTools.js";
import { registerReportTools } from "./tools/reportTools.js";
import { wwwAuthenticateValue } from "./utils/oauthChallenge.js";

const SERVER_NAME = "ebhoom-ems-mcp-server";
const SERVER_VERSION = "1.0.0";
const INSTRUCTIONS =
  "This MCP server provides read-only EBHOOM EMS data by calling the secured " +
  "EBHOOM EMS AI API layer. It can answer questions about exceedence, live " +
  "status, daily average reports, and gap reports. It must never modify EMS data.";

/** Extract the raw bearer token from an incoming request, or null if absent. */
function extractBearerToken(req: Request): string | null {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

/** Build a fresh MCP server instance with all tools bound to this user's token. */
function createMcpServer(userToken: string | null): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { instructions: INSTRUCTIONS }
  );

  registerExceedenceTools(server, userToken);
  registerLiveStatusTools(server, userToken);
  registerReportTools(server, userToken);

  return server;
}

const app = express();
app.use(express.json({ limit: "1mb" }));

// Health check.
app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "ebhoom-mcp-server" });
});

// OAuth 2.0 Protected Resource Metadata (RFC 9728). Tells ChatGPT which
// authorization server protects this resource.
app.get("/.well-known/oauth-protected-resource", (_req: Request, res: Response) => {
  res.json({
    resource: config.mcpResourceUrl,
    authorization_servers: [config.oauthIssuer],
    scopes_supported: [...config.scopesSupported],
    resource_documentation: `${config.mcpResourceUrl}/health`,
  });
});

// MCP endpoint (Streamable HTTP, stateless: a fresh server+transport per request).
app.post("/mcp", async (req: Request, res: Response) => {
  const userToken = extractBearerToken(req);

  // Surface the OAuth challenge at the HTTP layer too (401 + WWW-Authenticate),
  // so clients that check transport-level auth know where to authenticate. Tool
  // calls themselves also return a structured challenge (see tools/*).
  if (!userToken) {
    res.setHeader("WWW-Authenticate", wwwAuthenticateValue());
  }

  const server = createMcpServer(userToken);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
  });

  res.on("close", () => {
    void transport.close();
    void server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("Error handling /mcp request:", err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

// In stateless mode there is no server-initiated stream / session to manage.
const methodNotAllowed = (_req: Request, res: Response) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method not allowed." },
    id: null,
  });
};
app.get("/mcp", methodNotAllowed);
app.delete("/mcp", methodNotAllowed);

app.listen(config.port, () => {
  // Never log user tokens.
  console.log(`${SERVER_NAME} v${SERVER_VERSION} listening on port ${config.port}`);
  console.log(`  MCP endpoint: POST http://localhost:${config.port}/mcp`);
  console.log(`  Health:       GET  http://localhost:${config.port}/health`);
  console.log(
    `  Resource meta: GET http://localhost:${config.port}/.well-known/oauth-protected-resource`
  );
  console.log(`  EMS base URL: ${config.emsApiBaseUrl}`);
  console.log(`  OAuth issuer: ${config.oauthIssuer}`);
});

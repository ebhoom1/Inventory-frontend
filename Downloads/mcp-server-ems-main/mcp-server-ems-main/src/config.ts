// src/config.ts
//
// Loads and validates environment configuration for the MCP server.
//
// Production auth model (Step 3): each ChatGPT user authenticates via OAuth and
// ChatGPT sends `Authorization: Bearer <token>` on every MCP request. This
// server extracts that per-request token and forwards it (raw, no "Bearer "
// prefix) to the EMS backend. There is NO static EMS token anymore.

import dotenv from "dotenv";

dotenv.config();

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Copy .env.example to .env and fill it in.`
    );
  }
  return value.trim();
}

function optional(value: string | undefined, fallback: string): string {
  return value && value.trim() !== "" ? value.trim() : fallback;
}

const port = parseInt(process.env.PORT || "8787", 10);

// Public URL of THIS MCP server (the OAuth "resource"). Used in the protected
// resource metadata and the WWW-Authenticate challenge.
const mcpResourceUrl = optional(
  process.env.MCP_RESOURCE_URL,
  "https://mcp.ebhoom.com"
).replace(/\/+$/, "");

// The EMS backend, which is also the OAuth authorization server.
const oauthIssuer = optional(
  process.env.OAUTH_ISSUER,
  "https://api.ocems.ebhoom.com"
).replace(/\/+$/, "");

export const config = {
  // Strip any trailing slashes so path concatenation is predictable.
  emsApiBaseUrl: required("EMS_API_BASE_URL", process.env.EMS_API_BASE_URL).replace(
    /\/+$/,
    ""
  ),

  mcpResourceUrl,
  oauthIssuer,

  // Scopes advertised by the protected-resource metadata.
  scopesSupported: [
    "ems.read.exceedence",
    "ems.read.live",
    "ems.read.reports",
    "ems.read.gap",
  ] as const,

  port: Number.isFinite(port) && port > 0 ? port : 8787,
} as const;

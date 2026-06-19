// src/utils/oauthChallenge.ts
//
// Builds the MCP OAuth "challenge" tool result returned when a request has no
// usable token (missing on the way in, or rejected 401 by the EMS backend).
//
// ChatGPT reads `_meta["mcp/www_authenticate"]` to discover where to send the
// user to authenticate (the protected-resource metadata URL on THIS server).

import { config } from "../config.js";

/** Error thrown by the EMS API client when the backend returns HTTP 401. */
export class EMSAuthError extends Error {
  constructor(message = "EMS backend rejected the token (401).") {
    super(message);
    this.name = "EMSAuthError";
  }
}

/** Standard WWW-Authenticate value pointing at our protected-resource metadata. */
export function wwwAuthenticateValue(): string {
  const resourceMetadata = `${config.mcpResourceUrl}/.well-known/oauth-protected-resource`;
  return (
    `Bearer resource_metadata="${resourceMetadata}", ` +
    `error="invalid_token", ` +
    `error_description="Please connect EBHOOM EMS to continue"`
  );
}

/**
 * Tool result that tells ChatGPT authentication is required. The `_meta` key
 * carries the WWW-Authenticate challenge per the MCP auth spec.
 */
export function authChallengeResult() {
  return {
    isError: true,
    content: [
      {
        type: "text" as const,
        text: "Authentication required. Please connect EBHOOM EMS.",
      },
    ],
    _meta: {
      "mcp/www_authenticate": [wwwAuthenticateValue()],
    },
  };
}

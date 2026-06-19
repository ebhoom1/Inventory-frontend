// src/services/emsApiClient.ts
//
// Thin, read-only HTTP client for the EBHOOM EMS AI API layer.
//
// Security notes:
//   - GET only. No write methods are ever issued.
//   - The Authorization header is the RAW per-request user token (NO "Bearer "
//     prefix), because the EMS backend's authenticate middleware expects the
//     raw JWT. ChatGPT sends "Bearer <token>"; the /mcp handler strips "Bearer "
//     and passes the raw token in here.
//   - The token is never logged or returned in error messages.
//   - A 401 from the backend is surfaced as EMSAuthError so tools can return an
//     OAuth challenge (prompting the user to (re)connect EBHOOM EMS).

import { config } from "../config.js";
import { EMSAuthError } from "../utils/oauthChallenge.js";

const REQUEST_TIMEOUT_MS = 20_000;

/**
 * Call a fixed EMS AI API path with GET and return parsed JSON.
 *
 * @param path      Hard-coded path (optionally with a validated numeric query
 *                  string). Never forward arbitrary user-supplied URLs/paths.
 * @param userToken Raw EMS JWT for the calling ChatGPT user (no "Bearer ").
 */
export async function callEMSApi(path: string, userToken: string): Promise<any> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${config.emsApiBaseUrl}${normalizedPath}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Raw token — DO NOT prepend "Bearer ".
        Authorization: userToken,
      },
      signal: controller.signal,
    });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error(
        `EMS API request timed out after ${REQUEST_TIMEOUT_MS} ms (GET ${normalizedPath}).`
      );
    }
    // Deliberately do not echo headers/token.
    throw new Error(
      `EMS API request failed (GET ${normalizedPath}): ${
        err?.message || "network error"
      }`
    );
  } finally {
    clearTimeout(timeout);
  }

  // 401 -> token missing/expired/invalid at the backend. Signal a re-auth.
  if (response.status === 401) {
    throw new EMSAuthError();
  }

  const rawBody = await response.text();
  let parsed: any;
  try {
    parsed = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    parsed = rawBody;
  }

  if (!response.ok) {
    const bodyText =
      typeof parsed === "string" ? parsed : JSON.stringify(parsed);
    throw new Error(
      `EMS API error ${response.status} ${response.statusText} (GET ${normalizedPath}): ${bodyText}`
    );
  }

  return parsed;
}

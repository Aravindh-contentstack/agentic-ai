import fs from "node:fs";
import path from "node:path";

const INGEST =
  "http://127.0.0.1:7625/ingest/2dfe9c96-5920-4944-9cf4-03d611cc97ef";
const LOG_FILE =
  "/Users/aravindh.s/Agentic AI Test/.cursor/debug-b9d529.log";

/**
 * Debug-mode NDJSON log (HTTP ingest + workspace file).
 * @param {Record<string, unknown>} payload
 */
export function agentDebugLog(payload) {
  const body = {
    sessionId: "b9d529",
    runId: "post-fix",
    timestamp: Date.now(),
    ...payload,
  };
  fetch(INGEST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "b9d529",
    },
    body: JSON.stringify(body),
  }).catch(() => {});
  try {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    fs.appendFileSync(LOG_FILE, `${JSON.stringify(body)}\n`);
  } catch {
    // ignore
  }
}

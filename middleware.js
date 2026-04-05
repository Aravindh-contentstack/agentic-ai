import { NextResponse } from "next/server";

/** Edge middleware: HTTP ingest only (no Node fs). */
const INGEST =
  "http://127.0.0.1:7625/ingest/2dfe9c96-5920-4944-9cf4-03d611cc97ef";

export function middleware(request) {
  const path = request.nextUrl.pathname;
  // #region agent log
  fetch(INGEST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "b9d529",
    },
    body: JSON.stringify({
      sessionId: "b9d529",
      runId: "post-fix",
      hypothesisId: "H4",
      location: "middleware.js",
      message: "matched request",
      data: { path },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  return NextResponse.next();
}

export const config = {
  matcher: ["/about", "/contact", "/services", "/services/:path*"],
};

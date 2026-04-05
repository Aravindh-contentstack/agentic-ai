import Link from "next/link";
import { getEntries, homePageContentTypeUid } from "@/lib/contentstack";
import { agentDebugLog } from "@/lib/debug-agent-log";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function ServicesPage() {
  const pageTypeUid = homePageContentTypeUid();
  // #region agent log
  agentDebugLog({
    hypothesisId: "H3",
    location: "app/services/page.js:pre",
    message: "ServicesPage before getEntries",
    data: { pageTypeUid },
  });
  // #endregion

  let entries = [];
  try {
    entries = await getEntries(pageTypeUid);
  } catch (e) {
    const msg =
      e && typeof e === "object" && "message" in e
        ? String(e.message)
        : String(e);
    // #region agent log
    agentDebugLog({
      hypothesisId: "H3",
      location: "app/services/page.js:catch",
      message: "ServicesPage swallowed getEntries error",
      data: { errorMessage: msg, pageTypeUid },
    });
    // #endregion
  }

  // #region agent log
  agentDebugLog({
    hypothesisId: "H3",
    location: "app/services/page.js:post",
    message: "ServicesPage after getEntries",
    data: { count: entries.length, pageTypeUid },
  });
  // #endregion

  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Services
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Pages from Contentstack (
          <code className="text-sm">{pageTypeUid}</code>).
        </p>
      </header>
      {entries.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
          No entries loaded. If the Delivery API reports the content type was
          not found, create that type in Contentstack or set{" "}
          <code className="text-sm">CONTENTSTACK_HOME_CONTENT_TYPE_UID</code>{" "}
          in <code className="text-sm">.env.local</code> to your type UID, then
          publish entries to the configured environment.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => {
            const slug = entry.slug ?? entry.url;
            const title = entry.title ?? slug ?? entry.uid;
            if (!slug) {
              return (
                <li key={entry.uid} className="text-zinc-500">
                  {title} (missing slug field)
                </li>
              );
            }
            return (
              <li key={entry.uid}>
                <Link
                  href={`/services/${encodeURIComponent(slug)}`}
                  className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
                >
                  {title}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <p>
        <Link
          href="/"
          className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
        >
          Back to home
        </Link>
      </p>
    </div>
  );
}

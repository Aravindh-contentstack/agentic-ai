import Image from "next/image";
import Link from "next/link";
import { searchBlogPosts } from "@/lib/contentstack";

export const dynamic = "force-dynamic";
export const revalidate = 60;

function getCoverUrl(entry) {
  const img = entry.cover_image;
  if (!img) return null;
  if (typeof img === "string") return img;
  if (typeof img === "object") {
    return img.url ?? img.file?.url ?? null;
  }
  return null;
}

function pickSearchQuery(searchParams) {
  const raw = searchParams?.q;
  if (raw == null) return "";
  const s = Array.isArray(raw) ? raw[0] : raw;
  return String(s).trim();
}

export default async function BlogSearchPage({ searchParams }) {
  const sp = await searchParams;
  const q = pickSearchQuery(sp);
  const hasQuery = q.length > 0;
  const entries = hasQuery ? await searchBlogPosts(q) : [];

  return (
    <div className="mx-auto flex min-h-full max-w-5xl flex-col gap-8 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Search
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Find <code className="text-sm">blog_post</code> entries by title or body.
        </p>
      </header>

      {!hasQuery ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
          Add a <code className="text-sm">q</code> parameter to search, for example{" "}
          <Link
            href="/blog/search?q=test"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
          >
            /blog/search?q=test
          </Link>
          .
        </p>
      ) : entries.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
          No results for &quot;{q}&quot;.
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {entries.map((entry) => {
            const slug = entry.slug ?? entry.url;
            const title = entry.title ?? slug ?? entry.uid;
            const coverUrl = getCoverUrl(entry);

            if (!slug) {
              return (
                <li
                  key={entry.uid}
                  className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-900">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={typeof title === "string" ? title : "Post cover"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2 p-4">
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">{title}</span>
                    <span className="text-sm text-amber-700 dark:text-amber-400">
                      This entry has no slug; add a slug in Contentstack to link to it.
                    </span>
                  </div>
                </li>
              );
            }

            return (
              <li key={entry.uid}>
                <Link
                  href={`/blog/${encodeURIComponent(slug)}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                >
                  <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-900">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={typeof title === "string" ? title : "Post cover"}
                        fill
                        className="object-cover transition group-hover:opacity-95"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                        No cover image
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <span className="font-semibold text-zinc-900 group-hover:underline dark:text-zinc-50">
                      {title}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <p>
        <Link
          href="/blog"
          className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
        >
          All posts
        </Link>
      </p>
    </div>
  );
}

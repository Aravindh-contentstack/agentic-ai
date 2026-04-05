import Image from "next/image";
import Link from "next/link";
import { fileFieldUrl, contentstackImageSrc } from "@/lib/contentstack-image";
import {
  BLOG_INDEX_PAGE_SIZE,
  getBlogPostsPage,
} from "@/lib/contentstack";

export const dynamic = "force-dynamic";
export const revalidate = 60;

function getAuthorText(entry) {
  const a = entry.author;
  if (a == null) return null;
  if (typeof a === "string") return a;
  if (typeof a === "object") {
    return a.title ?? a.name ?? null;
  }
  return null;
}

function getTags(entry) {
  const t = entry.tags;
  if (!t || !Array.isArray(t)) return [];
  return t
    .map((tag) => {
      if (typeof tag === "string") return tag;
      if (tag && typeof tag === "object") {
        return tag.title ?? tag.name ?? tag.tag ?? null;
      }
      return null;
    })
    .filter(Boolean);
}

function formatPublishedDate(value) {
  if (value == null || value === "") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(d);
}

function pickPage(searchParams) {
  const raw = searchParams?.page;
  if (raw == null) return 1;
  const s = Array.isArray(raw) ? raw[0] : raw;
  const n = parseInt(String(s), 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export default async function BlogPage({ searchParams }) {
  const sp = await searchParams;
  const page = pickPage(sp);
  const { entries, total } = await getBlogPostsPage(page);
  const totalPages = total === 0 ? 0 : Math.ceil(total / BLOG_INDEX_PAGE_SIZE);
  const showNext = totalPages > 0 && page < totalPages;
  const showPrev = page > 1;

  return (
    <div className="mx-auto flex min-h-full max-w-5xl flex-col gap-8 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Blog
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Posts from Contentstack (<code className="text-sm">blog_post</code>).
        </p>
      </header>
      {total === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
          No posts yet. When you publish <code className="text-sm">blog_post</code> entries to the
          environment in <code className="text-sm">.env.local</code>, they will show up here.
        </p>
      ) : entries.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
          No posts on this page. Try a lower page number or go back to the first page.
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {entries.map((entry) => {
            const slug = entry.slug ?? entry.url;
            const title = entry.title ?? slug ?? entry.uid;
            const coverUrl = fileFieldUrl(entry.cover_image);
            const dateLabel = formatPublishedDate(entry.published_date);
            const authorLabel = getAuthorText(entry);
            const tags = getTags(entry);

            if (!slug) {
              return (
                <li
                  key={entry.uid}
                  className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-900">
                    {coverUrl ? (
                      <Image
                        src={contentstackImageSrc(coverUrl, { width: 800 })}
                        alt={typeof title === "string" ? title : "Post cover"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2 p-4">
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">{title}</span>
                    <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                      slug: <span className="text-zinc-400">—</span>
                    </p>
                    <span className="text-sm text-amber-700 dark:text-amber-400">
                      This entry has no slug; add a slug in Contentstack to link to it.
                    </span>
                    {dateLabel ? (
                      <time className="text-sm text-zinc-500">{dateLabel}</time>
                    ) : null}
                    {authorLabel ? (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{authorLabel}</p>
                    ) : null}
                    {tags.length > 0 ? (
                      <ul className="flex flex-wrap gap-1.5 pt-1">
                        {tags.map((tag) => (
                          <li
                            key={tag}
                            className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    ) : null}
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
                        src={contentstackImageSrc(coverUrl, { width: 800 })}
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
                    <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                      slug: {String(slug)}
                    </p>
                    {dateLabel ? (
                      <time className="text-sm text-zinc-500" dateTime={String(entry.published_date)}>
                        {dateLabel}
                      </time>
                    ) : null}
                    {authorLabel ? (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{authorLabel}</p>
                    ) : null}
                    {tags.length > 0 ? (
                      <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
                        {tags.map((tag) => (
                          <li
                            key={tag}
                            className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {totalPages > 1 ? (
        <nav
          className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800"
          aria-label="Blog pagination"
        >
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Page {page} of {totalPages}
            <span className="text-zinc-400 dark:text-zinc-500">
              {" "}
              ({total} {total === 1 ? "post" : "posts"})
            </span>
          </div>
          <div className="flex gap-3">
            {showPrev ? (
              <Link
                href={page === 2 ? "/blog" : `/blog?page=${page - 1}`}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Previous
              </Link>
            ) : (
              <span
                className="rounded-lg border border-transparent px-3 py-2 text-sm text-zinc-400 dark:text-zinc-600"
                aria-disabled="true"
              >
                Previous
              </span>
            )}
            {showNext ? (
              <Link
                href={`/blog?page=${page + 1}`}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Next
              </Link>
            ) : (
              <span
                className="rounded-lg border border-transparent px-3 py-2 text-sm text-zinc-400 dark:text-zinc-600"
                aria-disabled="true"
              >
                Next
              </span>
            )}
          </div>
        </nav>
      ) : null}
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

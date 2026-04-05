import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import RichTextRenderer from "@/components/RichTextRenderer";
import { fileFieldUrl, contentstackImageSrc } from "@/lib/contentstack-image";
import { getBlogPost, getEntries } from "@/lib/contentstack";

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  const entries = await getEntries("blog_post");
  return entries
    .map((e) => e.slug ?? e.url)
    .filter(Boolean)
    .map((slug) => ({ slug: String(slug) }));
}

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

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const entry = await getBlogPost(slug);

  if (!entry) {
    notFound();
  }

  const title = entry.title ?? slug;
  const coverUrl = fileFieldUrl(entry.cover_image);
  const authorLabel = getAuthorText(entry);
  const dateLabel = formatPublishedDate(entry.published_date);
  const tags = getTags(entry);

  return (
    <div className="flex min-h-full flex-col">
      {coverUrl ? (
        <div className="relative aspect-[21/9] w-full max-h-[min(60vh,720px)] min-h-[200px] bg-zinc-100 dark:bg-zinc-900">
          <Image
            src={contentstackImageSrc(coverUrl, { width: 1600 })}
            alt={typeof title === "string" ? title : "Post cover"}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      ) : null}

      <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>
          {(dateLabel || authorLabel) ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {dateLabel ? (
                <time dateTime={String(entry.published_date)}>{dateLabel}</time>
              ) : null}
              {dateLabel && authorLabel ? (
                <span className="text-zinc-400" aria-hidden>
                  {" · "}
                </span>
              ) : null}
              {authorLabel ? <span>{authorLabel}</span> : null}
            </p>
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
        </header>

        <RichTextRenderer
          json={entry.body}
          entry={entry}
          fallback={
            entry.description ? (
              <div className="prose prose-zinc max-w-none dark:prose-invert">
                <p>{entry.description}</p>
              </div>
            ) : null
          }
        />

        <p>
          <Link
            href="/blog"
            className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            All posts
          </Link>
        </p>
      </article>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import RichTextRenderer from "@/components/RichTextRenderer";
import { fileFieldUrl, contentstackImageSrc } from "@/lib/contentstack-image";
import { getEntries, homePageContentTypeUid } from "@/lib/contentstack";
import { agentDebugLog } from "@/lib/debug-agent-log";

export const revalidate = 60;

function isInternalPath(href) {
  const h = String(href).trim();
  return h.startsWith("/") && !h.startsWith("//");
}

function CtaButton({ text, href }) {
  const label = text?.trim();
  const target = href?.trim();
  if (!label || !target) return null;

  const baseClass =
    "inline-flex items-center justify-center rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200";

  if (isInternalPath(target)) {
    return (
      <Link href={target} className={baseClass}>
        {label}
      </Link>
    );
  }

  return (
    <a
      href={target}
      className={baseClass}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
    </a>
  );
}

export default async function Home() {
  const pageTypeUid = homePageContentTypeUid();
  let entries = [];
  try {
    entries = await getEntries(pageTypeUid);
  } catch (e) {
    // #region agent log
    const msg =
      e && typeof e === "object" && "message" in e
        ? String(e.message)
        : String(e);
    agentDebugLog({
      hypothesisId: "H3",
      location: "app/page.js:catch",
      message: "Home swallowed getEntries error",
      data: { errorMessage: msg, pageTypeUid },
    });
    // #endregion
    entries = [];
  }
  const entry = entries[0] ?? null;

  if (!entry) {
    return (
      <div className="mx-auto flex min-h-full max-w-3xl flex-col gap-8 px-6 py-16">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            No home page entry published
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Publish an entry for content type{" "}
            <code className="text-sm">{pageTypeUid}</code> in Contentstack for
            this environment, or set{" "}
            <code className="text-sm">CONTENTSTACK_HOME_CONTENT_TYPE_UID</code>{" "}
            in <code className="text-sm">.env.local</code> to match your stack.
          </p>
        </header>
        <nav className="flex flex-wrap gap-4 text-sm font-medium">
          <Link
            href="/services"
            className="text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
          >
            Services
          </Link>
          <Link
            href="/blog"
            className="text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
          >
            Blog
          </Link>
        </nav>
      </div>
    );
  }

  const title = entry.title ?? "Home";
  const heroUrl = fileFieldUrl(entry.hero_image);
  const heroSrc = heroUrl ? contentstackImageSrc(heroUrl, { width: 1920 }) : null;

  return (
    <div className="flex min-h-full flex-col">
      <section className="relative flex min-h-[55vh] w-full items-center justify-center overflow-hidden bg-zinc-800 bg-center px-6 py-20">
        {heroSrc ? (
          <Image
            src={heroSrc}
            alt={typeof title === "string" ? title : "Home"}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : null}
        <div
          className="absolute inset-0 bg-zinc-950/55"
          aria-hidden
        />
        <div className="relative z-10 max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-5xl">
            {title}
          </h1>
        </div>
      </section>

      <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
        <RichTextRenderer json={entry.body} entry={entry} />
        {entry.cta_text && entry.cta_link ? (
          <div>
            <CtaButton text={entry.cta_text} href={entry.cta_link} />
          </div>
        ) : null}
        <nav className="flex flex-wrap gap-4 border-t border-zinc-200 pt-8 text-sm font-medium dark:border-zinc-800">
          <Link
            href="/services"
            className="text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
          >
            Services
          </Link>
          <Link
            href="/blog"
            className="text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
          >
            Blog
          </Link>
        </nav>
      </article>
    </div>
  );
}

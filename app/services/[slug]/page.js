import Link from "next/link";
import { notFound } from "next/navigation";
import { getHomePage } from "@/lib/contentstack";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const entry = await getHomePage(slug);

  if (!entry) {
    notFound();
  }

  const title = entry.title ?? slug;

  return (
    <article className="mx-auto flex min-h-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        <p className="text-sm text-zinc-500">Slug: {slug}</p>
      </header>
      {entry.description ? (
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <p>{entry.description}</p>
        </div>
      ) : null}
      <p>
        <Link
          href="/services"
          className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
        >
          All services
        </Link>
      </p>
    </article>
  );
}

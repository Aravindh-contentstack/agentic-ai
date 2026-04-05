import Image from "next/image";
import Link from "next/link";
import { fileFieldUrl, contentstackImageSrc } from "@/lib/contentstack-image";
import { getEntries } from "@/lib/contentstack";

export const dynamic = "force-dynamic";
export const revalidate = 60;

function normalizeExternalUrl(value) {
  if (value == null || String(value).trim() === "") return null;
  const s = String(value).trim();
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

export default async function TeamPage() {
  const entries = await getEntries("team_member");

  return (
    <div className="mx-auto flex min-h-full max-w-5xl flex-col gap-8 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Team
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          People from Contentstack (<code className="text-sm">team_member</code>).
        </p>
      </header>
      {entries.length === 0 ? (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
          No team members yet. When you publish <code className="text-sm">team_member</code> entries to
          the environment in <code className="text-sm">.env.local</code>, they will show up here.
        </p>
      ) : (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => {
            const name = entry.name ?? entry.uid;
            const role = entry.role ?? null;
            const bio = entry.bio ?? null;
            const photoUrl = fileFieldUrl(entry.photo);
            const linkedinRaw = entry.linkedin_url;
            const linkedinHref =
              linkedinRaw != null && String(linkedinRaw).trim() !== ""
                ? normalizeExternalUrl(linkedinRaw)
                : null;

            return (
              <li
                key={entry.uid}
                className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="relative aspect-square w-full max-w-[400px] bg-zinc-100 dark:bg-zinc-900">
                  {photoUrl ? (
                    <Image
                      src={contentstackImageSrc(photoUrl, { width: 800 })}
                      alt={typeof name === "string" ? name : "Team member photo"}
                      width={400}
                      height={400}
                      className="h-full w-full object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                      No photo
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{name}</h2>
                  {role ? (
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{role}</p>
                  ) : null}
                  {bio ? (
                    <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
                      {bio}
                    </p>
                  ) : null}
                  {linkedinHref ? (
                    <p className="mt-auto pt-2">
                      <a
                        href={linkedinHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
                      >
                        LinkedIn
                      </a>
                    </p>
                  ) : null}
                </div>
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

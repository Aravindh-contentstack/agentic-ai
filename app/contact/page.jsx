import Link from "next/link";

export const revalidate = 60;

export default function ContactPage() {
  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Contact
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          This route is served by the app. Add a form, CMS block, or embed here
          when you wire up Contentstack.
        </p>
      </header>
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

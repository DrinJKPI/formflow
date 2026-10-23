// Temporary home page for Day 1. The full landing page (hero, features,
// how it works, live widget demo, footer) is built on Day 8.

import Link from "next/link";

const roadmap = [
  { day: 1, title: "Project setup", done: true },
  { day: 2, title: "Database and security", done: true },
  { day: 3, title: "Dashboard", done: false },
  { day: 4, title: "Form builder", done: false },
  { day: 5, title: "Chat experience", done: false },
  { day: 6, title: "Publishing and responses", done: false },
  { day: 7, title: "Website embed", done: false },
  { day: 8, title: "Landing page and polish", done: false },
  { day: 9, title: "Testing and deployment", done: false },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
        Work in progress
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
        FormFlow
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        Create interactive forms, embed them on any website as a chatbot
        widget, and manage every response from one dashboard.
      </p>

      <div className="mt-6 flex gap-3">
        <Link
          href="/signup"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Sign up
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          Log in
        </Link>
      </div>

      <h2 className="mt-12 text-sm font-semibold text-slate-900">Build plan</h2>
      <ol className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200">
        {roadmap.map((item) => (
          <li
            key={item.day}
            className="flex items-center justify-between px-4 py-3 text-sm"
          >
            <span>
              <span className="mr-3 font-mono text-slate-400">
                Day {item.day}
              </span>
              {item.title}
            </span>
            <span
              className={
                item.done
                  ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                  : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500"
              }
            >
              {item.done ? "Done" : "Planned"}
            </span>
          </li>
        ))}
      </ol>
    </main>
  );
}
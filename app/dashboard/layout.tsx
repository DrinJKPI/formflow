import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/app/actions/auth";
import { requireUser } from "@/lib/session";

// Shared frame for every page under /dashboard: a top bar and the page body.
export default function DashboardLayout({
    children,
}: LayoutProps<"/dashboard">) {
    return (
        <div className="flex flex-1 flex-col bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
                    <nav className="flex items-center gap-4 text-sm">
                        {/* The logo goes back to the landing page. */}
                        <Link href="/" className="text-base font-bold">
                            FormFlow
                        </Link>
                        <Link
                            href="/dashboard"
                            className="font-medium text-slate-600 hover:text-brand-600"
                        >
                            Dashboard
                        </Link>
                    </nav>
                    {/* UserMenu reads the session cookie, so it streams in behind a
              placeholder while the rest of the page shows straight away. */}
                    <Suspense
                        fallback={
                            <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-100" />
                        }
                    >
                        <UserMenu />
                    </Suspense>
                </div>
            </header>
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
                {children}
            </main>
        </div>
    );
}

// Shows who is logged in, with a logout button.
async function UserMenu() {
    const user = await requireUser(); // redirects to /login if not logged in

    return (
        <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-600 sm:inline">{user.email}</span>
            <form action={logout}>
                <button
                    type="submit"
                    className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium hover:bg-slate-50"
                >
                    Log out
                </button>
            </form>
        </div>
    );
}
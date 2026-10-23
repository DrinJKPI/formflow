import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
    return (
        <Suspense fallback={<p className="text-slate-500">Loading…</p>}>
            <Welcome />
        </Suspense>
    );
}

// Temporary content for Day 2. The real dashboard (stats and forms) is Day 3.
async function Welcome() {
    const user = await requireUser(); // redirects to /login if not logged in

    return (
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-1 text-slate-600">
                You&apos;re signed in as {user.email}. Your forms will appear here soon.
            </p>
        </div>
    );
}
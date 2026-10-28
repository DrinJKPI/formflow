"use client";
// Publish / unpublish a form. Once live: the public link, and the
// snippet for embedding the chat widget on another website

import { useState, useSyncExternalStore, useTransition } from "react";
import { setPublished } from "@/app/actions/forms";

type PublishPanelProps = {
    formId: string;
    slug: string;
    status: "DRAFT" | "PUBLISHED";
    color: string; // the saved widget colour used in the embed snippet
    hasUnsavedChanges: boolean;
};

// The site's address, e.g. "http://localhost:3000" or the deployed URL
// Empty during server rendering, filled in once the page runs in the browser
function useOrigin() {
    return useSyncExternalStore(
        () => () => { },
        () => window.location.origin,
        () => "",
    );
}

export function PublishPanel({
    formId,
    slug,
    status,
    color,
    hasUnsavedChanges,
}: PublishPanelProps) {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string>();
    const [copied, setCopied] = useState<"link" | "snippet" | null>(null);
    const origin = useOrigin();

    const published = status === "PUBLISHED";
    const publicUrl = `${origin}/f/${slug}`;
    const snippet = `<script src="${origin}/embed.js" data-form="${slug}" data-color="${color}" async></script>`;
    const testSiteUrl = `/embed-test.html?form=${slug}&color=${encodeURIComponent(color)}`;

    function toggle() {
        setError(undefined);
        startTransition(async () => {
            const result = await setPublished(formId, !published);
            if (result.error) setError(result.error);
        });
    }

    async function copy(what: "link" | "snippet") {
        await navigator.clipboard.writeText(what === "link" ? publicUrl : snippet);
        setCopied(what);
        setTimeout(() => setCopied(null), 2000);
    }

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h2 className="font-semibold">Publishing</h2>
                    {published ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            Published
                        </span>
                    ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            Draft
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={toggle}
                    disabled={pending || (!published && hasUnsavedChanges)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${published
                            ? "border border-slate-300 hover:bg-slate-50"
                            : "bg-emerald-600 text-white hover:bg-emerald-500"
                        }`}
                >
                    {pending ? "Please wait…" : published ? "Unpublish" : "Publish"}
                </button>
            </div>

            <p className="mt-2 text-sm text-slate-500">
                {published
                    ? "Anyone with the link can fill in this form."
                    : hasUnsavedChanges
                        ? "Save your changes before publishing."
                        : "Publish the form to get a public link."}
            </p>

            {error && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                    {error}
                </p>
            )}

            {published && (
                <div className="mt-3 flex flex-wrap gap-2">
                    <input
                        readOnly
                        value={publicUrl}
                        aria-label="Public link"
                        onFocus={(e) => e.target.select()}
                        className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs"
                    />
                    <button
                        type="button"
                        onClick={() => copy("link")}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                    >
                        {copied === "link" ? "Copied!" : "Copy link"}
                    </button>
                    <a
                        href={`/f/${slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                    >
                        Open
                    </a>
                </div>
            )}

            {published && (
                <div className="mt-5 border-t border-slate-200 pt-4">
                    <h3 className="text-sm font-semibold">Embed on your website</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        Paste this just before <code>&lt;/body&gt;</code> on any page to add
                        a floating chat button.
                    </p>
                    <textarea
                        readOnly
                        value={snippet}
                        rows={3}
                        aria-label="Embed snippet"
                        onFocus={(e) => e.target.select()}
                        className="mt-2 block w-full resize-none rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs"
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => copy("snippet")}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                        >
                            {copied === "snippet" ? "Copied!" : "Copy snippet"}
                        </button>
                        <a
                            href={testSiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                        >
                            Try it on a test website
                        </a>
                    </div>
                </div>
            )}
        </section>
    );
}
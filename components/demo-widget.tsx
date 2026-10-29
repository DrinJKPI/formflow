"use client";
// A floating chat button for the landing page, showing exactly what the
// embed widget looks like on a customer's website. Uses the sample form
// so nothing is saved

import { useEffect, useState } from "react";
import { ChatForm } from "@/components/chat-form";
import { demoForm } from "@/lib/demo-form";

export function DemoWidget() {
    const [open, setOpen] = useState(false);

    // Escape closes the panel.
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open]);

    return (
        <>
            {open && (
                <div
                    role="dialog"
                    aria-label="Chat widget demo"
                    // Phones: full screen. Larger screens: a panel above the button
                    className="fixed inset-0 z-50 sm:inset-auto sm:right-5 sm:bottom-24 sm:h-[560px] sm:max-h-[calc(100vh-7rem)] sm:w-[380px]"
                >
                    <div className="relative h-full overflow-hidden bg-white shadow-2xl sm:rounded-2xl">
                        <ChatForm form={demoForm} variant="fill" />
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Close chat"
                            className="absolute top-2 right-2 h-8 w-8 rounded-lg bg-white/20 text-xl leading-none text-white hover:bg-white/35"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-label={open ? "Close chat" : "Open chat"}
                aria-expanded={open}
                className={`fixed right-5 bottom-5 z-50 h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition hover:scale-105 ${open ? "hidden sm:flex" : "flex"
                    }`}
            >
                {open ? (
                    <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        aria-hidden="true"
                    >
                        <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                ) : (
                    <svg
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M4 5h16v11H9l-5 4z" />
                    </svg>
                )}
            </button>
        </>
    );
}
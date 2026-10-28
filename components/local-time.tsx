"use client";
// Shows a date and time in the viewer's own time zone. The server doesn't
// know the viewer's time zone, so it renders UTC first and the browser
// switches to local time straight after loading

import { useSyncExternalStore } from "react";

const subscribe = () => () => { };

export function LocalTime({ iso }: { iso: string }) {
    const inBrowser = useSyncExternalStore(
        subscribe,
        () => true, // in the browser
        () => false, // during server rendering
    );
    const date = new Date(iso);

    return (
        <time dateTime={iso}>
            {date.toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: inBrowser ? undefined : "UTC",
            })}
            {!inBrowser && " UTC"}
        </time>
    );
}
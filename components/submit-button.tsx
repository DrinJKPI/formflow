"use client";
// A submit button that disables itself and shows a different label while
// its form's Server Action is running.

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
    children: React.ReactNode;
    pendingText: string;
    className?: string;
};

export function SubmitButton({
    children,
    pendingText,
    className,
}: SubmitButtonProps) {
    const { pending } = useFormStatus(); // status of the surrounding <form>

    return (
        <button
            type="submit"
            disabled={pending}
            className={`disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
        >
            {pending ? pendingText : children}
        </button>
    );
}
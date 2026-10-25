"use client";
// Shared form for the login and sign-up pages. It's a Client Component
// because it shows live state (errors, a loading button) after submitting.

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "@/app/actions/auth";

type AuthFormProps = { mode: "login" | "signup" };

export function AuthForm({ mode }: AuthFormProps) {
    const isLogin = mode === "login";
    // useActionState calls the server action and keeps whatever it returns
    // (our error messages) in `state`. `pending` is true while it runs.
    const [state, formAction, pending] = useActionState(
        isLogin ? login : signup,
        undefined,
    );

    return (
        <main className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-12">
            <div className="w-full max-w-sm">
                <Link href="/" className="block text-center text-xl font-bold">
                    FormFlow
                </Link>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h1 className="text-lg font-semibold">
                        {isLogin ? "Log in to your account" : "Create your account"}
                    </h1>

                    <form action={formAction} className="mt-6 space-y-4">
                        <Field
                            label="Email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            defaultValue={state?.email}
                            errors={state?.errors?.email}
                        />
                        <Field
                            label="Password"
                            name="password"
                            type="password"
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            minLength={isLogin ? undefined : 8}
                            hint={isLogin ? undefined : "At least 8 characters."}
                            errors={state?.errors?.password}
                        />

                        {state?.message && (
                            <p
                                role="alert"
                                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                            >
                                {state.message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={pending}
                            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {pending ? "Please wait…" : isLogin ? "Log in" : "Create account"}
                        </button>
                    </form>
                </div>

                <p className="mt-4 text-center text-sm text-slate-600">
                    {isLogin ? "No account yet? " : "Already have an account? "}
                    <Link
                        href={isLogin ? "/signup" : "/login"}
                        className="font-medium text-brand-600 hover:underline"
                    >
                        {isLogin ? "Sign up" : "Log in"}
                    </Link>
                </p>
            </div>
        </main>
    );
}

type FieldProps = {
    label: string;
    name: string;
    type: string;
    autoComplete: string;
    defaultValue?: string;
    minLength?: number;
    hint?: string;
    errors?: string[];
};

// One labelled input with its hint and error messages.
function Field({ label, name, hint, errors, ...inputProps }: FieldProps) {
    const hasError = Boolean(errors?.length);
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium">
                {label}
            </label>
            <input
                id={name}
                name={name}
                required
                aria-invalid={hasError}
                aria-describedby={`${name}-help`}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 ${hasError ? "border-red-400" : "border-slate-300"
                    }`}
                {...inputProps}
            />
            <div id={`${name}-help`}>
                {hasError
                    ? errors!.map((error) => (
                        <p key={error} className="mt-1 text-sm text-red-600">
                            {error}
                        </p>
                    ))
                    : hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
            </div>
        </div>
    );
}
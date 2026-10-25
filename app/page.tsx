// Landing page: header, hero, features, how it works, demo, footer.
// Almost everything here is static, so Next.js prerenders it to plain HTML.
// Only the header buttons depend on whether you're logged in.

import Link from "next/link";
import { Suspense } from "react";
import { ChatForm } from "@/components/chat-form";
import { demoForm } from "@/lib/demo-form";
import { getCurrentUser } from "@/lib/session";

// Change these to your own details.
const CONTACT_EMAIL = "you@example.com";
const GITHUB_URL = "https://github.com/your-username/formflow";

const features = [
  {
    title: "Form builder",
    text: "Add text, email, multiple choice and yes/no questions. Reorder them, mark them required and preview before publishing.",
  },
  {
    title: "Chat-style forms",
    text: "Visitors answer one question at a time in a friendly chat, with answer buttons and instant validation.",
  },
  {
    title: "Embed anywhere",
    text: "Paste one script tag into any website to add a floating chatbot widget that works on desktop and mobile.",
  },
  {
    title: "Public links",
    text: "Every form gets its own shareable URL, so you can collect responses without a website at all.",
  },
  {
    title: "Responses dashboard",
    text: "See every submission with its timestamp, and track total forms and responses at a glance.",
  },
  {
    title: "Your brand",
    text: "Pick the widget colour and write your own welcome and thank-you messages.",
  },
];

const steps = [
  {
    title: "Build your form",
    text: "Create a form and add your questions in the dashboard.",
  },
  {
    title: "Publish and embed",
    text: "Publish it, then share the link or paste the embed snippet into your site.",
  },
  {
    title: "Collect responses",
    text: "Answers are saved instantly and appear in your dashboard.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Demo />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="border-b border-slate-200">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold">
          FormFlow
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium sm:gap-4">
          <a
            href="#features"
            className="hidden px-2 py-1 hover:text-brand-600 sm:block"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="hidden px-2 py-1 hover:text-brand-600 sm:block"
          >
            How it works
          </a>
          {/* Reads the session cookie, so it streams in separately. */}
          <Suspense fallback={<div className="h-9 w-36" />}>
            <HeaderActions />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}

// Logged in: a link to the dashboard. Logged out: Log in and Sign up.
async function HeaderActions() {
  const user = await getCurrentUser();

  if (user) {
    return (
      <Link
        href="/dashboard"
        className="rounded-lg bg-brand-600 px-3 py-2 text-white hover:bg-brand-500"
      >
        Go to dashboard
      </Link>
    );
  }

  return (
    <>
      <Link href="/login" className="px-3 py-2 hover:text-brand-600">
        Log in
      </Link>
      <Link
        href="/signup"
        className="rounded-lg bg-brand-600 px-3 py-2 text-white hover:bg-brand-500"
      >
        Sign up
      </Link>
    </>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2">
      <div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Turn your forms into conversations
        </h1>
        <p className="mt-6 text-lg text-slate-600">
          Build a form in minutes, embed it on any website as a chatbot widget,
          and manage every response from one simple dashboard.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-500"
          >
            Get started free
          </Link>
          <a
            href="#how-it-works"
            className="rounded-lg border border-slate-300 px-5 py-3 font-semibold hover:bg-slate-50"
          >
            See how it works
          </a>
        </div>
      </div>
      <ChatPreview />
    </section>
  );
}

// A static picture of the chat widget, built from HTML and Tailwind.
function ChatPreview() {
  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div className="bg-brand-600 px-4 py-3 text-sm font-semibold text-white">
        Customer feedback
      </div>
      <div className="space-y-3 bg-slate-50 p-4 text-sm">
        <Bubble from="bot">
          Hi there! Got a minute to answer a few quick questions?
        </Bubble>
        <Bubble from="bot">How did you hear about us?</Bubble>
        <div className="flex flex-wrap gap-2">
          {["Search engine", "A friend", "Social media"].map((option) => (
            <span
              key={option}
              className="rounded-full border border-brand-200 bg-white px-3 py-1 text-brand-700"
            >
              {option}
            </span>
          ))}
        </div>
        <Bubble from="user">A friend</Bubble>
        <Bubble from="bot">Great! What&apos;s your email?</Bubble>
      </div>
      <div className="flex gap-2 border-t border-slate-200 p-3">
        <div className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-400">
          Type your answer…
        </div>
        <div className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white">
          Send
        </div>
      </div>
    </div>
  );
}

function Bubble({
  from,
  children,
}: {
  from: "bot" | "user";
  children: React.ReactNode;
}) {
  return from === "bot" ? (
    <p className="mr-10 w-fit rounded-2xl rounded-tl-sm bg-white px-3 py-2 shadow-sm">
      {children}
    </p>
  ) : (
    <p className="ml-auto w-fit rounded-2xl rounded-tr-sm bg-brand-600 px-3 py-2 text-white">
      {children}
    </p>
  );
}

function Features() {
  return (
    <section id="features" className="scroll-mt-16 bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight">
          Everything you need to collect answers
        </h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          From building the form to reading the responses, FormFlow covers the
          whole journey.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <div className="h-1 w-10 rounded-full bg-brand-600" />
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 overflow-x-auto rounded-xl bg-slate-900 p-5 text-sm text-slate-100">
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
            Embed snippet
          </p>
          <code className="whitespace-pre font-mono">
            {
              '<script src="https://your-app.com/embed.js" data-form="abc123" async></script>'
            }
          </code>
        </div>
      </div>
    </section>
  );
}

// Live demo: the real chat component with a sample form. Nothing is saved.
function Demo() {
  return (
    <section id="demo" className="scroll-mt-16 bg-brand-600 py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div className="text-white">
          <h2 className="text-3xl font-bold tracking-tight">Try it yourself</h2>
          <p className="mt-3 text-brand-100">
            This is the real chat experience your visitors get. Try leaving an
            answer blank or typing an invalid email to see the validation. Demo
            answers aren&apos;t saved.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-brand-700 hover:bg-brand-50"
          >
            Create your own form
          </Link>
        </div>
        <div className="mx-auto w-full max-w-sm">
          <ChatForm form={demoForm} />
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-slate-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-bold text-slate-900">FormFlow</p>
          <p className="mt-1">Conversational forms and chatbot widgets.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <a href="#features" className="hover:text-brand-600">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-brand-600">
            How it works
          </a>
          <Link href="/login" className="hover:text-brand-600">
            Log in
          </Link>
          <Link href="/signup" className="hover:text-brand-600">
            Sign up
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-brand-600">
            Contact
          </a>
          <a
            href={GITHUB_URL}
            className="hover:text-brand-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
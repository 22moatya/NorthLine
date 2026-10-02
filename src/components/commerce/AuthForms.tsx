"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, LoaderCircle } from "lucide-react";

interface LoginFormProps {
  callbackUrl?: string;
}

function safeReturnPath(path?: string): string {
  return path?.startsWith("/") && !path.startsWith("//") ? path : "/account";
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const destination = safeReturnPath(callbackUrl);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        redirectTo: destination,
      });

      if (result?.error) {
        setErrorMessage("Email or password is incorrect, or sign-in is temporarily locked.");
        return;
      }

      router.replace(destination);
      router.refresh();
    } catch {
      setErrorMessage("We could not sign you in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-xs font-semibold text-[color:var(--ink)]">
        Email address
        <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="auth-input mt-1.5" />
      </label>
      <label className="block text-xs font-semibold text-[color:var(--ink)]">
        Password
        <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="auth-input mt-1.5" />
      </label>
      {errorMessage ? <p role="alert" className="text-xs leading-5 text-[color:var(--accent)]">{errorMessage}</p> : null}
      <button disabled={submitting} className="flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-[color:var(--ink)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--accent)] disabled:opacity-50">
        {submitting ? <LoaderCircle className="animate-spin" size={16} /> : null}
        Sign in
      </button>
      <p className="text-center text-xs text-[color:var(--muted)]">
        New to Northline? <Link href="/account/register" className="font-semibold text-[color:var(--accent)] underline underline-offset-4">Create an account</Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message ?? "We could not create your account.");
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
        redirectTo: "/account",
      });

      if (signInResult?.error) {
        router.replace("/account/login?registered=1");
        return;
      }

      router.replace("/account");
      router.refresh();
    } catch {
      setErrorMessage("We could not create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-xs font-semibold text-[color:var(--ink)]">
        Full name
        <input required minLength={2} maxLength={80} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="auth-input mt-1.5" />
      </label>
      <label className="block text-xs font-semibold text-[color:var(--ink)]">
        Email address
        <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="auth-input mt-1.5" />
      </label>
      <label className="block text-xs font-semibold text-[color:var(--ink)]">
        Password
        <input required type="password" minLength={12} maxLength={72} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="auth-input mt-1.5" />
        <span className="mt-1 block font-normal text-[color:var(--muted)]">Use at least 12 characters.</span>
      </label>
      {errorMessage ? <p role="alert" className="text-xs leading-5 text-[color:var(--accent)]">{errorMessage}</p> : null}
      <button disabled={submitting} className="flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-[color:var(--ink)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--accent)] disabled:opacity-50">
        {submitting ? <LoaderCircle className="animate-spin" size={16} /> : <ArrowRight size={16} />}
        Create account
      </button>
      <p className="text-center text-xs text-[color:var(--muted)]">
        Already have an account? <Link href="/account/login" className="font-semibold text-[color:var(--accent)] underline underline-offset-4">Sign in</Link>
      </p>
    </form>
  );
}
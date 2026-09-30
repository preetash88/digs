"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

function OAuthButton({ provider, label, icon }: { provider: string; label: string; icon: React.ReactNode }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="btn-oauth"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await signIn(provider, { callbackUrl: "/" });
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const callbackUrl = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");

    if (mode === "login") {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (res?.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError("Incorrect email or password");
        setBusy(false);
      }
      return;
    }

    // Signup: create account then sign in
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      router.push(callbackUrl);
      router.refresh();
    } else {
      setError((await res.json()).error ?? "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="auth-stack">
      {/* OAuth buttons */}
      <div className="oauth-buttons">
        <OAuthButton provider="google" label="Continue with Google" icon={<GoogleIcon />} />
        <OAuthButton provider="facebook" label="Continue with Facebook" icon={<FacebookIcon />} />
        <OAuthButton provider="twitter" label="Continue with X" icon={<XIcon />} />
      </div>

      <div className="auth-divider"><span>or</span></div>

      {/* Email / password */}
      <form className="card-form" onSubmit={submit}>
        {mode === "signup" && (
          <label>Your name<input name="name" autoComplete="name" required /></label>
        )}
        <label>Email<input name="email" type="email" autoComplete="email" required /></label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={mode === "signup" ? 8 : undefined}
            required
          />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn primary wide" disabled={busy}>
          {busy ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
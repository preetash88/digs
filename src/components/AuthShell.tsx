import type { ReactNode } from "react";

// Shared layout for the login and signup pages: photo on the left, form on the right.
export function AuthShell({
                              eyebrow, title, sub, children, footer,
                          }: { eyebrow: string; title: string; sub?: string; children: ReactNode; footer: ReactNode }) {
    return (
        <main className="authsplit">
            <aside className="auth-art" aria-hidden="true">
                {/* eslint-disable @next/next/no-img-element */}
                <img className="a" src="/hero/au.avif" alt="" decoding="async" />
                <img className="b" src="/hero/nz.avif" alt="" decoding="async" loading="lazy" />
                {/* eslint-enable @next/next/no-img-element */}
                <div className="auth-art-in">
                    <p className="eyebrow"><span className="rule" />Australia &amp; Aotearoa</p>
                    <p className="auth-quote">A quieter, more careful way to find the people you will live with.</p>
                </div>
            </aside>

            <section className="auth-panel">
                <div className="auth-card">
                    <p className="eyebrow dark"><span className="rule" />{eyebrow}</p>
                    <h1>{title}</h1>
                    {sub && <p className="auth-sub">{sub}</p>}
                    {children}
                    <p className="auth-foot">{footer}</p>
                </div>
            </section>
        </main>
    );
}
"use client";

import React, { useEffect, useRef, useState } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
} from "lucide-react";
import Logo from "./_components/Logo";

/* ============================================================
   GenView — futuristic · kinetic · human-designed
   ONLY landing page. Auth flow preserved via <SignInButton>.
   ============================================================ */

const ROTATING = ["humans.", "real panels.", "ex-FAANG.", "ex-Stripe.", "ex-McKinsey."];

const TRANSCRIPT = [
  { who: "AI",  text: "Tell me about a time you killed a feature your team wanted to ship." },
  { who: "You", text: "We were three weeks from a quarterly release. The team wanted an AI summarization toggle in every workspace…" },
  { who: "AI",  text: "Good context. Walk me to the moment you actually made the call to kill it." },
];

/* ---------- helpers ---------- */
// Wraps a child element so clicking it opens the Clerk sign-in modal and redirects to /dashboard on success.
// SignedIn users get a normal <a href="/dashboard"> link instead — preserves existing functionality.
function AuthCTA({ children, className = "", ...rest }) {
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal" forceRedirectUrl="/dashboard">
          <button type="button" className={className} {...rest}>
            {children}
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <a href="/dashboard" className={className} {...rest}>
          {children}
        </a>
      </SignedIn>
    </>
  );
}

/* ---------- sections ---------- */

function Nav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[rgb(var(--gv-bg))]/80 gv-hl-b" data-testid="site-nav">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-[13.5px] text-[rgb(var(--gv-ink-2))]">
          <a href="#hitl" className="gv-link hover:text-[rgb(var(--gv-ink))]">The HITL loop</a>
          <a href="#product" className="gv-link hover:text-[rgb(var(--gv-ink))]">Product</a>
          <a href="#how" className="gv-link hover:text-[rgb(var(--gv-ink))]">How it works</a>
          <a href="#reviewers" className="gv-link hover:text-[rgb(var(--gv-ink))]">Reviewers</a>
        </nav>
        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="hidden sm:inline-flex items-center text-[13.5px] text-[rgb(var(--gv-ink-2))] hover:text-[rgb(var(--gv-ink))] px-3 py-2" data-testid="nav-login">
                Log in
              </button>
            </SignInButton>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button data-testid="nav-cta" className="gv-btn inline-flex items-center gap-1.5 bg-[rgb(var(--gv-ink))] text-[rgb(var(--gv-bg))] text-[13px] font-medium px-4 py-2 rounded-full hover:bg-[rgb(var(--gv-ink-2))]">
                Start free <ArrowUpRight size={14} strokeWidth={2.2} className="arrow" />
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <a href="/dashboard" className="hidden sm:inline-flex items-center text-[13.5px] text-[rgb(var(--gv-ink-2))] hover:text-[rgb(var(--gv-ink))] px-3 py-2">
              Dashboard
            </a>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const wrap = useRef(null);
  const tilt = useRef(null);
  const [wIdx, setWIdx] = useState(0);
  const [tIdx, setTIdx] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
      if (tilt.current) {
        const tr = tilt.current.getBoundingClientRect();
        const cx = tr.left + tr.width / 2;
        const cy = tr.top + tr.height / 2;
        const rx = ((e.clientY - cy) / tr.height) * -6;
        const ry = ((e.clientX - cx) / tr.width) * 6;
        tilt.current.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
    };
    const onLeave = () => { if (tilt.current) tilt.current.style.transform = "perspective(1000px) rotateX(0) rotateY(0)"; };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setWIdx((i) => (i + 1) % ROTATING.length), 2400);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const cur = TRANSCRIPT[tIdx].text;
    if (typed.length < cur.length) {
      const t = setTimeout(() => setTyped(cur.slice(0, typed.length + 1)), 22);
      return () => clearTimeout(t);
    }
    const next = setTimeout(() => { setTyped(""); setTIdx((i) => (i + 1) % TRANSCRIPT.length); }, 1600);
    return () => clearTimeout(next);
  }, [typed, tIdx]);

  return (
    <section ref={wrap} className="relative overflow-hidden" data-testid="hero">
      <div className="absolute inset-0 gv-bg-grid opacity-60" aria-hidden />
      <div className="gv-orb gv-conic w-[900px] h-[900px] -top-60 -right-40 gv-drift" aria-hidden />
      <div className="gv-orb w-[420px] h-[420px] top-60 -left-32 opacity-50 gv-drift-2" style={{ background: "rgb(var(--gv-human-soft))" }} aria-hidden />
      <div className="gv-spot" aria-hidden />

      <div className="relative max-w-[1320px] mx-auto px-6 md:px-10 pt-12 md:pt-20 pb-20 md:pb-24 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-7">
          <div className="flex items-center gap-2 mb-10 gv-rise gv-rise-1">
            <span className="gv-chip">
              <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--gv-ai))] gv-pulse inline-block" />
              In private beta · 1.2k joined
            </span>
          </div>

          <h1 className="text-[clamp(2.6rem,6.6vw,5.4rem)] font-medium leading-[0.96] tracking-[-0.04em] gv-rise gv-rise-2">
            Don&apos;t just <span className="font-serif-i font-normal text-[rgb(var(--gv-ink-3))]">practice.</span><br />
            Get <span className="gv-strike text-[rgb(var(--gv-ink-3))]">judged</span> by{" "}
            <span className="gv-word font-serif-i font-normal text-[rgb(var(--gv-human))]" key={wIdx}>
              {ROTATING[wIdx]}
            </span>
          </h1>

          <p className="mt-7 max-w-[44ch] text-[16px] leading-[1.55] text-[rgb(var(--gv-ink-2))] gv-rise gv-rise-3">
            AI runs the mock. A real hiring-panel reviewer rewrites every wrong call before it lands in your inbox.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3 gv-rise gv-rise-4">
            <AuthCTA
              data-testid="hero-cta-primary"
              className="gv-btn inline-flex items-center gap-2 bg-[rgb(var(--gv-ink))] text-[rgb(var(--gv-bg))] font-medium px-6 py-4 text-[14px] rounded-full gv-elev-2 cursor-pointer"
            >
              Run a free mock interview
              <ArrowRight size={15} strokeWidth={2} className="arrow" />
            </AuthCTA>
            <a
              href="#hitl"
              data-testid="hero-cta-secondary"
              className="inline-flex items-center gap-2 text-[14px] text-[rgb(var(--gv-ink))] px-5 py-4 gv-hl rounded-full bg-[rgb(var(--gv-bg))]/60 backdrop-blur hover:bg-[rgb(var(--gv-bg-soft))] transition group"
            >
              <span className="w-5 h-5 rounded-full bg-[rgb(var(--gv-ink))] text-[rgb(var(--gv-bg))] grid place-items-center">
                <Play size={9} fill="currentColor" />
              </span>
              See the human review pass
            </a>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 relative min-h-[520px] gv-rise gv-rise-3">
          <div ref={tilt} className="gv-tilt absolute inset-0">
            <div className="relative bg-[rgb(var(--gv-bg))]/95 backdrop-blur-xl gv-hl rounded-3xl gv-elev-3 overflow-hidden">
              <div className="gv-scan" />
              <div className="flex items-center justify-between px-5 py-3 gv-hl-b bg-[rgb(var(--gv-bg-soft))]/40">
                <span className="font-monoG text-[10px] uppercase tracking-[0.18em] flex items-center gap-1.5 text-[rgb(var(--gv-ink-2))]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--gv-ai))] gv-pulse inline-block" />
                  Session live · Behavioral · Sr PM
                </span>
                <span className="font-monoG text-[10px] text-[rgb(var(--gv-ink-3))]">04:12</span>
              </div>

              <div className="p-5 min-h-[200px]">
                <p className="font-monoG text-[10px] uppercase tracking-[0.16em] text-[rgb(var(--gv-ai))] mb-1">{TRANSCRIPT[tIdx].who}</p>
                <p className="text-[15px] leading-[1.5] text-[rgb(var(--gv-ink))]">
                  {typed}
                  <span className="gv-caret inline-block w-[2px] h-[1em] align-[-2px] ml-0.5 bg-[rgb(var(--gv-ink))]" />
                </p>
              </div>

              <div className="p-5 gv-hl-t bg-[rgb(var(--gv-bg-soft))]/30 space-y-2.5">
                {[
                  { k: "Structure", v: 72, c: "ai" },
                  { k: "Specificity", v: 41, c: "human" },
                  { k: "Trade-off", v: 18, c: "human" },
                ].map((s) => (
                  <div key={s.k}>
                    <div className="flex items-baseline justify-between">
                      <span className="font-monoG text-[10.5px] uppercase tracking-[0.12em] text-[rgb(var(--gv-ink-2))]">{s.k}</span>
                      <span className="font-monoG text-[10.5px] text-[rgb(var(--gv-ink-3))]">{s.v}%</span>
                    </div>
                    <div className="h-[3px] bg-[rgb(var(--gv-line))] mt-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.c === "ai" ? "bg-gradient-to-r from-[rgb(var(--gv-ai))] to-[#22D3EE]" : "bg-gradient-to-r from-[rgb(var(--gv-human))] to-[#F97316]"}`}
                        style={{ width: `${s.v}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 bg-[rgb(var(--gv-bg))] gv-hl gv-elev-2 rounded-2xl p-3 flex items-center gap-3 max-w-[260px]" style={{ borderColor: "rgba(194,65,12,0.3)" }}>
              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C2410C] to-[#9A3412] grid place-items-center text-white text-[12px] font-medium">P</span>
              <div className="leading-tight">
                <p className="font-monoG text-[9.5px] uppercase tracking-[0.16em] text-[rgb(var(--gv-human))]">Reviewer assigned</p>
                <p className="text-[13px] font-medium">Verified Human Coach. · <span className="text-[rgb(var(--gv-ink-3))]">ex-Stripe</span></p>
              </div>
            </div>

            <div className="absolute -top-4 -right-3 bg-[rgb(var(--gv-ink))] text-[rgb(var(--gv-bg))] rounded-full px-3 py-1.5 font-monoG text-[10px] uppercase tracking-[0.14em] flex items-center gap-1.5 rotate-[3deg] gv-elev-2">
              <Sparkles size={10} /> verdict in 3h 41m
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

function HITL() {
  return (
    <section id="hitl" className="relative" data-testid="hitl-section">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-20 md:py-28">
        <div className="grid grid-cols-12 gap-6 mb-12">
          <div className="col-span-12 md:col-span-3">
            <p className="font-monoG text-[10.5px] uppercase tracking-[0.2em] text-[rgb(var(--gv-ink-3))]">§ 02 / The loop</p>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h2 className="text-3xl md:text-[44px] font-medium tracking-[-0.03em] leading-[1.05] max-w-[20ch]">
              The AI drafts. <span className="font-serif-i font-normal text-[rgb(var(--gv-human))]">A human signs off.</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-8 items-stretch">
          <article className="relative bg-[rgb(var(--gv-bg))] gv-hl rounded-3xl p-8 md:p-10 gv-elev-1 overflow-hidden" data-testid="hitl-card-ai">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgb(var(--gv-ai))] to-transparent" />
            <header className="flex items-center justify-between gv-hl-b pb-5 mb-6">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 grid place-items-center rounded-xl text-[rgb(var(--gv-ai))]" style={{ background: "rgb(var(--gv-ai-soft))" }}>
                  <Sparkles size={15} strokeWidth={2} />
                </span>
                <div>
                  <p className="font-monoG text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--gv-ink-3))]">Step 01 · AI draft</p>
                  <h3 className="text-[16px] font-medium tracking-tight text-[rgb(var(--gv-ink-2))]">unverified · 62%</h3>
                </div>
              </div>
            </header>

            <blockquote className="font-serif-i text-[19px] md:text-[21px] leading-[1.3] text-[rgb(var(--gv-ink-2))]">
              &quot;Solid answer. Use the STAR framework and quantify your result with metrics.&quot;
            </blockquote>

            <ul className="mt-6 space-y-2.5 text-[13px] text-[rgb(var(--gv-ink-2))]">
              {[
                "Generic STAR advice",
                "Missed: no trade-off articulated",
              ].map((label) => (
                <li key={label} className="flex items-center gap-2.5">
                  <AlertTriangle size={12} className="text-[rgb(var(--gv-ai))]" strokeWidth={2.2} />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </article>

          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <svg width="64" height="32" viewBox="0 0 64 32" fill="none" className="gv-flow">
                <path d="M2 16 L56 16" stroke="rgb(var(--gv-ink-3))" strokeWidth="1.2" strokeDasharray="4 4" />
                <path d="M50 8 L60 16 L50 24" stroke="rgb(var(--gv-ink))" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 font-monoG text-[9.5px] uppercase tracking-[0.18em] text-[rgb(var(--gv-ink-3))]">handoff</span>
            </div>
          </div>

          <article className="relative bg-[rgb(var(--gv-bg))] rounded-3xl p-8 md:p-10 gv-elev-2 overflow-hidden" style={{ border: "1px solid rgba(194,65,12,0.3)" }} data-testid="hitl-card-human">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgb(var(--gv-human))] to-transparent" />
            <header className="flex items-center justify-between gv-hl-b pb-5 mb-6">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 grid place-items-center rounded-xl text-[rgb(var(--gv-human))]" style={{ background: "rgb(var(--gv-human-soft))" }}>
                  <CheckCircle2 size={15} strokeWidth={2.2} />
                </span>
                <div>
                  <p className="font-monoG text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--gv-ink-3))]">Step 02 · Verified Human Coach. · ex-Stripe</p>
                  <h3 className="text-[16px] font-medium tracking-tight text-[rgb(var(--gv-human))]">verified · final</h3>
                </div>
              </div>
            </header>

            <blockquote className="font-serif-i text-[19px] md:text-[21px] leading-[1.3] text-[rgb(var(--gv-ink))]">
              &quot;Forget STAR. The story has no <span className="text-[rgb(var(--gv-human))]">cost</span>. Panels listen for what you <span className="underline decoration-[rgb(var(--gv-human))] decoration-2 underline-offset-[5px]">chose not to do</span>.&quot;
            </blockquote>

            <div className="mt-6 flex items-center justify-between font-monoG text-[10.5px] uppercase tracking-[0.16em]">
              <span className="text-[rgb(var(--gv-human))]">+ trade-off articulation</span>
              <span className="text-[rgb(var(--gv-ink-3))]">3h 41m</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative bg-[rgb(var(--gv-bg))] gv-hl-t">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Logo />
        <p className="font-monoG text-[10.5px] uppercase tracking-[0.18em] text-[rgb(var(--gv-ink-3))]">
          © {new Date().getFullYear()} · built by Joy Pasala
        </p>
      </div>
    </footer>
  );
}

/* ---------- Page ---------- */
export default function Home() {
  return (
    <div className="gv-root min-h-screen">
      <Nav />
      <Hero />
      <HITL />
      <Footer />
    </div>
  );
}

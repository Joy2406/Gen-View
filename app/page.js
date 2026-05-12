"use client";

import React, { useEffect, useRef, useState } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Mic,
  Video,
  Zap,
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

const TICKER = [
  "INTERVIEW PREP, VERIFIED",
  "AI DRAFTS — HUMANS DECIDE",
  "NO HALLUCINATED FEEDBACK",
  "MOCK SESSIONS · 24/7",
  "FAANG · CONSULTING · PRODUCT · DATA",
  "REVIEWERS FROM REAL HIRING PANELS",
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

function StatusBar() {
  return (
    <div className="gv-hl-b bg-[rgb(var(--gv-bg))]/80 backdrop-blur-xl">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10 h-9 flex items-center justify-between font-monoG text-[10.5px] tracking-[0.14em] uppercase text-[rgb(var(--gv-ink-3))]">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--gv-ai))] gv-pulse inline-block" />
          system online · reviewer queue · 4 active
        </span>
        <span className="hidden md:flex items-center gap-5">
          <span>v 2.0.1</span>
          <span>build · 2026.01</span>
          <span className="text-[rgb(var(--gv-ink))]">↗ status</span>
        </span>
      </div>
    </div>
  );
}

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

          <dl className="mt-14 grid grid-cols-3 max-w-2xl gv-rise gv-rise-5">
            {[
              { k: "12,408", v: "sessions · reviewed" },
              { k: "98.2%", v: "AI calls · refined" },
              { k: "<6h", v: "median · turnaround" },
            ].map((s, i) => (
              <div key={s.k} className={`${i > 0 ? "pl-6 gv-hl-l" : ""} ${i < 2 ? "pr-6" : ""}`}>
                <dt className="text-[40px] md:text-[44px] font-medium tracking-[-0.045em] text-[rgb(var(--gv-ink))] leading-none">{s.k}</dt>
                <dd className="font-monoG text-[10px] uppercase tracking-[0.16em] text-[rgb(var(--gv-ink-3))] mt-2 leading-tight">{s.v}</dd>
              </div>
            ))}
          </dl>
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
                <p className="text-[13px] font-medium">Priya M. · <span className="text-[rgb(var(--gv-ink-3))]">ex-Stripe</span></p>
              </div>
            </div>

            <div className="absolute -top-4 -right-3 bg-[rgb(var(--gv-ink))] text-[rgb(var(--gv-bg))] rounded-full px-3 py-1.5 font-monoG text-[10px] uppercase tracking-[0.14em] flex items-center gap-1.5 rotate-[3deg] gv-elev-2">
              <Sparkles size={10} /> verdict in 3h 41m
            </div>
          </div>
        </div>
      </div>

      <div className="relative gv-hl-t gv-hl-b overflow-hidden bg-[rgb(var(--gv-bg-soft))]/60">
        <div className="gv-marquee py-2.5 whitespace-nowrap font-monoG text-[10.5px] tracking-[0.18em] text-[rgb(var(--gv-ink-3))]">
          {[...Array(2)].map((_, j) => (
            <span key={j} className="inline-flex">
              {TICKER.map((t, i) => (
                <span key={`${j}-${i}`} className="inline-flex items-center">
                  <span className="px-7">{t}</span>
                  <span className="text-[rgb(var(--gv-ai))]">◆</span>
                </span>
              ))}
            </span>
          ))}
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
                  <p className="font-monoG text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--gv-ink-3))]">Step 02 · Priya M. · ex-Stripe</p>
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

function ProductPreview() {
  return (
    <section id="product" className="relative bg-[rgb(var(--gv-bg-soft))] gv-hl-t gv-hl-b" data-testid="product-section">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-20 md:py-28">
        <div className="grid grid-cols-12 gap-6 mb-12">
          <div className="col-span-12 md:col-span-3">
            <p className="font-monoG text-[10.5px] uppercase tracking-[0.2em] text-[rgb(var(--gv-ink-3))]">§ 03 / The booth</p>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h2 className="text-3xl md:text-[44px] font-medium tracking-[-0.03em] leading-[1.05] max-w-[22ch]">
              Live signals. <span className="font-serif-i font-normal text-[rgb(var(--gv-ink-3))]">Real reviewers in queue.</span>
            </h2>
          </div>
        </div>

        <div className="bg-[rgb(var(--gv-bg))] gv-hl rounded-3xl gv-elev-3 overflow-hidden">
          <div className="flex items-center justify-between gv-hl-b px-5 md:px-7 py-3 bg-[rgb(var(--gv-bg))]">
            <div className="flex items-center gap-2 font-monoG text-[10.5px] uppercase tracking-[0.16em] text-[rgb(var(--gv-ink-2))]">
              <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--gv-ai))] gv-pulse inline-block" />
              Session live · Behavioral · Senior PM
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--gv-line-2))]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--gv-line-2))]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--gv-ink))]" />
            </div>
          </div>

          <div className="grid grid-cols-12 min-h-[480px]">
            <div className="col-span-12 md:col-span-7 gv-hl-r p-7 md:p-10">
              <p className="font-monoG text-[10.5px] uppercase tracking-[0.18em] text-[rgb(var(--gv-ink-3))]">Q3 / 5 · 04:12</p>
              <h3 className="text-2xl md:text-[30px] font-medium tracking-[-0.025em] mt-2.5 leading-[1.1]">
                Tell me about a time you killed a feature your team wanted to ship.
              </h3>

              <div className="mt-8 space-y-5">
                <div className="flex gap-4">
                  <span className="font-monoG text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--gv-ai))] w-12 shrink-0 pt-1">AI</span>
                  <p className="text-[14px] leading-relaxed text-[rgb(var(--gv-ink-2))]">Take a breath. Walk me through the context first — what was the team trying to ship?</p>
                </div>
                <div className="flex gap-4">
                  <span className="font-monoG text-[10px] uppercase tracking-[0.18em] text-[rgb(var(--gv-ink-3))] w-12 shrink-0 pt-1">You</span>
                  <p className="text-[14px] leading-relaxed text-[rgb(var(--gv-ink))]">
                    We were three weeks from a quarterly release and the team wanted to add an AI summarization toggle to every workspace
                    <span className="gv-caret font-monoG text-[rgb(var(--gv-ink-3))]">▍</span>
                  </p>
                </div>
              </div>

              <div className="mt-10 flex items-center gap-2">
                <button className="gv-btn inline-flex items-center gap-2 bg-[rgb(var(--gv-ink))] text-[rgb(var(--gv-bg))] px-4 py-2.5 rounded-full font-monoG text-[10.5px] uppercase tracking-[0.16em]">
                  <Mic size={12} /> Recording
                </button>
                <button className="inline-flex items-center gap-2 gv-hl px-4 py-2.5 rounded-full font-monoG text-[10.5px] uppercase tracking-[0.16em] text-[rgb(var(--gv-ink-2))] hover:text-[rgb(var(--gv-ink))] hover:bg-[rgb(var(--gv-bg-soft))] transition">
                  <Video size={12} /> Camera
                </button>
                <button className="gv-btn ml-auto inline-flex items-center gap-2 bg-[rgb(var(--gv-human))] text-white px-4 py-2.5 rounded-full font-monoG text-[10.5px] uppercase tracking-[0.16em]">
                  End & request review
                </button>
              </div>
            </div>

            <div className="col-span-12 md:col-span-5 p-7 md:p-10 bg-[rgb(var(--gv-bg-soft))]/40">
              <p className="font-monoG text-[10.5px] uppercase tracking-[0.18em] text-[rgb(var(--gv-ai))] flex items-center gap-2"><Zap size={11} /> AI · live signals</p>
              <div className="mt-5 space-y-4">
                {[
                  { k: "Structure", v: 72, c: "ai" },
                  { k: "Specificity", v: 41, c: "human" },
                  { k: "Trade-off articulation", v: 18, c: "human" },
                  { k: "Outcome / metric", v: 0, c: "human" },
                ].map((s) => (
                  <div key={s.k}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[12.5px] text-[rgb(var(--gv-ink-2))]">{s.k}</span>
                      <span className="font-monoG text-[10.5px] text-[rgb(var(--gv-ink-3))]">{s.v}%</span>
                    </div>
                    <div className="h-[3px] bg-[rgb(var(--gv-line))] mt-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.c === "ai" ? "bg-gradient-to-r from-[rgb(var(--gv-ai))] to-[#22D3EE]" : "bg-gradient-to-r from-[rgb(var(--gv-human))] to-[#F97316]"}`}
                        style={{ width: `${s.v}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <hr className="my-7 border-[rgb(var(--gv-line))]" />

              <p className="font-monoG text-[10.5px] uppercase tracking-[0.18em] text-[rgb(var(--gv-human))]">Human review queue</p>
              <ul className="mt-4 space-y-3 text-[13px]">
                {[
                  { who: "Priya M.", role: "ex-Stripe", eta: "~3h", c: "from-[#06B6D4] to-[#0E7490]" },
                  { who: "Daniel O.", role: "ex-Meta", eta: "~5h", c: "from-[#C2410C] to-[#9A3412]" },
                  { who: "Sana R.", role: "ex-McKinsey", eta: "~6h", c: "from-[#0E0E10] to-[#3C4048]" },
                ].map((r) => (
                  <li key={r.who} className="flex items-center justify-between gv-hl-b pb-2.5">
                    <span className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-full bg-gradient-to-br ${r.c} text-white text-[10.5px] font-medium grid place-items-center`}>{r.who[0]}</span>
                      <span>
                        <span className="font-medium text-[rgb(var(--gv-ink))]">{r.who}</span>
                        <span className="text-[rgb(var(--gv-ink-3))]"> · {r.role}</span>
                      </span>
                    </span>
                    <span className="font-monoG text-[10.5px] text-[rgb(var(--gv-ink-3))]">{r.eta}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewerWall() {
  const reviewers = [
    { n: "Priya M.",  r: "ex-Stripe",   t: "Behavioral · Sr PM",     c: "from-[#C2410C] to-[#9A3412]", q: "I'll tell you what panels actually flag for." },
    { n: "Daniel O.", r: "ex-Meta",     t: "System design · Staff",  c: "from-[#06B6D4] to-[#0E7490]", q: "Most candidates miss the same 2 trade-offs." },
    { n: "Sana R.",   r: "ex-McKinsey", t: "Case · Engagement Mgr",  c: "from-[#0E0E10] to-[#3C4048]", q: "Structure first. Insight second. Then close hard." },
    { n: "Aman K.",   r: "ex-Google",   t: "Behavioral · Director",  c: "from-[#C2410C] to-[#7C2D12]", q: "Seniority shows in the boring trade-offs." },
  ];
  return (
    <section id="reviewers" className="relative" data-testid="reviewer-wall">
      <div className="max-w-[1320px] mx-auto px-6 md:px-10 py-20 md:py-28">
        <div className="grid grid-cols-12 gap-6 mb-10">
          <div className="col-span-12 md:col-span-3">
            <p className="font-monoG text-[10.5px] uppercase tracking-[0.2em] text-[rgb(var(--gv-ink-3))]">§ 04 / The bench</p>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h2 className="text-3xl md:text-[44px] font-medium tracking-[-0.03em] leading-[1.05] max-w-[22ch]">
              Reviewers who&apos;ve <span className="font-serif-i font-normal text-[rgb(var(--gv-human))]">sat on the panel.</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {reviewers.map((r, i) => (
            <article key={r.n} className={`gv-review relative bg-[rgb(var(--gv-bg))] gv-hl rounded-3xl p-6 gv-elev-1 hover:gv-elev-2 overflow-hidden ${i % 2 ? "lg:translate-y-6" : ""}`}>
              <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${r.c} opacity-25 blur-2xl`} />
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${r.c} grid place-items-center text-white text-[16px] font-medium`}>{r.n[0]}</div>
              <h3 className="mt-5 text-[18px] font-medium tracking-[-0.015em]">{r.n}</h3>
              <p className="font-monoG text-[10.5px] uppercase tracking-[0.14em] text-[rgb(var(--gv-ink-3))] mt-1">{r.r} · {r.t}</p>
              <p className="mt-5 font-serif-i text-[16px] leading-[1.4] text-[rgb(var(--gv-ink-2))]">&quot;{r.q}&quot;</p>
              <div className="mt-5 gv-hl-t pt-3 flex items-center justify-between font-monoG text-[10px] uppercase tracking-[0.14em] text-[rgb(var(--gv-ink-3))]">
                <span>· verified reviewer</span>
                <ArrowUpRight size={12} className="text-[rgb(var(--gv-ink))]" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="start" className="relative overflow-hidden">
      <div className="absolute inset-0 gv-bg-grid opacity-50 pointer-events-none" />
      <div className="gv-orb w-[460px] h-[460px] -top-32 right-10 gv-drift" style={{ background: "rgb(var(--gv-ai-soft))" }} aria-hidden />
      <div className="gv-orb w-[380px] h-[380px] bottom-0 -left-20 opacity-50 gv-drift-2" style={{ background: "rgb(var(--gv-human-soft))" }} aria-hidden />

      <div className="relative max-w-[1320px] mx-auto px-6 md:px-10 py-20 md:py-28 grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-7">
          <p className="font-monoG text-[10.5px] uppercase tracking-[0.2em] text-[rgb(var(--gv-ink-3))]">§ 05 / Start</p>
          <h2 className="text-4xl md:text-[56px] font-medium tracking-[-0.035em] leading-[1] mt-4 max-w-[18ch]">
            Land the loop. <span className="font-serif-i font-normal text-[rgb(var(--gv-human))]">Free first round.</span>
          </h2>
          <p className="mt-5 max-w-[44ch] text-[15px] text-[rgb(var(--gv-ink-2))] leading-relaxed">
            One free mock. One human-verified review. No card.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <AuthCTA
              data-testid="cta-primary"
              className="gv-btn inline-flex items-center gap-2 bg-[rgb(var(--gv-ink))] text-[rgb(var(--gv-bg))] font-medium px-7 py-4 text-[14px] rounded-full gv-elev-2 cursor-pointer"
            >
              Start free
              <ArrowUpRight size={15} strokeWidth={2} className="arrow" />
            </AuthCTA>
          </div>
        </div>

        <aside className="col-span-12 md:col-span-5 md:pl-10 md:gv-hl-l flex flex-col justify-end">
          <ul className="space-y-3.5 text-[13.5px]">
            {[
              "Real hiring-panel reviewers · FAANG, consulting, top startups.",
              "Every AI verdict double-checked before it reaches you.",
              "The answer they wanted to hear — not just feedback.",
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-monoG text-[10px] mt-0.5 text-[rgb(var(--gv-human))] tracking-wider">0{i + 1}</span>
                <span className="text-[rgb(var(--gv-ink-2))] leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative bg-[#0A0A0B] text-[rgb(var(--gv-bg))] overflow-hidden">
      <div className="absolute inset-0 gv-bg-grid opacity-[0.08]" aria-hidden />
      <div className="gv-orb w-[420px] h-[420px] -top-40 -left-20 opacity-20" style={{ background: "#06B6D4" }} aria-hidden />

      <div className="relative max-w-[1320px] mx-auto px-6 md:px-10 pt-20 pb-10">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-5">
            <Logo invert />
            <p className="mt-6 text-[14px] text-white/60 leading-relaxed max-w-md">
              Advanced AI-driven interview platform — every answer reviewed by a human who&apos;s actually been on the panel. Built by Joy Pasala.
            </p>
            <AuthCTA className="gv-btn inline-flex items-center gap-2 mt-7 bg-white text-[#0A0A0B] font-medium px-5 py-2.5 text-[13px] rounded-full cursor-pointer">
              Start free <ArrowUpRight size={14} strokeWidth={2} className="arrow" />
            </AuthCTA>
          </div>
          {[
            { title: "Product", items: ["The HITL loop", "Live booth", "Reviewer roster", "Pricing"] },
            { title: "Tracks",  items: ["Behavioral", "System design", "Case", "Data & ML"] },
            { title: "Company", items: ["About", "Reviewers", "Careers", "Contact"] },
          ].map((col) => (
            <div key={col.title} className="col-span-6 md:col-span-2">
              <p className="font-monoG text-[10px] uppercase tracking-[0.2em] text-white/45">{col.title}</p>
              <ul className="mt-4 space-y-2.5 text-[13.5px]">
                {col.items.map((it) => (
                  <li key={it}><a href="#" className="gv-link text-white/85 hover:text-white">{it}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 border-t border-white/10 pt-10">
          <span className="block text-[14vw] leading-[0.85] font-medium tracking-[-0.05em] text-white/95 select-none">
            GenView<span className="font-serif-i text-[rgb(var(--gv-ai))]">.</span>
          </span>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[11px] font-monoG uppercase tracking-[0.18em] text-white/45">
          <span>© {new Date().getFullYear()} GenView · interview prep, verified.</span>
          <span>built by joy pasala</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Page ---------- */
export default function Home() {
  return (
    <div className="gv-root min-h-screen">
      <StatusBar />
      <Nav />
      <Hero />
      <HITL />
      <ProductPreview />
      <ReviewerWall />
      <CTA />
      <Footer />
    </div>
  );
}

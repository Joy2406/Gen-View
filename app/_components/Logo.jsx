"use client";

import React from "react";

// GenView identity — cyan circular mark + wordmark.
export default function Logo({ className = "", invert = false }) {
  const ink = invert ? "rgb(250 250 249)" : "rgb(14 14 16)";
  return (
    <div className={`flex items-center gap-2.5 ${className}`} data-testid="brand-logo">
      <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="gv-logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="55%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0E7490" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="15" fill="url(#gv-logo-grad)" />
        <path
          d="M21.6 12.3c-1.1-1.4-2.9-2.3-4.9-2.3-3.4 0-6.1 2.7-6.1 6s2.7 6 6.1 6c3.2 0 5.8-2.4 6.1-5.5h-6.1"
          stroke="#FAFAF9"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span
        className="text-[16px] font-semibold leading-none"
        style={{ color: ink, letterSpacing: "-0.02em" }}
      >
        GenView
      </span>
    </div>
  );
}

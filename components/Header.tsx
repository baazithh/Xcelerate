"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800/80 bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-[1600px] items-center justify-between px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="shrink-0 text-sm font-bold tracking-tight text-cyan-400 md:text-base"
          >
            ⚡ Xcelerate
          </Link>
          <span className="hidden h-4 w-px bg-gray-700 sm:block" aria-hidden />
          <span className="hidden truncate text-[10px] font-medium uppercase tracking-[0.2em] text-gray-500 sm:block">
            Dynamic Spreadsheet Intelligence
          </span>
        </div>
        <nav className="flex shrink-0 items-center gap-4 text-xs text-gray-400">
          <button
            type="button"
            className="flex items-center gap-1.5 transition-colors hover:text-gray-200"
            aria-label="User profile"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-700 bg-card text-[10px] font-semibold text-cyan-400">
              U
            </span>
          </button>
          <button
            type="button"
            className="transition-colors hover:text-gray-200"
          >
            User Settings
          </button>
          <button
            type="button"
            className="transition-colors hover:text-gray-200"
          >
            Help
          </button>
        </nav>
      </div>
    </header>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Step = 1 | 2;

export default function LandingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);

  const advanceToUpload = () => {
    setCurrentStep(2);
    router.push("/upload");
  };

  if (currentStep === 2) {
    return null;
  }

  return (
    <section className="flex min-h-[calc(100vh-7rem)] flex-col items-center justify-center text-center">
      <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl">
        Turn Chaos into Clarity. UI-fy Your Spreadsheets.
      </h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-gray-400 md:text-base">
        Xcelerate ingests messy Excel and CSV exports, detects where your real
        table begins, infers types automatically, and surfaces KPIs, trends, and
        filterable grids—without another pivot-table rabbit hole.
      </p>
      <button
        type="button"
        onClick={advanceToUpload}
        className="mt-10 border border-cyan-400/40 bg-cyan-500 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-surface transition hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
      >
        Get Started
      </button>
    </section>
  );
}

// zonta-site/src/components/hero/Hero.tsx
//
// Editorial split-hero for the Zonta Club of Naples home page.
// An asymmetric layout: a solid mahogany brand panel with the headline and
// calls-to-action on the left, and a single consistently-framed photo
// carousel on the right.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { heroSlides } from "./heroImages";

// ADAPTIVE-BOX TEST: height of the photo stage at each breakpoint. Bump these
// up/down to make every image larger/smaller. (Used only by the adaptive box.)
const BOX_STAGE = "h-[20rem] sm:h-[24rem] lg:h-[30rem]";

export default function Hero() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance every 8s. Keyed on currentIndex so the timer restarts from a
  // full 8s whenever the slide changes by any means (auto, arrows, or dots) —
  // clicking "next" never looks like it skipped two images.
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i === heroSlides.length - 1 ? 0 : i + 1));
    }, 8000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const handlePrevious = () =>
    setCurrentIndex((i) => (i === 0 ? heroSlides.length - 1 : i - 1));
  const handleNext = () =>
    setCurrentIndex((i) => (i === heroSlides.length - 1 ? 0 : i + 1));

  const total = heroSlides.length;
  const counter = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="relative w-full overflow-hidden bg-zontaMahogany text-white font-body">
      {/* Soft brand-tone lighting so the flat panel has depth */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(120% 90% at 15% 10%, rgba(245,189,71,0.14), transparent 55%), radial-gradient(100% 80% at 85% 100%, rgba(0,95,113,0.30), transparent 60%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:py-24">
        {/* ===== Left: brand panel ===== */}
        {/* Centered when stacked (phone/tablet) so the text block is balanced on
            its own; left-aligned in the two-column desktop split where it's
            anchored by the photo beside it. */}
        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
          {/* Eyebrow */}
          <div className="mb-6 flex items-center justify-center gap-3 lg:justify-start">
            <span className="h-px w-10 bg-zontaGold" />
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zontaGold sm:text-sm">
              Naples, Florida
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
            Empowering women through{" "}
            <span className="italic text-zontaGold">service &amp; advocacy.</span>
          </h1>

          {/* Supporting copy */}
          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg lg:mx-0">
            The Zonta Club of Naples advances the status of women locally and
            globally — creating real change through compassion, education, and
            advocacy.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:items-start lg:justify-start">
            <button
              onClick={() => navigate("/about")}
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-zontaGold px-7 py-3.5 font-semibold text-zontaMahogany shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-zontaLightGold hover:shadow-xl active:translate-y-0 active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Learn more
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">
                →
              </span>
            </button>
            <button
              onClick={() => navigate("/donate")}
              className="inline-flex items-center justify-center rounded-lg bg-white px-7 py-3.5 font-semibold text-zontaMahogany shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-zontaLightGold hover:text-white hover:shadow-xl active:translate-y-0 active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Donate
            </button>
          </div>

          {/* Carousel controls — kept here in the brand panel (not over the
              photo) so they sit in one consistent place regardless of each
              image's size. Dots + arrows + counter. */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 lg:justify-start">
            {/* Slide indicators */}
            <div className="flex items-center gap-2" role="tablist" aria-label="Hero slides">
              {heroSlides.map((slide, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Show slide ${i + 1}: ${slide.alt}`}
                  aria-selected={currentIndex === i}
                  role="tab"
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === i
                      ? "w-8 bg-zontaGold"
                      : "w-3 bg-white/30 hover:bg-white/55"
                  }`}
                />
              ))}
            </div>

            {/* Arrows + counter */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevious}
                aria-label="Previous image"
                className="rounded-full border border-white/30 p-2 text-white transition-all duration-300 hover:border-zontaGold hover:bg-white/5 hover:text-zontaGold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <span className="min-w-[3.5rem] text-center font-mono text-xs tracking-widest text-white/70">
                {counter(currentIndex + 1)} / {counter(total)}
              </span>
              <button
                onClick={handleNext}
                aria-label="Next image"
                className="rounded-full border border-white/30 p-2 text-white transition-all duration-300 hover:border-zontaGold hover:bg-white/5 hover:text-zontaGold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ===== Right: photo carousel ===== */}
        {/* ▼▼▼ ADAPTIVE-BOX TEST ▼▼▼
            Experimental "stabilized adjustable box": a fixed-height stage in
            which each image is shown in full at its natural shape (no crop, no
            blur fill), framed and centered. Portrait photos fill the height;
            landscape photos sit centered with breathing room above/below.
            To revert to the fixed framed-crop carousel, restore this block from
            git history (commit 2ab0941). BOX_STAGE below tunes the height. */}
        <div className="relative">
          {/* Stage: stable height keeps the hero from jumping between slides. */}
          <div className={`relative w-full ${BOX_STAGE}`}>
            {heroSlides.map((slide, i) => (
              <div
                key={i}
                aria-hidden={currentIndex !== i}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-[1200ms] ${
                  currentIndex === i ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={slide.src}
                  alt={currentIndex === i ? slide.alt : ""}
                  className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl ring-1 ring-zontaGold/20"
                />
              </div>
            ))}
          </div>
        </div>
        {/* ▲▲▲ END ADAPTIVE-BOX TEST ▲▲▲ */}
      </div>
    </section>
  );
}

// zonta-site/src/components/hero/Hero.tsx
//
// Editorial split-hero for the Zonta Club of Naples home page.
// An asymmetric layout: a solid mahogany brand panel with the headline and
// calls-to-action on the left, and a single consistently-framed photo
// carousel on the right.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { heroSlides } from "./heroImages";

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
        <div className="max-w-xl">
          {/* Eyebrow */}
          <div className="mb-6 flex items-center gap-3">
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
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
            The Zonta Club of Naples advances the status of women locally and
            globally — creating real change through compassion, education, and
            advocacy.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
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

          {/* Slide indicators */}
          <div className="mt-12 flex items-center gap-2" role="tablist" aria-label="Hero slides">
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
        </div>

        {/* ===== Right: framed photo carousel ===== */}
        <div className="relative">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-zontaGold/20 sm:aspect-[5/4] lg:aspect-[4/5]">
            {heroSlides.map((slide, i) => {
              const contain = slide.fit === "contain";
              return (
                <div
                  key={i}
                  aria-hidden={currentIndex !== i}
                  className={`absolute inset-0 transition-opacity duration-[1200ms] ${
                    currentIndex === i ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {/* Blurred fill so contained (wide) images don't show empty bars */}
                  {contain && (
                    <div
                      className="absolute inset-0 scale-110 bg-cover bg-center blur-xl"
                      style={{ backgroundImage: `url(${slide.src})` }}
                    />
                  )}
                  <img
                    src={slide.src}
                    alt={currentIndex === i ? slide.alt : ""}
                    className={`absolute inset-0 h-full w-full object-center ${
                      contain ? "object-contain p-3" : "object-cover"
                    }`}
                  />
                </div>
              );
            })}

            {/* Gentle bottom gradient so the counter stays legible */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />

            {/* Prev / Next */}
            <button
              onClick={handlePrevious}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-zontaMahogany/55 p-2.5 text-white backdrop-blur-sm transition-all duration-300 hover:bg-zontaMahogany/80 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-zontaMahogany/55 p-2.5 text-white backdrop-blur-sm transition-all duration-300 hover:bg-zontaMahogany/80 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            {/* Counter */}
            <div className="absolute bottom-4 left-4 rounded-md bg-black/45 px-3 py-1 font-mono text-xs tracking-widest text-white backdrop-blur-sm">
              {counter(currentIndex + 1)} / {counter(total)}
            </div>
          </div>

          {/* Decorative offset frame behind the image */}
          <div className="absolute -bottom-5 -right-5 -z-10 hidden h-full w-full rounded-2xl border-[3px] border-zontaGold/70 lg:block" />
        </div>
      </div>
    </section>
  );
}

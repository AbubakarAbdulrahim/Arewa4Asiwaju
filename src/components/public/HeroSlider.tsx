"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export type HeroSlide = {
  src: string;
  alt: string;
  tag?: string;
  title?: string;
  description?: string;
  objectPosition?: string;
  highlight?: string;
};

interface HeroSliderProps {
  slides: HeroSlide[];
  intervalMs?: number;
}

export function HeroSlider({ slides, intervalMs = 5000 }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const shouldPause = isPaused || isHovered || isFocused;

  const nextSlide = useCallback(() => {
    setActiveIndex((current) => (current + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // 5-second auto-advancing slideshow cadence
  useEffect(() => {
    if (slides.length <= 1 || shouldPause) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const timer = setInterval(nextSlide, intervalMs);
    return () => clearInterval(timer);
  }, [slides.length, shouldPause, intervalMs, nextSlide]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      prevSlide();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      nextSlide();
    } else if (event.key === " " && event.target === event.currentTarget) {
      event.preventDefault();
      setIsPaused((p) => !p);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!slides || slides.length === 0) return null;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Movement Highlights Carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsFocused(false);
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="group relative flex w-full flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-line/80 bg-neutral-950 shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-forest transition-shadow duration-300 hover:shadow-[0_25px_50px_-12px_rgba(4,103,53,0.25)]"
    >
      {/* Visual Frame: Portrait-optimised ratio so photos fit without cropping */}
      <div className="relative aspect-[4/5] sm:aspect-[4/5] w-full min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] max-h-[620px] overflow-hidden bg-neutral-950">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={slide.src}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-all duration-700 ease-out motion-reduce:transition-none ${
                isActive
                  ? "opacity-100 scale-100 z-10"
                  : "opacity-0 scale-95 z-0 pointer-events-none"
              }`}
            >
              {/* Full-bleed photo that fills the entire frame */}
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] select-none motion-reduce:transition-none"
                style={{ objectPosition: slide.objectPosition ?? "center 20%" }}
              />
              {/* Subtle bottom gradient so floating controls remain legible */}
              <div
                className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"
                aria-hidden="true"
              />

              <span className="sr-only" aria-live="polite" aria-atomic="true">
                Photo {activeIndex + 1} of {slides.length}: {slide.alt}
              </span>
            </div>
          );
        })}

        {/* Floating Prev / Next Navigation Arrows */}
        {slides.length > 1 && (
          <div className="absolute inset-y-0 inset-x-3 sm:inset-x-4 z-30 flex items-center justify-between pointer-events-none">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-neutral-900/60 text-white backdrop-blur-md shadow-lg transition-all duration-200 hover:bg-brand-forest hover:border-transparent hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-neutral-900/60 text-white backdrop-blur-md shadow-lg transition-all duration-200 hover:bg-brand-forest hover:border-transparent hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Floating Bottom Control Bar */}
        {slides.length > 1 && (
          <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 z-30">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-neutral-900/70 px-3 py-2 sm:px-4 sm:py-2.5 backdrop-blur-md shadow-lg">
              {/* Segmented Progress Indicators */}
              <div
                className="flex flex-1 items-center gap-1.5 sm:gap-2"
                role="group"
                aria-label="Choose a photo"
              >
                {slides.map((slide, index) => {
                  const isCurrent = index === activeIndex;
                  return (
                    <button
                      key={slide.src}
                      type="button"
                      aria-pressed={isCurrent}
                      aria-label={`Show photo ${index + 1} of ${slides.length}`}
                      onClick={() => goToSlide(index)}
                      className="group/pill relative flex-1 h-2 sm:h-2.5 overflow-hidden rounded-full bg-white/20 transition-all duration-200 hover:bg-white/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      {/* Active Progress Bar Fill */}
                      {isCurrent ? (
                        <div
                          key={`progress-${activeIndex}-${shouldPause ? "paused" : "running"}`}
                          className={`h-full w-full bg-brand-forest carousel-progress-fill ${
                            shouldPause ? "carousel-progress-paused" : ""
                          }`}
                        />
                      ) : index < activeIndex ? (
                        <div className="h-full w-full bg-white/60" />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {/* Counter and Play/Pause */}
              <div className="flex items-center gap-2 pl-1 sm:pl-2 shrink-0">
                <span className="font-mono text-xs font-semibold tracking-wider text-white/90">
                  <span className="text-white">0{activeIndex + 1}</span>
                  <span className="mx-1 text-white/40">/</span>
                  <span className="text-white/60">0{slides.length}</span>
                </span>

                <button
                  type="button"
                  onClick={() => setIsPaused((value) => !value)}
                  aria-pressed={isPaused}
                  aria-label={isPaused ? "Resume automatic slideshow" : "Pause automatic slideshow"}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all duration-150 hover:bg-white/20 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
                >
                  {isPaused ? (
                    <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  ) : (
                    <Pause className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

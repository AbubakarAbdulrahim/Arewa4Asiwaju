"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export type HeroSlide = {
  src: string;
  alt: string;
  tag: string;
  title: string;
  description: string;
  objectPosition?: string;
  highlight?: string;
};

interface HeroSliderProps {
  slides: HeroSlide[];
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setActiveIndex((current) => (current + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1 || paused || isHovered || isFocused) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const timer = setInterval(nextSlide, 6500);
    return () => clearInterval(timer);
  }, [slides.length, paused, isHovered, isFocused, nextSlide]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      prevSlide();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      nextSlide();
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
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsFocused(false);
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-forest"
    >
      {/* Visual Frame */}
      <div className="relative aspect-[4/3] w-full min-h-[19rem] sm:min-h-[24rem] overflow-hidden bg-neutral-900">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={slide.src}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                preload={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px"
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
                style={{ objectPosition: slide.objectPosition ?? "center 25%" }}
              />

              {/* Gradient Vignette for readable captions */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10"
                aria-hidden="true"
              />

              {/* Slide Caption Details */}
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white z-20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center rounded-sm bg-white/95 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wider text-brand-forest">
                    {slide.tag}
                  </span>
                  {slide.highlight && (
                    <span className="rounded-sm border border-white/30 bg-black/55 px-2.5 py-1 text-[0.6875rem] font-semibold text-white">
                      {slide.highlight}
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-bold leading-snug tracking-tight text-white drop-shadow-sm">
                  {slide.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs sm:text-sm text-white/85 leading-relaxed drop-shadow-xs max-w-lg">
                  {slide.description}
                </p>
                <span className="sr-only" aria-live="polite" aria-atomic="true">
                  Slide {activeIndex + 1}: {slide.title}
                </span>
              </div>
            </div>
          );
        })}

        {/* Previous / Next Controls */}
        {slides.length > 1 && (
          <div className="absolute inset-y-0 inset-x-3 z-30 flex items-center justify-between pointer-events-none">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-brand-forest focus-visible:outline-2 focus-visible:outline-white"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-brand-forest focus-visible:outline-2 focus-visible:outline-white"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Interactive Bottom Bar */}
      {slides.length > 1 && (
        <div className="flex items-center justify-between border-t border-line/60 bg-surface px-4 py-3 sm:px-6">
          <div className="flex items-center gap-1.5" role="group" aria-label="Choose a slide">
            {slides.map((slide, index) => {
              const isCurrent = index === activeIndex;
              return (
                <button
                  key={slide.src}
                  type="button"
                  aria-pressed={isCurrent}
                  aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                  onClick={() => setActiveIndex(index)}
                  className="inline-flex h-11 min-w-11 items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-forest"
                >
                  <span
                    className={`h-2 rounded-full transition-colors ${
                      isCurrent ? "w-8 bg-brand-forest" : "w-2 bg-line hover:bg-brand-forest/60"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-muted">
            <span>
              <strong className="text-ink">{activeIndex + 1}</strong> of {slides.length}
            </span>
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-pressed={paused}
              aria-label={paused ? "Resume automatic playback" : "Pause automatic playback"}
              className="ml-2 inline-flex h-11 w-11 items-center justify-center rounded-sm border border-line bg-surface-raised text-muted transition-colors hover:text-ink"
            >
              {paused ? (
                <Play className="h-3 w-3" aria-hidden="true" />
              ) : (
                <Pause className="h-3 w-3" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

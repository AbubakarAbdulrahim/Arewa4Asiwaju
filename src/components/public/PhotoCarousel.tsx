"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type PhotoSlide = {
  src: string;
  alt: string;
  objectPosition?: string;
};

export function PhotoCarousel({ slides }: { slides: PhotoSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (
      slides.length < 2 ||
      paused ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[activeIndex];
  const move = (direction: -1 | 1) => {
    setActiveIndex((current) => (current + direction + slides.length) % slides.length);
  };

  return (
    <div
      className="home-photo-carousel"
      role="region"
      aria-label="Featured A4A photographs"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div
        className="home-photo-carousel__frame"
        style={{
          position: "relative",
          display: "block",
          width: "100%",
          minHeight: "22rem",
          aspectRatio: "4 / 3",
        }}
      >
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          preload={activeIndex === 0}
          sizes="(max-width: 1023px) 100vw, 50vw"
          className="home-photo-carousel__image"
          style={{ objectPosition: slide.objectPosition ?? "center 28%" }}
        />
        {slides.length > 1 && (
          <>
            <div className="home-photo-carousel__controls">
              <button type="button" aria-label="Show previous photo" onClick={() => move(-1)}>
                <ChevronLeft aria-hidden="true" className="h-5 w-5" />
              </button>
              <button type="button" aria-label="Show next photo" onClick={() => move(1)}>
                <ChevronRight aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
            <div className="home-photo-carousel__dots" role="group" aria-label="Choose a photo">
              {slides.map((item, index) => (
                <button
                  key={item.src}
                  type="button"
                  aria-label={`Show photo ${index + 1}`}
                  aria-current={activeIndex === index ? "true" : undefined}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
            <span className="sr-only" aria-live="polite" aria-atomic="true">
              Photo {activeIndex + 1} of {slides.length}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

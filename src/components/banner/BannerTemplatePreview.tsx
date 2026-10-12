"use client";

import { useEffect, useRef } from "react";
import { drawBanner } from "@/lib/banner/render-banner";

export function BannerTemplatePreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let active = true;
    const render = (logo: HTMLImageElement | null) => {
      if (!active) return;
      drawBanner(
        canvas,
        {
          name: "Your Name",
          position: "Coordinator Students Wing, A4A",
          photo: null,
          logo,
          zoom: 1,
          panX: 0,
          panY: 0,
        },
        1,
      );
    };

    const logo = new window.Image();
    logo.onload = () => render(logo);
    logo.onerror = () => render(null);
    logo.src = "/brand/arewa-for-asiwaju-a4a.jpg";

    return () => {
      active = false;
      logo.onload = null;
      logo.onerror = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Preview of the personalized Arewa for Asiwaju Student Wing banner template"
      className="block h-auto w-full max-w-[13rem] rounded-md border border-white/30 shadow-lg sm:max-w-[15rem]"
      style={{ aspectRatio: "764 / 1080" }}
    />
  );
}

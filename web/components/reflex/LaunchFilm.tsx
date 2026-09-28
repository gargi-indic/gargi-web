"use client";

import { useEffect, useRef } from "react";

/**
 * Launch film per DESIGN.md §5 "Video": muted, playsInline, controls, poster
 * until play. Autoplays only while in view and only when the visitor has not
 * asked for reduced motion.
 */
export function LaunchFilm({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || typeof IntersectionObserver === "undefined") return;
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && motion.matches) {
          video.play().catch(() => {});
        } else if (!entry.isIntersecting) {
          video.pause();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className="launch-film"
      src={src}
      poster={poster}
      muted
      playsInline
      controls
      preload="metadata"
      aria-label={label}
    />
  );
}

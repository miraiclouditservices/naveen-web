"use client";

import React, { useEffect, useState } from "react";

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show custom cursor on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "A" ||
          target.tagName === "BUTTON" ||
          target.closest("a") ||
          target.closest("button") ||
          target.closest(".mkt-card-clean") ||
          target.closest(".qa-btn") ||
          target.getAttribute("role") === "button")
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Inner Dot Cursor */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "8px",
          height: "8px",
          backgroundColor: "#2563eb",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 99999,
          transform: `translate3d(${pos.x - 4}px, ${pos.y - 4}px, 0)`,
          transition: "transform 0.05s ease-out",
        }}
      />

      {/* Outer Bubble Ring Follower */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: isHovered ? "50px" : "34px",
          height: isHovered ? "50px" : "34px",
          border: isHovered ? "2px solid rgba(37, 99, 235, 0.6)" : "1.5px solid rgba(37, 99, 235, 0.35)",
          backgroundColor: isHovered ? "rgba(37, 99, 235, 0.12)" : "rgba(37, 99, 235, 0.04)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 99998,
          transform: `translate3d(${pos.x - (isHovered ? 25 : 17)}px, ${pos.y - (isHovered ? 25 : 17)}px, 0)`,
          transition: "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1), width 0.25s ease, height 0.25s ease, background-color 0.25s ease, border-color 0.25s ease",
          backdropFilter: isHovered ? "blur(2px)" : "none",
        }}
      />
    </>
  );
}

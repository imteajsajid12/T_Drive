"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  motion, 
  useMotionValue, 
  useSpring,
  useMotionTemplate, 
  useAnimationFrame 
} from "framer-motion";

export const Component = () => {
  const [count, setCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  const speedX = 0.5; 
  const speedY = 0.5;

  useAnimationFrame(() => {
    const currentX = gridOffsetX.get();
    const currentY = gridOffsetY.get();
    gridOffsetX.set((currentX + speedX) % 40);
    gridOffsetY.set((currentY + speedY) % 40);
  });

  const maskImage = useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-background"
      )}
    >
      <div className="absolute inset-0 z-0 opacity-[0.05]">
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
      </div>
      <motion.div 
        className="absolute inset-0 z-0 opacity-40"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
      </motion.div>

      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute right-[-20%] top-[-20%] w-[40%] h-[40%] rounded-full bg-orange-500/40 dark:bg-orange-600/20 blur-[120px]" />
        <div className="absolute right-[10%] top-[-10%] w-[20%] h-[20%] rounded-full bg-primary/30 blur-[100px]" />
        <div className="absolute left-[-10%] bottom-[-20%] w-[40%] h-[40%] rounded-full bg-blue-500/40 dark:bg-blue-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-3xl mx-auto space-y-6 pointer-events-none">
         <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
            The Infinite Grid
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Move your cursor to reveal the active grid layer. <br/>
            The pattern scrolls infinitely in the background.
          </p>
        </div>
        
        <div className="flex gap-4 pointer-events-auto">
          <button 
              onClick={() => setCount(count + 1)}
              className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-all shadow-md active:scale-95"
          >
              Interact ({count})
          </button>
          <button 
              className="px-8 py-3 bg-secondary text-secondary-foreground font-semibold rounded-md hover:bg-secondary/80 transition-all active:scale-95"
          >
              Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export const InfiniteGridBackdrop = ({ className = "", dark = false }: { className?: string; dark?: boolean }) => {
  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(30);
  const cursorX = useSpring(pointerX, { stiffness: 72, damping: 34, mass: 0.85 });
  const cursorY = useSpring(pointerY, { stiffness: 72, damping: 34, mass: 0.85 });
  const spotlight = useMotionTemplate`radial-gradient(34% 28% at ${cursorX}% ${cursorY}%, ${dark ? 'rgba(167,243,208,0.14)' : 'rgba(167,243,208,0.11)'}, transparent 78%)`;

  // Mouse spotlight tracking — only meaningful on pointer devices
  const isPointerDevice = typeof window !== 'undefined' && window.matchMedia?.('(pointer: fine)').matches;

  useEffect(() => {
    if (!isPointerDevice) return;

    const handleMove = (event: MouseEvent) => {
      pointerX.set((event.clientX / window.innerWidth) * 100);
      pointerY.set((event.clientY / window.innerHeight) * 100);
    };
    const handleLeave = () => {
      pointerX.set(50);
      pointerY.set(30);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mouseleave', handleLeave, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseleave', handleLeave);
    };
  }, [pointerX, pointerY, isPointerDevice]);

  // Scrolling grid — runs on all devices, willChange:transform keeps it on GPU
  useAnimationFrame(() => {
    const currentX = gridOffsetX.get();
    const currentY = gridOffsetY.get();
    gridOffsetX.set((currentX + 0.18) % 40);
    gridOffsetY.set((currentY + 0.18) % 40);
  });

  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        dark ? "text-white/70" : "text-slate-700/70",
        className
      )}
    >
      {/* Base grid — very subtle, always visible */}
      <div className="absolute inset-0 opacity-[0.06]" style={{ willChange: 'transform' }}>
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
      </div>

      {/* Masked center-fade layer */}
      <motion.div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          maskImage: "radial-gradient(55% 45% at 50% 30%, black, transparent)",
          WebkitMaskImage: "radial-gradient(55% 45% at 50% 30%, black, transparent)",
          willChange: 'transform',
        }}
      >
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
      </motion.div>

      {/* Mouse spotlight — renders on all devices but only moves on pointer devices */}
      <motion.div
        className="absolute inset-0 mix-blend-soft-light opacity-45"
        style={{ backgroundImage: spotlight }}
      />

      {/* Ambient glow orbs */}
      <div className="absolute inset-0">
        <div className="absolute right-[-15%] top-[-15%] h-[40%] w-[40%] rounded-full bg-emerald-300/14 blur-[150px]" />
        <div className="absolute left-[-10%] bottom-[-18%] h-[40%] w-[40%] rounded-full bg-teal-200/12 blur-[150px]" />
        <div className="absolute left-[20%] top-[12%] h-[20%] w-[20%] rounded-full bg-green-200/10 blur-[120px]" />
      </div>
    </div>
  );
};

const GridPattern = ({ offsetX, offsetY }: { offsetX: any, offsetY: any }) => {
  return (
    <svg className="w-full h-full">
      <defs>
        <motion.pattern
          id="grid-pattern"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground" 
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
  );
};
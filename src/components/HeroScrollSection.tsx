/*
 * HeroScrollSection — Scroll-linked image sequence with lerp smoothing.
 * Place at: src/components/HeroScrollSection.tsx
 * Images:   public/video-split/ffout001.gif … ffout080.gif
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

const TOTAL_FRAMES = 80;
const LERP_FACTOR = 0.08;

export default function HeroScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  // Lerp state stored in refs to avoid re-renders
  const targetFrameRef = useRef<number>(0);
  const currentFrameRef = useRef<number>(0);
  const lastDrawnFrame = useRef<number>(-1);
  const rafIdRef = useRef<number>(0);

  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // ── Preload all images ──
  useEffect(() => {
    let loaded = 0;
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    const promises: Promise<void>[] = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const indexStr = i.toString().padStart(3, '0');
      const src = `/video-split/ffout${indexStr}.gif`;

      promises.push(
        new Promise((resolve) => {
          const img = new Image();
          img.onload = async () => {
            try {
              // Force decode into GPU memory before finishing load
              await img.decode(); 
            } catch(e) {
              // ignore decode errors (e.g. safari edge cases)
            }
            loaded++;
            setLoadedCount(loaded);
            images[i - 1] = img;
            resolve();
          };
          img.onerror = () => {
            console.error(`Failed to load ${src}`);
            loaded++;
            setLoadedCount(loaded);
            images[i - 1] = img;
            resolve();
          };
          img.src = src;
        })
      );
    }

    Promise.all(promises).then(() => {
      imagesRef.current = images;
      setIsLoaded(true);
    });
  }, []);

  // ── Framer Motion scroll tracking ──
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // ── DPR-aware canvas sizing ──
  const sizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.offsetWidth;
    const cssH = canvas.offsetHeight;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  // ── Draw a single frame (cover mode, fills viewport) ──
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = imagesRef.current[frameIndex];
    if (!img || img.naturalWidth === 0) return;

    const cssW = canvas.offsetWidth;
    const cssH = canvas.offsetHeight;

    // Cover: fill entire viewport, crop excess, centered
    const scale = Math.max(cssW / img.naturalWidth, cssH / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const x = (cssW - drawW) / 2;
    const y = (cssH - drawH) / 2;

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.drawImage(img, x, y, drawW, drawH);
    lastDrawnFrame.current = frameIndex;
  }, []);

  // ── Initial draw when loading completes ──
  useEffect(() => {
    if (isLoaded) {
      sizeCanvas();
      drawFrame(0);
      currentFrameRef.current = 0;
      lastDrawnFrame.current = 0;
    }
  }, [isLoaded, sizeCanvas, drawFrame]);

  // ── Handle window resize ──
  useEffect(() => {
    const handleResize = () => {
      sizeCanvas();
      if (lastDrawnFrame.current >= 0) {
        drawFrame(lastDrawnFrame.current);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sizeCanvas, drawFrame]);

  // ── Scroll listener: only sets the target frame ──
  useMotionValueEvent(scrollYProgress, 'change', (latest: number) => {
    const maxIndex = TOTAL_FRAMES - 1;
    targetFrameRef.current = Math.min(maxIndex, Math.max(0, Math.floor(latest * (maxIndex + 1))));
  });

  // ── Lerp animation loop (runs continuously once loaded) ──
  useEffect(() => {
    if (!isLoaded) return;

    const tick = () => {
      const target = targetFrameRef.current;
      const current = currentFrameRef.current;

      // Lerp towards target
      const next = current + (target - current) * LERP_FACTOR;
      currentFrameRef.current = next;

      const roundedFrame = Math.round(next);
      if (roundedFrame !== lastDrawnFrame.current) {
        drawFrame(roundedFrame);
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafIdRef.current);
  }, [isLoaded, drawFrame]);

  return (
    <div ref={containerRef} className="relative w-full h-[300vh]" style={{ backgroundColor: '#F9F3EE' }}>


      {/* Sticky Canvas */}
      <div className="sticky top-0 w-full h-screen" style={{ overflow: 'hidden' }}>
        <motion.canvas
          ref={canvasRef}
          className="pointer-events-none"
          style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

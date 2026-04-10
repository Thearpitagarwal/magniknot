/*
 * HeroScrollSection — Scroll-linked image sequence with lerp smoothing.
 * Place at: src/components/HeroScrollSection.tsx
 * Images:   public/video-split/ffout001.gif … ffout080.gif
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

const TOTAL_FRAMES = 80;
const LERP_FACTOR = 0.08;

export default function HeroScrollSection({ onLoadComplete }: { onLoadComplete?: () => void }) {
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
      const src = `/video-split/ezgif-frame-${indexStr}.webp`;

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
      if (onLoadComplete) onLoadComplete();
    });
  }, [onLoadComplete]);

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

  // ── Auto Nudge (Mobile Only) ──
  useEffect(() => {
    if (!isLoaded) return;
    if (window.innerWidth >= 768) return; // Mobile only

    const timer = setTimeout(() => {
      if (window.scrollY < 50) {
        window.scrollBy({ top: 90, behavior: 'smooth' });
        setTimeout(() => {
          if (window.scrollY < 150) {
            window.scrollBy({ top: -90, behavior: 'smooth' });
          }
        }, 600);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  // Arrow visibility based on scroll
  const [showArrow, setShowArrow] = useState(true);
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest > 0.05 && showArrow) setShowArrow(false);
    else if (latest <= 0.05 && !showArrow) setShowArrow(true);
  });

  return (
    <div ref={containerRef} className="relative w-full h-[250vh] md:h-[300vh]" style={{ backgroundColor: '#F9F3EE' }}>

      {/* Sticky Canvas & Content */}
      <div className="sticky top-0 w-full h-[92vh] md:h-screen flex items-center justify-center flex-col px-6 md:px-12" style={{ overflow: 'hidden' }}>
        
        {/* Canvas */}
        <motion.canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 w-full h-full"
          style={{ 
            transform: 'translateZ(0)',
            willChange: 'transform'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />

        {/* (Overlay Removed Per Instructions) */}

        {/* Text Content */}
        <div className="relative z-20 w-full text-center pointer-events-none flex flex-col items-center justify-center max-w-[700px]">
          
          <style>{`
            @keyframes magnetPull {
              0%, 100% { transform: translateY(-5px) translateX(0) rotate(-20deg); }
              50% { transform: translateY(-5px) translateX(-3px) rotate(-18deg); }
            }
            .magnet {
              display: inline-block;
              width: 22px;
              height: 22px;
              margin-left: 8px;
              vertical-align: middle;
              background: url('/magnet-icon.svg') no-repeat center;
              background-size: contain;
              animation: magnetPull 2s ease-in-out infinite;
            }
            @media (min-width: 768px) {
              .magnet {
                width: 26px;
                height: 26px;
                margin-left: 10px;
              }
            }
            @keyframes smoothBounce {
              0%, 100% {
                transform: translateY(0);
                opacity: 0.7;
              }
              50% {
                transform: translateY(8px);
                opacity: 1;
              }
            }
            .scroll-indicator {
              position: absolute;
              bottom: 28px;
              left: 50%;
              transform: translateX(-50%);
              opacity: 0.8;
              z-index: 10;
              cursor: pointer;
            }
            .scroll-indicator svg {
              animation: smoothBounce 2s ease-in-out infinite;
              filter: drop-shadow(0 2px 6px rgba(200,92,92,0.25));
            }
          `}</style>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 15 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center w-full px-4 text-center"
          >
            <h1 
              className="font-display font-semibold" 
              style={{ 
                color: '#2A1A1A',
                fontSize: 'clamp(2.4rem, 7vw, 5.5rem)', 
                lineHeight: 1.15,
                letterSpacing: '-0.5px',
                textShadow: '0 2px 10px rgba(0,0,0,0.08)',
                whiteSpace: 'nowrap',
                overflow: 'hidden'
              }}
            >
              Where Love Finds <br />
              <span className="pull-text inline-flex items-center" style={{ color: '#C85C5C' }}>
                Its Pull <span className="magnet"></span>
              </span>
            </h1>
            
            <div className="pointer-events-auto w-full flex justify-center mt-[38px]">
              <button 
                onClick={() => {
                  window.scrollTo({
                    top: window.innerHeight * (window.innerWidth < 768 ? 2.5 : 3),
                    behavior: 'smooth'
                  });
                }} 
                className="w-full max-w-[260px] py-3 px-8 rounded-full font-label text-[12px] tracking-[0.08em] uppercase text-white flex items-center justify-center transition-all duration-300 ease-out relative z-30"
                style={{
                  background: 'linear-gradient(135deg, #C85C5C, #E07A7A)',
                  boxShadow: '0 8px 24px rgba(200,92,92,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 14px 36px rgba(200,92,92,0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(200,92,92,0.35), inset 0 1px 0 rgba(255,255,255,0.2)';
                }}
              >
                Shop The Collection
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator positioned at bottom of the sticky screen */}
        {isLoaded && (
          <div 
            className="scroll-indicator"
            onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path 
                d="M6 10L12 16L18 10" 
                stroke="#C85C5C" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

      </div>
    </div>
  );
}

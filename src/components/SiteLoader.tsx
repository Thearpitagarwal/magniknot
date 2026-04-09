/*
 * SiteLoader — Branded loading screen for MagniKnot.
 * Displays a gift box SVG animation, progress bar, logo image, and tagline
 * while preloading hero image frames. Integrated via App.jsx.
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, useTransform, useMotionValue, AnimatePresence } from 'framer-motion';

interface SiteLoaderProps {
  imageSrcs: string[];
  onComplete: () => void;
}

export default function SiteLoader({ imageSrcs, onComplete }: SiteLoaderProps) {
  const [assetsLoaded, setAssetsLoaded] = useState(0);
  const [timeProgress, setTimeProgress] = useState(0);
  
  // Phase 5 triggers
  const [startExit, setStartExit] = useState(false);
  const [showWhiteFlash, setShowWhiteFlash] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  
  const MIN_DISPLAY_TIME = 2200; // ms
  const totalAssets = imageSrcs.length || 1;

  // Track Asset Loading
  useEffect(() => {
    if (imageSrcs.length === 0) {
      setAssetsLoaded(100);
      return;
    }

    let loadedCount = 0;
    const updateProgress = () => {
      loadedCount++;
      setAssetsLoaded(Math.min(100, Math.floor((loadedCount / totalAssets) * 100)));
    };

    imageSrcs.forEach((src) => {
      const img = new Image();
      img.onload = updateProgress;
      img.onerror = updateProgress;
      img.src = src;
    });
  }, [imageSrcs, totalAssets]);

  // Track Time Elapsed
  useEffect(() => {
    const startTime = Date.now();
    let rAF: number;
    
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / MIN_DISPLAY_TIME) * 100);
      setTimeProgress(progress);
      
      if (progress < 100) {
        rAF = requestAnimationFrame(tick);
      }
    };
    
    rAF = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rAF);
  }, []);

  // Combined progress
  const combinedProgress = Math.min(assetsLoaded, timeProgress);
  const isReadyToExit = combinedProgress >= 100;

  // Motion Value for smooth tracking
  const progressMotion = useMotionValue(0);
  useEffect(() => {
    progressMotion.set(combinedProgress);
  }, [combinedProgress, progressMotion]);

  // Exit sequence
  useEffect(() => {
    if (isReadyToExit && !startExit) {
      setStartExit(true);
      // Phase 5 sequence: lid flies up (400ms) -> white flash (300ms) -> fade out (500ms) -> done
      const t1 = setTimeout(() => setShowWhiteFlash(true), 400);
      const t2 = setTimeout(() => setFadeOut(true), 700);
      const t3 = setTimeout(() => onComplete(), 1200);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [isReadyToExit, startExit, onComplete]);

  // Derived animations
  const lidY = useTransform(progressMotion, [0, 100], [0, -40]);
  const bloomRadius = useTransform(progressMotion, [0, 100], [0, 60]);
  const bloomOpacity = useTransform(progressMotion, [0, 100], [0, 0.85]);
  const bloomWidth = useTransform(bloomRadius, r => `${r * 2}px`);
  const bloomHeight = useTransform(bloomRadius, r => `${r * 2}px`);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#F9F3EE', fontFamily: 'Inter, sans-serif' }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      
      {/* ── PHASE 1 & 2 & 5: The Box Animation ── */}
      <div className="relative flex flex-col items-center justify-center w-full mb-5 mt-[-10vh] scale-75 sm:scale-100">
        
        {/* Light Bloom (Phase 2) */}
        <motion.div 
          className="absolute z-0 pointer-events-none rounded-full"
          style={{
            width: bloomWidth,
            height: bloomHeight,
            opacity: bloomOpacity,
            background: 'radial-gradient(circle, rgba(201,164,90,0.8) 0%, rgba(201,164,90,0) 70%)',
            top: '40px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          {/* Shimmering Oval Link Inside Bloom */}
          <motion.svg 
            viewBox="0 0 20 12" 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[18px] h-[10px]"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
          >
            <ellipse cx="10" cy="6" rx="8" ry="4" fill="none" stroke="#C9A45A" strokeWidth="0.8" />
          </motion.svg>
        </motion.div>

        <svg width="120" height="90" viewBox="0 0 120 90" className="relative z-10 overflow-visible">
          {/* Box Body */}
          <motion.rect
            x="10" y="45" width="100" height="40"
            fill="none" stroke="#C9A45A" strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />

          {/* Box Lid */}
          <motion.g
            style={{ y: startExit ? undefined : lidY }}
            animate={{ y: startExit ? -60 : undefined }}
            transition={{ y: { duration: 0.4, ease: "easeOut" } }}
          >
            <motion.rect 
              x="5" y="15" width="110" height="25" 
              fill="none" stroke="#C9A45A" strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            />
          </motion.g>
        </svg>

      </div>

      {/* ── PHASE 3: Logo & Tagline ── */}
      <div className="flex flex-col items-center w-full">
        {/* Logo as an image (favicon.svg from public/) */}
        <motion.div
          className="relative flex justify-center mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: combinedProgress >= 25 ? 1 : 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <img 
            src="/favicon.svg" 
            alt="MagniKnot"
            className="w-12 h-12 sm:w-16 sm:h-16"
            style={{ filter: 'brightness(0.15)' }}
          />
          
          {/* Spark sweep */}
          {combinedProgress >= 25 && (
            <motion.div 
              className="absolute inset-0 pointer-events-none mix-blend-overlay overflow-hidden"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(201,164,90,0.7) 50%, transparent 100%)',
                  width: '60%'
                }}
                initial={{ x: '-100%' }}
                animate={{ x: '250%' }}
                transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
              />
            </motion.div>
          )}
        </motion.div>

        {/* Brand name text */}
        <motion.h1
          className="text-[28px] sm:text-[36px] tracking-wide mb-2"
          style={{ fontFamily: '"Playfair Display", serif', color: '#2C1A1A' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: combinedProgress >= 25 ? 1 : 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          Magni<em className="italic">Knot</em>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="italic text-[13px] sm:text-[15px] text-center tracking-wide"
          style={{ fontFamily: 'Inter, sans-serif', color: '#7A7570' }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ 
            opacity: combinedProgress >= 50 ? 1 : 0,
            y: combinedProgress >= 50 ? 0 : 5 
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          Where love sticks forever
        </motion.p>
      </div>

      {/* ── PHASE 4: Progress Bar ── */}
      <div className="fixed bottom-0 left-0 w-full h-[2px] z-[10000]" style={{ backgroundColor: '#F2E8DF' }}>
        <motion.div 
          className="h-full relative"
          style={{ backgroundColor: '#C85C5C' }}
          animate={{ width: `${combinedProgress}%` }}
          transition={{ type: "spring", stiffness: 60, damping: 20 }}
        >
          {/* Spark Tip */}
          <div 
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-[6px] h-[6px] rounded-full"
            style={{ backgroundColor: '#C9A45A', boxShadow: '0 0 6px #C9A45A' }}
          />
        </motion.div>
      </div>

      {/* ── PHASE 5: Exit White Flash ── */}
      {showWhiteFlash && (
        <motion.div
          className="absolute inset-0 z-50"
          style={{ backgroundColor: '#FFFDF9' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      )}

    </motion.div>
  );
}

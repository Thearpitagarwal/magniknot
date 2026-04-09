// animations.js — import these across the app

export const fadeInUp = {
  initial:    { opacity: 0, y: 32 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } }
};

export const modalSlide = {
  initial:    { opacity: 0, scale: 0.96 },
  animate:    { opacity: 1, scale: 1 },
  exit:       { opacity: 0, scale: 0.96 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const drawerSlide = {
  initial:    { x: '100%' },
  animate:    { x: 0 },
  exit:       { x: '100%' },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
};

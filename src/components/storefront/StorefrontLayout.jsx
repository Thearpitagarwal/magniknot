import { useState, useEffect, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShoppingBag, MessageCircle } from 'lucide-react';
import { useBag } from '../../context/BagContext';
import { subscribeToSettings } from '../../services/api';
import BagDrawer from './BagDrawer';

export default function StorefrontLayout() {
  const { bagItems, setIsBagOpen } = useBag();
  const [showBagIcon, setShowBagIcon] = useState(false);
  const [settings, setSettings] = useState({ brandTagline: 'Where love sticks forever', instagramHandle: '', whatsappNumber: '' });

  // Show bag icon once user scrolls past the hero (which is 300vh tall)
  useEffect(() => {
    const handleScroll = () => {
      // Hero section is 300vh, so by scrollY > window.innerHeight * 2, the user has scrolled through it
      setShowBagIcon(window.scrollY > window.innerHeight * 2);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // check initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToSettings((data) => {
      if (data) setSettings(data);
    });
    return () => unsubscribe();
  }, []);

  const openWhatsApp = () => {
    if (!settings.whatsappNumber) return;
    const url = `https://wa.me/${settings.whatsappNumber}?text=Hi!%20I%20have%20a%20question%20about%20MagniKnot.`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col font-body">
      
      {/* ── Navbar ── */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 bg-transparent"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-end">

          {/* Right Actions — Bag icon fades in/out */}
          <div className="w-10 md:w-24 flex justify-end">
            <button 
              onClick={() => setIsBagOpen(true)}
              className="relative p-2 text-charcoal hover:text-rose-500 transition-all duration-300 ease-in-out"
              style={{ opacity: showBagIcon ? 1 : 0, pointerEvents: showBagIcon ? 'auto' : 'none' }}
            >
              <ShoppingBag strokeWidth={1.5} size={22} />
              {bagItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white font-label text-[9px] w-[18px] h-[18px] flex items-center justify-center rounded-full">
                  {bagItems.length}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-charcoal text-white py-16 px-4 md:px-8 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="font-display font-semibold text-3xl mb-2">
            Magni<em className="italic font-normal text-rose-300">Knot</em>
          </h2>
          <p className="font-body italic text-[18px] text-white/60 mb-10">
            {settings.brandTagline}
          </p>
          
          <div className="flex gap-6 mb-10">
            {settings.instagramHandle && (
              <a 
                href={`https://instagram.com/${settings.instagramHandle}`} 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-rose-300 hover:border-rose-300 transition-all duration-300"
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
            )}
            
            <button 
              onClick={openWhatsApp}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-green-400 hover:border-green-400 transition-all duration-300"
              aria-label="WhatsApp"
            >
              <MessageCircle size={18} />
            </button>
          </div>

          <div className="w-12 h-px bg-white/10 mb-6" />

          <p className="font-label text-[10px] tracking-[0.2em] text-white/30 uppercase">
            © {new Date().getFullYear()} MagniKnot · All rights reserved
          </p>
        </div>
      </footer>

      <BagDrawer />
    </div>
  );
}

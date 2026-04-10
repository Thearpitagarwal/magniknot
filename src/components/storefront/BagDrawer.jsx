import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBag } from '../../context/BagContext';
import { X, MessageCircle } from 'lucide-react';
import { getSettings } from '../../services/api';
import { drawerSlide } from '../../utils/animations';

export default function BagDrawer() {
  const { bagItems, removeFromBag, isBagOpen, setIsBagOpen, clearBag } = useBag();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    getSettings().then(data => setWhatsappNumber(data?.whatsappNumber || ''));
  }, []);

  useEffect(() => {
    document.body.style.overflow = isBagOpen ? 'hidden' : 'auto';
  }, [isBagOpen]);

  const handleWhatsAppOrder = () => {
    if (!whatsappNumber) {
      alert("Store is not properly configured for orders yet.");
      return;
    }

    let message = `Hi MagniKnot! ✨ I'm interested in the following piece${bagItems.length > 1 ? 's' : ''}:\n\n`;
    bagItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name} - ₹${item.price}\n`;
    });
    message += `\nCould you please share availability and payment details? Thank you!`;

    clearBag();
    setIsBagOpen(false);

    setTimeout(() => {
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    }, 300);
  };

  const totalValue = bagItems.reduce((sum, item) => sum + Number(item.price), 0);

  return (
    <AnimatePresence>
      {isBagOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[90]" 
            onClick={() => setIsBagOpen(false)}
          />

          {/* Drawer */}
          <motion.div 
            initial={isMobile ? { y: "100%", x: 0 } : { x: "100%", y: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={isMobile ? { y: "100%", x: 0 } : { x: "100%", y: 0 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
            className="fixed bottom-0 md:top-0 right-0 h-[90vh] md:h-full w-full md:max-w-[360px] bg-white z-[100] flex flex-col font-body shadow-[0_-8px_30px_rgba(0,0,0,0.08)] md:shadow-[-8px_0_30px_rgba(0,0,0,0.08)] rounded-t-2xl md:rounded-none"
          >
            
            {/* Header */}
            <div className="p-6 border-b border-rose-100 flex justify-between items-center">
              <div>
                <h2 className="font-display font-semibold text-[24px] text-charcoal mb-0.5">Your Bag</h2>
                <p className="font-label text-[10px] tracking-[0.15em] text-warm-grey uppercase">
                  {bagItems.length} item{bagItems.length !== 1 ? 's' : ''} selected
                </p>
              </div>
              <button 
                onClick={() => setIsBagOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-warm-grey hover:text-charcoal hover:bg-rose-50 transition-colors"
                aria-label="Close bag"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {bagItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center pb-16">
                  <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-6">
                    <ShoppingBagIcon className="text-rose-300" />
                  </div>
                  <h3 className="font-display text-[22px] text-charcoal mb-2">Your bag is empty</h3>
                  <p className="font-body text-[16px] text-warm-grey mb-8">
                    Browse the collection and add pieces you love
                  </p>
                  <button 
                    onClick={() => setIsBagOpen(false)} 
                    className="font-label text-[11px] tracking-[0.15em] text-rose-500 hover:text-rose-600 transition-colors uppercase"
                  >
                    Explore Collection
                  </button>
                </div>
              ) : (
                bagItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex gap-4 group py-2">
                    <div className="w-[56px] h-[70px] bg-snow flex-shrink-0 rounded-lg overflow-hidden">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <h4 className="font-body text-[15px] text-charcoal line-clamp-2 leading-snug mb-0.5">{item.name}</h4>
                      <p className="price-tag text-[13px]">₹{item.price}</p>
                    </div>
                    <button 
                      onClick={() => removeFromBag(index)}
                      className="self-center p-1.5 text-warm-grey/40 hover:text-rose-500 transition-colors rounded-full hover:bg-rose-50"
                      aria-label="Remove item"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {bagItems.length > 0 && (
              <div className="p-6 border-t border-rose-100 bg-white">
                <div className="flex justify-between items-center mb-5">
                  <span className="font-label text-[11px] tracking-[0.15em] text-warm-grey uppercase">Estimated Total</span>
                  <span className="font-display font-semibold text-[22px] text-charcoal">₹{totalValue}</span>
                </div>

                <button 
                  onClick={handleWhatsAppOrder}
                  className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full font-label text-[11px] tracking-[0.15em] uppercase flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md mb-3"
                >
                  <MessageCircle size={16} fill="white" />
                  Order on WhatsApp
                </button>
                
                <p className="text-center font-body italic text-[14px] text-warm-grey leading-snug">
                  We'll confirm availability and share payment details securely
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ShoppingBagIcon(props) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
      <path d="M3 6h18"></path>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
  );
}

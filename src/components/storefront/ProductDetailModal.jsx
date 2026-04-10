import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';
import { useBag } from '../../context/BagContext';
import { getSettings } from '../../services/api';
import { modalSlide } from '../../utils/animations';

export default function ProductDetailModal({ product, onClose }) {
  const { addToBag } = useBag();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    getSettings().then(data => setWhatsappNumber(data?.whatsappNumber || ''));
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!product) return null;

  const images = product.images && product.images.length > 0 ? product.images : [null];
  const isOutOfStock = !product.active;

  const handleWhatsAppOrder = () => {
    if (!whatsappNumber) return;
    const message = `Hi MagniKnot! ✨ I'm interested in:\n1. ${product.name} - ₹${product.price}\nCould you share availability and payment details? Thank you!`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-0 md:p-6 lg:p-12"
        onClick={handleBackdropClick}
      >
        <motion.div 
          {...modalSlide}
          className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-[880px] md:rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative"
        >
          {/* Close */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-[60] w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-charcoal hover:text-rose-500 hover:bg-rose-50 transition-colors shadow-sm"
          >
            <X size={18} />
          </button>

          {/* Left: Image Gallery */}
          <div className="w-full md:w-[55%] flex flex-col bg-snow">
            <div className="aspect-[4/5] md:aspect-auto md:flex-1 relative bg-snow">
              {images[activeImageIndex] ? (
                <img 
                  src={images[activeImageIndex]} 
                  alt={product.name}
                  className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale' : ''}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-warm-grey font-label text-[11px] tracking-widest">NO IMAGE</div>
              )}
              
              {isOutOfStock && (
                <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[2px]">
                  <span className="bg-white px-5 py-2 text-[11px] font-label tracking-[0.15em] uppercase text-charcoal shadow-sm rounded-full">Out of Stock</span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="p-3 flex gap-2 overflow-x-auto bg-white border-t border-rose-50">
                {images.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-18 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx ? 'border-rose-400 shadow-sm' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="Thumbnail" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="w-full h-full md:h-auto md:w-[45%] p-6 md:p-8 lg:p-10 flex flex-col overflow-y-auto bg-white pb-[140px] md:pb-8 lg:pb-10">
            <div className="mb-8">
              <h2 className="font-display font-semibold text-[26px] md:text-[30px] text-charcoal leading-tight mb-3 pr-10">
                {product.name}
              </h2>
              <div className="flex items-center gap-4 mb-5">
                <span className="price-tag text-[18px]">₹{product.price}</span>
                {product.materialNote && (
                  <span className="material-tag">{product.materialNote}</span>
                )}
              </div>
              <p className="font-body text-[17px] text-warm-grey leading-relaxed">
                {product.description || "Every piece is thoughtfully curated - minimal, wearable, and made to be loved every day"}
              </p>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 md:p-0 bg-white/95 backdrop-blur-md border-t border-rose-100 md:relative md:bg-transparent md:border-none md:backdrop-blur-none md:mt-auto space-y-3 z-[70] shadow-[0_-8px_20px_rgba(0,0,0,0.04)] md:shadow-none">
              <button 
                onClick={() => { addToBag(product); onClose(); }}
                disabled={isOutOfStock}
                className="w-full min-h-[48px] md:py-4 bg-rose-500 text-white rounded-full font-label text-[12px] tracking-[0.15em] uppercase hover:bg-rose-600 transition-all duration-300 hover:shadow-[0_8px_25px_rgba(244,63,94,0.25)] disabled:opacity-50 disabled:hover:shadow-none"
              >
                Add to Bag
              </button>

              <button 
                onClick={handleWhatsAppOrder}
                disabled={isOutOfStock}
                className="w-full min-h-[48px] md:py-4 bg-white border border-[#25D366] text-[#25D366] rounded-full font-label text-[12px] tracking-[0.15em] uppercase flex justify-center items-center gap-2 hover:bg-[#25D366] hover:text-white transition-all duration-300 disabled:opacity-50"
              >
                <MessageCircle size={16} />
                Order on WhatsApp
              </button>

              <p className="text-center font-label text-[10px] tracking-[0.15em] text-warm-grey mt-2 uppercase hidden md:block">
                {isOutOfStock ? "Currently out of stock" : "Secure payment via WhatsApp"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { fadeInUp } from '../../utils/animations';

export default function ProductSection({ title, products, onClickProduct, className = '', showDivider = false }) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(products.length / itemsPerPage);

  // Pagination bounds checking
  const handleNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(prev => prev - 1);
  };

  // Slice the current page's products
  const currentProducts = products.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Animation variants
  const slideVariants = {
    initial: (direction) => ({
      opacity: 0,
      x: direction > 0 ? 10 : -10,
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    },
    exit: (direction) => ({
      opacity: 0,
      x: direction < 0 ? 10 : -10,
      transition: { duration: 0.3, ease: 'easeIn' }
    })
  };

  // Keep track of the direction of the turn for the animation if you want to implement it,
  // but a standard unified switch direction makes it simpler. Here we just set a fixed direction state.
  const [direction, setDirection] = useState(1);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    if (newDirection === 1) handleNext();
    else handlePrev();
  };

  if (products.length === 0) return null;

  return (
    <section className={`py-16 md:py-24 ${className}`}>
      {showDivider && (
        <div className="max-w-xs mx-auto mb-12">
          <div className="h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Title & Navigation Header */}
        <div className="flex items-end justify-between mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <h2 className="section-heading font-display text-h2 text-charcoal m-0 pb-1">
              {title}
            </h2>
          </motion.div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => paginate(-1)}
                disabled={currentPage === 0}
                aria-label="Previous page"
                className="w-[36px] h-[36px] flex items-center justify-center rounded-full border border-rose-200 text-charcoal hover:bg-rose-50 hover:border-rose-300 disabled:opacity-30 disabled:pointer-events-none transition-all duration-300"
              >
                <ChevronLeft size={18} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => paginate(1)}
                disabled={currentPage === totalPages - 1}
                aria-label="Next page"
                className="w-[36px] h-[36px] flex items-center justify-center rounded-full border border-rose-200 text-charcoal hover:bg-rose-50 hover:border-rose-300 disabled:opacity-30 disabled:pointer-events-none transition-all duration-300"
              >
                <ChevronRight size={18} strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>

        {/* Product Grid container using relative block to allow AnimatePresence clean transitions, or layout modes. We will just use layout animation on the grid or AnimatePresence. */}
        <motion.div 
          layout
          className="relative min-h-[400px]"
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentPage}
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6"
            >
              {currentProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} onClick={onClickProduct} />
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}

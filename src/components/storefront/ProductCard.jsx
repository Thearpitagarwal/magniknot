import { useState } from 'react';
import { useBag } from '../../context/BagContext';
import { ShoppingBag } from 'lucide-react';

export default function ProductCard({ product, onClick }) {
  const { addToBag } = useBag();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const primaryImage = product?.images?.[0] || '';
  const secondaryImage = product?.images?.[1] || primaryImage;
  const isOutOfStock = !product?.active;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    
    addToBag(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div 
      onClick={() => onClick(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden cursor-pointer card-hover h-full border border-rose-100/60"
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/5] bg-snow overflow-hidden rounded-t-2xl">
        {primaryImage ? (
          <>
            <img 
              src={primaryImage} 
              alt={product.name} 
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                isHovered && secondaryImage !== primaryImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
              } ${isOutOfStock ? 'grayscale' : ''}`}
            />
            {secondaryImage !== primaryImage && (
              <img 
                src={secondaryImage} 
                alt={`${product.name} Alternate`} 
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                  isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                } ${isOutOfStock ? 'grayscale' : ''}`}
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-warm-grey font-label text-[10px] tracking-widest">
            NO IMAGE
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-white px-4 py-2 text-[11px] font-label tracking-[0.15em] uppercase text-charcoal shadow-sm rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick Add button (desktop hover) */}
        <div className={`absolute bottom-3 left-3 right-3 transition-all duration-300 hidden lg:block ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          <button 
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`w-full min-h-[44px] py-2.5 rounded-xl font-label text-[11px] tracking-[0.1em] uppercase transition-all flex items-center justify-center gap-2 backdrop-blur-md ${
              isAdded 
                ? 'bg-green-500 text-white' 
                : 'bg-white/90 text-rose-500 hover:bg-rose-500 hover:text-white'
            }`}
          >
            {isAdded ? '✓ Added' : (
              <>
                <ShoppingBag size={14} />
                Add to Bag
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-body font-semibold text-[15px] md:text-[16px] text-charcoal line-clamp-2 mb-1.5 leading-snug">
          {product.name}
        </h3>
        {product.materialNote && (
          <p className="text-[10px] font-label uppercase tracking-[0.12em] text-warm-grey mb-2">{product.materialNote}</p>
        )}
        <div className="mt-auto flex items-center justify-between">
          <span className="price-tag">₹{product.price}</span>
        </div>
      </div>

      {/* Mobile always-visible Add button */}
      <div className="lg:hidden px-4 pb-4 mt-auto">
        <button 
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`w-full min-h-[44px] py-2.5 rounded-xl font-label text-[11px] tracking-[0.1em] uppercase transition-all flex items-center justify-center gap-2 ${
            isAdded 
              ? 'bg-green-500 text-white' 
              : 'bg-rose-50 text-rose-500 border border-rose-200 hover:bg-rose-500 hover:text-white hover:border-rose-500'
          }`}
        >
          {isAdded ? '✓ Added' : 'Add to Bag'}
        </button>
      </div>
    </div>
  );
}

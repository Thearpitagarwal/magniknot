import { useState } from 'react';
import { useBag } from '../../context/BagContext';
import { ShoppingBag } from 'lucide-react';
import { usePromotionsContext } from '../../context/PromotionsContext';

export default function ProductCard({ product, onClick }) {
  const { addToBag } = useBag();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const primaryImage = product?.images?.[0] || '';
  const secondaryImage = product?.images?.[1] || '';
  const hasHoverImage = !!secondaryImage && secondaryImage !== primaryImage;
  const isOutOfStock = product?.stock_status === 'out_of_stock';
  const isLowStock = product?.stock_status === 'low_stock';
  
  const promotions = usePromotionsContext();
  const badgeAccentColorMap = {
    rose: '#FB7185',
    rose_gold: '#B76E79',
    blush: '#FECDD3',
    charcoal: '#2D2D2D'
  };
  const badgeAccent = badgeAccentColorMap[promotions?.product_badge?.color] || '#FB7185';

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
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden cursor-pointer card-hover h-full border border-rose-100/60"
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/5] bg-snow overflow-hidden rounded-t-2xl">
        {primaryImage ? (
          <>
            <img 
              src={primaryImage} 
              alt={`${product.name} - MagniKnot Elegant Jewellery`} 
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${hasHoverImage ? 'lg:group-hover:opacity-0 lg:group-hover:scale-105' : 'lg:group-hover:scale-105'} opacity-100 scale-100`}
              style={{ filter: isOutOfStock ? 'grayscale(50%) brightness(0.75)' : 'none' }}
            />
            {hasHoverImage && (
              <img 
                src={secondaryImage} 
                alt={`${product.name} Alternate View`} 
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 lg:group-hover:opacity-100 lg:group-hover:scale-100 opacity-0 scale-105`}
                style={{ filter: isOutOfStock ? 'grayscale(50%) brightness(0.75)' : 'none' }}
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
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(45, 45, 45, 0.40)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: '10px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.6)',
              padding: '4px 14px',
              borderRadius: 0,
            }}>
              Sold Out
            </span>
          </div>
        )}

        {/* Low stock badge */}
        {isLowStock && (
          <div style={{
            position: 'absolute', top: '10px', left: '10px',
            background: '#B76E79',
            color: '#FFFFFF',
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: '8px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            padding: '3px 8px',
            borderRadius: 0,
            zIndex: 2,
          }}>
            Last few left
          </div>
        )}

        {/* Product badge label */}
        {product.badge_label && !isOutOfStock && !isLowStock && (
          <div style={{
            position: 'absolute', top: '10px', left: '10px',
            background: badgeAccent,
            color: badgeAccent === '#FECDD3' ? '#2D2D2D' : '#FFFFFF',
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: '9px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            padding: '3px 8px',
            borderRadius: 0,
            zIndex: 2,
            pointerEvents: 'none',
          }}>
            {product.badge_label}
          </div>
        )}

        {/* Quick Add button (desktop hover) */}
        <div className="absolute bottom-3 left-3 right-3 transition-all duration-300 hidden lg:block opacity-0 translate-y-2 lg:group-hover:opacity-100 lg:group-hover:translate-y-0">
          {isOutOfStock ? (
            <button 
              disabled
              className="w-full min-h-[44px] py-2.5 rounded-xl font-label text-[11px] tracking-[0.3em] uppercase cursor-not-allowed"
              style={{
                background: 'linear-gradient(90deg, var(--light-grey), #C0C0C0)',
                color: 'var(--warm-grey)',
                border: 'none',
              }}
            >
              Sold Out
            </button>
          ) : (
            <button 
              onClick={handleAdd}
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
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-body font-semibold text-[15px] md:text-[16px] line-clamp-2 mb-1.5 leading-snug" style={{ color: isOutOfStock ? 'var(--warm-grey)' : 'var(--charcoal)' }}>
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
        {isOutOfStock ? (
          <button 
            disabled
            className="w-full min-h-[44px] py-2.5 rounded-xl font-label text-[11px] tracking-[0.3em] uppercase cursor-not-allowed"
            style={{
              background: 'linear-gradient(90deg, var(--light-grey), #C0C0C0)',
              color: 'var(--warm-grey)',
              border: 'none',
            }}
          >
            Sold Out
          </button>
        ) : (
          <button 
            onClick={handleAdd}
            className={`w-full min-h-[44px] py-2.5 rounded-xl font-label text-[11px] tracking-[0.1em] uppercase transition-all flex items-center justify-center gap-2 ${
              isAdded 
                ? 'bg-green-500 text-white' 
                : 'bg-rose-50 text-rose-500 border border-rose-200 hover:bg-rose-500 hover:text-white hover:border-rose-500'
            }`}
          >
            {isAdded ? '✓ Added' : 'Add to Bag'}
          </button>
        )}
      </div>
    </div>
  );
}

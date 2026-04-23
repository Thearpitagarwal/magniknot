import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { usePromotionsContext } from '../../context/PromotionsContext';

export default function PromotionsPage() {
  const promotionsContext = usePromotionsContext();
  // Ensure we have an object to iterate over, fallback to empty object if context is missing/loading
  const promotions = promotionsContext || {};
  const [saving, setSaving] = useState(false);

  const promotionColorMap = [
    { value: 'rose', label: 'Rose' },
    { value: 'rose_gold', label: 'Rose Gold' },
    { value: 'blush', label: 'Blush' },
    { value: 'charcoal', label: 'Charcoal' }
  ];

  const updatePromotion = async (type, updates) => {
    setSaving(true);
    try {
      await supabase
        .from('promotions')
        .update(updates)
        .eq('type', type);
    } catch (err) {
      console.error('Failed to update promotion', err);
    }
    setSaving(false);
  };

  const shippingBanner = promotions['shipping_banner'] || { active: false, text: 'Free shipping on orders above ₹{value}', value: 499, color: 'rose' };
  const announcementBar = promotions['announcement_bar'] || { active: false, text: '', color: 'rose_gold' };
  const productBadge = promotions['product_badge'] || { active: false, color: 'rose' };

  const inputCls = "w-full border border-rose-200 bg-white px-3 py-2 text-charcoal focus:outline-none focus:border-rose-400";
  const inputStyle = { borderRadius: 0, fontFamily: "'Josefin Sans', sans-serif", fontSize: '13px' };

  return (
    <div className="font-body">
      <div className="mb-8">
        <h2 className="font-display font-semibold text-[24px] text-charcoal mb-0.5">Promotions</h2>
        <p className="font-label text-[10px] tracking-[0.15em] text-warm-grey uppercase">Manage site-wide banners and badges</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Shipping Banner Card */}
        <div className="bg-white border border-rose-100 p-6 flex flex-col h-full" style={{ borderRadius: 0 }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-semibold text-[18px] text-charcoal">Shipping Banner</h3>
            <button 
              onClick={() => updatePromotion('shipping_banner', { active: !shippingBanner.active })}
              className={`font-label text-[10px] tracking-[0.1em] uppercase px-3 py-1 rounded-full border transition-colors ${
                shippingBanner.active ? 'border-rose-400 text-rose-500 bg-rose-50' : 'border-warm-grey text-warm-grey'
              }`}
            >
              {shippingBanner.active ? 'Active ●' : 'Inactive ○'}
            </button>
          </div>
          
          <div className="space-y-4 flex-1">
            <div>
              <label className="block font-label text-[10px] tracking-[0.15em] text-warm-grey mb-1.5 uppercase">Text</label>
              <input 
                type="text" 
                value={shippingBanner.text}
                onChange={(e) => updatePromotion('shipping_banner', { text: e.target.value })}
                className={inputCls} style={inputStyle} 
              />
            </div>
            <div>
              <label className="block font-label text-[10px] tracking-[0.15em] text-warm-grey mb-1.5 uppercase">Threshold (₹)</label>
              <input 
                type="number" 
                value={shippingBanner.value || ''}
                onChange={(e) => updatePromotion('shipping_banner', { value: Number(e.target.value) })}
                className={inputCls} style={inputStyle} 
              />
            </div>
            <div>
              <label className="block font-label text-[10px] tracking-[0.15em] text-warm-grey mb-1.5 uppercase">Colour</label>
              <select 
                value={shippingBanner.color}
                onChange={(e) => updatePromotion('shipping_banner', { color: e.target.value })}
                className={inputCls} style={inputStyle}
              >
                {promotionColorMap.map(c => <option key={c.value} value={c.value}>● {c.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Announcement Bar Card */}
        <div className="bg-white border border-rose-100 p-6 flex flex-col h-full" style={{ borderRadius: 0 }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-semibold text-[18px] text-charcoal">Announcement Bar</h3>
            <button 
              onClick={() => updatePromotion('announcement_bar', { active: !announcementBar.active })}
              className={`font-label text-[10px] tracking-[0.1em] uppercase px-3 py-1 rounded-full border transition-colors ${
                announcementBar.active ? 'border-rose-400 text-rose-500 bg-rose-50' : 'border-warm-grey text-warm-grey'
              }`}
            >
              {announcementBar.active ? 'Active ●' : 'Inactive ○'}
            </button>
          </div>
          
          <div className="space-y-4 flex-1">
            <div>
              <label className="block font-label text-[10px] tracking-[0.15em] text-warm-grey mb-1.5 uppercase">Text</label>
              <input 
                type="text" 
                value={announcementBar.text}
                onChange={(e) => updatePromotion('announcement_bar', { text: e.target.value })}
                className={inputCls} style={inputStyle} 
              />
            </div>
            <div>
              <label className="block font-label text-[10px] tracking-[0.15em] text-warm-grey mb-1.5 uppercase">Colour</label>
              <select 
                value={announcementBar.color}
                onChange={(e) => updatePromotion('announcement_bar', { color: e.target.value })}
                className={inputCls} style={inputStyle}
              >
                {promotionColorMap.map(c => <option key={c.value} value={c.value}>● {c.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Product Badge Labels Card */}
        <div className="bg-white border border-rose-100 p-6 flex flex-col h-full" style={{ borderRadius: 0 }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-semibold text-[18px] text-charcoal">Product Badge Labels</h3>
            <button 
              onClick={() => updatePromotion('product_badge', { active: !productBadge.active })}
              className={`font-label text-[10px] tracking-[0.1em] uppercase px-3 py-1 rounded-full border transition-colors ${
                productBadge.active ? 'border-rose-400 text-rose-500 bg-rose-50' : 'border-warm-grey text-warm-grey'
              }`}
            >
              {productBadge.active ? 'Active ●' : 'Inactive ○'}
            </button>
          </div>
          
          <div className="space-y-4 flex-1">
            <div>
              <label className="block font-label text-[10px] tracking-[0.15em] text-warm-grey mb-1.5 uppercase">Badge Colour</label>
              <select 
                value={productBadge.color}
                onChange={(e) => updatePromotion('product_badge', { color: e.target.value })}
                className={inputCls} style={inputStyle}
              >
                {promotionColorMap.map(c => <option key={c.value} value={c.value}>● {c.label}</option>)}
              </select>
            </div>
            <p className="font-label text-[11px] text-warm-grey mt-4 leading-relaxed uppercase tracking-wider">
              Note: Set individual badge text per product in the Products section.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

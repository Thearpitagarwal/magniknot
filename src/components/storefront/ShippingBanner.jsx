import React from 'react';

const accentColorMap = {
  rose:      '#FB7185',
  rose_gold: '#B76E79',
  blush:     '#FECDD3',
  charcoal:  '#2D2D2D',
};

export default function ShippingBanner({ promotion, bagTotal }) {
  if (!promotion?.active) return null;

  const threshold = Number(promotion.value) || 0;
  const progress  = Math.min(100, (bagTotal / threshold) * 100);
  const remaining = Math.max(0, threshold - bagTotal);
  const accent    = accentColorMap[promotion.color] || '#FB7185';

  const displayText = promotion.text.replace('{value}', threshold);

  return (
    <div style={{
      padding: '10px 14px',
      border: '1px solid #FECDD3',
      background: '#FFF1F2',
      marginBottom: '12px',
      borderRadius: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: accent, fontSize: '16px', flexShrink: 0 }}>ⓘ</span>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '14px',
          color: '#2D2D2D',
          lineHeight: 1.4,
        }}>
          {bagTotal >= threshold
            ? '🎉 You qualify for free shipping!'
            : `Add ₹${remaining} more for free shipping`}
        </span>
      </div>

      <div style={{
        marginTop: '8px',
        height: '2px',
        background: '#FECDD3',
        borderRadius: 0,
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: accent,
          transition: 'width 400ms ease',
        }} />
      </div>
    </div>
  );
}

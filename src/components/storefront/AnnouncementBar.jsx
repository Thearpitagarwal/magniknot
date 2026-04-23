import React, { useState } from 'react';

const barBgMap = {
  rose:      '#FB7185',
  rose_gold: '#B76E79',
  blush:     '#FECDD3',
  charcoal:  '#2D2D2D',
};

const barTextMap = {
  rose:      '#FFFFFF',
  rose_gold: '#FFFFFF',
  blush:     '#2D2D2D',
  charcoal:  '#FFF9F5',
};

export default function AnnouncementBar({ promotion, onDismissChange }) {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('mk_bar_dismissed') === 'true'
  );

  // Notify parent if it should offset navbar
  React.useEffect(() => {
    if (onDismissChange) {
      onDismissChange(dismissed);
    }
  }, [dismissed, onDismissChange]);

  if (!promotion?.active || dismissed) return null;

  const bg   = barBgMap[promotion.color]   || '#B76E79';
  const text = barTextMap[promotion.color] || '#FFFFFF';

  const handleDismiss = () => {
    sessionStorage.setItem('mk_bar_dismissed', 'true');
    setDismissed(true);
  };

  return (
    <div style={{ background: bg, height: '36px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  position: 'relative', zIndex: 60 }}>
      <span style={{
        fontFamily: "'Josefin Sans', sans-serif",
        fontSize: '11px',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: text,
      }}>
        {promotion.text}
      </span>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        style={{
          position: 'absolute', right: '16px',
          background: 'transparent', border: 'none',
          color: `${text}B3`,
          cursor: 'pointer',
          fontSize: '16px',
          minWidth: '44px', minHeight: '44px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        ×
      </button>
    </div>
  );
}

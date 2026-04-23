import React, { createContext, useContext } from 'react';
import { usePromotions as usePromotionsHook } from '../hooks/usePromotions';

const PromotionsContext = createContext({
  shipping_banner: null,
  announcement_bar: null,
  product_badge: null,
});

export function PromotionsProvider({ children }) {
  const promotions = usePromotionsHook();
  return (
    <PromotionsContext.Provider value={promotions}>
      {children}
    </PromotionsContext.Provider>
  );
}

export function usePromotionsContext() {
  return useContext(PromotionsContext);
}

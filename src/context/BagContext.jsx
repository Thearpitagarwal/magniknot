import { createContext, useContext, useState, useEffect } from 'react';

const BagContext = createContext();

export function BagProvider({ children }) {
  const [bagItems, setBagItems] = useState(() => {
    const localData = localStorage.getItem('magniknot_bag');
    return localData ? JSON.parse(localData) : [];
  });
  
  const [isBagOpen, setIsBagOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('magniknot_bag', JSON.stringify(bagItems));
  }, [bagItems]);

  const addToBag = (product) => {
    if (bagItems.length >= 20) {
      alert("You have reached the maximum limit of 20 items in your bag.");
      return;
    }
    setBagItems(prev => [...prev, product]);
    // Optional: automatically open bag on add, PRD says: "brief animation, bag count increments"
    // Opening it might interrupt flow, let's keep it closed or briefly flash it.
  };

  const removeFromBag = (indexToRemove) => {
    setBagItems(prev => prev.filter((_, i) => i !== indexToRemove));
  };
  
  const clearBag = () => {
    setBagItems([]);
  };

  return (
    <BagContext.Provider value={{ 
      bagItems, 
      addToBag, 
      removeFromBag, 
      clearBag, 
      isBagOpen, 
      setIsBagOpen 
    }}>
      {children}
    </BagContext.Provider>
  );
}

export const useBag = () => useContext(BagContext);

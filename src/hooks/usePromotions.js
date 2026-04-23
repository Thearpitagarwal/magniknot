import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const usePromotions = () => {
  const [promotions, setPromotions] = useState({
    shipping_banner:   null,
    announcement_bar:  null,
    product_badge:     null,
  });

  useEffect(() => {
    const fetchPromotions = async () => {
      const { data } = await supabase
        .from('promotions')
        .select('*');

      if (data) {
        const mapped = {};
        data.forEach(p => { mapped[p.type] = p; });
        setPromotions(mapped);
      }
    };

    fetchPromotions();

    const channel = supabase
      .channel('promotions-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'promotions' },
        (payload) => {
          setPromotions(prev => ({
            ...prev,
            [payload.new.type]: payload.new,
          }));
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return promotions;
};

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getProducts, getCategories, getSettings } from '../services/api';

import ProductCard from '../components/storefront/ProductCard';
import ProductDetailModal from '../components/storefront/ProductDetailModal';
import React, { Suspense } from 'react';
import { fadeInUp, staggerContainer } from '../utils/animations';

const HeroScrollSection = React.lazy(() => import('../components/HeroScrollSection'));

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({ 
    brandTagline: 'Where love sticks forever', 
    featuredSectionLabel: 'Just Dropped',
    instagramHandle: '' 
  });
  
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    // Safety fallback: force UI to reveal after 2.5s if local Supabase network hangs
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 2500);

    const fetchData = async () => {
      try {
        const [prodRes, catRes, setRes] = await Promise.all([
          getProducts(),
          getCategories(),
          getSettings()
        ]);
        
        setProducts(prodRes.filter(p => p.active));
        setCategories(catRes.filter(c => c.active).sort((a, b) => a.order - b.order));
        if (setRes) setSettings(setRes);
        
      } catch (err) {
        console.error("Failed to fetch storefront data", err);
      } finally {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    };
    fetchData();
    
    return () => clearTimeout(timeoutId);
  }, []);

  // ── Seamless Pre-React Loader Dismissal ──
  useEffect(() => {
    if (!loading) {
      // Use requestAnimationFrame to ensure React has painted the real DOM 
      // now that loading=false and the lists are populated.
      requestAnimationFrame(() => {
        const root = document.getElementById('root');
        const loader = document.getElementById('site-loader');
        
        if (root) {
          root.style.opacity = '1';
        }
        
        if (loader) {
          loader.style.opacity = '0';
          setTimeout(() => loader.remove(), 600);
        }
      });
    }
  }, [loading]);

  const featuredProducts = products.filter(p => p.featured).slice(0, 8);

  return (
    <div className="font-body bg-white w-full">
      
      {/* ════════ HERO — Scrollytelling Canvas ════════ */}
      <Suspense fallback={<div className="w-full h-screen bg-[#F9F3EE]" />}>
        <HeroScrollSection />
      </Suspense>

      {/* ════════ CATALOGUE CONTAINER ════════ */}
      <div className="w-full bg-white">

        {/* ── Featured Section ── */}
        {featuredProducts.length > 0 && (
          <section id="featured-section" className="bg-white py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-6 md:px-10">
              <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-80px" }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp} className="mb-10">
                  <h2 className="section-heading font-display text-h2 text-charcoal">
                    {settings.featuredSectionLabel}
                  </h2>
                </motion.div>
                
                <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
                  {featuredProducts.map((prod) => (
                    <ProductCard key={prod.id} product={prod} onClick={setSelectedProduct} />
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </section>
        )}

        {/* ── Category Sections ── */}
        {categories.map((cat, index) => {
          const catProducts = products.filter(p => p.categoryId === cat.id);
          if (catProducts.length === 0) return null;
          
          return (
            <section 
              key={cat.id} 
              className={`py-16 md:py-24 ${index % 2 !== 0 ? 'bg-snow' : 'bg-white'}`}
            >
              {/* Subtle divider */}
              <div className="max-w-xs mx-auto mb-12">
                <div className="h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
              </div>
              
              <div className="max-w-7xl mx-auto px-6 md:px-10">
                <motion.div
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true, margin: "-80px" }}
                  variants={staggerContainer}
                >
                  <motion.div variants={fadeInUp} className="mb-10">
                    <h2 className="section-heading font-display text-h2 text-charcoal">
                      {cat.name}
                    </h2>
                  </motion.div>
                  
                  <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
                    {catProducts.map((prod) => (
                      <ProductCard key={prod.id} product={prod} onClick={setSelectedProduct} />
                    ))}
                  </motion.div>
                </motion.div>
              </div>
            </section>
          );
        })}

        {/* ── Brand Story ── */}
        <section className="bg-rose-50 py-20 md:py-28 px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-8 h-px bg-rose-300" />
              <span className="font-label text-[10px] tracking-[0.3em] text-rose-400 uppercase">Our Story</span>
              <div className="w-8 h-px bg-rose-300" />
            </div>

            <h2 className="font-display italic text-[28px] md:text-[36px] text-charcoal mb-8 leading-snug">
              Born from the belief that beautiful things shouldn't cost a fortune
            </h2>
            <p className="font-body text-[18px] md:text-[20px] text-graphite/70 leading-relaxed mb-10">
              Every piece is thoughtfully curated - minimal, wearable, and made to be loved every day This is jewellery that feels personal, because it is
            </p>
            <a
              href={`https://instagram.com/${settings.instagramHandle || 'magniknot'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-rose-500 px-8 py-3 rounded-full font-label text-[11px] tracking-[0.2em] uppercase hover:bg-rose-500 hover:text-white transition-all duration-300 border border-rose-200 hover:border-rose-500"
            >
              Follow @{settings.instagramHandle || 'magniknot'}
            </a>
          </motion.div>
        </section>

      </div>

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}

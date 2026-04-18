import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getProducts, getCategories, getSettings } from '../services/api';

import ProductCard from '../components/storefront/ProductCard';
import ProductDetailModal from '../components/storefront/ProductDetailModal';
import ProductSection from '../components/storefront/ProductSection';
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
  const [imagesReady, setImagesReady] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
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
      }
    };
    fetchData();
  }, []);

  // ── Seamless Pre-React Loader Dismissal ──
  useEffect(() => {
    if (!loading && imagesReady) {
      // Use requestAnimationFrame to ensure React has painted the real DOM 
      // now that components are fully hydrated and Hero has initialized
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
  }, [loading, imagesReady]);

  const featuredProducts = products.filter(p => p.featured);

  return (
    <div className="font-body bg-white w-full">
      
      {/* ════════ HERO — Scrollytelling Canvas ════════ */}
      <Suspense fallback={<div className="w-full h-screen bg-[#F9F3EE]" />}>
        <HeroScrollSection onLoadComplete={() => setImagesReady(true)} />
      </Suspense>

      {/* ════════ CATALOGUE CONTAINER ════════ */}
      <div className="w-full bg-white">

        {/* ── Featured Section ── */}
        <ProductSection 
          title={settings.featuredSectionLabel} 
          products={featuredProducts} 
          onClickProduct={setSelectedProduct} 
          className="bg-white"
        />

        {/* ── Category Sections ── */}
        {categories.map((cat, index) => (
          <ProductSection 
            key={cat.id} 
            title={cat.name} 
            products={products.filter(p => p.categoryId === cat.id)} 
            onClickProduct={setSelectedProduct}
            className={index % 2 !== 0 ? 'bg-snow' : 'bg-white'}
            showDivider={true}
          />
        ))}

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

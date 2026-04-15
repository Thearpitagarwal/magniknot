# MagniKnot

A modern jewellery storefront built using React (Vite) and Supabase, focused on performance, clean UI architecture, and seamless in-page interactions.

## 📌 Overview
MagniKnot is a single-page application (SPA) designed to deliver a smooth and responsive product browsing experience without page reloads.

**Key goals:**
* Fast rendering and optimized asset delivery
* Consistent UI/UX across devices
* Scalable product and media management
* Minimal, high-performance frontend architecture

## 🚀 Features

### 1. In-Section Pagination
* Displays 8 products per view
* Navigation via left/right controls
* No routing or page reloads
* Smooth transitions (fade + slight shift)

### 2. Product Interaction (Mobile + Desktop)
* Tap/click-based interaction (no hover dependency)
* Product details accessible via:
    * Modal OR expandable card
* Fully responsive behavior across devices

### 3. Performance Optimization
* Lazy loading for:
    * Images
    * Heavy components (e.g. 3D section)
* WebP image format (reduced size)
* Preloading of critical assets
* Lightweight animations

### 4. Custom Loading System
* Loader injected in `index.html`
* Controlled removal after app readiness
* Prevents blank screen during load

### 5. Supabase Integration
* Product data stored in Supabase database
* Images stored in Supabase Storage
* Public URLs used for rendering assets

### 6. UI Enhancements
* Custom hero section with controlled typography
* Scroll indicator with smooth animation
* Magnet-based micro interaction
* Minimal, consistent design system

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React (Vite) |
| **Styling** | Tailwind CSS |
| **Backend** | Supabase |
| **Storage** | Supabase Storage |
| **Deployment** | Vercel |

## 📁 Project Structure
```text
src/
├── components/
│   ├── HeroSection.jsx
│   ├── ProductSection.jsx
│   ├── ProductCard.jsx
│   ├── Loader.jsx
│
├── pages/
├── utils/
├── assets/
├── styles/
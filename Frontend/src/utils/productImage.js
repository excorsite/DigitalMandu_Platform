import { assets } from "../assets/assets";
import headerImg from "../assets/header_img.png";
import foodFallback from "../assets/food_1.png";

// Map of food images for fallback cycling
const fallbackImages = Object.values(assets).filter(v => typeof v === 'string' && v.includes('food_')).length
  ? null : foodFallback;

const FOOD_IMAGES = [];
for (let i = 1; i <= 32; i++) {
  try { FOOD_IMAGES.push(new URL(`../assets/food_${i}.png`, import.meta.url).href); } catch { /* ignore */ }
}

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/api\/?$/, '');

export function getProductImage(product, index = 0) {
  let raw = product?.productImage || product?.image || product?.imageUrl || "";
  if (typeof raw !== 'string') raw = String(raw || '');
  raw = raw.trim();
  if (!raw || raw.includes('spotify.com') || raw === 'draft') raw = '';
  if (raw) {
    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) return raw;
    if (raw.startsWith('/uploads') || raw.startsWith('uploads/')) {
      const path = raw.startsWith('/') ? raw : `/${raw}`;
      return `${API_ORIGIN}${path}`;
    }
    if (raw.startsWith('/')) return `${API_ORIGIN}${raw}`;
    // backend may store just filename like "abc.jpg"
    if (/\.(png|jpg|jpeg|webp|gif)$/i.test(raw)) return `${API_ORIGIN}/${raw.replace(/^\//,'')}`;
    // if raw is a valid path-like string, return as-is (will fallback on error)
    if (raw.length > 5) return raw;
  }
  // only fallback when no real image exists — not hardcoded per product, just graceful placeholder
  const hash = String(product?._id || index).split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  return FOOD_IMAGES[hash % FOOD_IMAGES.length] || headerImg;
}

export function handleImgError(e, fallbackIndex = 0) {
  const hash = fallbackIndex % FOOD_IMAGES.length;
  e.currentTarget.src = FOOD_IMAGES[hash] || headerImg;
  e.currentTarget.onerror = null;
}

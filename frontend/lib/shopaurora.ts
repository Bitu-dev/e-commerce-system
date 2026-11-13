export type Product = { id: string; name: string; category: string; description: string; price: number; stockQuantity: number; active: boolean; image: string; badge?: string }
export type CartItem = Product & { quantity: number }

export const products: Product[] = [
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', category: 'Smartphones', description: 'Titanium design. A17 Pro chip. Pro camera system.', price: 4199, stockQuantity: 12, active: true, image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=900&q=85', badge: 'Best seller' },
  { id: 'galaxy-s24', name: 'Samsung Galaxy S24 Ultra', category: 'Smartphones', description: 'Galaxy AI. S Pen precision. Titanium frame.', price: 3699, stockQuantity: 9, active: true, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85' },
  { id: 'macbook-air-m2', name: 'MacBook Air M2 13”', category: 'Laptops', description: 'Supercharged by the M2 chip. Thin, light, capable.', price: 3199, stockQuantity: 7, active: true, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85', badge: 'New' },
  { id: 'sony-wh1000xm5', name: 'Sony WH-1000XM5', category: 'Audio', description: 'Industry-leading noise cancellation and all-day comfort.', price: 1299, stockQuantity: 18, active: true, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=85' },
  { id: 'apple-watch-9', name: 'Apple Watch Series 9', category: 'Smart Home', description: 'Powerful. Personal. Advanced health insights.', price: 1599, stockQuantity: 5, active: true, image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=900&q=85' },
  { id: 'ps5-slim', name: 'PlayStation 5 Slim', category: 'Gaming', description: 'Experience lightning-fast loading and immersive play.', price: 2299, stockQuantity: 4, active: true, image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=85' },
  { id: 'ipad-pro', name: 'iPad Pro 11” M4', category: 'Tablets', description: 'Unbelievably thin. Outrageously powerful.', price: 2899, stockQuantity: 6, active: true, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=85' },
  { id: 'bose-quiet', name: 'Bose QuietComfort Ultra', category: 'Audio', description: 'Immersive spatial audio with premium comfort.', price: 1099, stockQuantity: 11, active: true, image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=85' },
]

export const categories = [
  { name: 'Smartphones', image: products[0].image, count: 24 }, { name: 'Laptops', image: products[2].image, count: 18 }, { name: 'Audio', image: products[3].image, count: 16 }, { name: 'Gaming', image: products[5].image, count: 12 }, { name: 'Accessories', image: products[4].image, count: 31 }, { name: 'Smart Home', image: products[4].image, count: 14 },
]

export const money = (value: number) => `ETB ${value.toLocaleString('en-US')}`

export const getStoredCart = (): CartItem[] => { if (typeof window === 'undefined') return []; try { return JSON.parse(localStorage.getItem('shopaurora-cart') || '[]') } catch { return [] } }
export const saveCart = (cart: CartItem[]) => { if (typeof window !== 'undefined') localStorage.setItem('shopaurora-cart', JSON.stringify(cart)) }
export const getProduct = (id: string) => products.find((product) => product.id === id)

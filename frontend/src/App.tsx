import { ChatWidget } from './components/ChatWidget';
import { SparkleIcon } from './components/icons';

const PRODUCTS = [
  {
    name: 'Linen Throw Pillow',
    price: '$38',
    emoji: '🛋️',
    tag: 'Bestseller',
    img: 'https://masilo.in/cdn/shop/products/Panda_Linen.jpg?v=1594106838',
  },
  {
    name: 'Stoneware Mug Set',
    price: '$44',
    emoji: '☕',
    tag: 'New',
    img: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcR4bNMRN1vhKK3EeMs1bulMFvLM2KmWb1UXU3K-LJ353hEShFqCqSG7GEtaifqHhe9WkM41rbmCZLpxbkeRXTO4r6mRriLjPe2D7AJE8933aIFIJUpZ4pad&usqp=CAc',
  },
  {
    name: 'Soy Candle — Cedar',
    price: '$26',
    emoji: '🕯️',
    tag: '',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqSgW2RuPcTQ8D1m-MZIl6hAE6j9qOPYR1OQ&s',
  },
  {
    name: 'Woven Storage Basket',
    price: '$52',
    emoji: '🧺',
    tag: '',
    img: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRXLY6rECmZrzO1g9iT6svKZGiZO8JVy4G-9EFwzS15n830GEolN7PtOeaVPrfxiuNoL1ZvfZDPwcPeSfRj3y-n4Ca2u3R8aDBkf_v6t74&usqp=CAc',
  },
  {
    name: 'Ceramic Vase',
    price: '$34',
    emoji: '🏺',
    tag: 'New',
    img: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSdOPTvhxr8-OuoeTbBExEF94PK-_X8BaSZg11-Fnof_tGXZK6mvTTLPLYyV7PqaPnYlycu2xy46SoioSkEEXx0YqK2kcLGW8s8a15R9V7rdSsM5aFKFcVy&usqp=CAc',
  },
  {
    name: 'Wool Throw Blanket',
    price: '$78',
    emoji: '🧶',
    tag: 'Bestseller',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUbJsFUjLdk--9vgoaqBnKO_AKJWY1Exq2QA&s',
  },
];

export default function App() {
  return (
    <div className="min-h-full bg-gradient-to-b from-brand-50 via-white to-white text-slate-800">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <SparkleIcon className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">Aura Living</span>
          </div>
          <nav className="hidden gap-7 text-sm font-medium text-slate-500 sm:flex">
            <a className="transition hover:text-brand-700" href="#shop">Shop</a>
            <a className="transition hover:text-brand-700" href="#about">About</a>
            <a className="transition hover:text-brand-700" href="#support">Support</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 pb-12 pt-16 text-center sm:pt-24">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          <SparkleIcon className="h-3.5 w-3.5" /> Now with 24/7 AI support
        </span>
        <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Thoughtfully made things for a <span className="text-brand-600">calmer home</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-500">
          Soft furnishings, ceramics, and everyday objects — designed to last. Free US shipping on
          orders over $50.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <a
            href="#shop"
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Shop the collection
          </a>
          <span className="text-sm text-slate-400">
            Questions? Tap the chat in the corner →
          </span>
        </div>
      </section>

      {/* Product grid */}
      <section id="shop" className="mx-auto max-w-5xl px-5 pb-24">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {PRODUCTS.map((p) => (
            <div
              key={p.name}
              className="group rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-50 to-slate-100 text-5xl">
                <img
                  src={p.img}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fall back to the emoji if the remote image fails to load.
                    const el = e.currentTarget;
                    el.style.display = 'none';
                    el.parentElement?.insertAdjacentText('afterbegin', p.emoji);
                  }}
                />
                {p.tag && (
                  <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[0.65rem] font-semibold text-brand-700 shadow-sm">
                    {p.tag}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-700">{p.name}</h3>
                <span className="text-sm font-semibold text-slate-900">{p.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="support" className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-5xl px-5 py-10 text-sm text-slate-500">
          <p className="font-semibold text-slate-700">Aura Living</p>
          <p className="mt-1">Austin, TX · Support: Mon–Fri 9 AM–6 PM ET · support@aura-living.example</p>
          <p className="mt-4 text-xs text-slate-400">
            Demo storefront for the Spur AI Live Chat take-home. Not a real store.
          </p>
        </div>
      </footer>

      {/* The live-chat widget */}
      <ChatWidget />
    </div>
  );
}

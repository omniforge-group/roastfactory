'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 40); }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? 'bg-black/95 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl">
            <Image src="/logo.png" alt="RoastFactory" fill className="object-contain" priority />
          </div>
          <span className="font-bebas text-2xl tracking-widest text-white">RoastFactory</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#wie-ga-je-slopen" className="text-sm font-medium text-white/50 transition-colors hover:text-white">
            Use cases
          </a>
          <a href="#hoe-werkt-het" className="text-sm font-medium text-white/50 transition-colors hover:text-white">
            Hoe het werkt
          </a>
          <a href="#pakketten" className="text-sm font-medium text-white/50 transition-colors hover:text-white">
            Pakketten
          </a>
          <a href="#faq" className="text-sm font-medium text-white/50 transition-colors hover:text-white">
            FAQ
          </a>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/bestellen"
            className="animate-pulse-red inline-flex items-center justify-center rounded-full bg-[#FF2D2D] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#E02020]"
          >
            Maak je roast
          </Link>

          {/* Mobile hamburger */}
          <button
            className="flex flex-col gap-1.5 md:hidden"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menu"
          >
            <span className={`block h-0.5 w-6 bg-white transition-transform ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-6 bg-white transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-white transition-transform ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-black px-6 pb-6 pt-4 md:hidden">
          {[
            { href: '#wie-ga-je-slopen', label: 'Use cases' },
            { href: '#hoe-werkt-het', label: 'Hoe het werkt' },
            { href: '#pakketten', label: 'Pakketten' },
            { href: '#faq', label: 'FAQ' },
          ].map(item => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-base font-medium text-white/70 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

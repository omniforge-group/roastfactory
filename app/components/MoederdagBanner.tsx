'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const slides = [
  {
    image: '/images/moederdag/slide1.jpg',
    headline: 'Geef haar een lied dat ze nooit vergeet',
    cta: 'Bestel nu',
    href: '/bestellen',
  },
  {
    image: '/images/moederdag/slide2.jpg',
    headline: 'Persoonlijk, uniek, rechtstreeks uit het hart',
    cta: 'Bekijk de mogelijkheden',
    href: '/bestellen',
  },
  {
    image: '/images/moederdag/slide3.jpg',
    headline: '25% korting met code MOEDERDAG2026',
    cta: 'Profiteer nu',
    href: '/bestellen',
  },
  {
    image: '/images/moederdag/slide4.jpg',
    headline: 'Op tijd bestellen = op tijd geleverd ❤️',
    cta: 'Start je bestelling',
    href: '/bestellen',
  },
];

const previews = [
  { src: '/audio/moederdag/voorbeeld1.mp3', title: 'Rustig & Intiem', tag: 'Ballad • Intiem' },
  { src: '/audio/moederdag/voorbeeld2.mp3', title: 'Vrolijk & Luchtig', tag: 'Pop • Vrolijk' },
  { src: '/audio/moederdag/voorbeeld3.mp3', title: 'Emotioneel & Filmisch', tag: 'Ballad • Emotioneel' },
];

const TARGET_DATE = new Date('2026-05-10T00:00:00');

function getTimeLeft() {
  const diff = TARGET_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export default function MoederdagBanner() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [copied, setCopied] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState([0, 0, 0]);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([null, null, null]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setVisible(true);
      }, 600);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    if (index === current) return;
    setVisible(false);
    setTimeout(() => {
      setCurrent(index);
      setVisible(true);
    }, 300);
  };

  const togglePlay = (index: number) => {
    const audio = audioRefs.current[index];
    if (!audio) return;

    if (playingIndex === index) {
      audio.pause();
      setPlayingIndex(null);
    } else {
      if (playingIndex !== null) {
        const prev = audioRefs.current[playingIndex];
        if (prev) {
          prev.pause();
          prev.currentTime = 0;
        }
        setProgress((p) => { const n = [...p]; n[playingIndex] = 0; return n; });
      }
      audio.play();
      setPlayingIndex(index);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('MOEDERDAG2026');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Hero slider */}
      <div className="relative h-[80vh] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === current ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}

        {/* Fallback gradient when image is missing */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: 'linear-gradient(135deg, #be185d 0%, #ec4899 40%, #f43f5e 100%)',
          }}
        />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-rose-200 drop-shadow">
            Moederdag · 10 mei 2026
          </p>
          <h2
            className={`max-w-3xl text-4xl font-black leading-tight text-white drop-shadow-lg transition-opacity duration-500 sm:text-5xl lg:text-6xl ${
              visible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {slides[current].headline}
          </h2>
          <div
            className={`mt-8 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
          >
            <Link
              href={slides[current].href}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-400 via-pink-500 to-rose-500 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-pink-900/40 transition hover:scale-105 hover:shadow-pink-900/60"
            >
              {slides[current].cta}
            </Link>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-7 left-0 right-0 z-10 flex justify-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Ga naar slide ${index + 1}`}
              className={`rounded-full transition-all duration-300 ${
                index === current
                  ? 'h-3 w-8 bg-white'
                  : 'h-3 w-3 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Countdown timer */}
      <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 py-12">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-8 text-base font-semibold text-rose-600 sm:text-lg">
            Moederdag is op 10 mei — nog
          </p>
          <div className="flex justify-center gap-3 sm:gap-6">
            {(
              [
                { value: timeLeft.days, label: 'Dagen' },
                { value: timeLeft.hours, label: 'Uren' },
                { value: timeLeft.minutes, label: 'Minuten' },
                { value: timeLeft.seconds, label: 'Seconden' },
              ] as const
            ).map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-200 sm:h-20 sm:w-20">
                  <span className="text-2xl font-black tabular-nums text-white sm:text-3xl">
                    {String(value).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-500">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden audio elements */}
      {previews.map((preview, index) => (
        <audio
          key={index}
          ref={(el) => { audioRefs.current[index] = el; }}
          src={preview.src}
          onTimeUpdate={() => {
            const audio = audioRefs.current[index];
            if (!audio || !audio.duration) return;
            setProgress((p) => {
              const n = [...p];
              n[index] = (audio.currentTime / audio.duration) * 100;
              return n;
            });
          }}
          onEnded={() => {
            setPlayingIndex(null);
            setProgress((p) => { const n = [...p]; n[index] = 0; return n; });
          }}
        />
      ))}

      {/* Song previews */}
      <div
        className="py-16"
        style={{ background: 'linear-gradient(135deg, #FF8C42, #FF4D8D, #8B5CF6)' }}
      >
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-2 text-center text-sm font-semibold uppercase tracking-[0.22em] text-white/70">
            Luister alvast
          </p>
          <h3 className="mb-10 text-center text-2xl font-black tracking-tight text-white sm:text-3xl">
            Voorbeelden van Moederdag-liedjes
          </h3>
          <div className="grid gap-5 sm:grid-cols-3">
            {previews.map((preview, index) => {
              const isPlaying = playingIndex === index;
              return (
                <div
                  key={index}
                  className="flex flex-col gap-4 rounded-2xl p-6"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '16px',
                  }}
                >
                  {/* Top row: music icon + play button */}
                  <div className="flex items-start justify-between">
                    <span className="text-3xl leading-none">🎵</span>
                    <button
                      onClick={() => togglePlay(index)}
                      aria-label={isPlaying ? 'Pauzeer' : 'Speel af'}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-105 active:scale-95"
                    >
                      {isPlaying ? (
                        <svg className="h-4 w-4 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 translate-x-0.5 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5.14v14l11-7-11-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Title + tag */}
                  <div>
                    <p className="text-lg font-black leading-snug text-white">
                      {preview.title}
                    </p>
                    <p className="mt-1 text-sm font-medium text-white/70">
                      {preview.tag}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full"
                    style={{ background: 'rgba(255, 255, 255, 0.25)' }}
                  >
                    <div
                      className="h-full rounded-full bg-white transition-[width] duration-300"
                      style={{ width: `${progress[index]}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Discount code */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 py-10">
        <div className="mx-auto max-w-xl px-6 text-center">
          <p className="text-lg font-bold text-slate-800 sm:text-xl">
            Bestel voor Moederdag en krijg 25% korting!
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <div className="flex items-center gap-3 rounded-2xl border-2 border-rose-200 bg-white px-6 py-4 shadow-sm">
              <span className="text-lg font-black tracking-widest text-rose-600 sm:text-xl">
                MOEDERDAG2026
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-4 text-sm font-semibold text-white shadow-md transition hover:scale-105 active:scale-95"
            >
              {copied ? '✓ Gekopieerd!' : 'Kopieer code'}
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-400">Gebruik deze code bij het afrekenen</p>
        </div>
      </div>
    </div>
  );
}

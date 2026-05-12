"use client";

import { useRef, useState } from "react";

const tracks = [
  {
    title: "Verjaardag",
    description: "Pop • Vrolijk",
    src: "/audio/Fory(short).mp3",
  },
  {
    title: "Liefde",
    description: "Ballad • Emotioneel",
    src: "/audio/Liefde na de stom (short).mp3",
  },
  {
    title: "Speciaal moment",
    description: "Pop • Sfeervol",
    src: "/audio/that night we felt alive (short).mp3",
  },
];

export default function AudioPreviewSection() {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  const toggle = (index: number) => {
    const audio = audioRefs.current[index];
    if (!audio) return;

    if (playingIndex === index) {
      audio.pause();
      setPlayingIndex(null);
    } else {
      if (playingIndex !== null) {
        audioRefs.current[playingIndex]?.pause();
      }
      audio.play();
      setPlayingIndex(index);
    }
  };

  const handleEnded = (index: number) => {
    if (playingIndex === index) setPlayingIndex(null);
  };

  return (
    <section id="voorbeelden" className="bg-[linear-gradient(135deg,#FF6B00_0%,#7B2FBE_50%,#3B82F6_100%)] py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
            Voorbeelden
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Beluister een voorbeeld
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-white/85">
            Zo klinkt een RoastFactory roast
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {tracks.map((track, index) => {
            const isPlaying = playingIndex === index;
            return (
              <div
                key={track.title}
                className="rounded-[1.75rem] bg-white/20 p-7 backdrop-blur-sm transition hover:bg-white/25"
              >
                <audio
                  ref={(el) => { audioRefs.current[index] = el; }}
                  src={track.src}
                  onEnded={() => handleEnded(index)}
                  preload="none"
                />

                <div className="flex items-start justify-between gap-4">
                  <div className="inline-flex rounded-2xl bg-white/20 p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                    </svg>
                  </div>

                  <button
                    onClick={() => toggle(index)}
                    aria-label={isPlaying ? "Pauzeren" : "Afspelen"}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-105 active:scale-95"
                  >
                    {isPlaying ? (
                      <svg className="h-5 w-5" fill="url(#grad)" viewBox="0 0 24 24">
                        <defs>
                          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF6B00" />
                            <stop offset="50%" stopColor="#7B2FBE" />
                            <stop offset="100%" stopColor="#3B82F6" />
                          </linearGradient>
                        </defs>
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 translate-x-0.5" fill="url(#grad)" viewBox="0 0 24 24">
                        <defs>
                          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF6B00" />
                            <stop offset="50%" stopColor="#7B2FBE" />
                            <stop offset="100%" stopColor="#3B82F6" />
                          </linearGradient>
                        </defs>
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                <h3 className="mt-5 text-2xl font-bold tracking-tight text-white">
                  {track.title}
                </h3>
                <p className="mt-1 text-sm font-medium text-white/70">{track.description}</p>

                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white"
                    style={isPlaying ? { width: "100%", transition: "width 30s linear" } : { width: 0 }}
                  />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

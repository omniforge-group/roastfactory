"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const USE_CASES = [
  { emoji: "👯", label: "Je beste vriend",                    audio: "beste-vriend.mp3" },
  { emoji: "💔", label: "Je ex",                              audio: "ex.mp3" },
  { emoji: "⚽", label: "Je voetbalteam",                    audio: "voetbalteam.mp3" },
  { emoji: "💼", label: "Je collega",                         audio: "collega.mp3" },
  { emoji: "🎂", label: "De jarige",                          audio: "jarige.mp3" },
  { emoji: "📱", label: "De groepschat",                      audio: "groepschat.mp3" },
  { emoji: "💍", label: "Bachelor party",                     audio: "bachelor-party.mp3" },
  { emoji: "😤", label: "Die ene gast die altijd stoer doet", audio: "stoere-gast.mp3" },
];

export default function UseCasesSection() {
  const [playing, setPlaying] = useState<number | null>(null);
  const [hidden, setHidden] = useState<Set<number>>(new Set());
  const audioRefs = useRef<(HTMLAudioElement | null)[]>(Array(8).fill(null));

  function togglePlay(i: number) {
    const audio = audioRefs.current[i];
    if (!audio) return;

    if (playing === i) {
      audio.pause();
      audio.currentTime = 0;
      setPlaying(null);
    } else {
      if (playing !== null) {
        const prev = audioRefs.current[playing];
        if (prev) { prev.pause(); prev.currentTime = 0; }
      }
      audio.play().catch(() => {
        setHidden(prev => new Set(prev).add(i));
        setPlaying(null);
      });
      setPlaying(i);
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {USE_CASES.map(({ emoji, label, audio }, i) => (
        <div
          key={label}
          className="overflow-hidden rounded-2xl border border-[#FF2D2D]/40 transition-all hover:border-[#FF2D2D] hover:shadow-[0_0_20px_rgba(255,45,45,0.15)]"
        >
          <audio
            ref={el => { audioRefs.current[i] = el; }}
            src={`/audio/previews/${audio}`}
            onEnded={() => setPlaying(null)}
            onError={() => {
              setHidden(prev => new Set(prev).add(i));
              setPlaying(null);
            }}
            preload="none"
          />

          <Link
            href="/bestellen"
            className="group flex items-center gap-4 bg-black p-5"
          >
            <span className="text-3xl">{emoji}</span>
            <span className="font-semibold text-white transition-colors group-hover:text-[#FF2D2D]">
              {label}
            </span>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-white/20 transition-colors group-hover:text-[#FF2D2D]" />
          </Link>

          {!hidden.has(i) && (
            <button
              onClick={() => togglePlay(i)}
              className="flex h-9 w-full cursor-pointer items-center justify-between border-none bg-[#FF2D2D] px-3.5 text-[13px] text-white transition-colors hover:bg-[#FF4444]"
            >
              <span>{playing === i ? "⏸" : "▶"}</span>
              <span>{playing === i ? "Pauzeer" : "Beluister voorbeeld"}</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

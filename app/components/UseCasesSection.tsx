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
      audioRefs.current.forEach((a, idx) => {
        if (a && idx !== i) { a.pause(); a.currentTime = 0; }
      });
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
        <div key={label} className="flex flex-col">
          <audio
            ref={el => { audioRefs.current[i] = el; }}
            src={`/audio/previews/${audio}`}
            preload="none"
            onEnded={() => setPlaying(null)}
            onError={() => {
              setHidden(prev => new Set(prev).add(i));
              setPlaying(null);
            }}
          />

          <Link
            href="/bestellen"
            className="group flex items-center gap-4 rounded-2xl border border-[#FF2D2D]/40 bg-black p-5 transition-all hover:border-[#FF2D2D] hover:shadow-[0_0_20px_rgba(255,45,45,0.15)]"
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
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "#FF2D2D",
                border: "none",
                outline: "none",
                WebkitAppearance: "none",
                color: "white",
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "8px auto 0 auto",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#CC0000"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#FF2D2D"; }}
            >
              {playing === i ? "⏸" : "▶"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

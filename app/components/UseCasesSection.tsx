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

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m + ":" + s.toString().padStart(2, "0");
};

export default function UseCasesSection() {
  const [playing, setPlaying] = useState<number | null>(null);
  const [hidden, setHidden] = useState<Set<number>>(new Set());
  const [currentTimes, setCurrentTimes] = useState<number[]>(Array(8).fill(0));
  const [durations, setDurations] = useState<number[]>(Array(8).fill(0));

  const audioRefs = useRef<(HTMLAudioElement | null)[]>(Array(8).fill(null));

  function togglePlay(i: number) {
    const audio = audioRefs.current[i];
    if (!audio) return;

    if (playing === i) {
      audio.pause();
      setPlaying(null);
    } else {
      // Pause all others
      audioRefs.current.forEach((a, idx) => {
        if (a && idx !== i) { a.pause(); a.currentTime = 0; }
      });
      setCurrentTimes(prev => prev.map((t, idx) => idx !== i ? 0 : t));
      audio.play().catch(() => {
        setHidden(prev => new Set(prev).add(i));
        setPlaying(null);
      });
      setPlaying(i);
    }
  }

  function seek(i: number, e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRefs.current[i];
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pos * audio.duration;
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
            preload="none"
            onLoadedMetadata={e => {
              const dur = (e.currentTarget as HTMLAudioElement).duration;
              setDurations(prev => prev.map((d, idx) => idx === i ? dur : d));
            }}
            onTimeUpdate={e => {
              const t = (e.currentTarget as HTMLAudioElement).currentTime;
              setCurrentTimes(prev => prev.map((c, idx) => idx === i ? t : c));
            }}
            onEnded={() => {
              setPlaying(null);
              setCurrentTimes(prev => prev.map((t, idx) => idx === i ? 0 : t));
            }}
            onError={() => {
              setHidden(prev => new Set(prev).add(i));
              setPlaying(null);
            }}
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#111111",
                padding: "8px 12px",
                borderTop: "1px solid rgba(255,45,45,0.3)",
              }}
            >
              {/* Play/pause button */}
              <button
                onClick={() => togglePlay(i)}
                style={{
                  flexShrink: 0,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#FF2D2D",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  color: "#FFFFFF",
                  boxShadow: "0 2px 8px rgba(255,45,45,0.4)",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#FF4444"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#FF2D2D"; }}
              >
                {playing === i ? "⏸" : "▶"}
              </button>

              {/* Progress bar */}
              <div
                onClick={e => seek(i, e)}
                style={{
                  flex: 1,
                  height: 3,
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: 2,
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: durations[i] > 0
                      ? `${(currentTimes[i] / durations[i]) * 100}%`
                      : "0%",
                    background: "#FF2D2D",
                    borderRadius: 2,
                    transition: "width 0.1s linear",
                  }}
                />
              </div>

              {/* Time display */}
              <span
                style={{
                  flexShrink: 0,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.7)",
                  fontFamily: "monospace",
                  whiteSpace: "nowrap",
                }}
              >
                {formatTime(currentTimes[i])} / {formatTime(durations[i])}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

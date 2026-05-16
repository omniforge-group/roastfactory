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

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
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
      audio.currentTime = 0;
      setPlaying(null);
    } else {
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
          style={{
            borderRadius: 16,
            border: "1px solid rgba(255,45,45,0.4)",
            overflow: "hidden",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "#FF2D2D";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 20px rgba(255,45,45,0.15)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,45,45,0.4)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          }}
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

          {/* Bovenste deel — kaartinhoud */}
          <Link
            href="/bestellen"
            className="group"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              background: "#000000",
              padding: 20,
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: 30 }}>{emoji}</span>
            <span
              style={{
                fontWeight: 600,
                color: "#ffffff",
                fontSize: 15,
                transition: "color 0.2s",
              }}
              className="group-hover:text-[#FF2D2D]"
            >
              {label}
            </span>
            <ArrowRight
              className="ml-auto group-hover:text-[#FF2D2D]"
              style={{ width: 16, height: 16, flexShrink: 0, color: "rgba(255,255,255,0.2)", transition: "color 0.2s" }}
            />
          </Link>

          {/* Onderste deel — mediaplayer footer */}
          {!hidden.has(i) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#0d0d0d",
                borderTop: "1px solid rgba(255,45,45,0.2)",
                padding: "10px 14px",
              }}
            >
              {/* Ronde rode knop — alleen Unicode tekst, geen externe icons */}
              <button
                onClick={() => togglePlay(i)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: "#FF2D2D",
                  border: "none",
                  outline: "none",
                  color: "white",
                  fontSize: 16,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  padding: 0,
                  margin: 0,
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  appearance: "none",
                  WebkitTapHighlightColor: "transparent",
                  boxShadow: "none",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#CC0000"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#FF2D2D"; }}
              >
                {playing === i ? "⏸" : "▶"}
              </button>

              {/* Voortgangsbalk + tijdweergave */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                <div
                  onClick={e => seek(i, e)}
                  style={{
                    height: 3,
                    backgroundColor: "rgba(255,255,255,0.15)",
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
                      backgroundColor: "#FF2D2D",
                      borderRadius: 2,
                      transition: "width 0.1s linear",
                    }}
                  />
                </div>

                {durations[i] > 0 && (
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                    {formatTime(currentTimes[i])} / {formatTime(durations[i])}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

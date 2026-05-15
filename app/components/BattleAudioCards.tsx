"use client";
import { useRef, useState } from "react";

const BATTLES = [
  { label: "Battle 1", file: "battle-voorbeeld-1.mp3" },
  { label: "Battle 2", file: "battle-voorbeeld-2.mp3" },
  { label: "Battle 3", file: "battle-voorbeeld-3.mp3" },
];

function fmt(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function BattleAudioCards() {
  const [playing, setPlaying] = useState<number | null>(null);
  const [unavailable, setUnavailable] = useState<Set<number>>(new Set());
  const [times, setTimes] = useState<{ cur: number; dur: number }[]>([
    { cur: 0, dur: 0 },
    { cur: 0, dur: 0 },
    { cur: 0, dur: 0 },
  ]);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>(Array(3).fill(null));

  function togglePlay(i: number) {
    const audio = audioRefs.current[i];
    if (!audio || unavailable.has(i)) return;

    if (playing === i) {
      audio.pause();
      setPlaying(null);
    } else {
      if (playing !== null) {
        audioRefs.current[playing]?.pause();
      }
      audio.play().catch(() => {
        setUnavailable(prev => new Set(prev).add(i));
        setPlaying(null);
      });
      setPlaying(i);
    }
  }

  function handleTimeUpdate(i: number) {
    const a = audioRefs.current[i];
    if (!a) return;
    setTimes(prev => {
      const next = [...prev];
      next[i] = { cur: a.currentTime, dur: a.duration || 0 };
      return next;
    });
  }

  function handleEnded(i: number) {
    setPlaying(null);
    setTimes(prev => {
      const next = [...prev];
      next[i] = { cur: 0, dur: next[i].dur };
      return next;
    });
    const a = audioRefs.current[i];
    if (a) a.currentTime = 0;
  }

  function handleLoadedMetadata(i: number) {
    const a = audioRefs.current[i];
    if (!a) return;
    setTimes(prev => {
      const next = [...prev];
      next[i] = { cur: prev[i].cur, dur: a.duration };
      return next;
    });
  }

  return (
    <div style={{ marginTop: 40 }}>
      <style>{`
        .rf-battle-cards { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        @media (max-width: 640px) { .rf-battle-cards { grid-template-columns: 1fr; } }
      `}</style>

      <p style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 16, textAlign: "left" }}>
        🎧 Beluister voorbeelden
      </p>

      <div className="rf-battle-cards">
        {BATTLES.map(({ label, file }, i) => {
          const notAvail = unavailable.has(i);
          const isPlaying = playing === i;
          const { cur, dur } = times[i];
          const pct = dur > 0 ? (cur / dur) * 100 : 0;

          return (
            <div
              key={i}
              style={{
                background: "#1a1a1a",
                border: `1px solid ${notAvail ? "#333" : "#FF2D2D"}`,
                borderRadius: 8,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                opacity: notAvail ? 0.5 : 1,
              }}
            >
              <audio
                ref={el => { audioRefs.current[i] = el; }}
                src={`/audio/battle/${file}`}
                onTimeUpdate={() => handleTimeUpdate(i)}
                onEnded={() => handleEnded(i)}
                onError={() => setUnavailable(prev => new Set(prev).add(i))}
                onLoadedMetadata={() => handleLoadedMetadata(i)}
                preload="metadata"
              />

              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: notAvail ? "#555" : "#fff" }}>
                {label}
              </p>

              {notAvail ? (
                <p style={{ margin: 0, fontSize: 12, color: "#555", textAlign: "center", padding: "8px 0" }}>
                  Binnenkort
                </p>
              ) : (
                <>
                  <button
                    onClick={() => togglePlay(i)}
                    style={{
                      background: "#FF2D2D",
                      border: "none",
                      borderRadius: 6,
                      color: "#fff",
                      fontSize: 20,
                      fontWeight: 700,
                      minHeight: 44,
                      cursor: "pointer",
                      width: "100%",
                      transition: "background 0.12s",
                    }}
                  >
                    {isPlaying ? "⏸" : "▶"}
                  </button>

                  {/* Progress bar */}
                  <div style={{ height: 4, background: "#333", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: "#FF2D2D",
                      borderRadius: 2,
                      transition: "width 0.1s linear",
                    }} />
                  </div>

                  {/* Timer */}
                  <p style={{ margin: 0, fontSize: 11, color: "#666", textAlign: "center" }}>
                    {fmt(cur)} / {fmt(dur)}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

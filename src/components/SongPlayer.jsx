import React, { useRef, useState } from "react";

// src/assets/sample.mp3 파일을 public 도메인에 두고, 모든 곡에 공통으로 사용 (실제 곡 생성 전까지)
const SAMPLE_AUDIO = "/sample.mp3";

export default function SongPlayer({ title }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);


  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      setProgress((audio.currentTime / audio.duration) * 100);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full" role="region" aria-label={`오디오 플레이어: ${title}`}> 
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          className={
            "flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all " +
            (playing
              ? "bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-lg hover:from-blue-500 hover:to-cyan-500"
              : "bg-white border border-blue-200 text-blue-600 hover:bg-blue-50")
          }
          onClick={handlePlayPause}
          aria-label={playing ? "일시정지" : "재생"}
          aria-pressed={playing}
        >
          {playing ? (
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 20 20"><rect x="5" y="4" width="3" height="12" rx="1"/><rect x="12" y="4" width="3" height="12" rx="1"/></svg>
          ) : (
            <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20"><polygon points="5,4 17,10 5,16" /></svg>
          )}
        </button>
        <span className="text-sm sm:text-base text-blue-700 font-semibold truncate" aria-label="곡 제목">{title}</span>
      </div>
      <div className="w-full h-2 sm:h-2.5 bg-blue-100 rounded-full overflow-hidden mt-1">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <audio
        ref={audioRef}
        src={SAMPLE_AUDIO}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        preload="auto"
        aria-label={`오디오: ${title}`}
      />
    </div>
  );
}

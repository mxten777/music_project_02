import React, { useRef, useState, useEffect, useCallback } from "react";

// src/assets/sample.mp3 파일을 public 도메인에 두고, 모든 곡에 공통으로 사용 (실제 곡 생성 전까지)
const SAMPLE_AUDIO = "/sample.mp3";

export default function SongPlayer({ title, style = "ballad", compact = false, onPlayStateChange }) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [repeat, setRepeat] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [visualizerData, setVisualizerData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Audio context for visualization
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  // Initialize audio visualization
  const initializeVisualization = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audioRef.current);
      
      analyser.fftSize = 64;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }, []);

  // Update visualizer data
  const updateVisualizer = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const data = Array.from(dataArrayRef.current).map(value => value / 255);
    setVisualizerData(data);
  }, []);

  // Animation frame for visualizer
  useEffect(() => {
    let animationId;
    if (playing && analyserRef.current) {
      const animate = () => {
        updateVisualizer();
        animationId = requestAnimationFrame(animate);
      };
      animate();
    }
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [playing, updateVisualizer]);

  const handlePlayPause = async () => {
    if (!audioRef.current) return;
    
    setLoading(true);
    try {
      if (playing) {
        audioRef.current.pause();
      } else {
        // Initialize visualization on first play
        if (!audioContextRef.current) {
          initializeVisualization();
        }
        
        // Resume audio context if suspended (required by some browsers)
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Playback error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      const currentProgress = (audio.currentTime / audio.duration) * 100;
      setProgress(currentProgress);
      setCurrentTime(audio.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || !progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = (clickX / rect.width) * 100;
    const newTime = (newProgress / 100) * duration;
    
    audioRef.current.currentTime = newTime;
    setProgress(newProgress);
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
    if (audioRef.current) {
      audioRef.current.muted = !muted;
    }
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const toggleRepeat = () => {
    setRepeat(!repeat);
    if (audioRef.current) {
      audioRef.current.loop = !repeat;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Notify parent of play state changes
  useEffect(() => {
    onPlayStateChange?.(playing);
  }, [playing, onPlayStateChange]);

  if (compact) {
    return (
      <div className="flex items-center gap-3 w-full animate-fade-in" role="region" aria-label={`오디오 플레이어: ${title}`}>
        <button
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
            playing
              ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-glow hover:scale-110"
              : "bg-white/80 backdrop-blur-sm border border-primary-200 text-primary-600 hover:bg-primary-50 hover:scale-105"
          }`}
          onClick={handlePlayPause}
          disabled={loading}
          aria-label={playing ? "일시정지" : "재생"}
        >
          {loading ? (
            <i className="fas fa-spinner animate-spin text-sm"></i>
          ) : playing ? (
            <i className="fas fa-pause text-sm"></i>
          ) : (
            <i className="fas fa-play text-sm ml-0.5"></i>
          )}
        </button>
        
        <div className="flex-1">
          <div className="text-sm font-medium text-primary-700 truncate">{title}</div>
          <div 
            ref={progressRef}
            className="w-full h-1.5 bg-primary-100 rounded-full overflow-hidden cursor-pointer mt-1"
            onClick={handleProgressClick}
          >
            <div
              className={`h-full transition-all duration-150 ${
                style === "ballad" 
                  ? "bg-gradient-to-r from-primary-400 to-primary-600" 
                  : "bg-gradient-to-r from-secondary-400 to-secondary-600"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <audio
          ref={audioRef}
          src={SAMPLE_AUDIO}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          preload="auto"
          volume={volume}
          muted={muted}
          loop={repeat}
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-white/60 backdrop-blur-xl rounded-3xl border border-white/30 p-6 shadow-premium animate-scale-in" role="region" aria-label={`오디오 플레이어: ${title}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            style === "ballad" 
              ? "bg-gradient-to-r from-primary-500 to-primary-600" 
              : "bg-gradient-to-r from-secondary-500 to-secondary-600"
          } text-white shadow-lg`}>
            <i className="fas fa-music text-lg"></i>
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg text-primary-700">{title}</h3>
            <p className="text-sm text-neutral-500 capitalize">{style === "ballad" ? "발라드" : "엔카"} 스타일</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowControls(!showControls)}
          className="p-2 rounded-xl bg-white/50 hover:bg-white/70 border border-white/30 transition-all duration-300"
          aria-label="고급 컨트롤 토글"
        >
          <i className={`fas fa-sliders-h text-primary-600 ${showControls ? 'rotate-180' : ''} transition-transform`}></i>
        </button>
      </div>

      {/* Visualizer */}
      {playing && visualizerData.length > 0 && (
        <div className="flex items-end justify-center gap-1 h-16 mb-6 px-4">
          {visualizerData.map((value, index) => (
            <div
              key={index}
              className={`w-2 rounded-full transition-all duration-150 ${
                style === "ballad"
                  ? "bg-gradient-to-t from-primary-400 to-primary-600"
                  : "bg-gradient-to-t from-secondary-400 to-secondary-600"
              }`}
              style={{ 
                height: `${Math.max(2, value * 60)}px`,
                opacity: 0.7 + (value * 0.3)
              }}
            />
          ))}
        </div>
      )}

      {/* Main Progress Bar */}
      <div className="mb-6">
        <div 
          ref={progressRef}
          className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden cursor-pointer relative group"
          onClick={handleProgressClick}
        >
          <div
            className={`h-full transition-all duration-300 relative ${
              style === "ballad" 
                ? "bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" 
                : "bg-gradient-to-r from-secondary-400 via-secondary-500 to-secondary-600"
            }`}
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-neutral-500 mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={toggleRepeat}
          className={`p-3 rounded-xl transition-all duration-300 ${
            repeat 
              ? "bg-primary-100 text-primary-600 shadow-inner" 
              : "bg-white/50 hover:bg-white/70 text-neutral-600"
          }`}
          aria-label={repeat ? "반복 해제" : "반복 설정"}
        >
          <i className="fas fa-redo text-lg"></i>
        </button>

        <button
          className="p-4 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-premium hover:shadow-glow transition-all duration-300 hover:scale-110 active:scale-95"
          onClick={handlePlayPause}
          disabled={loading}
          aria-label={playing ? "일시정지" : "재생"}
        >
          {loading ? (
            <i className="fas fa-spinner animate-spin text-2xl"></i>
          ) : playing ? (
            <i className="fas fa-pause text-2xl"></i>
          ) : (
            <i className="fas fa-play text-2xl ml-1"></i>
          )}
        </button>

        <button
          onClick={toggleMute}
          className={`p-3 rounded-xl transition-all duration-300 ${
            muted 
              ? "bg-red-100 text-red-600 shadow-inner" 
              : "bg-white/50 hover:bg-white/70 text-neutral-600"
          }`}
          aria-label={muted ? "음소거 해제" : "음소거"}
        >
          <i className={`fas ${muted ? 'fa-volume-mute' : volume > 0.5 ? 'fa-volume-up' : 'fa-volume-down'} text-lg`}></i>
        </button>
      </div>

      {/* Advanced Controls */}
      {showControls && (
        <div className="space-y-4 pt-4 border-t border-white/30 animate-slide-down">
          {/* Volume Control */}
          <div className="flex items-center gap-4">
            <i className="fas fa-volume-down text-neutral-500"></i>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${volume * 100}%, rgb(229 231 235) ${volume * 100}%, rgb(229 231 235) 100%)`
              }}
            />
            <i className="fas fa-volume-up text-neutral-500"></i>
          </div>

          {/* Playback Speed */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-600 min-w-[4rem]">속도:</span>
            <div className="flex gap-2">
              {[0.5, 0.75, 1, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handlePlaybackRateChange(rate)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                    playbackRate === rate
                      ? "bg-primary-500 text-white shadow-lg"
                      : "bg-white/50 hover:bg-white/70 text-neutral-600"
                  }`}
                >
                  {rate}×
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <audio
        ref={audioRef}
        src={SAMPLE_AUDIO}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        preload="auto"
        volume={volume}
        muted={muted}
        loop={repeat}
        aria-label={`오디오: ${title}`}
      />
    </div>
  );
}

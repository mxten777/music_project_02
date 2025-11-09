import React, { useState, useEffect } from 'react';

export default function PlaylistManager({ songs = [], currentSong, onSongSelect, onPlaylistUpdate }) {
  const [playlist, setPlaylist] = useState(songs);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('none'); // 'none', 'one', 'all'
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setPlaylist(songs);
    const index = songs.findIndex(song => song.id === currentSong?.id);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [songs, currentSong]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const toggleShuffle = () => {
    const newShuffle = !shuffle;
    setShuffle(newShuffle);
    
    if (newShuffle) {
      const currentSongItem = playlist[currentIndex];
      const shuffled = shuffleArray(playlist);
      const newCurrentIndex = shuffled.findIndex(song => song.id === currentSongItem?.id);
      setCurrentIndex(newCurrentIndex);
      setPlaylist(shuffled);
    } else {
      // Restore original order
      setPlaylist([...songs]);
      const originalIndex = songs.findIndex(song => song.id === currentSong?.id);
      setCurrentIndex(originalIndex);
    }
    
    onPlaylistUpdate?.({ shuffle: newShuffle, repeat, playlist });
  };

  const toggleRepeat = () => {
    const repeatModes = ['none', 'all', 'one'];
    const currentModeIndex = repeatModes.indexOf(repeat);
    const newRepeat = repeatModes[(currentModeIndex + 1) % repeatModes.length];
    setRepeat(newRepeat);
    onPlaylistUpdate?.({ shuffle, repeat: newRepeat, playlist });
  };

  const selectSong = (song, index) => {
    setCurrentIndex(index);
    setHistory(prev => [...prev.slice(-10), currentSong].filter(Boolean)); // Keep last 10
    onSongSelect?.(song, index);
  };

  const nextSong = () => {
    let nextIndex;
    
    if (repeat === 'one') {
      nextIndex = currentIndex;
    } else if (repeat === 'all' && currentIndex === playlist.length - 1) {
      nextIndex = 0;
    } else if (currentIndex < playlist.length - 1) {
      nextIndex = currentIndex + 1;
    } else {
      return; // End of playlist
    }
    
    selectSong(playlist[nextIndex], nextIndex);
  };

  const previousSong = () => {
    if (history.length > 0) {
      const previousSong = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      const index = playlist.findIndex(song => song.id === previousSong.id);
      if (index !== -1) {
        selectSong(playlist[index], index);
      }
    } else if (currentIndex > 0) {
      selectSong(playlist[currentIndex - 1], currentIndex - 1);
    }
  };

  const removeSong = (songIndex) => {
    const newPlaylist = playlist.filter((_, index) => index !== songIndex);
    setPlaylist(newPlaylist);
    
    if (songIndex < currentIndex) {
      setCurrentIndex(prev => prev - 1);
    } else if (songIndex === currentIndex && newPlaylist.length > 0) {
      const newCurrentIndex = Math.min(currentIndex, newPlaylist.length - 1);
      setCurrentIndex(newCurrentIndex);
      selectSong(newPlaylist[newCurrentIndex], newCurrentIndex);
    }
    
    onPlaylistUpdate?.({ shuffle, repeat, playlist: newPlaylist });
  };

  // Future: Drag and drop functionality
  // const moveSong = (dragIndex, hoverIndex) => { ... }

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/30 p-6 shadow-premium">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-xl text-primary-700 flex items-center gap-2">
          <i className="fas fa-list-music text-primary-500"></i>
          재생목록
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-xl transition-all duration-300 ${
              shuffle 
                ? "bg-accent-100 text-accent-600 shadow-inner" 
                : "bg-white/50 hover:bg-white/70 text-neutral-600"
            }`}
            aria-label={shuffle ? "셔플 해제" : "셔플 설정"}
          >
            <i className="fas fa-random"></i>
          </button>
          
          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-xl transition-all duration-300 ${
              repeat !== 'none' 
                ? "bg-secondary-100 text-secondary-600 shadow-inner" 
                : "bg-white/50 hover:bg-white/70 text-neutral-600"
            }`}
            aria-label={`반복 모드: ${repeat}`}
          >
            <i className={`fas ${repeat === 'one' ? 'fa-redo' : 'fa-retweet'}`}></i>
            {repeat === 'one' && <span className="text-xs ml-1">1</span>}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={previousSong}
          className="p-3 rounded-xl bg-white/50 hover:bg-white/70 text-neutral-600 transition-all duration-300 hover:scale-105"
          disabled={currentIndex === 0 && history.length === 0}
          aria-label="이전 곡"
        >
          <i className="fas fa-step-backward"></i>
        </button>
        
        <div className="flex-1 text-center">
          <div className="text-sm text-neutral-500">
            {currentIndex + 1} / {playlist.length}
          </div>
          <div className="font-medium text-primary-700 truncate">
            {currentSong?.title || 'No song selected'}
          </div>
        </div>
        
        <button
          onClick={nextSong}
          className="p-3 rounded-xl bg-white/50 hover:bg-white/70 text-neutral-600 transition-all duration-300 hover:scale-105"
          disabled={currentIndex === playlist.length - 1 && repeat !== 'all'}
          aria-label="다음 곡"
        >
          <i className="fas fa-step-forward"></i>
        </button>
      </div>

      {/* Playlist */}
      <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
        {playlist.map((song, index) => (
          <div
            key={song.id || index}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer group ${
              index === currentIndex
                ? "bg-gradient-to-r from-primary-100 to-secondary-100 border border-primary-200"
                : "bg-white/30 hover:bg-white/50 border border-transparent hover:border-white/50"
            }`}
            onClick={() => selectSong(song, index)}
          >
            {/* Play indicator */}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              {index === currentIndex ? (
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-primary-500 rounded-full animate-pulse"></div>
                  <div className="w-1 h-4 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-4 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
              ) : (
                <span className="text-sm text-neutral-500 group-hover:text-primary-500 transition-colors">
                  {index + 1}
                </span>
              )}
            </div>

            {/* Song info */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-primary-700 truncate">
                {song.title}
              </div>
              <div className="text-sm text-neutral-500 truncate">
                {song.style === 'ballad' ? '발라드' : '엔카'} • {song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : '3:24'}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Add to favorites logic here
                }}
                className="p-2 rounded-lg hover:bg-white/50 text-neutral-400 hover:text-accent-500 transition-all"
                aria-label="즐겨찾기"
              >
                <i className="fas fa-heart text-sm"></i>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSong(index);
                }}
                className="p-2 rounded-lg hover:bg-white/50 text-neutral-400 hover:text-red-500 transition-all"
                aria-label="목록에서 제거"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Playlist stats */}
      <div className="mt-4 pt-4 border-t border-white/30 text-center">
        <div className="text-sm text-neutral-500">
          총 {playlist.length}곡 • 예상 재생시간: {Math.floor((playlist.length * 3.5))}분
        </div>
      </div>
    </div>
  );
}
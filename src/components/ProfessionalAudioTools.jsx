import React, { useState, useEffect, useRef, useCallback } from 'react';
import { professionalAudioEngine, ReverbEffect, DelayEffect, EQEffect, CompressorEffect } from '../utils/professionalAudioEngine';
import { midiProcessor, VirtualInstrument } from '../utils/midiProcessor';

// 멀티트랙 편집기 메인 컴포넌트
export const MultiTrackEditor = () => {
  const [tracks, setTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [masterVolume, setMasterVolume] = useState(1.0);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showEffects, setShowEffects] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    initializeAudioEngine();
    return () => {
      professionalAudioEngine.cleanup();
    };
  }, []);

  const initializeAudioEngine = async () => {
    const initialized = await professionalAudioEngine.initialize();
    if (initialized) {
      professionalAudioEngine.setBPM(bpm);
      updateTracks();
    }
  };

  const updateTracks = useCallback(() => {
    const engineTracks = professionalAudioEngine.getTracks();
    setTracks(engineTracks);
  }, []);

  const createNewTrack = () => {
    const trackId = `track_${Date.now()}`;
    const trackName = `Track ${tracks.length + 1}`;
    professionalAudioEngine.createTrack(trackId, trackName, 'audio');
    updateTracks();
  };

  const deleteTrack = (trackId) => {
    professionalAudioEngine.deleteTrack(trackId);
    updateTracks();
    if (selectedTrack === trackId) {
      setSelectedTrack(null);
    }
  };

  const handleFileUpload = async (trackId, file) => {
    try {
      await professionalAudioEngine.loadAudioFile(trackId, file);
      updateTracks();
    } catch (error) {
      console.error('Failed to load audio file:', error);
    }
  };

  const playAll = () => {
    professionalAudioEngine.playAll();
    setIsPlaying(true);
  };

  const stopAll = () => {
    professionalAudioEngine.stopAll();
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleVolumeChange = (trackId, volume) => {
    professionalAudioEngine.setTrackVolume(trackId, volume);
    updateTracks();
  };

  const handlePanChange = (trackId, pan) => {
    professionalAudioEngine.setTrackPan(trackId, pan);
    updateTracks();
  };

  const toggleMute = (trackId) => {
    const track = tracks.find(t => t.id === trackId);
    professionalAudioEngine.muteTrack(trackId, !track.isMuted);
    updateTracks();
  };

  const toggleSolo = (trackId) => {
    const track = tracks.find(t => t.id === trackId);
    professionalAudioEngine.soloTrack(trackId, !track.isSolo);
    updateTracks();
  };

  const handleMasterVolumeChange = (volume) => {
    setMasterVolume(volume);
    professionalAudioEngine.setMasterVolume(volume);
  };

  const handleBPMChange = (newBpm) => {
    setBpm(newBpm);
    professionalAudioEngine.setBPM(newBpm);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      {/* 상단 컨트롤 바 */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={isPlaying ? stopAll : playAll}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                isPlaying 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isPlaying ? '⏹️ 정지' : '▶️ 재생'}
            </button>
            
            <button
              onClick={createNewTrack}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              ➕ 새 트랙
            </button>
            
            <button
              onClick={() => setShowEffects(!showEffects)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
            >
              🎛️ 이펙트
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-300">BPM:</label>
              <input
                type="number"
                value={bpm}
                onChange={(e) => handleBPMChange(parseInt(e.target.value))}
                className="w-20 px-2 py-1 bg-gray-700 rounded text-center"
                min="60"
                max="200"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-300">Master:</label>
              <VolumeSlider
                value={masterVolume}
                onChange={handleMasterVolumeChange}
                className="w-24"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 트랙 리스트 */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">트랙</h2>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {tracks.map(track => (
            <TrackStrip
              key={track.id}
              track={track}
              isSelected={selectedTrack === track.id}
              onSelect={() => setSelectedTrack(track.id)}
              onDelete={() => deleteTrack(track.id)}
              onFileUpload={(file) => handleFileUpload(track.id, file)}
              onVolumeChange={(volume) => handleVolumeChange(track.id, volume)}
              onPanChange={(pan) => handlePanChange(track.id, pan)}
              onMute={() => toggleMute(track.id)}
              onSolo={() => toggleSolo(track.id)}
            />
          ))}
        </div>
        
        {tracks.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            <p className="text-lg mb-4">트랙이 없습니다</p>
            <button
              onClick={createNewTrack}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              첫 번째 트랙 만들기
            </button>
          </div>
        )}
      </div>

      {/* 이펙트 패널 */}
      {showEffects && selectedTrack && (
        <EffectsPanel
          trackId={selectedTrack}
          onClose={() => setShowEffects(false)}
        />
      )}

      {/* 마스터 분석기 */}
      <MasterAnalyzer />
    </div>
  );
};

// 개별 트랙 스트립 컴포넌트
const TrackStrip = ({ 
  track, 
  isSelected, 
  onSelect, 
  onDelete, 
  onFileUpload, 
  onVolumeChange, 
  onPanChange, 
  onMute, 
  onSolo 
}) => {
  const fileInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div 
      className={`p-4 border-b border-gray-700 cursor-pointer transition-colors ${
        isSelected ? 'bg-gray-700' : 'hover:bg-gray-750'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center space-x-4">
        {/* 트랙 정보 */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: track.color }}
            />
            <h3 className="font-semibold">{track.name}</h3>
            <span className="text-xs text-gray-400">{track.type}</span>
          </div>
          
          <div className="text-sm text-gray-400">
            {track.buffer ? 
              `${track.duration.toFixed(2)}초` : 
              '파일 없음'
            }
          </div>
        </div>

        {/* 파일 업로드 */}
        <button
          onClick={handleFileClick}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors"
        >
          📁 파일
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* 볼륨 슬라이더 */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400 w-8">Vol</span>
          <VolumeSlider
            value={track.volume}
            onChange={onVolumeChange}
            className="w-20"
          />
        </div>

        {/* 팬 노브 */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400 w-8">Pan</span>
          <PanKnob
            value={track.pan}
            onChange={onPanChange}
          />
        </div>

        {/* 뮤트/솔로 버튼 */}
        <button
          onClick={(e) => { e.stopPropagation(); onMute(); }}
          className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
            track.isMuted 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-600 hover:bg-gray-500'
          }`}
        >
          M
        </button>
        
        <button
          onClick={(e) => { e.stopPropagation(); onSolo(); }}
          className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
            track.isSolo 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-600 hover:bg-gray-500'
          }`}
        >
          S
        </button>

        {/* 삭제 버튼 */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

// 볼륨 슬라이더 컴포넌트
const VolumeSlider = ({ value, onChange, className = '' }) => {
  return (
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={`slider ${className}`}
    />
  );
};

// 팬 노브 컴포넌트
const PanKnob = ({ value, onChange }) => {
  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  return (
    <input
      type="range"
      min="-1"
      max="1"
      step="0.01"
      value={value}
      onChange={handleChange}
      className="w-16 slider"
    />
  );
};

// 이펙트 패널 컴포넌트
const EffectsPanel = ({ trackId, onClose }) => {
  const [effects, setEffects] = useState([]);

  const addEffect = (effectType) => {
    const audioContext = professionalAudioEngine.audioContext;
    let effect;

    switch (effectType) {
      case 'reverb':
        effect = new ReverbEffect(audioContext);
        break;
      case 'delay':
        effect = new DelayEffect(audioContext);
        break;
      case 'eq':
        effect = new EQEffect(audioContext);
        break;
      case 'compressor':
        effect = new CompressorEffect(audioContext);
        break;
      default:
        return;
    }

    setEffects(prev => [...prev, effect]);
  };

  const removeEffect = (index) => {
    const effect = effects[index];
    effect.cleanup();
    setEffects(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">이펙트 체인</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* 이펙트 추가 버튼들 */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => addEffect('reverb')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            🌊 리버브
          </button>
          <button
            onClick={() => addEffect('delay')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
          >
            🔄 딜레이
          </button>
          <button
            onClick={() => addEffect('eq')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
          >
            📊 EQ
          </button>
          <button
            onClick={() => addEffect('compressor')}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded transition-colors"
          >
            🎚️ 컴프레서
          </button>
        </div>

        {/* 이펙트 리스트 */}
        <div className="space-y-4">
          {effects.map((effect, index) => (
            <EffectControl
              key={index}
              effect={effect}
              onRemove={() => removeEffect(index)}
            />
          ))}
        </div>

        {effects.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p>이펙트가 없습니다. 위의 버튼을 클릭해서 이펙트를 추가하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 개별 이펙트 컨트롤 컴포넌트
const EffectControl = ({ effect, onRemove }) => {
  const updateParameter = (name, value) => {
    effect.setParameter(name, value);
  };

  const renderControls = () => {
    switch (effect.type) {
      case 'reverb':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Room Size</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={effect.parameters.roomSize}
                onChange={(e) => updateParameter('roomSize', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Wet Level</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={effect.parameters.wetLevel}
                onChange={(e) => updateParameter('wetLevel', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        );

      case 'delay':
        return (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Delay Time</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={effect.parameters.delayTime}
                onChange={(e) => updateParameter('delayTime', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Feedback</label>
              <input
                type="range"
                min="0"
                max="0.9"
                step="0.01"
                value={effect.parameters.feedback}
                onChange={(e) => updateParameter('feedback', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Wet Level</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={effect.parameters.wetLevel}
                onChange={(e) => updateParameter('wetLevel', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        );

      case 'eq':
        return (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Low Gain</label>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={effect.parameters.lowGain}
                onChange={(e) => updateParameter('lowGain', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Mid Gain</label>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={effect.parameters.midGain}
                onChange={(e) => updateParameter('midGain', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">High Gain</label>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={effect.parameters.highGain}
                onChange={(e) => updateParameter('highGain', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        );

      case 'compressor':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Threshold</label>
              <input
                type="range"
                min="-60"
                max="0"
                step="1"
                value={effect.parameters.threshold}
                onChange={(e) => updateParameter('threshold', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Ratio</label>
              <input
                type="range"
                min="1"
                max="20"
                step="0.1"
                value={effect.parameters.ratio}
                onChange={(e) => updateParameter('ratio', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold capitalize">{effect.type}</h4>
        <button
          onClick={onRemove}
          className="text-red-400 hover:text-red-300 text-sm"
        >
          제거
        </button>
      </div>
      {renderControls()}
    </div>
  );
};

// 마스터 분석기 컴포넌트
const MasterAnalyzer = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const draw = () => {
      const analysisData = professionalAudioEngine.getMasterAnalysisData();
      
      if (analysisData) {
        const { frequencyData, bufferLength } = analysisData;
        
        ctx.fillStyle = 'rgb(20, 20, 20)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = canvas.width / bufferLength;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
          barHeight = (frequencyData[i] / 255) * canvas.height;
          
          const r = barHeight + 25 * (i / bufferLength);
          const g = 250 * (i / bufferLength);
          const b = 50;
          
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          
          x += barWidth + 1;
        }
      }
      
      requestAnimationFrame(draw);
    };
    
    draw();
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold mb-3">마스터 스펙트럼 분석기</h3>
      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        className="w-full h-32 bg-gray-900 rounded"
      />
    </div>
  );
};
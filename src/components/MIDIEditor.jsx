import React, { useState, useEffect, useRef } from 'react';
import { midiProcessor, VirtualInstrument } from '../utils/midiProcessor';
import { professionalAudioEngine } from '../utils/professionalAudioEngine';

// MIDI 편집기 컴포넌트
export const MIDIEditor = () => {
  const [midiTracks, setMidiTracks] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [_currentTime, _setCurrentTime] = useState(0);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [zoom, setZoom] = useState(1);
  const pianoRollRef = useRef(null);

  useEffect(() => {
    initializeInstruments();
  }, []);

  const initializeInstruments = async () => {
    if (!professionalAudioEngine.isInitialized) {
      await professionalAudioEngine.initialize();
    }

    const audioContext = professionalAudioEngine.audioContext;
    const instrumentList = [];

    // 기본 가상 악기들 생성
    const instrumentTypes = [
      { name: 'Piano', waveform: 'sine' },
      { name: 'Organ', waveform: 'square' },
      { name: 'Strings', waveform: 'sawtooth' },
      { name: 'Pad', waveform: 'triangle' }
    ];

    instrumentTypes.forEach((type, index) => {
      const instrument = new VirtualInstrument(audioContext);
      instrument.setWaveform(type.waveform);
      instrument.connect(professionalAudioEngine.masterGain);
      instrumentList.push({
        id: index,
        name: type.name,
        instrument
      });
    });

    setInstruments(instrumentList);
  };

  const handleMIDIFileUpload = async (file) => {
    try {
      const midiData = await midiProcessor.parseMIDIFile(file);
      setMidiTracks(midiProcessor.tracks);
      console.log('MIDI file loaded:', midiData);
    } catch (error) {
      console.error('Failed to load MIDI file:', error);
    }
  };

  const playMIDI = () => {
    midiProcessor.play(professionalAudioEngine, instruments.map(i => i.instrument));
    setIsPlaying(true);
  };

  const stopMIDI = () => {
    midiProcessor.stop();
    setIsPlaying(false);
  };

  const exportMIDI = () => {
    const midiData = midiProcessor.exportToMIDI();
    const blob = new Blob([midiData], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported_song.mid';
    a.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-900 text-white p-4">
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">MIDI 편집기</h2>
          
          <div className="flex space-x-2">
            <input
              type="file"
              accept=".mid,.midi"
              onChange={(e) => e.target.files[0] && handleMIDIFileUpload(e.target.files[0])}
              className="hidden"
              id="midi-upload"
            />
            <label
              htmlFor="midi-upload"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded cursor-pointer transition-colors"
            >
              📁 MIDI 로드
            </label>
            
            <button
              onClick={isPlaying ? stopMIDI : playMIDI}
              className={`px-4 py-2 rounded transition-colors ${
                isPlaying 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isPlaying ? '⏹️ 정지' : '▶️ 재생'}
            </button>
            
            <button
              onClick={exportMIDI}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
            >
              💾 내보내기
            </button>
          </div>
        </div>

        {/* 줌 컨트롤 */}
        <div className="flex items-center space-x-4 mb-4">
          <label className="text-sm text-gray-300">줌:</label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-gray-300">{zoom.toFixed(1)}x</span>
        </div>
      </div>

      {/* MIDI 트랙 리스트 */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mb-3">MIDI 트랙</h3>
        
        {midiTracks.length > 0 ? (
          <div className="space-y-2">
            {midiTracks.map(track => (
              <MIDITrackStrip
                key={track.id}
                track={track}
                instruments={instruments}
                isSelected={selectedTrack === track.id}
                onSelect={() => setSelectedTrack(track.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <p>MIDI 파일을 로드해주세요</p>
          </div>
        )}
      </div>

      {/* 피아노 롤 */}
      {selectedTrack && (
        <PianoRoll
          ref={pianoRollRef}
          track={midiTracks.find(t => t.id === selectedTrack)}
          zoom={zoom}
        />
      )}

      {/* 가상 악기 패널 */}
      <VirtualInstrumentPanel instruments={instruments} />
    </div>
  );
};

// MIDI 트랙 스트립 컴포넌트
const MIDITrackStrip = ({ track, instruments, isSelected, onSelect }) => {
  const [selectedInstrument, setSelectedInstrument] = useState(0);
  const [volume, setVolume] = useState(track.volume);
  const [pan, setPan] = useState(track.pan);

  return (
    <div 
      className={`p-3 rounded cursor-pointer transition-colors ${
        isSelected ? 'bg-gray-700' : 'bg-gray-750 hover:bg-gray-700'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <h4 className="font-medium">{track.name}</h4>
          <p className="text-xs text-gray-400">{track.events.length} 이벤트</p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs text-gray-400">악기:</label>
          <select
            value={selectedInstrument}
            onChange={(e) => setSelectedInstrument(parseInt(e.target.value))}
            className="bg-gray-600 rounded px-2 py-1 text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {instruments.map(inst => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs text-gray-400 w-8">Vol:</label>
          <input
            type="range"
            min="0"
            max="127"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="w-16"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs text-gray-400 w-8">Pan:</label>
          <input
            type="range"
            min="0"
            max="127"
            value={pan}
            onChange={(e) => setPan(parseInt(e.target.value))}
            className="w-16"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <button
          className={`px-2 py-1 rounded text-xs ${
            track.muted ? 'bg-red-600' : 'bg-gray-600 hover:bg-gray-500'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            track.muted = !track.muted;
          }}
        >
          M
        </button>

        <button
          className={`px-2 py-1 rounded text-xs ${
            track.solo ? 'bg-yellow-600' : 'bg-gray-600 hover:bg-gray-500'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            track.solo = !track.solo;
          }}
        >
          S
        </button>
      </div>
    </div>
  );
};

// 피아노 롤 컴포넌트
const PianoRoll = ({ track, zoom }) => {
  const canvasRef = useRef(null);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (track) {
      // MIDI 이벤트에서 노트 정보 추출
      const noteEvents = track.events.filter(event => 
        event.type === 'noteOn' || event.type === 'noteOff'
      );
      
      const processedNotes = [];
      const activeNotes = new Map();
      
      noteEvents.forEach(event => {
        if (event.type === 'noteOn' && event.velocity > 0) {
          activeNotes.set(event.note, event);
        } else if (event.type === 'noteOff' || (event.type === 'noteOn' && event.velocity === 0)) {
          const startEvent = activeNotes.get(event.note);
          if (startEvent) {
            processedNotes.push({
              note: event.note,
              startTime: startEvent.time,
              endTime: event.time,
              velocity: startEvent.velocity
            });
            activeNotes.delete(event.note);
          }
        }
      });
      
      setNotes(processedNotes);
    }
  }, [track]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !notes.length) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    // 캔버스 클리어
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, height);
    
    // 피아노 키 그리기
    const keyHeight = height / 128;
    const whiteKeys = [];
    const blackKeys = [];
    
    for (let i = 0; i < 128; i++) {
      const noteNum = i % 12;
      const isBlack = [1, 3, 6, 8, 10].includes(noteNum);
      const y = height - (i + 1) * keyHeight;
      
      if (isBlack) {
        blackKeys.push({ note: i, y });
      } else {
        whiteKeys.push({ note: i, y });
      }
    }
    
    // 흰 건반 그리기
    ctx.fillStyle = '#374151';
    whiteKeys.forEach(key => {
      ctx.fillRect(0, key.y, 60, keyHeight);
      ctx.strokeStyle = '#4b5563';
      ctx.strokeRect(0, key.y, 60, keyHeight);
    });
    
    // 검은 건반 그리기
    ctx.fillStyle = '#111827';
    blackKeys.forEach(key => {
      ctx.fillRect(0, key.y, 40, keyHeight);
    });
    
    // 그리드 라인 그리기
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    
    // 수직 그리드 (시간)
    const timeScale = zoom * 100;
    for (let t = 0; t < width; t += timeScale) {
      ctx.beginPath();
      ctx.moveTo(60 + t, 0);
      ctx.lineTo(60 + t, height);
      ctx.stroke();
    }
    
    // 노트 그리기
    notes.forEach(note => {
      const x = 60 + (note.startTime * zoom * 0.1);
      const noteWidth = (note.endTime - note.startTime) * zoom * 0.1;
      const y = height - (note.note + 1) * keyHeight;
      const alpha = note.velocity / 127;
      
      ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
      ctx.fillRect(x, y, noteWidth, keyHeight - 1);
      
      ctx.strokeStyle = '#3b82f6';
      ctx.strokeRect(x, y, noteWidth, keyHeight - 1);
    });
    
  }, [notes, zoom]);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">피아노 롤 - {track?.name}</h3>
      <div className="border border-gray-700 rounded overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full cursor-crosshair"
        />
      </div>
    </div>
  );
};

// 가상 악기 패널 컴포넌트
const VirtualInstrumentPanel = ({ instruments }) => {
  const [selectedInstrument, setSelectedInstrument] = useState(0);

  const playTestNote = (instrument) => {
    // 테스트 노트 재생 (C4)
    const frequency = 261.63; // C4
    const oscillator = instrument.audioContext.createOscillator();
    const gainNode = instrument.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(instrument.output);
    
    oscillator.frequency.value = frequency;
    oscillator.type = instrument.waveform;
    
    gainNode.gain.setValueAtTime(0.3, instrument.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, instrument.audioContext.currentTime + 0.5);
    
    oscillator.start();
    oscillator.stop(instrument.audioContext.currentTime + 0.5);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">가상 악기</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {instruments.map(inst => (
          <div
            key={inst.id}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              selectedInstrument === inst.id 
                ? 'bg-blue-600' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={() => setSelectedInstrument(inst.id)}
          >
            <div className="text-center">
              <h4 className="font-medium mb-2">{inst.name}</h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playTestNote(inst.instrument);
                }}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
              >
                테스트
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 선택된 악기 설정 */}
      {instruments[selectedInstrument] && (
        <InstrumentSettings instrument={instruments[selectedInstrument]} />
      )}
    </div>
  );
};

// 악기 설정 컴포넌트
const InstrumentSettings = ({ instrument }) => {
  const [waveform, setWaveform] = useState(instrument.instrument.waveform);
  const [envelope, setEnvelope] = useState(instrument.instrument.envelope);

  const handleWaveformChange = (newWaveform) => {
    setWaveform(newWaveform);
    instrument.instrument.setWaveform(newWaveform);
  };

  const handleEnvelopeChange = (param, value) => {
    const newEnvelope = { ...envelope, [param]: value };
    setEnvelope(newEnvelope);
    instrument.instrument.setEnvelope(
      newEnvelope.attack,
      newEnvelope.decay,
      newEnvelope.sustain,
      newEnvelope.release
    );
  };

  return (
    <div className="mt-6 p-4 bg-gray-700 rounded-lg">
      <h4 className="font-medium mb-4">{instrument.name} 설정</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 웨이브폼 선택 */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">웨이브폼</label>
          <div className="grid grid-cols-2 gap-2">
            {['sine', 'square', 'sawtooth', 'triangle'].map(wave => (
              <button
                key={wave}
                onClick={() => handleWaveformChange(wave)}
                className={`px-3 py-2 rounded text-sm transition-colors ${
                  waveform === wave 
                    ? 'bg-blue-600' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              >
                {wave}
              </button>
            ))}
          </div>
        </div>

        {/* 엔벨로프 설정 */}
        <div>
          <label className="block text-sm text-gray-300 mb-2">엔벨로프</label>
          <div className="space-y-2">
            {Object.entries(envelope).map(([param, value]) => (
              <div key={param} className="flex items-center space-x-2">
                <label className="text-xs text-gray-400 w-16 capitalize">{param}:</label>
                <input
                  type="range"
                  min={param === 'sustain' ? '0' : '0.001'}
                  max={param === 'sustain' ? '1' : '2'}
                  step="0.001"
                  value={value}
                  onChange={(e) => handleEnvelopeChange(param, parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs text-gray-400 w-12">{value.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// DAW 통합 컴포넌트
export const DAWIntegration = () => {
  const [exportFormat, setExportFormat] = useState('wav');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportProject = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // 프로젝트 데이터 수집
      const projectData = {
        tracks: professionalAudioEngine.getTracks(),
        midiTracks: midiProcessor.tracks,
        bpm: professionalAudioEngine.bpm,
        timeSignature: professionalAudioEngine.timeSignature
      };

      // 진행률 시뮬레이션
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 실제 내보내기 로직은 선택된 형식에 따라 다름
      switch (exportFormat) {
        case 'wav':
          await exportAsWAV(projectData);
          break;
        case 'midi':
          await exportAsMIDI(projectData);
          break;
        case 'json':
          await exportAsJSON(projectData);
          break;
      }

    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const exportAsWAV = async (projectData) => {
    // WAV 내보내기 구현 (Web Audio API 활용)
    console.log('Exporting as WAV:', projectData);
  };

  const exportAsMIDI = async () => {
    const midiData = midiProcessor.exportToMIDI();
    const blob = new Blob([midiData], { type: 'audio/midi' });
    downloadFile(blob, 'project.mid');
  };

  const exportAsJSON = async (projectData) => {
    const jsonData = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    downloadFile(blob, 'project.json');
  };

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">DAW 통합 및 내보내기</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 내보내기 옵션 */}
        <div>
          <h4 className="font-medium mb-3">내보내기 형식</h4>
          <div className="space-y-2">
            {[
              { value: 'wav', label: 'WAV 오디오', desc: '고품질 오디오 파일' },
              { value: 'midi', label: 'MIDI 파일', desc: 'MIDI 시퀀스 데이터' },
              { value: 'json', label: 'JSON 프로젝트', desc: '프로젝트 설정 파일' }
            ].map(format => (
              <label key={format.value} className="flex items-center space-x-3 p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition-colors">
                <input
                  type="radio"
                  name="exportFormat"
                  value={format.value}
                  checked={exportFormat === format.value}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="text-blue-600"
                />
                <div>
                  <div className="font-medium">{format.label}</div>
                  <div className="text-sm text-gray-400">{format.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 내보내기 실행 */}
        <div>
          <h4 className="font-medium mb-3">내보내기 실행</h4>
          
          {isExporting ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-lg font-medium">내보내기 중...</div>
                <div className="text-sm text-gray-400">잠시만 기다려주세요</div>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              
              <div className="text-center text-sm text-gray-400">
                {exportProgress}% 완료
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-700 rounded">
                <div className="text-sm text-gray-300 mb-2">선택된 형식:</div>
                <div className="font-medium">{exportFormat.toUpperCase()}</div>
              </div>
              
              <button
                onClick={exportProject}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
              >
                📤 내보내기 시작
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DAW 호환성 정보 */}
      <div className="mt-6 p-4 bg-gray-700 rounded-lg">
        <h4 className="font-medium mb-3">DAW 호환성</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium">Ableton Live</div>
            <div className="text-green-400">✓ 지원</div>
          </div>
          <div className="text-center">
            <div className="font-medium">FL Studio</div>
            <div className="text-green-400">✓ 지원</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Logic Pro</div>
            <div className="text-green-400">✓ 지원</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Pro Tools</div>
            <div className="text-green-400">✓ 지원</div>
          </div>
        </div>
      </div>
    </div>
  );
};
// Professional Audio Engine - 프로페셔널 오디오 처리 엔진
export class ProfessionalAudioEngine {
  constructor() {
    this.audioContext = null;
    this.tracks = new Map();
    this.effects = new Map();
    this.masterChain = [];
    this.isInitialized = false;
    this.sampleRate = 44100;
    this.bufferSize = 4096;
    this.bpm = 120;
    this.timeSignature = { numerator: 4, denominator: 4 };
  }

  // 오디오 컨텍스트 초기화
  async initialize() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: this.sampleRate,
        latencyHint: 'interactive'
      });

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);

      // 마스터 분석기 생성
      this.masterAnalyser = this.audioContext.createAnalyser();
      this.masterAnalyser.fftSize = 2048;
      this.masterGain.connect(this.masterAnalyser);

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
      return false;
    }
  }

  // 새 트랙 생성
  createTrack(id, name, type = 'audio') {
    if (!this.isInitialized) {
      throw new Error('Audio engine not initialized');
    }

    const track = {
      id,
      name,
      type, // 'audio', 'midi', 'instrument'
      gainNode: this.audioContext.createGain(),
      panNode: this.audioContext.createStereoPanner(),
      effectChain: [],
      buffer: null,
      source: null,
      isPlaying: false,
      isMuted: false,
      isSolo: false,
      volume: 1.0,
      pan: 0.0,
      startTime: 0,
      duration: 0,
      color: this.generateTrackColor()
    };

    // 트랙 오디오 체인 설정
    track.gainNode.connect(track.panNode);
    track.panNode.connect(this.masterGain);

    this.tracks.set(id, track);
    return track;
  }

  // 오디오 파일 로드
  async loadAudioFile(trackId, file) {
    const track = this.tracks.get(trackId);
    if (!track) throw new Error('Track not found');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      track.buffer = audioBuffer;
      track.duration = audioBuffer.duration;
      
      return audioBuffer;
    } catch (error) {
      console.error('Failed to load audio file:', error);
      throw error;
    }
  }

  // 트랙 재생
  playTrack(trackId, startTime = 0) {
    const track = this.tracks.get(trackId);
    if (!track || !track.buffer) return;

    // 기존 소스 정리
    if (track.source) {
      track.source.stop();
      track.source.disconnect();
    }

    // 새 소스 생성
    track.source = this.audioContext.createBufferSource();
    track.source.buffer = track.buffer;
    
    // 이펙트 체인 연결
    let currentNode = track.source;
    for (const effect of track.effectChain) {
      currentNode.connect(effect.inputNode);
      currentNode = effect.outputNode;
    }
    
    currentNode.connect(track.gainNode);

    track.source.start(this.audioContext.currentTime, startTime);
    track.isPlaying = true;
    track.startTime = this.audioContext.currentTime - startTime;
  }

  // 트랙 정지
  stopTrack(trackId) {
    const track = this.tracks.get(trackId);
    if (!track || !track.source) return;

    track.source.stop();
    track.source.disconnect();
    track.source = null;
    track.isPlaying = false;
  }

  // 모든 트랙 재생
  playAll() {
    this.tracks.forEach((track, trackId) => {
      if (track.buffer && !track.isMuted) {
        this.playTrack(trackId);
      }
    });
  }

  // 모든 트랙 정지
  stopAll() {
    this.tracks.forEach((track, trackId) => {
      this.stopTrack(trackId);
    });
  }

  // 트랙 볼륨 설정
  setTrackVolume(trackId, volume) {
    const track = this.tracks.get(trackId);
    if (!track) return;

    track.volume = Math.max(0, Math.min(1, volume));
    track.gainNode.gain.setValueAtTime(track.volume, this.audioContext.currentTime);
  }

  // 트랙 팬 설정
  setTrackPan(trackId, pan) {
    const track = this.tracks.get(trackId);
    if (!track) return;

    track.pan = Math.max(-1, Math.min(1, pan));
    track.panNode.pan.setValueAtTime(track.pan, this.audioContext.currentTime);
  }

  // 트랙 뮤트
  muteTrack(trackId, muted = true) {
    const track = this.tracks.get(trackId);
    if (!track) return;

    track.isMuted = muted;
    track.gainNode.gain.setValueAtTime(muted ? 0 : track.volume, this.audioContext.currentTime);
  }

  // 트랙 솔로
  soloTrack(trackId, solo = true) {
    const track = this.tracks.get(trackId);
    if (!track) return;

    // 모든 트랙의 솔로 상태 업데이트
    this.tracks.forEach((t, id) => {
      if (id === trackId) {
        t.isSolo = solo;
      } else if (solo) {
        t.isSolo = false;
        this.muteTrack(id, true);
      }
    });

    // 솔로가 해제되면 뮤트도 해제
    if (!solo) {
      this.tracks.forEach((t, id) => {
        if (!t.isMuted) {
          this.muteTrack(id, false);
        }
      });
    }
  }

  // 트랙 삭제
  deleteTrack(trackId) {
    const track = this.tracks.get(trackId);
    if (!track) return;

    this.stopTrack(trackId);
    
    // 노드 연결 해제
    track.gainNode.disconnect();
    track.panNode.disconnect();
    
    // 이펙트 정리
    track.effectChain.forEach(effect => effect.cleanup?.());
    
    this.tracks.delete(trackId);
  }

  // 트랙 색상 생성
  generateTrackColor() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
      '#85C1E9', '#F8C471', '#82E0AA', '#F1948A'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // 마스터 볼륨 설정
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.masterGain.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime);
  }

  // 현재 재생 시간 가져오기
  getCurrentTime() {
    return this.audioContext ? this.audioContext.currentTime : 0;
  }

  // BPM 설정
  setBPM(bpm) {
    this.bpm = Math.max(60, Math.min(200, bpm));
  }

  // 박자 설정
  setTimeSignature(numerator, denominator) {
    this.timeSignature = { numerator, denominator };
  }

  // 트랙 목록 가져오기
  getTracks() {
    return Array.from(this.tracks.values());
  }

  // 마스터 분석 데이터 가져오기
  getMasterAnalysisData() {
    if (!this.masterAnalyser) return null;

    const bufferLength = this.masterAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.masterAnalyser.getByteFrequencyData(dataArray);

    return {
      frequencyData: dataArray,
      bufferLength,
      sampleRate: this.audioContext.sampleRate
    };
  }

  // 리소스 정리
  cleanup() {
    this.stopAll();
    
    this.tracks.forEach((track, trackId) => {
      this.deleteTrack(trackId);
    });

    if (this.audioContext) {
      this.audioContext.close();
    }

    this.isInitialized = false;
  }
}

// 오디오 이펙트 클래스들
export class AudioEffect {
  constructor(audioContext, type) {
    this.audioContext = audioContext;
    this.type = type;
    this.inputNode = null;
    this.outputNode = null;
    this.isEnabled = true;
    this.parameters = {};
  }

  // 이펙트 활성화/비활성화
  setEnabled(enabled) {
    this.isEnabled = enabled;
    // 구현에 따라 이펙트 바이패스 로직 추가
  }

  // 파라미터 설정
  setParameter(name, value) {
    this.parameters[name] = value;
    this.updateEffect();
  }

  // 이펙트 업데이트 (하위 클래스에서 구현)
  updateEffect() {
    // Override in subclasses
  }

  // 정리
  cleanup() {
    if (this.inputNode) this.inputNode.disconnect();
    if (this.outputNode) this.outputNode.disconnect();
  }
}

// 리버브 이펙트
export class ReverbEffect extends AudioEffect {
  constructor(audioContext) {
    super(audioContext, 'reverb');
    
    this.convolver = audioContext.createConvolver();
    this.dryGain = audioContext.createGain();
    this.wetGain = audioContext.createGain();
    this.inputGain = audioContext.createGain();
    this.outputGain = audioContext.createGain();

    // 연결 설정
    this.inputNode = this.inputGain;
    this.outputNode = this.outputGain;

    this.inputGain.connect(this.dryGain);
    this.inputGain.connect(this.convolver);
    this.convolver.connect(this.wetGain);
    
    this.dryGain.connect(this.outputGain);
    this.wetGain.connect(this.outputGain);

    // 기본 파라미터
    this.parameters = {
      roomSize: 0.3,
      damping: 0.5,
      wetLevel: 0.3,
      dryLevel: 0.7
    };

    this.generateImpulseResponse();
    this.updateEffect();
  }

  generateImpulseResponse() {
    const length = this.audioContext.sampleRate * 2;
    const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, this.parameters.damping);
        channelData[i] = (Math.random() * 2 - 1) * decay;
      }
    }
    
    this.convolver.buffer = impulse;
  }

  updateEffect() {
    this.dryGain.gain.setValueAtTime(this.parameters.dryLevel, this.audioContext.currentTime);
    this.wetGain.gain.setValueAtTime(this.parameters.wetLevel, this.audioContext.currentTime);
    
    if (this.parameters.roomSize !== this.lastRoomSize) {
      this.generateImpulseResponse();
      this.lastRoomSize = this.parameters.roomSize;
    }
  }
}

// 딜레이 이펙트
export class DelayEffect extends AudioEffect {
  constructor(audioContext) {
    super(audioContext, 'delay');
    
    this.delayNode = audioContext.createDelay(1.0);
    this.feedbackGain = audioContext.createGain();
    this.wetGain = audioContext.createGain();
    this.dryGain = audioContext.createGain();
    this.inputGain = audioContext.createGain();
    this.outputGain = audioContext.createGain();

    // 연결 설정
    this.inputNode = this.inputGain;
    this.outputNode = this.outputGain;

    this.inputGain.connect(this.dryGain);
    this.inputGain.connect(this.delayNode);
    this.delayNode.connect(this.feedbackGain);
    this.feedbackGain.connect(this.delayNode);
    this.delayNode.connect(this.wetGain);
    
    this.dryGain.connect(this.outputGain);
    this.wetGain.connect(this.outputGain);

    // 기본 파라미터
    this.parameters = {
      delayTime: 0.3,
      feedback: 0.3,
      wetLevel: 0.3,
      dryLevel: 0.7
    };

    this.updateEffect();
  }

  updateEffect() {
    this.delayNode.delayTime.setValueAtTime(this.parameters.delayTime, this.audioContext.currentTime);
    this.feedbackGain.gain.setValueAtTime(this.parameters.feedback, this.audioContext.currentTime);
    this.wetGain.gain.setValueAtTime(this.parameters.wetLevel, this.audioContext.currentTime);
    this.dryGain.gain.setValueAtTime(this.parameters.dryLevel, this.audioContext.currentTime);
  }
}

// EQ 이펙트
export class EQEffect extends AudioEffect {
  constructor(audioContext) {
    super(audioContext, 'eq');
    
    this.inputNode = audioContext.createGain();
    this.outputNode = audioContext.createGain();

    // 3밴드 EQ
    this.lowFilter = audioContext.createBiquadFilter();
    this.midFilter = audioContext.createBiquadFilter();
    this.highFilter = audioContext.createBiquadFilter();

    this.lowFilter.type = 'lowshelf';
    this.lowFilter.frequency.value = 320;
    
    this.midFilter.type = 'peaking';
    this.midFilter.frequency.value = 1000;
    this.midFilter.Q.value = 1;
    
    this.highFilter.type = 'highshelf';
    this.highFilter.frequency.value = 3200;

    // 연결
    this.inputNode.connect(this.lowFilter);
    this.lowFilter.connect(this.midFilter);
    this.midFilter.connect(this.highFilter);
    this.highFilter.connect(this.outputNode);

    // 기본 파라미터
    this.parameters = {
      lowGain: 0,
      midGain: 0,
      highGain: 0
    };

    this.updateEffect();
  }

  updateEffect() {
    this.lowFilter.gain.setValueAtTime(this.parameters.lowGain, this.audioContext.currentTime);
    this.midFilter.gain.setValueAtTime(this.parameters.midGain, this.audioContext.currentTime);
    this.highFilter.gain.setValueAtTime(this.parameters.highGain, this.audioContext.currentTime);
  }
}

// 컴프레서 이펙트
export class CompressorEffect extends AudioEffect {
  constructor(audioContext) {
    super(audioContext, 'compressor');
    
    this.compressor = audioContext.createDynamicsCompressor();
    this.inputNode = this.compressor;
    this.outputNode = this.compressor;

    // 기본 파라미터
    this.parameters = {
      threshold: -12,
      knee: 30,
      ratio: 3,
      attack: 0.003,
      release: 0.25
    };

    this.updateEffect();
  }

  updateEffect() {
    this.compressor.threshold.setValueAtTime(this.parameters.threshold, this.audioContext.currentTime);
    this.compressor.knee.setValueAtTime(this.parameters.knee, this.audioContext.currentTime);
    this.compressor.ratio.setValueAtTime(this.parameters.ratio, this.audioContext.currentTime);
    this.compressor.attack.setValueAtTime(this.parameters.attack, this.audioContext.currentTime);
    this.compressor.release.setValueAtTime(this.parameters.release, this.audioContext.currentTime);
  }
}

// 싱글톤 인스턴스
export const professionalAudioEngine = new ProfessionalAudioEngine();
// MIDI Processing System - MIDI 파일 처리 및 시퀀싱
export class MIDIProcessor {
  constructor() {
    this.tracks = [];
    this.events = [];
    this.ticksPerQuarter = 480;
    this.bpm = 120;
    this.timeSignature = { numerator: 4, denominator: 4 };
    this.currentTime = 0;
    this.isPlaying = false;
  }

  // MIDI 파일 파싱
  async parseMIDIFile(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const dataView = new DataView(arrayBuffer);
      
      const midiData = this.parseMIDIData(dataView);
      this.processMIDIData(midiData);
      
      return midiData;
    } catch (error) {
      console.error('MIDI parsing error:', error);
      throw error;
    }
  }

  // MIDI 데이터 파싱 (간단한 구현)
  parseMIDIData(dataView) {
    let offset = 0;
    
    // 헤더 청크 읽기
    const headerChunk = this.readChunk(dataView, offset);
    offset += 8 + headerChunk.length;
    
    const format = dataView.getUint16(8);
    const trackCount = dataView.getUint16(10);
    const ticksPerQuarter = dataView.getUint16(12);
    
    this.ticksPerQuarter = ticksPerQuarter;
    
    const tracks = [];
    
    // 트랙 청크들 읽기
    for (let i = 0; i < trackCount; i++) {
      const trackChunk = this.readTrackChunk(dataView, offset);
      tracks.push(trackChunk);
      offset += 8 + trackChunk.length;
    }
    
    return {
      format,
      trackCount,
      ticksPerQuarter,
      tracks
    };
  }

  // 청크 읽기
  readChunk(dataView, offset) {
    const type = this.readString(dataView, offset, 4);
    const length = dataView.getUint32(offset + 4);
    
    return { type, length };
  }

  // 트랙 청크 읽기
  readTrackChunk(dataView, offset) {
    const chunk = this.readChunk(dataView, offset);
    const events = [];
    
    let trackOffset = offset + 8;
    let runningStatus = 0;
    let currentTime = 0;
    
    while (trackOffset < offset + 8 + chunk.length) {
      const deltaTime = this.readVariableLength(dataView, trackOffset);
      trackOffset += this.getVariableLengthSize(dataView, trackOffset - this.getVariableLengthSize(dataView, trackOffset));
      
      currentTime += deltaTime;
      
      let status = dataView.getUint8(trackOffset);
      
      if (status < 0x80) {
        status = runningStatus;
        trackOffset--;
      } else {
        runningStatus = status;
      }
      
      trackOffset++;
      
      const event = this.parseEvent(dataView, trackOffset, status, currentTime);
      events.push(event);
      
      trackOffset += event.dataLength || 0;
    }
    
    return { ...chunk, events };
  }

  // 이벤트 파싱
  parseEvent(dataView, offset, status, time) {
    const event = { time, status };
    
    if (status >= 0x80 && status <= 0xEF) {
      // MIDI 채널 메시지
      const channel = status & 0x0F;
      const command = status & 0xF0;
      
      event.channel = channel;
      event.command = command;
      
      switch (command) {
        case 0x80: // Note Off
          event.type = 'noteOff';
          event.note = dataView.getUint8(offset);
          event.velocity = dataView.getUint8(offset + 1);
          event.dataLength = 2;
          break;
          
        case 0x90: // Note On
          event.type = 'noteOn';
          event.note = dataView.getUint8(offset);
          event.velocity = dataView.getUint8(offset + 1);
          event.dataLength = 2;
          break;
          
        case 0xB0: // Control Change
          event.type = 'controlChange';
          event.controller = dataView.getUint8(offset);
          event.value = dataView.getUint8(offset + 1);
          event.dataLength = 2;
          break;
          
        case 0xC0: // Program Change
          event.type = 'programChange';
          event.program = dataView.getUint8(offset);
          event.dataLength = 1;
          break;
          
        case 0xE0: // Pitch Bend
          event.type = 'pitchBend';
          const lsb = dataView.getUint8(offset);
          const msb = dataView.getUint8(offset + 1);
          event.value = (msb << 7) | lsb;
          event.dataLength = 2;
          break;
          
        default:
          event.dataLength = 2;
      }
    } else if (status === 0xFF) {
      // 메타 이벤트
      const metaType = dataView.getUint8(offset);
      const length = this.readVariableLength(dataView, offset + 1);
      
      event.type = 'meta';
      event.metaType = metaType;
      event.dataLength = 1 + this.getVariableLengthSize(dataView, offset + 1) + length;
      
      switch (metaType) {
        case 0x51: // Set Tempo
          const microsecondsPerQuarter = (dataView.getUint8(offset + 2) << 16) |
                                        (dataView.getUint8(offset + 3) << 8) |
                                        dataView.getUint8(offset + 4);
          event.bpm = 60000000 / microsecondsPerQuarter;
          break;
          
        case 0x58: // Time Signature
          event.numerator = dataView.getUint8(offset + 2);
          event.denominator = Math.pow(2, dataView.getUint8(offset + 3));
          break;
      }
    }
    
    return event;
  }

  // 가변 길이 값 읽기
  readVariableLength(dataView, offset) {
    let value = 0;
    let byte;
    
    do {
      byte = dataView.getUint8(offset++);
      value = (value << 7) | (byte & 0x7F);
    } while (byte & 0x80);
    
    return value;
  }

  // 가변 길이 크기 계산
  getVariableLengthSize(dataView, offset) {
    let size = 0;
    let byte;
    
    do {
      byte = dataView.getUint8(offset + size);
      size++;
    } while (byte & 0x80);
    
    return size;
  }

  // 문자열 읽기
  readString(dataView, offset, length) {
    let str = '';
    for (let i = 0; i < length; i++) {
      str += String.fromCharCode(dataView.getUint8(offset + i));
    }
    return str;
  }

  // MIDI 데이터 처리
  processMIDIData(midiData) {
    this.tracks = [];
    this.events = [];
    
    midiData.tracks.forEach((track, trackIndex) => {
      const processedTrack = {
        id: trackIndex,
        name: `Track ${trackIndex + 1}`,
        events: track.events,
        instrument: 0,
        volume: 100,
        pan: 64,
        muted: false,
        solo: false
      };
      
      this.tracks.push(processedTrack);
      
      // 모든 이벤트를 시간순으로 정렬하기 위해 수집
      track.events.forEach(event => {
        this.events.push({
          ...event,
          trackId: trackIndex
        });
      });
    });
    
    // 시간순 정렬
    this.events.sort((a, b) => a.time - b.time);
  }

  // MIDI 재생
  play(audioEngine, instruments) {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.currentTime = 0;
    this.startTime = performance.now();
    
    this.playEvents(audioEngine, instruments);
  }

  // 이벤트 재생
  playEvents(audioEngine, instruments) {
    const currentRealTime = performance.now() - this.startTime;
    const currentMIDITime = this.realTimeToMIDITime(currentRealTime);
    
    // 현재 시간에 재생할 이벤트들 찾기
    const eventsToPlay = this.events.filter(event => 
      event.time <= currentMIDITime && event.time > this.currentTime
    );
    
    eventsToPlay.forEach(event => {
      this.playEvent(event, audioEngine, instruments);
    });
    
    this.currentTime = currentMIDITime;
    
    if (this.isPlaying) {
      requestAnimationFrame(() => this.playEvents(audioEngine, instruments));
    }
  }

  // 개별 이벤트 재생
  playEvent(event, audioEngine, instruments) {
    const track = this.tracks[event.trackId];
    if (!track || track.muted) return;
    
    switch (event.type) {
      case 'noteOn':
        if (event.velocity > 0) {
          this.playNote(event, track, instruments);
        }
        break;
        
      case 'noteOff':
        this.stopNote(event, track, instruments);
        break;
        
      case 'programChange':
        track.instrument = event.program;
        break;
        
      case 'meta':
        if (event.metaType === 0x51 && event.bpm) {
          this.bpm = event.bpm;
        }
        break;
    }
  }

  // 노트 재생
  playNote(event, track, instruments) {
    const instrument = instruments[track.instrument] || instruments[0];
    if (!instrument) return;
    
    const frequency = this.midiNoteToFrequency(event.note);
    const velocity = event.velocity / 127;
    
    // 간단한 신서사이저로 노트 재생
    const oscillator = instrument.audioContext.createOscillator();
    const gainNode = instrument.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(instrument.output);
    
    oscillator.frequency.value = frequency;
    oscillator.type = instrument.waveform || 'sine';
    
    gainNode.gain.setValueAtTime(velocity * track.volume / 100, instrument.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, instrument.audioContext.currentTime + 1);
    
    oscillator.start();
    oscillator.stop(instrument.audioContext.currentTime + 1);
    
    // 노트 추적을 위해 저장
    if (!track.activeNotes) track.activeNotes = new Map();
    track.activeNotes.set(event.note, { oscillator, gainNode });
  }

  // 노트 정지
  stopNote(event, track, instruments) {
    if (!track.activeNotes) return;
    
    const noteData = track.activeNotes.get(event.note);
    if (noteData) {
      noteData.gainNode.gain.exponentialRampToValueAtTime(0.001, noteData.oscillator.context.currentTime + 0.1);
      noteData.oscillator.stop(noteData.oscillator.context.currentTime + 0.1);
      track.activeNotes.delete(event.note);
    }
  }

  // MIDI 노트 번호를 주파수로 변환
  midiNoteToFrequency(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  // 실시간을 MIDI 시간으로 변환
  realTimeToMIDITime(realTime) {
    const beatsPerSecond = this.bpm / 60;
    const ticksPerSecond = beatsPerSecond * this.ticksPerQuarter;
    return (realTime / 1000) * ticksPerSecond;
  }

  // MIDI 시간을 실시간으로 변환
  midiTimeToRealTime(midiTime) {
    const beatsPerSecond = this.bpm / 60;
    const ticksPerSecond = beatsPerSecond * this.ticksPerQuarter;
    return (midiTime / ticksPerSecond) * 1000;
  }

  // 재생 정지
  stop() {
    this.isPlaying = false;
    this.currentTime = 0;
    
    // 모든 활성 노트 정지
    this.tracks.forEach(track => {
      if (track.activeNotes) {
        track.activeNotes.forEach(noteData => {
          noteData.oscillator.stop();
        });
        track.activeNotes.clear();
      }
    });
  }

  // MIDI 파일로 내보내기
  exportToMIDI() {
    // MIDI 파일 생성 로직 (간단한 구현)
    const header = this.createMIDIHeader();
    const tracks = this.tracks.map(track => this.createMIDITrack(track));
    
    return this.combineMIDIData(header, tracks);
  }

  createMIDIHeader() {
    const buffer = new ArrayBuffer(14);
    const view = new DataView(buffer);
    
    // "MThd"
    view.setUint32(0, 0x4D546864);
    // 헤더 길이
    view.setUint32(4, 6);
    // 포맷
    view.setUint16(8, 1);
    // 트랙 수
    view.setUint16(10, this.tracks.length);
    // 틱/쿼터
    view.setUint16(12, this.ticksPerQuarter);
    
    return buffer;
  }

  createMIDITrack(track) {
    // 간단한 트랙 생성 (실제로는 더 복잡한 로직 필요)
    const events = track.events.map(event => this.eventToMIDIBytes(event));
    const trackData = this.combineEventData(events);
    
    const buffer = new ArrayBuffer(8 + trackData.byteLength);
    const view = new DataView(buffer);
    
    // "MTrk"
    view.setUint32(0, 0x4D54726B);
    // 트랙 길이
    view.setUint32(4, trackData.byteLength);
    
    // 트랙 데이터 복사
    new Uint8Array(buffer, 8).set(new Uint8Array(trackData));
    
    return buffer;
  }

  eventToMIDIBytes(event) {
    // 이벤트를 MIDI 바이트로 변환 (간단한 구현)
    return new Uint8Array([event.status, event.note || 0, event.velocity || 0]);
  }

  combineEventData(events) {
    const totalLength = events.reduce((sum, event) => sum + event.byteLength, 0);
    const buffer = new ArrayBuffer(totalLength);
    const view = new Uint8Array(buffer);
    
    let offset = 0;
    events.forEach(event => {
      view.set(new Uint8Array(event), offset);
      offset += event.byteLength;
    });
    
    return buffer;
  }

  combineMIDIData(header, tracks) {
    const totalLength = header.byteLength + tracks.reduce((sum, track) => sum + track.byteLength, 0);
    const buffer = new ArrayBuffer(totalLength);
    const view = new Uint8Array(buffer);
    
    let offset = 0;
    
    // 헤더 복사
    view.set(new Uint8Array(header), offset);
    offset += header.byteLength;
    
    // 트랙들 복사
    tracks.forEach(track => {
      view.set(new Uint8Array(track), offset);
      offset += track.byteLength;
    });
    
    return buffer;
  }
}

// 가상 악기 클래스
export class VirtualInstrument {
  constructor(audioContext) {
    this.audioContext = audioContext;
    this.output = audioContext.createGain();
    this.waveform = 'sine';
    this.envelope = {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.7,
      release: 0.3
    };
  }

  connect(destination) {
    this.output.connect(destination);
  }

  setWaveform(waveform) {
    this.waveform = waveform;
  }

  setEnvelope(attack, decay, sustain, release) {
    this.envelope = { attack, decay, sustain, release };
  }
}

// 싱글톤 인스턴스
export const midiProcessor = new MIDIProcessor();
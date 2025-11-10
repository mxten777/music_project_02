// 음악 유틸리티 클래스
export class MusicUtils {
  // 노트를 주파수로 변환
  static noteToFrequency(noteName, octave) {
    const noteMap = {
      'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4,
      'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2
    };
    
    const A4Frequency = 440;
    const semitonesFromA4 = (octave - 4) * 12 + (noteMap[noteName] || 0);
    
    return A4Frequency * Math.pow(2, semitonesFromA4 / 12);
  }

  // BPM을 밀리초로 변환
  static bpmToMs(bpm, noteValue = 4) {
    // noteValue: 1=온음표, 2=2분음표, 4=4분음표, 8=8분음표
    const quarterNoteMs = (60 / bpm) * 1000;
    return quarterNoteMs * (4 / noteValue);
  }

  // 주파수를 노트 이름으로 변환
  static frequencyToNote(frequency) {
    const A4 = 440;
    const semitones = Math.round(12 * Math.log2(frequency / A4));
    const octave = Math.floor(semitones / 12) + 4;
    const noteIndex = ((semitones % 12) + 12) % 12;
    
    const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
    return {
      note: notes[noteIndex],
      octave: octave,
      frequency: frequency
    };
  }

  // 음정 간격 계산
  static calculateInterval(note1, note2) {
    const freq1 = typeof note1 === 'number' ? note1 : note1.frequency;
    const freq2 = typeof note2 === 'number' ? note2 : note2.frequency;
    
    const semitones = Math.round(12 * Math.log2(freq2 / freq1));
    return semitones;
  }

  // 화성 분석
  static analyzeHarmony(notes) {
    if (!Array.isArray(notes) || notes.length < 2) return null;
    
    const intervals = [];
    for (let i = 1; i < notes.length; i++) {
      intervals.push(this.calculateInterval(notes[0], notes[i]));
    }
    
    return {
      rootNote: notes[0],
      intervals: intervals,
      chordType: this.identifyChordType(intervals)
    };
  }

  // 코드 타입 식별
  static identifyChordType(intervals) {
    const intervalStr = intervals.sort((a, b) => a - b).join(',');
    
    const chordTypes = {
      '4,7': 'major',
      '3,7': 'minor',
      '4,8': 'augmented',
      '3,6': 'diminished',
      '4,7,11': 'major7',
      '3,7,10': 'minor7',
      '4,7,10': 'dominant7',
      '3,6,9': 'diminished7'
    };
    
    return chordTypes[intervalStr] || 'unknown';
  }

  // 스케일 생성
  static generateScale(rootNote, scaleType = 'major') {
    const scalePatterns = {
      major: [0, 2, 4, 5, 7, 9, 11],
      minor: [0, 2, 3, 5, 7, 8, 10],
      dorian: [0, 2, 3, 5, 7, 9, 10],
      mixolydian: [0, 2, 4, 5, 7, 9, 10],
      pentatonic: [0, 2, 4, 7, 9],
      blues: [0, 3, 5, 6, 7, 10]
    };
    
    const pattern = scalePatterns[scaleType] || scalePatterns.major;
    const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootIndex = chromaticScale.indexOf(rootNote);
    
    return pattern.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      return chromaticScale[noteIndex];
    });
  }

  // 템포 분석
  static analyzeTempo(timestamps) {
    if (!Array.isArray(timestamps) || timestamps.length < 2) return null;
    
    const intervals = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = Math.round(60000 / avgInterval); // 밀리초를 BPM으로 변환
    
    return {
      bpm: bpm,
      avgInterval: avgInterval,
      stability: this.calculateTempoStability(intervals)
    };
  }

  // 템포 안정성 계산
  static calculateTempoStability(intervals) {
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    
    // 표준편차가 낮을수록 안정적
    const stability = Math.max(0, 1 - (stdDev / mean));
    return Math.round(stability * 100) / 100;
  }

  // 음량 정규화
  static normalizeVolume(audioData, targetVolume = 0.7) {
    if (!Array.isArray(audioData)) return audioData;
    
    const maxAmplitude = Math.max(...audioData.map(Math.abs));
    if (maxAmplitude === 0) return audioData;
    
    const scaleFactor = targetVolume / maxAmplitude;
    return audioData.map(sample => sample * scaleFactor);
  }

  // 페이드 인/아웃 적용
  static applyFade(audioData, fadeInDuration = 0.1, fadeOutDuration = 0.1, sampleRate = 44100) {
    if (!Array.isArray(audioData)) return audioData;
    
    const fadeInSamples = Math.floor(fadeInDuration * sampleRate);
    const fadeOutSamples = Math.floor(fadeOutDuration * sampleRate);
    const result = [...audioData];
    
    // 페이드 인
    for (let i = 0; i < Math.min(fadeInSamples, result.length); i++) {
      const factor = i / fadeInSamples;
      result[i] *= factor;
    }
    
    // 페이드 아웃
    const startFadeOut = Math.max(0, result.length - fadeOutSamples);
    for (let i = startFadeOut; i < result.length; i++) {
      const factor = (result.length - i) / fadeOutSamples;
      result[i] *= factor;
    }
    
    return result;
  }

  // 비트 탐지
  static detectBeats(audioData, sampleRate = 44100, windowSize = 1024) {
    if (!Array.isArray(audioData)) return [];
    
    const energyWindow = [];
    const beats = [];
    const stepSize = windowSize / 4;
    
    for (let i = 0; i < audioData.length - windowSize; i += stepSize) {
      const window = audioData.slice(i, i + windowSize);
      const energy = window.reduce((sum, sample) => sum + sample * sample, 0);
      energyWindow.push({
        time: i / sampleRate,
        energy: energy
      });
    }
    
    // 에너지 피크 찾기
    const avgEnergy = energyWindow.reduce((sum, w) => sum + w.energy, 0) / energyWindow.length;
    const threshold = avgEnergy * 1.5;
    
    for (let i = 1; i < energyWindow.length - 1; i++) {
      const current = energyWindow[i];
      const prev = energyWindow[i - 1];
      const next = energyWindow[i + 1];
      
      if (current.energy > threshold && 
          current.energy > prev.energy && 
          current.energy > next.energy) {
        beats.push(current.time);
      }
    }
    
    return beats;
  }

  // 음악적 거리 계산 (유사도)
  static calculateMusicalDistance(melody1, melody2) {
    if (!Array.isArray(melody1) || !Array.isArray(melody2)) return 1;
    
    const maxLength = Math.max(melody1.length, melody2.length);
    const minLength = Math.min(melody1.length, melody2.length);
    
    let distance = 0;
    
    // 동적 시간 워핑 간단 버전
    for (let i = 0; i < minLength; i++) {
      const freq1 = melody1[i].frequency || 0;
      const freq2 = melody2[i].frequency || 0;
      const semitoneDistance = Math.abs(12 * Math.log2(freq2 / freq1)) || 0;
      distance += semitoneDistance;
    }
    
    // 길이 차이 페널티
    distance += (maxLength - minLength) * 2;
    
    // 0-1 사이로 정규화
    return Math.min(1, distance / (maxLength * 12));
  }

  // 조성 분석
  static analyzeKey(notes) {
    if (!Array.isArray(notes) || notes.length === 0) return null;
    
    const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteCounts = new Array(12).fill(0);
    
    // 노트 빈도 계산
    notes.forEach(note => {
      const noteName = typeof note === 'string' ? note : note.note;
      const index = chromaticScale.indexOf(noteName);
      if (index !== -1) {
        noteCounts[index]++;
      }
    });
    
    // 각 키에 대한 점수 계산
    const majorWeights = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
    const minorWeights = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
    
    let bestKey = null;
    let bestScore = -1;
    
    for (let root = 0; root < 12; root++) {
      // Major key score
      let majorScore = 0;
      for (let i = 0; i < 12; i++) {
        majorScore += noteCounts[i] * majorWeights[(i - root + 12) % 12];
      }
      
      if (majorScore > bestScore) {
        bestScore = majorScore;
        bestKey = { key: chromaticScale[root], mode: 'major', confidence: majorScore };
      }
      
      // Minor key score
      let minorScore = 0;
      for (let i = 0; i < 12; i++) {
        minorScore += noteCounts[i] * minorWeights[(i - root + 12) % 12];
      }
      
      if (minorScore > bestScore) {
        bestScore = minorScore;
        bestKey = { key: chromaticScale[root], mode: 'minor', confidence: minorScore };
      }
    }
    
    return bestKey;
  }
}
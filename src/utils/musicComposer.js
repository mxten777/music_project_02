// 음악 생성 엔진 확장 - 코드 진행, 멜로디, 리듬 생성
import { MusicUtils } from './musicGenerationEngine.js';

export class MusicComposer {
  constructor(engine) {
    this.engine = engine;
  }

  // 코드 진행 생성
  generateChordProgression(progressionType, key, structure) {
    const progressions = this.engine.musicTheory.progressions;
    const baseProgression = progressions[progressionType] || progressions.ballad;
    
    // 로마 숫자를 실제 코드로 변환
    const keyChords = this.getKeyChords(key);
    const chordProgression = [];
    
    structure.forEach((section, sectionIndex) => {
      const sectionChords = [];
      const linesInSection = section.lines.length;
      
      // 섹션별로 코드 진행 조정
      let progressionToUse = baseProgression;
      if (section.type === 'chorus') {
        progressionToUse = this.makeProgressionMoreDynamic(baseProgression);
      } else if (section.type === 'bridge') {
        progressionToUse = this.createBridgeProgression(baseProgression);
      }
      
      // 가사 줄 수에 맞춰 코드 배치
      for (let i = 0; i < linesInSection; i++) {
        const progressionIndex = i % progressionToUse.length;
        const romanNumeral = progressionToUse[progressionIndex];
        const chord = this.romanToChord(romanNumeral, keyChords);
        
        sectionChords.push({
          roman: romanNumeral,
          chord: chord,
          line: i,
          duration: this.calculateChordDuration(section.lines[i]),
          voicing: this.generateVoicing(chord, section.type)
        });
      }
      
      chordProgression.push({
        section: section.type,
        sectionIndex,
        chords: sectionChords
      });
    });
    
    return chordProgression;
  }

  // 키에 따른 코드 맵핑
  getKeyChords(key) {
    const majorKeys = {
      'C': ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
      'D': ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
      'E': ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
      'F': ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'],
      'G': ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
      'A': ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
      'B': ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim']
    };
    
    return majorKeys[key] || majorKeys['C'];
  }

  // 로마 숫자를 코드로 변환
  romanToChord(roman, keyChords) {
    const romanMap = {
      'I': 0, 'ii': 1, 'iii': 2, 'IV': 3, 'V': 4, 'vi': 5, 'vii°': 6
    };
    
    const index = romanMap[roman] || 0;
    return keyChords[index];
  }

  // 코드 지속 시간 계산
  calculateChordDuration(line) {
    const syllables = this.engine.countSyllables(line);
    // 음절 수에 따라 코드 지속 시간 조정
    if (syllables <= 4) return 4; // 1마디
    if (syllables <= 8) return 2; // 2분음표
    return 1; // 4분음표
  }

  // 코드 보이싱 생성
  generateVoicing(chord, sectionType) {
    const basicVoicing = this.getBasicVoicing(chord);
    
    // 섹션 타입에 따라 보이싱 조정
    switch (sectionType) {
      case 'verse':
        return this.createSimpleVoicing(basicVoicing);
      case 'chorus':
        return this.createFullVoicing(basicVoicing);
      case 'bridge':
        return this.createInterestingVoicing(basicVoicing);
      default:
        return basicVoicing;
    }
  }

  // 기본 보이싱
  getBasicVoicing(chord) {
    // 코드명에서 노트 추출
    const root = chord.replace(/[^A-G#b]/g, '');
    const quality = chord.replace(/^[A-G#b]+/, '');
    
    const chordTones = this.engine.musicTheory.chords;
    let intervals = chordTones.major; // 기본값
    
    if (quality.includes('m') && !quality.includes('maj')) {
      intervals = chordTones.minor;
    } else if (quality.includes('7')) {
      intervals = quality.includes('maj7') ? chordTones.major7 : chordTones.dominant7;
    }
    
    return {
      root,
      quality,
      intervals,
      notes: this.intervalsToNotes(root, intervals)
    };
  }

  // 인터벌을 노트로 변환
  intervalsToNotes(root, intervals) {
    const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootIndex = noteOrder.indexOf(root);
    
    return intervals.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      return noteOrder[noteIndex];
    });
  }

  // 멜로디 생성
  generateMelody(lyricsAnalysis, chordProgression, musicParams, key) {
    const melody = [];
    const scale = this.engine.musicTheory.scales[musicParams.scale] || this.engine.musicTheory.scales.major;
    const keyScale = this.generateKeyScale(key, scale);
    
    chordProgression.forEach((section, sectionIndex) => {
      const sectionMelody = [];
      
      section.chords.forEach((chordInfo, _chordIndex) => {
        const line = lyricsAnalysis.structure[sectionIndex].lines[chordInfo.line];
        const syllablePattern = lyricsAnalysis.syllablePattern[chordInfo.line + sectionIndex * 10] || { syllables: 4, rhythm: [] };
        
        // 각 음절에 대해 멜로디 노트 생성
        const lineNotes = this.generateLineNotes(
          line,
          syllablePattern,
          chordInfo,
          keyScale,
          section.section,
          musicParams
        );
        
        sectionMelody.push({
          line: chordInfo.line,
          chord: chordInfo.chord,
          notes: lineNotes,
          lyrics: line
        });
      });
      
      melody.push({
        section: section.section,
        sectionIndex,
        melody: sectionMelody
      });
    });
    
    return melody;
  }

  // 키 스케일 생성
  generateKeyScale(key, scaleIntervals) {
    const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootIndex = noteOrder.indexOf(key);
    
    return scaleIntervals.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      return noteOrder[noteIndex];
    });
  }

  // 라인별 멜로디 노트 생성
  generateLineNotes(line, syllablePattern, chordInfo, keyScale, sectionType, musicParams) {
    const words = line.split(/\s+/).filter(word => word.trim());
    const notes = [];
    
    let currentScaleIndex = this.getStartingNote(sectionType, keyScale);
    let octave = 4;
    
    words.forEach((word, wordIndex) => {
      const syllables = this.engine.countSyllables(word);
      const wordNotes = [];
      
      for (let i = 0; i < syllables; i++) {
        // 코드 톤과 스케일을 고려한 멜로디 생성
        const note = this.selectMelodyNote(
          currentScaleIndex,
          keyScale,
          chordInfo,
          i === 0, // 첫 음절인지
          octave,
          musicParams
        );
        
        const duration = this.calculateNoteDuration(
          syllables,
          i,
          syllablePattern.rhythm[wordIndex] || { stress: [1] }
        );
        
        wordNotes.push({
          note: note.note,
          octave: note.octave,
          frequency: MusicUtils.noteToFrequency(note.note, note.octave),
          duration,
          syllable: word.charAt(i) || word,
          isStressed: this.isStressed(i, syllables)
        });
        
        // 다음 노트를 위한 인덱스 조정
        currentScaleIndex = this.getNextNoteIndex(
          currentScaleIndex,
          keyScale.length,
          musicParams.emotion,
          note.direction
        );
      }
      
      notes.push({
        word,
        wordIndex,
        notes: wordNotes
      });
    });
    
    return notes;
  }

  // 섹션별 시작 노트 결정
  getStartingNote(sectionType, _keyScale) {
    switch (sectionType) {
      case 'verse':
        return 0; // 토닉
      case 'chorus':
        return 4; // 5도
      case 'bridge':
        return 2; // 3도
      default:
        return 0;
    }
  }

  // 멜로디 노트 선택
  selectMelodyNote(scaleIndex, keyScale, chordInfo, isFirstSyllable, octave, musicParams) {
    let selectedIndex = scaleIndex;
    let selectedOctave = octave;
    let direction = 0; // -1: 하강, 0: 동일, 1: 상승
    
    // 코드 톤을 우선적으로 사용
    if (isFirstSyllable && chordInfo.voicing && chordInfo.voicing.notes) {
      const chordTones = chordInfo.voicing.notes;
      const chordToneInScale = keyScale.findIndex(note => chordTones.includes(note));
      if (chordToneInScale >= 0) {
        selectedIndex = chordToneInScale;
      }
    }
    
    // 감정에 따른 멜로디 방향성 조정
    const emotionTendency = this.getEmotionTendency(musicParams.emotion);
    const random = Math.random();
    
    if (random < emotionTendency.ascending) {
      selectedIndex = Math.min(selectedIndex + 1, keyScale.length - 1);
      direction = 1;
      if (selectedIndex >= keyScale.length - 2) {
        selectedOctave = Math.min(octave + 1, 6);
        selectedIndex = 0;
      }
    } else if (random < emotionTendency.ascending + emotionTendency.descending) {
      selectedIndex = Math.max(selectedIndex - 1, 0);
      direction = -1;
      if (selectedIndex <= 1) {
        selectedOctave = Math.max(octave - 1, 3);
        selectedIndex = keyScale.length - 1;
      }
    }
    
    return {
      note: keyScale[selectedIndex],
      octave: selectedOctave,
      direction
    };
  }

  // 감정별 멜로디 경향
  getEmotionTendency(emotion) {
    const tendencies = {
      happy: { ascending: 0.6, descending: 0.2, stable: 0.2 },
      sad: { ascending: 0.2, descending: 0.6, stable: 0.2 },
      romantic: { ascending: 0.4, descending: 0.3, stable: 0.3 },
      nostalgic: { ascending: 0.3, descending: 0.4, stable: 0.3 },
      energetic: { ascending: 0.7, descending: 0.1, stable: 0.2 },
      peaceful: { ascending: 0.3, descending: 0.3, stable: 0.4 }
    };
    
    return tendencies[emotion] || tendencies.nostalgic;
  }

  // 다음 노트 인덱스 계산
  getNextNoteIndex(currentIndex, scaleLength, emotion, direction) {
    const stepSize = this.getStepSize(emotion);
    let nextIndex = currentIndex;
    
    if (direction > 0) {
      nextIndex = (currentIndex + stepSize) % scaleLength;
    } else if (direction < 0) {
      nextIndex = (currentIndex - stepSize + scaleLength) % scaleLength;
    } else {
      // 같은 옥타브 내에서 작은 움직임
      const variation = Math.random() > 0.5 ? 1 : -1;
      nextIndex = (currentIndex + variation + scaleLength) % scaleLength;
    }
    
    return nextIndex;
  }

  // 감정별 스텝 크기
  getStepSize(emotion) {
    const stepSizes = {
      happy: 2,     // 큰 도약
      sad: 1,       // 작은 스텝
      romantic: 1,  // 부드러운 움직임
      nostalgic: 1, // 조용한 움직임
      energetic: 3, // 역동적인 도약
      peaceful: 1   // 안정적인 움직임
    };
    
    return stepSizes[emotion] || 1;
  }

  // 노트 지속시간 계산
  calculateNoteDuration(syllableCount, syllableIndex, rhythmInfo) {
    const baseDuration = 0.5; // 기본 0.5초
    const stressMultiplier = rhythmInfo.stress && rhythmInfo.stress[syllableIndex] ? 1.2 : 0.8;
    
    // 마지막 음절은 약간 길게
    const positionMultiplier = syllableIndex === syllableCount - 1 ? 1.3 : 1.0;
    
    return baseDuration * stressMultiplier * positionMultiplier;
  }

  // 강세 판단
  isStressed(syllableIndex, totalSyllables) {
    if (totalSyllables === 1) return true;
    if (totalSyllables === 2) return syllableIndex === 0;
    if (totalSyllables === 3) return syllableIndex === 0 || syllableIndex === 2;
    return syllableIndex % 2 === 0; // 짝수 인덱스에 강세
  }

  // 리듬 패턴 생성
  generateRhythmPattern(genre, tempo, syllablePattern) {
    const basePatterns = {
      ballad: [1, 0, 0.5, 0, 0.8, 0, 0.3, 0],
      pop: [1, 0.3, 0.8, 0.3, 1, 0.3, 0.8, 0.3],
      rock: [1, 0, 1, 0, 1, 0, 1, 0],
      jazz: [1, 0.2, 0.6, 0.8, 0.4, 0.9, 0.3, 0.7],
      folk: [1, 0, 0.6, 0, 0.8, 0, 0.4, 0],
      enka: [1, 0, 0.3, 0, 0.6, 0, 0.2, 0]
    };
    
    const basePattern = basePatterns[genre] || basePatterns.ballad;
    const beatDuration = MusicUtils.bpmToMs(tempo, 4);
    
    return {
      genre,
      tempo,
      beatDuration,
      pattern: basePattern,
      measures: this.generateMeasures(basePattern, syllablePattern, tempo),
      swing: this.getSwingFactor(genre),
      dynamics: this.generateDynamics(genre, syllablePattern)
    };
  }

  // 마디 생성
  generateMeasures(basePattern, syllablePattern, tempo) {
    const measuresNeeded = Math.ceil(syllablePattern.length / 4);
    const measures = [];
    
    for (let i = 0; i < measuresNeeded; i++) {
      const measure = {
        index: i,
        beats: [...basePattern],
        timeSignature: { numerator: 4, denominator: 4 },
        tempo: tempo
      };
      
      // 가사의 음절 패턴에 맞춰 리듬 조정
      const relevantSyllables = syllablePattern.slice(i * 4, (i + 1) * 4);
      measure.beats = this.adaptRhythmToSyllables(measure.beats, relevantSyllables);
      
      measures.push(measure);
    }
    
    return measures;
  }

  // 음절에 맞춰 리듬 조정
  adaptRhythmToSyllables(beats, syllables) {
    const adaptedBeats = [...beats];
    
    syllables.forEach((syllableInfo, index) => {
      if (index < beats.length && syllableInfo) {
        const intensity = Math.min(syllableInfo.syllables / 4, 1); // 음절 수에 따른 강도
        adaptedBeats[index] = Math.max(adaptedBeats[index], intensity * 0.7);
      }
    });
    
    return adaptedBeats;
  }

  // 스윙 팩터
  getSwingFactor(genre) {
    const swingFactors = {
      jazz: 0.67,    // 강한 스윙
      blues: 0.6,    // 중간 스윙
      ballad: 0.52,  // 약간의 스윙
      folk: 0.51,    // 거의 스트레이트
      pop: 0.5,      // 스트레이트
      rock: 0.5      // 스트레이트
    };
    
    return swingFactors[genre] || 0.5;
  }

  // 다이나믹 생성
  generateDynamics(genre, _syllablePattern) {
    const baseDynamics = {
      ballad: { verse: 0.4, chorus: 0.6, bridge: 0.3 },
      pop: { verse: 0.6, chorus: 0.8, bridge: 0.5 },
      rock: { verse: 0.7, chorus: 0.9, bridge: 0.6 },
      jazz: { verse: 0.5, chorus: 0.7, bridge: 0.6 },
      folk: { verse: 0.4, chorus: 0.6, bridge: 0.4 },
      enka: { verse: 0.3, chorus: 0.5, bridge: 0.3 }
    };
    
    return baseDynamics[genre] || baseDynamics.ballad;
  }

  // 악기 편성 선택
  selectInstrumentation(genre, emotion) {
    const instrumentations = {
      ballad: {
        lead: ['piano', 'acoustic_guitar'],
        harmony: ['strings', 'pad'],
        rhythm: ['soft_drums', 'bass'],
        color: ['flute', 'violin']
      },
      pop: {
        lead: ['electric_piano', 'synth_lead'],
        harmony: ['electric_guitar', 'synth_pad'],
        rhythm: ['drums', 'bass', 'percussion'],
        color: ['brass', 'backing_vocals']
      },
      rock: {
        lead: ['electric_guitar', 'distorted_guitar'],
        harmony: ['power_chords', 'organ'],
        rhythm: ['rock_drums', 'bass_guitar'],
        color: ['guitar_solo', 'harmonica']
      },
      jazz: {
        lead: ['jazz_piano', 'saxophone'],
        harmony: ['jazz_guitar', 'vibraphone'],
        rhythm: ['jazz_drums', 'upright_bass'],
        color: ['trumpet', 'clarinet']
      },
      folk: {
        lead: ['acoustic_guitar', 'banjo'],
        harmony: ['mandolin', 'harmonica'],
        rhythm: ['cajon', 'acoustic_bass'],
        color: ['violin', 'flute']
      },
      enka: {
        lead: ['shamisen', 'koto'],
        harmony: ['traditional_strings'],
        rhythm: ['traditional_drums', 'bass'],
        color: ['shakuhachi', 'taiko']
      }
    };
    
    const baseInstrumentation = instrumentations[genre] || instrumentations.ballad;
    
    // 감정에 따른 악기 조정
    return this.adjustInstrumentationForEmotion(baseInstrumentation, emotion);
  }

  // 감정에 따른 악기 편성 조정
  adjustInstrumentationForEmotion(instrumentation, emotion) {
    const adjustments = {
      happy: { add: ['tambourine', 'bells'], remove: [] },
      sad: { add: ['cello', 'rain'], remove: ['percussion'] },
      romantic: { add: ['saxophone', 'soft_strings'], remove: ['drums'] },
      nostalgic: { add: ['music_box', 'old_piano'], remove: [] },
      energetic: { add: ['electric_guitar', 'heavy_drums'], remove: [] },
      peaceful: { add: ['wind_chimes', 'nature_sounds'], remove: ['drums'] }
    };
    
    const adjustment = adjustments[emotion] || { add: [], remove: [] };
    
    return {
      ...instrumentation,
      color: [...instrumentation.color, ...adjustment.add].filter(
        instrument => !adjustment.remove.includes(instrument)
      )
    };
  }

  // 곡 길이 계산
  calculateDuration(lyricsAnalysis, tempo) {
    const totalSyllables = lyricsAnalysis.syllableCount;
    const avgSyllablesPerMinute = tempo * 2; // 대략적인 추정
    const estimatedMinutes = totalSyllables / avgSyllablesPerMinute;
    
    // 구조에 따른 조정 (후렴 반복 등)
    const structureMultiplier = lyricsAnalysis.structure.length > 4 ? 1.3 : 1.1;
    
    return Math.max(120, Math.round(estimatedMinutes * 60 * structureMultiplier)); // 최소 2분
  }
}

export default MusicComposer;
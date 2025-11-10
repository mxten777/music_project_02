// 고급 음악 생성 AI 엔진
import { MusicUtils } from './musicUtils.js';

export class MusicGenerationEngine {
  constructor() {
    this.initialized = false;
    this.audioContext = null;
    this.oscillators = [];
    this.analyser = null;
    this.gainNode = null;
    this.currentSequence = null;
    this.isPlaying = false;
    
    // 음악 이론 기반 데이터
    this.musicTheory = {
      scales: {
        major: [0, 2, 4, 5, 7, 9, 11],
        minor: [0, 2, 3, 5, 7, 8, 10],
        pentatonic: [0, 2, 4, 7, 9],
        blues: [0, 3, 5, 6, 7, 10],
        dorian: [0, 2, 3, 5, 7, 9, 10],
        mixolydian: [0, 2, 4, 5, 7, 9, 10]
      },
      chords: {
        major: [0, 4, 7],
        minor: [0, 3, 7],
        major7: [0, 4, 7, 11],
        minor7: [0, 3, 7, 10],
        dominant7: [0, 4, 7, 10],
        diminished: [0, 3, 6],
        augmented: [0, 4, 8]
      },
      progressions: {
        pop: ['I', 'V', 'vi', 'IV'],
        ballad: ['I', 'vi', 'IV', 'V'],
        jazz: ['I', 'vi', 'ii', 'V'],
        folk: ['I', 'IV', 'I', 'V'],
        blues: ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'V']
      },
      tempos: {
        ballad: { min: 60, max: 80 },
        pop: { min: 100, max: 130 },
        rock: { min: 120, max: 160 },
        jazz: { min: 80, max: 140 },
        folk: { min: 70, max: 110 },
        enka: { min: 65, max: 85 }
      }
    };
    
    // 감정별 음악 매개변수
    this.emotionMappings = {
      happy: {
        scale: 'major',
        tempo: 120,
        dynamics: 'forte',
        brightness: 0.8,
        progression: 'pop'
      },
      sad: {
        scale: 'minor',
        tempo: 70,
        dynamics: 'piano',
        brightness: 0.3,
        progression: 'ballad'
      },
      romantic: {
        scale: 'major',
        tempo: 75,
        dynamics: 'mezzo-piano',
        brightness: 0.6,
        progression: 'ballad'
      },
      nostalgic: {
        scale: 'dorian',
        tempo: 80,
        dynamics: 'mezzo-piano',
        brightness: 0.4,
        progression: 'folk'
      },
      energetic: {
        scale: 'mixolydian',
        tempo: 140,
        dynamics: 'fortissimo',
        brightness: 0.9,
        progression: 'pop'
      },
      peaceful: {
        scale: 'pentatonic',
        tempo: 85,
        dynamics: 'pianissimo',
        brightness: 0.5,
        progression: 'folk'
      }
    };
  }

  // 음악 생성 엔진 초기화
  async initialize() {
    try {
      // Web Audio API 초기화
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // 분석기 노드 생성
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      
      // 게인 노드 생성
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      
      this.initialized = true;
      console.log('🎵 음악 생성 엔진이 초기화되었습니다.');
      
      return true;
    } catch (error) {
      console.error('음악 생성 엔진 초기화 실패:', error);
      return false;
    }
  }

  // 가사 기반 음악 생성
  async generateMusicFromLyrics(lyrics, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    const {
      genre = 'ballad',
      emotion = 'nostalgic',
      userStyle = null,
      tempo = null,
      key = 'C'
    } = options;

    try {
      // 1. 가사 분석
      const lyricsAnalysis = this.analyzeLyrics(lyrics);
      
      // 2. 감정과 장르에 기반한 음악 매개변수 결정
      const musicParams = this.determineMusicParameters(
        lyricsAnalysis, 
        genre, 
        emotion, 
        userStyle
      );
      
      // 3. 코드 진행 생성
      const chordProgression = this.generateChordProgression(
        musicParams.progression,
        key,
        lyricsAnalysis.structure
      );
      
      // 4. 멜로디 생성
      const melody = this.generateMelody(
        lyricsAnalysis,
        chordProgression,
        musicParams,
        key
      );
      
      // 5. 리듬 패턴 생성
      const rhythmPattern = this.generateRhythmPattern(
        genre,
        musicParams.tempo,
        lyricsAnalysis.syllablePattern
      );
      
      // 6. 악기 편성 결정
      const instrumentation = this.selectInstrumentation(genre, emotion);
      
      // 7. 음악 데이터 생성
      const musicData = {
        id: `music-${Date.now()}`,
        title: lyricsAnalysis.title || '생성된 곡',
        lyrics,
        genre,
        emotion,
        key,
        tempo: tempo || musicParams.tempo,
        chordProgression,
        melody,
        rhythmPattern,
        instrumentation,
        structure: lyricsAnalysis.structure,
        duration: this.calculateDuration(lyricsAnalysis, musicParams.tempo),
        generatedAt: new Date().toISOString(),
        parameters: musicParams
      };
      
      console.log('🎼 음악이 성공적으로 생성되었습니다:', musicData);
      
      return musicData;
      
    } catch (error) {
      console.error('음악 생성 중 오류 발생:', error);
      throw new Error(`음악 생성 실패: ${error.message}`);
    }
  }

  // 가사 분석
  analyzeLyrics(lyrics) {
    const lines = lyrics.split('\n').filter(line => line.trim());
    const words = lyrics.split(/\s+/).filter(word => word.trim());
    const syllables = this.countSyllables(lyrics);
    
    // 감정 키워드 분석
    const emotionKeywords = {
      happy: ['기쁨', '즐거운', '웃음', '행복', '밝은', '따뜻'],
      sad: ['슬픔', '눈물', '아픔', '그리움', '외로운', '쓸쓸'],
      romantic: ['사랑', '마음', '그대', '연인', '달콤', '포근'],
      nostalgic: ['추억', '옛날', '그때', '기억', '향수', '그리워'],
      energetic: ['힘', '용기', '도전', '열정', '꿈', '희망'],
      peaceful: ['평화', '고요', '잔잔', '편안', '조용', '안식']
    };
    
    const detectedEmotions = {};
    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      const matches = keywords.filter(keyword => lyrics.includes(keyword)).length;
      if (matches > 0) {
        detectedEmotions[emotion] = matches;
      }
    });
    
    // 구조 분석 (절, 후렴, 브릿지 등)
    const structure = this.analyzeStructure(lines);
    
    return {
      title: this.extractTitle(lines),
      lineCount: lines.length,
      wordCount: words.length,
      syllableCount: syllables,
      syllablePattern: this.analyzeSyllablePattern(lines),
      detectedEmotions,
      dominantEmotion: this.getDominantEmotion(detectedEmotions),
      structure,
      complexity: this.calculateComplexity(words, syllables),
      rhymeScheme: this.analyzeRhymeScheme(lines)
    };
  }

  // 음절 수 계산 (한국어 기준)
  countSyllables(text) {
    // 한글 음절 계산 (완성형 한글)
    const koreanSyllables = (text.match(/[가-힣]/g) || []).length;
    // 영어 음절 추정
    const englishWords = text.match(/[a-zA-Z]+/g) || [];
    const englishSyllables = englishWords.reduce((total, word) => {
      return total + Math.max(1, word.toLowerCase().match(/[aeiouy]+/g)?.length || 1);
    }, 0);
    
    return koreanSyllables + englishSyllables;
  }

  // 음절 패턴 분석
  analyzeSyllablePattern(lines) {
    return lines.map(line => {
      const syllables = this.countSyllables(line);
      const words = line.split(/\s+/).filter(word => word.trim()).length;
      return { syllables, words, rhythm: this.calculateRhythm(line) };
    });
  }

  // 리듬 계산
  calculateRhythm(line) {
    // 단어 길이와 음절 분포 기반 리듬 패턴
    const words = line.split(/\s+/).filter(word => word.trim());
    return words.map(word => ({
      length: word.length,
      syllables: this.countSyllables(word),
      stress: this.calculateStress(word)
    }));
  }

  // 강세 계산
  calculateStress(word) {
    // 한국어 단어의 강세 패턴 (간단한 휴리스틱)
    if (word.length <= 2) return [1];
    if (word.length === 3) return [1, 0, 1];
    if (word.length === 4) return [1, 0, 1, 0];
    return [1, 0, 1, 0, 1]; // 기본 패턴
  }

  // 구조 분석
  analyzeStructure(lines) {
    const structure = [];
    let currentSection = { type: 'verse', lines: [], startIndex: 0 };
    
    lines.forEach((line, index) => {
      if (line.trim() === '') {
        // 빈 줄은 새로운 섹션의 시작
        if (currentSection.lines.length > 0) {
          structure.push(currentSection);
          currentSection = { 
            type: this.predictSectionType(structure.length), 
            lines: [], 
            startIndex: index + 1 
          };
        }
      } else {
        currentSection.lines.push(line);
      }
    });
    
    if (currentSection.lines.length > 0) {
      structure.push(currentSection);
    }
    
    return structure;
  }

  // 섹션 타입 예측
  predictSectionType(sectionIndex) {
    const patterns = ['verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus'];
    return patterns[sectionIndex % patterns.length] || 'verse';
  }

  // 제목 추출
  extractTitle(lines) {
    if (lines.length === 0) return null;
    // 첫 번째 줄이나 반복되는 구문을 제목으로 사용
    const firstLine = lines[0].trim();
    return firstLine.length > 20 ? firstLine.substring(0, 20) : firstLine;
  }

  // 지배적 감정 결정
  getDominantEmotion(detectedEmotions) {
    const emotions = Object.entries(detectedEmotions);
    if (emotions.length === 0) return 'nostalgic'; // 기본값
    
    return emotions.reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }

  // 복잡도 계산
  calculateComplexity(words, syllables) {
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const syllableRatio = syllables / words.length;
    
    if (avgWordLength > 4 && syllableRatio > 2) return 'high';
    if (avgWordLength > 3 || syllableRatio > 1.5) return 'medium';
    return 'low';
  }

  // 운율 체계 분석
  analyzeRhymeScheme(lines) {
    // 간단한 운율 체계 분석 (한국어는 복잡하므로 기본적인 패턴만)
    const endSounds = lines.map(line => {
      const words = line.trim().split(/\s+/);
      const lastWord = words[words.length - 1];
      return lastWord ? lastWord.slice(-1) : '';
    });
    
    const scheme = [];
    const soundMap = {};
    let currentLetter = 'A';
    
    endSounds.forEach(sound => {
      if (!soundMap[sound]) {
        soundMap[sound] = currentLetter;
        currentLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
      }
      scheme.push(soundMap[sound]);
    });
    
    return scheme.join('');
  }

  // 음악 매개변수 결정
  determineMusicParameters(lyricsAnalysis, genre, emotion, userStyle) {
    const baseParams = this.emotionMappings[emotion] || this.emotionMappings.nostalgic;
    const genreModifications = this.getGenreModifications(genre);
    
    // 사용자 스타일 적용
    let styleModifications = {};
    if (userStyle) {
      styleModifications = this.applyUserStyle(userStyle);
    }
    
    return {
      ...baseParams,
      ...genreModifications,
      ...styleModifications,
      complexity: lyricsAnalysis.complexity,
      structure: lyricsAnalysis.structure.map(s => s.type)
    };
  }

  // 장르별 수정사항
  getGenreModifications(genre) {
    const modifications = {
      ballad: { tempo: 75, dynamics: 'mezzo-piano', brightness: 0.4 },
      pop: { tempo: 120, dynamics: 'forte', brightness: 0.8 },
      rock: { tempo: 140, dynamics: 'fortissimo', brightness: 0.9 },
      jazz: { tempo: 100, dynamics: 'mezzo-forte', brightness: 0.6 },
      folk: { tempo: 90, dynamics: 'mezzo-piano', brightness: 0.5 },
      enka: { tempo: 70, dynamics: 'piano', brightness: 0.3 }
    };
    
    return modifications[genre] || modifications.ballad;
  }

  // 사용자 스타일 적용
  applyUserStyle(userStyle) {
    return {
      tempo: userStyle.preferredTempo || undefined,
      scale: userStyle.preferredScale || undefined,
      progression: userStyle.preferredProgression || undefined,
      instrumentation: userStyle.preferredInstruments || undefined
    };
  }

  // 코드 진행 생성
  generateChordProgression(progressionType, key, structure) {
    const progressions = this.musicTheory.progressions;
    const baseProgression = progressions[progressionType] || progressions.ballad;
    
    // 키에 맞는 코드 생성
    const keyChords = this.generateKeyChords(key);
    
    // 구조에 맞춰 코드 진행 확장
    let fullProgression = [];
    structure.forEach(section => {
      const sectionChords = this.adaptProgressionToSection(baseProgression, section.type, keyChords);
      fullProgression.push({
        section: section.type,
        chords: sectionChords,
        measures: section.lines.length * 2 // 한 줄당 2마디 기본
      });
    });
    
    return fullProgression;
  }

  // 키별 코드 생성
  generateKeyChords(key) {
    const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const keyIndex = chromaticScale.indexOf(key);
    const majorScale = [0, 2, 4, 5, 7, 9, 11]; // 장조 간격
    
    const scaleNotes = majorScale.map(interval => 
      chromaticScale[(keyIndex + interval) % 12]
    );
    
    return {
      'I': { root: scaleNotes[0], type: 'major', notes: [scaleNotes[0], scaleNotes[2], scaleNotes[4]] },
      'ii': { root: scaleNotes[1], type: 'minor', notes: [scaleNotes[1], scaleNotes[3], scaleNotes[5]] },
      'iii': { root: scaleNotes[2], type: 'minor', notes: [scaleNotes[2], scaleNotes[4], scaleNotes[6]] },
      'IV': { root: scaleNotes[3], type: 'major', notes: [scaleNotes[3], scaleNotes[5], scaleNotes[0]] },
      'V': { root: scaleNotes[4], type: 'major', notes: [scaleNotes[4], scaleNotes[6], scaleNotes[1]] },
      'vi': { root: scaleNotes[5], type: 'minor', notes: [scaleNotes[5], scaleNotes[0], scaleNotes[2]] },
      'vii': { root: scaleNotes[6], type: 'diminished', notes: [scaleNotes[6], scaleNotes[1], scaleNotes[3]] }
    };
  }

  // 섹션별 코드 진행 적응
  adaptProgressionToSection(baseProgression, sectionType, keyChords) {
    const sectionVariations = {
      verse: baseProgression,
      chorus: baseProgression.map(chord => chord), // 같은 진행
      bridge: ['vi', 'IV', 'I', 'V'], // 브릿지용 변형
      intro: [baseProgression[0]], // 첫 코드만
      outro: [...baseProgression, 'I'] // 마지막에 I 코드 추가
    };
    
    const progression = sectionVariations[sectionType] || baseProgression;
    return progression.map(chordSymbol => keyChords[chordSymbol] || keyChords['I']);
  }

  // 멜로디 생성
  generateMelody(lyricsAnalysis, chordProgression, musicParams, key) {
    const scale = this.musicTheory.scales[musicParams.scale] || this.musicTheory.scales.major;
    const rootNote = key;
    
    let melody = [];
    
    lyricsAnalysis.structure.forEach((section, sectionIndex) => {
      const sectionChords = chordProgression[sectionIndex]?.chords || [];
      
      section.lines.forEach((line, lineIndex) => {
        const syllablePattern = lyricsAnalysis.syllablePattern[section.startIndex + lineIndex];
        if (!syllablePattern) return;
        
        const melodicPhrase = this.generateMelodicPhrase(
          syllablePattern,
          sectionChords,
          scale,
          rootNote,
          musicParams
        );
        
        melody.push({
          section: section.type,
          line: lineIndex,
          phrase: melodicPhrase,
          lyrics: line
        });
      });
    });
    
    return melody;
  }

  // 멜로디 구문 생성
  generateMelodicPhrase(syllablePattern, chords, scale, rootNote, musicParams) {
    const notes = [];
    const scaleNotes = this.generateScaleNotes(rootNote, scale, 2); // 2옥타브
    
    syllablePattern.rhythm.forEach((rhythmUnit, index) => {
      const chordIndex = Math.floor(index / 4) % chords.length;
      const currentChord = chords[chordIndex];
      
      // 코드 톤을 기반으로 멜로디 노트 선택
      const chordTones = currentChord ? currentChord.notes : [rootNote];
      const availableNotes = [...chordTones, ...scaleNotes];
      
      // 감정과 장르에 따른 음역 및 간격 조정
      const noteRange = this.determineNoteRange(musicParams.emotion, index, syllablePattern.rhythm.length);
      const selectedNote = this.selectMelodicNote(availableNotes, noteRange, rhythmUnit.stress);
      
      notes.push({
        note: selectedNote,
        duration: this.calculateNoteDuration(rhythmUnit, musicParams.tempo),
        syllable: rhythmUnit.syllables,
        stress: rhythmUnit.stress,
        chordContext: currentChord
      });
    });
    
    return notes;
  }

  // 스케일 노트 생성
  generateScaleNotes(rootNote, scale, octaves = 2) {
    const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootIndex = chromaticScale.indexOf(rootNote);
    let notes = [];
    
    for (let octave = 3; octave <= 3 + octaves; octave++) {
      scale.forEach(interval => {
        const noteIndex = (rootIndex + interval) % 12;
        notes.push({
          note: chromaticScale[noteIndex],
          octave: octave,
          frequency: MusicUtils.noteToFrequency(chromaticScale[noteIndex], octave)
        });
      });
    }
    
    return notes;
  }

  // 음역 결정
  determineNoteRange(emotion, position, totalLength) {
    const ranges = {
      happy: { min: 0.4, max: 0.8 }, // 중고음역
      sad: { min: 0.2, max: 0.6 }, // 중저음역
      romantic: { min: 0.3, max: 0.7 }, // 중음역
      energetic: { min: 0.5, max: 0.9 }, // 고음역
      peaceful: { min: 0.2, max: 0.5 } // 저음역
    };
    
    const baseRange = ranges[emotion] || ranges.romantic;
    
    // 위치에 따른 음역 변화 (곡의 클라이맥스 고려)
    const positionFactor = Math.sin((position / totalLength) * Math.PI); // 중간에서 높아짐
    
    return {
      min: baseRange.min + (positionFactor * 0.1),
      max: baseRange.max + (positionFactor * 0.1)
    };
  }

  // 멜로디 노트 선택
  selectMelodicNote(availableNotes, range, stress) {
    const rangedNotes = availableNotes.filter(note => {
      const normalizedPitch = (note.octave - 3) / 3; // 3-6옥타브를 0-1로 정규화
      return normalizedPitch >= range.min && normalizedPitch <= range.max;
    });
    
    if (rangedNotes.length === 0) return availableNotes[0];
    
    // 강세에 따른 노트 선택
    if (stress > 0.7) {
      // 강세가 강하면 상대적으로 높은 음
      return rangedNotes[Math.floor(rangedNotes.length * 0.7)];
    } else {
      // 약한 강세면 중간 음역
      return rangedNotes[Math.floor(rangedNotes.length * 0.4)];
    }
  }

  // 음표 길이 계산
  calculateNoteDuration(rhythmUnit, tempo) {
    const baseDuration = MusicUtils.bpmToMs(tempo, 8); // 8분음표 기준
    const syllableWeight = Math.max(0.5, rhythmUnit.syllables / 3);
    return baseDuration * syllableWeight;
  }

  // 리듬 패턴 생성
  generateRhythmPattern(genre, tempo, syllablePattern) {
    const genrePatterns = {
      ballad: { pattern: [1, 0, 0.5, 0, 0.8, 0, 0.5, 0], accent: [1, 3, 5] },
      pop: { pattern: [1, 0, 1, 0, 1, 0, 1, 0], accent: [1, 3] },
      rock: { pattern: [1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5], accent: [1, 3] },
      jazz: { pattern: [1, 0, 0.7, 0.3, 0.8, 0, 0.6, 0.4], accent: [1, 2, 4] },
      folk: { pattern: [1, 0, 0.6, 0, 0.8, 0.4, 0.6, 0], accent: [1, 5] }
    };
    
    const basePattern = genrePatterns[genre] || genrePatterns.ballad;
    
    return {
      genre,
      tempo,
      pattern: basePattern.pattern,
      accents: basePattern.accent,
      measures: this.generateMeasures(syllablePattern, basePattern),
      timeSignature: '4/4' // 기본 박자
    };
  }

  // 마디 생성
  generateMeasures(syllablePattern, rhythmPattern) {
    return syllablePattern.map(pattern => ({
      beats: 4,
      subdivisions: rhythmPattern.pattern,
      syllableCount: pattern.syllables,
      wordCount: pattern.words
    }));
  }

  // 악기 편성 선택
  selectInstrumentation(genre) {
    const instrumentations = {
      ballad: {
        lead: ['피아노', '어쿠스틱 기타'],
        harmony: ['스트링 섹션', '패드'],
        rhythm: ['소프트 드럼', '베이스'],
        texture: ['리버브', '코러스']
      },
      pop: {
        lead: ['신스 리드', '일렉트릭 피아노'],
        harmony: ['신스 패드', '백킹 보컬'],
        rhythm: ['드럼킷', '베이스 기타'],
        texture: ['컴프레서', '이큐얼라이저']
      },
      rock: {
        lead: ['일렉트릭 기타', '보컬'],
        harmony: ['파워 코드', '오르간'],
        rhythm: ['록 드럼', '베이스 기타'],
        texture: ['디스토션', '딜레이']
      },
      jazz: {
        lead: ['색소폰', '트럼펫'],
        harmony: ['재즈 피아노', '기타'],
        rhythm: ['브러시 드럼', '업라이트 베이스'],
        texture: ['리버브', '코러스']
      },
      folk: {
        lead: ['어쿠스틱 기타', '하모니카'],
        harmony: ['스트링', '어쿠스틱 피아노'],
        rhythm: ['카혼', '베이스'],
        texture: ['자연스러운 잔향']
      }
    };
    
    return instrumentations[genre] || instrumentations.ballad;
  }

  // 곡 길이 계산
  calculateDuration(lyricsAnalysis, tempo) {
    const totalSyllables = lyricsAnalysis.syllableCount;
    const avgSyllablesPerMinute = tempo * 2; // 대략적인 추정
    const estimatedMinutes = totalSyllables / avgSyllablesPerMinute;
    
    // 구조적 요소 고려 (인트로, 아웃트로, 간주 등)
    const structuralAddition = lyricsAnalysis.structure.length * 0.5; // 섹션당 30초 추가
    
    return Math.max(2, Math.round((estimatedMinutes + structuralAddition) * 60)); // 초 단위, 최소 2분
  }

  // 음악 재생
  async playGeneratedMusic(musicData) {
    if (!this.initialized || !this.audioContext) {
      console.error('음악 생성 엔진이 초기화되지 않았습니다.');
      return false;
    }

    try {
      this.stopCurrentMusic();
      
      // 간단한 멜로디 재생 구현
      let startTime = this.audioContext.currentTime;
      
      musicData.melody.forEach(section => {
        section.phrase.forEach(note => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          oscillator.frequency.setValueAtTime(note.note.frequency, startTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration / 1000);
          
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          
          oscillator.start(startTime);
          oscillator.stop(startTime + note.duration / 1000);
          
          startTime += note.duration / 1000;
        });
      });
      
      this.isPlaying = true;
      console.log('🎵 생성된 음악 재생 시작');
      
      return true;
    } catch (error) {
      console.error('음악 재생 중 오류:', error);
      return false;
    }
  }

  // 현재 음악 정지
  stopCurrentMusic() {
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch {
        // 이미 정지된 oscillator 무시
      }
    });
    this.oscillators = [];
    this.isPlaying = false;
  }

  // 리소스 정리
  cleanup() {
    this.stopCurrentMusic();
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.initialized = false;
  }
}


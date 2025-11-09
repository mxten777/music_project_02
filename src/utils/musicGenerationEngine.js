// 고급 음악 생성 AI 엔진
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

  // 기타 메서드들은 다음 파일에서 계속...
}

// 음악 생성 유틸리티 함수들
export const MusicUtils = {
  // 음표를 주파수로 변환
  noteToFrequency(note, octave = 4) {
    const noteMap = {
      'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
      'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
    };
    
    const noteNumber = noteMap[note];
    if (noteNumber === undefined) return 440; // A4 기본값
    
    // A4 = 440Hz를 기준으로 계산
    const A4 = 440;
    const semitoneRatio = Math.pow(2, 1/12);
    const semitonesFromA4 = (octave - 4) * 12 + (noteNumber - 9);
    
    return A4 * Math.pow(semitoneRatio, semitonesFromA4);
  },

  // BPM을 ms로 변환
  bpmToMs(bpm, noteValue = 4) {
    return (60000 / bpm) * (4 / noteValue);
  },

  // 스케일 생성
  generateScale(rootNote, scaleType, octave = 4) {
    const scales = {
      major: [0, 2, 4, 5, 7, 9, 11],
      minor: [0, 2, 3, 5, 7, 8, 10],
      pentatonic: [0, 2, 4, 7, 9]
    };
    
    const intervals = scales[scaleType] || scales.major;
    const rootFreq = this.noteToFrequency(rootNote, octave);
    
    return intervals.map(interval => {
      const semitoneRatio = Math.pow(2, 1/12);
      return rootFreq * Math.pow(semitoneRatio, interval);
    });
  }
};

export default MusicUtils;
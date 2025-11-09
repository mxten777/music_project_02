// 고급 텍스트 제안 및 자동완성 시스템

// 문맥 기반 제안 생성기
export class ContextualSuggestionEngine {
  constructor() {
    this.templates = {
      ballad: {
        opening: [
          '그대를 처음 만난 그 순간',
          '마음 깊은 곳에서 울려오는',
          '사랑이라는 이름으로',
          '시간이 멈춘 듯한 이 순간',
          '별빛 아래서 속삭이던'
        ],
        emotion: [
          '가슴이 뛰는 이 느낌',
          '눈물이 흘러내려도',
          '행복이 밀려와',
          '그리움이 가득해',
          '사랑에 빠진 마음'
        ],
        closing: [
          '영원히 기억할게요',
          '변하지 않을 마음으로',
          '언제까지나 함께',
          '사랑한다는 말',
          '우리의 약속을 지켜'
        ]
      },
      enka: {
        opening: [
          '긴 인생길을 걸어오며',
          '세월의 강을 건너서',
          '고향 생각에 젖어',
          '어머니의 품이 그리워',
          '지나온 날들을 돌아보니'
        ],
        emotion: [
          '한이 서린 마음',
          '정이 그리운 밤',
          '애환이 담긴 노래',
          '삶의 무게를 느끼며',
          '눈물겨운 추억들'
        ],
        closing: [
          '모든 것이 소중한 기억',
          '감사한 마음으로',
          '인생이란 여행에서',
          '마음의 고향으로',
          '영원히 간직할 추억'
        ]
      }
    };

    this.transitionWords = [
      '그리고', '하지만', '그런데', '그러나', '그래서', '또한', '그렇지만',
      '이제는', '그때는', '언젠가', '어느덧', '그렇게', '이렇게'
    ];

    this.emotionalModifiers = [
      '깊이', '조용히', '살며시', '가만히', '천천히', '부드럽게',
      '간절히', '애틋하게', '그리워하며', '바라보며', '기다리며'
    ];
  }

  // 현재 텍스트 분석하여 다음 제안 생성
  generateSuggestions(text, cursorPosition, style = 'ballad') {
    const beforeCursor = text.substring(0, cursorPosition);
    const lines = beforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];
    const previousLines = lines.slice(-3, -1); // 최근 2-3줄 분석
    
    const suggestions = [];
    
    // 1. 템플릿 기반 제안
    const templateSuggestions = this.getTemplateSuggestions(previousLines, style);
    suggestions.push(...templateSuggestions);
    
    // 2. 문맥 연결 제안
    const contextualSuggestions = this.getContextualSuggestions(currentLine, previousLines);
    suggestions.push(...contextualSuggestions);
    
    // 3. 리듬 패턴 제안
    const rhythmSuggestions = this.getRhythmSuggestions(previousLines);
    suggestions.push(...rhythmSuggestions);
    
    // 4. 감정 연속성 제안
    const emotionalSuggestions = this.getEmotionalSuggestions(text);
    suggestions.push(...emotionalSuggestions);
    
    // 중복 제거 및 관련성 순으로 정렬
    return [...new Set(suggestions)]
      .filter(s => s && s.length > 0)
      .slice(0, 8);
  }

  getTemplateSuggestions(previousLines, style) {
    const templates = this.templates[style] || this.templates.ballad;
    const lineCount = previousLines.length;
    
    if (lineCount === 0) {
      return templates.opening.slice(0, 3);
    } else if (lineCount < 3) {
      return templates.emotion.slice(0, 3);
    } else {
      return templates.closing.slice(0, 3);
    }
  }

  getContextualSuggestions(currentLine, previousLines) {
    const suggestions = [];
    
    if (currentLine.length === 0 && previousLines.length > 0) {
      const lastLine = previousLines[previousLines.length - 1];
      
      // 이전 라인의 주제어 분석
      if (lastLine.includes('사랑')) {
        suggestions.push('그 사랑이 영원하기를', '사랑하는 마음으로');
      }
      if (lastLine.includes('그리움') || lastLine.includes('그리워')) {
        suggestions.push('보고 싶은 마음', '그리운 시간들');
      }
      if (lastLine.includes('눈물')) {
        suggestions.push('슬픔을 달래며', '아픔을 감싸안고');
      }
      if (lastLine.includes('웃음') || lastLine.includes('행복')) {
        suggestions.push('기쁨이 넘쳐나', '행복한 순간들');
      }
    }
    
    return suggestions;
  }

  getRhythmSuggestions(previousLines) {
    if (previousLines.length < 2) return [];
    
    // 음절 수 패턴 분석
    const syllableCounts = previousLines.map(line => 
      (line.match(/[가-힣]/g) || []).length
    );
    
    const avgSyllables = syllableCounts.reduce((a, b) => a + b, 0) / syllableCounts.length;
    
    // 비슷한 음절 수의 제안 생성
    const suggestions = [];
    if (avgSyllables >= 7 && avgSyllables <= 9) {
      suggestions.push('마음속 깊은 곳에서', '시간이 흘러가도', '그대만을 바라보며');
    } else if (avgSyllables >= 5 && avgSyllables <= 7) {
      suggestions.push('따뜻한 미소로', '조용한 밤에', '새로운 시작');
    }
    
    return suggestions;
  }

  getEmotionalSuggestions(text) {
    const suggestions = [];
    
    // 텍스트 내 감정 키워드 분석
    const emotionKeywords = [
      { word: '슬픔', suggestions: ['눈물을 닦으며', '아픔을 견디며', '상처를 치유하며'] },
      { word: '기쁨', suggestions: ['웃음이 번져가며', '행복이 차올라', '즐거운 마음으로'] },
      { word: '사랑', suggestions: ['깊은 애정으로', '진실한 마음으로', '변치 않는 마음'] },
      { word: '그리움', suggestions: ['보고 싶은 마음', '그리운 시간 속에', '추억을 되새기며'] }
    ];
    
    emotionKeywords.forEach(({ word, suggestions: wordSuggestions }) => {
      if (text.includes(word)) {
        suggestions.push(...wordSuggestions);
      }
    });
    
    return suggestions;
  }

  // 문법 및 스타일 검사
  checkGrammarAndStyle(text) {
    const issues = [];
    
    // 기본적인 문법 검사
    const lines = text.split('\n').filter(l => l.trim());
    
    lines.forEach((line, index) => {
      // 너무 긴 문장
      if (line.length > 50) {
        issues.push({
          type: 'length',
          line: index + 1,
          message: '문장이 너무 길어 읽기 어려울 수 있습니다.',
          suggestion: '문장을 나누어 보세요.'
        });
      }
      
      // 반복되는 단어
      const words = line.split(' ');
      const wordCount = {};
      words.forEach(word => {
        if (word.length > 1) {
          wordCount[word] = (wordCount[word] || 0) + 1;
        }
      });
      
      Object.entries(wordCount).forEach(([word, count]) => {
        if (count > 2) {
          issues.push({
            type: 'repetition',
            line: index + 1,
            message: `"${word}"가 과도하게 반복됩니다.`,
            suggestion: '다른 표현을 사용해보세요.'
          });
        }
      });
    });
    
    return issues;
  }

  // 시의 운율 개선 제안
  suggestRhythmImprovements(text) {
    const lines = text.split('\n').filter(l => l.trim());
    const suggestions = [];
    
    if (lines.length < 2) return suggestions;
    
    // 각 행의 음절 수 계산
    const syllableCounts = lines.map(line => {
      const koreanSyllables = (line.match(/[가-힣]/g) || []).length;
      const englishSyllables = Math.ceil((line.match(/[a-zA-Z]/g) || []).length / 2);
      return koreanSyllables + englishSyllables;
    });
    
    // 음절 수 편차 계산
    const avgSyllables = syllableCounts.reduce((a, b) => a + b, 0) / syllableCounts.length;
    const maxDeviation = Math.max(...syllableCounts.map(count => Math.abs(count - avgSyllables)));
    
    if (maxDeviation > 3) {
      suggestions.push({
        type: 'rhythm',
        message: '행별 음절 수의 차이가 큽니다.',
        suggestion: `평균 ${Math.round(avgSyllables)}음절에 맞춰 조정해보세요.`,
        details: syllableCounts.map((count, index) => ({
          line: index + 1,
          syllables: count,
          deviation: count - avgSyllables
        }))
      });
    }
    
    return suggestions;
  }
}

// 단일 인스턴스 생성
export const suggestionEngine = new ContextualSuggestionEngine();

// 유틸리티 함수들
export const getWordSuggestions = (partialWord, category = 'general') => {
  const wordBank = {
    general: ['마음', '사랑', '그리움', '행복', '눈물', '웃음', '희망', '꿈'],
    nature: ['꽃', '나무', '바람', '하늘', '별', '달', '바다', '산', '강', '들판'],
    emotion: ['기쁨', '슬픔', '분노', '평온', '설렘', '그리움', '희망', '절망'],
    time: ['아침', '낮', '저녁', '밤', '봄', '여름', '가을', '겨울', '어제', '오늘', '내일']
  };
  
  const words = wordBank[category] || wordBank.general;
  return words.filter(word => 
    word.toLowerCase().includes(partialWord.toLowerCase()) ||
    partialWord.toLowerCase().includes(word.substring(0, 2).toLowerCase())
  );
};

export const generateRhymingWords = (word) => {
  // 한국어 운율 패턴 (단순화된 버전)
  const rhymePatterns = {
    '다': ['간다', '온다', '한다', '된다'],
    '요': ['해요', '가요', '와요', '줘요'],
    '네': ['그렇네', '좋네', '예쁘네', '멋지네'],
    '지': ['그런지', '아닌지', '맞는지', '되는지']
  };
  
  const lastChar = word.slice(-1);
  return rhymePatterns[lastChar] || [];
};
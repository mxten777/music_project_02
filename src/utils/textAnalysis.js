// 텍스트 분석을 위한 유틸리티 함수들

// 한국어 형태소 분석을 위한 기본 패턴
export const KOREAN_PATTERNS = {
  // 조사 패턴
  particles: ['이', '가', '을', '를', '에', '에서', '로', '으로', '와', '과', '의', '도', '만', '까지', '부터'],
  
  // 어미 패턴
  endings: ['다', '요', '니다', '습니다', '네요', '어요', '아요', '지요', '죠'],
  
  // 감탄사
  exclamations: ['아', '어', '오', '우', '와', '어머', '아이고', '헉', '음']
};

// 감정 분석을 위한 확장된 키워드 사전
export const EXTENDED_EMOTION_KEYWORDS = {
  happy: {
    primary: ['기쁨', '행복', '즐거움', '웃음', '미소', '희망', '축하', '환희', '밝은', '따뜻한'],
    secondary: ['신나는', '유쾌한', '상쾌한', '산뜻한', '경쾌한', '활기찬', '생동감', '활력', '에너지'],
    contexts: ['성공', '달성', '만족', '충족', '완성', '승리', '선물', '축제', '파티']
  },
  sad: {
    primary: ['슬픔', '눈물', '아픔', '이별', '그리움', '외로움', '상처', '멀어', '잃어', '그리워'],
    secondary: ['우울한', '침울한', '처량한', '쓸쓸한', '고독한', '허전한', '공허한', '절망'],
    contexts: ['작별', '떠남', '죽음', '실패', '좌절', '실망', '포기', '단절']
  },
  love: {
    primary: ['사랑', '연인', '그대', '마음', '가슴', '설렘', '첫사랑', '애인', '좋아', '사랑해'],
    secondary: ['애정', '정열', '열정', '간절함', '그리움', '애틋함', '다정함', '다사함'],
    contexts: ['만남', '데이트', '키스', '포옹', '약속', '결혼', '프로포즈', '연애']
  },
  nature: {
    primary: ['봄', '여름', '가을', '겨울', '바람', '햇살', '달', '별', '꽃', '나무', '바다', '산'],
    secondary: ['자연', '경치', '풍경', '계절', '날씨', '하늘', '구름', '비', '눈', '새'],
    contexts: ['산책', '여행', '피크닉', '등산', '해변', '숲', '공원', '정원']
  },
  nostalgic: {
    primary: ['추억', '그때', '옛날', '어린', '고향', '엄마', '아버지', '학교', '친구', '지난'],
    secondary: ['회상', '옛날', '과거', '기억', '추천', '그리운', '그립다', '되돌아'],
    contexts: ['고향', '학창시절', '어린시절', '가족', '동창', '졸업', '이사']
  },
  hope: {
    primary: ['희망', '꿈', '미래', '새로운', '시작', '도전', '용기', '힘', '빛', '앞으로'],
    secondary: ['기대', '염원', '소망', '바람', '의지', '결심', '다짐', '목표'],
    contexts: ['계획', '준비', '노력', '발전', '성장', '변화', '개선', '진보']
  }
};

// 텍스트 복잡도 분석
export const analyzeComplexity = (text) => {
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const characters = text.replace(/\s/g, '').length;
  
  // 평균 문장 길이
  const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
  
  // 긴 단어의 비율 (4글자 이상)
  const longWords = words.filter(word => word.length >= 4).length;
  const longWordRatio = words.length > 0 ? longWords / words.length : 0;
  
  // 한자어 추정 (복잡한 한국어 패턴)
  const complexPatterns = /[가-힣]{3,}|[的|的|性|化|學|業|機|關|政|經|社|文|科|技|術]/g;
  const complexMatches = text.match(complexPatterns) || [];
  const complexityRatio = complexMatches.length / words.length;
  
  // 복잡도 점수 계산 (0-100)
  const complexityScore = Math.min(100, 
    (avgSentenceLength * 2) + 
    (longWordRatio * 30) + 
    (complexityRatio * 40)
  );
  
  return {
    score: Math.round(complexityScore),
    level: complexityScore > 60 ? 'high' : complexityScore > 30 ? 'medium' : 'low',
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    longWordRatio: Math.round(longWordRatio * 100),
    sentences: sentences.length,
    words: words.length,
    characters
  };
};

// 가독성 분석 (한국어 버전)
export const analyzeReadability = (text) => {
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  // 평균 단어 길이
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  
  // 문장 길이 분산
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  
  // 반복 단어 분석
  const wordFreq = {};
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w가-힣]/g, '').toLowerCase();
    wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
  });
  
  const repeatedWords = Object.entries(wordFreq)
    .filter(([word, count]) => count > 1 && word.length > 1)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  // 가독성 점수 (낮을수록 읽기 쉬움)
  const readabilityScore = (avgWordLength * 10) + (avgSentenceLength * 2);
  
  return {
    score: Math.round(readabilityScore),
    level: readabilityScore > 40 ? 'difficult' : readabilityScore > 25 ? 'moderate' : 'easy',
    avgWordLength: Math.round(avgWordLength * 10) / 10,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    repeatedWords: repeatedWords.map(([word, count]) => ({ word, count }))
  };
};

// 감정 강도 분석
export const analyzeEmotionIntensity = (text) => {
  const intensityKeywords = {
    high: ['매우', '굉장히', '너무', '정말', '진짜', '완전', '엄청', '극도로', '심하게'],
    medium: ['조금', '약간', '살짝', '어느정도', '다소', '제법', '꽤'],
    low: ['거의', '별로', '그다지', '그리', '특별히']
  };
  
  let totalIntensity = 0;
  let intensityCount = 0;
  
  Object.entries(intensityKeywords).forEach(([level, keywords]) => {
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = text.match(regex) || [];
      if (matches.length > 0) {
        const weight = level === 'high' ? 3 : level === 'medium' ? 2 : 1;
        totalIntensity += matches.length * weight;
        intensityCount += matches.length;
      }
    });
  });
  
  const avgIntensity = intensityCount > 0 ? totalIntensity / intensityCount : 1.5;
  
  return {
    level: avgIntensity > 2.5 ? 'high' : avgIntensity > 1.5 ? 'medium' : 'low',
    score: Math.round(avgIntensity * 10) / 10,
    keywords: intensityCount
  };
};

// 운율 분석 (기본적인 패턴 분석)
export const analyzeRhythm = (text) => {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // 각 행의 음절 수 계산 (근사치)
  const syllableCounts = lines.map(line => {
    // 한글 음절 근사 계산
    const koreanChars = line.match(/[가-힣]/g) || [];
    const otherChars = line.match(/[a-zA-Z0-9]/g) || [];
    return koreanChars.length + Math.ceil(otherChars.length / 2);
  });
  
  // 운율 패턴 분석
  const rhythmPattern = syllableCounts.join('-');
  
  // 규칙성 검사
  const uniqueCounts = [...new Set(syllableCounts)];
  const isRegular = uniqueCounts.length <= 2;
  
  // 평균 음절 수
  const avgSyllables = syllableCounts.reduce((a, b) => a + b, 0) / syllableCounts.length;
  
  return {
    pattern: rhythmPattern,
    avgSyllables: Math.round(avgSyllables * 10) / 10,
    isRegular,
    lines: lines.length,
    syllableCounts
  };
};

// 종합 텍스트 품질 분석
export const analyzeTextQuality = (text) => {
  const complexity = analyzeComplexity(text);
  const readability = analyzeReadability(text);
  const rhythm = analyzeRhythm(text);
  
  // 품질 점수 계산
  const qualityScore = Math.round(
    (100 - complexity.score) * 0.3 +  // 복잡도가 낮을수록 좋음
    (100 - readability.score) * 0.3 + // 가독성이 좋을수록 좋음
    (rhythm.isRegular ? 80 : 60) * 0.2 + // 운율이 규칙적일수록 좋음
    (text.length > 50 ? 80 : 60) * 0.2   // 적당한 길이일수록 좋음
  );
  
  return {
    score: qualityScore,
    grade: qualityScore > 80 ? 'excellent' : qualityScore > 60 ? 'good' : qualityScore > 40 ? 'fair' : 'poor',
    complexity,
    readability,
    rhythm
  };
};

// 장르 추천 엔진
export const recommendGenre = (emotions, textQuality) => {
  const { primaryEmotion } = emotions;
  
  if (!primaryEmotion) return 'ballad';
  
  const genreScores = {
    ballad: 0,
    enka: 0,
    folk: 0,
    pop: 0
  };
  
  // 감정 기반 장르 점수
  switch (primaryEmotion.name) {
    case 'love':
    case 'happy':
      genreScores.ballad += 40;
      genreScores.pop += 30;
      break;
    case 'sad':
    case 'nostalgic':
      genreScores.ballad += 30;
      genreScores.enka += 40;
      genreScores.folk += 20;
      break;
    case 'nature':
      genreScores.folk += 40;
      genreScores.enka += 20;
      break;
    case 'hope':
      genreScores.pop += 30;
      genreScores.ballad += 25;
      break;
  }
  
  // 텍스트 품질 기반 보정
  if (textQuality.complexity.level === 'high') {
    genreScores.enka += 20;
    genreScores.folk += 10;
  } else if (textQuality.complexity.level === 'low') {
    genreScores.pop += 20;
    genreScores.ballad += 10;
  }
  
  // 가장 높은 점수의 장르 반환
  const recommendedGenre = Object.entries(genreScores)
    .sort(([,a], [,b]) => b - a)[0][0];
  
  return recommendedGenre;
};
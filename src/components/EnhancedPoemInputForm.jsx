import React, { useState, useEffect, useRef, useCallback } from "react";

// 감정 분석을 위한 키워드 맵핑
const EMOTION_KEYWORDS = {
  happy: ['기쁨', '행복', '즐거움', '웃음', '미소', '희망', '축하', '환희', '밝은', '따뜻한'],
  sad: ['슬픔', '눈물', '아픔', '이별', '그리움', '외로움', '상처', '멀어', '잃어', '그리워'],
  love: ['사랑', '연인', '그대', '마음', '가슴', '설렘', '첫사랑', '애인', '좋아', '사랑해'],
  nature: ['봄', '여름', '가을', '겨울', '바람', '햇살', '달', '별', '꽃', '나무', '바다', '산'],
  nostalgic: ['추억', '그때', '옛날', '어린', '고향', '엄마', '아버지', '학교', '친구', '지난'],
  hope: ['희망', '꿈', '미래', '새로운', '시작', '도전', '용기', '힘', '빛', '앞으로']
};

// 스타일별 추천 키워드
const STYLE_SUGGESTIONS = {
  ballad: {
    themes: ['사랑', '이별', '그리움', '추억', '감정'],
    words: ['마음', '눈물', '사랑', '그대', '가슴', '아픔', '행복', '꿈'],
    tips: '감정적이고 서정적인 표현을 사용해보세요'
  },
  enka: {
    themes: ['인생', '여행', '그리움', '전통', '고향'],
    words: ['길', '인생', '고향', '어머니', '정', '한', '세월', '운명'],
    tips: '깊이 있고 철학적인 표현을 사용해보세요'
  }
};

// 자동완성 제안
const AUTO_COMPLETE_SUGGESTIONS = [
  '마음속 깊은 곳에서',
  '바람이 불어와',
  '하늘을 바라보며',
  '시간이 흘러가도',
  '그대를 생각하며',
  '추억 속에서',
  '새로운 시작과 함께',
  '희망의 빛이',
  '사랑의 마음으로',
  '꿈을 향해 걸어가는'
];

export default function PoemInputForm({ onSubmit }) {
  const [poem, setPoem] = useState("");
  const [style, setStyle] = useState("ballad");
  const [analysis, setAnalysis] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // const [currentLine, setCurrentLine] = useState(""); // Future use
  const [cursorPosition, setCursorPosition] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  
  const textareaRef = useRef(null);
  const debounceRef = useRef(null);

  const poemLength = poem.length;
  const maxLength = 1000; // 증가된 최대 길이

  // 텍스트 분석 함수
  const analyzePoem = useCallback((text) => {
    if (!text.trim()) {
      setAnalysis(null);
      return;
    }

    setIsAnalyzing(true);
    
    // 디바운스를 사용하여 실시간 분석
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      // 감정 분석
      const emotions = {};
      let totalEmotionScore = 0;

      Object.entries(EMOTION_KEYWORDS).forEach(([emotion, keywords]) => {
        const score = keywords.reduce((acc, keyword) => {
          const regex = new RegExp(keyword, 'gi');
          const matches = text.match(regex);
          return acc + (matches ? matches.length : 0);
        }, 0);
        emotions[emotion] = score;
        totalEmotionScore += score;
      });

      // 정규화된 감정 점수
      const normalizedEmotions = {};
      Object.entries(emotions).forEach(([emotion, score]) => {
        normalizedEmotions[emotion] = totalEmotionScore > 0 ? (score / totalEmotionScore) * 100 : 0;
      });

      // 주요 감정 추출
      const primaryEmotion = Object.entries(normalizedEmotions)
        .sort(([,a], [,b]) => b - a)[0];

      // 텍스트 통계
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      const avgWordsPerLine = lines.length > 0 ? words.length / lines.length : 0;
      const readingTimeMinutes = Math.ceil(words.length / 200); // 평균 읽기 속도 200단어/분

      setWordCount(words.length);
      setLineCount(lines.length);
      setReadingTime(readingTimeMinutes);

      setAnalysis({
        emotions: normalizedEmotions,
        primaryEmotion: primaryEmotion ? {
          name: primaryEmotion[0],
          score: primaryEmotion[1]
        } : null,
        stats: {
          wordCount: words.length,
          lineCount: lines.length,
          avgWordsPerLine: Math.round(avgWordsPerLine * 10) / 10,
          complexity: words.length > 50 ? 'high' : words.length > 20 ? 'medium' : 'low'
        }
      });

      setIsAnalyzing(false);
    }, 500);
  }, []);

  // 자동완성 제안 생성
  const generateSuggestions = useCallback((currentText, cursorPos) => {
    const textBeforeCursor = currentText.substring(0, cursorPos);
    const lastLine = textBeforeCursor.split('\n').pop();
    
    if (lastLine.length < 2) {
      setSuggestions([]);
      return;
    }

    // 현재 스타일에 맞는 제안
    const styleSuggestions = STYLE_SUGGESTIONS[style];
    const filteredSuggestions = AUTO_COMPLETE_SUGGESTIONS
      .concat(styleSuggestions.words.map(word => `${word}을 담아`))
      .concat(styleSuggestions.words.map(word => `${word}처럼`))
      .filter(suggestion => 
        suggestion.toLowerCase().includes(lastLine.toLowerCase()) ||
        lastLine.toLowerCase().includes(suggestion.substring(0, 3).toLowerCase())
      )
      .slice(0, 5);

    setSuggestions(filteredSuggestions);
  }, [style]);

  // 텍스트 변경 핸들러
  const handleTextChange = (e) => {
    const newText = e.target.value;
    const newCursorPosition = e.target.selectionStart;
    
    setPoem(newText);
    setCursorPosition(newCursorPosition);
    
    // 현재 라인 추출 (future use)
    // const lines = newText.substring(0, newCursorPosition).split('\n');
    // setCurrentLine(lines[lines.length - 1]);
    
    // 텍스트 분석
    analyzePoem(newText);
    
    // 자동완성 제안
    generateSuggestions(newText, newCursorPosition);
  };

  // 제안 선택 핸들러
  const handleSuggestionSelect = (suggestion) => {
    const textBeforeCursor = poem.substring(0, cursorPosition);
    const textAfterCursor = poem.substring(cursorPosition);
    const lines = textBeforeCursor.split('\n');
    const currentLineText = lines[lines.length - 1];
    
    // 현재 라인의 시작 위치 계산
    const currentLineStart = cursorPosition - currentLineText.length;
    
    // 제안으로 현재 라인 교체
    const newText = textBeforeCursor.substring(0, currentLineStart) + 
                   suggestion + 
                   textAfterCursor;
    
    setPoem(newText);
    setShowSuggestions(false);
    
    // 포커스 복원
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = currentLineStart + suggestion.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  // 스타일 변경 핸들러
  const handleStyleChange = (newStyle) => {
    setStyle(newStyle);
    // 스타일 변경 시 새로운 제안 생성
    if (poem.trim()) {
      generateSuggestions(poem, cursorPosition);
    }
  };

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e) => {
    if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault();
      handleSuggestionSelect(suggestions[0]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // 포커스 이벤트
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // 약간의 지연을 두어 제안 클릭이 가능하도록 함
    setTimeout(() => setShowSuggestions(false), 150);
  };

  // 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!poem.trim()) return;
    
    onSubmit?.({ 
      poem, 
      style, 
      analysis: analysis || {} 
    });
    setPoem("");
    setAnalysis(null);
    setSuggestions([]);
  };

  // 감정별 색상 매핑
  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'text-yellow-600 bg-yellow-100',
      sad: 'text-blue-600 bg-blue-100',
      love: 'text-pink-600 bg-pink-100',
      nature: 'text-green-600 bg-green-100',
      nostalgic: 'text-purple-600 bg-purple-100',
      hope: 'text-orange-600 bg-orange-100'
    };
    return colors[emotion] || 'text-gray-600 bg-gray-100';
  };

  // 감정별 한글 이름
  const getEmotionName = (emotion) => {
    const names = {
      happy: '기쁨',
      sad: '슬픔',
      love: '사랑',
      nature: '자연',
      nostalgic: '그리움',
      hope: '희망'
    };
    return names[emotion] || emotion;
  };

  // 템플릿 선택 이벤트 리스너
  useEffect(() => {
    const handleTemplateSelect = (event) => {
      setPoem(event.detail);
      // 템플릿 입력 후 분석 실행
      analyzePoem(event.detail);
    };

    document.addEventListener('selectTemplate', handleTemplateSelect);

    return () => {
      document.removeEventListener('selectTemplate', handleTemplateSelect);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [analyzePoem]);

  return (
    <form className="space-y-8" onSubmit={handleSubmit} aria-label="고급 시 입력 폼" role="form">
      {/* 헤더 및 통계 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white shadow-lg">
            <i className="fas fa-feather-alt text-lg"></i>
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-primary-700">고급 시 편집기</h3>
            <p className="text-sm text-neutral-500">AI 기반 작성 도우미</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-neutral-600">
          <span className="flex items-center gap-1">
            <i className="fas fa-file-word text-primary-500"></i>
            {wordCount} 단어
          </span>
          <span className="flex items-center gap-1">
            <i className="fas fa-list-ol text-secondary-500"></i>
            {lineCount} 줄
          </span>
          <span className="flex items-center gap-1">
            <i className="fas fa-clock text-accent-500"></i>
            {readingTime}분
          </span>
        </div>
      </div>

      {/* 메인 편집 영역 */}
      <div className="relative">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="poem-textarea" className="font-display font-semibold text-primary-700 text-lg flex items-center gap-2">
              <i className="fas fa-edit text-primary-500"></i>
              시 작성
            </label>
            <div className="flex items-center gap-3">
              <div className={`text-sm transition-colors ${poemLength > maxLength * 0.9 ? 'text-red-500' : 'text-neutral-500'}`}>
                {poemLength}/{maxLength}
              </div>
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-sm text-primary-600">
                  <i className="fas fa-brain animate-pulse"></i>
                  분석 중...
                </div>
              )}
            </div>
          </div>
          
          <div className="relative group">
            <textarea
              ref={textareaRef}
              id="poem-textarea"
              className="w-full px-6 py-5 border-2 border-primary-200/50 rounded-3xl resize-y min-h-[240px] bg-white/70 backdrop-blur-sm 
                       focus:bg-white focus:border-primary-400 focus:ring-4 focus:ring-primary-100 
                       transition-all duration-300 shadow-lg text-base sm:text-lg leading-relaxed
                       hover:border-primary-300 hover:shadow-xl group-hover:bg-white/80
                       placeholder:text-neutral-400 placeholder:italic font-mono"
              placeholder={`${STYLE_SUGGESTIONS[style].tips}

예시:
${style === 'ballad' ? 
`그대 향한 마음이 
하늘의 별처럼 빛나고
시간이 멈춘 듯한 이 순간
영원히 기억하고 싶어요` :
`긴 인생의 길 위에서
한 걸음 한 걸음 걸어가며
지나온 세월을 돌아보니
모든 것이 소중한 추억이네`}`}
              value={poem}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              maxLength={maxLength}
              required
              aria-label="고급 시 입력란"
            />
            
            {/* 자동완성 제안 */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl shadow-premium border border-primary-200/50 backdrop-blur-xl animate-slide-down">
                <div className="p-3">
                  <div className="text-sm text-neutral-600 mb-2 flex items-center gap-2">
                    <i className="fas fa-lightbulb text-accent-500"></i>
                    제안 (Tab으로 선택)
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-primary-50 transition-colors text-sm text-primary-700 border border-transparent hover:border-primary-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 스타일 선택 (개선된 버전) */}
      <div className="space-y-4">
        <fieldset aria-label="음악 스타일 선택">
          <legend className="font-display font-semibold text-primary-700 text-lg mb-4 flex items-center gap-2">
            <i className="fas fa-palette text-secondary-500"></i>
            음악 스타일 및 테마
          </legend>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(STYLE_SUGGESTIONS).map(([styleKey, styleInfo]) => (
              <label key={styleKey} className={`relative cursor-pointer group ${style === styleKey ? "scale-105" : ""} transition-all duration-300`}>
                <input
                  type="radio"
                  name="style"
                  value={styleKey}
                  checked={style === styleKey}
                  onChange={() => handleStyleChange(styleKey)}
                  className="sr-only"
                />
                <div className={`p-6 rounded-3xl border-2 transition-all duration-300 ${
                  style === styleKey 
                  ? "border-primary-400 bg-gradient-to-br from-primary-50 to-primary-100 shadow-glow" 
                  : "border-primary-200/50 bg-white/60 hover:border-primary-300 hover:bg-white/80"
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      style === styleKey ? "border-primary-500 bg-primary-500" : "border-primary-300"
                    }`}>
                      {style === styleKey && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                    </div>
                    <i className={`${styleKey === 'ballad' ? 'fas fa-heart' : 'fas fa-mountain'} text-xl ${
                      styleKey === 'ballad' ? 'text-primary-500' : 'text-secondary-500'
                    }`}></i>
                    <span className="font-display font-semibold text-primary-700 text-lg">
                      {styleKey === 'ballad' ? '발라드' : '엔카'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
                    {styleInfo.tips}
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">추천 테마</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {styleInfo.themes.map((theme, idx) => (
                          <span key={idx} className={`px-2 py-1 rounded-full text-xs font-medium ${
                            styleKey === 'ballad' ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-600'
                          }`}>
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">키워드</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {styleInfo.words.slice(0, 4).map((word, idx) => (
                          <span key={idx} className="text-xs text-neutral-400 border border-neutral-200 px-2 py-0.5 rounded-full">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* 실시간 분석 결과 */}
      {analysis && analysis.primaryEmotion && (
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/30 p-6 shadow-premium animate-scale-in">
          <h4 className="font-display font-semibold text-primary-700 mb-4 flex items-center gap-2">
            <i className="fas fa-chart-pie text-accent-500"></i>
            실시간 감정 분석
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 주요 감정 */}
            <div>
              <h5 className="text-sm font-medium text-neutral-600 mb-3">주요 감정</h5>
              <div className={`p-4 rounded-2xl ${getEmotionColor(analysis.primaryEmotion.name)} border border-current/20`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">
                    {getEmotionName(analysis.primaryEmotion.name)}
                  </span>
                  <span className="text-sm font-mono">
                    {Math.round(analysis.primaryEmotion.score)}%
                  </span>
                </div>
              </div>
            </div>
            
            {/* 감정 분포 */}
            <div>
              <h5 className="text-sm font-medium text-neutral-600 mb-3">감정 분포</h5>
              <div className="space-y-2">
                {Object.entries(analysis.emotions)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([emotion, score]) => (
                    score > 0 && (
                      <div key={emotion} className="flex items-center gap-3">
                        <span className="text-sm w-12 text-neutral-600">
                          {getEmotionName(emotion)}
                        </span>
                        <div className="flex-1 bg-neutral-200 rounded-full h-2">
                          <div 
                            className={`h-full rounded-full ${getEmotionColor(emotion).split(' ')[1]}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-500 w-8">
                          {Math.round(score)}%
                        </span>
                      </div>
                    )
                  ))}
              </div>
            </div>
          </div>
          
          {/* 추가 통계 */}
          <div className="mt-6 pt-4 border-t border-white/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-primary-600">{analysis.stats.wordCount}</div>
                <div className="text-xs text-neutral-500">총 단어 수</div>
              </div>
              <div>
                <div className="text-lg font-bold text-secondary-600">{analysis.stats.lineCount}</div>
                <div className="text-xs text-neutral-500">총 행 수</div>
              </div>
              <div>
                <div className="text-lg font-bold text-accent-600">{analysis.stats.avgWordsPerLine}</div>
                <div className="text-xs text-neutral-500">행당 평균 단어</div>
              </div>
              <div>
                <div className={`text-lg font-bold ${
                  analysis.stats.complexity === 'high' ? 'text-red-600' :
                  analysis.stats.complexity === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {analysis.stats.complexity === 'high' ? '높음' :
                   analysis.stats.complexity === 'medium' ? '보통' : '낮음'}
                </div>
                <div className="text-xs text-neutral-500">복잡도</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={!poem.trim() || isAnalyzing}
        className="w-full relative group overflow-hidden rounded-3xl px-8 py-5 text-xl font-display font-bold 
                 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 text-white 
                 shadow-premium transition-all duration-300 
                 hover:from-primary-700 hover:via-primary-600 hover:to-secondary-700 
                 hover:shadow-glow hover:scale-105 
                 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        aria-label="AI로 곡 생성하기"
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          <i className="fas fa-sparkles text-2xl"></i>
          {isAnalyzing ? "분석 중..." : "AI로 곡 생성하기"}
          <i className="fas fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-accent-500/20 to-primary-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </button>
    </form>
  );
}
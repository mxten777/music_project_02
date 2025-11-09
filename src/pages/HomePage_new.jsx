import React, { useState } from "react";
import EnhancedPoemInputForm from "../components/EnhancedPoemInputForm";
import PoemTemplateSelector from "../components/PoemTemplateSelector";
import AIComposer from "../components/AIComposer";

export default function HomePage() {
  const [submitted, setSubmitted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeMode, setActiveMode] = useState('ai'); // 'traditional' or 'ai'

  const handlePoemSubmit = async ({ poem, style, analysis = {} }) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    setSubmitted(null);
    try {
      // 실제 API 연동 시 await fetch/post 등 사용
      await new Promise((res) => setTimeout(res, 1500)); // 테스트용 딜레이
      setSubmitted({ poem, style, analysis });
      setSuccess(true);
    } catch {
      setError("곡 생성 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="flex justify-center items-start min-h-[70vh] py-12 sm:py-16 px-4 relative"
      aria-label="시 입력 및 곡 생성 메인 영역"
    >
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-primary-200/30 rounded-full blur-xl animate-bounce-soft"></div>
      <div className="absolute top-32 right-20 w-16 h-16 bg-secondary-200/30 rounded-full blur-lg animate-bounce-soft" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-accent-200/20 rounded-full blur-2xl animate-bounce-soft" style={{ animationDelay: '1s' }}></div>
      
      <section className="w-full max-w-6xl relative z-10">
        {/* Premium hero section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full text-primary-700 font-medium text-sm mb-6 border border-primary-200/50">
            <i className="fas fa-sparkles text-primary-500"></i>
            AI 기반 음악 창작 플랫폼
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-6 text-transparent bg-gradient-to-r from-primary-700 via-secondary-600 to-primary-600 bg-clip-text drop-shadow-sm animate-slide-up"
            tabIndex={0}
            aria-label="나만의 시로 곡 만들기"
          >
            나만의 시로 곡 만들기
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 font-light max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            당신의 소중한 시를 아름다운 멜로디로 변환해드립니다.<br />
            <span className="text-primary-600 font-medium">AI가 만드는 특별한 음악 경험</span>을 시작해보세요.
          </p>
        </div>

        {/* 모드 선택 탭 */}
        <div className="flex justify-center mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex bg-white/50 backdrop-blur-sm rounded-2xl p-2 border border-white/30 shadow-lg">
            <button
              onClick={() => setActiveMode('traditional')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeMode === 'traditional'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <i className="fas fa-feather-alt mr-2"></i>
              클래식 모드
            </button>
            <button
              onClick={() => setActiveMode('ai')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeMode === 'ai'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <i className="fas fa-brain mr-2"></i>
              AI 작곡가
            </button>
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        {activeMode === 'traditional' ? (
          <div>
            {/* Premium input form container */}
            <div className="relative animate-scale-in" style={{ animationDelay: '0.3s' }}>
              {/* Glassmorphism card */}
              <div className="relative bg-white/60 backdrop-blur-xl rounded-4xl shadow-premium border border-white/30 p-8 sm:p-12 overflow-hidden">
                {/* Card background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-primary-50/30 to-secondary-50/30 rounded-4xl"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-200/20 to-secondary-200/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-accent-200/20 to-primary-200/20 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <EnhancedPoemInputForm onSubmit={handlePoemSubmit} />
                  
                  {/* Loading state */}
                  {loading && (
                    <div
                      className="mt-8 flex flex-col items-center gap-4 text-primary-600 animate-pulse"
                      role="status"
                      aria-live="polite"
                    >
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-secondary-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-primary-700 mb-1">AI가 곡을 생성하고 있습니다</div>
                        <div className="text-sm text-neutral-500">잠시만 기다려주세요...</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Error state */}
                  {error && (
                    <div
                      className="mt-8 p-6 border-l-4 border-red-500 rounded-2xl bg-gradient-to-r from-red-50 to-red-100/50 backdrop-blur-sm shadow-lg animate-slide-up"
                      role="alert"
                    >
                      <div className="flex items-center gap-3">
                        <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
                        <div>
                          <div className="font-semibold text-red-700 mb-1">오류가 발생했습니다</div>
                          <div className="text-red-600">{error}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Success state */}
                  {success && submitted && (
                    <div
                      className="mt-8 p-8 rounded-3xl bg-gradient-to-br from-accent-50 via-primary-50 to-secondary-50 border border-accent-200/50 shadow-premium animate-scale-in"
                      aria-live="polite"
                    >
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full mb-4 animate-bounce-soft">
                          <i className="fas fa-check text-white text-2xl"></i>
                        </div>
                        <h2 className="font-display font-bold text-2xl text-primary-700 mb-2">
                          곡 생성 완료!
                        </h2>
                        <p className="text-neutral-600">당신의 시가 아름다운 음악으로 탄생했습니다</p>
                      </div>
                      
                      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                        <h3 className="font-semibold text-primary-700 mb-4 flex items-center gap-2">
                          <i className="fas fa-feather-alt text-primary-500"></i>
                          생성된 시
                        </h3>
                        <div className="mb-4">
                          <div className="text-sm text-neutral-600 mb-2">스타일: <span className="font-medium text-primary-600">{submitted.style === 'ballad' ? '발라드' : '엔카'}</span></div>
                          <pre className="whitespace-pre-wrap text-neutral-700 font-mono text-sm leading-relaxed bg-neutral-50/50 p-4 rounded-xl border border-neutral-200/50">
                            {submitted.poem}
                          </pre>
                        </div>
                        
                        {/* 분석 결과 표시 */}
                        {submitted.analysis && Object.keys(submitted.analysis).length > 0 && (
                          <div className="mt-6 p-4 bg-primary-50/50 rounded-xl border border-primary-200/30">
                            <h4 className="font-semibold text-primary-700 mb-3 flex items-center gap-2">
                              <i className="fas fa-chart-bar text-primary-500"></i>
                              AI 분석 결과
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              {submitted.analysis.emotions && (
                                <div>
                                  <span className="font-medium text-neutral-700">감정 분석:</span>
                                  <div className="mt-1">
                                    {Object.entries(submitted.analysis.emotions).map(([emotion, score]) => (
                                      <div key={emotion} className="flex justify-between items-center">
                                        <span className="text-neutral-600 capitalize">{emotion}</span>
                                        <span className="text-primary-600 font-medium">{score}%</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {submitted.analysis.complexity && (
                                <div>
                                  <span className="font-medium text-neutral-700">복잡도:</span>
                                  <span className="ml-2 text-secondary-600 font-medium capitalize">{submitted.analysis.complexity}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                          <button className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 hover:scale-105 shadow-lg">
                            <i className="fas fa-play mr-2"></i>
                            곡 듣기
                          </button>
                          <button className="flex-1 bg-white/80 text-primary-700 py-3 px-6 rounded-xl font-semibold hover:bg-white border border-primary-200/50 transition-all duration-300 hover:scale-105 shadow-lg">
                            <i className="fas fa-download mr-2"></i>
                            다운로드
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 템플릿 선택 토글 */}
            <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 hover:bg-white/80 border border-primary-200/50 rounded-2xl text-primary-700 font-medium transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <i className={`fas ${showTemplates ? 'fa-times' : 'fa-scroll'} text-primary-500`}></i>
                {showTemplates ? '템플릿 닫기' : '시 템플릿 보기'}
              </button>
            </div>

            {/* 템플릿 선택기 */}
            {showTemplates && (
              <div className="mt-8">
                <PoemTemplateSelector 
                  onSelectTemplate={(template) => {
                    // 이벤트를 통해 EnhancedPoemInputForm에 템플릿 전달
                    const event = new CustomEvent('selectTemplate', { detail: template });
                    document.dispatchEvent(event);
                    setShowTemplates(false);
                  }}
                  style="ballad" // 기본값, 실제로는 현재 선택된 스타일을 전달해야 함
                />
              </div>
            )}
          </div>
        ) : (
          /* AI 작곡가 모드 */
          <AIComposer />
        )}

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="text-center p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/30 hover:bg-white/60 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-robot text-white text-xl"></i>
            </div>
            <h3 className="font-semibold text-primary-700 mb-2">AI 작곡</h3>
            <p className="text-sm text-neutral-600">첨단 AI 기술로 당신만의 독특한 멜로디를 생성합니다</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/30 hover:bg-white/60 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-palette text-white text-xl"></i>
            </div>
            <h3 className="font-semibold text-secondary-700 mb-2">다양한 스타일</h3>
            <p className="text-sm text-neutral-600">발라드부터 엔카까지, 원하는 장르로 곡을 만들어보세요</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/30 hover:bg-white/60 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-heart text-white text-xl"></i>
            </div>
            <h3 className="font-semibold text-accent-700 mb-2">감정 표현</h3>
            <p className="text-sm text-neutral-600">시의 감정을 분석하여 가장 적합한 음악으로 표현합니다</p>
          </div>
        </div>
      </section>
    </main>
  );
}
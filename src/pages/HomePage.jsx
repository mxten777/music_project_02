import React from "react";
import AIComposer from "../components/AIComposer";

export default function HomePage() {
  return (
    <main
      className="flex justify-center items-start min-h-[70vh] py-12 sm:py-16 px-4 relative"
      aria-label="AI 음악 생성 메인 영역"
    >
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-primary-200/30 rounded-full blur-xl animate-bounce-soft"></div>
      <div className="absolute top-32 right-20 w-16 h-16 bg-secondary-200/30 rounded-full blur-lg animate-bounce-soft" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-accent-200/20 rounded-full blur-2xl animate-bounce-soft" style={{ animationDelay: '1s' }}></div>
      
      <section className="w-full max-w-6xl relative z-10">
        {/* Premium hero section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-700 font-medium text-sm mb-6 border border-purple-200/50">
            <i className="fas fa-brain text-purple-500"></i>
            고급 AI 음악 생성 시스템
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-6 text-transparent bg-gradient-to-r from-purple-700 via-pink-600 to-purple-600 bg-clip-text drop-shadow-sm animate-slide-up"
            tabIndex={0}
          >
            AI로 나만의 곡 만들기
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 font-light max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            당신의 가사와 감정을 분석하여 완벽한 음악을 실시간으로 생성합니다.<br />
            <span className="text-purple-600 font-medium">차세대 AI 작곡 기술</span>을 경험해보세요.
          </p>
        </div>

        {/* AI 작곡가 컴포넌트 */}
        <AIComposer />

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="text-center p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/30 hover:bg-white/60 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-brain text-white text-xl"></i>
            </div>
            <h3 className="font-semibold text-purple-700 mb-2">고급 AI 분석</h3>
            <p className="text-sm text-neutral-600">가사의 감정, 구조, 리듬을 정밀 분석하여 최적의 음악을 생성합니다</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/30 hover:bg-white/60 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-music text-white text-xl"></i>
            </div>
            <h3 className="font-semibold text-pink-700 mb-2">실시간 작곡</h3>
            <p className="text-sm text-neutral-600">멜로디, 화성, 리듬을 실시간으로 생성하고 바로 들어볼 수 있습니다</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/30 hover:bg-white/60 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-palette text-white text-xl"></i>
            </div>
            <h3 className="font-semibold text-indigo-700 mb-2">다양한 장르</h3>
            <p className="text-sm text-neutral-600">발라드, 팝, 재즈, 록 등 원하는 장르와 감정으로 맞춤 제작</p>
          </div>
        </div>
      </section>
    </main>
  );
}
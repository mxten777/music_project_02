import React, { useState } from "react";

export default function PoemInputForm({ onSubmit }) {
  const [poem, setPoem] = useState("");
  const [style, setStyle] = useState("ballad");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!poem.trim()) return;
    onSubmit?.({ poem, style });
    setPoem("");
  };

  const poemLength = poem.length;
  const maxLength = 500;

  return (
    <form className="space-y-8" onSubmit={handleSubmit} aria-label="시 입력 폼" role="form">
      {/* Premium textarea section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="poem-textarea" className="font-display font-semibold text-primary-700 text-lg flex items-center gap-2">
            <i className="fas fa-feather-alt text-primary-500"></i>
            시 입력
          </label>
          <div className="text-sm text-neutral-500">
            {poemLength}/{maxLength}
          </div>
        </div>
        
        <div className="relative group">
          <textarea
            id="poem-textarea"
            className="w-full px-6 py-4 border-2 border-primary-200/50 rounded-2xl resize-y min-h-[180px] bg-white/70 backdrop-blur-sm 
                     focus:bg-white focus:border-primary-400 focus:ring-4 focus:ring-primary-100 
                     transition-all duration-300 shadow-lg text-base sm:text-lg leading-relaxed
                     hover:border-primary-300 hover:shadow-xl group-hover:bg-white/80
                     placeholder:text-neutral-400 placeholder:italic"
            placeholder="여기에 당신의 아름다운 시를 입력하세요...
            
예시:
봄날의 햇살이 창가에 스며들고
따스한 바람이 마음을 어루만진다
새로운 시작의 설렘과 함께
오늘도 희망찬 하루가 시작된다"
            value={poem}
            onChange={(e) => setPoem(e.target.value)}
            maxLength={maxLength}
            required
            aria-label="시 입력란"
          />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-400/5 to-secondary-400/5 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
        </div>
        
        {/* Writing tips */}
        <div className="text-sm text-neutral-600 bg-primary-50/50 rounded-xl p-4 border border-primary-100/50">
          <div className="flex items-start gap-2">
            <i className="fas fa-lightbulb text-primary-500 mt-0.5"></i>
            <div>
              <span className="font-medium text-primary-700">작성 팁:</span>
              <span className="ml-2">감정이 풍부한 시일수록 더 아름다운 멜로디가 만들어집니다</span>
            </div>
          </div>
        </div>
      </div>

      {/* Premium style selection */}
      <div className="space-y-4">
        <fieldset aria-label="곡 스타일 선택">
          <legend className="font-display font-semibold text-primary-700 text-lg mb-4 flex items-center gap-2">
            <i className="fas fa-music text-secondary-500"></i>
            음악 스타일 선택
          </legend>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ballad option */}
            <label className={`relative cursor-pointer group ${style === "ballad" ? "scale-105" : ""} transition-all duration-300`}>
              <input
                type="radio"
                name="style"
                value="ballad"
                checked={style === "ballad"}
                onChange={() => setStyle("ballad")}
                className="sr-only"
                aria-label="발라드 스타일 선택"
              />
              <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                style === "ballad" 
                ? "border-primary-400 bg-gradient-to-br from-primary-50 to-primary-100 shadow-glow" 
                : "border-primary-200/50 bg-white/60 hover:border-primary-300 hover:bg-white/80"
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    style === "ballad" ? "border-primary-500 bg-primary-500" : "border-primary-300"
                  }`}>
                    {style === "ballad" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <i className="fas fa-heart text-primary-500 text-xl"></i>
                  <span className="font-display font-semibold text-primary-700 text-lg">발라드</span>
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  감성적이고 서정적인 멜로디로 시의 감정을 깊이 있게 표현합니다
                </p>
                <div className="mt-3 flex gap-2">
                  <span className="px-2 py-1 bg-primary-100 text-primary-600 rounded-full text-xs font-medium">감성적</span>
                  <span className="px-2 py-1 bg-primary-100 text-primary-600 rounded-full text-xs font-medium">서정적</span>
                </div>
              </div>
            </label>

            {/* Enka option */}
            <label className={`relative cursor-pointer group ${style === "enka" ? "scale-105" : ""} transition-all duration-300`}>
              <input
                type="radio"
                name="style"
                value="enka"
                checked={style === "enka"}
                onChange={() => setStyle("enka")}
                className="sr-only"
                aria-label="엔카 스타일 선택"
              />
              <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                style === "enka" 
                ? "border-secondary-400 bg-gradient-to-br from-secondary-50 to-secondary-100 shadow-glow-purple" 
                : "border-secondary-200/50 bg-white/60 hover:border-secondary-300 hover:bg-white/80"
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    style === "enka" ? "border-secondary-500 bg-secondary-500" : "border-secondary-300"
                  }`}>
                    {style === "enka" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <i className="fas fa-torii-gate text-secondary-500 text-xl"></i>
                  <span className="font-display font-semibold text-secondary-700 text-lg">엔카</span>
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  전통적이고 깊이 있는 일본 스타일의 감성적인 멜로디를 만들어줍니다
                </p>
                <div className="mt-3 flex gap-2">
                  <span className="px-2 py-1 bg-secondary-100 text-secondary-600 rounded-full text-xs font-medium">전통적</span>
                  <span className="px-2 py-1 bg-secondary-100 text-secondary-600 rounded-full text-xs font-medium">깊이감</span>
                </div>
              </div>
            </label>
          </div>
        </fieldset>
      </div>

      {/* Premium submit button */}
      <button
        type="submit"
        disabled={!poem.trim()}
        className="w-full relative group overflow-hidden rounded-2xl px-8 py-4 text-lg font-display font-semibold 
                 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 text-white 
                 shadow-premium transition-all duration-300 
                 hover:from-primary-700 hover:via-primary-600 hover:to-secondary-700 
                 hover:shadow-glow hover:scale-105 
                 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        aria-label="곡 생성하기"
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          <i className="fas fa-magic text-xl"></i>
          AI로 곡 생성하기
          <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-accent-500/20 to-primary-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </button>
    </form>
  );
}

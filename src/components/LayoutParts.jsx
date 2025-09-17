import React from "react";

export function Header() {
  return (
    <header className="w-full py-4 sm:py-5 px-2 sm:px-4 bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400 text-white shadow-lg drop-shadow-xl animate-fadeIn relative" role="banner" aria-label="사이트 헤더">
      <div className="max-w-4xl mx-auto flex items-center justify-center relative h-14 sm:h-16">
        {/* 좌측 로고 */}
        <img
          src="/images/baikal_logo.png"
          alt="Baikal 로고"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white object-cover border-2 border-blue-200 shadow absolute left-0 top-1/2 -translate-y-1/2"
          style={{ backgroundColor: 'white' }}
        />
        {/* 중앙 타이틀 */}
        <span className="font-extrabold text-xl sm:text-2xl tracking-tight drop-shadow text-center mx-auto" tabIndex={0} aria-label="나만의 시 앨범">
          나만의 시 앨범
        </span>
        {/* 우측 정보(헤더 우측 아래) */}
        <div className="absolute right-0 bottom-[-8px] sm:bottom-[-12px] text-xs opacity-80 italic pr-2 sm:pr-0" aria-label="기술 정보">
          powered by React & Tailwind
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="w-full py-4 sm:py-5 px-2 sm:px-4 bg-gradient-to-r from-cyan-50 via-blue-100 to-indigo-100 text-blue-700 text-center text-xs mt-10 border-t shadow-inner animate-fadeIn" role="contentinfo" aria-label="사이트 푸터">
      <div className="max-w-4xl mx-auto">
        &copy; 2025 <span className="font-semibold">나만의 시 앨범</span>. 모든 권리 보유. | <span className="text-blue-400">Demo UI</span>
      </div>
    </footer>
  );
}

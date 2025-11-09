import React from "react";

export function Header() {
  return (
    <header className="w-full py-6 sm:py-8 px-4 sm:px-6 bg-gradient-to-r from-primary-800 via-primary-700 to-secondary-700 text-white shadow-premium relative overflow-hidden animate-slide-down" role="banner" aria-label="사이트 헤더">
      {/* Premium background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20 animate-gradient-x"></div>
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-secondary-300/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto flex items-center justify-between relative h-16 sm:h-20">
        {/* 좌측 로고 영역 */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <img
              src="/images/baikal_logo.png"
              alt="Baikal 로고"
              className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white object-cover border-3 border-white/30 shadow-premium hover:scale-110 transition-transform duration-300"
              style={{ backgroundColor: 'white' }}
            />
          </div>
          <div className="hidden sm:block">
            <div className="text-xs text-primary-200 font-medium">Premium</div>
            <div className="text-sm text-white/90 font-mono">Music Creator</div>
          </div>
        </div>
        
        {/* 중앙 타이틀 */}
        <div className="flex-1 text-center px-2">
          <h1 className="font-display font-bold text-lg sm:text-2xl md:text-3xl lg:text-4xl tracking-tight drop-shadow-lg bg-gradient-to-r from-white via-primary-100 to-secondary-100 bg-clip-text text-transparent" tabIndex={0} aria-label="나만의 시 앨범">
            나만의 시 앨범
          </h1>
          <p className="text-xs sm:text-sm text-primary-200 mt-1 font-light tracking-wide">Poetry meets Music</p>
        </div>
        
        {/* 우측 액션 버튼들 */}
        <div className="flex items-center gap-2">
          <button className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm border border-white/20 text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-105">
            <i className="fas fa-user-circle text-sm"></i>
            <span className="hidden lg:inline">계정</span>
          </button>
          <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-glow">
            <i className="fas fa-sparkles text-sm"></i>
            <span className="hidden sm:inline">Premium</span>
          </button>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500"></div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="w-full py-8 sm:py-12 px-4 sm:px-6 bg-gradient-to-r from-neutral-900 via-primary-900 to-secondary-900 text-white mt-20 relative overflow-hidden animate-fade-in" role="contentinfo" aria-label="사이트 푸터">
      {/* Premium background effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-400 to-transparent"></div>
      
      <div className="max-w-6xl mx-auto relative">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand section */}
          <div className="text-center md:text-left">
            <h3 className="font-display font-bold text-xl mb-3 bg-gradient-to-r from-primary-300 to-secondary-300 bg-clip-text text-transparent">
              나만의 시 앨범
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed mb-4">
              시와 음악을 하나로 연결하는<br />
              프리미엄 창작 플랫폼
            </p>
            <div className="flex justify-center md:justify-start gap-4">
              <button className="text-neutral-400 hover:text-primary-400 transition-colors duration-300">
                <i className="fab fa-twitter text-lg"></i>
              </button>
              <button className="text-neutral-400 hover:text-secondary-400 transition-colors duration-300">
                <i className="fab fa-instagram text-lg"></i>
              </button>
              <button className="text-neutral-400 hover:text-accent-400 transition-colors duration-300">
                <i className="fab fa-youtube text-lg"></i>
              </button>
            </div>
          </div>
          
          {/* Quick links */}
          <div className="text-center">
            <h4 className="font-semibold text-white mb-4">서비스</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-primary-300 transition-colors duration-300">곡 만들기</a></li>
              <li><a href="#" className="hover:text-primary-300 transition-colors duration-300">앨범 관리</a></li>
              <li><a href="#" className="hover:text-primary-300 transition-colors duration-300">커뮤니티</a></li>
              <li><a href="#" className="hover:text-primary-300 transition-colors duration-300">프리미엄</a></li>
            </ul>
          </div>
          
          {/* Support */}
          <div className="text-center md:text-right">
            <h4 className="font-semibold text-white mb-4">지원</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-secondary-300 transition-colors duration-300">도움말</a></li>
              <li><a href="#" className="hover:text-secondary-300 transition-colors duration-300">문의하기</a></li>
              <li><a href="#" className="hover:text-secondary-300 transition-colors duration-300">개인정보처리방침</a></li>
              <li><a href="#" className="hover:text-secondary-300 transition-colors duration-300">이용약관</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-neutral-500">
            &copy; 2025 <span className="font-semibold text-neutral-400">나만의 시 앨범</span>. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-xs text-neutral-600">
            <span className="flex items-center gap-1">
              <i className="fas fa-code text-primary-500"></i>
              React & Tailwind
            </span>
            <span className="flex items-center gap-1">
              <i className="fas fa-heart text-accent-500"></i>
              Made with love
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

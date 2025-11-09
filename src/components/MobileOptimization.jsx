import React, { useState, useEffect } from 'react';

// 모바일 최적화 훅
export const useMobileOptimization = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [orientation, setOrientation] = useState('portrait');
  const [touchSupport, setTouchSupport] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
      setOrientation(width > height ? 'landscape' : 'portrait');
      setTouchSupport('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    orientation,
    touchSupport,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  };
};

// 모바일 네비게이션 컴포넌트
export const MobileNavigation = ({ currentPage, onPageChange, pages }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isMobile } = useMobileOptimization();

  if (!isMobile) return null;

  return (
    <>
      {/* 모바일 상단 헤더 */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-lg border-b border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🎵</span>
            </div>
            <span className="text-white font-semibold text-lg">뮤직코딩</span>
          </div>
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 text-white"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* 모바일 사이드 메뉴 */}
      <div className={`lg:hidden fixed inset-0 z-40 transform transition-transform duration-300 ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
        
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-900 border-l border-gray-700">
          <div className="p-6 pt-20">
            <div className="space-y-4">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => {
                    onPageChange(page.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 p-4 rounded-xl text-left transition-all ${
                    currentPage === page.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span className="text-2xl">{page.icon}</span>
                  <div>
                    <div className="font-semibold">{page.name}</div>
                    <div className="text-sm opacity-75">{page.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 탭 네비게이션 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700">
        <div className="flex">
          {pages.slice(0, 4).map((page) => (
            <button
              key={page.id}
              onClick={() => onPageChange(page.id)}
              className={`flex-1 flex flex-col items-center py-3 px-2 transition-colors ${
                currentPage === page.id
                  ? 'text-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <span className="text-xl mb-1">{page.icon}</span>
              <span className="text-xs font-medium">{page.shortName || page.name}</span>
            </button>
          ))}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex-1 flex flex-col items-center py-3 px-2 text-gray-400 hover:text-gray-300"
          >
            <span className="text-xl mb-1">⋯</span>
            <span className="text-xs font-medium">더보기</span>
          </button>
        </div>
      </div>
    </>
  );
};

// 모바일 최적화 컨테이너
export const MobileOptimizedContainer = ({ children, className = '' }) => {
  const { isMobile, isTablet } = useMobileOptimization();

  return (
    <div className={`
      ${isMobile ? 'pt-16 pb-20 px-3' : isTablet ? 'pt-4 pb-4 px-6' : 'px-8'}
      ${className}
    `}>
      {children}
    </div>
  );
};

// 터치 친화적 버튼
export const TouchFriendlyButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = '',
  ...props 
}) => {
  const { touchSupport } = useMobileOptimization();

  const baseClasses = `
    inline-flex items-center justify-center font-semibold rounded-xl
    transition-all duration-200 active:scale-95
    ${touchSupport ? 'min-h-[44px] min-w-[44px]' : 'min-h-[36px]'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700',
    secondary: 'bg-gray-800 text-gray-200 hover:bg-gray-700',
    outline: 'border-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white',
    ghost: 'text-gray-400 hover:text-white hover:bg-gray-800'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// 모바일 카드 컴포넌트
export const MobileCard = ({ children, className = '', onClick }) => {
  const { touchSupport } = useMobileOptimization();

  return (
    <div 
      className={`
        bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700
        ${onClick ? 'cursor-pointer hover:bg-gray-800/70 active:scale-[0.98]' : ''}
        ${touchSupport ? 'p-4' : 'p-3'}
        transition-all duration-200
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// 스와이프 가능한 카드 리스트
export const SwipeableCardList = ({ items, renderItem, onSwipeDelete }) => {
  const [_swipedItem, setSwipedItem] = useState(null);
  const { touchSupport } = useMobileOptimization();

  const handleTouchStart = (e) => {
    if (!touchSupport) return;
    
    const touch = e.touches[0];
    const element = e.currentTarget;
    
    element.startX = touch.clientX;
    element.startY = touch.clientY;
  };

  const handleTouchMove = (e) => {
    if (!touchSupport || !e.currentTarget.startX) return;
    
    const touch = e.touches[0];
    const element = e.currentTarget;
    const deltaX = touch.clientX - element.startX;
    const deltaY = touch.clientY - element.startY;
    
    // 수평 스와이프만 처리
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      element.style.transform = `translateX(${deltaX}px)`;
      element.style.opacity = Math.max(0.3, 1 - Math.abs(deltaX) / 200);
    }
  };

  const handleTouchEnd = (e, itemId) => {
    if (!touchSupport) return;
    
    const element = e.currentTarget;
    const deltaX = element.style.transform.match(/-?\d+/) || [0];
    const distance = Math.abs(parseFloat(deltaX[0]));
    
    if (distance > 100) {
      setSwipedItem(itemId);
      element.style.transform = 'translateX(-100%)';
      element.style.opacity = '0';
      
      setTimeout(() => {
        onSwipeDelete && onSwipeDelete(itemId);
        setSwipedItem(null);
      }, 300);
    } else {
      element.style.transform = 'translateX(0)';
      element.style.opacity = '1';
    }
  };

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={(e) => handleTouchEnd(e, item.id)}
        >
          {/* 삭제 배경 */}
          <div className="absolute inset-0 bg-red-600 flex items-center justify-end pr-6">
            <span className="text-white font-semibold">🗑️ 삭제</span>
          </div>
          
          {/* 아이템 컨텐츠 */}
          <div className="relative bg-gray-800 transition-all duration-300">
            {renderItem(item)}
          </div>
        </div>
      ))}
    </div>
  );
};

// 모바일 플레이어 컨트롤
export const MobilePlayerControls = ({ 
  isPlaying, 
  onPlayPause, 
  onPrevious, 
  onNext,
  currentTime = 0,
  duration = 100,
  onSeek
}) => {
  const { isMobile } = useMobileOptimization();

  if (!isMobile) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-20 left-0 right-0 z-20 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700 p-4">
      {/* 진행 바 */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none slider"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 컨트롤 버튼 */}
      <div className="flex items-center justify-center space-x-8">
        <TouchFriendlyButton onClick={onPrevious} variant="ghost" size="lg">
          ⏮️
        </TouchFriendlyButton>
        
        <TouchFriendlyButton 
          onClick={onPlayPause} 
          variant="primary" 
          size="lg"
          className="w-16 h-16 rounded-full"
        >
          {isPlaying ? '⏸️' : '▶️'}
        </TouchFriendlyButton>
        
        <TouchFriendlyButton onClick={onNext} variant="ghost" size="lg">
          ⏭️
        </TouchFriendlyButton>
      </div>
    </div>
  );
};

// PWA 설치 프롬프트
export const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA 설치됨');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // 이미 PWA로 실행 중이거나 최근에 거부했으면 숨김
  if (!showPrompt || 
      window.matchMedia('(display-mode: standalone)').matches ||
      localStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 shadow-lg">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
          <span className="text-2xl">📱</span>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold">앱으로 설치하기</h3>
          <p className="text-white/80 text-sm">더 빠르고 편리한 사용을 위해 앱을 설치하세요</p>
        </div>
      </div>
      
      <div className="flex space-x-3 mt-3">
        <TouchFriendlyButton 
          onClick={handleInstall}
          variant="secondary"
          size="sm"
        >
          설치
        </TouchFriendlyButton>
        <TouchFriendlyButton 
          onClick={handleDismiss}
          variant="ghost"
          size="sm"
        >
          나중에
        </TouchFriendlyButton>
      </div>
    </div>
  );
};

export default {
  useMobileOptimization,
  MobileNavigation,
  MobileOptimizedContainer,
  TouchFriendlyButton,
  MobileCard,
  SwipeableCardList,
  MobilePlayerControls,
  PWAInstallPrompt
};
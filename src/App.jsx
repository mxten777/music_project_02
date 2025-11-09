
import React, { useState } from "react";
import HomePage from "./pages/HomePage";
import AlbumPage from "./pages/AlbumPage";
import CollaborationPage from "./pages/CollaborationPage";
import ProfessionalAudioPage from "./pages/ProfessionalAudioPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import { Header, Footer } from "./components/LayoutParts";
import { AlbumProvider } from "./contexts/AlbumContext";

function App() {
  const [page, setPage] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState("");

  const handleComingSoon = (featureName) => {
    setComingSoonFeature(featureName);
    setShowComingSoonModal(true);
  };

  return (
    <AlbumProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-secondary-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-radial from-primary-100/30 via-transparent to-secondary-100/20 pointer-events-none"></div>
      <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-primary-200/20 to-secondary-200/20 rounded-full blur-3xl pointer-events-none animate-float"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tr from-accent-200/20 to-primary-200/20 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: '1s' }}></div>
      
      <Header />
      
      {/* Premium Navigation */}
      <nav className="relative z-10 border-b border-white/20 bg-white/10 backdrop-blur-xl shadow-premium animate-slide-down">
        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-wrap gap-3 sm:gap-6 p-6 justify-center sm:justify-start">
          <div className="flex gap-3 sm:gap-4 bg-white/20 p-2 rounded-2xl backdrop-blur-sm border border-white/30">
          <button
            className={
              "px-6 py-3 rounded-xl font-display font-semibold transition-all duration-300 text-base relative group overflow-hidden " +
              (page === "home"
                ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-glow transform scale-105"
                : "text-primary-700 bg-white/70 hover:bg-white/90 hover:text-primary-800 hover:shadow-lg hover:scale-105")
            }
            aria-current={page === "home" ? "page" : undefined}
            onClick={() => setPage("home")}
          >
            <span className="relative z-10 flex items-center gap-2">
              <i className="fas fa-feather-alt"></i>
              시로 곡 만들기
            </span>
            {page === "home" && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 opacity-20 animate-gradient-x"></div>
            )}
          </button>
          <button
            className={
              "px-6 py-3 rounded-xl font-display font-semibold transition-all duration-300 text-base relative group overflow-hidden " +
              (page === "album"
                ? "bg-gradient-to-r from-secondary-600 to-secondary-700 text-white shadow-glow-purple transform scale-105"
                : "text-secondary-700 bg-white/70 hover:bg-white/90 hover:text-secondary-800 hover:shadow-lg hover:scale-105")
            }
            aria-current={page === "album" ? "page" : undefined}
            onClick={() => handleComingSoon("나의 앨범")}
          >
            <span className="relative z-10 flex items-center gap-2">
              <i className="fas fa-compact-disc"></i>
              나의 앨범
            </span>
            {page === "album" && (
              <div className="absolute inset-0 bg-gradient-to-r from-secondary-500 to-primary-500 opacity-20 animate-gradient-x"></div>
            )}
          </button>
          <button
            className={
              "px-6 py-3 rounded-xl font-display font-semibold transition-all duration-300 text-base relative group overflow-hidden " +
              (page === "collaboration"
                ? "bg-gradient-to-r from-purple-600 to-blue-700 text-white shadow-glow-purple transform scale-105"
                : "text-purple-700 bg-white/70 hover:bg-white/90 hover:text-purple-800 hover:shadow-lg hover:scale-105")
            }
            aria-current={page === "collaboration" ? "page" : undefined}
            onClick={() => handleComingSoon("협업 스튜디오")}
          >
            <span className="relative z-10 flex items-center gap-2">
              <i className="fas fa-users"></i>
              협업 스튜디오
            </span>
            {page === "collaboration" && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-20 animate-gradient-x"></div>
            )}
          </button>
          <button
            className={
              "px-6 py-3 rounded-xl font-display font-semibold transition-all duration-300 text-base relative group overflow-hidden " +
              (page === "professional"
                ? "bg-gradient-to-r from-gray-600 to-slate-700 text-white shadow-glow transform scale-105"
                : "text-gray-700 bg-white/70 hover:bg-white/90 hover:text-gray-800 hover:shadow-lg hover:scale-105")
            }
            aria-current={page === "professional" ? "page" : undefined}
            onClick={() => setPage("professional")}
          >
            <span className="relative z-10 flex items-center gap-2">
              <i className="fas fa-sliders-h"></i>
              프로 오디오
            </span>
            {page === "professional" && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-slate-500 opacity-20 animate-gradient-x"></div>
            )}
          </button>
          <button
            className={
              "px-6 py-3 rounded-xl font-display font-semibold transition-all duration-300 text-base relative group overflow-hidden " +
              (page === "analytics"
                ? "bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-glow-green transform scale-105"
                : "text-green-700 bg-white/70 hover:bg-white/90 hover:text-green-800 hover:shadow-lg hover:scale-105")
            }
            aria-current={page === "analytics" ? "page" : undefined}
            onClick={() => setPage("analytics")}
          >
            <span className="relative z-10 flex items-center gap-2">
              <i className="fas fa-chart-line"></i>
              분석 대시보드
            </span>
            {page === "analytics" && (
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-20 animate-gradient-x"></div>
            )}
          </button>
          </div>
        </div>

        {/* Mobile Navigation - Hamburger Menu */}
        <div className="md:hidden flex items-center justify-between p-4">
          <div className="text-xl font-bold text-primary-700">뮤지코딩</div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-primary-700 hover:bg-white/30 transition-all duration-300"
            aria-label="메뉴 열기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="p-4 space-y-2 bg-white/5 backdrop-blur-sm">
            <button
              className={
                "w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-3 " +
                (page === "home"
                  ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg"
                  : "text-primary-700 bg-white/70 hover:bg-white/90")
              }
              onClick={() => {setPage("home"); setIsMobileMenuOpen(false);}}
            >
              <i className="fas fa-feather-alt"></i>
              시로 곡 만들기
            </button>
            <button
              className={
                "w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-3 " +
                (page === "album"
                  ? "bg-gradient-to-r from-secondary-600 to-secondary-700 text-white shadow-lg"
                  : "text-secondary-700 bg-white/70 hover:bg-white/90")
              }
              onClick={() => {handleComingSoon("나의 앨범"); setIsMobileMenuOpen(false);}}
            >
              <i className="fas fa-compact-disc"></i>
              나의 앨범
            </button>
            <button
              className={
                "w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-3 " +
                (page === "collaboration"
                  ? "bg-gradient-to-r from-purple-600 to-blue-700 text-white shadow-lg"
                  : "text-purple-700 bg-white/70 hover:bg-white/90")
              }
              onClick={() => {handleComingSoon("협업 스튜디오"); setIsMobileMenuOpen(false);}}
            >
              <i className="fas fa-users"></i>
              협업 스튜디오
            </button>
            <button
              className={
                "w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-3 " +
                (page === "professional"
                  ? "bg-gradient-to-r from-gray-600 to-slate-700 text-white shadow-lg"
                  : "text-gray-700 bg-white/70 hover:bg-white/90")
              }
              onClick={() => {setPage("professional"); setIsMobileMenuOpen(false);}}
            >
              <i className="fas fa-sliders-h"></i>
              프로 오디오
            </button>
            <button
              className={
                "w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-3 " +
                (page === "analytics"
                  ? "bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg"
                  : "text-green-700 bg-white/70 hover:bg-white/90")
              }
              onClick={() => {setPage("analytics"); setIsMobileMenuOpen(false);}}
            >
              <i className="fas fa-chart-line"></i>
              분석 대시보드
            </button>
          </div>
        </div>
      </nav>
      
      <main className="flex-1 relative z-10 px-4 sm:px-6 animate-fade-in">
        {page === "home" ? <HomePage /> : 
         page === "album" ? <AlbumPage /> : 
         page === "collaboration" ? <CollaborationPage /> : 
         page === "professional" ? <ProfessionalAudioPage /> :
         page === "analytics" ? <AnalyticsPage /> :
         <HomePage />}
      </main>
      
      <Footer />
      
      {/* Coming Soon Modal */}
      {showComingSoonModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-premium max-w-md w-full mx-4 overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-construction text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">준비중입니다</h3>
                    <p className="text-primary-100 text-sm">Coming Soon</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowComingSoonModal(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-300"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-hammer text-3xl text-primary-600"></i>
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">
                  "{comingSoonFeature}" 기능
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  현재 개발 중인 기능입니다.<br />
                  곧 더 멋진 모습으로 찾아뵙겠습니다!
                </p>
              </div>
              
              {/* Progress Indicator */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>개발 진행률</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
                </div>
              </div>
              
              {/* Expected Features */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <i className="fas fa-star text-accent-500"></i>
                  예정된 기능들
                </h5>
                <div className="space-y-2 text-sm text-gray-600">
                  {comingSoonFeature === "나의 앨범" ? (
                    <>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-check-circle text-green-500 text-xs"></i>
                        앨범 관리 및 구성
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-check-circle text-green-500 text-xs"></i>
                        커버 이미지 업로드
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-check-circle text-green-500 text-xs"></i>
                        메타데이터 편집
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-check-circle text-green-500 text-xs"></i>
                        실시간 협업 도구
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-check-circle text-green-500 text-xs"></i>
                        프로젝트 공유 기능
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-check-circle text-green-500 text-xs"></i>
                        댓글 및 피드백 시스템
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowComingSoonModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-all duration-300"
                >
                  닫기
                </button>
                <button
                  onClick={() => setShowComingSoonModal(false)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-xl font-medium transition-all duration-300 shadow-glow"
                >
                  알림 받기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </AlbumProvider>
  );
}

export default App;

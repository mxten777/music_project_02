import React, { useState, useEffect } from 'react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import analyticsEngine from '../utils/analyticsEngine';

const AnalyticsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    // 분석 데이터 초기화 및 로드
    const initializeAnalytics = async () => {
      try {
        setIsLoading(true);
        
        // 실시간 통계 업데이트
        const systemStats = analyticsEngine.updateRealTimeStats();
        
        // 각종 분석 데이터 수집
        const userAnalysis = analyticsEngine.getUserActivityAnalysis();
        const musicMetrics = analyticsEngine.getMusicPerformanceMetrics();
        const trendAnalysis = analyticsEngine.getTrendAnalysis('1개월', '재생수');
        const recommendations = analyticsEngine.generatePersonalizedRecommendations('user_1');
        
        const data = {
          systemStats,
          userAnalysis,
          musicMetrics,
          trendAnalysis,
          recommendations
        };
        
        setAnalyticsData(data);
      } catch (error) {
        console.error('분석 데이터 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-white mb-2">분석 데이터 로딩 중...</h2>
          <p className="text-gray-400">실시간 데이터를 수집하고 있습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* 페이지 헤더 */}
      <div className="bg-black bg-opacity-30 backdrop-blur-md border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">분석 대시보드</h1>
                <p className="text-gray-300">데이터 기반 인사이트와 트렌드 분석</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">마지막 업데이트</p>
                <p className="text-white font-semibold">
                  {new Date().toLocaleString('ko-KR')}
                </p>
              </div>
              
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-white transition-colors"
              >
                🔄 새로고침
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 핵심 통계 요약 */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-black bg-opacity-20 backdrop-blur-md rounded-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">📈 실시간 핵심 지표</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickStatCard
              icon="👥"
              title="총 사용자"
              value={analyticsData?.systemStats?.totalUsers?.toLocaleString() || '0'}
              subtitle={`활성: ${analyticsData?.systemStats?.activeUsers || 0}명`}
              color="blue"
            />
            <QuickStatCard
              icon="🎵"
              title="총 곡 수"
              value={analyticsData?.systemStats?.totalSongs?.toLocaleString() || '0'}
              subtitle="업로드된 곡"
              color="green"
            />
            <QuickStatCard
              icon="▶️"
              title="총 재생수"
              value={analyticsData?.systemStats?.totalPlays?.toLocaleString() || '0'}
              subtitle="누적 재생"
              color="purple"
            />
            <QuickStatCard
              icon="⭐"
              title="평균 평점"
              value={analyticsData?.systemStats?.averageRating || '0.0'}
              subtitle="5점 만점"
              color="yellow"
            />
          </div>
        </div>

        {/* 분석 대시보드 메인 컴포넌트 */}
        <AnalyticsDashboard analyticsData={analyticsData} />

        {/* 추가 인사이트 섹션 */}
        <div className="mt-8 space-y-6">
          {/* 실시간 추천 시스템 성능 */}
          <div className="bg-black bg-opacity-20 backdrop-blur-md rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">🎯 추천 시스템 성능</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">87.5%</div>
                <div className="text-gray-300">추천 정확도</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">4.2</div>
                <div className="text-gray-300">사용자 만족도</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">23.8%</div>
                <div className="text-gray-300">클릭 전환율</div>
              </div>
            </div>
          </div>

          {/* 개인화 추천 미리보기 */}
          {analyticsData?.recommendations && (
            <div className="bg-black bg-opacity-20 backdrop-blur-md rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">🔮 AI 추천 미리보기</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyticsData.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">{rec.title}</h4>
                    <p className="text-sm text-gray-300 mb-2">{rec.genre} • {rec.mood}</p>
                    <p className="text-xs text-gray-400">{rec.reason}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-yellow-400">⭐ {rec.rating}</span>
                      <span className="text-purple-400 font-semibold">점수: {rec.recommendationScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 데이터 내보내기 옵션 */}
          <div className="bg-black bg-opacity-20 backdrop-blur-md rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">📤 데이터 내보내기</h3>
            <div className="flex flex-wrap gap-4">
              <button 
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white transition-colors"
                onClick={() => generateReport('user-analytics')}
              >
                📊 사용자 분석 리포트
              </button>
              <button 
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white transition-colors"
                onClick={() => generateReport('music-performance')}
              >
                🎵 음악 성능 리포트
              </button>
              <button 
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-white transition-colors"
                onClick={() => generateReport('trend-analysis')}
              >
                📈 트렌드 분석 리포트
              </button>
              <button 
                className="px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-lg font-semibold text-white transition-colors"
                onClick={() => generateReport('custom')}
              >
                ⚙️ 커스텀 리포트
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 빠른 통계 카드 컴포넌트
const QuickStatCard = ({ icon, title, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600', 
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600',
    pink: 'from-pink-500 to-pink-600'
  };

  return (
    <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-600">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center text-xl`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white">{value}</h3>
          <p className="text-gray-300 text-sm">{title}</p>
          {subtitle && <p className="text-gray-400 text-xs">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

// 리포트 생성 함수
const generateReport = (type) => {
  const reportOptions = {
    'user-analytics': {
      timeframe: '1개월',
      metrics: ['사용자', '세션', '참여도'],
      groupBy: 'date'
    },
    'music-performance': {
      timeframe: '1개월', 
      metrics: ['재생수', '평점', '완주율'],
      groupBy: 'genre'
    },
    'trend-analysis': {
      timeframe: '3개월',
      metrics: ['재생수', '좋아요', '공유'],
      groupBy: 'week'
    },
    'custom': {
      timeframe: '1개월',
      metrics: ['재생수', '사용자', '평점'],
      groupBy: 'genre'
    }
  };

  const options = reportOptions[type];
  const report = analyticsEngine.generateCustomReport(options);
  
  // 실제로는 파일 다운로드나 이메일 발송 구현
  console.log(`${type} 리포트 생성:`, report);
  
  // 임시로 JSON 파일로 다운로드
  const dataStr = JSON.stringify(report, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `${type}-report-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export default AnalyticsPage;
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// 메인 분석 대시보드 컴포넌트
const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('1개월');
  const [selectedMetric, setSelectedMetric] = useState('재생수');

  const tabs = [
    { id: 'overview', name: '개요', icon: '📊' },
    { id: 'users', name: '사용자 분석', icon: '👥' },
    { id: 'music', name: '음악 성능', icon: '🎵' },
    { id: 'trends', name: '트렌드', icon: '📈' },
    { id: 'recommendations', name: '추천', icon: '🎯' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                분석 대시보드
              </h1>
              <p className="text-gray-300 mt-2">
                실시간 데이터 분석과 인사이트를 제공합니다
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 outline-none"
              >
                <option value="1주">1주</option>
                <option value="1개월">1개월</option>
                <option value="3개월">3개월</option>
                <option value="6개월">6개월</option>
                <option value="1년">1년</option>
              </select>
              
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors">
                📥 리포트 다운로드
              </button>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div>
          {activeTab === 'overview' && <OverviewTab timeframe={timeframe} />}
          {activeTab === 'users' && <UsersTab timeframe={timeframe} />}
          {activeTab === 'music' && <MusicTab timeframe={timeframe} />}
          {activeTab === 'trends' && (
            <TrendsTab 
              timeframe={timeframe} 
              selectedMetric={selectedMetric}
              onMetricChange={setSelectedMetric}
            />
          )}
          {activeTab === 'recommendations' && <RecommendationsTab />}
        </div>
      </div>
    </div>
  );
};

// 개요 탭
const OverviewTab = ({ timeframe }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // 실제로는 analyticsEngine에서 데이터를 가져옴
    const mockStats = {
      totalUsers: 1247,
      activeUsers: 856,
      totalSongs: 3421,
      totalPlays: 125678,
      averageRating: 4.3,
      popularGenres: {
        '발라드': 45623,
        '엔카': 32456,
        '팝': 28934,
        '록': 18765
      },
      growth: {
        users: 12.5,
        songs: 8.3,
        plays: 23.7
      }
    };
    
    setStats(mockStats);
  }, [timeframe]);

  if (!stats) return <div>로딩 중...</div>;

  return (
    <div className="space-y-6">
      {/* 주요 메트릭 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="총 사용자"
          value={stats.totalUsers.toLocaleString()}
          change={`+${stats.growth.users}%`}
          icon="👥"
          color="blue"
        />
        <MetricCard
          title="활성 사용자"
          value={stats.activeUsers.toLocaleString()}
          change="지난 7일"
          icon="🔥"
          color="green"
        />
        <MetricCard
          title="총 곡 수"
          value={stats.totalSongs.toLocaleString()}
          change={`+${stats.growth.songs}%`}
          icon="🎵"
          color="purple"
        />
        <MetricCard
          title="총 재생수"
          value={stats.totalPlays.toLocaleString()}
          change={`+${stats.growth.plays}%`}
          icon="▶️"
          color="pink"
        />
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 인기 장르 차트 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">인기 장르</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(stats.popularGenres).map(([genre, plays]) => ({
                  name: genre,
                  value: plays
                }))}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {Object.keys(stats.popularGenres).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={['#8b5cf6', '#ec4899', '#06b6d4', '#10b981'][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 성장 추세 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">성장 추세</h3>
          <div className="space-y-4">
            <GrowthIndicator label="사용자 증가율" value={stats.growth.users} />
            <GrowthIndicator label="곡 증가율" value={stats.growth.songs} />
            <GrowthIndicator label="재생수 증가율" value={stats.growth.plays} />
          </div>
        </div>
      </div>
    </div>
  );
};

// 사용자 분석 탭
const UsersTab = ({ timeframe }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const mockUserData = {
      demographics: {
        ageGroups: [
          { name: '10-19', value: 15 },
          { name: '20-29', value: 35 },
          { name: '30-39', value: 28 },
          { name: '40-49', value: 15 },
          { name: '50+', value: 7 }
        ],
        locations: [
          { name: '한국', value: 65 },
          { name: '일본', value: 20 },
          { name: '미국', value: 8 },
          { name: '기타', value: 7 }
        ]
      },
      engagement: [
        { name: '월', plays: 4000, users: 2400 },
        { name: '화', plays: 3000, users: 1398 },
        { name: '수', plays: 2000, users: 9800 },
        { name: '목', plays: 2780, users: 3908 },
        { name: '금', plays: 1890, users: 4800 },
        { name: '토', plays: 2390, users: 3800 },
        { name: '일', plays: 3490, users: 4300 }
      ],
      retention: [
        { week: '1주', rate: 85 },
        { week: '2주', rate: 72 },
        { week: '3주', rate: 65 },
        { week: '4주', rate: 58 }
      ]
    };
    
    setUserData(mockUserData);
  }, [timeframe]);

  if (!userData) return <div>로딩 중...</div>;

  return (
    <div className="space-y-6">
      {/* 사용자 통계 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 연령대별 분포 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">연령대별 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userData.demographics.ageGroups}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 지역별 분포 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">지역별 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userData.demographics.locations}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#ec4899"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {userData.demographics.locations.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={['#8b5cf6', '#ec4899', '#06b6d4', '#10b981'][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 사용자 참여도 */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">일별 사용자 참여도</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={userData.engagement}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="plays" stroke="#8b5cf6" strokeWidth={2} />
            <Line type="monotone" dataKey="users" stroke="#ec4899" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 사용자 유지율 */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">사용자 유지율</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={userData.retention}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="rate" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 음악 성능 탭
const MusicTab = ({ timeframe }) => {
  const [musicData, setMusicData] = useState(null);

  useEffect(() => {
    const mockMusicData = {
      topSongs: [
        { title: '별이 빛나는 밤에', plays: 15420, likes: 1243, rating: 4.8 },
        { title: '그리운 사람아', plays: 12350, likes: 987, rating: 4.6 },
        { title: '사랑의 멜로디', plays: 11280, likes: 856, rating: 4.7 },
        { title: '추억 속의 너', plays: 9840, likes: 743, rating: 4.5 },
        { title: '마음의 노래', plays: 8760, likes: 692, rating: 4.4 }
      ],
      genrePerformance: [
        { genre: '발라드', plays: 45623, satisfaction: 4.5 },
        { genre: '엔카', plays: 32456, satisfaction: 4.3 },
        { genre: '팝', plays: 28934, satisfaction: 4.2 },
        { genre: '록', plays: 18765, satisfaction: 4.1 },
        { genre: '재즈', plays: 12345, satisfaction: 4.4 },
        { genre: '클래식', plays: 8765, satisfaction: 4.6 }
      ],
      playbackMetrics: {
        completion: 78.5,
        skip: 15.2,
        repeat: 23.8,
        download: 12.4
      }
    };
    
    setMusicData(mockMusicData);
  }, [timeframe]);

  if (!musicData) return <div>로딩 중...</div>;

  return (
    <div className="space-y-6">
      {/* 재생 메트릭 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="완주율"
          value={`${musicData.playbackMetrics.completion}%`}
          icon="✅"
          color="green"
        />
        <MetricCard
          title="스킵율"
          value={`${musicData.playbackMetrics.skip}%`}
          icon="⏭️"
          color="red"
        />
        <MetricCard
          title="반복율"
          value={`${musicData.playbackMetrics.repeat}%`}
          icon="🔄"
          color="blue"
        />
        <MetricCard
          title="다운로드율"
          value={`${musicData.playbackMetrics.download}%`}
          icon="📥"
          color="purple"
        />
      </div>

      {/* 인기 곡 순위 */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">인기 곡 TOP 5</h3>
        <div className="space-y-4">
          {musicData.topSongs.map((song, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-semibold">{song.title}</h4>
                  <p className="text-sm text-gray-400">
                    재생수: {song.plays.toLocaleString()} | 좋아요: {song.likes.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400">⭐</span>
                <span className="font-semibold">{song.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 장르별 성능 */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">장르별 성능</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={musicData.genrePerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="genre" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="plays" fill="#8b5cf6" name="재생수" />
            <Line yAxisId="right" dataKey="satisfaction" stroke="#ec4899" strokeWidth={2} name="만족도" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 트렌드 탭
const TrendsTab = ({ timeframe, selectedMetric, onMetricChange }) => {
  const [trendData, setTrendData] = useState(null);

  const metrics = ['재생수', '좋아요', '공유', '다운로드', '사용자 증가'];

  useEffect(() => {
    const mockTrendData = {
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        value: Math.floor(Math.random() * 1000) + 500 + i * 10
      })),
      growth: 15.3,
      peak: 1450,
      trough: 520
    };
    
    setTrendData(mockTrendData);
  }, [timeframe, selectedMetric]);

  if (!trendData) return <div>로딩 중...</div>;

  return (
    <div className="space-y-6">
      {/* 메트릭 선택 */}
      <div className="flex space-x-2">
        {metrics.map(metric => (
          <button
            key={metric}
            onClick={() => onMetricChange(metric)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedMetric === metric
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {metric}
          </button>
        ))}
      </div>

      {/* 트렌드 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="성장률"
          value={`${trendData.growth}%`}
          change={timeframe}
          icon="📈"
          color="green"
        />
        <MetricCard
          title="최고점"
          value={trendData.peak.toLocaleString()}
          icon="🎯"
          color="blue"
        />
        <MetricCard
          title="최저점"
          value={trendData.trough.toLocaleString()}
          icon="📊"
          color="gray"
        />
      </div>

      {/* 트렌드 차트 */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">{selectedMetric} 트렌드</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={trendData.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#8b5cf6" 
              fill="#8b5cf6" 
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 추천 탭
const RecommendationsTab = () => {
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    const mockRecommendations = {
      forUser: [
        { title: '당신을 위한 발라드', reason: '선호 장르 기반', score: 95 },
        { title: '감성 엔카 모음', reason: '최근 재생 패턴', score: 88 },
        { title: '힐링 재즈', reason: '시간대 분석', score: 82 },
        { title: '추억의 팝송', reason: '연령대 매칭', score: 79 },
        { title: '클래식 명곡', reason: '고평점 곡', score: 75 }
      ],
      trending: [
        { title: '이번 주 핫한 곡', plays: 25000, growth: 45 },
        { title: '신인 아티스트 특집', plays: 18000, growth: 78 },
        { title: '계절 테마 음악', plays: 15000, growth: 23 },
        { title: '커버 송 베스트', plays: 12000, growth: 35 }
      ],
      algorithms: {
        accuracy: 87.5,
        satisfaction: 4.2,
        clickThrough: 23.8,
        completion: 65.2
      }
    };
    
    setRecommendations(mockRecommendations);
  }, []);

  if (!recommendations) return <div>로딩 중...</div>;

  return (
    <div className="space-y-6">
      {/* 추천 알고리즘 성능 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="정확도"
          value={`${recommendations.algorithms.accuracy}%`}
          icon="🎯"
          color="green"
        />
        <MetricCard
          title="만족도"
          value={recommendations.algorithms.satisfaction}
          icon="😊"
          color="blue"
        />
        <MetricCard
          title="클릭률"
          value={`${recommendations.algorithms.clickThrough}%`}
          icon="👆"
          color="purple"
        />
        <MetricCard
          title="완주율"
          value={`${recommendations.algorithms.completion}%`}
          icon="✅"
          color="pink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 개인화 추천 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">개인화 추천 예시</h3>
          <div className="space-y-4">
            {recommendations.forUser.map((rec, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-semibold">{rec.title}</h4>
                  <p className="text-sm text-gray-400">{rec.reason}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">{rec.score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 트렌딩 추천 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">트렌딩 추천</h3>
          <div className="space-y-4">
            {recommendations.trending.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-semibold">{trend.title}</h4>
                  <p className="text-sm text-gray-400">
                    재생수: {trend.plays.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">📈</span>
                  <span className="text-green-400 font-semibold">+{trend.growth}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 메트릭 카드 컴포넌트
const MetricCard = ({ title, value, change, icon, color = 'gray' }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
    red: 'from-red-500 to-red-600',
    gray: 'from-gray-500 to-gray-600'
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        {change && (
          <span className="text-sm text-gray-400">{change}</span>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        <p className="text-gray-400 text-sm">{title}</p>
      </div>
    </div>
  );
};

// 성장 지표 컴포넌트
const GrowthIndicator = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-300">{label}</span>
    <div className="flex items-center space-x-2">
      <div className="w-32 bg-gray-700 rounded-full h-2">
        <div 
          className="bg-green-500 h-2 rounded-full" 
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-green-400 font-semibold">+{value}%</span>
    </div>
  </div>
);

export default AnalyticsDashboard;
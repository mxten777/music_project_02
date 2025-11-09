// 분석 및 통계 엔진
class AnalyticsEngine {
  constructor() {
    this.userActivity = new Map();
    this.musicMetrics = new Map();
    this.trends = [];
    this.recommendations = new Map();
    this.systemStats = {
      totalUsers: 0,
      totalSongs: 0,
      totalPlays: 0,
      averageRating: 0,
      popularGenres: {},
      activeUsers: 0
    };
    
    this.initializeData();
  }

  // 초기 데이터 설정
  initializeData() {
    // 모의 사용자 활동 데이터
    const mockUserData = this.generateMockUserData();
    const mockMusicData = this.generateMockMusicData();
    
    mockUserData.forEach(user => {
      this.userActivity.set(user.id, user);
    });
    
    mockMusicData.forEach(song => {
      this.musicMetrics.set(song.id, song);
    });
    
    this.generateTrends();
    this.updateSystemStats();
  }

  // 모의 사용자 데이터 생성
  generateMockUserData() {
    const users = [];
    const genres = ['발라드', '엔카', '팝', '록', '재즈', '클래식'];
    const countries = ['한국', '일본', '미국', '독일', '프랑스', '영국'];
    
    for (let i = 1; i <= 50; i++) {
      const user = {
        id: `user_${i}`,
        name: `사용자${i}`,
        joinDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
        totalSongs: Math.floor(Math.random() * 20) + 1,
        totalPlays: Math.floor(Math.random() * 500) + 10,
        averageSessionTime: Math.floor(Math.random() * 60) + 5, // 분
        favoriteGenres: this.getRandomItems(genres, Math.floor(Math.random() * 3) + 1),
        location: countries[Math.floor(Math.random() * countries.length)],
        subscriptionType: Math.random() > 0.7 ? 'premium' : 'free',
        lastActive: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
        createdSongs: Math.floor(Math.random() * 15) + 1,
        sharedSongs: Math.floor(Math.random() * 5),
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 - 5.0
        engagementScore: Math.floor(Math.random() * 100) + 1
      };
      users.push(user);
    }
    
    return users;
  }

  // 모의 음악 데이터 생성
  generateMockMusicData() {
    const songs = [];
    const genres = ['발라드', '엔카', '팝', '록', '재즈', '클래식'];
    const moods = ['행복', '슬픔', '로맨틱', '에너지틱', '평온', '감성적'];
    
    for (let i = 1; i <= 100; i++) {
      const song = {
        id: `song_${i}`,
        title: `노래 ${i}`,
        genre: genres[Math.floor(Math.random() * genres.length)],
        mood: moods[Math.floor(Math.random() * moods.length)],
        duration: Math.floor(Math.random() * 180) + 120, // 2-5분
        plays: Math.floor(Math.random() * 1000) + 50,
        likes: Math.floor(Math.random() * 200) + 10,
        shares: Math.floor(Math.random() * 50) + 1,
        downloads: Math.floor(Math.random() * 100) + 5,
        rating: (Math.random() * 2 + 3).toFixed(1),
        createdDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
        artistId: `user_${Math.floor(Math.random() * 50) + 1}`,
        completionRate: (Math.random() * 0.4 + 0.6).toFixed(2), // 60-100%
        skipRate: (Math.random() * 0.3).toFixed(2), // 0-30%
        repeatRate: (Math.random() * 0.5).toFixed(2), // 0-50%
        comments: Math.floor(Math.random() * 30) + 1
      };
      songs.push(song);
    }
    
    return songs;
  }

  // 트렌드 데이터 생성
  generateTrends() {
    const timeframes = ['1주', '1개월', '3개월', '6개월', '1년'];
    const metrics = ['재생수', '좋아요', '공유', '다운로드', '사용자 증가'];
    
    timeframes.forEach(timeframe => {
      metrics.forEach(metric => {
        const trendData = {
          timeframe,
          metric,
          data: this.generateTrendData(),
          growth: (Math.random() * 40 - 10).toFixed(1) // -10% ~ +30%
        };
        this.trends.push(trendData);
      });
    });
  }

  // 트렌드 데이터 포인트 생성
  generateTrendData() {
    const points = [];
    let baseValue = Math.floor(Math.random() * 1000) + 100;
    
    for (let i = 0; i < 30; i++) {
      const variation = (Math.random() - 0.5) * 0.2; // ±10% 변화
      baseValue = Math.max(0, baseValue * (1 + variation));
      points.push({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
        value: Math.floor(baseValue)
      });
    }
    
    return points;
  }

  // 시스템 통계 업데이트
  updateSystemStats() {
    const users = Array.from(this.userActivity.values());
    const songs = Array.from(this.musicMetrics.values());
    
    this.systemStats.totalUsers = users.length;
    this.systemStats.totalSongs = songs.length;
    this.systemStats.totalPlays = songs.reduce((sum, song) => sum + song.plays, 0);
    this.systemStats.averageRating = (
      songs.reduce((sum, song) => sum + parseFloat(song.rating), 0) / songs.length
    ).toFixed(1);
    
    // 인기 장르 계산
    const genreCounts = {};
    songs.forEach(song => {
      genreCounts[song.genre] = (genreCounts[song.genre] || 0) + song.plays;
    });
    this.systemStats.popularGenres = genreCounts;
    
    // 활성 사용자 (지난 7일 내 활동)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.systemStats.activeUsers = users.filter(user => 
      user.lastActive > weekAgo
    ).length;
  }

  // 사용자 활동 분석
  getUserActivityAnalysis(userId = null) {
    if (userId) {
      return this.userActivity.get(userId);
    }
    
    const users = Array.from(this.userActivity.values());
    
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return u.lastActive > weekAgo;
      }).length,
      averageSessionTime: (
        users.reduce((sum, u) => sum + u.averageSessionTime, 0) / users.length
      ).toFixed(1),
      premiumUsers: users.filter(u => u.subscriptionType === 'premium').length,
      topUsers: users
        .sort((a, b) => b.engagementScore - a.engagementScore)
        .slice(0, 10),
      userGrowth: this.calculateUserGrowth(users),
      engagementDistribution: this.calculateEngagementDistribution(users)
    };
  }

  // 음악 성능 메트릭
  getMusicPerformanceMetrics(songId = null) {
    if (songId) {
      return this.musicMetrics.get(songId);
    }
    
    const songs = Array.from(this.musicMetrics.values());
    
    return {
      totalSongs: songs.length,
      totalPlays: songs.reduce((sum, s) => sum + s.plays, 0),
      averageRating: (
        songs.reduce((sum, s) => sum + parseFloat(s.rating), 0) / songs.length
      ).toFixed(1),
      topSongs: songs
        .sort((a, b) => b.plays - a.plays)
        .slice(0, 10),
      genreDistribution: this.calculateGenreDistribution(songs),
      moodDistribution: this.calculateMoodDistribution(songs),
      performanceMetrics: {
        averageCompletion: (
          songs.reduce((sum, s) => sum + parseFloat(s.completionRate), 0) / songs.length
        ).toFixed(2),
        averageSkipRate: (
          songs.reduce((sum, s) => sum + parseFloat(s.skipRate), 0) / songs.length
        ).toFixed(2),
        averageRepeatRate: (
          songs.reduce((sum, s) => sum + parseFloat(s.repeatRate), 0) / songs.length
        ).toFixed(2)
      }
    };
  }

  // 트렌드 분석
  getTrendAnalysis(timeframe = '1개월', metric = '재생수') {
    const trendData = this.trends.find(t => 
      t.timeframe === timeframe && t.metric === metric
    );
    
    if (!trendData) return null;
    
    return {
      ...trendData,
      summary: {
        currentValue: trendData.data[trendData.data.length - 1].value,
        previousValue: trendData.data[0].value,
        change: trendData.growth,
        peak: Math.max(...trendData.data.map(d => d.value)),
        trough: Math.min(...trendData.data.map(d => d.value))
      }
    };
  }

  // 개인화된 추천 생성
  generatePersonalizedRecommendations(userId) {
    const user = this.userActivity.get(userId);
    if (!user) return [];
    
    const songs = Array.from(this.musicMetrics.values());
    const userGenres = user.favoriteGenres;
    
    // 장르 기반 필터링
    let recommendedSongs = songs.filter(song => 
      userGenres.includes(song.genre)
    );
    
    // 사용자 선호도에 따른 점수 계산
    recommendedSongs = recommendedSongs.map(song => ({
      ...song,
      recommendationScore: this.calculateRecommendationScore(song, user)
    }));
    
    // 점수순 정렬 및 상위 10개 선택
    recommendedSongs.sort((a, b) => b.recommendationScore - a.recommendationScore);
    
    return recommendedSongs.slice(0, 10).map(song => ({
      id: song.id,
      title: song.title,
      genre: song.genre,
      mood: song.mood,
      rating: song.rating,
      plays: song.plays,
      recommendationScore: song.recommendationScore.toFixed(2),
      reason: this.getRecommendationReason(song, user)
    }));
  }

  // 추천 점수 계산
  calculateRecommendationScore(song, user) {
    let score = 0;
    
    // 장르 선호도 (40%)
    if (user.favoriteGenres.includes(song.genre)) {
      score += 40;
    }
    
    // 인기도 (30%)
    score += (song.plays / 1000) * 30;
    
    // 평점 (20%)
    score += (parseFloat(song.rating) / 5) * 20;
    
    // 최신성 (10%)
    const daysSinceCreated = (Date.now() - song.createdDate.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, (30 - daysSinceCreated) / 30) * 10;
    
    return score;
  }

  // 추천 이유 생성
  getRecommendationReason(song, user) {
    const reasons = [];
    
    if (user.favoriteGenres.includes(song.genre)) {
      reasons.push(`선호하는 ${song.genre} 장르`);
    }
    
    if (song.plays > 500) {
      reasons.push('인기 곡');
    }
    
    if (parseFloat(song.rating) >= 4.5) {
      reasons.push('높은 평점');
    }
    
    const daysSinceCreated = (Date.now() - song.createdDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated <= 7) {
      reasons.push('신곡');
    }
    
    return reasons.join(', ') || '추천 곡';
  }

  // 유용한 헬퍼 메서드들
  getRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  calculateUserGrowth(users) {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const newUsers = users.filter(u => u.joinDate > monthAgo).length;
    const oldUsers = users.filter(u => u.joinDate <= monthAgo).length;
    
    if (oldUsers === 0) return 100;
    return ((newUsers / oldUsers) * 100).toFixed(1);
  }

  calculateEngagementDistribution(users) {
    const distribution = {
      high: users.filter(u => u.engagementScore >= 80).length,
      medium: users.filter(u => u.engagementScore >= 50 && u.engagementScore < 80).length,
      low: users.filter(u => u.engagementScore < 50).length
    };
    
    return distribution;
  }

  calculateGenreDistribution(songs) {
    const distribution = {};
    songs.forEach(song => {
      distribution[song.genre] = (distribution[song.genre] || 0) + 1;
    });
    return distribution;
  }

  calculateMoodDistribution(songs) {
    const distribution = {};
    songs.forEach(song => {
      distribution[song.mood] = (distribution[song.mood] || 0) + 1;
    });
    return distribution;
  }

  // 실시간 통계 업데이트
  updateRealTimeStats() {
    this.updateSystemStats();
    return this.systemStats;
  }

  // 커스텀 리포트 생성
  generateCustomReport(options = {}) {
    const {
      timeframe = '1개월',
      metrics = ['사용자', '재생수', '평점'],
      groupBy = 'genre'
    } = options;

    const songs = Array.from(this.musicMetrics.values());
    const users = Array.from(this.userActivity.values());

    const report = {
      title: `${timeframe} 커스텀 리포트`,
      generatedAt: new Date(),
      timeframe,
      metrics,
      groupBy,
      data: {},
      summary: {}
    };

    // 그룹별 데이터 집계
    if (groupBy === 'genre') {
      const genres = [...new Set(songs.map(s => s.genre))];
      genres.forEach(genre => {
        const genreSongs = songs.filter(s => s.genre === genre);
        report.data[genre] = {
          songCount: genreSongs.length,
          totalPlays: genreSongs.reduce((sum, s) => sum + s.plays, 0),
          averageRating: (genreSongs.reduce((sum, s) => sum + parseFloat(s.rating), 0) / genreSongs.length).toFixed(1),
          totalLikes: genreSongs.reduce((sum, s) => sum + s.likes, 0)
        };
      });
    }

    // 요약 통계
    report.summary = {
      totalUsers: users.length,
      totalSongs: songs.length,
      totalPlays: songs.reduce((sum, s) => sum + s.plays, 0),
      averageRating: (songs.reduce((sum, s) => sum + parseFloat(s.rating), 0) / songs.length).toFixed(1)
    };

    return report;
  }
}

// 전역 분석 엔진 인스턴스
const analyticsEngine = new AnalyticsEngine();

export default analyticsEngine;
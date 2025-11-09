// 앨범/곡 관리를 위한 액션 타입 정의
export const ALBUM_ACTIONS = {
  // 앨범 관련
  CREATE_ALBUM: 'CREATE_ALBUM',
  UPDATE_ALBUM: 'UPDATE_ALBUM',
  DELETE_ALBUM: 'DELETE_ALBUM',
  SELECT_ALBUM: 'SELECT_ALBUM',
  
  // 곡 관련
  CREATE_SONG: 'CREATE_SONG',
  UPDATE_SONG: 'UPDATE_SONG',
  DELETE_SONG: 'DELETE_SONG',
  SELECT_SONG: 'SELECT_SONG',
  MOVE_SONG: 'MOVE_SONG',
  DUPLICATE_SONG: 'DUPLICATE_SONG',
  
  // 필터 및 정렬
  SET_FILTER: 'SET_FILTER',
  SET_SORT: 'SET_SORT',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  
  // 데이터 로드
  LOAD_DATA: 'LOAD_DATA',
  SAVE_DATA: 'SAVE_DATA'
};

// 앨범/곡 상태 타입 정의
export const SONG_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

export const MUSIC_GENRES = {
  BALLAD: 'ballad',
  ENKA: 'enka',
  POP: 'pop',
  FOLK: 'folk',
  ROCK: 'rock',
  JAZZ: 'jazz'
};

// 앨범 장르 리스트 (UI에서 사용)
export const ALBUM_GENRES = [
  '발라드',
  '엔카',
  'K-POP',
  '포크',
  '록',
  '재즈',
  '클래식',
  '트로트',
  'R&B',
  '인디'
];

export const MUSIC_MOODS = {
  HAPPY: 'happy',
  SAD: 'sad',
  ROMANTIC: 'romantic',
  NOSTALGIC: 'nostalgic',
  ENERGETIC: 'energetic',
  PEACEFUL: 'peaceful',
  MELANCHOLY: 'melancholy'
};

export const SORT_OPTIONS = {
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt', 
  TITLE: 'title',
  DURATION: 'duration',
  PLAY_COUNT: 'playCount',
  LIKES: 'likes'
};

// 유틸리티 함수들
export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const generateUniqueId = (prefix = 'item') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getMoodColor = (mood) => {
  const moodColors = {
    happy: 'text-yellow-600 bg-yellow-100',
    sad: 'text-blue-600 bg-blue-100',
    romantic: 'text-pink-600 bg-pink-100',
    nostalgic: 'text-purple-600 bg-purple-100',
    energetic: 'text-orange-600 bg-orange-100',
    peaceful: 'text-green-600 bg-green-100',
    melancholy: 'text-indigo-600 bg-indigo-100'
  };
  return moodColors[mood] || 'text-gray-600 bg-gray-100';
};

export const getGenreIcon = (genre) => {
  const genreIcons = {
    ballad: 'fa-heart',
    enka: 'fa-mountain',
    pop: 'fa-star',
    folk: 'fa-guitar',
    rock: 'fa-bolt',
    jazz: 'fa-music'
  };
  return genreIcons[genre] || 'fa-music';
};

export const getStatusColor = (status) => {
  const statusColors = {
    draft: 'text-yellow-600 bg-yellow-100',
    published: 'text-green-600 bg-green-100',
    archived: 'text-gray-600 bg-gray-100'
  };
  return statusColors[status] || 'text-gray-600 bg-gray-100';
};

export const getStatusText = (status) => {
  const statusTexts = {
    draft: '초안',
    published: '발행됨',
    archived: '보관됨'
  };
  return statusTexts[status] || '알 수 없음';
};
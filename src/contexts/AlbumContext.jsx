import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ALBUM_ACTIONS } from '../utils/albumTypes';

// Context 생성
const AlbumContext = createContext();

// 앨범/곡 관리를 위한 초기 상태
const initialState = {
  albums: [
    {
      id: 'default-album',
      title: '나의 첫 번째 앨범',
      description: '시작하는 마음으로 만든 특별한 앨범',
      coverImage: null,
      createdAt: '2025-11-09',
      updatedAt: '2025-11-09',
      isPublic: false,
      tags: ['감성', '발라드'],
      songs: []
    }
  ],
  songs: [
    {
      id: 'sample-1',
      title: '봄날의 기억',
      lyrics: '봄바람이 불어오면\n그때 생각이 나요\n함께 걷던 벚꽃길\n아직도 기억해요',
      style: 'ballad',
      albumId: 'default-album',
      createdAt: '2025-11-09',
      updatedAt: '2025-11-09',
      duration: 204, // seconds
      genre: 'ballad',
      mood: 'nostalgic',
      key: 'C',
      tempo: 70,
      analysis: {
        emotions: { nostalgic: 80, love: 20 },
        complexity: 'medium',
        wordCount: 24
      },
      status: 'published', // draft, published, archived
      playCount: 0,
      likes: 0,
      isPublic: true
    },
    {
      id: 'sample-2', 
      title: '그리운 사람',
      lyrics: '멀리 떠나간 그대가\n보고 싶어 잠 못 드는 밤\n별빛 아래 혼자서\n그리움에 젖어요',
      style: 'enka',
      albumId: 'default-album',
      createdAt: '2025-11-08',
      updatedAt: '2025-11-08',
      duration: 198,
      genre: 'enka',
      mood: 'sad',
      key: 'Am',
      tempo: 65,
      analysis: {
        emotions: { sad: 70, nostalgic: 30 },
        complexity: 'medium',
        wordCount: 28
      },
      status: 'published',
      playCount: 5,
      likes: 2,
      isPublic: false
    }
  ],
  currentAlbum: null,
  currentSong: null,
  filters: {
    genre: 'all',
    mood: 'all',
    status: 'all'
  },
  sortBy: 'updatedAt',
  sortOrder: 'desc'
};

// 액션 타입은 albumTypes.js에서 import

// 리듀서 함수
function albumReducer(state, action) {
  switch (action.type) {
    case ALBUM_ACTIONS.CREATE_ALBUM: {
      const newAlbum = {
        id: `album-${Date.now()}`,
        title: action.payload.title || '새 앨범',
        description: action.payload.description || '',
        coverImage: action.payload.coverImage || null,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        isPublic: action.payload.isPublic || false,
        tags: action.payload.tags || [],
        songs: []
      };
      
      return {
        ...state,
        albums: [...state.albums, newAlbum],
        currentAlbum: newAlbum
      };
    }

    case ALBUM_ACTIONS.UPDATE_ALBUM: {
      const updatedAlbums = state.albums.map(album =>
        album.id === action.payload.id
          ? { ...album, ...action.payload.updates, updatedAt: new Date().toISOString().split('T')[0] }
          : album
      );
      
      return {
        ...state,
        albums: updatedAlbums,
        currentAlbum: state.currentAlbum?.id === action.payload.id 
          ? { ...state.currentAlbum, ...action.payload.updates }
          : state.currentAlbum
      };
    }

    case ALBUM_ACTIONS.DELETE_ALBUM: {
      // 앨범 삭제 시 해당 앨범의 모든 곡도 삭제
      const filteredAlbums = state.albums.filter(album => album.id !== action.payload.id);
      const filteredSongs = state.songs.filter(song => song.albumId !== action.payload.id);
      
      return {
        ...state,
        albums: filteredAlbums,
        songs: filteredSongs,
        currentAlbum: state.currentAlbum?.id === action.payload.id ? null : state.currentAlbum
      };
    }

    case ALBUM_ACTIONS.SELECT_ALBUM: {
      const selectedAlbum = state.albums.find(album => album.id === action.payload.id);
      return {
        ...state,
        currentAlbum: selectedAlbum || null
      };
    }

    case ALBUM_ACTIONS.CREATE_SONG: {
      const newSong = {
        id: `song-${Date.now()}`,
        title: action.payload.title || '새로운 곡',
        lyrics: action.payload.lyrics || '',
        style: action.payload.style || 'ballad',
        albumId: action.payload.albumId || state.currentAlbum?.id || state.albums[0]?.id,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        duration: action.payload.duration || 180,
        genre: action.payload.style || 'ballad',
        mood: action.payload.mood || 'neutral',
        key: action.payload.key || 'C',
        tempo: action.payload.tempo || 120,
        analysis: action.payload.analysis || {},
        status: 'draft',
        playCount: 0,
        likes: 0,
        isPublic: false
      };
      
      return {
        ...state,
        songs: [...state.songs, newSong],
        currentSong: newSong
      };
    }

    case ALBUM_ACTIONS.UPDATE_SONG: {
      const updatedSongs = state.songs.map(song =>
        song.id === action.payload.id
          ? { ...song, ...action.payload.updates, updatedAt: new Date().toISOString().split('T')[0] }
          : song
      );
      
      return {
        ...state,
        songs: updatedSongs,
        currentSong: state.currentSong?.id === action.payload.id 
          ? { ...state.currentSong, ...action.payload.updates }
          : state.currentSong
      };
    }

    case ALBUM_ACTIONS.DELETE_SONG: {
      const filteredSongs = state.songs.filter(song => song.id !== action.payload.id);
      
      return {
        ...state,
        songs: filteredSongs,
        currentSong: state.currentSong?.id === action.payload.id ? null : state.currentSong
      };
    }

    case ALBUM_ACTIONS.SELECT_SONG: {
      const selectedSong = state.songs.find(song => song.id === action.payload.id);
      return {
        ...state,
        currentSong: selectedSong || null
      };
    }

    case ALBUM_ACTIONS.MOVE_SONG: {
      const updatedSongs = state.songs.map(song =>
        song.id === action.payload.songId
          ? { ...song, albumId: action.payload.targetAlbumId, updatedAt: new Date().toISOString().split('T')[0] }
          : song
      );
      
      return {
        ...state,
        songs: updatedSongs
      };
    }

    case ALBUM_ACTIONS.DUPLICATE_SONG: {
      const originalSong = state.songs.find(song => song.id === action.payload.id);
      if (!originalSong) return state;
      
      const duplicatedSong = {
        ...originalSong,
        id: `song-${Date.now()}`,
        title: `${originalSong.title} (복사본)`,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        status: 'draft',
        playCount: 0,
        likes: 0
      };
      
      return {
        ...state,
        songs: [...state.songs, duplicatedSong]
      };
    }

    case ALBUM_ACTIONS.SET_FILTER: {
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.value
        }
      };
    }

    case ALBUM_ACTIONS.SET_SORT: {
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder
      };
    }

    case ALBUM_ACTIONS.CLEAR_FILTERS: {
      return {
        ...state,
        filters: {
          genre: 'all',
          mood: 'all',
          status: 'all'
        }
      };
    }

    case ALBUM_ACTIONS.LOAD_DATA: {
      return {
        ...state,
        ...action.payload
      };
    }

    default:
      return state;
  }
}

// Context는 AlbumContextDef.js에서 import

// Provider 컴포넌트
export function AlbumProvider({ children }) {
  const [state, dispatch] = useReducer(albumReducer, initialState);

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const savedData = localStorage.getItem('musicAlbumData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: ALBUM_ACTIONS.LOAD_DATA, payload: parsedData });
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  // 상태 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    const dataToSave = {
      albums: state.albums,
      songs: state.songs
    };
    localStorage.setItem('musicAlbumData', JSON.stringify(dataToSave));
  }, [state.albums, state.songs]);

  // 유틸리티 함수들
  const utils = {
    // 앨범의 곡 목록 가져오기
    getAlbumSongs: (albumId) => {
      return state.songs.filter(song => song.albumId === albumId);
    },

    // 필터링된 곡 목록 가져오기
    getFilteredSongs: () => {
      let filteredSongs = [...state.songs];

      if (state.filters.genre !== 'all') {
        filteredSongs = filteredSongs.filter(song => song.genre === state.filters.genre);
      }

      if (state.filters.mood !== 'all') {
        filteredSongs = filteredSongs.filter(song => song.mood === state.filters.mood);
      }

      if (state.filters.status !== 'all') {
        filteredSongs = filteredSongs.filter(song => song.status === state.filters.status);
      }

      // 정렬
      filteredSongs.sort((a, b) => {
        const aVal = a[state.sortBy];
        const bVal = b[state.sortBy];
        
        if (state.sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });

      return filteredSongs;
    },

    // 앨범 통계 계산
    getAlbumStats: (albumId) => {
      const albumSongs = utils.getAlbumSongs(albumId);
      const totalDuration = albumSongs.reduce((sum, song) => sum + (song.duration || 0), 0);
      const totalPlays = albumSongs.reduce((sum, song) => sum + (song.playCount || 0), 0);
      const totalLikes = albumSongs.reduce((sum, song) => sum + (song.likes || 0), 0);
      
      return {
        songCount: albumSongs.length,
        totalDuration,
        totalPlays,
        totalLikes,
        publishedSongs: albumSongs.filter(song => song.status === 'published').length,
        draftSongs: albumSongs.filter(song => song.status === 'draft').length
      };
    },

    // 검색 기능
    searchSongs: (query) => {
      const lowercaseQuery = query.toLowerCase();
      return state.songs.filter(song => 
        song.title.toLowerCase().includes(lowercaseQuery) ||
        song.lyrics.toLowerCase().includes(lowercaseQuery)
      );
    },

    // 최근 곡 가져오기
    getRecentSongs: (limit = 5) => {
      return [...state.songs]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, limit);
    },

    // 인기 곡 가져오기
    getPopularSongs: (limit = 5) => {
      return [...state.songs]
        .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
        .slice(0, limit);
    }
  };

  const value = {
    ...state,
    dispatch,
    utils
  };

  return (
    <AlbumContext.Provider value={value}>
      {children}
    </AlbumContext.Provider>
  );
}

// useAlbum 훅
export const useAlbum = () => {
  const context = useContext(AlbumContext);
  if (context === undefined) {
    throw new Error('useAlbum must be used within an AlbumProvider');
  }
  return context;
};
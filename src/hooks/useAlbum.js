import { useContext } from 'react';
import { AlbumContext } from '../contexts/AlbumContextDef';
import { ALBUM_ACTIONS } from '../utils/albumTypes';

// Hook
export function useAlbum() {
  const context = useContext(AlbumContext);
  if (!context) {
    throw new Error('useAlbum must be used within an AlbumProvider');
  }

  const { albums, songs, currentAlbum, currentSong, dispatch, utils } = context;

  // 앨범 관리 함수들
  const createAlbum = (albumData) => {
    dispatch({ type: ALBUM_ACTIONS.CREATE_ALBUM, payload: albumData });
  };

  const updateAlbum = (id, updates) => {
    dispatch({ type: ALBUM_ACTIONS.UPDATE_ALBUM, payload: { id, updates } });
  };

  const deleteAlbum = (id) => {
    dispatch({ type: ALBUM_ACTIONS.DELETE_ALBUM, payload: { id } });
  };

  const selectAlbum = (id) => {
    dispatch({ type: ALBUM_ACTIONS.SELECT_ALBUM, payload: { id } });
  };

  // 곡 관리 함수들
  const addSong = (songData) => {
    dispatch({ type: ALBUM_ACTIONS.CREATE_SONG, payload: songData });
  };

  const updateSong = (id, updates) => {
    dispatch({ type: ALBUM_ACTIONS.UPDATE_SONG, payload: { id, updates } });
  };

  const deleteSong = (id) => {
    dispatch({ type: ALBUM_ACTIONS.DELETE_SONG, payload: { id } });
  };

  const selectSong = (id) => {
    dispatch({ type: ALBUM_ACTIONS.SELECT_SONG, payload: { id } });
  };

  const moveSong = (songId, targetAlbumId) => {
    dispatch({ type: ALBUM_ACTIONS.MOVE_SONG, payload: { songId, targetAlbumId } });
  };

  const duplicateSong = (id) => {
    dispatch({ type: ALBUM_ACTIONS.DUPLICATE_SONG, payload: { id } });
  };

  // 필터 및 정렬 함수들
  const setFilter = (key, value) => {
    dispatch({ type: ALBUM_ACTIONS.SET_FILTER, payload: { key, value } });
  };

  const setSort = (sortBy, sortOrder) => {
    dispatch({ type: ALBUM_ACTIONS.SET_SORT, payload: { sortBy, sortOrder } });
  };

  const clearFilters = () => {
    dispatch({ type: ALBUM_ACTIONS.CLEAR_FILTERS });
  };

  // 현재 앨범의 곡들을 가져오는 헬퍼
  const currentAlbumSongs = currentAlbum ? utils.getAlbumSongs(currentAlbum.id) : [];

  // 앨범에 곡 추가를 위해 업데이트된 앨범 데이터
  const albumsWithSongs = albums.map(album => ({
    ...album,
    songs: utils.getAlbumSongs(album.id)
  }));

  const currentAlbumWithSongs = currentAlbum ? {
    ...currentAlbum,
    songs: currentAlbumSongs
  } : null;

  return {
    // 상태
    albums: albumsWithSongs,
    songs,
    currentAlbum: currentAlbumWithSongs,
    currentSong,
    
    // 앨범 관리
    createAlbum,
    updateAlbum,
    deleteAlbum,
    selectAlbum,
    
    // 곡 관리
    addSong,
    updateSong,
    deleteSong,
    selectSong,
    moveSong,
    duplicateSong,
    
    // 필터 및 정렬
    setFilter,
    setSort,
    clearFilters,
    
    // 유틸리티
    utils
  };
}
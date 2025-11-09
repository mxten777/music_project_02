import { useState } from 'react'
import { useAlbum } from '../hooks/useAlbum'

export default function SongManager() {
  const { 
    currentAlbum, 
    addSong, 
    updateSong, 
    deleteSong 
  } = useAlbum()

  const [isCreating, setIsCreating] = useState(false)
  const [editingSong, setEditingSong] = useState(null)
  const [newSong, setNewSong] = useState({
    title: '',
    lyrics: '',
    duration: '',
    track: 1,
    audioFile: ''
  })

  if (!currentAlbum) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="w-24 h-24 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-music text-3xl text-primary-400"></i>
        </div>
        <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-2">
          앨범을 먼저 선택해주세요
        </h3>
        <p className="text-primary-600 dark:text-primary-400">
          곡을 추가하려면 앨범을 선택하거나 새로 만들어야 합니다.
        </p>
      </div>
    )
  }

  const handleCreateSong = () => {
    if (newSong.title && newSong.lyrics) {
      const nextTrack = Math.max(...currentAlbum.songs.map(s => s.track), 0) + 1
      addSong({
        ...newSong,
        track: nextTrack
      })
      setNewSong({
        title: '',
        lyrics: '',
        duration: '',
        track: 1,
        audioFile: ''
      })
      setIsCreating(false)
    }
  }

  const handleEditSong = (song) => {
    setEditingSong({ ...song })
  }

  const handleUpdateSong = () => {
    updateSong(editingSong.id, editingSong)
    setEditingSong(null)
  }

  const handleDeleteSong = (songId) => {
    if (window.confirm('정말로 이 곡을 삭제하시겠습니까?')) {
      deleteSong(songId)
    }
  }

  const formatDuration = (duration) => {
    if (!duration) return '00:00'
    const [minutes, seconds] = duration.split(':').map(Number)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const SongCard = ({ song }) => (
    <div className="glass-card p-6 rounded-xl hover:scale-[1.01] transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-primary-500 rounded-lg flex items-center justify-center text-white font-bold">
            {song.track}
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary-900 dark:text-white">{song.title}</h3>
            <p className="text-primary-600 dark:text-primary-300 text-sm">
              {formatDuration(song.duration)}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditSong(song)}
            className="btn-primary text-sm"
          >
            <i className="fas fa-edit mr-1"></i>편집
          </button>
          <button
            onClick={() => handleDeleteSong(song.id)}
            className="btn-danger text-sm"
          >
            <i className="fas fa-trash mr-1"></i>삭제
          </button>
        </div>
      </div>
      
      <div className="text-sm text-primary-600 dark:text-primary-400 mb-4 line-clamp-3">
        {song.lyrics}
      </div>
      
      {song.audioFile && (
        <div className="flex items-center text-sm text-accent-600 dark:text-accent-400">
          <i className="fas fa-file-audio mr-2"></i>
          오디오 파일 연결됨
        </div>
      )}
    </div>
  )

  const SongForm = ({ song, onSave, onCancel, isEditing = false }) => (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-4">
        {isEditing ? '곡 편집' : '새 곡 추가'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
            곡 제목 *
          </label>
          <input
            type="text"
            value={song.title}
            onChange={(e) => isEditing 
              ? setEditingSong({ ...editingSong, title: e.target.value })
              : setNewSong({ ...newSong, title: e.target.value })
            }
            className="input-field"
            placeholder="곡 제목을 입력하세요"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
            재생 시간 (mm:ss)
          </label>
          <input
            type="text"
            value={song.duration}
            onChange={(e) => isEditing 
              ? setEditingSong({ ...editingSong, duration: e.target.value })
              : setNewSong({ ...newSong, duration: e.target.value })
            }
            className="input-field"
            placeholder="03:30"
            pattern="[0-9]{1,2}:[0-9]{2}"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
            트랙 번호
          </label>
          <input
            type="number"
            min="1"
            value={song.track}
            onChange={(e) => isEditing 
              ? setEditingSong({ ...editingSong, track: parseInt(e.target.value) })
              : setNewSong({ ...newSong, track: parseInt(e.target.value) })
            }
            className="input-field"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
            오디오 파일 URL
          </label>
          <input
            type="url"
            value={song.audioFile}
            onChange={(e) => isEditing 
              ? setEditingSong({ ...editingSong, audioFile: e.target.value })
              : setNewSong({ ...newSong, audioFile: e.target.value })
            }
            className="input-field"
            placeholder="http://example.com/song.mp3"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
          가사 *
        </label>
        <textarea
          value={song.lyrics}
          onChange={(e) => isEditing 
            ? setEditingSong({ ...editingSong, lyrics: e.target.value })
            : setNewSong({ ...newSong, lyrics: e.target.value })
          }
          className="input-field"
          rows="8"
          placeholder="가사를 입력하세요"
        />
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <button onClick={onCancel} className="btn-secondary">
          취소
        </button>
        <button onClick={onSave} className="btn-primary">
          <i className="fas fa-save mr-2"></i>
          {isEditing ? '수정' : '추가'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white">곡 관리자</h1>
          <p className="text-primary-600 dark:text-primary-400 mt-2">
            {currentAlbum.title} 앨범의 곡들을 관리하세요
          </p>
        </div>
        
        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary"
          disabled={isCreating}
        >
          <i className="fas fa-plus mr-2"></i>
          새 곡 추가
        </button>
      </div>

      {/* 새 곡 추가 폼 */}
      {isCreating && (
        <div className="mb-8">
          <SongForm
            song={newSong}
            onSave={handleCreateSong}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}

      {/* 곡 편집 폼 */}
      {editingSong && (
        <div className="mb-8">
          <SongForm
            song={editingSong}
            onSave={handleUpdateSong}
            onCancel={() => setEditingSong(null)}
            isEditing={true}
          />
        </div>
      )}

      {/* 앨범 정보 카드 */}
      <div className="glass-card p-6 rounded-xl mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-lg flex items-center justify-center">
            {currentAlbum.coverImage ? (
              <img src={currentAlbum.coverImage} alt={currentAlbum.title} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <i className="fas fa-compact-disc text-2xl text-white"></i>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary-900 dark:text-white">{currentAlbum.title}</h2>
            <p className="text-primary-600 dark:text-primary-300">{currentAlbum.artist}</p>
            <p className="text-sm text-primary-500 dark:text-primary-400 mt-1">
              총 {currentAlbum.songs.length}곡 • {currentAlbum.genre}
            </p>
          </div>
        </div>
      </div>

      {/* 곡 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currentAlbum.songs
          .sort((a, b) => a.track - b.track)
          .map(song => (
            <SongCard key={song.id} song={song} />
          ))}
      </div>

      {currentAlbum.songs.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-music text-3xl text-primary-400"></i>
          </div>
          <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-2">
            아직 곡이 없습니다
          </h3>
          <p className="text-primary-600 dark:text-primary-400 mb-6">
            첫 번째 곡을 추가해보세요!
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary"
          >
            <i className="fas fa-plus mr-2"></i>
            첫 곡 추가하기
          </button>
        </div>
      )}
    </div>
  )
}
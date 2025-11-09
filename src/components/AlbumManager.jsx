import { useState } from 'react'
import { useAlbum } from '../hooks/useAlbum'
import { ALBUM_GENRES } from '../utils/albumTypes'

export default function AlbumManager() {
  const { 
    albums, 
    currentAlbum, 
    createAlbum, 
    selectAlbum, 
    updateAlbum, 
    deleteAlbum
  } = useAlbum()

  const [isCreating, setIsCreating] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState(null)
  const [newAlbum, setNewAlbum] = useState({
    title: '',
    artist: '',
    genre: ALBUM_GENRES[0],
    description: '',
    coverImage: ''
  })

  const handleCreateAlbum = () => {
    if (newAlbum.title && newAlbum.artist) {
      createAlbum(newAlbum)
      setNewAlbum({
        title: '',
        artist: '',
        genre: ALBUM_GENRES[0],
        description: '',
        coverImage: ''
      })
      setIsCreating(false)
    }
  }

  const handleEditAlbum = (album) => {
    setEditingAlbum({ ...album })
  }

  const handleUpdateAlbum = () => {
    updateAlbum(editingAlbum.id, editingAlbum)
    setEditingAlbum(null)
  }

  const handleDeleteAlbum = (albumId) => {
    if (window.confirm('정말로 이 앨범을 삭제하시겠습니까?')) {
      deleteAlbum(albumId)
    }
  }

  const AlbumCard = ({ album }) => (
    <div className="glass-card p-6 rounded-xl hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-lg flex items-center justify-center">
            {album.coverImage ? (
              <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <i className="fas fa-music text-2xl text-white"></i>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-primary-900 dark:text-white">{album.title}</h3>
            <p className="text-primary-600 dark:text-primary-300">{album.artist}</p>
            <span className="inline-block px-2 py-1 bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium mt-1">
              {album.genre}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => selectAlbum(album.id)}
            className="btn-secondary text-sm"
          >
            선택
          </button>
          <button
            onClick={() => handleEditAlbum(album)}
            className="btn-primary text-sm"
          >
            <i className="fas fa-edit mr-1"></i>편집
          </button>
          <button
            onClick={() => handleDeleteAlbum(album.id)}
            className="btn-danger text-sm"
          >
            <i className="fas fa-trash mr-1"></i>삭제
          </button>
        </div>
      </div>
      
      <div className="text-sm text-primary-600 dark:text-primary-400 mb-4">
        {album.description}
      </div>
      
      <div className="flex items-center justify-between text-sm text-primary-500 dark:text-primary-400">
        <span>{album.songs.length}곡</span>
        <span>{new Date(album.createdAt).toLocaleDateString()}</span>
      </div>
      
      {currentAlbum?.id === album.id && (
        <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/50 rounded-lg">
          <div className="flex items-center text-primary-700 dark:text-primary-300">
            <i className="fas fa-check-circle mr-2"></i>
            현재 선택된 앨범
          </div>
        </div>
      )}
    </div>
  )

  const AlbumForm = ({ album, onSave, onCancel, isEditing = false }) => (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-4">
        {isEditing ? '앨범 편집' : '새 앨범 만들기'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
            앨범 제목 *
          </label>
          <input
            type="text"
            value={album.title}
            onChange={(e) => isEditing 
              ? setEditingAlbum({ ...editingAlbum, title: e.target.value })
              : setNewAlbum({ ...newAlbum, title: e.target.value })
            }
            className="input-field"
            placeholder="앨범 제목을 입력하세요"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
            아티스트 *
          </label>
          <input
            type="text"
            value={album.artist}
            onChange={(e) => isEditing 
              ? setEditingAlbum({ ...editingAlbum, artist: e.target.value })
              : setNewAlbum({ ...newAlbum, artist: e.target.value })
            }
            className="input-field"
            placeholder="아티스트 이름을 입력하세요"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
            장르
          </label>
          <select
            value={album.genre}
            onChange={(e) => isEditing 
              ? setEditingAlbum({ ...editingAlbum, genre: e.target.value })
              : setNewAlbum({ ...newAlbum, genre: e.target.value })
            }
            className="input-field"
          >
            {ALBUM_GENRES.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
            커버 이미지 URL
          </label>
          <input
            type="url"
            value={album.coverImage}
            onChange={(e) => isEditing 
              ? setEditingAlbum({ ...editingAlbum, coverImage: e.target.value })
              : setNewAlbum({ ...newAlbum, coverImage: e.target.value })
            }
            className="input-field"
            placeholder="http://example.com/cover.jpg"
          />
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
          설명
        </label>
        <textarea
          value={album.description}
          onChange={(e) => isEditing 
            ? setEditingAlbum({ ...editingAlbum, description: e.target.value })
            : setNewAlbum({ ...newAlbum, description: e.target.value })
          }
          className="input-field"
          rows="3"
          placeholder="앨범에 대한 설명을 입력하세요"
        />
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <button onClick={onCancel} className="btn-secondary">
          취소
        </button>
        <button onClick={onSave} className="btn-primary">
          <i className="fas fa-save mr-2"></i>
          {isEditing ? '수정' : '생성'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white">앨범 관리자</h1>
          <p className="text-primary-600 dark:text-primary-400 mt-2">
            음악 앨범을 생성하고 관리하세요
          </p>
        </div>
        
        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary"
          disabled={isCreating}
        >
          <i className="fas fa-plus mr-2"></i>
          새 앨범 만들기
        </button>
      </div>

      {/* 새 앨범 생성 폼 */}
      {isCreating && (
        <div className="mb-8">
          <AlbumForm
            album={newAlbum}
            onSave={handleCreateAlbum}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}

      {/* 앨범 편집 폼 */}
      {editingAlbum && (
        <div className="mb-8">
          <AlbumForm
            album={editingAlbum}
            onSave={handleUpdateAlbum}
            onCancel={() => setEditingAlbum(null)}
            isEditing={true}
          />
        </div>
      )}

      {/* 현재 선택된 앨범 정보 */}
      {currentAlbum && (
        <div className="mb-8 p-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">현재 작업 중인 앨범</h2>
              <p className="text-primary-100 mt-1">
                {currentAlbum.title} - {currentAlbum.artist}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{currentAlbum.songs.length}</div>
              <div className="text-primary-100">곡</div>
            </div>
          </div>
        </div>
      )}

      {/* 앨범 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {albums.map(album => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>

      {albums.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-compact-disc text-3xl text-primary-400"></i>
          </div>
          <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-2">
            아직 앨범이 없습니다
          </h3>
          <p className="text-primary-600 dark:text-primary-400 mb-6">
            첫 번째 앨범을 만들어보세요!
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary"
          >
            <i className="fas fa-plus mr-2"></i>
            첫 앨범 만들기
          </button>
        </div>
      )}
    </div>
  )
}
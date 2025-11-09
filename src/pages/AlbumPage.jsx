
import { useState } from 'react'
import { AlbumProvider } from '../contexts/AlbumContext'
import AlbumManager from '../components/AlbumManager'
import SongManager from '../components/SongManager'

export default function AlbumPage() {
  const [activeTab, setActiveTab] = useState('albums')

  const tabs = [
    { id: 'albums', label: '앨범 관리', icon: 'fas fa-compact-disc' },
    { id: 'songs', label: '곡 관리', icon: 'fas fa-music' }
  ]

  return (
    <AlbumProvider>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-primary-900 dark:to-secondary-900">
        {/* 헤더 */}
        <div className="glass-header sticky top-0 z-50 backdrop-blur-md border-b border-primary-200/30 dark:border-primary-700/30">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-compact-disc text-white text-lg"></i>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-primary-900 dark:text-white">
                    앨범 & 곡 관리
                  </h1>
                  <p className="text-primary-600 dark:text-primary-400 text-sm">
                    음악 앨범과 곡을 생성하고 관리하세요
                  </p>
                </div>
              </div>
              
              {/* 탭 네비게이션 */}
              <div className="flex bg-white/50 dark:bg-gray-800/50 rounded-xl p-1 backdrop-blur-sm">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-lg'
                        : 'text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300'
                    }`}
                  >
                    <i className={`${tab.icon} text-sm`}></i>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="pt-8">
          {activeTab === 'albums' && <AlbumManager />}
          {activeTab === 'songs' && <SongManager />}
        </div>

        {/* 플로팅 액션 버튼 */}
        <div className="fixed bottom-8 right-8 flex flex-col space-y-3">
          <button 
            onClick={() => setActiveTab('albums')} 
            className={`w-14 h-14 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center ${
              activeTab === 'albums' 
                ? 'bg-primary-500 text-white scale-110' 
                : 'bg-white dark:bg-gray-700 text-primary-500 dark:text-primary-400 hover:scale-105'
            }`}
            title="앨범 관리"
          >
            <i className="fas fa-compact-disc"></i>
          </button>
          <button 
            onClick={() => setActiveTab('songs')} 
            className={`w-14 h-14 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center ${
              activeTab === 'songs' 
                ? 'bg-secondary-500 text-white scale-110' 
                : 'bg-white dark:bg-gray-700 text-secondary-500 dark:text-secondary-400 hover:scale-105'
            }`}
            title="곡 관리"
          >
            <i className="fas fa-music"></i>
          </button>
        </div>

        {/* 키보드 단축키 힌트 */}
        <div className="fixed bottom-8 left-8 glass-card p-4 rounded-lg text-sm text-primary-600 dark:text-primary-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-primary-100 dark:bg-primary-800 rounded text-xs">Alt</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-primary-100 dark:bg-primary-800 rounded text-xs">1</kbd>
              <span className="ml-2">앨범</span>
            </div>
            <div className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-primary-100 dark:bg-primary-800 rounded text-xs">Alt</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-primary-100 dark:bg-primary-800 rounded text-xs">2</kbd>
              <span className="ml-2">곡</span>
            </div>
          </div>
        </div>
      </div>
    </AlbumProvider>
  )
}

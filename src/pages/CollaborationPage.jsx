import React, { useState, useEffect } from 'react';
import { CollaborationPanel, CommentPanel, VersionHistory, SyncStatus } from '../components/CollaborationComponents';
import PoemInputForm from '../components/PoemInputForm';
import SongPlayer from '../components/SongPlayer';
import { useAlbum } from '../contexts/AlbumContext';
import { cloudSyncManager } from '../utils/commentSystem';

export default function CollaborationPage() {
  const { state } = useAlbum();
  const [currentUser] = useState({
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    name: '음악 작곡가',
    avatar: '🎵',
    email: 'composer@music.com'
  });
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [activeTab, setActiveTab] = useState('workspace');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // 클라우드 동기화 시작
    cloudSyncManager.startAutoSync(30000); // 30초마다 동기화

    return () => {
      cloudSyncManager.stopAutoSync();
    };
  }, []);

  useEffect(() => {
    // 첫 번째 앨범을 기본 프로젝트로 설정
    if (state.albums.length > 0 && !selectedProject) {
      setSelectedProject(state.albums[0]);
    }
  }, [state.albums, selectedProject]);

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setSelectedSong(null);
  };

  const handleSongSelect = (song) => {
    setSelectedSong(song);
  };

  const tabs = [
    { id: 'workspace', name: '작업공간', icon: '🎼' },
    { id: 'collaboration', name: '협업', icon: '👥' },
    { id: 'comments', name: '댓글', icon: '💬' },
    { id: 'versions', name: '버전', icon: '📚' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* 상단 헤더 */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-white">🎵 협업 스튜디오</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <SyncStatus />
              <div className="flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-lg">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="text-white text-sm font-medium">{currentUser.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* 왼쪽 사이드바 - 프로젝트 목록 */}
        <div className={`bg-black/20 backdrop-blur-lg border-r border-white/10 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          <div className="p-4">
            <h3 className={`text-white font-semibold mb-4 ${sidebarCollapsed ? 'hidden' : 'block'}`}>
              프로젝트
            </h3>
            <div className="space-y-2">
              {state.albums.map(album => (
                <button
                  key={album.id}
                  onClick={() => handleProjectSelect(album)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedProject?.id === album.id 
                      ? 'bg-purple-600/30 text-purple-300' 
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className={`flex items-center space-x-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                    <span className="text-lg">🎼</span>
                    {!sidebarCollapsed && (
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{album.title}</p>
                        <p className="text-xs opacity-70">{album.songs.length}곡</p>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* 곡 목록 */}
            {selectedProject && !sidebarCollapsed && (
              <div className="mt-6">
                <h4 className="text-white/70 font-medium mb-2 text-sm">곡 목록</h4>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {selectedProject.songs.map(song => (
                    <button
                      key={song.id}
                      onClick={() => handleSongSelect(song)}
                      className={`w-full p-2 rounded text-left text-sm transition-colors ${
                        selectedSong?.id === song.id
                          ? 'bg-blue-600/30 text-blue-300'
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>🎵</span>
                        <span className="truncate">{song.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="flex-1 flex flex-col">
          {/* 탭 네비게이션 */}
          <div className="bg-black/10 backdrop-blur-lg border-b border-white/10">
            <div className="flex space-x-1 p-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-600/30 text-purple-300'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="flex-1 p-6 overflow-auto">
            {activeTab === 'workspace' && (
              <WorkspaceTab 
                selectedProject={selectedProject}
                selectedSong={selectedSong}
                currentUser={currentUser}
              />
            )}
            
            {activeTab === 'collaboration' && selectedProject && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CollaborationPanel 
                  projectId={selectedProject.id}
                  currentUser={currentUser}
                />
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                    <h3 className="text-white font-semibold mb-4">프로젝트 정보</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">제목: <span className="text-white">{selectedProject.title}</span></p>
                      <p className="text-gray-300">장르: <span className="text-white">{selectedProject.genre}</span></p>
                      <p className="text-gray-300">곡 수: <span className="text-white">{selectedProject.songs.length}</span></p>
                      <p className="text-gray-300">생성일: <span className="text-white">{new Date(selectedProject.createdAt).toLocaleDateString()}</span></p>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                    <h3 className="text-white font-semibold mb-4">협업 활동</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p>• 실시간 편집 활성화됨</p>
                      <p>• 자동 저장 활성화됨</p>
                      <p>• 클라우드 동기화 진행 중</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'comments' && selectedProject && (
              <div className="max-w-4xl mx-auto">
                <CommentPanel 
                  projectId={selectedProject.id}
                  songId={selectedSong?.id}
                  currentUser={currentUser}
                />
              </div>
            )}
            
            {activeTab === 'versions' && selectedProject && (
              <div className="max-w-2xl mx-auto">
                <VersionHistory projectId={selectedProject.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 작업공간 탭 컴포넌트
const WorkspaceTab = ({ selectedProject, selectedSong, currentUser }) => {
  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🎼</div>
          <h3 className="text-xl text-white font-semibold mb-2">프로젝트를 선택하세요</h3>
          <p className="text-gray-400">왼쪽에서 작업할 프로젝트를 선택해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 프로젝트 헤더 */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl text-white font-bold">{selectedProject.title}</h2>
            <p className="text-gray-300">{selectedProject.genre} · {selectedProject.songs.length}곡</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {currentUser.name.charAt(0)}
            </div>
            <span className="text-white text-sm">편집 중</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 왼쪽: 가사/텍스트 편집 */}
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-white font-semibold mb-4">가사 편집기</h3>
            <PoemInputForm />
          </div>
        </div>

        {/* 오른쪽: 음악 플레이어와 도구 */}
        <div className="space-y-6">
          {selectedSong && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-white font-semibold mb-4">음악 플레이어</h3>
              <SongPlayer 
                title={selectedSong.title}
                style={selectedSong.style || 'ballad'}
                compact={false}
              />
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-white font-semibold mb-4">협업 도구</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors text-sm font-medium">
                📝 가사 공유
              </button>
              <button className="p-3 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors text-sm font-medium">
                🎵 음원 공유
              </button>
              <button className="p-3 bg-green-600/20 text-green-300 rounded-lg hover:bg-green-600/30 transition-colors text-sm font-medium">
                💾 버전 저장
              </button>
              <button className="p-3 bg-orange-600/20 text-orange-300 rounded-lg hover:bg-orange-600/30 transition-colors text-sm font-medium">
                🔄 동기화
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-white font-semibold mb-4">빠른 작업</h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white rounded-lg hover:from-purple-600/30 hover:to-pink-600/30 transition-all text-sm font-medium">
                🤖 AI 작곡 시작
              </button>
              <button className="w-full p-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-white rounded-lg hover:from-blue-600/30 hover:to-cyan-600/30 transition-all text-sm font-medium">
                📊 감정 분석
              </button>
              <button className="w-full p-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-white rounded-lg hover:from-green-600/30 hover:to-emerald-600/30 transition-all text-sm font-medium">
                🎼 멜로디 제안
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
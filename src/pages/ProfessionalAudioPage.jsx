import React, { useState } from 'react';
import { MultiTrackEditor } from '../components/ProfessionalAudioTools';
import { MIDIEditor, DAWIntegration } from '../components/MIDIEditor';

export default function ProfessionalAudioPage() {
  const [activeTab, setActiveTab] = useState('multitrack');

  const tabs = [
    { id: 'multitrack', name: '멀티트랙 편집', icon: '🎛️' },
    { id: 'midi', name: 'MIDI 편집', icon: '🎹' },
    { id: 'integration', name: 'DAW 통합', icon: '🔗' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* 헤더 */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">🎛️ 프로페셔널 오디오 도구</h1>
              <p className="text-gray-300 mt-1">멀티트랙 편집, MIDI 처리, DAW 통합</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg">
                <span className="text-sm font-medium">🔴 실시간 처리</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="bg-black/10 backdrop-blur-lg border-b border-white/10">
        <div className="px-6">
          <div className="flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-white bg-purple-600/30 border-b-2 border-purple-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="p-6">
        {activeTab === 'multitrack' && (
          <div className="space-y-6">
            {/* 기능 소개 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">멀티트랙 오디오 편집</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">🎵</div>
                  <h3 className="font-semibold text-white">무제한 트랙</h3>
                  <p className="text-gray-300 text-sm">필요한 만큼 오디오 트랙 추가</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">🎚️</div>
                  <h3 className="font-semibold text-white">프로 이펙트</h3>
                  <p className="text-gray-300 text-sm">리버브, 딜레이, EQ, 컴프레서</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">📊</div>
                  <h3 className="font-semibold text-white">실시간 분석</h3>
                  <p className="text-gray-300 text-sm">스펙트럼 분석 및 모니터링</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">🎛️</div>
                  <h3 className="font-semibold text-white">믹싱 콘솔</h3>
                  <p className="text-gray-300 text-sm">전문가급 믹싱 도구</p>
                </div>
              </div>
            </div>

            {/* 멀티트랙 편집기 */}
            <MultiTrackEditor />
          </div>
        )}

        {activeTab === 'midi' && (
          <div className="space-y-6">
            {/* MIDI 기능 소개 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">MIDI 편집 및 시퀀싱</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">🎹</div>
                  <h3 className="font-semibold text-white">피아노 롤</h3>
                  <p className="text-gray-300 text-sm">직관적인 노트 편집</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">🎼</div>
                  <h3 className="font-semibold text-white">MIDI 파일</h3>
                  <p className="text-gray-300 text-sm">가져오기/내보내기 지원</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">🎺</div>
                  <h3 className="font-semibold text-white">가상 악기</h3>
                  <p className="text-gray-300 text-sm">다양한 신디사이저</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">⚙️</div>
                  <h3 className="font-semibold text-white">고급 설정</h3>
                  <p className="text-gray-300 text-sm">엔벨로프, 웨이브폼 조정</p>
                </div>
              </div>
            </div>

            {/* MIDI 편집기 */}
            <MIDIEditor />
          </div>
        )}

        {activeTab === 'integration' && (
          <div className="space-y-6">
            {/* DAW 통합 소개 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">DAW 통합 및 내보내기</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">📤</div>
                  <h3 className="font-semibold text-white">다양한 형식</h3>
                  <p className="text-gray-300 text-sm">WAV, MIDI, JSON 내보내기</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">🔗</div>
                  <h3 className="font-semibold text-white">DAW 호환</h3>
                  <p className="text-gray-300 text-sm">주요 DAW와 완벽 호환</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">⚡</div>
                  <h3 className="font-semibold text-white">고속 처리</h3>
                  <p className="text-gray-300 text-sm">실시간 렌더링 및 내보내기</p>
                </div>
              </div>
            </div>

            {/* DAW 통합 도구 */}
            <DAWIntegration />

            {/* 지원하는 DAW 목록 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">지원하는 DAW</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { name: 'Ableton Live', status: 'full' },
                  { name: 'FL Studio', status: 'full' },
                  { name: 'Logic Pro', status: 'full' },
                  { name: 'Pro Tools', status: 'full' },
                  { name: 'Cubase', status: 'partial' },
                  { name: 'Studio One', status: 'partial' }
                ].map(daw => (
                  <div key={daw.name} className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="font-medium text-white text-sm">{daw.name}</div>
                    <div className={`text-xs mt-1 ${
                      daw.status === 'full' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {daw.status === 'full' ? '완전 지원' : '부분 지원'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 내보내기 팁 */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
              <h3 className="text-xl font-bold text-blue-300 mb-4">💡 내보내기 팁</h3>
              <div className="space-y-3 text-blue-200">
                <div className="flex items-start space-x-3">
                  <span className="text-blue-400 font-bold">1.</span>
                  <div>
                    <strong>WAV 형식</strong>은 최고 품질의 오디오를 위해 사용하세요.
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-blue-400 font-bold">2.</span>
                  <div>
                    <strong>MIDI 형식</strong>은 다른 DAW에서 편집을 계속하려는 경우에 적합합니다.
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-blue-400 font-bold">3.</span>
                  <div>
                    <strong>JSON 형식</strong>은 프로젝트 설정을 백업하거나 공유할 때 유용합니다.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
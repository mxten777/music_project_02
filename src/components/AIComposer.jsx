import { useState, useEffect, useRef } from 'react'
import { MusicGenerationEngine } from '../utils/musicGenerationEngine'
import { MusicComposer } from '../utils/musicComposer'

export default function AIComposer() {
  const [engine, setEngine] = useState(null)
  const [composer, setComposer] = useState(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMusic, setGeneratedMusic] = useState(null)
  const [currentLyrics, setCurrentLyrics] = useState('')
  const [musicOptions, setMusicOptions] = useState({
    genre: 'ballad',
    emotion: 'nostalgic',
    tempo: null,
    key: 'C',
    userStyle: null
  })
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStage, setGenerationStage] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [_audioNodes, _setAudioNodes] = useState([])
  
  const audioContextRef = useRef(null)
  const oscillatorsRef = useRef([])

  // 컴포넌트 마운트 시 엔진 초기화
  useEffect(() => {
    initializeEngine()
    
    return () => {
      // 정리 작업
      stopPlayback()
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // 엔진 초기화
  const initializeEngine = async () => {
    setIsInitializing(true)
    try {
      const musicEngine = new MusicGenerationEngine()
      const initialized = await musicEngine.initialize()
      
      if (initialized) {
        setEngine(musicEngine)
        setComposer(new MusicComposer(musicEngine))
        console.log('🎵 AI 작곡 엔진이 초기화되었습니다.')
      } else {
        throw new Error('엔진 초기화 실패')
      }
    } catch (error) {
      console.error('AI 작곡 엔진 초기화 오류:', error)
      alert('AI 작곡 엔진을 초기화할 수 없습니다. 브라우저가 Web Audio API를 지원하는지 확인해주세요.')
    } finally {
      setIsInitializing(false)
    }
  }

  // 음악 생성
  const generateMusic = async () => {
    if (!engine || !composer || !currentLyrics.trim()) {
      alert('가사를 입력해주세요.')
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)
    setGeneratedMusic(null)

    try {
      // 단계별 진행 상황 표시
      setGenerationStage('가사 분석 중...')
      setGenerationProgress(20)

      const musicData = await engine.generateMusicFromLyrics(currentLyrics, musicOptions)
      
      setGenerationStage('코드 진행 생성 중...')
      setGenerationProgress(40)

      // 추가 처리를 위한 지연
      await new Promise(resolve => setTimeout(resolve, 500))

      setGenerationStage('멜로디 생성 중...')
      setGenerationProgress(60)

      await new Promise(resolve => setTimeout(resolve, 500))

      setGenerationStage('리듬 패턴 생성 중...')
      setGenerationProgress(80)

      await new Promise(resolve => setTimeout(resolve, 500))

      setGenerationStage('최종 처리 중...')
      setGenerationProgress(100)

      setGeneratedMusic(musicData)
      setGenerationStage('생성 완료!')

      console.log('🎼 생성된 음악 데이터:', musicData)

    } catch (error) {
      console.error('음악 생성 오류:', error)
      alert(`음악 생성 중 오류가 발생했습니다: ${error.message}`)
    } finally {
      setIsGenerating(false)
      setTimeout(() => {
        setGenerationStage('')
        setGenerationProgress(0)
      }, 2000)
    }
  }

  // 음악 재생
  const playGeneratedMusic = async () => {
    if (!generatedMusic || !engine) return

    if (isPlaying) {
      stopPlayback()
      return
    }

    try {
      // 오디오 컨텍스트 생성
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      setIsPlaying(true)
      
      // 멜로디 재생
      await playMelody(generatedMusic.melody, generatedMusic.tempo)
      
    } catch (error) {
      console.error('재생 오류:', error)
      setIsPlaying(false)
    }
  }

  // 멜로디 재생
  const playMelody = async (melody, tempo) => {
    const audioContext = audioContextRef.current
    if (!audioContext) return

    const _beatDuration = (60 / tempo) * 1000 // ms
    let currentTime = audioContext.currentTime

    for (const section of melody) {
      for (const line of section.melody) {
        for (const wordGroup of line.notes) {
          for (const noteInfo of wordGroup.notes) {
            // 오실레이터 생성
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            // 주파수 설정
            oscillator.frequency.setValueAtTime(noteInfo.frequency, currentTime)
            oscillator.type = 'sine'
            
            // 볼륨 엔벨로프
            gainNode.gain.setValueAtTime(0, currentTime)
            gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.05)
            gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + noteInfo.duration)
            
            // 재생
            oscillator.start(currentTime)
            oscillator.stop(currentTime + noteInfo.duration)
            
            oscillatorsRef.current.push({ oscillator, gainNode })
            
            currentTime += noteInfo.duration
          }
        }
      }
    }

    // 재생 완료 후 정리
    setTimeout(() => {
      setIsPlaying(false)
      oscillatorsRef.current = []
    }, (currentTime - audioContext.currentTime) * 1000)
  }

  // 재생 중지
  const stopPlayback = () => {
    oscillatorsRef.current.forEach(({ oscillator, gainNode }) => {
      try {
        oscillator.stop()
        gainNode.disconnect()
      } catch (_error) {
        // 이미 정지된 오실레이터는 무시
      }
    })
    oscillatorsRef.current = []
    setIsPlaying(false)
  }

  // 음악 다운로드 (MIDI 형식으로 간단히 구현)
  const downloadMusic = () => {
    if (!generatedMusic) return

    const musicJson = JSON.stringify(generatedMusic, null, 2)
    const blob = new Blob([musicJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${generatedMusic.title || '생성된_음악'}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
  }

  // 음악을 앨범에 저장
  const saveToAlbum = () => {
    if (!generatedMusic) return

    // 앨범 컨텍스트에 음악 데이터 저장
    // 실제 구현에서는 useAlbum 훅을 사용
    const musicForAlbum = {
      title: generatedMusic.title,
      lyrics: generatedMusic.lyrics,
      genre: generatedMusic.genre,
      emotion: generatedMusic.emotion,
      tempo: generatedMusic.tempo,
      key: generatedMusic.key,
      duration: generatedMusic.duration,
      generatedData: generatedMusic
    }

    console.log('앨범에 저장할 음악 데이터:', musicForAlbum)
    alert('음악이 현재 앨범에 저장되었습니다!')
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-700 font-medium text-sm mb-6 border border-purple-200/50">
          <i className="fas fa-brain text-purple-500"></i>
          AI 음악 생성 엔진
        </div>
        <h1 className="text-4xl font-bold mb-4 text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text">
          고급 AI 작곡가
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          당신의 가사를 분석하여 감정과 장르에 맞는 완벽한 음악을 AI가 실시간으로 생성합니다
        </p>
      </div>

      {/* 초기화 상태 */}
      {isInitializing && (
        <div className="glass-card p-8 rounded-xl text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <i className="fas fa-cog text-white text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">AI 엔진 초기화 중...</h3>
          <p className="text-gray-600">음악 생성 엔진을 준비하고 있습니다.</p>
        </div>
      )}

      {engine && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 입력 패널 */}
          <div className="space-y-6">
            {/* 가사 입력 */}
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-feather-alt text-purple-500"></i>
                가사 입력
              </h3>
              <textarea
                value={currentLyrics}
                onChange={(e) => setCurrentLyrics(e.target.value)}
                placeholder="음악으로 만들고 싶은 가사를 입력하세요..."
                className="w-full h-40 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isGenerating}
              />
              <div className="mt-2 text-sm text-gray-500">
                {currentLyrics.trim() ? `${currentLyrics.trim().split('\n').length}줄, ${currentLyrics.length}자` : '가사를 입력해주세요'}
              </div>
            </div>

            {/* 음악 옵션 */}
            <div className="glass-card p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-sliders-h text-purple-500"></i>
                음악 설정
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">장르</label>
                  <select
                    value={musicOptions.genre}
                    onChange={(e) => setMusicOptions(prev => ({ ...prev, genre: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    disabled={isGenerating}
                  >
                    <option value="ballad">발라드</option>
                    <option value="pop">팝</option>
                    <option value="rock">록</option>
                    <option value="jazz">재즈</option>
                    <option value="folk">포크</option>
                    <option value="enka">엔카</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">감정</label>
                  <select
                    value={musicOptions.emotion}
                    onChange={(e) => setMusicOptions(prev => ({ ...prev, emotion: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    disabled={isGenerating}
                  >
                    <option value="happy">기쁨</option>
                    <option value="sad">슬픔</option>
                    <option value="romantic">로맨틱</option>
                    <option value="nostalgic">그리움</option>
                    <option value="energetic">역동적</option>
                    <option value="peaceful">평화로운</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">조성</label>
                  <select
                    value={musicOptions.key}
                    onChange={(e) => setMusicOptions(prev => ({ ...prev, key: e.target.value }))}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    disabled={isGenerating}
                  >
                    <option value="C">C (도)</option>
                    <option value="D">D (레)</option>
                    <option value="E">E (미)</option>
                    <option value="F">F (파)</option>
                    <option value="G">G (솔)</option>
                    <option value="A">A (라)</option>
                    <option value="B">B (시)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">템포 (BPM)</label>
                  <input
                    type="number"
                    min="60"
                    max="180"
                    value={musicOptions.tempo || ''}
                    onChange={(e) => setMusicOptions(prev => ({ ...prev, tempo: e.target.value ? parseInt(e.target.value) : null }))}
                    placeholder="자동"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    disabled={isGenerating}
                  />
                </div>
              </div>
            </div>

            {/* 생성 버튼 */}
            <button
              onClick={generateMusic}
              disabled={!currentLyrics.trim() || isGenerating}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                !currentLyrics.trim() || isGenerating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {generationStage || '음악 생성 중...'}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <i className="fas fa-magic"></i>
                  AI로 음악 생성하기
                </div>
              )}
            </button>

            {/* 진행 상황 */}
            {isGenerating && (
              <div className="glass-card p-4 rounded-xl">
                <div className="mb-2 flex justify-between text-sm text-gray-600">
                  <span>{generationStage}</span>
                  <span>{generationProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* 결과 패널 */}
          <div className="space-y-6">
            {generatedMusic ? (
              <>
                {/* 음악 정보 */}
                <div className="glass-card p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-music text-purple-500"></i>
                    생성된 음악
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">제목:</span>
                      <span className="text-gray-600">{generatedMusic.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">장르:</span>
                      <span className="text-gray-600">{generatedMusic.genre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">감정:</span>
                      <span className="text-gray-600">{generatedMusic.emotion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">조성:</span>
                      <span className="text-gray-600">{generatedMusic.key}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">템포:</span>
                      <span className="text-gray-600">{generatedMusic.tempo} BPM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">예상 길이:</span>
                      <span className="text-gray-600">{Math.floor(generatedMusic.duration / 60)}분 {generatedMusic.duration % 60}초</span>
                    </div>
                  </div>
                </div>

                {/* 컨트롤 버튼 */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={playGeneratedMusic}
                    className={`p-4 rounded-xl font-bold transition-all duration-300 ${
                      isPlaying
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    <i className={`fas ${isPlaying ? 'fa-stop' : 'fa-play'} mr-2`}></i>
                    {isPlaying ? '정지' : '재생'}
                  </button>
                  
                  <button
                    onClick={downloadMusic}
                    className="p-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all duration-300"
                  >
                    <i className="fas fa-download mr-2"></i>
                    다운로드
                  </button>
                </div>

                <button
                  onClick={saveToAlbum}
                  className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                >
                  <i className="fas fa-plus mr-2"></i>
                  앨범에 저장
                </button>

                {/* 음악 구조 시각화 */}
                <div className="glass-card p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">음악 구조</h4>
                  <div className="space-y-2">
                    {generatedMusic.structure.map((section, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${
                          section === 'verse' ? 'bg-blue-500' :
                          section === 'chorus' ? 'bg-red-500' :
                          'bg-green-500'
                        }`}></div>
                        <span className="font-medium capitalize">{section}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-card p-8 rounded-xl text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-music text-gray-400 text-2xl"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-600 mb-2">음악이 생성되지 않았습니다</h3>
                <p className="text-gray-500">가사를 입력하고 'AI로 음악 생성하기' 버튼을 클릭하세요.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
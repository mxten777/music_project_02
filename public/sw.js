// Service Worker for PWA functionality
const CACHE_NAME = 'musicoding-v1.0.0';
const OFFLINE_URL = '/offline.html';

// 캐시할 정적 자원들
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css',
  // 중요한 이미지들
  '/images/icon-192x192.png',
  '/images/icon-512x512.png'
];

// 동적으로 캐시할 자원들 (API 응답, 음악 파일 등)
const DYNAMIC_CACHE_URLS = [
  '/api/',
  '/audio/',
  '/data/'
];

// Service Worker 설치
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Skip Waiting');
        return self.skipWaiting();
      })
  );
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Claiming Clients');
      return self.clients.claim();
    })
  );
});

// 네트워크 요청 가로채기 (Fetch)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // HTML 요청 처리
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 네트워크 응답을 캐시에 저장
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // 오프라인일 때 캐시된 페이지 또는 오프라인 페이지 반환
          return caches.match(request)
            .then((response) => {
              return response || caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // API 요청 처리
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return fetch(request)
          .then((response) => {
            // 성공적인 API 응답을 캐시에 저장
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // 네트워크 실패 시 캐시된 응답 반환
            return cache.match(request);
          });
      })
    );
    return;
  }

  // 음악 파일 요청 처리
  if (url.pathname.startsWith('/audio/') || request.destination === 'audio') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(request).then((response) => {
            // 음악 파일을 캐시에 저장 (용량 제한 고려)
            if (response.status === 200 && response.headers.get('content-length') < 10 * 1024 * 1024) { // 10MB 이하만 캐시
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // 기타 정적 자원 처리 (Cache First 전략)
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(request).then((response) => {
            // 정적 자원을 캐시에 저장
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
        .catch(() => {
          // 이미지나 폰트 등이 실패할 경우 기본값 반환
          if (request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">이미지 없음</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
        })
    );
  }
});

// 백그라운드 동기화
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background Sync', event.tag);
  
  if (event.tag === 'sync-music-data') {
    event.waitUntil(syncMusicData());
  }
  
  if (event.tag === 'sync-user-activity') {
    event.waitUntil(syncUserActivity());
  }
});

// 푸시 알림 처리
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Received');
  
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다.',
    icon: '/images/icon-192x192.png',
    badge: '/images/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/images/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('뮤직코딩', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification Click');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// 메시지 처리 (클라이언트와 통신)
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message Received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// 백그라운드 동기화 함수들
async function syncMusicData() {
  try {
    // 오프라인 중에 생성된 음악 데이터를 서버에 동기화
    const musicData = await getStoredMusicData();
    if (musicData.length > 0) {
      await fetch('/api/sync-music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(musicData)
      });
      
      // 동기화 완료 후 로컬 저장소 정리
      await clearStoredMusicData();
    }
  } catch (error) {
    console.error('Music data sync failed:', error);
  }
}

async function syncUserActivity() {
  try {
    // 사용자 활동 데이터 동기화
    const activityData = await getStoredActivityData();
    if (activityData.length > 0) {
      await fetch('/api/sync-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activityData)
      });
      
      await clearStoredActivityData();
    }
  } catch (error) {
    console.error('Activity data sync failed:', error);
  }
}

// 로컬 저장소 헬퍼 함수들
async function getStoredMusicData() {
  return new Promise((resolve) => {
    // IndexedDB에서 오프라인 음악 데이터 조회
    const data = JSON.parse(localStorage.getItem('offline-music-data') || '[]');
    resolve(data);
  });
}

async function clearStoredMusicData() {
  localStorage.removeItem('offline-music-data');
}

async function getStoredActivityData() {
  return new Promise((resolve) => {
    const data = JSON.parse(localStorage.getItem('offline-activity-data') || '[]');
    resolve(data);
  });
}

async function clearStoredActivityData() {
  localStorage.removeItem('offline-activity-data');
}

// 캐시 크기 관리
async function manageCacheSize() {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  
  // 캐시가 너무 커지면 오래된 항목 삭제
  if (keys.length > 100) {
    const keysToDelete = keys.slice(0, 20); // 오래된 20개 삭제
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// 정기적으로 캐시 크기 관리
setInterval(manageCacheSize, 60000); // 1분마다 체크
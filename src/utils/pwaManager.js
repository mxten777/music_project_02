// PWA 유틸리티 함수들
class PWAManager {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator;
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    this.swRegistration = null;
    this.deferredPrompt = null;
    
    this.init();
  }

  // PWA 초기화
  async init() {
    if (!this.isSupported) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      // Service Worker 등록
      await this.registerServiceWorker();
      
      // 설치 프롬프트 설정
      this.setupInstallPrompt();
      
      // 업데이트 체크
      this.checkForUpdates();
      
      // 네트워크 상태 모니터링
      this.setupNetworkMonitoring();
      
    } catch (error) {
      console.error('PWA initialization failed:', error);
    }
  }

  // Service Worker 등록
  async registerServiceWorker() {
    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered:', this.swRegistration);
      
      // Service Worker 상태 변화 감지
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.showUpdateAvailable();
          }
        });
      });
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  // 설치 프롬프트 설정
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.deferredPrompt = null;
      this.hideInstallPrompt();
    });
  }

  // 앱 설치 실행
  async installApp() {
    if (!this.deferredPrompt) {
      console.warn('Install prompt not available');
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Install failed:', error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  // 업데이트 체크
  async checkForUpdates() {
    if (!this.swRegistration) return;

    try {
      await this.swRegistration.update();
    } catch (error) {
      console.error('Update check failed:', error);
    }
  }

  // 업데이트 적용
  async applyUpdate() {
    if (!this.swRegistration?.waiting) return;

    this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // 페이지 새로고침
    window.location.reload();
  }

  // 네트워크 상태 모니터링
  setupNetworkMonitoring() {
    const updateNetworkStatus = () => {
      const event = new CustomEvent('networkstatus', {
        detail: { online: navigator.onLine }
      });
      window.dispatchEvent(event);
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // 초기 상태 설정
    updateNetworkStatus();
  }

  // 오프라인 데이터 저장
  saveOfflineData(key, data) {
    try {
      const offlineData = JSON.parse(localStorage.getItem('offline-data') || '{}');
      offlineData[key] = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem('offline-data', JSON.stringify(offlineData));
      return true;
    } catch (error) {
      console.error('Failed to save offline data:', error);
      return false;
    }
  }

  // 오프라인 데이터 로드
  loadOfflineData(key) {
    try {
      const offlineData = JSON.parse(localStorage.getItem('offline-data') || '{}');
      return offlineData[key]?.data || null;
    } catch (error) {
      console.error('Failed to load offline data:', error);
      return null;
    }
  }

  // 백그라운드 동기화 등록
  async registerBackgroundSync(tag, data) {
    if (!this.swRegistration?.sync) {
      console.warn('Background sync not supported');
      return false;
    }

    try {
      // 동기화할 데이터 저장
      this.saveOfflineData(`sync-${tag}`, data);
      
      // 백그라운드 동기화 등록
      await this.swRegistration.sync.register(tag);
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  }

  // 푸시 알림 권한 요청
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Notification permission request failed:', error);
      return false;
    }
  }

  // 로컬 알림 표시
  showNotification(title, options = {}) {
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    const defaultOptions = {
      icon: '/images/icon-192x192.png',
      badge: '/images/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        timestamp: Date.now()
      }
    };

    new Notification(title, { ...defaultOptions, ...options });
  }

  // 앱 정보 가져오기
  getAppInfo() {
    return {
      isSupported: this.isSupported,
      isInstalled: this.isInstalled,
      isOnline: navigator.onLine,
      canInstall: !!this.deferredPrompt,
      swRegistered: !!this.swRegistration,
      notificationPermission: Notification?.permission || 'default'
    };
  }

  // 설치 프롬프트 표시 (커스텀 이벤트)
  showInstallPrompt() {
    const event = new CustomEvent('showinstallprompt');
    window.dispatchEvent(event);
  }

  // 설치 프롬프트 숨김
  hideInstallPrompt() {
    const event = new CustomEvent('hideinstallprompt');
    window.dispatchEvent(event);
  }

  // 업데이트 사용 가능 알림
  showUpdateAvailable() {
    const event = new CustomEvent('updateavailable');
    window.dispatchEvent(event);
  }

  // 캐시 관리
  async clearCache() {
    if (!('caches' in window)) return false;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      return true;
    } catch (error) {
      console.error('Cache clear failed:', error);
      return false;
    }
  }

  // 스토리지 사용량 확인
  async getStorageUsage() {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return { usage: 0, quota: 0, percentage: 0 };
    }

    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? Math.round((usage / quota) * 100) : 0;

      return {
        usage: Math.round(usage / 1024 / 1024), // MB
        quota: Math.round(quota / 1024 / 1024), // MB
        percentage
      };
    } catch (error) {
      console.error('Storage usage check failed:', error);
      return { usage: 0, quota: 0, percentage: 0 };
    }
  }

  // 앱 데이터 백업
  async backupAppData() {
    const appData = {
      timestamp: Date.now(),
      userData: this.loadOfflineData('user-data'),
      musicData: this.loadOfflineData('music-data'),
      settings: this.loadOfflineData('settings'),
      analytics: this.loadOfflineData('analytics-data')
    };

    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `musicoding-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 앱 데이터 복원
  async restoreAppData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const backupData = JSON.parse(e.target.result);
          
          // 데이터 검증
          if (!backupData.timestamp) {
            throw new Error('Invalid backup file');
          }

          // 데이터 복원
          if (backupData.userData) {
            this.saveOfflineData('user-data', backupData.userData);
          }
          if (backupData.musicData) {
            this.saveOfflineData('music-data', backupData.musicData);
          }
          if (backupData.settings) {
            this.saveOfflineData('settings', backupData.settings);
          }
          if (backupData.analytics) {
            this.saveOfflineData('analytics-data', backupData.analytics);
          }

          resolve(true);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsText(file);
    });
  }
}

// 전역 PWA 매니저 인스턴스
const pwaManager = new PWAManager();

// 유틸리티 함수들 내보내기
export const installPWA = () => pwaManager.installApp();
export const checkForUpdates = () => pwaManager.checkForUpdates();
export const applyUpdate = () => pwaManager.applyUpdate();
export const requestNotifications = () => pwaManager.requestNotificationPermission();
export const showNotification = (title, options) => pwaManager.showNotification(title, options);
export const getAppInfo = () => pwaManager.getAppInfo();
export const saveOfflineData = (key, data) => pwaManager.saveOfflineData(key, data);
export const loadOfflineData = (key) => pwaManager.loadOfflineData(key);
export const registerBackgroundSync = (tag, data) => pwaManager.registerBackgroundSync(tag, data);
export const clearAppCache = () => pwaManager.clearCache();
export const getStorageUsage = () => pwaManager.getStorageUsage();
export const backupAppData = () => pwaManager.backupAppData();
export const restoreAppData = (file) => pwaManager.restoreAppData(file);

export default pwaManager;
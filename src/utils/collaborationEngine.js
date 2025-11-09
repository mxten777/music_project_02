// Collaboration Engine - 실시간 협업 시스템
export class CollaborationEngine {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.userId = null;
    this.collaborators = new Map();
    this.isConnected = false;
    this.eventHandlers = new Map();
    this.operations = [];
    this.operationCounter = 0;
  }

  // WebSocket 연결 설정
  connect(roomId, userId, userInfo) {
    return new Promise((resolve, reject) => {
      try {
        // 실제 환경에서는 WebSocket 서버 URL 사용
        // 여기서는 시뮬레이션으로 구현
        this.roomId = roomId;
        this.userId = userId;
        this.userInfo = userInfo;
        
        // WebSocket 시뮬레이션
        this.socket = {
          send: (data) => this.simulateMessage(data),
          close: () => this.disconnect(),
          readyState: 1 // OPEN
        };

        this.isConnected = true;
        this.emit('connected', { roomId, userId });
        
        // 초기 협업자 목록 설정
        this.updateCollaborators([
          { id: userId, ...userInfo, isOnline: true, cursor: null }
        ]);

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // 연결 해제
  disconnect() {
    if (this.socket) {
      this.socket = null;
      this.isConnected = false;
      this.collaborators.clear();
      this.emit('disconnected');
    }
  }

  // 실시간 텍스트 편집 동기화
  sendTextOperation(operation) {
    if (!this.isConnected) return;

    const op = {
      id: ++this.operationCounter,
      type: 'text-operation',
      userId: this.userId,
      timestamp: Date.now(),
      operation: {
        type: operation.type, // 'insert', 'delete', 'retain'
        position: operation.position,
        content: operation.content,
        length: operation.length
      },
      documentId: operation.documentId
    };

    this.operations.push(op);
    this.socket.send(JSON.stringify(op));
    this.emit('operation-sent', op);
  }

  // 커서 위치 동기화
  sendCursorUpdate(position, documentId) {
    if (!this.isConnected) return;

    const update = {
      type: 'cursor-update',
      userId: this.userId,
      timestamp: Date.now(),
      position,
      documentId
    };

    this.socket.send(JSON.stringify(update));
  }

  // 협업자 상태 업데이트
  updateCollaborators(collaborators) {
    this.collaborators.clear();
    collaborators.forEach(collab => {
      this.collaborators.set(collab.id, collab);
    });
    this.emit('collaborators-updated', Array.from(this.collaborators.values()));
  }

  // 메시지 수신 시뮬레이션
  simulateMessage(data) {
    // 실제 환경에서는 서버로 전송
    setTimeout(() => {
      try {
        const message = JSON.parse(data);
        this.handleIncomingMessage(message);
      } catch (error) {
        console.error('Message simulation error:', error);
      }
    }, 50 + Math.random() * 100); // 네트워크 지연 시뮬레이션
  }

  // 수신 메시지 처리
  handleIncomingMessage(message) {
    switch (message.type) {
      case 'text-operation':
        if (message.userId !== this.userId) {
          this.emit('remote-operation', message);
        }
        break;
      case 'cursor-update':
        if (message.userId !== this.userId) {
          this.updateCollaboratorCursor(message.userId, message.position, message.documentId);
        }
        break;
      case 'collaborator-joined':
        this.addCollaborator(message.user);
        break;
      case 'collaborator-left':
        this.removeCollaborator(message.userId);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  // 협업자 커서 업데이트
  updateCollaboratorCursor(userId, position, documentId) {
    const collaborator = this.collaborators.get(userId);
    if (collaborator) {
      collaborator.cursor = { position, documentId, timestamp: Date.now() };
      this.emit('cursor-updated', { userId, position, documentId });
    }
  }

  // 협업자 추가
  addCollaborator(user) {
    this.collaborators.set(user.id, { ...user, isOnline: true, cursor: null });
    this.emit('collaborator-joined', user);
    this.emit('collaborators-updated', Array.from(this.collaborators.values()));
  }

  // 협업자 제거
  removeCollaborator(userId) {
    const collaborator = this.collaborators.get(userId);
    if (collaborator) {
      this.collaborators.delete(userId);
      this.emit('collaborator-left', collaborator);
      this.emit('collaborators-updated', Array.from(this.collaborators.values()));
    }
  }

  // 이벤트 핸들러 등록
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  // 이벤트 핸들러 제거
  off(event, handler) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // 이벤트 발생
  emit(event, data) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }

  // 현재 협업자 목록 반환
  getCollaborators() {
    return Array.from(this.collaborators.values());
  }

  // 연결 상태 확인
  isConnectedToRoom() {
    return this.isConnected && this.socket && this.socket.readyState === 1;
  }

  // 운영 변환 (Operational Transformation) 적용
  transformOperation(localOp, remoteOp) {
    // 간단한 OT 구현 - 실제 환경에서는 더 복잡한 로직 필요
    if (localOp.operation.type === 'insert' && remoteOp.operation.type === 'insert') {
      if (remoteOp.operation.position <= localOp.operation.position) {
        localOp.operation.position += remoteOp.operation.content.length;
      }
    } else if (localOp.operation.type === 'delete' && remoteOp.operation.type === 'delete') {
      if (remoteOp.operation.position < localOp.operation.position) {
        localOp.operation.position -= remoteOp.operation.length;
      }
    }
    return localOp;
  }
}

// 공유 관리자
export class ShareManager {
  constructor() {
    this.shares = new Map();
    this.permissions = {
      READ: 'read',
      WRITE: 'write',
      ADMIN: 'admin'
    };
  }

  // 프로젝트 공유 링크 생성
  createShareLink(projectId, permission = 'read', expiresIn = null) {
    const shareId = this.generateShareId();
    const expiry = expiresIn ? new Date(Date.now() + expiresIn) : null;
    
    const shareData = {
      id: shareId,
      projectId,
      permission,
      createdAt: new Date(),
      expiresAt: expiry,
      accessCount: 0,
      isActive: true
    };

    this.shares.set(shareId, shareData);
    
    return {
      shareId,
      url: `${window.location.origin}/shared/${shareId}`,
      ...shareData
    };
  }

  // 공유 링크 검증
  validateShareLink(shareId) {
    const share = this.shares.get(shareId);
    
    if (!share || !share.isActive) {
      return { valid: false, error: 'Share link not found or inactive' };
    }

    if (share.expiresAt && new Date() > share.expiresAt) {
      share.isActive = false;
      return { valid: false, error: 'Share link has expired' };
    }

    share.accessCount++;
    return { valid: true, share };
  }

  // 공유 권한 확인
  checkPermission(shareId, action) {
    const share = this.shares.get(shareId);
    if (!share) return false;

    const permissionLevels = {
      read: ['view'],
      write: ['view', 'edit', 'comment'],
      admin: ['view', 'edit', 'comment', 'share', 'delete']
    };

    return permissionLevels[share.permission]?.includes(action) || false;
  }

  // 공유 링크 비활성화
  revokeShareLink(shareId) {
    const share = this.shares.get(shareId);
    if (share) {
      share.isActive = false;
      return true;
    }
    return false;
  }

  // 공유 ID 생성
  generateShareId() {
    return 'share_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // 프로젝트의 모든 공유 링크 조회
  getProjectShares(projectId) {
    const projectShares = [];
    this.shares.forEach(share => {
      if (share.projectId === projectId) {
        projectShares.push(share);
      }
    });
    return projectShares;
  }
}

// 버전 관리 시스템
export class VersionManager {
  constructor() {
    this.versions = new Map();
    this.branches = new Map();
    this.currentVersion = null;
  }

  // 새 버전 생성
  createVersion(projectId, data, message = '', author) {
    const versionId = this.generateVersionId();
    const timestamp = new Date();
    
    const version = {
      id: versionId,
      projectId,
      data: JSON.parse(JSON.stringify(data)), // 딥 카피
      message,
      author: author || 'Anonymous',
      timestamp,
      parentVersion: this.currentVersion,
      changes: this.calculateChanges(data)
    };

    this.versions.set(versionId, version);
    this.currentVersion = versionId;

    return version;
  }

  // 버전 복원
  restoreVersion(versionId) {
    const version = this.versions.get(versionId);
    if (!version) {
      throw new Error('Version not found');
    }

    this.currentVersion = versionId;
    return JSON.parse(JSON.stringify(version.data));
  }

  // 버전 히스토리 조회
  getVersionHistory(projectId, limit = 50) {
    const projectVersions = [];
    this.versions.forEach(version => {
      if (version.projectId === projectId) {
        projectVersions.push({
          id: version.id,
          message: version.message,
          author: version.author,
          timestamp: version.timestamp,
          changes: version.changes
        });
      }
    });

    return projectVersions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // 변경사항 계산
  calculateChanges() {
    // 간단한 변경사항 요약
    const changes = {
      songsModified: Math.floor(Math.random() * 3),
      albumsModified: Math.floor(Math.random() * 2),
      newSongs: Math.floor(Math.random() * 2),
      deletedSongs: 0
    };

    // 실제 구현에서는 더 정교한 diff 알고리즘 사용
    return changes;
  }

  // 버전 ID 생성
  generateVersionId() {
    return 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
  }
}

// 싱글톤 인스턴스 생성
export const collaborationEngine = new CollaborationEngine();
export const shareManager = new ShareManager();
export const versionManager = new VersionManager();
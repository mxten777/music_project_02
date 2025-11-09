// 댓글 및 피드백 시스템
export class CommentSystem {
  constructor() {
    this.comments = new Map();
    this.threads = new Map();
    this.reactions = new Map();
    this.commentCounter = 0;
  }

  // 댓글 추가
  addComment(data) {
    const commentId = ++this.commentCounter;
    const timestamp = new Date();
    
    const comment = {
      id: commentId,
      projectId: data.projectId,
      songId: data.songId || null,
      parentId: data.parentId || null,
      author: data.author,
      content: data.content,
      timestamp,
      position: data.position || null, // 텍스트 위치 또는 시간 위치
      type: data.type || 'text', // 'text', 'audio', 'suggestion'
      isResolved: false,
      reactions: new Map(),
      mentions: data.mentions || []
    };

    this.comments.set(commentId, comment);

    // 스레드 관리
    if (comment.parentId) {
      if (!this.threads.has(comment.parentId)) {
        this.threads.set(comment.parentId, []);
      }
      this.threads.get(comment.parentId).push(commentId);
    }

    return comment;
  }

  // 댓글 수정
  updateComment(commentId, content, editedBy) {
    const comment = this.comments.get(commentId);
    if (!comment) return null;

    comment.content = content;
    comment.editedAt = new Date();
    comment.editedBy = editedBy;

    return comment;
  }

  // 댓글 삭제
  deleteComment(commentId) {
    const comment = this.comments.get(commentId);
    if (!comment) return false;

    // 대댓글이 있는 경우 내용만 삭제
    const hasReplies = this.threads.has(commentId) && this.threads.get(commentId).length > 0;
    
    if (hasReplies) {
      comment.content = '[삭제된 댓글입니다]';
      comment.isDeleted = true;
    } else {
      this.comments.delete(commentId);
      
      // 부모 댓글의 스레드에서 제거
      if (comment.parentId && this.threads.has(comment.parentId)) {
        const siblings = this.threads.get(comment.parentId);
        const index = siblings.indexOf(commentId);
        if (index > -1) {
          siblings.splice(index, 1);
        }
      }
    }

    return true;
  }

  // 댓글 해결 상태 변경
  resolveComment(commentId, isResolved = true) {
    const comment = this.comments.get(commentId);
    if (!comment) return false;

    comment.isResolved = isResolved;
    comment.resolvedAt = isResolved ? new Date() : null;

    return true;
  }

  // 리액션 추가/제거
  toggleReaction(commentId, userId, emoji) {
    const comment = this.comments.get(commentId);
    if (!comment) return false;

    const reactionKey = `${userId}_${emoji}`;
    
    if (comment.reactions.has(reactionKey)) {
      comment.reactions.delete(reactionKey);
    } else {
      comment.reactions.set(reactionKey, {
        userId,
        emoji,
        timestamp: new Date()
      });
    }

    return true;
  }

  // 프로젝트의 모든 댓글 조회
  getProjectComments(projectId, includeResolved = true) {
    const projectComments = [];
    
    this.comments.forEach(comment => {
      if (comment.projectId === projectId) {
        if (includeResolved || !comment.isResolved) {
          projectComments.push(this.formatComment(comment));
        }
      }
    });

    return projectComments.sort((a, b) => a.timestamp - b.timestamp);
  }

  // 특정 곡의 댓글 조회
  getSongComments(projectId, songId, includeResolved = true) {
    const songComments = [];
    
    this.comments.forEach(comment => {
      if (comment.projectId === projectId && comment.songId === songId) {
        if (includeResolved || !comment.isResolved) {
          songComments.push(this.formatComment(comment));
        }
      }
    });

    return songComments.sort((a, b) => a.timestamp - b.timestamp);
  }

  // 댓글 스레드 조회
  getCommentThread(commentId) {
    const mainComment = this.comments.get(commentId);
    if (!mainComment) return null;

    const thread = [this.formatComment(mainComment)];
    const replies = this.threads.get(commentId) || [];
    
    replies.forEach(replyId => {
      const reply = this.comments.get(replyId);
      if (reply) {
        thread.push(this.formatComment(reply));
      }
    });

    return thread;
  }

  // 댓글 포맷팅
  formatComment(comment) {
    return {
      id: comment.id,
      projectId: comment.projectId,
      songId: comment.songId,
      parentId: comment.parentId,
      author: comment.author,
      content: comment.content,
      timestamp: comment.timestamp,
      editedAt: comment.editedAt,
      editedBy: comment.editedBy,
      position: comment.position,
      type: comment.type,
      isResolved: comment.isResolved,
      resolvedAt: comment.resolvedAt,
      isDeleted: comment.isDeleted || false,
      reactions: Array.from(comment.reactions.values()),
      mentions: comment.mentions,
      repliesCount: this.threads.has(comment.id) ? this.threads.get(comment.id).length : 0
    };
  }

  // 멘션된 사용자 추출
  extractMentions(content) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  }

  // 댓글 검색
  searchComments(projectId, query) {
    const results = [];
    
    this.comments.forEach(comment => {
      if (comment.projectId === projectId && 
          comment.content.toLowerCase().includes(query.toLowerCase())) {
        results.push(this.formatComment(comment));
      }
    });

    return results;
  }
}

// 클라우드 동기화 시스템
export class CloudSyncManager {
  constructor() {
    this.syncQueue = [];
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.syncInterval = null;
    this.conflictResolution = 'latest'; // 'latest', 'manual', 'merge'
  }

  // 자동 동기화 시작
  startAutoSync(intervalMs = 30000) {
    this.stopAutoSync();
    
    this.syncInterval = setInterval(async () => {
      await this.sync();
    }, intervalMs);
  }

  // 자동 동기화 중지
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // 동기화 실행
  async sync() {
    if (this.isSyncing) return;

    this.isSyncing = true;
    
    try {
      // 로컬 변경사항 업로드
      await this.uploadLocalChanges();
      
      // 원격 변경사항 다운로드
      await this.downloadRemoteChanges();
      
      this.lastSyncTime = new Date();
      this.emitSyncEvent('sync-completed', { timestamp: this.lastSyncTime });
      
    } catch (error) {
      console.error('Sync failed:', error);
      this.emitSyncEvent('sync-failed', { error });
    } finally {
      this.isSyncing = false;
    }
  }

  // 로컬 변경사항 업로드
  async uploadLocalChanges() {
    const pendingChanges = this.getPendingChanges();
    
    for (const change of pendingChanges) {
      try {
        await this.uploadChange(change);
        this.markChangeAsSynced(change.id);
      } catch (error) {
        console.error('Failed to upload change:', change.id, error);
      }
    }
  }

  // 원격 변경사항 다운로드
  async downloadRemoteChanges() {
    try {
      const remoteChanges = await this.fetchRemoteChanges();
      
      for (const change of remoteChanges) {
        await this.applyRemoteChange(change);
      }
    } catch (error) {
      console.error('Failed to download remote changes:', error);
    }
  }

  // 변경사항 대기열에 추가
  queueChange(type, data) {
    const changeId = this.generateChangeId();
    
    const change = {
      id: changeId,
      type, // 'create', 'update', 'delete'
      data,
      timestamp: new Date(),
      synced: false,
      retryCount: 0
    };

    this.syncQueue.push(change);
    
    // 즉시 동기화 시도 (디바운스된)
    this.debouncedSync();
    
    return changeId;
  }

  // 대기 중인 변경사항 조회
  getPendingChanges() {
    return this.syncQueue.filter(change => !change.synced);
  }

  // 변경사항 업로드 (시뮬레이션)
  async uploadChange(change) {
    // 실제 환경에서는 API 호출
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Uploaded change:', change.id);
        resolve();
      }, 100 + Math.random() * 200);
    });
  }

  // 원격 변경사항 가져오기 (시뮬레이션)
  async fetchRemoteChanges() {
    // 실제 환경에서는 API 호출
    return new Promise((resolve) => {
      setTimeout(() => {
        // 시뮬레이션 데이터
        resolve([]);
      }, 100);
    });
  }

  // 원격 변경사항 적용
  async applyRemoteChange(change) {
    try {
      // 충돌 감지 및 해결
      const conflict = this.detectConflict(change);
      
      if (conflict) {
        await this.resolveConflict(conflict, change);
      } else {
        await this.applyChange(change);
      }
    } catch (error) {
      console.error('Failed to apply remote change:', error);
    }
  }

  // 충돌 감지
  detectConflict(remoteChange) {
    // 같은 리소스에 대한 로컬 변경사항이 있는지 확인
    const conflictingChange = this.syncQueue.find(localChange => 
      localChange.data.id === remoteChange.data.id &&
      localChange.timestamp > remoteChange.timestamp &&
      !localChange.synced
    );

    return conflictingChange ? { local: conflictingChange, remote: remoteChange } : null;
  }

  // 충돌 해결
  async resolveConflict(conflict, remoteChange) {
    switch (this.conflictResolution) {
      case 'latest':
        // 최신 변경사항 적용
        if (conflict.local.timestamp > remoteChange.timestamp) {
          // 로컬 변경사항 유지
          console.log('Keeping local change due to later timestamp');
        } else {
          await this.applyChange(remoteChange);
        }
        break;
        
      case 'manual':
        // 사용자에게 수동 해결 요청
        this.emitSyncEvent('conflict-detected', conflict);
        break;
        
      case 'merge': {
        // 자동 병합 시도
        const merged = await this.mergeChanges(conflict.local, remoteChange);
        await this.applyChange(merged);
        break;
      }
    }
  }

  // 변경사항 병합
  async mergeChanges(localChange, remoteChange) {
    // 간단한 병합 로직 - 실제 환경에서는 더 복잡한 병합 알고리즘 필요
    return {
      ...remoteChange,
      data: {
        ...remoteChange.data,
        ...localChange.data,
        mergedAt: new Date()
      }
    };
  }

  // 변경사항 적용
  async applyChange(change) {
    // 로컬 스토리지나 상태에 변경사항 적용
    const event = new CustomEvent('sync-change-applied', { 
      detail: change 
    });
    window.dispatchEvent(event);
  }

  // 변경사항 ID 생성
  generateChangeId() {
    return 'change_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
  }

  // 변경사항을 동기화 완료로 표시
  markChangeAsSynced(changeId) {
    const change = this.syncQueue.find(c => c.id === changeId);
    if (change) {
      change.synced = true;
    }
  }

  // 디바운스된 동기화
  debouncedSync = this.debounce(async () => {
    await this.sync();
  }, 1000);

  // 디바운스 헬퍼
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 동기화 이벤트 발생
  emitSyncEvent(type, data) {
    const event = new CustomEvent(`cloud-sync-${type}`, { 
      detail: data 
    });
    window.dispatchEvent(event);
  }

  // 동기화 상태 조회
  getSyncStatus() {
    return {
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      pendingChanges: this.getPendingChanges().length,
      totalChanges: this.syncQueue.length
    };
  }
}

// 싱글톤 인스턴스
export const commentSystem = new CommentSystem();
export const cloudSyncManager = new CloudSyncManager();
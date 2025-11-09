import React, { useState, useEffect, useCallback } from 'react';
import { collaborationEngine, shareManager, versionManager } from '../utils/collaborationEngine';
import { commentSystem, cloudSyncManager } from '../utils/commentSystem';

// 실시간 협업 컴포넌트
export const CollaborationPanel = ({ projectId, currentUser }) => {
  const [_isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    const initializeCollaboration = async () => {
      try {
        setConnectionStatus('connecting');
        await collaborationEngine.connect(
          `project_${projectId}`,
          currentUser.id,
          {
            name: currentUser.name,
            avatar: currentUser.avatar,
            color: getRandomColor()
          }
        );
        setIsConnected(true);
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Failed to connect to collaboration:', error);
        setConnectionStatus('error');
      }
    };

    if (projectId && currentUser) {
      initializeCollaboration();
    }

    // 이벤트 리스너 설정
    const handleCollaboratorsUpdate = (collaborators) => {
      setCollaborators(collaborators);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };

    collaborationEngine.on('collaborators-updated', handleCollaboratorsUpdate);
    collaborationEngine.on('disconnected', handleDisconnected);

    return () => {
      collaborationEngine.off('collaborators-updated', handleCollaboratorsUpdate);
      collaborationEngine.off('disconnected', handleDisconnected);
      collaborationEngine.disconnect();
    };
  }, [projectId, currentUser]);

  const getRandomColor = () => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>;
      case 'connecting':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full animate-spin"></div>;
      case 'error':
        return <div className="w-2 h-2 bg-red-400 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getConnectionStatusIcon()}
          <h3 className="text-white font-semibold">실시간 협업</h3>
        </div>
        <button
          onClick={() => setShowShareDialog(true)}
          className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
        >
          공유
        </button>
      </div>

      {/* 협업자 목록 */}
      <div className="space-y-2 mb-4">
        <h4 className="text-gray-300 text-sm font-medium">협업자 ({collaborators.length})</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {collaborators.map(collaborator => (
            <div key={collaborator.id} className="flex items-center space-x-2 p-2 bg-white/5 rounded-lg">
              <div
                className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold"
                style={{ backgroundColor: collaborator.color }}
              >
                {collaborator.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{collaborator.name}</p>
                <p className="text-gray-400 text-xs">
                  {collaborator.isOnline ? '온라인' : '오프라인'}
                </p>
              </div>
              {collaborator.cursor && (
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 연결 상태 정보 */}
      <div className="text-xs text-gray-400">
        상태: {connectionStatus === 'connected' ? '연결됨' : 
               connectionStatus === 'connecting' ? '연결 중...' :
               connectionStatus === 'error' ? '연결 오류' : '연결 끊김'}
      </div>

      {showShareDialog && (
        <ShareDialog
          projectId={projectId}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </div>
  );
};

// 공유 다이얼로그
export const ShareDialog = ({ projectId, onClose }) => {
  const [shareLinks, setShareLinks] = useState([]);
  const [newLinkPermission, setNewLinkPermission] = useState('read');
  const [expiryDays, setExpiryDays] = useState(0);

  const loadShareLinks = useCallback(() => {
    const links = shareManager.getProjectShares(projectId);
    setShareLinks(links);
  }, [projectId]);

  useEffect(() => {
    loadShareLinks();
  }, [loadShareLinks]);

  const createShareLink = () => {
    const expiresIn = expiryDays > 0 ? expiryDays * 24 * 60 * 60 * 1000 : null;
    const shareData = shareManager.createShareLink(projectId, newLinkPermission, expiresIn);
    setShareLinks([...shareLinks, shareData]);
  };

  const revokeLink = (shareId) => {
    shareManager.revokeShareLink(shareId);
    loadShareLinks();
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    // TODO: 토스트 알림 추가
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-lg mx-4 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">프로젝트 공유</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 새 링크 생성 */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h4 className="text-white font-medium mb-3">새 공유 링크 생성</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-gray-300 text-sm mb-1">권한</label>
              <select
                value={newLinkPermission}
                onChange={(e) => setNewLinkPermission(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
              >
                <option value="read">읽기 전용</option>
                <option value="write">편집 가능</option>
                <option value="admin">관리자</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">만료 기간</label>
              <select
                value={expiryDays}
                onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
              >
                <option value={0}>만료 없음</option>
                <option value={1}>1일</option>
                <option value={7}>7일</option>
                <option value={30}>30일</option>
              </select>
            </div>
            <button
              onClick={createShareLink}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 transition-colors"
            >
              링크 생성
            </button>
          </div>
        </div>

        {/* 기존 링크 목록 */}
        <div>
          <h4 className="text-white font-medium mb-3">기존 공유 링크</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {shareLinks.map(link => (
              <div key={link.id} className="p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-300 text-sm font-medium">
                    {link.permission === 'read' ? '읽기' : 
                     link.permission === 'write' ? '편집' : '관리자'}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(link.url)}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      복사
                    </button>
                    <button
                      onClick={() => revokeLink(link.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      취소
                    </button>
                  </div>
                </div>
                <div className="text-gray-400 text-xs space-y-1">
                  <p>접근 횟수: {link.accessCount}</p>
                  <p>생성일: {link.createdAt.toLocaleDateString()}</p>
                  {link.expiresAt && (
                    <p>만료일: {link.expiresAt.toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 댓글 시스템 컴포넌트
export const CommentPanel = ({ projectId, songId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showResolved, setShowResolved] = useState(false);

  const loadComments = useCallback(() => {
    const commentList = songId 
      ? commentSystem.getSongComments(projectId, songId, showResolved)
      : commentSystem.getProjectComments(projectId, showResolved);
    setComments(commentList);
  }, [projectId, songId, showResolved]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const addComment = () => {
    if (!newComment.trim()) return;

    const mentions = commentSystem.extractMentions(newComment);
    
    commentSystem.addComment({
      projectId,
      songId,
      parentId: replyTo,
      author: currentUser,
      content: newComment,
      mentions
    });

    setNewComment('');
    setReplyTo(null);
    loadComments();
  };

  const toggleReaction = (commentId, emoji) => {
    commentSystem.toggleReaction(commentId, currentUser.id, emoji);
    loadComments();
  };

  const resolveComment = (commentId, isResolved) => {
    commentSystem.resolveComment(commentId, isResolved);
    loadComments();
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">댓글</h3>
        <label className="flex items-center space-x-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="rounded"
          />
          <span>해결된 댓글 표시</span>
        </label>
      </div>

      {/* 새 댓글 작성 */}
      <div className="mb-4">
        {replyTo && (
          <div className="mb-2 p-2 bg-blue-500/20 rounded-lg text-blue-300 text-sm">
            답글 작성 중... 
            <button
              onClick={() => setReplyTo(null)}
              className="ml-2 text-blue-400 hover:text-blue-300"
            >
              취소
            </button>
          </div>
        )}
        <div className="flex space-x-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyTo ? "답글 작성..." : "댓글 작성..."}
            className="flex-1 bg-gray-800/50 text-white rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-purple-500 border border-gray-600"
            rows="2"
          />
          <button
            onClick={addComment}
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            전송
          </button>
        </div>
      </div>

      {/* 댓글 목록 */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUser={currentUser}
            onReply={setReplyTo}
            onReaction={toggleReaction}
            onResolve={resolveComment}
          />
        ))}
      </div>
    </div>
  );
};

// 개별 댓글 아이템
const CommentItem = ({ comment, onReply, onReaction, onResolve }) => {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div 
      className={`p-3 rounded-lg ${comment.isResolved ? 'bg-green-500/10' : 'bg-gray-800/30'} ${comment.parentId ? 'ml-6' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {comment.author.name.charAt(0)}
          </div>
          <div>
            <p className="text-white font-medium text-sm">{comment.author.name}</p>
            <p className="text-gray-400 text-xs">{formatTime(comment.timestamp)}</p>
          </div>
        </div>
        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={() => onReply(comment.id)}
              className="text-gray-400 hover:text-blue-300 text-xs"
            >
              답글
            </button>
            <button
              onClick={() => onResolve(comment.id, !comment.isResolved)}
              className="text-gray-400 hover:text-green-300 text-xs"
            >
              {comment.isResolved ? '재개' : '해결'}
            </button>
          </div>
        )}
      </div>

      <div className="mb-2">
        <p className="text-gray-200 text-sm whitespace-pre-wrap">{comment.content}</p>
        {comment.editedAt && (
          <p className="text-gray-500 text-xs mt-1">편집됨</p>
        )}
      </div>

      {/* 리액션 */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1">
          {['👍', '👎', '❤️', '😊', '🎵'].map(emoji => (
            <button
              key={emoji}
              onClick={() => onReaction(comment.id, emoji)}
              className="px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 rounded text-sm transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
        {comment.repliesCount > 0 && (
          <span className="text-gray-400 text-xs">
            답글 {comment.repliesCount}개
          </span>
        )}
      </div>
    </div>
  );
};

// 버전 히스토리 컴포넌트
export const VersionHistory = ({ projectId }) => {
  const [versions, setVersions] = useState([]);
  const [_currentVersion, setCurrentVersion] = useState(null);

  const loadVersionHistory = useCallback(() => {
    const history = versionManager.getVersionHistory(projectId);
    setVersions(history);
  }, [projectId]);

  useEffect(() => {
    loadVersionHistory();
  }, [loadVersionHistory]);

  const restoreVersion = async (versionId) => {
    try {
      const restoredData = versionManager.restoreVersion(versionId);
      setCurrentVersion(versionId);
      
      // 복원된 데이터를 애플리케이션에 적용
      const event = new CustomEvent('version-restored', {
        detail: { versionId, data: restoredData }
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('Failed to restore version:', error);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
      <h3 className="text-white font-semibold mb-4">버전 히스토리</h3>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {versions.map(version => (
          <div key={version.id} className="p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-white font-medium text-sm">
                  {version.message || '자동 저장'}
                </p>
                <p className="text-gray-400 text-xs">
                  {version.author} · {new Date(version.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => restoreVersion(version.id)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
              >
                복원
              </button>
            </div>
            <div className="text-gray-300 text-xs">
              곡 수정: {version.changes.songsModified} · 
              새 곡: {version.changes.newSongs} · 
              삭제: {version.changes.deletedSongs}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 클라우드 동기화 상태 표시
export const SyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    const updateStatus = () => {
      setSyncStatus(cloudSyncManager.getSyncStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);

    // 동기화 이벤트 리스너
    const handleSyncCompleted = () => updateStatus();
    const handleSyncFailed = (event) => {
      console.error('Sync failed:', event.detail.error);
      updateStatus();
    };

    window.addEventListener('cloud-sync-sync-completed', handleSyncCompleted);
    window.addEventListener('cloud-sync-sync-failed', handleSyncFailed);

    return () => {
      clearInterval(interval);
      window.removeEventListener('cloud-sync-sync-completed', handleSyncCompleted);
      window.removeEventListener('cloud-sync-sync-failed', handleSyncFailed);
    };
  }, []);

  if (!syncStatus) return null;

  return (
    <div className="flex items-center space-x-2 text-sm">
      {syncStatus.isSyncing ? (
        <>
          <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-300">동기화 중...</span>
        </>
      ) : (
        <>
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span className="text-green-300">
            {syncStatus.lastSyncTime ? 
              `${new Date(syncStatus.lastSyncTime).toLocaleTimeString()} 동기화됨` : 
              '동기화 준비 완료'}
          </span>
        </>
      )}
      {syncStatus.pendingChanges > 0 && (
        <span className="text-yellow-300">
          ({syncStatus.pendingChanges}개 대기 중)
        </span>
      )}
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import { useFeed } from '../contexts/FeedContext';
import { useAuth } from '../contexts/AuthContext';
import './Notifications.css';

const client = generateClient();

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const { users, posts, toggleFollow, follows } = useFeed();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [dragState, setDragState] = useState({ id: null, startX: 0, currentX: 0 });

    useEffect(() => {
        if (!currentUser?.id) return;
        const sub = client.models.Notification.observeQuery({
            filter: { recipientId: { eq: currentUser.id } }
        }).subscribe({
            next: ({ items }) => {
                const sorted = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setNotifications(sorted);
            },
            error: (e) => console.error("Error syncing notifications:", e)
        });
        return () => sub.unsubscribe();
    }, [currentUser?.id]);

    const getRelativeTime = (timeStr) => {
        if (!timeStr) return '';
        const diffMin = Math.round((new Date() - new Date(timeStr)) / 60000);
        return diffMin < 60 ? `${diffMin}m` : diffMin < 1440 ? `${Math.floor(diffMin/60)}h` : `${Math.floor(diffMin/1440)}d`;
    };

    const handleTouchStart = (e, id) => {
        setDragState({ id, startX: e.touches[0].clientX, currentX: e.touches[0].clientX });
    };

    const handleTouchMove = (e, id) => {
        if (dragState.id !== id) return;
        setDragState(prev => ({ ...prev, currentX: e.touches[0].clientX }));
    };

    const handleTouchEnd = async (e, id) => {
        if (dragState.id !== id) return;
        const diff = dragState.currentX - dragState.startX;
        if (diff < -75) {
            try {
                await client.models.Notification.delete({ id });
            } catch(err) {
                console.error("Failed to delete notification", err);
            }
        }
        setDragState({ id: null, startX: 0, currentX: 0 });
    };

    const today = notifications.filter(n => { const t = getRelativeTime(n.createdAt); return t && (t.includes('m') || t.includes('h')); });
    const older = notifications.filter(n => { const t = getRelativeTime(n.createdAt); return t && !t.includes('m') && !t.includes('h'); });

    const renderNotification = (note) => {
        const sender = users[note.senderId];
        const post = posts.find(p => p.id === note.targetId);
        const isFollowing = follows.some(f => f.followingId === note.senderId);
        
        const isDragging = dragState.id === note.id;
        const translateX = isDragging ? Math.min(0, Math.max(-100, dragState.currentX - dragState.startX)) : 0;
        
        return (
            <div key={note.id} className="notification-swipe-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
                <div 
                    className="notification-delete-bg" 
                    style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '100%', backgroundColor: '#ed4956', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '20px', color: 'white', fontSize: '14px', fontWeight: 'bold' }}
                >
                    <span>Delete</span>
                </div>
                
                <div 
                    className={`notification-item ${!note.isRead ? 'unread' : ''}`}
                    onTouchStart={(e) => handleTouchStart(e, note.id)}
                    onTouchMove={(e) => handleTouchMove(e, note.id)}
                    onTouchEnd={(e) => handleTouchEnd(e, note.id)}
                    style={{ 
                        transform: `translateX(${translateX}px)`, 
                        transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        position: 'relative',
                        zIndex: 1,
                        backgroundColor: 'var(--bg-color)',
                        width: '100%'
                    }}
                >
                    <div className="notification-user" onClick={() => sender && navigate(`/profile/${sender.username}`)} style={{cursor: 'pointer'}}>
                        <img src={sender?.avatarUrl || sender?.avatar || '/default-avatar.png'} alt={sender?.username || 'User'} className="notification-avatar" />
                        <div className="notification-content">
                            <span className="notification-username">{sender?.username || 'Unknown'}</span>
                            <span className="notification-text">
                               {note.type === 'like' && ' liked your post.'}
                               {note.type === 'follow' && ' started following you.'}
                               {note.type === 'comment' && ` commented: "${note.text}"`}
                               {note.type === 'message' && ` sent you a message: "${note.text}"`}
                            </span>
                            <span className="notification-time">{getRelativeTime(note.createdAt)}</span>
                        </div>
                    </div>
                    
                    {post && note.type !== 'follow' && (
                        <img src={post.imageUrl} onClick={() => navigate(`/post/${post.id}`)} alt="Post content" className="notification-post-thumb" style={{cursor: 'pointer'}} />
                    )}
                    
                    {note.type === 'follow' && sender && sender.id !== 'ben' && (
                        <button 
                            className={isFollowing ? "btn-secondary follow-btn" : "btn-primary follow-btn"}
                            onClick={() => toggleFollow(sender.id)}
                        >
                            {isFollowing ? 'Unfollow' : 'Follow'}
                        </button>
                    )}
                </div>
            </div>
        );
    };

  return (
    <div className="notifications-container" style={{ overflowX: 'hidden' }}>
      <h2>Notifications</h2>
      
      {today.length > 0 && (
          <div className="notification-group">
            <h3>Today</h3>
            {today.map(renderNotification)}
          </div>
      )}

      {older.length > 0 && (
          <div className="notification-group">
            <h3>Yesterday / Older</h3>
            {older.map(renderNotification)}
          </div>
      )}
      
      {notifications.length === 0 && (
          <div style={{color: '#8e8e8e', marginTop: '20px', textAlign: 'center'}}>No notifications yet.</div>
      )}
    </div>
  );
};

export default Notifications;

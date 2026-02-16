import React from 'react';
import { Heart, UserPlus, MessageCircle } from 'lucide-react';
import './Notifications.css';

const Notifications = () => {
    // Hardcoded mock notifications for now
    const notifications = [
        {
            id: 1,
            type: 'like',
            user: { username: 'ben_admirer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ben1' },
            text: 'liked your photo.',
            postImage: '/ben-post-general-1.jpeg',
            time: '2m',
            isNew: true
        },
        {
            id: 2,
            type: 'follow',
            user: { username: 'dog_lover_99', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dog99' },
            text: 'started following you.',
            time: '1h',
            isNew: true
        },
        {
            id: 3,
            type: 'comment',
            user: { username: 'not_ben', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=noben' },
            text: 'commented: "So regal."',
            postImage: '/ben-post-general-1.jpeg',
            time: '3h',
            isNew: false
        },
        {
            id: 4,
            type: 'like',
            user: { username: 'cat_hater_official', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cat' },
            text: 'liked your comment: "Ew. What is that? A rat?..."',
            time: '1d',
            isNew: false
        }
    ];

    const today = notifications.filter(n => n.time.includes('m') || n.time.includes('h'));
    const yesterday = notifications.filter(n => n.time.includes('d'));

    const renderNotification = (note) => (
        <div key={note.id} className={`notification-item ${note.isNew ? 'unread' : ''}`}>
            <div className="notification-user">
                <img src={note.user.avatar} alt={note.user.username} className="notification-avatar" />
                <div className="notification-content">
                    <span className="notification-username">{note.user.username}</span>
                    <span className="notification-text"> {note.text}</span>
                    <span className="notification-time">{note.time}</span>
                </div>
            </div>
            
            {note.postImage && (
                <img src={note.postImage} alt="Post content" className="notification-post-thumb" />
            )}
            
            {note.type === 'follow' && (
                <button className="follow-btn">Follow</button>
            )}
        </div>
    );

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      
      <div className="notification-group">
        <h3>Today</h3>
        {today.map(renderNotification)}
      </div>

      <div className="notification-group">
        <h3>Yesterday</h3>
        {yesterday.map(renderNotification)}
      </div>
    </div>
  );
};

export default Notifications;

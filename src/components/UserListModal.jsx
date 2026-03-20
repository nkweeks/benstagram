import React from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFeed } from '../contexts/FeedContext';
import { useAuth } from '../contexts/AuthContext';
import './UserListModal.css';

const UserListModal = ({ isOpen, onClose, title, userIds }) => {
  const navigate = useNavigate();
  const { users, follows, toggleFollow } = useFeed();
  const { user: currentUser } = useAuth();
  
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container user-list-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="modal-body user-list-body">
          {userIds.length === 0 ? (
            <div className="empty-state">No users to show.</div>
          ) : (
            userIds.map(id => {
              const u = users[id];
              if (!u) return null;
              
              const isFollowing = follows.some(f => f.followerId === currentUser?.id && f.followingId === id);
              const isSelf = currentUser?.id === id;

              return (
                <div key={id} className="user-list-item">
                  <div 
                    className="user-list-info" 
                    onClick={() => {
                        navigate(`/profile/${u.username}`);
                        onClose();
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={u.avatarUrl || u.avatar || '/default-avatar.png'} alt={u.username} />
                    <div className="user-list-names">
                       <span className="user-list-username">{u.username}</span>
                       {u.fullName && <span className="user-list-fullname">{u.fullName}</span>}
                    </div>
                  </div>
                  {!isSelf && id !== 'ben' && (
                    <button 
                      className={`btn-${isFollowing ? 'secondary' : 'primary'} follow-btn-small`}
                      onClick={() => toggleFollow(id)}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListModal;

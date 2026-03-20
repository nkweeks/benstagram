import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, Bookmark, User as UserIcon, Edit2, Check, X } from 'lucide-react';
import { useFeed } from '../contexts/FeedContext';
import { useAuth } from '../contexts/AuthContext';
import { generateClient } from 'aws-amplify/data';
import UserListModal from '../components/UserListModal';
import './Profile.css';

const client = generateClient();

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { users, posts, currentUser, follows, toggleFollow, isDataReady } = useFeed();
  const { updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('POSTS');
  
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [modalState, setModalState] = useState({ isOpen: false, type: null, userIds: [] });
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    fullName: '',
    bio: ''
  });
  
  // Find user by username
  let profileUser = Object.values(users).find(u => u.username === username);
  
  // Prefer currentUser object if this is the logged-in user, because it has pre-resolved avatarUrl
  if (currentUser && currentUser.username === username) {
      profileUser = currentUser;
  } else if (!profileUser && currentUser?.username === username) {
      profileUser = currentUser;
  }
  
  useEffect(() => {
    if (!profileUser?.id) return;
    
    const subFollowers = client.models.Follow.observeQuery({ filter: { followingId: { eq: profileUser.id } } }).subscribe({
        next: ({ items }) => setFollowerCount(items.length)
    });

    const subFollowing = client.models.Follow.observeQuery({ filter: { followerId: { eq: profileUser.id } } }).subscribe({
        next: ({ items }) => setFollowingCount(items.length)
    });

    return () => {
        subFollowers.unsubscribe();
        subFollowing.unsubscribe();
    };
  }, [profileUser?.id]);

  if (!isDataReady) return <div className="profile-container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading profile...</div>;
  if (!profileUser) return <div className="profile-container">User not found</div>;

  const isCurrentUser = currentUser?.id === profileUser.id;
  const isFollowing = follows.some(f => f.followingId === profileUser.id);

  const handleEditClick = () => {
    setEditForm({
      username: profileUser.username || '',
      fullName: profileUser.fullName || '',
      bio: profileUser.bio || ''
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (updateUser) {
      const updates = { ...editForm };
      
      // Don't update username if it's an empty string
      if (!updates.username.trim()) {
        delete updates.username;
      }
      
      await updateUser(updates);
      
      // If username changed successfully, redirect to the new URL
      if (updates.username && updates.username !== profileUser.username) {
          navigate(`/profile/${updates.username}`);
      }
    }
    setIsEditing(false);
  };

  // Filter posts based on active tab
  let displayPosts = [];
  if (activeTab === 'POSTS') {
      displayPosts = posts.filter(p => p.userId === profileUser?.id);
  } else if (activeTab === 'SAVED' && isCurrentUser) {
      displayPosts = posts.filter(p => (profileUser.savedPostIds || []).includes(p.id));
  } else if (activeTab === 'TAGGED') {
      // Find posts where the caption contains @username
      // Escape username to safely use in regex
      const escapedUsername = profileUser.username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const tagRegex = new RegExp(`@${escapedUsername}\\b`, 'i');
      displayPosts = posts.filter(p => p.caption && tagRegex.test(p.caption));
  }
  
  // Helper to count posts without filtering
  const userPostCount = posts.filter(p => p.userId === profileUser?.id).length;

  const followersList = follows.filter(f => f.followingId === profileUser?.id).map(f => f.followerId);
  const followingList = follows.filter(f => f.followerId === profileUser?.id).map(f => f.followingId);

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div className="profile-avatar-container">
          <img 
            src={profileUser.avatarUrl || profileUser.avatar || '/default-avatar.png'} 
            alt={profileUser.username} 
            className="profile-avatar-img" 
            onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
          />
        </div>
        
        <section className="profile-details">
          {isEditing ? (
            <div className="profile-edit-form">
              <div className="edit-form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  value={editForm.username} 
                  onChange={e => setEditForm({...editForm, username: e.target.value})}
                  className="edit-input"
                  maxLength={30}
                />
              </div>
              <div className="edit-form-actions">
                <button onClick={handleSaveEdit} className="btn-primary edit-save-icon" title="Save">Save</button>
                <button onClick={handleCancelEdit} className="btn-secondary edit-cancel-icon" title="Cancel">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="profile-title-row">
              <h2 className="profile-username">{profileUser.username}</h2>
              <div className="profile-actions">
                {isCurrentUser ? (
                   <button className="btn-secondary" onClick={handleEditClick}>Edit Profile</button>
                ) : (
                  <>
                    <button 
                        className={isFollowing ? "btn-secondary" : "btn-primary"}
                        onClick={() => toggleFollow(profileUser.id)}
                    >
                        {isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                    <button className="btn-secondary" onClick={() => navigate('/messages')}>Message</button>
                  </>
                )}
              </div>
            </div>
          )}

          <ul className="profile-stats">
            <li><strong>{userPostCount}</strong> posts</li>
            <li onClick={() => setModalState({ isOpen: true, type: 'Followers', userIds: followersList })} style={{ cursor: 'pointer' }}><strong>{followerCount.toLocaleString()}</strong> followers</li>
            <li onClick={() => setModalState({ isOpen: true, type: 'Following', userIds: followingList })} style={{ cursor: 'pointer' }}><strong>{followingCount.toLocaleString()}</strong> following</li>
          </ul>

          <div className="profile-bio">
            {isEditing ? (
              <>
                <input 
                  type="text" 
                  value={editForm.fullName} 
                  onChange={e => setEditForm({...editForm, fullName: e.target.value})}
                  className="edit-input bio-name-input"
                  placeholder="Full Name"
                  maxLength={30}
                />
                <textarea 
                  value={editForm.bio} 
                  onChange={e => setEditForm({...editForm, bio: e.target.value})}
                  className="edit-input bio-text-input"
                  placeholder="Bio"
                  rows={3}
                  maxLength={150}
                />
              </>
            ) : (
              <>
                <div className="bio-name">{profileUser.fullName}</div>
                <div className="bio-text">
                  {profileUser.bio}
                </div>
              </>
            )}
          </div>
        </section>
      </header>

      <div className="profile-tabs">
        <button 
            className={`tab-item ${activeTab === 'POSTS' ? 'active' : ''}`}
            onClick={() => setActiveTab('POSTS')}
        >
          <Grid size={12} />
          <span>POSTS</span>
        </button>
        {isCurrentUser && (
            <button 
                className={`tab-item ${activeTab === 'SAVED' ? 'active' : ''}`}
                onClick={() => setActiveTab('SAVED')}
            >
            <Bookmark size={12} />
            <span>SAVED</span>
            </button>
        )}
        <button 
            className={`tab-item ${activeTab === 'TAGGED' ? 'active' : ''}`}
            onClick={() => setActiveTab('TAGGED')}
        >
          <UserIcon size={12} />
          <span>TAGGED</span>
        </button>
      </div>

      <div className="profile-grid">
        {displayPosts.map(post => (
          <div 
            key={post.id} 
            className="grid-item profile-clickable"
            onClick={() => navigate(`/post/${post.id}`)}
            style={{ cursor: 'pointer' }}
          >
            {post.imageUrl?.match(/\.(mp4|mov|webm|ogg)(?:\?|$)/i) ? (
              <video src={post.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop playsInline />
            ) : (
              <img src={post.imageUrl} alt={post.caption} />
            )}
            <div className="grid-item-overlay">
              <span>❤️ {post.likes}</span>
            </div>
          </div>
        ))}
        {displayPosts.length === 0 && (
          <div className="no-posts">
              {activeTab === 'POSTS' && "No posts yet."}
              {activeTab === 'SAVED' && "No saved posts."}
              {activeTab === 'TAGGED' && "No tagged posts."}
          </div>
        )}
      </div>

      <UserListModal 
         isOpen={modalState.isOpen}
         onClose={() => setModalState({ isOpen: false, type: null, userIds: [] })}
         title={modalState.type}
         userIds={modalState.userIds}
      />
    </div>
  );
};

export default Profile;

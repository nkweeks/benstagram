import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, Bookmark, User as UserIcon, Edit2, Check, X } from 'lucide-react';
import { useFeed } from '../contexts/FeedContext';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { users, posts, currentUser } = useFeed();
  const { updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('POSTS');
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    fullName: '',
    bio: ''
  });
  
  // Find user by username
  let profileUser = Object.values(users).find(u => u.username === username);
  
  // If not found in mock data, check if it's the currently logged-in user (e.g. signed up user)
  if (!profileUser && currentUser && currentUser.username === username) {
      profileUser = currentUser;
  }
  
  if (!profileUser) return <div className="profile-container">User not found</div>;

  const isCurrentUser = currentUser?.id === profileUser.id;

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
      displayPosts = []; // Placeholder for now
  }
  
  // Helper to count posts without filtering
  const userPostCount = posts.filter(p => p.userId === profileUser?.id).length;

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div className="profile-avatar-container">
          <img src={profileUser.avatarUrl || profileUser.avatar || '/default-avatar.png'} alt={profileUser.username} className="profile-avatar-img" />
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
                    <button className="btn-primary">Follow</button>
                    <button className="btn-secondary">Message</button>
                  </>
                )}
              </div>
            </div>
          )}

          <ul className="profile-stats">
            <li><strong>{userPostCount}</strong> posts</li>
            <li><strong>{(profileUser.followers || 0).toLocaleString()}</strong> followers</li>
            <li><strong>{profileUser.following || 0}</strong> following</li>
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
                />
                <textarea 
                  value={editForm.bio} 
                  onChange={e => setEditForm({...editForm, bio: e.target.value})}
                  className="edit-input bio-text-input"
                  placeholder="Bio"
                  rows={3}
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
          <div key={post.id} className="grid-item">
            <img src={post.imageUrl} alt={post.caption} />
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
    </div>
  );
};

export default Profile;

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Bookmark, User as UserIcon } from 'lucide-react';
import { useFeed } from '../contexts/FeedContext';
import './Profile.css';

const Profile = () => {
  const { username } = useParams();
  const { users, posts, currentUser } = useFeed();
  const [activeTab, setActiveTab] = useState('POSTS');
  
  // Find user by username
  let profileUser = Object.values(users).find(u => u.username === username);
  
  // If not found in mock data, check if it's the currently logged-in user (e.g. signed up user)
  if (!profileUser && currentUser && currentUser.username === username) {
      profileUser = currentUser;
  }
  
  if (!profileUser) return <div className="profile-container">User not found</div>;

  const isCurrentUser = currentUser?.id === profileUser.id;

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
          <img src={profileUser.avatar} alt={profileUser.username} className="profile-avatar-img" />
        </div>
        
        <section className="profile-details">
          <div className="profile-title-row">
            <h2 className="profile-username">{profileUser.username}</h2>
            <div className="profile-actions">
              {isCurrentUser ? (
                 <button className="btn-secondary">Edit Profile</button>
              ) : (
                <>
                  <button className="btn-primary">Follow</button>
                  <button className="btn-secondary">Message</button>
                </>
              )}
            </div>
          </div>

          <ul className="profile-stats">
            <li><strong>{userPostCount}</strong> posts</li>
            <li><strong>{profileUser.followers.toLocaleString()}</strong> followers</li>
            <li><strong>{profileUser.following}</strong> following</li>
          </ul>

          <div className="profile-bio">
            <div className="bio-name">{profileUser.fullName}</div>
            <div className="bio-text">
              {profileUser.bio}
            </div>
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

import React, { useState, useEffect } from 'react';
import Post from '../components/Post';
import { useFeed } from '../contexts/FeedContext';
import benAvatar from '../../public/ben-avatar-general.jpeg'; // Use new avatar or from public directly
import { PostSkeleton } from '../components/Skeleton';
import './Feed.css';

const Feed = () => {
  const { posts, users, currentUser, toggleLike, toggleSave } = useFeed();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading delay for skeleton demo
  useEffect(() => {
    const timer = setTimeout(() => {
        setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
      return (
          <div className="feed-container">
             <div className="stories-bar">
                 <div className="story-wrapper">
                    <div className="story-circle skeleton-story"></div>
                 </div>
                 <div className="story-wrapper">
                    <div className="story-circle skeleton-story"></div>
                 </div>
             </div>
             <div className="posts-feed">
                 <PostSkeleton />
                 <PostSkeleton />
             </div>
          </div>
      )
  }

  // if (!posts) return <div className="feed-loading">Loading...</div>; // Replaced by skeleton logic above

  return (
    <div className="feed-container">
      <div className="stories-bar">
        {/* Placeholder for Stories */}
        {/* Placeholder for Stories */}
        <div className="story-wrapper">
          <div className="story-circle">
            <div className="story-ring"></div>
            <img src={benAvatar} alt="ben" />
          </div>
          <span className="story-username">ben</span>
        </div>
        {/* Add more story placeholders if needed */}
      </div>

      <div className="posts-feed">
        {posts.map(post => {
          const author = users[post.userId];
          const isSaved = (currentUser?.savedPostIds || []).includes(post.id);
          return (
            <Post 
              key={post.id} 
              post={post} 
              author={author}
              isSaved={isSaved}
              onLike={() => toggleLike(post.id)}
              onSave={() => toggleSave(post.id)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Feed;

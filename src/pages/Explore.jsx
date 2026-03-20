import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeed } from '../contexts/FeedContext';
import { Heart, MessageCircle } from 'lucide-react';
import './Explore.css';

const Explore = () => {
  const { posts } = useFeed();
  const navigate = useNavigate();

  // Render live posts in a randomized grid order
  const explorePosts = [...posts].sort(() => 0.5 - Math.random());

  return (
    <div className="explore-container">
      <div className="explore-grid">
        {explorePosts.map((post, index) => (
          <div 
            key={`${post.id}-${index}`} 
            className="explore-item explore-clickable"
            onClick={() => navigate(`/post/${post.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <img src={post.imageUrl} alt="Explore content" loading="lazy" />
            <div className="explore-overlay">
              <div className="overlay-stat">
                <Heart size={20} fill="white" />
                <span>{post.likes}</span>
              </div>
              <div className="overlay-stat">
                <MessageCircle size={20} fill="white" />
                <span>{post.comments.length}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;

import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import './Post.css';

import CommentsModal from './CommentsModal';

const Post = ({ post, author, isSaved, onLike, onSave }) => {
  const { isLiked, likes, caption, imageUrl, timestamp } = post;
  const username = author?.username || 'Unknown';
  const avatar = author?.avatar || '';
  
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  return (
    <article className="post">
      <div className="post-header">
        <div className="post-user">
          <div className="post-avatar">
            <img src={avatar} alt={username} />
          </div>
          <span className="post-username">{username}</span>
          <span className="post-time">• {timestamp}</span>
        </div>
        <button className="post-options">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="post-image" onDoubleClick={onLike}>
        <img src={imageUrl} alt="Post content" />
        {isLiked && <div className="heart-animation">❤️</div>}
      </div>

      <div className="post-footer">
        <div className="post-actions">
          <div className="post-actions-left">
            <button 
              className={`action-btn ${isLiked ? 'liked' : ''}`} 
              onClick={onLike}
            >
              <Heart size={24} fill={isLiked ? "#ef4444" : "none"} color={isLiked ? "#ef4444" : "currentColor"} />
            </button>
            <button className="action-btn" onClick={() => setIsCommentsOpen(true)}>
              <MessageCircle size={24} />
            </button>
            <button className="action-btn">
              <Send size={24} />
            </button>
          </div>
          <div className="post-actions-right">
            <button className="action-btn" onClick={onSave}>
              <Bookmark size={24} fill={isSaved ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        <div className="post-likes">
          <strong>{likes.toLocaleString()} likes</strong>
        </div>

        <div className="post-caption">
          <strong>{username}</strong> {caption}
        </div>

        <div className="post-comments-link" onClick={() => setIsCommentsOpen(true)}>
          View all {post.comments ? post.comments.length : 0} comments
        </div>
      </div>
      
      <CommentsModal 
        isOpen={isCommentsOpen} 
        onClose={() => setIsCommentsOpen(false)} 
        postId={post.id} 
      />
    </article>
  );
};

export default Post;

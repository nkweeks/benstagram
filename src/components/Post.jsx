import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Link as LinkIcon, Trash2 } from 'lucide-react';
import './Post.css';

import CommentsModal from './CommentsModal';
import { useAuth } from '../contexts/AuthContext';
import { useFeed } from '../contexts/FeedContext';

const Post = ({ post, author, isSaved, onLike, onSave }) => {
  const { isLiked, likes, caption, imageUrl, timestamp } = post;
  const username = author?.username || 'Unknown';
  const avatar = author?.avatarUrl || author?.avatar || '/default-avatar.png';
  
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const { user: currentUser } = useAuth();
  const { deletePost } = useFeed();

  const isOwner = currentUser?.id === post.userId;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`).catch(() => {});
    setIsMenuOpen(false);
    alert('Link copied!');
  };

  const handleDelete = () => {
    if (window.confirm("Delete this post?")) {
      deletePost(post.id);
    }
    setIsMenuOpen(false);
  };

  return (
    <article className="post">
      <div className="post-header" ref={menuRef}>
        <div className="post-user">
          <div className="post-avatar">
            <img src={avatar} alt={username} />
          </div>
          <span className="post-username">{username}</span>
          <span className="post-time">• {timestamp}</span>
        </div>
        
        <button className="post-options" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <MoreHorizontal size={20} />
        </button>

        {isMenuOpen && (
          <div className="post-dropdown">
            {isOwner && (
              <button className="dropdown-item danger" onClick={handleDelete}>
                <Trash2 size={16} /> Delete
              </button>
            )}
            <button className="dropdown-item" onClick={handleCopyLink}>
              <LinkIcon size={16} /> Copy Link
            </button>
          </div>
        )}
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
          <strong>{(likes || 0).toLocaleString()} likes</strong>
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

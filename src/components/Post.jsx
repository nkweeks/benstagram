import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Link as LinkIcon, Trash2 } from 'lucide-react';
import './Post.css';

import CommentsModal from './CommentsModal';
import { useAuth } from '../contexts/AuthContext';
import { useFeed } from '../contexts/FeedContext';
import { generateClient } from 'aws-amplify/data';

const client = generateClient();

const Post = ({ post, author: initialAuthor, isSaved, onLike, onSave }) => {
  const [fetchedAuthor, setFetchedAuthor] = useState(null);
  const author = initialAuthor || fetchedAuthor;

  useEffect(() => {
    if (!initialAuthor && post.userId) {
       client.models.UserProfile.get({ id: post.userId }).then(({ data }) => {
           if (data) setFetchedAuthor(data);
       }).catch(console.error);
    }
  }, [initialAuthor, post.userId]);

  const { isLiked, likes, caption, imageUrl, timestamp } = post;
  const username = author?.username || 'Unknown';
  const avatar = author?.avatarUrl || author?.avatar || '/default-avatar.png';
  
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  const navigate = useNavigate();
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

  const renderCaption = (text) => {
    if (!text) return null;
    // Split by @username pattern
    const parts = text.split(/(@[a-zA-Z0-9_.-]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const mentionedUser = part.substring(1);
        return (
          <span 
            key={index} 
            className="mention" 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${mentionedUser}`);
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <article className="post">
      <div className="post-header" ref={menuRef}>
        <div className="post-user" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${username}`); }} style={{ cursor: 'pointer' }}>
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
          <strong>{username}</strong> {renderCaption(caption)}
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

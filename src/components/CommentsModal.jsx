import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { useFeed } from '../contexts/FeedContext';
import './CommentsModal.css';

const CommentsModal = ({ isOpen, onClose, postId }) => {
  const { posts, users, currentUser, addComment } = useFeed();
  const [commentText, setCommentText] = useState('');
  const commentsEndRef = useRef(null);

  const post = posts.find(p => p.id === postId);
  
  // Scroll to bottom when comments change
  useEffect(() => {
    if (isOpen && commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [post?.comments, isOpen]);

  if (!isOpen || !post) return null;

  const author = users[post.userId];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    addComment(postId, commentText);
    setCommentText('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container comments-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Comments</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="comments-body">
          <div className="post-owner-caption">
            <div className="comment-avatar">
              <img src={author?.avatar} alt={author?.username} />
            </div>
            <div className="comment-content">
              <span className="comment-username">{author?.username}</span>
              <span className="comment-text">{post.caption}</span>
              <div className="comment-time">{post.timestamp}</div>
            </div>
          </div>

          <div className="comments-list">
            {post.comments && post.comments.map(comment => {
              const commentUser = users[comment.userId] || { avatar: '', username: comment.username };
              return (
                <div key={comment.id} className="comment-item">
                  <div className="comment-avatar">
                    <img src={commentUser.avatar} alt={commentUser.username} />
                  </div>
                  <div className="comment-content">
                    <span className="comment-username">{commentUser.username}</span>
                    <span className="comment-text">{comment.text}</span>
                    <div className="comment-time">{comment.timestamp}</div>
                  </div>
                </div>
              );
            })}
            <div ref={commentsEndRef} />
          </div>
        </div>

        <div className="comments-footer">
           <form className="comment-form" onSubmit={handleSubmit}>
             <img src={currentUser?.avatar} alt="Me" className="current-user-avatar" />
             <input 
               type="text" 
               placeholder="Add a comment..." 
               value={commentText}
               onChange={(e) => setCommentText(e.target.value)}
             />
             <button type="submit" disabled={!commentText.trim()}>
               Post
             </button>
           </form>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;

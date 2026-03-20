import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, Send } from 'lucide-react';
import { useFeed } from '../contexts/FeedContext';
import './CommentsModal.css';

const CommentsModal = ({ isOpen, onClose, postId }) => {
  const { posts, users, currentUser, addComment } = useFeed();
  const [commentText, setCommentText] = useState('');
  const commentsEndRef = useRef(null);
  const navigate = useNavigate();

  const post = posts.find(p => p.id === postId);
  
  const [hasScrolledInitial, setHasScrolledInitial] = useState(false);

  // Scroll to bottom when new comments are added, but preserve scroll on open
  useEffect(() => {
    if (isOpen && commentsEndRef.current && commentText === '') {
      if (!hasScrolledInitial) {
          // Delay single initial scroll slightly to allow render
          setTimeout(() => {
             commentsEndRef.current?.scrollIntoView({ behavior: 'auto' });
             setHasScrolledInitial(true);
          }, 50);
      }
    } else if (isOpen && commentsEndRef.current && commentText !== '') {
       // Only smooth scroll when actively typing/submitting a new comment
       commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    if (!isOpen) {
        setHasScrolledInitial(false);
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

  const modalContent = (
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
            <div className="comment-avatar" onClick={() => { if (author?.username) { navigate(`/profile/${author.username}`); onClose(); } }} style={{ cursor: 'pointer' }}>
              <img src={author?.avatarUrl || author?.avatar || '/default-avatar.png'} alt={author?.username} />
            </div>
            <div className="comment-content">
              <div className="comment-text-wrapper">
                <span className="comment-username" onClick={() => { if (author?.username) { navigate(`/profile/${author.username}`); onClose(); } }} style={{ cursor: 'pointer' }}>{author?.username}</span>
                <span className="comment-text">{post.caption}</span>
              </div>
              <div className="comment-time">{post.timestamp}</div>
            </div>
          </div>

          <div className="comments-list">
            {post.comments && post.comments.map(comment => {
              const commentUser = users[comment.userId] || { avatar: '/default-avatar.png', username: comment.username };
              return (
                <div key={comment.id} className="comment-item">
                  <div className="comment-avatar" onClick={() => { if (commentUser.username) { navigate(`/profile/${commentUser.username}`); onClose(); } }} style={{ cursor: 'pointer' }}>
                    <img src={commentUser.avatarUrl || commentUser.avatar || '/default-avatar.png'} alt={commentUser.username} />
                  </div>
                  <div className="comment-content">
                    <div className="comment-text-wrapper">
                      <span className="comment-username" onClick={() => { if (commentUser.username) { navigate(`/profile/${commentUser.username}`); onClose(); } }} style={{ cursor: 'pointer' }}>{commentUser.username}</span>
                      <span className="comment-text">{comment.text}</span>
                    </div>
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
             <img src={currentUser?.avatarUrl || currentUser?.avatar || '/default-avatar.png'} alt="Me" className="current-user-avatar" />
             <input 
               type="text" 
               placeholder="Add a comment..." 
               value={commentText}
               onChange={(e) => setCommentText(e.target.value)}
               maxLength={1000}
             />
             <button type="submit" disabled={!commentText.trim()}>
               Post
             </button>
           </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CommentsModal;

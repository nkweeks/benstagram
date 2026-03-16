import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useFeed } from '../contexts/FeedContext';
import { useAuth } from '../contexts/AuthContext';
import Post from '../components/Post';
import './PostPage.css';

const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { posts, users, toggleLike, toggleSave } = useFeed();
  const { user: currentUser } = useAuth();

  const post = posts.find(p => p.id === postId);

  if (!post) {
    return (
      <div className="post-page-container not-found">
        <h2>Post not found</h2>
        <button className="btn-secondary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const author = users[post.userId] || { username: 'Unknown', avatarUrl: '/default-avatar.png' };
  const isSaved = currentUser?.savedPostIds?.includes(post.id) || false;

  return (
    <div className="post-page-container">
      <div className="post-page-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h2>Post</h2>
      </div>
      <div className="post-page-content">
        <Post 
          post={post} 
          author={author} 
          isSaved={isSaved}
          onLike={() => toggleLike(post.id)}
          onSave={() => toggleSave(post.id)}
        />
      </div>
    </div>
  );
};

export default PostPage;

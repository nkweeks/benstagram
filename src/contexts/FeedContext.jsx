import React, { createContext, useContext, useState, useEffect } from 'react';
import { POSTS, USERS, CURRENT_USER_ID } from '../data/mockData';
import { useAuth } from './AuthContext';

const FeedContext = createContext();

export const useFeed = () => {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error('useFeed must be used within a FeedProvider');
  }
  return context;
};

export const FeedProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState({});
  const { user: currentUser, updateUser } = useAuth(); // Get currentUser and updater from AuthContext

  useEffect(() => {
    // Simulate fetching data
    setPosts(POSTS);
    
    // Create a map of users for easy lookup
    const userMap = USERS.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {});
    setUsers(userMap);
    
    // currentUser is now managed by AuthContext
  }, []);

  const toggleLike = (postId) => {
    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === postId) {
          // Check if already liked (mocking this logic for now)
          // In a real app, we'd check if currentUser.id is in post.likes array
          // Here we'll just toggle a boolean 'isLiked' if we had one, or increment/decrement count
          // Let's assume for this mock that we are just incrementing/decrementing random state
          // For a better mock, let's add an 'isLiked' property to the post state
          const isLiked = post.isLiked || false;
          return {
            ...post,
            likes: isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !isLiked
          };
        }
        return post;
      })
    );
  };

  const addPost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const addComment = (postId, commentText) => {
    if (!currentUser) return;
    
    // Create new comment object
    const newComment = {
      id: `c_${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      text: commentText,
      timestamp: 'Just now'
    };

    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...(post.comments || []), newComment]
          };
        }
        return post;
      })
    );
  };

  const toggleSave = (postId) => {
    if (!currentUser) return;

    // Check if already saved
    const savedIds = currentUser.savedPostIds || [];
    const isSaved = savedIds.includes(postId);
    
    let newSavedIds;
    if (isSaved) {
      newSavedIds = savedIds.filter(id => id !== postId);
    } else {
      newSavedIds = [...savedIds, postId];
    }
    
    updateUser({ savedPostIds: newSavedIds });
  };

  const value = {
    posts,
    users,
    currentUser,
    toggleLike,
    toggleSave,
    addPost,
    addComment
  };

  return (
    <FeedContext.Provider value={value}>
      {children}
    </FeedContext.Provider>
  );
};

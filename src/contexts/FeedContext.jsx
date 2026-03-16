import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useAuth } from './AuthContext';

const client = generateClient();
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
  const { user: currentUser, updateUser } = useAuth(); 

  // Load and Subscribe to Real-Time Feed Data
  useEffect(() => {
    // 1. Subscribe to Live Posts
    const subPosts = client.models.Post.observeQuery().subscribe({
      next: ({ items }) => {
        // Sort newest posts first
        const sorted = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        // Need to simulate timestamps for UI since createdAt is an ISO 8601 string in DynamoDB
        const postsWithTime = sorted.map(post => {
            const date = new Date(post.createdAt);
            const now = new Date();
            const diffMin = Math.round((now - date) / 60000);
            const t = diffMin < 60 ? `${diffMin}m` : diffMin < 1440 ? `${Math.floor(diffMin/60)}h` : `${Math.floor(diffMin/1440)}d`;
            
            return {
                ...post,
                timestamp: t === '0m' ? 'Just now' : t
            };
        });
        setPosts(postsWithTime);
      },
      error: (error) => console.error("Error subscribing to posts:", error)
    });

    // 2. Subscribe to Live Users to build an active user map
    const subUsers = client.models.UserProfile.observeQuery().subscribe({
        next: ({ items }) => {
            const userMap = items.reduce((acc, user) => {
                acc[user.username] = user; // Fallback map by username
                acc[user.id] = user;       // Map by ID
                return acc;
            }, {});
            setUsers(userMap);
        },
        error: (error) => console.error("Error subscribing to users:", error)
    });

    return () => {
      subPosts.unsubscribe();
      subUsers.unsubscribe();
    };
  }, []);

  const toggleLike = async (postId) => {
    if (!currentUser) return;
    
    // Optimistic UI update
    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === postId) {
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

    try {
        const postToUpdate = posts.find(p => p.id === postId);
        if (postToUpdate) {
            const isLiked = postToUpdate.isLiked;
            await client.models.Post.update({
                id: postId,
                likes: isLiked ? postToUpdate.likes - 1 : postToUpdate.likes + 1
            });
        }
    } catch (e) {
        console.error("Failed to update like", e);
    }
  };

  const addComment = async (postId, commentText) => {
    if (!currentUser) return;
    
    try {
        await client.models.Comment.create({
            text: commentText,
            postId: postId,
            userId: currentUser.id
        });
        // Subscription will automatically fetch and push the new comment into the specific Post
    } catch (e) {
        console.error("Failed to add comment:", e);
    }
  };

  const toggleSave = async (postId) => {
    if (!currentUser) return;

    const savedIds = currentUser.savedPostIds || [];
    const isSaved = savedIds.includes(postId);
    
    let newSavedIds;
    if (isSaved) {
      newSavedIds = savedIds.filter(id => id !== postId);
    } else {
      newSavedIds = [...savedIds, postId];
    }
    
    // Update local UI immediately through AuthContext
    updateUser({ savedPostIds: newSavedIds });
  };

  const deletePost = async (postId) => {
    try {
        await client.models.Post.delete({ id: postId });
    } catch (e) {
        console.error("Failed to delete post:", e);
    }
  };

  const value = {
    posts,
    users,
    currentUser,
    toggleLike,
    toggleSave,
    // Note: addPost is no longer exposed here since UploadModal imports client.models directly
    addComment,
    deletePost
  };

  return (
    <FeedContext.Provider value={value}>
      {children}
    </FeedContext.Provider>
  );
};

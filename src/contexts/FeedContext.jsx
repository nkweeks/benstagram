import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useAuth } from './AuthContext';
import { POSTS, USERS } from '../data/mockData';

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
  const [follows, setFollows] = useState([]);
  const { user: currentUser, updateUser } = useAuth(); 

  const isDemoAccount = currentUser?.id === 'ben';

  // Load and Subscribe to Real-Time Feed Data OR Load Mock Data
  useEffect(() => {
    if (isDemoAccount) {
        // Load mock data for the demo account
        setPosts(POSTS);
        const userMap = USERS.reduce((acc, user) => {
            acc[user.username] = user; 
            acc[user.id] = user;       
            return acc;
        }, {});
        setUsers(userMap);
        return; // Skip AWS Subscriptions entirely
    }

    // Seed General Ben Data once
    const seedGeneralBen = async () => {
        if (!currentUser?.id) return;
        const seeded = localStorage.getItem('gen_ben_seeded_v1');
        if (seeded) return;
        
        try {
            // Optimistically set to prevent parallel executions
            localStorage.setItem('gen_ben_seeded_v1', 'true');
            const { data } = await client.models.UserProfile.list({ filter: { username: { eq: 'the_ben_official' } } });
            if (data.length === 0) {
                 const { data: benProfile } = await client.models.UserProfile.create({
                     username: 'the_ben_official',
                     fullName: 'General Ben',
                     avatar: '/ben-avatar-general.jpeg',
                     bio: 'Great Dane. General of the Army. Good Boy. 🦴',
                     email: 'ben@benstagram.com'
                 });
                 if (benProfile) {
                     await client.models.Post.create({
                         userId: benProfile.id,
                         imageUrl: '/dogs-dancing.jpg',
                         caption: 'Dancing is the best! 🕺🐕 #DancingDogs #GoodVibes',
                         likes: 5000
                     });
                     await client.models.Post.create({
                         userId: benProfile.id,
                         imageUrl: '/ben-post-general-1.jpeg',
                         caption: 'Leading the troops (to the treat jar). #GeneralBen',
                         likes: 1240
                     });
                     await client.models.Post.create({
                         userId: benProfile.id,
                         imageUrl: '/ben-post-general-2.jpeg',
                         caption: 'Pondering the strategy for the next nap.',
                         likes: 856
                     });
                 }
            }
        } catch (e) {
            console.error("Failed to seed General Ben:", e);
            localStorage.removeItem('gen_ben_seeded_v1'); // Retry later if failed
        }
    };
    
    seedGeneralBen();

    // 1. Subscribe to Live Posts for Real Users
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

    // 3. Subscribe to current user's Follows
    let subFollows;
    if (currentUser?.id && !isDemoAccount) {
        subFollows = client.models.Follow.observeQuery({
            filter: { followerId: { eq: currentUser.id } }
        }).subscribe({
            next: ({ items }) => setFollows(items),
            error: (e) => console.error("Error fetching follows:", e)
        });
    }

    return () => {
      subPosts.unsubscribe();
      subUsers.unsubscribe();
      if (subFollows) subFollows.unsubscribe();
    };
  }, [isDemoAccount, currentUser?.id]);

  const toggleFollow = async (targetUserId) => {
    if (!currentUser || isDemoAccount) return;
    
    const existingFollow = follows.find(f => f.followingId === targetUserId);
    
    if (existingFollow) {
        setFollows(prev => prev.filter(f => f.id !== existingFollow.id));
        try {
            await client.models.Follow.delete({ id: existingFollow.id });
        } catch (e) {
            console.error("Failed to unfollow:", e);
            setFollows(prev => [...prev, existingFollow]);
        }
    } else {
        const tempFollow = { id: `temp_${Date.now()}`, followerId: currentUser.id, followingId: targetUserId };
        setFollows(prev => [...prev, tempFollow]);
        try {
            const { data } = await client.models.Follow.create({
                followerId: currentUser.id,
                followingId: targetUserId
            });
            if (data) {
                setFollows(prev => prev.map(f => f.id === tempFollow.id ? data : f));
            }
        } catch (e) {
            console.error("Failed to follow:", e);
            setFollows(prev => prev.filter(f => f.id !== tempFollow.id));
        }
    }
  };

  const toggleLike = async (postId) => {
    if (!currentUser) return;
    
    // Optimistic UI update (works for both live and mock)
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

    if (isDemoAccount) return; // Prevent DB mutation for demo account

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
    
    if (isDemoAccount) {
        // Mock UI injection
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
        return;
    }

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
    // This intercepts actual AWS database calls inside AuthContext if it's the demo account
    updateUser({ savedPostIds: newSavedIds }); 
  };

  const deletePost = async (postId) => {
    if (isDemoAccount) {
        setPosts(prev => prev.filter(post => post.id !== postId));
        return;
    }

    try {
        await client.models.Post.delete({ id: postId });
    } catch (e) {
        console.error("Failed to delete post:", e);
    }
  };

  const addPost = (newPost) => {
      // Re-exposing this solely for the Demo account to push fake posts locally
      if (isDemoAccount) {
          setPosts(prev => [newPost, ...prev]);
      }
  }

  const value = {
    posts,
    users,
    follows,
    currentUser,
    toggleFollow,
    toggleLike,
    toggleSave,
    addPost, // Restored for Demo account usage
    addComment,
    deletePost
  };

  return (
    <FeedContext.Provider value={value}>
      {children}
    </FeedContext.Provider>
  );
};

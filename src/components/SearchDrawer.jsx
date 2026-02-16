import React, { useState, useEffect } from 'react';
import { X, Search as SearchIcon } from 'lucide-react';
import { useFeed } from '../contexts/FeedContext';
import './SearchDrawer.css';

const SearchDrawer = ({ isOpen, onClose }) => {
  const { users, posts } = useFeed();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], posts: [] });

  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], posts: [] });
      return;
    }

    const lowerQuery = query.toLowerCase();

    // Search Users
    const foundUsers = Object.values(users).filter(user => 
      user.username.toLowerCase().includes(lowerQuery) || 
      user.fullName.toLowerCase().includes(lowerQuery)
    );

    // Search Posts (by caption)
    const foundPosts = posts.filter(post => 
      post.caption.toLowerCase().includes(lowerQuery)
    );

    setResults({ users: foundUsers, posts: foundPosts });
  }, [query, users, posts]);

  if (!isOpen) return null;

  return (
    <div className={`search-drawer ${isOpen ? 'open' : ''}`}>
      <div className="search-header">
        <h3>Search</h3>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <div className="search-input-container">
        <div className="search-input-wrapper">
            <SearchIcon size={16} className="search-icon-input" />
            <input 
            type="text" 
            placeholder="Search" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            />
        </div>
      </div>

      <div className="search-results">
        {!query && <div className="search-placeholder">Type to search...</div>}

        {query && results.users.length === 0 && results.posts.length === 0 && (
           <div className="search-empty">No results found.</div>
        )}

        {results.users.length > 0 && (
          <div className="results-section">
            <h4>Users</h4>
            {results.users.map(user => (
              <div key={user.id} className="result-item user-result">
                <img src={user.avatar} alt={user.username} className="result-avatar" />
                <div className="result-info">
                  <span className="result-main">{user.username}</span>
                  <span className="result-sub">{user.fullName}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {results.posts.length > 0 && (
          <div className="results-section">
            <h4>Posts</h4>
            {results.posts.map(post => (
              <div key={post.id} className="result-item post-result">
                <img src={post.imageUrl} alt="Post" className="result-thumb" />
                <div className="result-info">
                    <span className="result-main">{post.caption.substring(0, 30)}...</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchDrawer;

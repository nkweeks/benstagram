import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Compass, MessageCircle, Heart, PlusSquare, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';
import SearchDrawer from './SearchDrawer';
import MoreMenu from './MoreMenu';

const Sidebar = ({ onCreateClick }) => {
  const { theme, toggleTheme, logoPath } = useTheme();
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  
  // Fallback if user isn't loaded yet, though ProtectedRoute should prevent this
  const profileLink = user ? `/profile/${user.username}` : '/';

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logoPath} alt="Benstagram" className="logo-image" />
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            <Home size={24} />
            <span>Home</span>
          </Link>
          <button className={`nav-item create-btn ${isSearchOpen ? 'active' : ''}`} onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <Search size={24} />
            <span>Search</span>
          </button>
          <Link to="/explore" className={`nav-item ${isActive('/explore') ? 'active' : ''}`}>
            <Compass size={24} />
            <span>Explore</span>
          </Link>
          <Link to="/messages" className={`nav-item ${isActive('/messages') ? 'active' : ''}`}>
            <MessageCircle size={24} />
            <span>Messages</span>
          </Link>
          <Link to="/notifications" className={`nav-item ${isActive('/notifications') ? 'active' : ''}`}>
            <Heart size={24} />
            <span>Notifications</span>
          </Link>
          <button className="nav-item create-btn" onClick={onCreateClick}>
            <PlusSquare size={24} />
            <span>Create</span>
          </button>
          <Link to={profileLink} className={`nav-item ${isActive(profileLink) ? 'active' : ''}`}>
            <div className="profile-icon">
               {user?.avatar ? (
                   <img src={user.avatar} alt="Profile" className="sidebar-profile-img" style={{width: '24px', height: '24px', borderRadius: '50%'}} />
               ) : (
                   <div className="sidebar-avatar-placeholder" /> 
               )}
            </div>
            <span>Profile</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          {/* <button className="nav-item" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button> */}
          <button className={`nav-item ${isMoreOpen ? 'active' : ''}`} onClick={() => setIsMoreOpen(!isMoreOpen)}>
            <Menu size={24} />
            <span>More</span>
          </button>
        </div>
      </aside>
      
      <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <MoreMenu isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
    </>
  );
};

export default Sidebar;

import React from 'react';
import { Settings, Bookmark, Moon, Sun, MessageSquareWarning, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './MoreMenu.css';

const MoreMenu = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
      logout();
      navigate('/login');
      onClose();
  };

  const handleNotImplemented = (feature) => {
      alert(`${feature} is coming soon!`);
      // In a real app, use a toast notification
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="more-menu-overlay" onClick={onClose}></div>
      <div className="more-menu-popup">
        <button className="more-menu-item" onClick={() => { navigate('/settings'); onClose(); }}>
            <Settings size={20} />
            <span>Settings</span>
        </button>
        <button className="more-menu-item" onClick={() => handleNotImplemented('Saved Items')}>
            <Bookmark size={20} />
            <span>Saved</span>
        </button>
        <button className="more-menu-item" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span>Switch Appearance</span>
        </button>
        <div className="more-menu-divider"></div>
        <button className="more-menu-item" onClick={() => handleNotImplemented('Report Problem')}>
            <MessageSquareWarning size={20} />
            <span>Report a Problem</span>
        </button>
        <button className="more-menu-item" onClick={handleLogout}>
            <LogOut size={20} /> {/* Added Icon */}
            <span>Log Out</span>
        </button>
      </div>
    </>
  );
};

export default MoreMenu;

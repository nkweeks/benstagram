import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { useFeed } from '../contexts/FeedContext';
import './UploadModal.css';

const UploadModal = ({ isOpen, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const inputRef = useRef(null);
  const { addPost, currentUser } = useFeed();

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const handleShare = () => {
    if (!file || !currentUser) return;

    const newPost = {
      id: `post_${Date.now()}`,
      userId: currentUser.id,
      imageUrl: URL.createObjectURL(file), // Temporary URL for mock
      caption: caption,
      likes: 0,
      comments: [],
      timestamp: 'Just now'
    };

    addPost(newPost);
    
    // Reset and close
    setFile(null);
    setCaption('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create new post</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div 
          className={`modal-body ${dragActive ? "drag-active" : ""}`}
          onDragEnter={handleDrag} 
          onDragLeave={handleDrag} 
          onDragOver={handleDrag} 
          onDrop={handleDrop}
        >
          {!file ? (
            <div className="upload-placeholder">
              <div className="upload-icon-circle">
                <ImageIcon size={48} />
              </div>
              <p>Drag photos and videos here</p>
              <button className="btn-upload" onClick={onButtonClick}>
                Select from computer
              </button>
              <input 
                ref={inputRef}
                type="file" 
                className="file-input" 
                onChange={handleChange} 
                accept="image/*"
              />
            </div>
          ) : (
            <div className="upload-preview-container">
              <div className="upload-preview-image">
                <img src={URL.createObjectURL(file)} alt="Preview" />
              </div>
              <div className="upload-details">
                <div className="user-info">
                   <img src={currentUser?.avatar} alt={currentUser?.username} className="user-avatar-small" />
                   <span>{currentUser?.username}</span>
                </div>
                <textarea 
                  className="caption-input" 
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                ></textarea>
                <div className="upload-actions">
                   <button className="btn-share" onClick={handleShare}>
                     Share
                   </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;

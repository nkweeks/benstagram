import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uploadData, getUrl } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/data';
import './UploadModal.css';

const client = generateClient();

const UploadModal = ({ isOpen, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);
  const { user: currentUser } = useAuth();

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

  const handleShare = async () => {
    if (!file || !currentUser || isUploading) return;
    setIsUploading(true);

    try {
      // 1. Upload the physical image block to S3 Storage
      const filename = `${Date.now()}_${file.name}`;
      await uploadData({
        path: `post-images/${filename}`,
        data: file
      }).result;

      // 2. Fetch the newly created public accessible S3 Path
      const urlInfo = await getUrl({ path: `post-images/${filename}` });
      const imageUrl = urlInfo.url.toString();

      // 3. Inject the Post document directly into the real DynamoDB Database
      await client.models.Post.create({
        caption: caption,
        imageUrl: imageUrl,
        userId: currentUser.id,
        likes: 0
      });

      // Reset UI state upon successful network transaction
      setFile(null);
      setCaption('');
      onClose();
    } catch (error) {
      console.error('Error uploading post:', error);
      alert('Failed to upload post. Please try again.');
    } finally {
      setIsUploading(false);
    }
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
                   <img src={currentUser?.avatarUrl || currentUser?.avatar || '/default-avatar.png'} alt={currentUser?.username} className="user-avatar-small" />
                   <span>{currentUser?.username}</span>
                </div>
                <textarea 
                  className="caption-input" 
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={2200}
                ></textarea>
                <div className="upload-actions">
                   <button className="btn-share" onClick={handleShare} disabled={isUploading}>
                     {isUploading ? 'Sharing...' : 'Share'}
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

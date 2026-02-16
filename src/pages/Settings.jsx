import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Settings.css';

const Settings = () => {
    const { user, updateUser } = useAuth();
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [username, setUsername] = useState(user?.username || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        // Simulate API call
        setTimeout(() => {
            updateUser({ fullName, username, bio });
            setIsSaving(false);
            alert('Profile saved!');
        }, 800);
    };

    return (
        <div className="settings-container">
            <h2>Edit Profile</h2>
            <form className="settings-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name</label>
                    <input 
                        type="text" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                    />
                </div>
                <div className="form-group">
                    <label>Username</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                    />
                </div>
                <div className="form-group">
                    <label>Bio</label>
                    <textarea 
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)} 
                        rows="3"
                    />
                </div>
                <button type="submit" className="save-btn" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default Settings;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { uploadData } from 'aws-amplify/storage';
import { fetchAuthSession } from 'aws-amplify/auth';
import './Settings.css';

const Settings = () => {
    const { user, updateUser } = useAuth();
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFullName(user.fullName || '');
            setUsername(user.username || '');
            setBio(user.bio || '');
            setPreviewUrl(user.avatarUrl || null);
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            let avatarPath = user.avatar;

            if (avatarFile) {
                // Get Identity ID for storage path
                const session = await fetchAuthSession();
                const identityId = session.identityId;
                
                // Construct path: profile-pictures/{identityId}/avatar.jpg
                // We use a timestamp to avoid caching issues on update
                const timestamp = new Date().getTime();
                const fileName = `avatar_${timestamp}.jpg`;
                avatarPath = `profile-pictures/${identityId}/${fileName}`;

                await uploadData({
                    path: avatarPath,
                    data: avatarFile,
                    options: {
                       contentType: avatarFile.type // e.g. image/jpeg
                    }
                }).result;
            }

            await updateUser({ 
                fullName, 
                username, // Note: Changing username here might not update Cognito username, only DB profile.
                bio,
                avatar: avatarPath
            });
            
            alert('Profile saved!');
        } catch (error) {
            console.error("Error saving profile:", error);
            alert('Failed to save profile.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="settings-container">
            <h2>Edit Profile</h2>
            <form className="settings-form" onSubmit={handleSubmit}>
                
                <div className="form-group avatar-upload">
                    <label>Profile Picture</label>
                    <div className="avatar-preview">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Avatar Preview" className="avatar-circle" />
                        ) : (
                            <div className="avatar-placeholder">?</div>
                        )}
                    </div>
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        style={{ marginTop: '10px' }}
                    />
                </div>

                <div className="form-group">
                    <label>Name</label>
                    <input 
                        type="text" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                    />
                </div>
                <div className="form-group">
                    {/* Note: Username editing is complex if we want to change login username too. 
                        For now, maybe assume it's display only or DB only. */}
                    <label>Username</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        disabled // Disable username editing for now to avoid sync issues
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

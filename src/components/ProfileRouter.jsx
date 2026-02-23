import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProfileRouter = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If AuthContext is still processing the Cognito callback, wait
    if (isLoading) return;

    // Once the user session resolves, redirect them to their specific profile page
    if (user && user.username) {
      navigate(`/profile/${user.username}`, { replace: true });
    } else {
      // If authentication completely fails (no user object), boot back to login
      navigate('/login', { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Render a full-page loading spinner while waiting for AWS Amplify to exchange tokens
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>
      <div className="loading-spinner"></div>
    </div>
  );
};

export default ProfileRouter;

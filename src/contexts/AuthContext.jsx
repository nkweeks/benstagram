import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    signIn, 
    signUp, 
    signOut, 
    confirmSignUp, 
    getCurrentUser, 
    fetchUserAttributes,
    autoSignIn,
    signInWithRedirect 
} from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import outputs from '../../amplify_outputs.json';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const client = generateClient();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initial check for logged-in user
    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            // Check for Cypress Test User override
            if (window.Cypress) {
                const cypressUser = localStorage.getItem('cypress_user');
                if (cypressUser) {
                    console.log('Using Cypress Test User');
                    setUser(JSON.parse(cypressUser));
                    setIsLoading(false);
                    return;
                }
            }

            const currentUser = await getCurrentUser();
            const attributes = await fetchUserAttributes();
            
            // Try to fetch existing profile from DynamoDB
            let { data: profiles } = await client.models.UserProfile.list({
                filter: { username: { eq: currentUser.username } }
            });

            // If not found by Cognito ID, try fetching by email (for renamed Google users)
            if (profiles.length === 0 && attributes.email) {
                const { data: emailProfiles } = await client.models.UserProfile.list({
                    filter: { email: { eq: attributes.email } }
                });
                profiles = emailProfiles;
            }

            let userProfile = profiles[0];

            // Check if we need to migrate/update an existing 'google_...', generic, or UUID username
            const isProfileUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userProfile?.username || '');
            if (userProfile && (userProfile.username.toLowerCase().includes('google') || userProfile.username.includes('_') || isProfileUUID)) {
                let friendlyUsername = attributes.preferred_username || userProfile.username;
                
                const isPreferredBad = friendlyUsername.toLowerCase().includes('google') || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(friendlyUsername);
                if (friendlyUsername === userProfile.username || isPreferredBad) {
                    if (attributes.email) {
                        friendlyUsername = attributes.email.split('@')[0];
                    } else if (attributes.name) {
                        friendlyUsername = attributes.name.replace(/\s+/g, '').toLowerCase();
                    }
                }
                
                if (friendlyUsername !== userProfile.username) {
                    console.log("Migrating generic Google username to:", friendlyUsername);
                    const { data: updatedProfile, errors } = await client.models.UserProfile.update({
                        id: userProfile.id,
                        username: friendlyUsername
                    });
                    if (!errors && updatedProfile) {
                        userProfile = updatedProfile;
                    }
                }
            }

            if (!userProfile) {
                // If no profile exists (first login), create one
                let friendlyUsername = attributes.preferred_username || currentUser.username;
                const isGoogleOrGeneric = friendlyUsername.toLowerCase().includes('google') || friendlyUsername.includes('_');
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(friendlyUsername);
                
                if (isGoogleOrGeneric || isUUID) {
                    const isPreferredBad = attributes.preferred_username && (attributes.preferred_username.toLowerCase().includes('google') || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(attributes.preferred_username));
                    if (attributes.preferred_username && !isPreferredBad) {
                        friendlyUsername = attributes.preferred_username;
                    } else if (attributes.email) {
                        friendlyUsername = attributes.email.split('@')[0];
                    } else if (attributes.name) {
                        friendlyUsername = attributes.name.replace(/\s+/g, '').toLowerCase();
                    }
                }
                
                // Final safety check to ensure it isn't still the raw Google ID or UUID
                const isFinalUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(friendlyUsername);
                if (friendlyUsername === currentUser.username && (friendlyUsername.includes('google') || isFinalUUID)) {
                     friendlyUsername = `user${Math.floor(Math.random() * 10000)}`;
                }

                console.log("Creating new UserProfile for:", friendlyUsername);
                const { data: newProfile, errors } = await client.models.UserProfile.create({
                    username: friendlyUsername,
                    email: attributes.email || 'no-email-provided@benstagram.net',
                    fullName: attributes.name || '',
                    bio: 'New to Benstagram',
                    avatar: '' 
                });
                
                if (errors) {
                    const errorMsg = JSON.stringify(errors, null, 2);
                    console.error("Error creating profile:", errorMsg);
                    throw new Error(`DynamoDB Profile Creation Failed: ${errorMsg}`);
                }
                userProfile = newProfile;
            }
            
            // Resolve Avatar URL if exists
            if (userProfile && userProfile.avatar) {
                try {
                    const link = await getUrl({ path: userProfile.avatar });
                    // Provide a signed URL or public URL
                    userProfile.avatarUrl = link.url.toString();
                } catch (err) {
                    console.error("Error resolving avatar:", err);
                }
            } else if (userProfile) {
                 userProfile.avatarUrl = null; 
            }
            
            setUser(userProfile);
        } catch (error) {
            console.log('No user logged in:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            // DEMO USER BYPASS
            if (username === 'the_ben_official' && password === 'demo') {
                const demoUser = {
                    id: 'ben',
                    username: 'the_ben_official',
                    email: 'ben@benstagram.com',
                    fullName: 'General Ben',
                    bio: 'Great Dane. General of the Army. Good Boy. 🦴',
                    avatarUrl: '/ben-avatar-general.jpeg',
                    avatar: '/ben-avatar-general.jpeg',
                    savedPostIds: []
                };
                localStorage.setItem('demo_user', JSON.stringify(demoUser));
                setUser(demoUser);
                return { success: true };
            }

            const { isSignedIn, nextStep } = await signIn({ username, password });
            
            if (isSignedIn) {
                await checkUser(); // Fetch/Create profile
                return { success: true };
            }
            
            if (nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
                 return { success: false, error: 'UserNotConfirmedException' };
            }

            return { success: false, error: 'Unknown login state' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    };

    const signup = async (email, fullName, username, password) => {
        try {
            const { isSignUpComplete, userId, nextStep } = await signUp({
                username,
                password,
                options: {
                    userAttributes: {
                        email,
                        name: fullName,
                        preferred_username: username // Standard OpenID claim
                    }
                }
            });

            return { success: true, nextStep };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: error.message };
        }
    };

    const verifyEmail = async (username, code) => {
        try {
            const { isSignUpComplete, nextStep } = await confirmSignUp({
                username,
                confirmationCode: code
            });
            
            if (isSignUpComplete) {
                return { success: true };
            }
            return { success: false, nextStep };
        } catch (error) {
             console.error('Verification error:', error);
             return { success: false, error: error.message };
        }
    };

    const loginWithGoogle = async () => {
        try {
            await signInWithRedirect({ provider: 'Google' });
        } catch (error) {
            console.error("Google Login failed:", error);
        }
    };

    const logout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('demo_user');
            setUser(null);
            window.location.href = '/login';
        }
    };

    const updateUser = async (updates) => {
        if (!user || !user.id) return;
        
        try {
            // Optimistic update (partial)
            setUser(prev => ({ ...prev, ...updates }));

            // DB Update
            const { data: updatedProfile, errors } = await client.models.UserProfile.update({
                id: user.id,
                ...updates
            });

            if (errors) throw new Error(errors[0].message);

            // Resolve URL again if avatar changed
            if (updates.avatar) {
                 const link = await getUrl({ path: updates.avatar });
                 updatedProfile.avatarUrl = link.url.toString();
            } else {
                 updatedProfile.avatarUrl = user.avatarUrl; // keep existing
            }

            setUser(updatedProfile); // Sync with server response
            
        } catch (error) {
            console.error("Failed to update profile:", error);
        }
    };

    const value = {
        user,
        login,
        signup,
        verifyEmail,
        loginWithGoogle,
        logout,
        updateUser,
        isLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

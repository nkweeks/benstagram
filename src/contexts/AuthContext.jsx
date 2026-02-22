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

            // Check for Demo User override
            const demoUser = localStorage.getItem('demo_user');
            if (demoUser) {
                console.log('Using Demo User');
                setUser(JSON.parse(demoUser));
                setIsLoading(false);
                return;
            }

            const currentUser = await getCurrentUser();
            const attributes = await fetchUserAttributes();
            
            // Try to fetch existing profile from DynamoDB
            const { data: profiles } = await client.models.UserProfile.list({
                filter: { username: { eq: currentUser.username } }
            });

            let userProfile = profiles[0];

            if (!userProfile) {
                // If no profile exists (first login), create one
                console.log("Creating new UserProfile for:", currentUser.username);
                const { data: newProfile, errors } = await client.models.UserProfile.create({
                    username: currentUser.username,
                    email: attributes.email,
                    fullName: attributes.name || '',
                    bio: 'New to Benstagram',
                    avatar: '' 
                });
                
                if (errors) {
                    console.error("Error creating profile:", errors);
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
            // Bypass buggy signInWithRedirect by forming the Cognito Hosted UI URL manually
            // Use the dynamically injected domain from the backend config if it exists
            const domain = awsconfig.auth?.oauth?.domain || 'benstagram-auth-nathan.auth.us-east-1.amazoncognito.com';
            const clientId = '7nvlt7h2h7k1mc182uh30vkhjn';
            const redirectUri = window.location.hostname === 'localhost' 
                ? 'http://localhost:3333/profile' 
                : 'https://benstagram.net/profile';
                
            const url = `https://${domain}/oauth2/authorize?identity_provider=Google&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=CODE&client_id=${clientId}&scope=email openid phone profile aws.cognito.signin.user.admin`;
            
            window.location.href = url;
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

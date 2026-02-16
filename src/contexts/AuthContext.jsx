import React, { createContext, useContext, useState, useEffect } from 'react';
import { USERS } from '../data/mockData';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session
        const storedUser = localStorage.getItem('benstagram_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            // OPTIONAL: Auto-login as Ben for dev convenience, or start logged out
            // setUser(USERS.find(u => u.id === 'ben')); 
        }
        setIsLoading(false);
    }, []);

    const login = (username, password) => {
        // Mock login logic
        // In reality, verify password. Here, just find user by username.
        const foundUser = USERS.find(u => u.username === username || u.id === username);
        
        if (foundUser) {
            setUser(foundUser);
            localStorage.setItem('benstagram_user', JSON.stringify(foundUser));
            return true;
        }
        
        // Check if it's a locally stored user (from signup)
        const localUser = JSON.parse(localStorage.getItem('benstagram_created_user'));
        if (localUser && (localUser.username === username || localUser.email === username) && localUser.password === password) {
             setUser(localUser);
             localStorage.setItem('benstagram_user', JSON.stringify(localUser));
             return true;
        }

        return false;
    };

    const signup = (email, fullName, username, password) => {
        const newUser = {
            id: username, // simplistic ID generation
            username,
            fullName,
            email, // Store email
            password, // Store password (INSECURE: DEMO ONLY)
            avatar: null, // Default or placeholder
            bio: 'New to Benstagram',
            followers: 0,
            following: 0,
            posts: 0
        };
        
        // Save to "database" (local storage for created users)
        // In a real app this goes to backend
        localStorage.setItem('benstagram_created_user', JSON.stringify(newUser));
        
        // Auto-login
        setUser(newUser);
        localStorage.setItem('benstagram_user', JSON.stringify(newUser));
        return true;
    };

    const loginWithGoogle = () => {
        // Mock Google User
        const googleUser = {
            id: 'google_user',
            username: 'google_user_123',
            fullName: 'Google User',
            email: 'user@gmail.com',
            avatar: 'https://lh3.googleusercontent.com/d/1234', // Placeholder or generic
            bio: 'Logged in via Google',
            followers: 0,
            following: 0,
            posts: 0
        };
        
        setUser(googleUser);
        localStorage.setItem('benstagram_user', JSON.stringify(googleUser));
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('benstagram_user');
    };

    const updateUser = (updates) => {
        if (!user) return;
        
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('benstagram_user', JSON.stringify(updatedUser));
        
        // If it was the locally created user, update that storage too
        const localUser = JSON.parse(localStorage.getItem('benstagram_created_user'));
        if (localUser && localUser.username === user.username) {
             localStorage.setItem('benstagram_created_user', JSON.stringify({ ...localUser, ...updates }));
        }
    };

    const value = {
        user,
        login,
        signup,
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

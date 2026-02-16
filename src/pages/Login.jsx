import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loginWithGoogle } = useAuth();
    const { logoPath } = useTheme(); // Use the text logo
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        
        if (!username || !password) {
            setError('Please enter a username and password.');
            return;
        }

        const success = login(username, password);
        if (success) {
            navigate('/');
        } else {
            setError('Invalid username. Try "the_ben_official".');
        }
    };

    // Helper for demo
    const handleDemoLogin = () => {
        login('the_ben_official', 'password');
        navigate('/');
    };

    const handleGoogleLogin = () => {
        loginWithGoogle();
        navigate('/');
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-logo">
                    <img src={logoPath} alt="Benstagram" />
                </div>
                
                <form className="login-form" onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Phone number, username, or email" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="login-input"
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="login-input"
                    />
                    
                    <button type="submit" className="login-btn" disabled={!username || !password.length >= 6}>
                        Log in
                    </button>
                    
                    {error && <p className="login-error">{error}</p>}
                </form>

                <div className="login-divider">
                    <div className="line"></div>
                    <div className="or">OR</div>
                    <div className="line"></div>
                </div>

                <button className="facebook-login" onClick={handleGoogleLogin}>
                    Log in with Google
                </button>
                
                <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <div className="login-signup-box">
                <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
            </div>

            <div className="demo-login">
                <p>Quick access for Demo:</p>
                <button onClick={handleDemoLogin}>Log in as General Ben</button>
            </div>
        </div>
    );
};

export default Login;

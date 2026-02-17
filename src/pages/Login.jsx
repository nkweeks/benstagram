import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, loginWithGoogle, user } = useAuth(); // Destructuring user
    const { logoPath } = useTheme(); // Use the text logo
    const navigate = useNavigate();

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!username || !password) {
            setError('Please enter a username and password.');
            return;
        }

        setIsLoading(true);
        const result = await login(username, password);
        setIsLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            if (result.error === 'UserNotConfirmedException') {
                setError('Please verify your email address.');
                // Optional: Redirect to a verification page or show verify input here
            } else if (result.error.includes('Incorrect username or password')) {
                setError('Invalid username or password.');
            } else {
                setError(result.error);
            }
        }
    };

    // Helper for demo
    const handleDemoLogin = async () => {
        setIsLoading(true);
        const result = await login('the_ben_official', 'password'); // This will fail until we create this user in Cognito
        setIsLoading(false);
        
        if (result.success) {
            navigate('/');
        } else {
             setError('Demo user not found in Cloud. Sign up first!');
        }
    };

    const handleGoogleLogin = () => {
        loginWithGoogle();
        // navigate('/');
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

                <button className="google-btn" onClick={handleGoogleLogin}>
                    <svg className="google-icon" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.79l7.97-6.2z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        <path fill="none" d="M0 0h48v48H0z"/>
                    </svg>
                    Continue with Google
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

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import BenVerificationModal from '../components/BenVerificationModal';
import './Login.css'; // Reuse Login styles

const Signup = () => {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const [isVerified, setIsVerified] = useState(false);
    
    const { signup, loginWithGoogle } = useAuth();
    const { logoPath } = useTheme();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        
        if (!email || !fullName || !username || !password) {
            setError('Please fill in all fields.');
            return;
        }
        
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        const success = signup(email, fullName, username, password);
        if (success) {
            navigate('/');
        } else {
            setError('Failed to create account.');
        }
    };

    const handleGoogleSignup = () => {
        loginWithGoogle();
        navigate('/');
    };

    return (
        <div className="login-container">
            {!isVerified && <BenVerificationModal onVerified={() => setIsVerified(true)} />}
            
            <div className={`login-box ${!isVerified ? 'blur-content' : ''}`}>
                <div className="login-logo">
                    <img src={logoPath} alt="Benstagram" />
                </div>
                
                <h2 style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '1rem', fontWeight: '600', marginBottom: '20px', padding: '0 20px' }}>
                    Sign up to see photos and videos from your friends.
                </h2>

                <button className="facebook-login" onClick={handleGoogleSignup} style={{ fontWeight: '600', width: '100%' }}>
                    Sign up with Google
                </button>

                <div className="login-divider">
                    <div className="line"></div>
                    <div className="or">OR</div>
                    <div className="line"></div>
                </div>
                
                <form className="login-form" onSubmit={handleSubmit}>
                    <input 
                        type="email" 
                        placeholder="Mobile Number or Email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="login-input"
                    />
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="login-input"
                    />
                    <input 
                        type="text" 
                        placeholder="Username" 
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
                    
                    <button type="submit" className="login-btn" disabled={!email || !fullName || !username || password.length < 6}>
                        Sign up
                    </button>
                    
                    {error && <p className="login-error">{error}</p>}
                </form>
                
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '15px' }}>
                    By signing up, you agree to our Terms. Learn how we collect, use and share your data in our Data Policy and how we use cookies and similar technology in our Cookies Policy.
                </p>
            </div>

            <div className={`login-signup-box ${!isVerified ? 'blur-content' : ''}`}>
                <p>Have an account? <Link to="/login">Log in</Link></p>
            </div>
        </div>
    );
};

export default Signup;

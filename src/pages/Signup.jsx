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
    const [isLoading, setIsLoading] = useState(false);
    
    // Ben Verification State
    const [isVerified, setIsVerified] = useState(false);
    
    // Email Verification State
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    
    const { signup, verifyEmail, loginWithGoogle } = useAuth();
    const { logoPath } = useTheme();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!email || !fullName || !username || !password) {
            setError('Please fill in all fields.');
            return;
        }
        
        if (password.length < 8) { // Cognito default is usually 8
            setError('Password must be at least 8 characters.');
            return;
        }

        setIsLoading(true);
        const result = await signup(email, fullName, username, password);
        setIsLoading(false);

        if (result.success) {
            setIsVerifyingEmail(true);
        } else {
            setError(result.error);
        }
    };

    const handleVerification = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await verifyEmail(username, verificationCode);
        setIsLoading(false);

        if (result.success) {
            // Redirect to login or home
            // For now, let's go to Login so they can verify their creds work
            navigate('/login'); 
        } else {
            setError(result.error || 'Verification failed. Check the code and try again.');
        }
    };

    const handleGoogleSignup = () => {
        loginWithGoogle();
        // navigate('/'); // AuthContext will handle redirect logic eventually
    };

    return (
        <div className="login-container">
            {!isVerified && <BenVerificationModal onVerified={() => setIsVerified(true)} />}
            
            <div className={`login-box ${!isVerified ? 'blur-content' : ''}`}>
                <div className="login-logo">
                    <img src={logoPath} alt="Benstagram" />
                </div>
                
                {isVerifyingEmail ? (
                    <>
                         <h2 style={{ textAlign: 'center', color: 'var(--color-text-primary)', fontSize: '1.2rem', fontWeight: '600', marginBottom: '10px' }}>
                            Verify your email
                        </h2>
                        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '20px', padding: '0 20px' }}>
                            Enter the 6-digit code sent to {email}.
                        </p>

                        <form className="login-form" onSubmit={handleVerification}>
                            <input 
                                type="text" 
                                placeholder="Confirmation Code" 
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="login-input"
                                style={{ textAlign: 'center', letterSpacing: '2px' }}
                            />
                            <button type="submit" className="login-btn" disabled={isLoading || verificationCode.length < 4}>
                                {isLoading ? 'Verifying...' : 'Verify'}
                            </button>
                             {error && <p className="login-error">{error}</p>}
                        </form>
                    </>
                ) : (
                    <>
                        <h2 style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '1rem', fontWeight: '600', marginBottom: '20px', padding: '0 20px' }}>
                            Sign up to see photos and videos from your friends.
                        </h2>

                        {/*
                        <button className="facebook-login" onClick={handleGoogleSignup} style={{ fontWeight: '600', width: '100%' }}>
                            Sign up with Google (Coming Soon)
                        </button>
                        */}

                        <div className="login-divider">
                            <div className="line"></div>
                            <div className="or">OR</div>
                            <div className="line"></div>
                        </div>
                        
                        <form className="login-form" onSubmit={handleSubmit}>
                            <input 
                                type="email" 
                                placeholder="Email" 
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
                            
                            <button type="submit" className="login-btn" disabled={isLoading || !email || !fullName || !username || password.length < 6}>
                                {isLoading ? 'Signing up...' : 'Sign up'}
                            </button>
                            
                            {error && <p className="login-error">{error}</p>}
                        </form>
                        
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '15px' }}>
                            By signing up, you agree to our Terms. Learn how we collect, use and share your data in our Data Policy and how we use cookies and similar technology in our Cookies Policy.
                        </p>
                    </>
                )}
            </div>

            <div className={`login-signup-box ${!isVerified ? 'blur-content' : ''}`}>
                <p>Have an account? <Link to="/login">Log in</Link></p>
            </div>
        </div>
    );
};

export default Signup;

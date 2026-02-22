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
    
    const { user, signup, verifyEmail, loginWithGoogle } = useAuth();
    const { logoPath } = useTheme();
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

                        <button className="google-btn" onClick={handleGoogleSignup}>
                            <svg className="google-icon" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.79l7.97-6.2z"/>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                <path fill="none" d="M0 0h48v48H0z"/>
                            </svg>
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

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import './BenVerificationModal.css';

const SNARKY_COMEBACKS = [
    "Then go away. This is a Ben-clusive space.",
    "Imposter detected. Initiating lockdown.",
    "You must be this Ben to ride.",
    "I bet your name is something basic like 'Steve'.",
    "Access DENIED. 🐕",
    "Not a Ben? Not a friend.",
    "ERROR 404: Ben Not Found."
];

const BenVerificationModal = ({ onVerified }) => {
    const [snark, setSnark] = useState('');
    const [shake, setShake] = useState(false);

    const handleNo = () => {
        const randomSnark = SNARKY_COMEBACKS[Math.floor(Math.random() * SNARKY_COMEBACKS.length)];
        setSnark(randomSnark);
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    return (
        <div className="ben-verification-overlay">
            <div className={`ben-verification-box ${shake ? 'shake' : ''}`}>
                <div className="ben-icon">🐕</div>
                <h2>Security Check</h2>
                <p>Is your name <strong>Ben</strong>?</p>
                
                {snark && <div className="snark-message">{snark}</div>}

                <div className="ben-actions">
                    <button className="ben-btn no" onClick={handleNo}>
                        <X size={18} /> No
                    </button>
                    <button className="ben-btn yes" onClick={onVerified}>
                        <Check size={18} /> Yes
                    </button>
                </div>
                
                <p className="terms-tiny">* We don't check ID, but we <em>know</em>.</p>
            </div>
        </div>
    );
};

export default BenVerificationModal;

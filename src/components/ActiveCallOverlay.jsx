import React, { useState, useEffect } from 'react';
import { Mic, MicOff, PhoneOff, Video } from 'lucide-react';
import { useCall } from '../contexts/CallContext';
import { useFeed } from '../contexts/FeedContext';
import './ActiveCallOverlay.css';

const ActiveCallOverlay = () => {
    const { activeCall, endCall, toggleMute, isMuted } = useCall();
    const { users } = useFeed();
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        let interval = null;
        if (activeCall?.status === 'connected') {
            interval = setInterval(() => setSeconds(s => s + 1), 1000);
        } else {
            setSeconds(0);
        }
        return () => clearInterval(interval);
    }, [activeCall?.status]);

    if (!activeCall) return null;

    const formatTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const targetUser = users[activeCall.remoteUserId] || { username: 'Unknown User' };
    const avatar = targetUser.avatarUrl || targetUser.avatar || '/default-avatar.png';

    return (
        <div className="active-call-overlay">
            <div className="active-call-island">
                <img src={avatar} alt={targetUser.username} className="island-avatar" />
                
                <div className="island-info">
                    <span className="island-name">{targetUser.fullName || targetUser.username}</span>
                    <span className={`island-status ${activeCall.status === 'connected' ? 'connected' : ''}`}>
                        {activeCall.status === 'calling' ? 'Calling...' : formatTime(seconds)}
                    </span>
                </div>

                <div className="island-actions">
                    <button className="island-btn mute-btn" onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
                        {isMuted ? <MicOff size={20} color="#ef4444" /> : <Mic size={20} color="white" />}
                    </button>
                    {/* Placeholder for future Video Call expansion! */}
                    <button className="island-btn mute-btn" onClick={() => alert("Video calls coming soon!")} aria-label="Camera Toggle">
                        <Video size={20} color="white" />
                    </button>
                    <button className="island-btn hangup-btn" onClick={endCall} aria-label="End Call">
                        <PhoneOff size={20} color="white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActiveCallOverlay;

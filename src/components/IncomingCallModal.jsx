import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { useCall } from '../contexts/CallContext';
import { useFeed } from '../contexts/FeedContext';
import './IncomingCallModal.css';

const IncomingCallModal = () => {
    const { incomingCall, acceptCall, endCall } = useCall();
    const { users } = useFeed();
    const [audio] = useState(new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg')); // Free royalty-free generic ringtone

    useEffect(() => {
        if (incomingCall) {
            audio.loop = true;
            audio.play().catch(console.error);
        } else {
            audio.pause();
            audio.currentTime = 0;
        }

        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, [incomingCall, audio]);

    if (!incomingCall) return null;

    const caller = users[incomingCall.callerId] || { username: 'Unknown User' };
    const avatar = caller.avatarUrl || caller.avatar || '/default-avatar.png';

    return (
        <div className="incoming-call-overlay">
            <div className="incoming-call-card">
                <div className="pulse-ring"></div>
                <img src={avatar} alt={caller.username} className="incoming-avatar" />
                <h3 className="incoming-username">{caller.fullName || caller.username}</h3>
                <p className="incoming-status">Benstagram Voice Call...</p>
                
                <div className="incoming-actions">
                    <button className="call-btn decline" onClick={endCall} aria-label="Decline Call">
                        <PhoneOff size={28} />
                    </button>
                    <button className="call-btn accept" onClick={acceptCall} aria-label="Accept Call">
                        <Phone size={28} fill="white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallModal;

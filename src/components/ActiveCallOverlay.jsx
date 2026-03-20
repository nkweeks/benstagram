import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useCall } from '../contexts/CallContext';
import { useFeed } from '../contexts/FeedContext';
import './ActiveCallOverlay.css';

const ActiveCallOverlay = () => {
    const { activeCall, endCall, toggleMute, isMuted, toggleCamera, isCameraOff, localStream, remoteStream } = useCall();
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

    const remoteVideoRef = useRef(null);
    const localVideoRef = useRef(null);

    useEffect(() => {
        if (activeCall?.isVideo && activeCall.status === 'connected') {
            if (remoteVideoRef.current && remoteStream) {
                remoteVideoRef.current.srcObject = remoteStream;
            }
            if (localVideoRef.current && localStream) {
                localVideoRef.current.srcObject = localStream;
            }
        }
    }, [activeCall?.isVideo, activeCall?.status, remoteStream, localStream]);

    if (!activeCall) return null;

    const formatTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const targetUser = users[activeCall.remoteUserId] || { username: 'Unknown User' };
    const avatar = targetUser.avatarUrl || targetUser.avatar || '/default-avatar.png';

    // RENDER VIDEO CALL FULLSCREEN LAYOUT
    if (activeCall.isVideo && activeCall.status === 'connected') {
        return (
            <div className="video-call-fullscreen">
                <video ref={remoteVideoRef} className="remote-video" autoPlay playsInline />
                <video ref={localVideoRef} className="local-video pip-mode" autoPlay playsInline muted />
                
                <div className="video-controls-bar">
                    <button className="island-btn mute-btn" onClick={toggleMute} aria-label="Mute">
                        {isMuted ? <MicOff size={24} color="#ef4444" /> : <Mic size={24} color="white" />}
                    </button>
                    <button className="island-btn mute-btn" onClick={toggleCamera} aria-label="Camera">
                        {isCameraOff ? <VideoOff size={24} color="#ef4444" /> : <Video size={24} color="white" />}
                    </button>
                    <button className="island-btn hangup-btn" onClick={endCall} aria-label="End Call">
                        <PhoneOff size={24} color="white" />
                    </button>
                </div>
            </div>
        );
    }

    // RENDER VOICE CALL DYNAMIC ISLAND (Or "Calling" state for Video before connection!)
    return (
        <div className="active-call-overlay">
            <div className="active-call-island">
                <img src={avatar} alt={targetUser.username} className="island-avatar" />
                
                <div className="island-info">
                    <span className="island-name">{targetUser.fullName || targetUser.username}</span>
                    <span className={`island-status ${activeCall.status === 'connected' ? 'connected' : ''}`}>
                        {activeCall.status === 'calling' ? (activeCall.isVideo ? 'Video Calling...' : 'Calling...') : formatTime(seconds)}
                    </span>
                </div>

                <div className="island-actions">
                    <button className="island-btn mute-btn" onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
                        {isMuted ? <MicOff size={20} color="#ef4444" /> : <Mic size={20} color="white" />}
                    </button>
                    {activeCall.isVideo && (
                        <button className="island-btn mute-btn" onClick={toggleCamera} aria-label="Camera Toggle">
                            {isCameraOff ? <VideoOff size={20} color="#ef4444" /> : <Video size={20} color="white" />}
                        </button>
                    )}
                    <button className="island-btn hangup-btn" onClick={endCall} aria-label="End Call">
                        <PhoneOff size={20} color="white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActiveCallOverlay;

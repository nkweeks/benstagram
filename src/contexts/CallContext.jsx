import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useAuth } from './AuthContext';

const client = generateClient();
const CallContext = createContext();

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error('useCall must be used within a CallProvider');
  return context;
};

// Public Google STUN Servers for WAN IP Traversal
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export const CallProvider = ({ children }) => {
  const { user: currentUser } = useAuth();
  
  // Call States
  const [incomingCall, setIncomingCall] = useState(null); // { callerId, signalId, sdp }
  const [activeCall, setActiveCall] = useState(null);     // { remoteUserId, isCaller, status: 'calling'|'connected' }
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  
  // Persistent refs for WebRTC callbacks
  const pcRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    // If we have a remote stream, mount it silently to a hidden audio tag natively
    if (remoteStream && !remoteAudioRef.current) {
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.autoplay = true;
        audio.playsInline = true;
        remoteAudioRef.current = audio;
    } else if (!remoteStream && remoteAudioRef.current) {
        remoteAudioRef.current.pause();
        remoteAudioRef.current.srcObject = null;
        remoteAudioRef.current = null;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!currentUser?.id) return;

    // Observe incoming signals (Offers, Answers, ICE updates, End Call) targeted at ME
    const sub = client.models.CallSignal.observeQuery({ 
        filter: { receiverId: { eq: currentUser.id } } 
    }).subscribe({
        next: async ({ items }) => {
            // Sort to process chronological signals
            const signals = items.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
            
            for (const signal of signals) {
                // Ignore signals we have already processed (In a real app, delete them after processing)
                // For MVP, if it's an offer, trigger Incoming call.
                
                if (signal.type === 'offer' && !activeCall && !incomingCall) {
                    const sdp = JSON.parse(signal.payload);
                    setIncomingCall({ callerId: signal.callerId, signalId: signal.id, sdp });
                }
                
                if (signal.type === 'answer' && activeCall?.status === 'calling' && pcRef.current) {
                    const sdp = JSON.parse(signal.payload);
                    await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
                    setActiveCall(prev => ({ ...prev, status: 'connected' }));
                }
                
                if (signal.type === 'ice-candidate' && pcRef.current) {
                    const candidate = JSON.parse(signal.payload);
                    if (candidate) {
                        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
                    }
                }
                
                if (signal.type === 'end') {
                    // Force terminate UI
                    forceEndLocalCall();
                    // Clean up DB safely
                    try { await client.models.CallSignal.delete({ id: signal.id }); } catch(e){}
                }
                
                // Cleanup processed signals so they don't fire repeatedly on soft reloads
                if (signal.type !== 'end') {
                    try { await client.models.CallSignal.delete({ id: signal.id }); } catch(e){}
                }
            }
        },
        error: (err) => console.error("Call Signal Observer Error:", err)
    });

    return () => sub.unsubscribe();
  }, [currentUser?.id, activeCall, incomingCall]);

  const toggleMute = () => {
      if (localStream) {
          localStream.getAudioTracks().forEach(track => {
              track.enabled = !track.enabled;
          });
          setIsMuted(!localStream.getAudioTracks()[0].enabled);
      }
  };

  const getMedia = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setLocalStream(stream);
      return stream;
  };

  const initializePeerConnection = (targetUserId) => {
      const pc = new RTCPeerConnection(configuration);
      pcRef.current = pc;

      // When ICE candidate arrives natively locally, push it to database for Target!
      pc.onicecandidate = async (event) => {
          if (event.candidate) {
              await client.models.CallSignal.create({
                  callerId: currentUser.id,
                  receiverId: targetUserId,
                  type: 'ice-candidate',
                  payload: JSON.stringify(event.candidate)
              });
          }
      };

      pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
              setRemoteStream(event.streams[0]);
          }
      };

      return pc;
  };

  const startCall = async (targetUserId) => {
      if (activeCall || incomingCall) return;
      
      try {
          const stream = await getMedia();
          const pc = initializePeerConnection(targetUserId);
          
          stream.getTracks().forEach(track => pc.addTrack(track, stream));

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          // Transmit Offer Signal
          await client.models.CallSignal.create({
              callerId: currentUser.id,
              receiverId: targetUserId,
              type: 'offer',
              payload: JSON.stringify(offer)
          });

          setActiveCall({ remoteUserId: targetUserId, isCaller: true, status: 'calling' });
      } catch (err) {
          console.error("Failed to start call:", err);
          forceEndLocalCall();
      }
  };

  const acceptCall = async () => {
      if (!incomingCall) return;
      
      try {
          const stream = await getMedia();
          const pc = initializePeerConnection(incomingCall.callerId);
          
          stream.getTracks().forEach(track => pc.addTrack(track, stream));

          await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.sdp));
          
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          // Transmit Answer Signal
          await client.models.CallSignal.create({
              callerId: currentUser.id,
              receiverId: incomingCall.callerId,
              type: 'answer',
              payload: JSON.stringify(answer)
          });

          setActiveCall({ remoteUserId: incomingCall.callerId, isCaller: false, status: 'connected' });
          setIncomingCall(null);
      } catch (err) {
          console.error("Failed to answer call:", err);
          forceEndLocalCall();
      }
  };

  const forceEndLocalCall = () => {
      if (pcRef.current) {
          pcRef.current.close();
          pcRef.current = null;
      }
      if (localStream) {
          localStream.getTracks().forEach(t => t.stop());
          setLocalStream(null);
      }
      setRemoteStream(null);
      setActiveCall(null);
      setIncomingCall(null);
      setIsMuted(false);
  };

  const endCall = async () => {
      const targetUser = activeCall?.remoteUserId || incomingCall?.callerId;
      
      if (targetUser && currentUser) {
         try {
             await client.models.CallSignal.create({
                 callerId: currentUser.id,
                 receiverId: targetUser,
                 type: 'end',
                 payload: '{}'
             });
         } catch(e) {}
      }
      
      forceEndLocalCall();
  };

  const value = {
      incomingCall,
      activeCall,
      startCall,
      acceptCall,
      endCall,
      toggleMute,
      isMuted
  };

  return (
    <CallContext.Provider value={value}>
      {children}
      {/* Temporary Placeholders - Real UIs will be mapped here in Phase 3 */}
      {incomingCall && (
          <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: '#ef4444', color: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
              <h4>Incoming Call!</h4>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button onClick={acceptCall} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Answer</button>
                  <button onClick={endCall} style={{ background: 'transparent', color: 'white', border: '1px solid white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Decline</button>
              </div>
          </div>
      )}
      
      {activeCall && (
          <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#18181b', color: 'white', padding: '15px 30px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong>{activeCall.status === 'calling' ? 'Calling...' : 'Call Active'}</strong>
                  <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Hardware Secured</span>
              </div>
              <button onClick={toggleMute} style={{ background: isMuted ? '#ef4444' : '#3f3f46', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}>
                 🎙️
              </button>
              <button onClick={endCall} style={{ background: '#ef4444', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
                 End Call
              </button>
          </div>
      )}
    </CallContext.Provider>
  );
};

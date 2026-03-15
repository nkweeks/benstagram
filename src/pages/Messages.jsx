import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, Info } from 'lucide-react';
import { useFeed } from '../contexts/FeedContext';
import { useMessage } from '../contexts/MessageContext';
import { useAuth } from '../contexts/AuthContext';
import './Messages.css';

const Messages = () => {
    const { users } = useFeed();
    const { user: currentUser } = useAuth();
    const { conversations, messages, sendMessage, getOrCreateConversation } = useMessage();
    
    const [activeChatId, setActiveChatId] = useState(null);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeChatId]);

    // Derived active conversation state
    const activeConversation = conversations.find(c => c.id === activeChatId);
    
    // Determine the other participant in the active conversation
    let activeUser = null;
    if (activeConversation && activeConversation.participants) {
        const otherParticipant = activeConversation.participants.find(p => p.userId !== currentUser?.id);
        if (otherParticipant) {
            activeUser = users[otherParticipant.userId] || { id: otherParticipant.userId, username: 'Unknown User', fullName: 'Unknown User', avatarUrl: '/default-avatar.png' };
        }
    }

    const activeMessages = activeChatId ? (messages[activeChatId] || []) : [];

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !activeChatId) return;

        await sendMessage(activeChatId, inputText);
        setInputText('');
    };

    // Helper to start a new mock chat for testing if no conversations exist yet
    const handleStartNewChat = async () => {
        // Find someone to chat with (e.g., ben_admirer or not_ben)
        const targetUser = Object.values(users).find(u => u.id !== currentUser?.id);
        if (targetUser) {
            const newConv = await getOrCreateConversation(targetUser.id);
            if (newConv) {
                setActiveChatId(newConv.id);
            }
        }
    };

    return (
        <div className="messages-container">
            <div className="messages-sidebar">
                <div className="messages-header">
                    <h3>{currentUser?.username || 'Messages'}</h3>
                </div>
                <div className="conversations-list">
                    {conversations.length === 0 ? (
                        <div className="no-conversations" style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                            <p>No messages yet.</p>
                            <button onClick={handleStartNewChat} className="btn-primary" style={{ marginTop: '10px' }}>Start a Chat</button>
                        </div>
                    ) : (
                        conversations.map(conv => {
                            // Find the other user in this conversation
                            const otherUserId = conv.participants?.find(p => p.userId !== currentUser?.id)?.userId;
                            const user = users[otherUserId] || { id: otherUserId, username: 'User', fullName: 'Unknown', avatarUrl: '/default-avatar.png' };
                            
                            const convMessages = messages[conv.id] || [];
                            const lastMsg = convMessages.length > 0 ? convMessages[convMessages.length - 1] : { text: 'New conversation' };
                            
                            return (
                                <div 
                                    key={conv.id} 
                                    className={`conversation-item ${activeChatId === conv.id ? 'active' : ''}`}
                                    onClick={() => setActiveChatId(conv.id)}
                                >
                                    <img src={user.avatarUrl || user.avatar || '/default-avatar.png'} alt={user.username} className="conv-avatar" />
                                    <div className="conv-info">
                                        <span className="conv-username">{user.fullName || user.username}</span>
                                        <span className="conv-preview">{lastMsg.text.substring(0, 30)}{lastMsg.text.length > 30 ? '...' : ''}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="chat-window">
                {activeChatId && activeUser ? (
                    <>
                        <div className="chat-header">
                            <div className="chat-user-info">
                                <img src={activeUser.avatarUrl || activeUser.avatar || '/default-avatar.png'} alt={activeUser.username} className="chat-header-avatar" />
                                <span>{activeUser.fullName || activeUser.username}</span>
                            </div>
                            <div className="chat-actions">
                                <Phone size={24} />
                                <Video size={24} />
                                <Info size={24} />
                            </div>
                        </div>

                        <div className="chat-messages">
                            {activeMessages.map(msg => (
                                <div key={msg.id} className={`message-bubble ${msg.senderId === currentUser?.id ? 'sent' : 'received'}`}>
                                    {msg.text}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <input 
                                type="text" 
                                placeholder="Message..." 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                maxLength={500}
                            />
                            <button type="submit" disabled={!inputText.trim()}>
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <Send size={48} />
                        <h3>Your Messages</h3>
                        <p>Send private photos and messages to a friend or group.</p>
                        <button className="send-msg-btn" onClick={handleStartNewChat}>Send Message</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;

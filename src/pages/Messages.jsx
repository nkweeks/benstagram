import React, { useState } from 'react';
import { Send, Phone, Video, Info } from 'lucide-react';
import { useFeed } from '../contexts/FeedContext';
import './Messages.css';

const Messages = () => {
    const { users } = useFeed();
    
    // Mock initial conversations
    const [conversations, setConversations] = useState([
        {
            userId: 'user1', // ben_admirer
            messages: [
                { id: 1, sender: 'user1', text: 'General Ben! Huge fan. 🫡', time: '10:00 AM' },
                { id: 2, sender: 'me', text: 'At ease, soldier.', time: '10:05 AM' },
                { id: 3, sender: 'user1', text: 'Can I get a paw-tograph?', time: '10:06 AM' }
            ]
        },
        {
            userId: 'user2', // not_ben
            messages: [
                { id: 1, sender: 'user2', text: 'Hey, are you actually a dog?', time: 'Yesterday' },
                { id: 2, sender: 'me', text: 'Whatever gave you that idea?', time: 'Yesterday' }
            ]
        }
    ]);

    const [activeChatId, setActiveChatId] = useState('user1');
    const [inputText, setInputText] = useState('');

    const activeUser = users[activeChatId];
    const activeConversation = conversations.find(c => c.userId === activeChatId);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const newMessage = {
            id: Date.now(),
            sender: 'me',
            text: inputText,
            time: 'Just now'
        };

        setConversations(prev => prev.map(conv => {
            if (conv.userId === activeChatId) {
                return { ...conv, messages: [...conv.messages, newMessage] };
            }
            return conv;
        }));

        setInputText('');
    };

    return (
        <div className="messages-container">
            <div className="messages-sidebar">
                <div className="messages-header">
                    <h3>{users['ben'].username}</h3>
                </div>
                <div className="conversations-list">
                    {conversations.map(conv => {
                        const user = users[conv.userId];
                        const lastMsg = conv.messages[conv.messages.length - 1];
                        return (
                            <div 
                                key={conv.userId} 
                                className={`conversation-item ${activeChatId === conv.userId ? 'active' : ''}`}
                                onClick={() => setActiveChatId(conv.userId)}
                            >
                                <img src={user.avatar} alt={user.username} className="conv-avatar" />
                                <div className="conv-info">
                                    <span className="conv-username">{user.fullName}</span>
                                    <span className="conv-preview">{lastMsg.text.substring(0, 30)}...</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="chat-window">
                {activeUser ? (
                    <>
                        <div className="chat-header">
                            <div className="chat-user-info">
                                <img src={activeUser.avatar} alt={activeUser.username} className="chat-header-avatar" />
                                <span>{activeUser.fullName}</span>
                            </div>
                            <div className="chat-actions">
                                <Phone size={24} />
                                <Video size={24} />
                                <Info size={24} />
                            </div>
                        </div>

                        <div className="chat-messages">
                            {activeConversation.messages.map(msg => (
                                <div key={msg.id} className={`message-bubble ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                                    {msg.text}
                                </div>
                            ))}
                        </div>

                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <input 
                                type="text" 
                                placeholder="Message..." 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
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
                        <button className="send-msg-btn">Send Message</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;

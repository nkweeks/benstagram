import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useAuth } from './AuthContext';

const client = generateClient();
const MessageContext = createContext();

export const useMessage = () => {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error('useMessage must be used within a MessageProvider');
    }
    return context;
};

export const MessageProvider = ({ children }) => {
    const { user: currentUser } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState({}); // Map of conversationId -> message array
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user's conversations
    useEffect(() => {
        if (!currentUser) {
            setConversations([]);
            setMessages({});
            setIsLoading(false);
            return;
        }

        const fetchConversations = async () => {
            setIsLoading(true);
            try {
                // Get all UserConversations for the current user to find their conversation IDs
                const { data: userConvs } = await client.models.UserConversation.list({
                    filter: { userId: { eq: currentUser.id } }
                });

                const convIds = userConvs.map(uc => uc.conversationId);
                
                if (convIds.length === 0) {
                    setConversations([]);
                    setIsLoading(false);
                    return;
                }

                // Fetch the actual Conversation objects, including their participants 
                // We use multiple queries or nested sets if supported. 
                // For simplicity, we'll fetch them individually or list all and filter, 
                // assuming a manageable number for a prototype.
                const fetchedConvs = [];
                for (const id of convIds) {
                    const { data: conv } = await client.models.Conversation.get({ id });
                    if (conv) {
                        // Also fetch the participants to know who we are talking to
                        const { data: participants } = await client.models.UserConversation.list({
                           filter: { conversationId: { eq: id } }
                        });
                        conv.participants = participants;
                        fetchedConvs.push(conv);
                        
                        // Fetch initial messages for this conversation
                        fetchMessagesForConversation(id);
                    }
                }
                
                // Sort by most recently active
                fetchedConvs.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
                setConversations(fetchedConvs);

            } catch (error) {
                console.error("Error fetching conversations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();
    }, [currentUser]);

    // Helper to fetch messages for a specific conversation
    const fetchMessagesForConversation = async (conversationId) => {
        try {
            const { data: msgs } = await client.models.Message.list({
                filter: { conversationId: { eq: conversationId } }
            });
            // Sort chronologically
            msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            
            setMessages(prev => ({
                ...prev,
                [conversationId]: msgs
            }));
        } catch (error) {
            console.error("Error fetching messages for", conversationId, error);
        }
    };

    // Subscribe to new incoming messages globally
    useEffect(() => {
        if (!currentUser) return;

        const sub = client.models.Message.onCreate().subscribe({
            next: (newMessage) => {
                // If it belongs to a conversation we are tracking, add it
                setMessages(prev => {
                    const convMessages = prev[newMessage.conversationId] || [];
                    // Prevent duplicates if we just sent it ourselves
                    if (convMessages.some(m => m.id === newMessage.id)) return prev;
                    
                    return {
                        ...prev,
                        [newMessage.conversationId]: [...convMessages, newMessage]
                    };
                });
                
                // Update conversation lastMessageAt
                setConversations(prev => {
                    const updated = prev.map(c => {
                        if (c.id === newMessage.conversationId) {
                            return { ...c, lastMessageAt: newMessage.createdAt };
                        }
                        return c;
                    });
                    return updated.sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
                });
            },
            error: (error) => console.warn("Message subscription error:", error)
        });

        return () => sub.unsubscribe();
    }, [currentUser]);

    // Action: Send a message
    const sendMessage = async (conversationId, text) => {
        if (!currentUser || !text.trim()) return null;

        try {
             const { data: newMsg } = await client.models.Message.create({
                 conversationId,
                 senderId: currentUser.id,
                 text: text.trim()
             });

             // Update conversation timestamp
             await client.models.Conversation.update({
                 id: conversationId,
                 lastMessageAt: new Date().toISOString()
             });

             return newMsg;
        } catch (error) {
             console.error("Error sending message:", error);
             return null;
        }
    };

    // Action: Create or get a conversation with a specific user
    const getOrCreateConversation = async (targetUserId) => {
        if (!currentUser) return null;
        
        // Check if we already have a conversation with this exact user
        const existingConv = conversations.find(c => 
            c.participants && 
            c.participants.some(p => p.userId === targetUserId) && 
            c.participants.length === 2 // Assuming direct messages only right now
        );

        if (existingConv) return existingConv;

        try {
            // Create the new Conversation shell
            const { data: newConv } = await client.models.Conversation.create({
                lastMessageAt: new Date().toISOString()
            });

            // Add Current User
            await client.models.UserConversation.create({
                userId: currentUser.id,
                conversationId: newConv.id
            });

            // Add Target User
            const { data: targetUserConv } = await client.models.UserConversation.create({
                userId: targetUserId,
                conversationId: newConv.id
            });
            
            newConv.participants = [{ userId: currentUser.id }, { userId: targetUserId }];

            // Update local state
            setConversations(prev => [newConv, ...prev]);
            setMessages(prev => ({ ...prev, [newConv.id]: [] }));

            return newConv;

        } catch (error) {
            console.error("Error creating conversation:", error);
            return null;
        }
    };

    const value = {
        conversations,
        messages,
        isLoading,
        sendMessage,
        getOrCreateConversation,
        fetchMessagesForConversation
    };

    return (
        <MessageContext.Provider value={value}>
            {children}
        </MessageContext.Provider>
    );
};

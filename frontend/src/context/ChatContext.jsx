import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { chatService } from '../services/chatService';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDocName, setActiveDocName] = useState('Select Document');
  
  // Keep track of the abort controller for canceling requests
  const abortControllerRef = useRef(null);

  const startNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setActiveDocName('Select Document');
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    setIsGenerating(false);
  };

  const loadConversation = async (conversationId) => {
    try {
      const data = await chatService.getConversation(conversationId);
      setCurrentConversationId(conversationId);
      setMessages(data.messages || []);
      // setActiveDocName logic could be added if document_id is stored
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
    }
  }, []);

  const sendMessage = async (query, documentId = null) => {
    if (!query.trim()) return;

    // Add user message to UI immediately
    const userMsg = { role: 'user', content: query, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    
    // Add temporary AI loading message
    const tempAiId = Date.now().toString();
    setMessages(prev => [...prev, { id: tempAiId, role: 'assistant', content: '', isGenerating: true }]);
    
    setIsGenerating(true);

    try {
      // 1. If no conversation exists, create one
      let convId = currentConversationId;
      if (!convId) {
        const newConv = await chatService.createConversation({ title: query, document_id: documentId });
        convId = newConv.id;
        setCurrentConversationId(convId);
      }

      // 2. Setup AbortController for Stop Generation
      abortControllerRef.current = new AbortController();

      // 3. Send message to backend
      const response = await chatService.sendMessage(convId, query, documentId, abortControllerRef.current.signal);
      
      // 4. Update the temporary AI message with the actual response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempAiId 
            ? { 
                role: 'assistant', 
                content: response.answer, 
                sources: response.sources, 
                evidence: response.evidence, 
                timestamp: new Date().toISOString() 
              } 
            : msg
        )
      );
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Generation aborted by user');
        // Keep the temporary message but remove generating state and add a note
        setMessages(prev => 
            prev.map(msg => 
              msg.id === tempAiId 
                ? { ...msg, content: msg.content + ' [Generation stopped]', isGenerating: false } 
                : msg
            )
        );
      } else {
        console.error("Failed to send message", error);
        setMessages(prev => 
            prev.map(msg => 
              msg.id === tempAiId 
                ? { ...msg, content: 'Sorry, there was an error processing your request.', isGenerating: false } 
                : msg
            )
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const value = {
    currentConversationId,
    setCurrentConversationId,
    messages,
    setMessages,
    isGenerating,
    activeDocName,
    setActiveDocName,
    startNewConversation,
    loadConversation,
    sendMessage,
    stopGeneration
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

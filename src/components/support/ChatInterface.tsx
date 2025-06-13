
"use client";

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { ChatMessageData } from '@/types';
import ChatMessage from './ChatMessage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, CornerDownLeft, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ScrollArea } from '@/components/ui/scroll-area';

const ADMIN_USER_ID_PLACEHOLDER = 'ADMIN_PLACEHOLDER_ID'; // Consistent placeholder

export default function ChatInterface() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) {
      setError("User not authenticated. Please log in to use support chat.");
      setLoading(false);
      return;
    }

    setLoading(true);
    const chatCollectionRef = collection(db, 'supportChats', user.uid, 'messages');
    const q = query(chatCollectionRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages: ChatMessageData[] = [];
      querySnapshot.forEach((doc) => {
        fetchedMessages.push({ id: doc.id, ...doc.data() } as ChatMessageData);
      });
      setMessages(fetchedMessages);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages. Please try again later.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;

    const messageData = {
      senderId: user.uid,
      senderName: user.displayName || user.email || 'Anonymous User',
      avatarUrl: user.photoURL || null, // Ensure null if photoURL is falsy
      text: newMessage.trim(),
      timestamp: serverTimestamp(),
    };

    try {
      const chatCollectionRef = collection(db, 'supportChats', user.uid, 'messages');
      await addDoc(chatCollectionRef, messageData);
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <LoadingSpinner size={32} />
        <p className="ml-2 text-muted-foreground">Loading chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-destructive">
        <AlertTriangle size={48} />
        <p className="text-lg font-semibold">Error</p>
        <p>{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }
  
  if (!user && !loading) {
     return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-muted-foreground">
        <p>Please log in to access support chat.</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4 space-y-2 bg-muted/20">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isCurrentUser={user?.uid === msg.senderId}
          />
        ))}
        <div ref={messagesEndRef} />
        {messages.length === 0 && !loading && (
            <div className="text-center text-muted-foreground py-10">
                <p>No messages yet. Start the conversation!</p>
            </div>
        )}
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t p-3 bg-background">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 h-10 rounded-lg"
          autoComplete="off"
        />
        <Button type="submit" size="icon" className="h-10 w-10 rounded-lg shrink-0" disabled={!newMessage.trim()}>
          <Send className="h-5 w-5" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}

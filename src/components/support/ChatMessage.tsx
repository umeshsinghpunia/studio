
"use client";

import type { ChatMessageData } from '@/types';
import { cn, getInitials } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: ChatMessageData;
  isCurrentUser: boolean;
}

// A placeholder for admin user ID. In a real app, this would come from config or auth.
const ADMIN_USER_ID_PLACEHOLDER = 'ADMIN_PLACEHOLDER_ID';

export default function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  const isAdmin = message.senderId === ADMIN_USER_ID_PLACEHOLDER;
  const alignClass = isCurrentUser || isAdmin ? 'items-end' : 'items-start';
  const bubbleClass = isCurrentUser || isAdmin
    ? 'bg-primary text-primary-foreground rounded-br-none'
    : 'bg-muted text-foreground rounded-bl-none';
  
  const senderName = isAdmin ? 'Support Team' : message.senderName;
  const avatarFallback = isAdmin ? 'ST' : getInitials(message.senderName);
  const avatarSrc = isAdmin ? "https://placehold.co/40x40.png" : message.avatarUrl; // Placeholder for admin avatar
  const avatarAiHint = isAdmin ? "support avatar" : "user avatar";


  return (
    <div className={cn('flex flex-col gap-1 p-3', alignClass)}>
      <div className={cn('flex items-center gap-2', isCurrentUser || isAdmin ? 'flex-row-reverse' : 'flex-row')}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatarSrc} alt={senderName} data-ai-hint={avatarAiHint} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <div
          className={cn(
            'max-w-[70%] rounded-lg px-3 py-2 shadow-sm',
            bubbleClass
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
        </div>
      </div>
      <span className={cn("text-xs text-muted-foreground", isCurrentUser || isAdmin ? 'text-right mr-10' : 'text-left ml-10')}>
        {message.timestamp ? format(message.timestamp.toDate(), 'p') : 'Sending...'}
      </span>
    </div>
  );
}

export interface ChatMessage {
    id: number; // Unique identifier
    type: 'text' | 'image';
    content: string; // Unified content property for both text and image URL
    sender: 'user' | 'bot';
    isLoading?: boolean; // Indicates if the message is loading
    isAnimated?: boolean; // Indicates if the message should be animated
}

export interface ChatRoom {
    id: number;
    chatTitle: string;
    history: ChatMessage[];
    lastMsgTimestamp: string;
}

export interface User {
    nickname: string;
    username: string;
    profilePhoto: string
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    code?: number;
}
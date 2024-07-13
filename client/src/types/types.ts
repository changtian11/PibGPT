export interface ChatMessage {
    id: number; // Unique identifier
    type: 'text' | 'image';
    content: string;
    sender: 'user' | 'bot';
    isLoading?: boolean; // Indicates if the message is loading
    isAnimated?: boolean; // Indicates if the message should be animated
}

export interface ChatRoom {
    roomId: number;
    topic: string;
    messages: ChatMessage[];
    lastMessageTime: string;
}

export interface User {
    nickname: string;
    username: string;
    pfpId?: string;
    role: string
}

export interface Login {
    username: string;
    password: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    code?: number;
}
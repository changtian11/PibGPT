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
    title: string;
    history: ChatMessage[];
    dateTime: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}
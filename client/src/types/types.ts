export interface ChatMessage {
    type: 'text' | 'file',
    content: string // text or fileId
}
export interface ChatMessageFromServer extends ChatMessage {
    role: 'user' | 'bot';
    timestamp: string;
}
export interface ChatMessageToRender extends ChatMessageFromServer {
    isLoading: boolean; // Indicates if the message is loading
    isAnimated: boolean; // Indicates if the message should be animated
}
export interface ChatRoomFromServer {
    roomId: string,
    topic: string,
    lastMessageTime: string
}

export interface ChatRoomHistoryFromServer extends ChatRoomFromServer {
    messages: ChatMessageFromServer[]
}
export interface User {
    nickname: string;
    username: string;
    pfpId?: string;
    role: string
}
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    code?: number;
}

export interface WsServerMessage<T> {
    success: boolean,
    event: string,
    payload?: T
}
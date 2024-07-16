import type { ChatMessage, ChatMessageFromServer, WsServerMessage } from "@/types/types";

interface Message<T> {
    event: 'join' | 'leave' | 'message';
    payload?: T;
}

interface JoinMessage {
    roomId: string
}

type MessageCallback = (message: ChatMessageFromServer | null) => void;
type ErrorCallback = (error: Event | null) => void;

class WebsocketService {
    private ws: WebSocket | null = null;
    private onMessageCallback: MessageCallback | null = null;
    private onErrorCallback: ErrorCallback | null = null;
    private onJoinCallback: (() => void) | null = null;
    private isReady: boolean = false;
    public isJoined: boolean = false;
    public joinedRoomId: string | null = null;

    connectAndJoinRoom(roomId: string, onOpen: () => void) {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        // const port = window.location.port;
        const port = 3000;
        let WS_URL;
        if (!port) {
            WS_URL = `${protocol}://${hostname}/ws`;
        }
        else {
            WS_URL = `${protocol}://${hostname}:${port}/ws`;
        }
        this.ws = new WebSocket(WS_URL);
        this.ws.onopen = () => {
            console.log('WebSocket connection established');
            if (onOpen) {
                onOpen();
            }
        };

        this.ws.onmessage = (event: MessageEvent) => {
            const message: WsServerMessage<any> = JSON.parse(event.data);
            console.log('Server-side message:')
            console.log(message);
            switch (message.event) {
                case 'connection':
                    if (message.success) {
                        this.isReady = true;
                        this.joinRoom(roomId);
                    }
                    break;
                case 'join':
                    if (message.success) {
                        console.info(`Joined room [${message.payload}]`);
                        this.isJoined = true;
                        this.joinedRoomId = message.payload;
                        if (this.onJoinCallback) {
                            this.onJoinCallback();
                        }
                    }
                    else {
                        console.error(`Failed to join room: ${message.payload}`);
                        this.isJoined = false;
                        this.joinedRoomId = null;
                    }
                    break;
                case 'leave':
                    if (message.success) {
                        console.info(`Left room [${message.payload}]`);
                        this.isJoined = false;
                        this.joinedRoomId = null;
                    }
                    else {
                        console.error(`Failed to leave room: ${message.payload}`);
                    }
                    break;
                default:
                    if (this.onMessageCallback) {
                        this.onMessageCallback(message.payload);
                    }
            }
        };

        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
            this.isJoined = false;
            this.joinedRoomId = null;
            this.isReady = false;
        };

        this.ws.onerror = (error: Event) => {
            console.error('WebSocket error:', error);
            if (this.onErrorCallback) {
                this.onErrorCallback(error);
            }
        };
    }

    send(message: Message<any>) {
        if (this.ws && this.ws.readyState === this.ws.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
        else {
            console.log(`Failed to send messasge:`);
            console.log(message);
        }
    }

    sendChatMessage(content: string) {
        const chatMessage: Message<ChatMessage> = {
            event: 'message',
            payload: {
                type: 'text',
                content
            }
        }
        if (this.isJoined) this.send(chatMessage);
    }

    joinRoom(roomId: string, onJoinCallback?: () => void) {
        this.onJoinCallback = onJoinCallback || null;
        console.log(`Joining the room [${roomId}]`);
        const joinMessage: Message<JoinMessage> = {
            event: 'join',
            payload: {
                roomId
            }
        }
        this.send(joinMessage);
    }

    leaveRoom() {
        this.send({ event: 'leave', payload: {} });
    }

    onMessage(callback: MessageCallback) {
        this.onMessageCallback = callback;
    }

    getWsState() {
        return this.isReady;
    }

    close() {
        this.leaveRoom();
        if (this.ws) {
            this.ws.close();
        }
        this.isJoined = false;
        this.ws = null;
    }
}

export default new WebsocketService();
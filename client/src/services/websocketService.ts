import type { ChatMessage, WsClientMessage, WsRoomMessage, WsServerMessage } from "@/types/types";

type MessageCallback = (message: WsServerMessage<any> | null) => void;
type ErrorCallback = (error: Event | null) => void;
type WsErrorCallback = (errorMessage: string | null) => void;
type getRoomListCallback = (roomList: WsRoomMessage[] | null) => void;

class WebsocketService {
    private ws: WebSocket | null = null;
    private onConnectionSuccessCb: (() => void) | null = null;
    private onConnectionFailCb: WsErrorCallback | null = null;
    private onJoinCb: (() => void) | null = null;
    private onMessageCb: MessageCallback | null = null;
    private onErrorCb: ErrorCallback | null = null;
    private onGetRoomListCb: getRoomListCallback | null = null;
    private isReady: boolean = false;
    private isJoined: boolean = false;
    private joinedRoomId: string | null = null;

    connect(onSuccessCb: (() => void) | null, onFailCb: ((error: string | null) => void) | null) {
        this.onConnectionSuccessCb = onSuccessCb;
        this.onConnectionFailCb = onFailCb;
        const host = window.location.host;
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        let WS_URL: string = '';
        if (import.meta.env.MODE === 'development') {
            WS_URL = `${protocol}://localhost:${import.meta.env.VITE_SERVER_PORT}/ws`
        }
        else {
            WS_URL = `${protocol}://${host}/ws`
        }
        this.ws = new WebSocket(WS_URL);
        this.ws.onopen = () => {
            console.log('WebSocket connection open');
        };

        this.ws.onmessage = (event: MessageEvent) => {
            const message = JSON.parse(event.data) as WsServerMessage<any>;
            console.log('Server-side message: ', message)
            switch (message.event) {
                case 'connection':
                    this.isReady = message.success;
                    if (message.success) {
                        if (this.onConnectionSuccessCb) {
                            console.log('WebSocket bilateral connection established');
                            this.onConnectionSuccessCb();
                        }
                    }
                    else {
                        console.error('WebSocket connection failed');
                        if (this.onConnectionFailCb) {
                            this.onConnectionFailCb(message.payload);
                        }
                    }
                    break;
                case 'join':
                    if (message.success) {
                        console.info(`Joined room [${message.payload}]`);
                        this.isJoined = true;
                        this.joinedRoomId = message.payload;
                        if (this.onJoinCb) {
                            this.onJoinCb();
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
                case 'room-list':
                    if (message.success) {
                        const roomList = message.payload as WsRoomMessage[];
                        console.info(`Availble rooms: ${roomList.length}`);
                        if (this.onGetRoomListCb) {
                            this.onGetRoomListCb(roomList);
                        }
                    }
                    else {
                        if (this.onGetRoomListCb) {
                            this.onGetRoomListCb(null);
                        }
                    }
                    break;
                default:
                    // Client handle other events (user-joined, user-left, message, modify-title);
                    if (this.onMessageCb) {
                        this.onMessageCb(message);
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
            this.isReady = false;
            if (this.onErrorCb) {
                this.onErrorCb(error);
            }
        };
    }

    send(message: WsClientMessage<any>) {
        console.log('Client sent: ', message);
        // if (this.ws && this.ws.readyState === this.ws.OPEN) {
        //     this.ws.send(JSON.stringify(message));
        // }
        if (this.ws && this.isReady) {
            this.ws.send(JSON.stringify(message));
        }
        else {
            console.log(`Failed to send messasge:`);
            console.log(message);
        }
    }

    sendChatMessage(content: string) {
        const chatMessage: WsClientMessage<ChatMessage> = {
            event: 'message',
            payload: {
                type: 'text',
                content
            }
        }
        if (this.isJoined) this.send(chatMessage);
    }

    updateTopic(newTitle: string | null | undefined) {
        console.info(newTitle);
        if (!!newTitle && newTitle.length > 0) {
            if (this.isJoined) this.send({
                event: 'update-topic',
                payload: {
                    title: newTitle
                }
            } as WsClientMessage<any>)
        }
    }

    joinRoom(roomId: string, onJoinCallback?: () => void) {
        this.onJoinCb = onJoinCallback || null;
        console.log(`Joining the room [${roomId}]`);
        const joinMessage: WsClientMessage<{ roomId: string }> = {
            event: 'join',
            payload: {
                roomId
            }
        }
        this.send(joinMessage);
    }

    leaveRoom() {
        const leaveMsg: WsClientMessage<null> = {
            event: 'leave'
        }
        this.send(leaveMsg);
    }

    onMessage(callback: MessageCallback) {
        this.onMessageCb = callback;
    }

    getWsConnectionState() {
        return this.isReady;
    }

    getJoinState() {
        return this.isJoined;
    }

    getJoinedRoomId() {
        return this.joinedRoomId;
    }

    getRoomList(onSuccessCb: getRoomListCallback) {
        if (!!onSuccessCb) {
            this.onGetRoomListCb = onSuccessCb;
        }
        this.send({
            event: 'room-list'
        })
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
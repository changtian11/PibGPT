<template>
    <NMessageProvider>
        <Transition>
            <ChatRoomListModal v-if="pageState.showChatRoomListModal"
                @cancel="pageState.showChatRoomListModal = false" />
        </Transition>
        <Transition>
            <FileUploadModal v-if="pageState.showFileUploadModal" @cancel="pageState.showFileUploadModal = false"
                @upload="handleUpload" :uploading-file="pageState.uploadingFileState" />
        </Transition>
        <div class="page-container">
            <BotFloatingMenu :user="loginState.user" @scroll-to-bottom="chatWrapRef.scrollToBottom(true)" />
            <div class="main-container">
                <div class="connection-status-bar box-shadow-level-one">
                    <div v-if="connectionState === wsConnectionState.CLOSE" class="status close">
                        <div class="status-light">
                        </div>
                        <div class="status-text">
                            未连接
                        </div>
                    </div>
                    <div v-if="connectionState === wsConnectionState.CONNECTING" class="status connecting">
                        <div class="status-light">
                        </div>
                        <div class="status-text">
                            连接中
                        </div>
                    </div>
                    <div v-if="connectionState === wsConnectionState.ESTABLISHED" class="status established">
                        <div class="status-light">
                        </div>
                        <div class="status-text">
                            等待加入
                        </div>
                    </div>
                    <div v-if="connectionState === wsConnectionState.JOINED_ROOM" class="status joined-room">
                        <div class="status-light">
                        </div>
                        <div class="status-text">
                            对话中
                        </div>
                    </div>
                    <div class="connected-users">
                        <template v-for="room in chatRoomList">
                            <div class="user" @click="joinRoom(room.roomId, room.user)">
                                <NTooltip placement="bottom" trigger="hover">
                                    <template #trigger>
                                        <NAvatar size="large" round
                                            :src="room.user.pfpId ? `/static/pfp/${room.user.pfpId}` : robotGreen">
                                        </NAvatar>
                                    </template>
                                    {{ `加入${room.user.username}的聊天` }}
                                </NTooltip>
                            </div>
                        </template>
                    </div>
                    <div class="actions">
                        <NButton @click="getRoomList">刷新聊天</NButton>
                        <NButton @click="leaveRoom">断开聊天</NButton>
                    </div>
                </div>
                <div class="title-bar box-shadow-level-one">
                    <NInput placeholder="无标题" v-model:value="titleBarContent" />
                    <NButton @click="updateTopic">修改标题</NButton>
                </div>
                <ChatWrapper ref="chatWrapRef" :messages="chatMessages"
                    :left-pfp-uri="`/static/pfp/${currentUser?.pfpId}`" :folded="false" :loading="false"
                    :transitioned="false" :show-actions="false" />
                <InputBox @submit="handleSubmit" @file-upload="pageState.showFileUploadModal = true"
                    v-model="pageState.inputBoxContent" :awaiting-response="false" :animation-playing="false"
                    placeholder="回复信息" />
            </div>
        </div>
    </NMessageProvider>
</template>

<script setup lang="ts">
    import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
    import type { Ref } from 'vue';
    import { NButton, NMessageProvider, NAvatar, NTooltip, NInput } from 'naive-ui';
    import ChatWrapper from '@/components/ChatWrapper.vue';
    import InputBox from '@/components/InputBox.vue';
    import ChatRoomListModal from '@/components/modals/ChatRoomListModal.vue';
    import FileUploadModal from '@/components/modals/FileUploadModal.vue';
    import BotFloatingMenu from '@/components/BotFloatingMenu.vue';
    import wss from '@/services/websocketService';
    import axios from 'axios';
    import type { ApiResponse, ChatMessageFromServer, ChatMessageToRender, ChatRoomFromServer, User, WsServerMessage, ChatRoomHistoryFromServer, WsRoomMessage } from '../types/types';
    import robotGreen from '@/assets/robot-green.png'

    const chatWrapRef = ref() as Ref<InstanceType<typeof ChatWrapper>>;

    interface PageState {
        showChatRoomListModal: boolean,
        showFileUploadModal: boolean,
        inputBoxContent: string,
        autoJoin: boolean,
        uploadingFileState: {
            isUploading: boolean,
            error: string | null
        }
    }

    const pageState = reactive<PageState>({
        showChatRoomListModal: false,
        showFileUploadModal: false,
        inputBoxContent: '',
        autoJoin: true,
        uploadingFileState: {
            isUploading: false,
            error: null
        }
    })

    interface LoginState {
        isLoggedin: boolean;
        user: User | null
    }

    const loginState = reactive<LoginState>({
        isLoggedin: false,
        user: null
    })

    enum wsConnectionState {
        CLOSE,
        CONNECTING,
        ESTABLISHED,
        JOINED_ROOM
    }

    const chatRoomList: Ref<WsRoomMessage[]> = ref([]);
    const connectionState: Ref<wsConnectionState> = ref(wsConnectionState.CLOSE);
    const chatRoom: Ref<null | ChatRoomFromServer> = ref(null);
    const currentUser: Ref<null | User> = ref(null);
    const chatMessages: Ref<ChatMessageToRender[]> = ref([]);
    const titleBarContent = ref("");

    const validateLogin = async () => {
        try {
            const res = await axios.get<ApiResponse<User>>('/api/auth', {
                withCredentials: true
            });
            console.log(res);
            if (res.data.success) {
                if (res.data.data.role !== 'bot') window.location.href = '/';
                loginState.isLoggedin = true;
                loginState.user = res.data.data;
            }
            else {
                window.location.href = '/';
            }
        }
        catch (error) {
            // let apiError = createApiError(error)
            console.error(error)
        }
    }

    const handleWsConnect = async () => {
        if (wss.getJoinState()) return;
        if (wss.getWsConnectionState()) {
            return;
        }
        else {
            connectionState.value = wsConnectionState.CONNECTING;
            wss.connect(() => {
                connectionState.value = wsConnectionState.ESTABLISHED;
            }, null)
        }
    }

    const handleSubmit = async () => {
        const content = pageState.inputBoxContent;
        if (!content || String(content).trim().length === 0) {
            return;
        }
        try {
            wss.sendChatMessage(content);
            pageState.inputBoxContent = "";
        }
        catch (err) {
            console.error(err);
        }
    }

    const handleUpload = async (fileToUpload: File | null) => {
        if (!fileToUpload) return;
        if (connectionState.value !== wsConnectionState.JOINED_ROOM) return;
        pageState.uploadingFileState = {
            isUploading: true,
            error: null
        };

        try {
            const uploadRes = await axios.post<ApiResponse<undefined>>('/api/chatroom/upload', {
                file: fileToUpload,
                roomId: chatRoom.value?.roomId
            }, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            })

            pageState.uploadingFileState = {
                isUploading: false,
                error: null
            }

            pageState.showFileUploadModal = false;
        } catch (err) {
            console.error(err);
            pageState.uploadingFileState = {
                isUploading: false,
                error: 'Upload failed'
            }
        }
    }

    const updateTopic = () => {
        if (wss.getJoinState()) {
            wss.updateTopic(titleBarContent.value);
        }
    }

    const getRoomList = () => {
        if (wss.getWsConnectionState()) {
            wss.getRoomList(roomList => {
                if (roomList) {
                    console.log(roomList);
                    chatRoomList.value = roomList;
                }
            })
        }
    }

    const getChatRoomHistory = async (roomId: string) => {
        chatRoom.value = null;
        try {
            const res = await axios.get<ApiResponse<ChatRoomHistoryFromServer>>(`/api/chatroom/h/${roomId}`, {
                withCredentials: true
            });
            if (res.data.success) {
                const chatRoomData = res.data.data;
                chatRoom.value = {
                    roomId: chatRoomData.roomId,
                    topic: chatRoomData.topic,
                    lastMessageTime: chatRoomData.lastMessageTime
                }
                chatMessages.value = chatRoomData.messages.map(msg => {
                    return {
                        isAnimated: false,
                        isLoading: false,
                        position: msg.role === 'bot' ? 'right' : 'left',
                        ...msg
                    }
                });
            }
        }
        catch (err) {
            console.error(err);
        }
    }

    const joinRoom = async (roomId: string, user: User) => {
        if (wss.getWsConnectionState()) {
            chatMessages.value = [];
            chatRoom.value = null;
            setTimeout(async () => {
                wss.joinRoom(roomId, () => {
                    connectionState.value = wsConnectionState.JOINED_ROOM
                })
                currentUser.value = user;
                await getChatRoomHistory(roomId);
            }, 500)

        }
    }

    const leaveRoom = () => {
        wss.leaveRoom();
        chatMessages.value = [];
        chatRoom.value = null;
    }

    const handleOnWsServerMessage = async (wsMessage: WsServerMessage<any> | null) => {
        if (wsMessage) {
            switch (wsMessage.event) {
                case 'message':
                    if (wsMessage.success) {
                        const msg = wsMessage.payload as ChatMessageFromServer;
                        const msgToRender: ChatMessageToRender = {
                            isAnimated: false,
                            isLoading: false,
                            position: msg.role === 'bot' ? 'right' : 'left',
                            ...msg
                        };
                        chatMessages.value.push(msgToRender);
                    }
                    else {
                        // to-do
                    }
                    break;
                case 'user-joined':
                    if (wsMessage.success) {
                        const roomMsg = wsMessage.payload as WsRoomMessage;
                        // Auto-join user's chatroom
                        console.info(roomMsg);
                        if (roomMsg && roomMsg.user.role === 'user') {
                            await joinRoom(roomMsg.roomId, roomMsg.user);
                        }
                    }
                    else {
                        // to-do
                    }
                    break;
                case 'user-left':
                    if (wsMessage.success) {
                        console.info('user has left the current chat room')
                    }
                    break;
                case 'update-topic':
                    if (wsMessage.success) {
                        console.info('updated title');
                        if (chatRoom.value && chatRoom.value.topic) {
                            chatRoom.value.topic = wsMessage.payload.title;
                        }
                    }
                    else {
                        //to-do
                    }
                    break;
                default:
                    break;

            }
        }
    }



    watch(chatRoom, (newVal, oldVal) => {
        console.log(newVal, oldVal);
        if (newVal && newVal.topic) {
            titleBarContent.value = newVal.topic;
        }
    }, { immediate: true })

    onMounted(async () => {
        await validateLogin();
        wss.onMessage(handleOnWsServerMessage);
        handleWsConnect();
        getRoomList();
    })

    onUnmounted(() => {
        if (wss.getJoinState()) {
            wss.leaveRoom()
        }
        if (wss.getWsConnectionState()) {
            wss.close()
        }
    })

</script>

<style>
    @import "@/stylesheets/modal.css";
</style>

<style lang="css" scoped>
    .main-container {
        min-width: 320px;
        width: 95%;
        display: flex;
        height: 100%;
        padding: 0.1rem 0 2rem;
        background-color: var(--item-color);
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: center;
        transition: margin-bottom .5s ease-out;
    }

    @media screen and (min-width: 600px) {

        .main-container {
            max-width: 900px;
            width: 65%;
            padding: 1rem 12px 3rem;
        }
    }

    .connection-status-bar {
        padding: 1.5rem 1.8rem;
        border-radius: 1rem;
        margin: 0 0 0.4rem;
        background-color: var(--item-bg);
        display: flex;
        flex-flow: row;
        flex-wrap: nowrap;
    }

    .connection-status-bar .status {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: flex-start;
    }

    .connection-status-bar .title {
        flex-grow: 1;
    }

    .connection-status-bar .status-light {
        height: 24px;
        width: 24px;
        border-radius: 50%;
        border: 2px solid grey;
    }

    .connection-status-bar .established .status-light {
        border: 2px solid yellow;
    }

    .connection-status-bar .joined-room .status-light {
        border: 2px solid green;
    }

    .connection-status-bar .status-text {
        font-size: 18px;
        line-height: 24px;
        font-weight: 500;
        color: var(--text-secondary);
        padding-left: 1rem;

    }

    .connected-users {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        overflow-y: hidden;
        overflow-x: auto;
        flex-grow: 1;
        margin: 0 8px;
        align-items: center;
        padding: 0 4px;
        gap: 8px;
    }

    .connected-users>.user {
        cursor: pointer;
        display: flex;
    }

    .title-bar {
        background-color: var(--item-bg);
        border-radius: 1rem;
        margin: 0.4rem 0;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        padding: 0.4rem 1rem;
        text-align: left;
    }
</style>
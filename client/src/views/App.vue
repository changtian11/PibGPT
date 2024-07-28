<template>
  <NMessageProvider>
    <Transition>
      <LoginModal v-if="pageState.showLoginModal" @cancel="pageState.showLoginModal = false"
        @login-success="loginSuccessHandler" />
    </Transition>
    <Transition>
      <ChatRoomListModal v-if="pageState.showChatRoomListModal" @cancel="pageState.showChatRoomListModal = false"
        :current-room-id="chatRoomState.chatRoom?.roomId" />
    </Transition>
    <div class="page-container">
      <FloatingMenu @scroll-to-bottom="chatWrapRef.scrollToBottom(true)" @login="pageState.showLoginModal = true"
        :is-logged-in="loginState.isLoggedin" :user="loginState.user" @logout-success="validateLogin"
        @new-chat="handleNewChatRoom" @history="pageState.showChatRoomListModal = true"
        :allow-new-chat-btn="chatRoomState.chatRoom !== null" />
      <div class="main-container" :class="{ folded: pageState.isChatWrapFolded }">
        <TitleLogo :chat-title="chatRoomState.chatRoom?.topic" :folded="pageState.isChatWrapFolded" />
        <ChatWrapper ref="chatWrapRef" :messages="chatMessages" :right-pfp-uri="`/static/pfp/${loginState.user?.pfpId}`"
          :folded="pageState.isChatWrapFolded" :awaiting-left-response="pageState.isAwaitingResponse"
          @animation-playing="(state: boolean) => { pageState.isMsgAnimationPlaying = state }"
          :transitioned="pageState.isChatWrapTransitioned" :loading="pageState.isPageLoading" />
        <InputBox @submit="handleSubmit" @stop="handleStop" @file-upload="handleFileUpload"
          v-model="pageState.inputBoxContent" :awaiting-response="pageState.isAwaitingResponse"
          :animation-playing="pageState.isMsgAnimationPlaying" />
        <div id="copyright">
          <span>©PibGPT 2024. All rights reserved.</span>
          <span>内容由 AI 大模型生成，请仔细甄别。</span>
        </div>
      </div>
    </div>
  </NMessageProvider>
</template>

<script setup lang="ts">
  import FloatingMenu from '@/components/FloatingMenu.vue';
  import InputBox from '@/components/InputBox.vue';
  import TitleLogo from '@/components/TitleLogo.vue';
  import ChatWrapper from '@/components/ChatWrapper.vue';
  import LoginModal from '@/components/modals/LoginModal.vue';
  import ChatRoomListModal from '@/components/modals/ChatRoomListModal.vue';
  import { ref, onMounted, reactive, onBeforeUnmount } from 'vue';
  import type { Ref } from 'vue';
  import type { ApiResponse, ChatMessageFromServer, ChatMessageToRender, ChatRoomFromServer, User, WsServerMessage, ChatRoomHistoryFromServer } from '../types/types';
  import { NMessageProvider } from 'naive-ui';
  import wss from '@/services/websocketService';
  import axios from 'axios';


  // Page State
  const pageState = reactive({
    showLoginModal: false,
    showChatRoomListModal: false,
    showFileUploadModal: false,
    isMsgAnimationPlaying: false,
    isAwaitingResponse: false,
    isChatWrapFolded: true,
    isPageLoading: true,
    inputBoxContent: "",
    isChatWrapTransitioned: false
  })

  // Page element refs
  const chatWrapRef = ref() as Ref<InstanceType<typeof ChatWrapper>>;

  // Chat model
  interface LoginState {
    isLoggedin: boolean;
    user: User | null
  }

  const loginState = reactive<LoginState>({
    isLoggedin: false,
    user: null
  });

  interface ChatRoomState {
    chatRoom: null | ChatRoomFromServer,
    isWsConnected: boolean
  }

  const chatRoomState = reactive<ChatRoomState>({
    chatRoom: null,
    isWsConnected: false
  });

  const chatMessages: Ref<ChatMessageToRender[]> = ref([]);


  // Validate the login and fetch user data
  const validateLogin = async () => {
    try {
      const res = await axios.get<ApiResponse<User>>('/api/auth', {
        withCredentials: true
      });
      if (res.data.success) {
        if (res.data.data.role === 'bot') window.location.href = 'bot.html';
        loginState.isLoggedin = true;
        loginState.user = res.data.data;
      }
      else {
        loginState.isLoggedin = false;
        loginState.user = null;
        if (Number(res.data.code) === 401) {
          // suppress first time loading error
          return;
        }
        else {
          console.error(`Error[${res.data.code}]: ${res.data.message}`)
        }
      }
    }
    catch (error) {
      // let apiError = createApiError(error)
      console.error(error)
    }
  }

  const loginSuccessHandler = () => {
    validateLogin();
    setTimeout(() => pageState.showLoginModal = false, 200);
  }

  const wsConnectAndJoinRoom = async () => {
    try {
      if (wss.getJoinState() && chatRoomState.chatRoom && chatRoomState.chatRoom!.roomId === wss.getJoinedRoomId()) { return; }

      if (!chatRoomState.chatRoom) {
        await getNewChatRoom();
      }
      const roomId = chatRoomState.chatRoom!.roomId;
      console.log(roomId);
      if (wss.getWsConnectionState()) {
        if (wss.getJoinState() && roomId === wss.getJoinedRoomId()) {
          return;
        }
        if (wss.getJoinState()) wss.leaveRoom();
        wss.joinRoom(roomId, () => {
          chatRoomState.isWsConnected = true;
          console.log('Joined room successfully');
        });
      }
      else {
        chatRoomState.isWsConnected = false;
        wss.connect(() => {
          chatRoomState.isWsConnected = true;
          wss.joinRoom(roomId, () => {
            console.log('Joined room successfully');
          });
        }, null)
      }
      window.history.pushState(null, '', `/${chatRoomState.chatRoom?.roomId}`);
    }
    catch (err) {
      console.error(err);
      throw err;
    }
  }

  const waitForReady = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (wss.getJoinState()) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100); // Check every 100ms

      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Failed to connect'));
      }, 5000); // Timeout after 5 seconds
    });
  };

  // Handle InputBox Submission
  const handleSubmit = async () => {
    if (!loginState.isLoggedin) {
      pageState.showLoginModal = true;
      return;
    }

    const content = pageState.inputBoxContent;
    if (!content || String(content).trim().length === 0) {
      return;
    }

    try {
      await wsConnectAndJoinRoom();
      await waitForReady();
      wss.sendChatMessage(content);
      pageState.inputBoxContent = "";
      // Also add a loading prompt for the response
      pageState.isChatWrapFolded = false;
      setTimeout(() => {
        pageState.isAwaitingResponse = true;
      }, 500)
    }
    catch (err) {
      console.error(err);
    }
  }

  const handleFileUpload = () => {
    if (loginState.isLoggedin) {
      pageState.showFileUploadModal = true;
    }
    else {
      pageState.showLoginModal = true;
    }
  }

  const handleStop = () => {
    pageState.isAwaitingResponse = false;
  }

  const getChatRoomHistory = async (roomId: string) => {
    chatRoomState.chatRoom = null;
    try {
      const res = await axios.get<ApiResponse<ChatRoomHistoryFromServer>>(`/api/chatroom/h/${roomId}`, {
        withCredentials: true
      });
      console.log(res);
      if (res.data.success) {
        const chatRoomData = res.data.data;
        chatRoomState.chatRoom = {
          roomId: chatRoomData.roomId,
          topic: chatRoomData.topic,
          lastMessageTime: chatRoomData.lastMessageTime
        }
        chatMessages.value = chatRoomData.messages.map(msg => {
          return {
            isAnimated: false,
            isLoading: false,
            position: msg.role === 'bot' ? 'left' : 'right',
            ...msg
          }
        });
        pageState.isChatWrapFolded = false;
      }
    }
    catch (err) {
      console.error(err);
    }
    finally {
      pageState.isAwaitingResponse = false;
    }
  }

  const getNewChatRoom = async () => {
    chatRoomState.chatRoom = null;
    const res = await axios.get<ApiResponse<ChatRoomFromServer>>('/api/chatroom/create', {
      withCredentials: true
    })
    if (res.data.success) {
      chatRoomState.chatRoom = res.data.data;
    }
    else {
      console.error(res.data.message);
      throw Error(`Error ${res.data.code}: ${res.data.message}`);
    }
  }

  const handleNewChatRoom = async () => {
    if (!loginState.isLoggedin) {
      pageState.showLoginModal = true;
      return;
    }
    wss.close();
    chatMessages.value = [];
    pageState.inputBoxContent = "";
    pageState.isChatWrapFolded = true;
    pageState.isAwaitingResponse = false;
    pageState.isMsgAnimationPlaying = false;
    chatRoomState.chatRoom = null;
    window.history.pushState(null, '', '/');
  }

  const handleOnMessage = (message: WsServerMessage<any> | null) => {
    if (message) {
      switch (message.event) {
        case 'message':
          const msg = message.payload as ChatMessageFromServer;
          let msgToRender: ChatMessageToRender | null = null;
          if (msg.role === 'bot') {
            pageState.isAwaitingResponse = false;
            msgToRender = {
              isAnimated: true,
              isLoading: false,
              position: 'left',
              ...msg
            }
          }
          else {
            msgToRender = {
              isAnimated: false,
              isLoading: false,
              position: 'right',
              ...msg
            }
          };
          chatMessages.value.push(msgToRender);
          break;
        case 'update-topic':
          if (message.success) {
            const newTopic = message.payload.title as string;
            if (chatRoomState.chatRoom) {
              chatRoomState.chatRoom.topic = newTopic;
            }
          }
          else {

          }

          break;
        default:
          break;
      }
    }
  }


  onMounted(async () => {
    const path = window.location.pathname;
    let urlParam = path !== '/' ? path.substring(1) : null;
    const roomIdReg = new RegExp(/^\d{13}-\d{7}$/);
    await validateLogin();
    wss.onMessage(handleOnMessage);
    if (urlParam) {
      if (loginState.isLoggedin && roomIdReg.test(urlParam)) {
        await getChatRoomHistory(urlParam);
      }
      else {
        window.history.pushState(null, '', '/'); // Remove ID from URL
      }
    }
    pageState.isChatWrapTransitioned = true;
  });

  onBeforeUnmount(() => {
    if (wss.getJoinState()) {
      wss.leaveRoom();
    }
    wss.close();
  });
</script>

<style>
  @import "@/stylesheets/modal.css";
</style>

<style scoped>
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

  .main-container.collapse {
    margin-bottom: 6rem;
  }

  #copyright {
    display: none;
    margin-top: 8px;
    flex-wrap: wrap;
    flex-direction: row;
    user-select: none;
    gap: 8px;
    text-align: center;
    align-items: center;
    justify-content: center;
  }

  #copyright>span {
    font-size: 12px;
    color: gray;
    line-height: 16px;
  }

  @media screen and (min-width: 600px) {

    .main-container {
      max-width: 900px;
      width: 65%;
      padding: 1rem 12px 3rem;
    }

    #copyright {
      display: inline-flex;
    }
  }
</style>

<script setup lang="ts">
  import FloatingMenu from '../components/FloatingMenu.vue';
  import InputBox from '../components/InputBox.vue';
  import TitleLogo from '../components/TitleLogo.vue';
  import ChatWrap from '../components/ChatWrap.vue';
  import LoginModal from '../components/LoginModal.vue';
  import { ref, onMounted, reactive, h } from 'vue';
  import type { Ref } from 'vue';
  import type { ApiResponse, ChatMessage, ChatRoom, User } from '../types/types';
  import { NMessageProvider, NAlert, useMessage } from 'naive-ui';
  import type { MessageRenderMessage } from 'naive-ui'
  import axios from 'axios';

  // Page elements control
  const isChatWrapCollapse = ref(true);
  const isAwaitingResponse = ref(false);
  const isMsgAnimationPlaying = ref(false);
  const showLoginModal = ref(false);
  const chatTitle = ref("");


  // User model
  interface LoginState {
    isLoggedin: boolean;
    user: User | null
  }

  const loginState = reactive<LoginState>({
    isLoggedin: false,
    user: null
  });

  // Validate the login and fetch user data
  const validateLogin = async () => {
    try {
      const res = await axios.get<ApiResponse<User>>('/api/validate-login', {
        withCredentials: true
      });
      if (res.data.success) {
        loginState.isLoggedin = true;
        loginState.user = res.data.data;
        console.log(loginState.user);
      }
      else {
        loginState.isLoggedin = false;
        loginState.user = null;
        if (Number(res.data.code) === 401) {
          console.log('Not logged in.')
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
    setTimeout(() => showLoginModal.value = false, 200);
  }

  // Page element refs
  const chatWrapRef = ref() as Ref<InstanceType<typeof ChatWrap>>

  // Manage Chat Messages model
  const chatMessages: Ref<ChatMessage[]> = ref([]);

  const addMessage = (message: ChatMessage) => {
    chatMessages.value.push(message);
  }

  const updateMessage = (id: number, updateMessage: Partial<ChatMessage>) => {
    const message = chatMessages.value.find(msg => msg.id === id);
    if (message) {
      Object.assign(message, updateMessage);
    }
  }

  // Handle InputBox Submission
  const handleSubmit = async (content: string) => {
    const userMsg: ChatMessage = {
      id: Date.now(),
      type: 'text',
      content: content,
      sender: 'user',
      isLoading: false,
      isAnimated: false
    }

    /**
     * Also add a loading prompt for the response
     */
    const loadingMessageId = userMsg.id + 10
    const loadingMsg: ChatMessage = {
      id: loadingMessageId,
      type: 'text',
      content: '',
      sender: 'bot',
      isLoading: true,
      isAnimated: false
    }
    isChatWrapCollapse.value = false;
    addMessage(userMsg);
    addMessage(loadingMsg);
    isAwaitingResponse.value = true;

    const simulateBackendResponse = (message: string, timeout: number): Promise<string> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(`我是复读机：${message}`);
        }, timeout);
      });
    };

    try {
      const response = await simulateBackendResponse(content, 2000);
      const botResponse: Partial<ChatMessage> = {
        content: response,
        isLoading: false,
        isAnimated: true
      };
      updateMessage(loadingMessageId, botResponse)
    }
    catch (error) {
      console.log(error);
    }

    finally {
      isAwaitingResponse.value = false;
    }
  }


  /**
   *  Test Area
   * 
   */

  const longText = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius maxime, eum nulla dolor quisquam soluta unde, necessitatibus veritatis consequuntur modi ipsam ad omnis! Porro incidunt repellat voluptatem deserunt asperiores tempora.Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius maxime, eum nulla dolor quisquam soluta unde, necessitatibus veritatis consequuntur modi ipsam ad omnis! Porro incidunt repellat voluptatem deserunt asperiores tempora.';

  // Simulate fetching chat history on mount
  onMounted(async () => {
    await validateLogin();

    // const chatHistory: ChatMessage[] = [
    //   // Sample history data
    //   {
    //     id: 1,
    //     type: 'text',
    //     content: 'Welcome back!',
    //     sender: 'bot',
    //     isLoading: false,
    //     isAnimated: false
    //   },
    //   {
    //     id: 2,
    //     type: 'image',
    //     content: 'https://picsum.photos/seed/picsum/1600',
    //     sender: 'user',
    //     isLoading: false,
    //     isAnimated: false
    //   }
    // ];
    // chatMessages.value = chatHistory;
  });

  const testMessage = (sender: 'user' | 'bot', type: 'text' | 'image', content = "", isLoading = false, isAnimated = false) => {
    const msg: ChatMessage = {
      id: Date.now(),
      sender, type, content, isLoading, isAnimated
    }
    isChatWrapCollapse.value = false;
    addMessage(msg);
  }

</script>

<template>
  <NMessageProvider>
    <Transition>
      <LoginModal v-if="showLoginModal" @cancel="showLoginModal = false" @login-success="loginSuccessHandler" />
    </Transition>
    <div class="page-container">
      <div id="test-zone">
        <button @click="isChatWrapCollapse = !isChatWrapCollapse">展开</button>
        <button @click="testMessage('user', 'text', '我是铁大比大比大比大比看看铁大比')">发送方</button>
        <button
          @click="testMessage('bot', 'text', 'Test 基于搜索引擎的新一代信息检索AI基于搜索引擎的新一代信息检索AI基于搜索引擎的新一代信息检索AI', false, true)">机器人</button>
        <button @click="testMessage('bot', 'image', 'https://picsum.photos/seed/picsum/2000')">机器人图片</button>
        <button @click="testMessage('bot', 'text', longText, false, true)">机器人长文字</button>
        <button @click="testMessage('bot', 'text', '', true)">机器人加载</button>
      </div>
      <FloatingMenu @scroll-to-bottom="chatWrapRef.scrollToBottom(true)" @login="showLoginModal = true"
        :is-logged-in="loginState.isLoggedin" :user="loginState.user" @logout-success="validateLogin"> </FloatingMenu>
      <div class="main-container" :class="{ collapse: isChatWrapCollapse }">
        <TitleLogo :chat-title="chatTitle" :is-collapse="isChatWrapCollapse"></TitleLogo>
        <ChatWrap ref="chatWrapRef" :messages="chatMessages" :user-pfp-url="loginState.user?.profilePhoto"
          :collapse="isChatWrapCollapse" @animation-playing="(state: boolean) => { isMsgAnimationPlaying = state }">
        </ChatWrap>
        <InputBox @submit="handleSubmit" :is-awaiting-response="isAwaitingResponse"
          :is-animation-playing="isMsgAnimationPlaying"></InputBox>
        <div id="copyright">
          <span>©PibGPT 2024. All rights reserved.</span>
          <span>内容由 AI 大模型生成，请仔细甄别。</span>
        </div>
      </div>
    </div>
  </NMessageProvider>
</template>

<style>
  .page-container {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    background-color: var(--page-bg);
    z-index: 0;
  }

  .v-enter-active,
  .v-leave-active {
    transition: opacity 0.3s ease-out;
  }

  .v-enter-from,
  .v-leave-to {
    opacity: 0;
  }

  .main-container {
    min-width: 320px;
    width: 95%;
    display: flex;
    height: 100%;
    padding: 0.1rem 0 0.3rem;
    background-color: var(--item-color);
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    margin-bottom: 2rem;
    transition: margin-bottom .5s ease-out;
  }

  .main-container.collapse {
    margin-bottom: 6rem;
  }


  #test-zone {
    position: absolute;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    z-index: 999;
    left: 20px;
    bottom: 20px;
    border-radius: 8px;
    border: 3px solid red;
    padding: 12px;
  }

  .chat-item-container:first-child {
    margin: 0;
  }

  .chat-item-container:last-child {
    margin-bottom: 1rem;
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
      padding: 1rem 12px 0;
      margin-bottom: 3rem;
    }

    .chat-container {
      padding: 0 12px;
    }

    #copyright {
      display: inline-flex;
    }

  }
</style>

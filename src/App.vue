<script setup lang="ts">
import FloatingMenu from './components/FloatingMenu.vue';
import InputBox from './components/InputBox.vue';
import TitleLogo from './components/TitleLogo.vue';
import ChatItem from './components/ChatItem.vue';
import { ref } from 'vue';
import type { Ref } from 'vue';

let isChatWrapCollapse = ref(true);

const toggleCollapse = () => { isChatWrapCollapse.value = !isChatWrapCollapse.value; }

interface ChatMessage {
  textString?: String;
  isSender: Boolean;
  userPfpUrl?: String;
}

const chatMessages: Ref<ChatMessage[]> = ref([]);
const chatTitle = ref("");

/**
 * To Do
 */

const chatScrollToBottom = () => {
  return;
}

const appendBubble = (isSender: Boolean = true, bubbleString: String, isLoading: Boolean = false, userPfpUrl: String = "https://picsum.photos/seed/picsum/200") => {
  let message: ChatMessage = {
    textString: bubbleString,
    isSender: isSender,
    userPfpUrl: userPfpUrl
  }
  chatMessages.value.push(message);
}

const renderHistory = () => {

}

</script>

<template>
  <div class="page-container">
    <div id="test-zone">
      <button @click="toggleCollapse()">展开</button>
      <button @click="appendBubble(true, 'Test 基于搜索引擎的新一代信息检索AI基于搜索引擎的新一代信息检索AI基于搜索引擎的新一代信息检索AI', false)">添加发送方</button>
      <button @click="appendBubble(false, 'Test', false)">添加接收方</button>
    </div>
    <FloatingMenu></FloatingMenu>
    <div class="main-container">
      <TitleLogo :title-text="chatTitle" :is-collapse="isChatWrapCollapse"></TitleLogo>
      <div class="chat-container" id="chat-container" :class="{ collapse: isChatWrapCollapse }">
        <ChatItem v-for="({ isSender, userPfpUrl, textString }, index) in chatMessages" :is-sender="isSender"
          :text-string="textString" :user-pfp-url="userPfpUrl"></ChatItem>
      </div>
      <InputBox></InputBox>
      <div id="copyright">
        <span>©PibGPT 2024. All rights reserved.</span>
        <span>内容由 AI 大模型生成，请仔细甄别。</span>
      </div>
    </div>
  </div>

</template>

<style scoped>
.page-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  background-color: var(--page-bg);
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
}


#test-zone {
  position: absolute;
  display: block;
  z-index: 999;
  left: 20px;
  top: 20px;
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

.chat-container {
  display: flex;
  flex-grow: 1;
  flex-shrink: 1;
  flex-wrap: nowrap;
  flex-direction: column;
  background-color: var(--page-bg);
  opacity: 1;
  transition: all 1s;
  padding: 0;
  min-height: 0;
  overflow-y: scroll;
  overflow-x: hidden;
}

.chat-container.collapse {
  opacity: 0;
  flex-grow: 0.00001;
}

.chat-container::-webkit-scrollbar {
  display: none;
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
    padding: 1rem 12px 2rem;
  }

  .chat-container {
    padding: 0 12px;
  }

  #copyright {
    display: inline-flex;
  }

}
</style>

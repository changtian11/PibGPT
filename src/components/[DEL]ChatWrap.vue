<script setup lang="ts">
import ChatItem from './ChatItem.vue';
import { ref } from 'vue';
import type { Ref } from 'vue';

const props = defineProps({
    isCollapse: { type: Boolean, default: true }
})


interface ChatMessage {
    textString?: String;
    isSender: Boolean;
    userPfpUrl?: String;
}

const chatMessages: Ref<ChatMessage[]> = ref([]);

/**
 * To Do
 */

function ScrollToBottom() {
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
    <div class="chat-container" :class="{ collapse: isCollapse }">
        <ChatItem v-for="({ isSender, userPfpUrl, textString }, index) in chatMessages" :is-sender="isSender"
            :text-string="textString" :user-pfp-url="userPfpUrl"></ChatItem>
    </div>
</template>

<style>
.chat-item-container:first-child {
    margin: 0;
}
</style>

<style scope>
.chat-container {
    display: flex;
    flex-grow: 1;
    flex-shrink: 1;
    flex-wrap: nowrap;
    flex-direction: column;
    background-color: var(--page-bg);
    opacity: 1;
    transition: all 1s;
    padding: 0 12px;
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
</style>
<template>
    <div class="chat-container" id="chat-container" :class="{ collapse: collapse }">
        <ChatItem v-for="message in chatMessages" :message="message" :user-pfp-url="userPfpUrl" :key="message.id"
            @animation-playing="handleAnimation">
        </ChatItem>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ChatMessage } from '../types/types';
import ChatItem from './ChatItem.vue';

interface Props {
    initialMessage: ChatMessage[],
    userPfpUrl?: string,
    collapse?: boolean,
    isAwaitingHistory?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    userPfpUrl: "https://picsum.photos/seed/picsum/200"
});

const emit = defineEmits(['update-messages', 'animation-playing'])

const chatMessages = ref<ChatMessage[]>(props.initialMessage);

const addMessage = (message: ChatMessage) => {
    chatMessages.value.push(message);
    emit('update-messages', chatMessages.value)
}

const updateMessage = (id: number, updateMessage: Partial<ChatMessage>) => {
    const message = chatMessages.value.find(msg => msg.id === id);
    if (message) {
        Object.assign(message, updateMessage);
        emit('update-messages', chatMessages.value);
    }
}

const handleAnimation = (state: boolean) => {
    emit('animation-playing', state);
}

// const scrollToBottom = () => {
//     // TODO
// }

watch(
    () => props.initialMessage,
    (newMessage) => {
        chatMessages.value = newMessage
    }
)

defineExpose({ addMessage, updateMessage });
</script>

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
</style>
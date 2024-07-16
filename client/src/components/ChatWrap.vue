<template>
    <div class="chat-container" id="chat-container" :class="{ folded: folded }" ref="chatContainerRef">
        <ChatItem v-for="message in props.messages" :message="message" :user-pfp-url="userPfpUrl"
            :key="message.timestamp" @animation-playing="emitAnimationState">
        </ChatItem>
        <Transition>
            <ChatItem v-if="loading" :message="botLoadingMsg"> </ChatItem>
        </Transition>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, onUnmounted } from 'vue';
    import type { Ref } from 'vue';
    import { ChatMessageToRender } from '../types/types';
    import ChatItem from './ChatItem.vue';

    interface Props {
        messages: ChatMessageToRender[],
        userPfpUrl?: string,
        folded?: boolean,
        loading: boolean
    }

    const props = withDefaults(defineProps<Props>(), {
        userPfpUrl: "https://picsum.photos/seed/picsum/200"
    });

    const botLoadingMsg: ChatMessageToRender = {
        type: 'text',
        isLoading: true,
        isAnimated: false,
        content: '',
        role: 'bot',
        timestamp: ''
    }

    const emit = defineEmits(['update-messages', 'animation-playing'])

    const chatContainerRef = ref() as Ref<HTMLElement>;
    // const isAnimationPlaying = ref(false);

    const scrollToBottom = (smooth: boolean | any = false) => {
        if (chatContainerRef.value) {
            chatContainerRef.value.scrollTo({ top: chatContainerRef.value.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
        }
    }

    const emitAnimationState = (state: boolean) => emit('animation-playing', state);

    // watch(isAnimationPlaying, (newVal) => {
    //     if (newVal) {
    //         while (isAnimationPlaying.value) {
    //             containerScrollToBottom();
    //         }
    //     }
    // })

    onMounted(() => {
        scrollToBottom();
        if (chatContainerRef.value) {
            const observer = new MutationObserver(scrollToBottom);
            observer.observe(chatContainerRef.value, { childList: true, subtree: true })

            onUnmounted(() => {
                observer.disconnect();
            })
        }
    })

    defineExpose({ scrollToBottom });
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
        transition: all .8s ease-out;
        padding: 0;
        min-height: 0;
        overflow-y: scroll;
        overflow-x: hidden;
        max-height: unset;
    }

    .chat-container.folded {
        opacity: 0;
        flex-grow: 0;
        /* max-height: 0; */
    }

    .chat-container::-webkit-scrollbar {
        display: none;
    }
</style>
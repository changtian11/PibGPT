<template>
    <div class="chat-wrapper-component" :class="{ folded: folded, transitioned: transitioned }" ref="chatContainerRef">
        <ChatItem v-for="message in props.messages" :message="message" :right-pfp-uri="rightPfpUri"
            :key="message.timestamp" @animation-playing="emitAnimationState" :left-pfp-uri="leftPfpUri"
            :show-actions="showActions">
        </ChatItem>
        <Transition>
            <ChatItem v-if="awaitingLeftResponse" :message="botLoadingMsg"> </ChatItem>
        </Transition>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, onUnmounted } from 'vue';
    import type { Ref } from 'vue';
    import { ChatMessageToRender } from '../types/types';
    import ChatItem from './ChatItem.vue';
    import robotGreen from '@/assets/robot-green.png'

    interface Props {
        messages: ChatMessageToRender[];
        folded?: boolean;
        loading?: boolean;
        transitioned: boolean;
        leftPfpUri?: string;
        rightPfpUri?: string;
        awaitingLeftResponse?: boolean;
        showActions?: boolean;
    }

    const props = withDefaults(defineProps<Props>(), {
        leftPfpUri: robotGreen,
        rightPfpUri: robotGreen,
        folded: true,
        loading: true,
        transitioned: false,
        awaitingLeftResponse: false,
        showActions: true
    });

    const botLoadingMsg: ChatMessageToRender = {
        type: 'text',
        isLoading: true,
        isAnimated: false,
        content: '',
        role: 'bot',
        timestamp: '',
        position: 'left'
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
    .chat-wrapper-component {
        display: flex;
        flex-grow: 1;
        flex-shrink: 1;
        flex-wrap: nowrap;
        flex-direction: column;
        background-color: var(--page-bg);
        opacity: 1;
        padding: 0;
        min-height: 0;
        overflow-y: scroll;
        overflow-x: hidden;
    }

    .chat-wrapper-component.transitioned {
        transition: all 1s ease-out;
    }

    .chat-wrapper-component.folded {
        opacity: 0;
        flex-grow: 0;
        max-height: 0;
    }

    .chat-wrapper-component::-webkit-scrollbar {
        display: none;
    }

    @media screen and (min-width: 600px) {

        .chat-wrapper-component {
            padding: 0 12px 1rem;
        }

    }
</style>